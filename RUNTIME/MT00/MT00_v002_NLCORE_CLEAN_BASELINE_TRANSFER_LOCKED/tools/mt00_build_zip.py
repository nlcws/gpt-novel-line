#!/usr/bin/env python3
"""Build an MT00 runtime ZIP from an expanded runtime root.

This is runtime-package packaging support only. It does not build or validate a user TRANSFER_CONTAINER.zip.
"""
from __future__ import annotations

import argparse
import os
import zipfile
from pathlib import Path

EXCLUDED_NAMES = {"CHECK_REPORT.md"}


def should_skip(path: Path) -> bool:
    return path.name in EXCLUDED_NAMES or "__pycache__" in path.parts or path.suffix == ".pyc"


def build_zip(root: Path, output: Path) -> None:
    root = root.resolve()
    output = output.resolve()
    if output.exists():
        output.unlink()
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for p in sorted(root.rglob("*")):
            if p.is_file() and not should_skip(p):
                arc = str(Path(root.name) / p.relative_to(root)).replace(os.sep, "/")
                zf.write(p, arc)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    build_zip(args.root, args.output)
    print(f"WROTE {args.output}")
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
