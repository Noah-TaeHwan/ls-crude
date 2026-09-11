#!/usr/bin/env python3
"""python serve.py  →  http://127.0.0.1:8765"""
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from pathlib import Path
import threading, time
import score

ROOT = Path(__file__).resolve().parent


class H(SimpleHTTPRequestHandler):
    def __init__(self, *a, **k):
        super().__init__(*a, directory=str(ROOT), **k)

    def log_message(self, fmt, *args):
        print("[http]", args[0])


def loop():
    while True:
        try:
            score.load_or_build(force=False)
        except Exception as e:
            print("[score]", e)
        time.sleep(300)


if __name__ == "__main__":
    score.load_or_build(force=True)
    threading.Thread(target=loop, daemon=True).start()
    print("http://127.0.0.1:8765")
    ThreadingHTTPServer(("0.0.0.0", 8765), H).serve_forever()
