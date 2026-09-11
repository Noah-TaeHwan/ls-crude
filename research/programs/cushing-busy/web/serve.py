#!/usr/bin/env python3
"""python serve.py  →  http://127.0.0.1:8765"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import threading, time, socket
import score

ROOT = Path(__file__).resolve().parent
PORT = 8765


class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def log_message(self, fmt, *args):
        print("[http]", args[0])


def loop():
    while True:
        time.sleep(300)
        try:
            score.load_or_build(force=True)
            print("[score] refreshed")
        except Exception as e:
            print("[score]", type(e).__name__, e)


def pick_port(p):
    s = socket.socket()
    try:
        s.bind(("127.0.0.1", p))
        s.close()
        return p
    except OSError:
        s.close()
        return pick_port(p + 1)


if __name__ == "__main__":
    try:
        score.load_or_build(force=False)
    except Exception as e:
        print("[boot]", type(e).__name__, e)
        if not (ROOT / "now.json").exists():
            (ROOT / "now.json").write_text(
                '{"score":47,"label":"normal","legs":[],"dropped":[],"ts_utc":"","note":"offline"}',
                encoding="utf-8",
            )
    threading.Thread(target=loop, daemon=True).start()
    port = pick_port(PORT)
    print("open  http://127.0.0.1:%s" % port)
    ThreadingHTTPServer(("127.0.0.1", port), H).serve_forever()
