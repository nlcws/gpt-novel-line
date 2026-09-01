#!/usr/bin/env python3
"""Regenerate MT00_BOOTSTRAP updated_manifest.json."""
from __future__ import annotations

import argparse
import hashlib
import json
import os
from pathlib import Path

PACKAGE = "MT00_BOOTSTRAP_EA_v001_NLCORE_GPT_PROJECT_FIRST_TRANSFER_BASELINE_LOCKED"
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
    return {
        "package": PACKAGE,
        "file_count": len(files),
        "files": files,
        "metadata": {
            "runtime": "MT00_BOOTSTRAP_EA_v001",
            "derived_from": "MT00_v002_NLCORE_CLEAN_BASELINE_TRANSFER_LOCKED",
            "base_shelves": ["021_G_v000.zip", "022_B_v000.zip", "024_V_v000.zip", "028_H_v000.zip"],
            "primary_knowledge": "新規プロジェクト流し込み用_共通運用雛型_v_1.md sections 7-13-2"
        }
    }


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root")
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    root = Path(args.root)
    manifest = build(root)
    text = json.dumps(manifest, ensure_ascii=False, indent=2) + "\n"
    if args.write:
        (root / "updated_manifest.json").write_text(text, encoding="utf-8")
    else:
        print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
