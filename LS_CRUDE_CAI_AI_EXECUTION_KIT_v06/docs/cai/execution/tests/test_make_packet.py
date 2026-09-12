"""Offline tests of the packet assembler, not tests of an LLM or the CAI app."""
from pathlib import Path
import hashlib
import json
import shutil
import subprocess
import sys
import tempfile
import unittest

BASE = Path(__file__).resolve().parents[1]

class PacketTests(unittest.TestCase):
    def cli(self, *args, base=BASE):
        # This tool is standard-library-only; omit site startup in isolated CLI tests.
        return subprocess.run([sys.executable, "-S", str(base / "make_packet.py"), *args],
                              text=True, encoding="utf-8", capture_output=True, timeout=15)
    def clone(self):
        t = tempfile.TemporaryDirectory()
        self.addCleanup(t.cleanup)
        target = Path(t.name) / "execution"
        shutil.copytree(BASE, target, ignore=shutil.ignore_patterns("__pycache__"))
        return target
    def change(self, base, fn):
        path = base / "catalog.json"
        data = json.loads(path.read_text(encoding="utf-8"))
        fn(data)
        path.write_text(json.dumps(data, ensure_ascii=False), encoding="utf-8")
    def test_list(self):
        r = self.cli("--list")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("BOOT-01", r.stdout)
        self.assertIn("UI-05.S2a", r.stdout)
        self.assertIn("REL-01", r.stdout)
    def test_check(self):
        r = self.cli("--check")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("14 units", r.stdout)
    def test_boot_scoped(self):
        r = self.cli("--task", "BOOT-01")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("WORK ORDER — BOOT-01", r.stdout)
        self.assertIn("실행 공통 규칙", r.stdout)
        self.assertNotIn("export interface CaiPublicView", r.stdout)
        self.assertNotIn("## 06. 화면 명세", r.stdout)
    def test_contract_included(self):
        r = self.cli("--task", "UI-05.S2a")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertIn("export interface CaiPublicView", r.stdout)
        self.assertIn("## 08. 데이터와 화면 사이의 계약", r.stdout)
        self.assertIn("RESULT_TEMPLATE", r.stdout)
    def test_unknown_task(self):
        r = self.cli("--task", "MADE-UP")
        self.assertEqual(r.returncode, 2)
        self.assertIn("Unknown task", r.stderr)
    def test_needs_option(self):
        self.assertEqual(self.cli().returncode, 2)
    def test_duplicate(self):
        b = self.clone()
        self.change(b, lambda d: d["units"].append(d["units"][0].copy()))
        r = self.cli("--check", base=b)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("duplicate", r.stderr.lower())
    def test_dangling_dependency(self):
        b = self.clone()
        self.change(b, lambda d: d["units"][0]["depends_on"].append("NO-TASK"))
        r = self.cli("--check", base=b)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("dependency", r.stderr.lower())
    def test_cycle(self):
        b = self.clone()
        self.change(b, lambda d: d["units"][0]["depends_on"].append("OPS-01"))
        r = self.cli("--check", base=b)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("cycle", r.stderr.lower())
    def test_missing_card(self):
        b = self.clone()
        (b / "cards/BOOT-01.md").unlink()
        r = self.cli("--check", base=b)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("missing", r.stderr.lower())
    def test_escape(self):
        b = self.clone()
        self.change(b, lambda d: d["units"][0].update(card="../../outside.md"))
        r = self.cli("--check", base=b)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("unsafe path", r.stderr.lower())
    def test_absolute_path(self):
        b = self.clone()
        self.change(b, lambda d: d["units"][0].update(card="/tmp/outside.md"))
        r = self.cli("--check", base=b)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("unsafe path", r.stderr.lower())
    def test_source_hash(self):
        b = self.clone()
        with (b / "SPEC_REFERENCE_v05.md").open("a", encoding="utf-8") as f:
            f.write("\nchanged\n")
        r = self.cli("--check", base=b)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("hash", r.stderr.lower())
    def test_section_missing(self):
        b = self.clone()
        self.change(b, lambda d: d["units"][0]["spec_sections"].append("99"))
        r = self.cli("--check", base=b)
        self.assertNotEqual(r.returncode, 0)
        self.assertIn("section", r.stderr.lower())
    def test_readonly(self):
        def hashes():
            return {str(p.relative_to(BASE)): hashlib.sha256(p.read_bytes()).hexdigest()
                    for p in BASE.rglob("*") if p.is_file() and "__pycache__" not in str(p)}
        before = hashes()
        r = self.cli("--task", "UI-05.S1b")
        self.assertEqual(r.returncode, 0, r.stderr)
        self.assertEqual(before, hashes())
    def test_all_packets(self):
        data = json.loads((BASE / "catalog.json").read_text(encoding="utf-8"))
        for unit in data["units"]:
            with self.subTest(unit=unit["id"]):
                r = self.cli("--task", unit["id"])
                self.assertEqual(r.returncode, 0, r.stderr)
                self.assertIn(unit["id"], r.stdout)
                self.assertIn("실행 결과 양식", r.stdout)

if __name__ == "__main__":
    unittest.main(verbosity=2)
