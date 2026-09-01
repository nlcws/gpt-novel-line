#!/usr/bin/env python3
"""Build a DS90 runtime patch ZIP from an extracted runtime root directory."""
from __future__ import annotations

import argparse
import os
import stat
import zipfile
from pathlib import Path

FIXED_ZIP_TIMESTAMP = (2026, 8, 5, 0, 0, 0)


def unsafe(rel: str) -> bool:
    if rel.startswith("/") or rel.startswith("\\"):
        return True
    parts = [part for part in rel.replace("\\", "/").split("/") if part not in ("", ".")]
    return any(part == ".." for part in parts)


def write_file(zf: zipfile.ZipFile, file: Path, arc: str) -> None:
    info = zipfile.ZipInfo(arc, FIXED_ZIP_TIMESTAMP)
    info.compress_type = zipfile.ZIP_DEFLATED
    mode = 0o755 if os.access(file, os.X_OK) else 0o644
    info.external_attr = (stat.S_IFREG | mode) << 16
    zf.writestr(info, file.read_bytes())


def write_dir(zf: zipfile.ZipFile, arc: str) -> None:
    info = zipfile.ZipInfo(arc.rstrip("/") + "/", FIXED_ZIP_TIMESTAMP)
    info.external_attr = (stat.S_IFDIR | 0o755) << 16
    zf.writestr(info, b"")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    parser.add_argument("output", type=Path)
    args = parser.parse_args()
    root = args.root.resolve()
    output = args.output.resolve()
    if not root.is_dir():
        raise SystemExit(f"root directory missing: {root}")
    output.parent.mkdir(parents=True, exist_ok=True)
    base = root.name
    with zipfile.ZipFile(output, "w", compression=zipfile.ZIP_DEFLATED) as zf:
        for dirpath, dirnames, filenames in os.walk(root):
            dirnames.sort()
            filenames.sort()
            dirpath = Path(dirpath)
            rel_dir = dirpath.relative_to(root).as_posix()
            arc_dir = base if rel_dir == "." else f"{base}/{rel_dir}"
            if unsafe(arc_dir):
                raise SystemExit(f"unsafe dir path: {arc_dir}")
            write_dir(zf, arc_dir)
            for filename in filenames:
                file = dirpath / filename
                rel = file.relative_to(root).as_posix()
                arc = f"{base}/{rel}"
                if unsafe(arc):
                    raise SystemExit(f"unsafe file path: {arc}")
                write_file(zf, file, arc)
    print(output)
    return 0

if __name__ == "__main__":
    raise SystemExit(main())
