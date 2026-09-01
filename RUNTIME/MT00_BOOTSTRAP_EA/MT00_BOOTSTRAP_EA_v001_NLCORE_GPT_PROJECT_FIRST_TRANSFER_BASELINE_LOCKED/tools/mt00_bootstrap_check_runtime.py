#!/usr/bin/env python3
"""MT00_BOOTSTRAP runtime package checker.

Checks runtime ZIP or expanded directory integrity against updated_manifest.json.
It also verifies the first-project bootstrap base shelves and generated sidecar rules.

This does not validate a produced TRANSFER_CONTAINER.zip; use validate_transfer_container.js for that.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import os
import sys
import tempfile
import zipfile
from datetime import datetime, timezone
from pathlib import Path

EXPECTED_PACKAGE = "MT00_BOOTSTRAP_EA_v001_NLCORE_GPT_PROJECT_FIRST_TRANSFER_BASELINE_LOCKED"
REQUIRED_ROOT_FILES = {
    "README.md",
    "START_HERE.js",
    "load_order.md",
    "package.json",
    "updated_manifest.json",
}
REQUIRED_ROOT_DIRS = {"assets", "backpacks", "contract", "docs", "examples", "resources", "src", "tools"}
REQUIRED_BASE_SHELVES = {
    "resources/base_project_shelves/021_G_v000.zip",
    "resources/base_project_shelves/022_B_v000.zip",
    "resources/base_project_shelves/024_V_v000.zip",
    "resources/base_project_shelves/028_H_v000.zip",
}
GENERATED_SIDECARS = {"CHECK_REPORT.md", "updated_manifest.json"}
TEXT_SUFFIXES = {".md", ".txt", ".js", ".json", ".py"}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def should_skip_manifest(path: Path) -> bool:
    return path.name in GENERATED_SIDECARS or "__pycache__" in path.parts or path.suffix == ".pyc"


def detect_root(path: Path) -> Path:
    if path.is_file() and path.suffix == ".zip":
        tmp = Path(tempfile.mkdtemp(prefix="mt00_bootstrap_check_"))
        with zipfile.ZipFile(path) as zf:
            bad = []
            for info in zf.infolist():
                name = info.filename
                parts = Path(name).parts
                if name.startswith("/") or ".." in parts:
                    bad.append(name)
            if bad:
                raise RuntimeError(f"unsafe path(s) in zip: {bad[:5]}")
            zf.extractall(tmp)
        roots = [p for p in tmp.iterdir() if p.is_dir()]
        if len(roots) != 1:
            raise RuntimeError(f"expected single root directory, found {len(roots)}")
        return roots[0]
    return path


def check_json_and_utf8(root: Path) -> list[str]:
    errors: list[str] = []
    for p in sorted(root.rglob("*")):
        if not p.is_file():
            continue
        rel = str(p.relative_to(root)).replace(os.sep, "/")
        if "__pycache__" in p.parts or p.suffix == ".pyc":
            errors.append(f"cache artifact forbidden: {rel}")
            continue
        if p.suffix in TEXT_SUFFIXES:
            try:
                text = p.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                errors.append(f"utf8 failure: {rel}")
                continue
            if p.suffix == ".json":
                try:
                    json.loads(text)
                except json.JSONDecodeError as e:
                    errors.append(f"json failure: {rel}: {e}")
    return errors


def check_manifest(root: Path) -> list[str]:
    errors: list[str] = []
    manifest_path = root / "updated_manifest.json"
    if not manifest_path.exists():
        return ["missing updated_manifest.json"]
    manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    if manifest.get("package") != EXPECTED_PACKAGE:
        errors.append(f"package mismatch: {manifest.get('package')} != {EXPECTED_PACKAGE}")
    records = {r["path"]: r for r in manifest.get("files", [])}
    actual = {}
    for p in sorted(root.rglob("*")):
        if p.is_file() and not should_skip_manifest(p):
            rel = str(p.relative_to(root)).replace(os.sep, "/")
            actual[rel] = {"size": p.stat().st_size, "sha256": sha256(p)}
    missing = sorted(set(records) - set(actual))
    extra = sorted(set(actual) - set(records))
    if missing:
        errors.append(f"manifest missing actual files: {missing[:10]}")
    if extra:
        errors.append(f"manifest extra actual files: {extra[:10]}")
    for rel, meta in actual.items():
        rec = records.get(rel)
        if not rec:
            continue
        if rec.get("size") != meta["size"]:
            errors.append(f"size mismatch: {rel}")
        if rec.get("sha256") != meta["sha256"]:
            errors.append(f"sha256 mismatch: {rel}")
    if manifest.get("file_count") != len(records):
        errors.append("file_count does not equal manifest records")
    return errors


def check_shape(root: Path) -> list[str]:
    errors: list[str] = []
    for f in REQUIRED_ROOT_FILES:
        if not (root / f).is_file():
            errors.append(f"missing required root file: {f}")
    for d in REQUIRED_ROOT_DIRS:
        if not (root / d).is_dir():
            errors.append(f"missing required root dir: {d}")
    for rel in REQUIRED_BASE_SHELVES:
        if not (root / rel).is_file():
            errors.append(f"missing bootstrap base shelf: {rel}")
    if (root / "CHECK_REPORT.md").exists():
        errors.append("CHECK_REPORT.md must be generated sidecar, not packaged runtime content")
    return errors


def write_report(report: Path, root: Path, errors: list[str]) -> None:
    status = "PASS" if not errors else "FAIL"
    manifest_records = "unknown"
    try:
        manifest = json.loads((root / "updated_manifest.json").read_text(encoding="utf-8"))
        manifest_records = str(len(manifest.get("files", [])))
    except Exception:
        pass
    lines = [
        f"# MT00_BOOTSTRAP CHECK_REPORT",
        "",
        f"Generated: {datetime.now(timezone.utc).isoformat()}",
        f"Status: **{status}**",
        "",
        "## Summary",
        f"- Runtime: `MT00_BOOTSTRAP_EA_v001`",
        f"- Package root: `{root.name}`",
        "",
        "## Package",
        f"- Expected package: `{EXPECTED_PACKAGE}`",
        "",
        "## Manifest",
        f"- Manifest records: {manifest_records}",
        "",
        "## Required shape",
        f"- Required root files: {', '.join(sorted(REQUIRED_ROOT_FILES))}",
        f"- Required root dirs: {', '.join(sorted(REQUIRED_ROOT_DIRS))}",
        "",
        "## Base shelves",
        *[f"- `{x}`" for x in sorted(REQUIRED_BASE_SHELVES)],
        "",
        "## Result",
    ]
    if errors:
        lines.extend([f"- FAIL: {e}" for e in errors])
    else:
        lines.append("- PASS: runtime package, base shelves, UTF-8/JSON, cache, required shape, and manifest checks passed.")
    report.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("target")
    parser.add_argument("--report", default=None)
    args = parser.parse_args()
    target = Path(args.target)
    try:
        root = detect_root(target)
        errors = []
        errors.extend(check_shape(root))
        errors.extend(check_json_and_utf8(root))
        errors.extend(check_manifest(root))
        if args.report:
            write_report(Path(args.report), root, errors)
        if errors:
            for e in errors:
                print(f"FAIL: {e}")
            return 1
        print("PASS")
        return 0
    except Exception as e:
        print(f"FAIL: {e}")
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
