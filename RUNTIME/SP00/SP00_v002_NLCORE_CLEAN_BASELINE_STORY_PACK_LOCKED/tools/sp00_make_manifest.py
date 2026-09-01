#!/usr/bin/env python3
"""Regenerate SP00 updated_manifest.json."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path

PACKAGE = "SP00_v002_NLCORE_CLEAN_BASELINE_STORY_PACK_LOCKED"
EXCLUDED_GENERATED = {"updated_manifest.json", "CHECK_REPORT.md"}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def is_excluded(path: Path) -> bool:
    return path.name in EXCLUDED_GENERATED or "__pycache__" in path.parts or path.suffix == ".pyc"


def build(root: Path) -> dict:
    files = []
    for p in sorted(root.rglob("*")):
        if not p.is_file() or is_excluded(p):
            continue
        rel = str(p.relative_to(root)).replace(os.sep, "/")
        files.append({"path": rel, "size": p.stat().st_size, "sha256": sha256(p)})
    return {"package": PACKAGE, "file_count": len(files), "files": files}


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", nargs="?", default=".", type=Path)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    manifest = build(root)
    text = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    if args.write:
        (root / "updated_manifest.json").write_text(text, encoding="utf-8")
    else:
        print(text)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
