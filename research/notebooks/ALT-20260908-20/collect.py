"""공개 다운로드 화면과 같은 절차로 제주 발전량 파일을 저장한다. 인증·한도 우회 없음."""
import hashlib
import argparse
import json
import urllib.parse
import urllib.request
from datetime import datetime, timezone
from pathlib import Path

ROOT = Path(__file__).resolve().parents[3]
BASE = "https://www.data.go.kr"
PAGE = BASE + "/data/15069334/fileData.do"


def validate_gate(metadata, gate):
    """명시적 공개 파일 권리와 다운로드 한도 응답을 확인한다."""
    assert metadata.get("status") is True, "download metadata unavailable"
    info = metadata["dataSetFileDetailInfo"]
    assert info["publicDataPk"] == "15069334" and info["useScopeCode"] == "COEX07", "identity/license changed; review first"
    assert gate.get("needCaptcha") is False, "download gate requires user action; stop"


def self_test():
    metadata = {"status": True, "dataSetFileDetailInfo": {"publicDataPk":"15069334", "useScopeCode":"COEX07"}}
    validate_gate(metadata, {"needCaptcha":False})
    for gate in ({"needCaptcha":True}, {}, {"needCaptcha":"false"}):
        try: validate_gate(metadata, gate)
        except AssertionError: pass
        else: raise AssertionError("accepted a closed/unknown download gate")
    metadata["dataSetFileDetailInfo"]["useScopeCode"] = "unknown"
    try: validate_gate(metadata, {"needCaptcha":False})
    except AssertionError: pass
    else: raise AssertionError("accepted changed license")
    print("PASS: unknown/captcha/license gates stop collection")


def collect():
    """공개 메타데이터와 한도 확인 뒤 원본 바이트·영수증을 변경 없이 보존한다."""
    run = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%SZ")
    raw = ROOT / "research/gathering/raw/ALT-20260908-20" / run
    raw.mkdir(parents=True, exist_ok=False)
    receipts = []

    def fetch(name, url, values=None):
        receipt = {"name": name, "url": url, "method": "POST" if values else "GET", "parameters": values,
                   "requested_at": datetime.now(timezone.utc).isoformat()}
        try:
            request = urllib.request.Request(url, data=urllib.parse.urlencode(values).encode() if values else None,
                                             headers={"User-Agent": "ls-crude-research/1.0", "Referer": PAGE})
            with urllib.request.urlopen(request, timeout=30) as response:
                data = response.read(10_000_001)
                assert 0 < len(data) <= 10_000_000, "unexpected download size"
                receipt.update(status=response.status, content_type=response.headers.get("Content-Type"),
                               disposition=response.headers.get("Content-Disposition"), bytes=len(data),
                               retrieved_at=datetime.now(timezone.utc).isoformat(), sha256=hashlib.sha256(data).hexdigest())
            (raw / name).write_bytes(data)
            return data
        except Exception as exc:
            receipt.update(failed_at=datetime.now(timezone.utc).isoformat(), error=type(exc).__name__)
            raise
        finally:
            receipts.append(receipt)
            (raw / "requests.json").write_text(json.dumps(receipts, ensure_ascii=False, indent=2)+"\n")

    fetch("catalog.json", BASE + "/catalog/15069334/fileData.json")
    metadata = json.loads(fetch("download-info.json", BASE + "/tcs/dss/selectFileDataDownload.do", {
        "publicDataPk": "15069334", "publicDataDetailPk": "uddi:d706e5e8-f2d8-470a-9d5a-83fb1251452f",
        "atchFileId": "", "fileDetailSn": "1", "publicDataTyCode": "PR0051", "url": "/tcs/dss/selectFileDataDownload.do"}))
    assert metadata.get("status") is True, "download metadata unavailable"
    info = metadata["dataSetFileDetailInfo"]
    assert info["publicDataPk"] == "15069334", "dataset identity changed"
    params = {"atchFileId": metadata["atchFileId"], "fileDetailSn": metadata["fileDetailSn"]}
    gate = json.loads(fetch("download-limit.json", BASE + "/cmm/cmm/check-limit.json", params))
    validate_gate(metadata, gate)
    params["dataNm"] = info["dataNm"]
    fetch("jeju-original.bin", BASE + "/cmm/cmm/fileDownload.do?" + urllib.parse.urlencode(params))
    print(json.dumps({"run": run, "file": str(raw / "jeju-original.bin"), "receipt": receipts[-1]}, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--self-test", action="store_true")
    if parser.parse_args().self_test: self_test()
    else: collect()
