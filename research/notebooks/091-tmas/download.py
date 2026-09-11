#!/usr/bin/env python3
"""FHWA TMAS 소표본 다운로더 (표준 라이브러리만).

운영 한도 (DATA-02):
- 동시 다운로드 1 (순차 실행).
- URL당 최대 3회 시도. HTTP 429면 Retry-After를 존중.
- HTTP 403/401/약관 충돌이면 그 경로를 즉시 중단하고 응답 원문을 기록. 우회 없음.
- 같은 URL은 성공 기록(manifest)이 있으면 다시 받지 않는다.
- 누적 바이트 상한(기본 2 GiB)을 넘기지 않는다.

사용:
  python3 download.py URL --out DIR --manifest DIR/download_manifest.json [--max-total-bytes N]
"""

from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import time
import urllib.error
import urllib.request

USER_AGENT = "LS-CRUDE-research/0.1 (FHWA TMAS acquisition trial; github.com/Noah-TaeHwan/ls-crude)"
MAX_ATTEMPTS = 3
DEFAULT_MAX_TOTAL_BYTES = 2 * 1024 * 1024 * 1024  # 2 GiB


def utc_now() -> str:
    return time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())


def sha256_file(path: str) -> str:
    h = hashlib.sha256()
    with open(path, "rb") as fh:
        for chunk in iter(lambda: fh.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def load_manifest(path: str) -> dict:
    if os.path.exists(path):
        with open(path, "r", encoding="utf-8") as fh:
            return json.load(fh)
    return {"entries": {}}


def save_manifest(path: str, manifest: dict) -> None:
    tmp = path + ".tmp"
    with open(tmp, "w", encoding="utf-8") as fh:
        json.dump(manifest, fh, ensure_ascii=False, indent=2)
    os.replace(tmp, path)


def write_error_receipt(out_dir: str, name: str, status: int, headers, body: bytes) -> str:
    path = os.path.join(out_dir, f"{name}.error.txt")
    with open(path, "w", encoding="utf-8") as fh:
        fh.write(f"url_status: {status}\n")
        fh.write(f"captured_at_utc: {utc_now()}\n")
        fh.write("response_headers:\n")
        for k, v in headers.items():
            fh.write(f"  {k}: {v}\n")
        fh.write("body_first_2k:\n")
        fh.write(body[:2048].decode("utf-8", errors="replace"))
        fh.write("\n")
    return path


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("url")
    ap.add_argument("--out", required=True)
    ap.add_argument("--manifest", required=True)
    ap.add_argument("--max-total-bytes", type=int, default=DEFAULT_MAX_TOTAL_BYTES)
    ap.add_argument("--expected-name", default=None)
    args = ap.parse_args()

    os.makedirs(args.out, exist_ok=True)
    manifest = load_manifest(args.manifest)
    entries = manifest["entries"]

    total_bytes = sum(int(e.get("bytes", 0)) for e in entries.values())

    if args.url in entries:
        e = entries[args.url]
        if os.path.exists(e["path"]) and sha256_file(e["path"]) == e["sha256"]:
            print(f"REUSE {args.url} -> {e['path']} ({e['bytes']} bytes, sha256 {e['sha256']})")
            return 0
        print(f"MANIFEST_STALE {args.url}: file missing or hash mismatch; will re-download")

    name = args.expected_name or args.url.rsplit("/", 1)[-1]
    target = os.path.join(args.out, name)

    last_err = None
    for attempt in range(1, MAX_ATTEMPTS + 1):
        req = urllib.request.Request(args.url, headers={"User-Agent": USER_AGENT})
        try:
            with urllib.request.urlopen(req, timeout=120) as resp:
                status = resp.status
                headers = dict(resp.headers.items())
                content_length = resp.headers.get("Content-Length")
                if content_length is not None:
                    projected = total_bytes + int(content_length)
                    if projected > args.max_total_bytes:
                        print(f"ABORT_BYTES {args.url}: projected {projected} > cap {args.max_total_bytes}")
                        return 3

                h = hashlib.sha256()
                written = 0
                tmp_path = target + ".part"
                with open(tmp_path, "wb") as fh:
                    while True:
                        chunk = resp.read(1024 * 1024)
                        if not chunk:
                            break
                        written += len(chunk)
                        if total_bytes + written > args.max_total_bytes:
                            fh.close()
                            os.remove(tmp_path)
                            print(f"ABORT_BYTES {args.url}: stream exceeded cap {args.max_total_bytes}")
                            return 3
                        h.update(chunk)
                        fh.write(chunk)
                os.replace(tmp_path, target)

            entry = {
                "url": args.url,
                "path": os.path.abspath(target),
                "bytes": written,
                "sha256": h.hexdigest(),
                "http_status": status,
                "content_type": headers.get("Content-Type"),
                "content_length_header": content_length,
                "last_modified": headers.get("Last-Modified"),
                "etag": headers.get("ETag"),
                "date_header": headers.get("Date"),
                "downloaded_at_utc": utc_now(),
            }
            entries[args.url] = entry
            save_manifest(args.manifest, manifest)
            print(
                f"OK attempt={attempt} status={status} bytes={written} "
                f"sha256={entry['sha256']} -> {target}"
            )
            return 0

        except urllib.error.HTTPError as err:
            status = err.code
            body = err.read()
            headers = dict(err.headers.items()) if err.headers else {}
            if status == 429:
                retry_after = headers.get("Retry-After", "60")
                last_err = f"HTTP 429; Retry-After={retry_after}"
                if attempt < MAX_ATTEMPTS:
                    try:
                        wait = int(retry_after)
                    except ValueError:
                        wait = 60
                    print(f"RETRY_429 attempt={attempt} sleeping {wait}s")
                    time.sleep(wait)
                    continue
            if status in (401, 403):
                path = write_error_receipt(args.out, name, status, headers, body)
                print(f"STOP_RIGHTS {args.url}: HTTP {status}; exact response at {path}")
                return 2
            last_err = f"HTTP {status}"
            print(f"RETRY_HTTP attempt={attempt} status={status}")
            if attempt < MAX_ATTEMPTS:
                time.sleep(2 ** attempt)
                continue

        except (urllib.error.URLError, TimeoutError, OSError) as err:
            last_err = f"{type(err).__name__}: {err}"
            print(f"RETRY_NET attempt={attempt} err={last_err}")
            if attempt < MAX_ATTEMPTS:
                time.sleep(2 ** attempt)
                continue

    print(f"FAIL {args.url}: {last_err}")
    return 1


if __name__ == "__main__":
    sys.exit(main())
