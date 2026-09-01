#!/usr/bin/env python3
"""DS90 runtime package checker.

Stdlib-only tool for DS90 runtime ZIP or extracted root checks.
It reports machine facts only. It does not prove creative quality or specialist runtime completion.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import sys
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Iterable

TEXT_EXTENSIONS = {
    ".md", ".txt", ".json", ".js", ".py", ".ts", ".tsx", ".jsx", ".mjs",
    ".cjs", ".yaml", ".yml", ".csv", ".tsv", ".html", ".css"
}

DEFAULT_REQUIRED_ROOT_FILES = [
    "README.md", "START_HERE.js", "load_order.md", "package.json", "updated_manifest.json"
]
DEFAULT_REQUIRED_ROOT_DIRS = ["assets", "backpacks", "src", "test"]
CONTRACT_PATH = "assets/dsgn_infra/04_MODULE/common/machine/DS90_ZIP_PACKAGING_CONTRACT_v0300.json"

@dataclass(frozen=True)
class FileRecord:
    path: str
    size: int
    sha256: str

@dataclass(frozen=True)
class PackageFacts:
    target: Path
    root: str | None
    records: list[FileRecord]
    dirs: set[str]
    entries: int
    unsafe: list[str]
    utf8_failures: list[str]
    filename_utf8_flag_failures: list[str]
    manifest_bytes: bytes | None
    zip_crc_openable: bool
    contract_bytes: bytes | None


def is_unsafe_zip_path(name: str) -> bool:
    if not name or name.startswith("/") or name.startswith("\\"):
        return True
    normalized = name.replace("\\", "/")
    parts = [part for part in normalized.split("/") if part not in ("", ".")]
    return any(part == ".." for part in parts)


def sha256_bytes(data: bytes) -> str:
    return hashlib.sha256(data).hexdigest()


def find_single_root(names: Iterable[str]) -> str | None:
    roots = set()
    for name in names:
        if not name:
            continue
        normalized = name.replace("\\", "/")
        first = normalized.split("/", 1)[0]
        if first:
            roots.add(first)
    if len(roots) == 1:
        return next(iter(roots))
    return None


def parent_dirs(rel: str) -> set[str]:
    parts = rel.split("/")[:-1]
    out = set()
    for index in range(1, len(parts) + 1):
        out.add("/".join(parts[:index]))
    return out


def collect_from_zip(path: Path) -> PackageFacts:
    unsafe: list[str] = []
    utf8_failures: list[str] = []
    filename_utf8_flag_failures: list[str] = []
    records: list[FileRecord] = []
    dirs: set[str] = set()
    manifest_bytes: bytes | None = None
    contract_bytes: bytes | None = None
    with zipfile.ZipFile(path) as zf:
        bad = zf.testzip()
        zip_crc_openable = bad is None
        names = zf.namelist()
        root = find_single_root(names)
        for info in zf.infolist():
            name = info.filename
            if any(ord(ch) > 127 for ch in name) and not (info.flag_bits & 0x800):
                filename_utf8_flag_failures.append(name)
            if is_unsafe_zip_path(name):
                unsafe.append(name)
                continue
            rel = name
            if root and rel.startswith(root + "/"):
                rel = rel[len(root) + 1:]
            rel = rel.rstrip("/")
            if not rel:
                continue
            if info.filename.endswith("/"):
                dirs.add(rel)
                continue
            data = zf.read(info)
            dirs.update(parent_dirs(rel))
            if rel == "updated_manifest.json":
                manifest_bytes = data
                continue
            if rel == CONTRACT_PATH:
                contract_bytes = data
            records.append(FileRecord(rel, len(data), sha256_bytes(data)))
            if Path(rel).suffix.lower() in TEXT_EXTENSIONS:
                try:
                    data.decode("utf-8")
                except UnicodeDecodeError:
                    utf8_failures.append(rel)
    return PackageFacts(path, root, sorted(records, key=lambda item: item.path), dirs, len(names), unsafe, utf8_failures, filename_utf8_flag_failures, manifest_bytes, zip_crc_openable, contract_bytes)


def collect_from_dir(root: Path) -> PackageFacts:
    unsafe: list[str] = []
    utf8_failures: list[str] = []
    filename_utf8_flag_failures: list[str] = []
    records: list[FileRecord] = []
    dirs: set[str] = {p.relative_to(root).as_posix() for p in root.rglob("*") if p.is_dir()}
    manifest_bytes: bytes | None = None
    contract_bytes: bytes | None = None
    files = sorted(p for p in root.rglob("*") if p.is_file())
    for file in files:
        rel = file.relative_to(root).as_posix()
        if is_unsafe_zip_path(rel):
            unsafe.append(rel)
            continue
        data = file.read_bytes()
        dirs.update(parent_dirs(rel))
        if rel == "updated_manifest.json":
            manifest_bytes = data
            continue
        if rel == CONTRACT_PATH:
            contract_bytes = data
        records.append(FileRecord(rel, len(data), sha256_bytes(data)))
        if file.suffix.lower() in TEXT_EXTENSIONS:
            try:
                data.decode("utf-8")
            except UnicodeDecodeError:
                utf8_failures.append(rel)
    resolved_root = root.resolve()
    return PackageFacts(root, resolved_root.name, records, dirs, len(files) + len(dirs), unsafe, utf8_failures, filename_utf8_flag_failures, manifest_bytes, True, contract_bytes)


def load_contract(contract_bytes: bytes | None) -> tuple[list[str], list[str], list[str]]:
    if contract_bytes is None:
        return DEFAULT_REQUIRED_ROOT_FILES, DEFAULT_REQUIRED_ROOT_DIRS, [f"{CONTRACT_PATH} missing; using built-in v0300 defaults"]
    try:
        contract = json.loads(contract_bytes.decode("utf-8"))
    except Exception as exc:
        return DEFAULT_REQUIRED_ROOT_FILES, DEFAULT_REQUIRED_ROOT_DIRS, [f"{CONTRACT_PATH} unreadable: {exc}; using built-in v0300 defaults"]
    return (
        contract.get("required_root_files") or DEFAULT_REQUIRED_ROOT_FILES,
        contract.get("required_root_dirs") or DEFAULT_REQUIRED_ROOT_DIRS,
        []
    )


def compare_manifest(records: list[FileRecord], manifest_bytes: bytes | None) -> tuple[list[str], list[str], list[str], int | None, int | None]:
    if manifest_bytes is None:
        return ["updated_manifest.json missing"], [], [], None, None
    try:
        manifest = json.loads(manifest_bytes.decode("utf-8"))
    except Exception as exc:
        return [f"updated_manifest.json unreadable: {exc}"], [], [], None, None
    expected_count = manifest.get("file_count_excluding_updated_manifest")
    manifest_records = manifest.get("files", [])
    by_path = {rec.path: rec for rec in records}
    manifest_by_path = {entry.get("path"): entry for entry in manifest_records if entry.get("path")}
    missing = sorted(path for path in manifest_by_path if path not in by_path)
    extra = sorted(path for path in by_path if path not in manifest_by_path)
    mismatch: list[str] = []
    for path, entry in sorted(manifest_by_path.items()):
        rec = by_path.get(path)
        if not rec:
            continue
        expected_bytes = entry.get("bytes") if "bytes" in entry else entry.get("size")
        if expected_bytes != rec.size:
            mismatch.append(f"{path}: bytes {expected_bytes} != {rec.size}")
        if entry.get("sha256") != rec.sha256:
            mismatch.append(f"{path}: sha256 mismatch")
    if expected_count is not None and expected_count != len(records):
        mismatch.append(f"file_count_excluding_updated_manifest {expected_count} != {len(records)}")
    return missing, extra, mismatch, expected_count, len(manifest_records)


def shape_violations(facts: PackageFacts, required_files: list[str], required_dirs: list[str]) -> list[str]:
    by_path = {record.path for record in facts.records}
    violations = []
    for rel in required_files:
        if rel == "updated_manifest.json":
            if facts.manifest_bytes is None:
                violations.append("required root file missing: updated_manifest.json")
        elif rel not in by_path:
            violations.append(f"required root file missing: {rel}")
    for rel in required_dirs:
        exists = rel in facts.dirs or any(path.startswith(rel + "/") for path in by_path)
        if not exists:
            violations.append(f"required root dir missing: {rel}")
    if facts.root is None:
        violations.append("single runtime root detection failed")
    if not facts.zip_crc_openable:
        violations.append("ZIP CRC/openability check failed")
    return violations


def markdown_report(facts: PackageFacts, missing: list[str], extra: list[str], mismatch: list[str], expected_count: int | None, manifest_records: int | None, shape: list[str], contract_notes: list[str]) -> str:
    blocking = facts.unsafe + facts.utf8_failures + facts.filename_utf8_flag_failures + missing + extra + mismatch + shape
    decision = "STOP" if blocking else ("PASS_WITH_NOTES" if contract_notes else "PASS")
    now = datetime.now(timezone.utc).isoformat()
    def bullets(items: list[str]) -> str:
        return "- none" if not items else "\n".join(f"- {item}" for item in items)
    return f"""# DS90 CHECK_REPORT

TARGET: `{facts.target}`
TOOL_OR_INSPECTOR: `tools/ds90_check_runtime.py`
TIMESTAMP_UTC: `{now}`
DECISION: `{decision}`

## Counts

- root: `{facts.root}`
- entries: `{facts.entries}`
- files excluding updated_manifest: `{len(facts.records)}`
- directories: `{len(facts.dirs)}`
- manifest expected file count: `{expected_count}`
- manifest records: `{manifest_records}`

## Package shape

{bullets(shape)}

## Unsafe paths

{bullets(facts.unsafe)}

## UTF-8 content failures

{bullets(facts.utf8_failures)}

## ZIP filename UTF-8 flag failures

{bullets(facts.filename_utf8_flag_failures)}

## Manifest comparison

- missing paths: `{len(missing)}`
- extra paths: `{len(extra)}`
- mismatches: `{len(mismatch)}`

## Hash comparison

{bullets(mismatch)}

## Missing / extra / mismatch detail

### Missing

{bullets(missing)}

### Extra

{bullets(extra)}

### Mismatch

{bullets(mismatch)}

## Inspector notes

{bullets(contract_notes)}

## Non-goal boundary

This report proves machine-observed package facts only. It does not prove story quality, canon correctness, MT00 transfer completion, SP00 story-pack completion, or direct context capacity safety.

## Next action

{'Package may proceed to user review.' if decision in ('PASS', 'PASS_WITH_NOTES') else 'STOP and repair listed issues before adoption.'}
"""


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("target", type=Path)
    parser.add_argument("--report", type=Path, default=None)
    args = parser.parse_args()
    target = args.target
    try:
        if target.is_file():
            facts = collect_from_zip(target)
        elif target.is_dir():
            facts = collect_from_dir(target)
        else:
            print(f"target does not exist: {target}", file=sys.stderr)
            return 2
        required_files, required_dirs, contract_notes = load_contract(facts.contract_bytes)
        missing, extra, mismatch, expected_count, manifest_records = compare_manifest(facts.records, facts.manifest_bytes)
        shape = shape_violations(facts, required_files, required_dirs)
        report = markdown_report(facts, missing, extra, mismatch, expected_count, manifest_records, shape, contract_notes)
        if args.report:
            args.report.parent.mkdir(parents=True, exist_ok=True)
            args.report.write_text(report, encoding="utf-8")
        print(report)
        return 0 if "DECISION: `STOP`" not in report else 1
    except zipfile.BadZipFile:
        print("DECISION: `STOP`\nZIP cannot be opened", file=sys.stderr)
        return 1

if __name__ == "__main__":
    raise SystemExit(main())
