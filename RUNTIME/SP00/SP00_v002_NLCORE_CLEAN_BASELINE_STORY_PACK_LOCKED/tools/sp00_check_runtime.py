#!/usr/bin/env python3
"""SP00 runtime package checker.

Checks runtime ZIP or expanded directory integrity against updated_manifest.json.
This does not certify a produced story-pack artifact; PACK_CUTOUT validation remains the runtime gate.

The Markdown report output is CHECK_REPORT.md by convention. It is a generated sidecar and is excluded from the runtime manifest.
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

REQUIRED_ROOT_FILES = {
    "README.md",
    "START_HERE.js",
    "load_order.md",
    "package.json",
    "updated_manifest.json",
}
REQUIRED_ROOT_DIRS = {"assets", "contract", "docs", "examples", "src", "test", "tools"}
EXPECTED_PACKAGE = "SP00_v002_NLCORE_CLEAN_BASELINE_STORY_PACK_LOCKED"
GENERATED_SIDECARS = {"CHECK_REPORT.md"}
TEXT_SUFFIXES = {".md", ".txt", ".js", ".json", ".py"}


def sha256(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def fail(code: str, detail: str) -> dict:
    return {"code": code, "detail": detail}


def is_ignored_generated_path(path: Path) -> bool:
    return "__pycache__" in path.parts or path.suffix == ".pyc" or path.name in GENERATED_SIDECARS


def unsafe_zip_members(zip_path: Path) -> list[dict]:
    issues = []
    with zipfile.ZipFile(zip_path) as zf:
        for info in zf.infolist():
            name = info.filename
            parts = Path(name).parts
            if name.startswith("/") or ".." in parts or name.startswith("\\"):
                issues.append(fail("UNSAFE_ZIP_PATH", name))
            if "__pycache__" in parts or name.endswith(".pyc"):
                issues.append(fail("FORBIDDEN_RUNTIME_ARTIFACT", name))
            if not info.is_dir():
                with zf.open(info) as f:
                    while f.read(1024 * 1024):
                        pass
    return issues


def materialize(target: Path) -> tuple[Path, tempfile.TemporaryDirectory | None, list[dict]]:
    if target.is_dir():
        return target, None, []
    issues = unsafe_zip_members(target)
    tmp = tempfile.TemporaryDirectory()
    with zipfile.ZipFile(target) as zf:
        zf.extractall(tmp.name)
    roots = [p for p in Path(tmp.name).iterdir() if p.name not in {"__MACOSX"}]
    if len(roots) != 1 or not roots[0].is_dir():
        issues.append(fail("SINGLE_ROOT_REQUIRED", ", ".join(p.name for p in roots)))
        return Path(tmp.name), tmp, issues
    return roots[0], tmp, issues


def load_order_paths(root: Path) -> list[str]:
    path = root / "load_order.md"
    if not path.exists():
        return []
    paths: list[str] = []
    for line in path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or ". `" not in stripped:
            continue
        try:
            candidate = stripped.split("`", 2)[1]
        except IndexError:
            continue
        if candidate and not candidate.startswith("<"):
            paths.append(candidate)
    return paths


def check(root: Path) -> tuple[list[dict], dict]:
    issues: list[dict] = []
    for p in root.rglob("*"):
        if p.is_file() and ("__pycache__" in p.parts or p.suffix == ".pyc"):
            issues.append(fail("FORBIDDEN_RUNTIME_ARTIFACT", str(p.relative_to(root)).replace(os.sep, "/")))
    for name in REQUIRED_ROOT_FILES:
        if not (root / name).is_file():
            issues.append(fail("REQUIRED_ROOT_FILE_MISSING", name))
    for name in REQUIRED_ROOT_DIRS:
        if not (root / name).is_dir():
            issues.append(fail("REQUIRED_ROOT_DIR_MISSING", name))
    if root.name != EXPECTED_PACKAGE:
        issues.append(fail("ROOT_NAME_MISMATCH", f"{root.name} != {EXPECTED_PACKAGE}"))
    load_paths = load_order_paths(root)
    for rel in load_paths:
        if not (root / rel).exists():
            issues.append(fail("LOAD_ORDER_PATH_MISSING", rel))

    manifest_path = root / "updated_manifest.json"
    manifest_records = []
    actual_records = []
    if manifest_path.exists():
        try:
            manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
        except Exception as exc:
            issues.append(fail("MANIFEST_JSON_INVALID", str(exc)))
            manifest = {}
        if manifest.get("package") != EXPECTED_PACKAGE:
            issues.append(fail("MANIFEST_PACKAGE_MISMATCH", str(manifest.get("package"))))
        manifest_records = manifest.get("files", []) if isinstance(manifest.get("files", []), list) else []
        by_path = {r.get("path"): r for r in manifest_records if isinstance(r, dict)}
        for p in sorted(root.rglob("*")):
            if not p.is_file() or p.name == "updated_manifest.json" or is_ignored_generated_path(p):
                continue
            rel = str(p.relative_to(root)).replace(os.sep, "/")
            actual_records.append(rel)
            rec = by_path.get(rel)
            if rec is None:
                issues.append(fail("MANIFEST_ENTRY_MISSING", rel))
                continue
            size = p.stat().st_size
            digest = sha256(p)
            if rec.get("size") != size:
                issues.append(fail("MANIFEST_SIZE_MISMATCH", rel))
            if rec.get("sha256") != digest:
                issues.append(fail("MANIFEST_SHA256_MISMATCH", rel))
        actual_set = set(actual_records)
        for rec in manifest_records:
            rel = rec.get("path") if isinstance(rec, dict) else None
            if rel not in actual_set:
                issues.append(fail("MANIFEST_STALE_ENTRY", str(rel)))
        if "file_count" in manifest and manifest.get("file_count") != len(manifest_records):
            issues.append(fail("MANIFEST_FILE_COUNT_MISMATCH", str(manifest.get("file_count"))))
    else:
        issues.append(fail("MANIFEST_MISSING", "updated_manifest.json"))

    utf8_failures = []
    for p in sorted(root.rglob("*")):
        if not p.is_file() or is_ignored_generated_path(p):
            continue
        if p.suffix in TEXT_SUFFIXES:
            try:
                p.read_text(encoding="utf-8")
            except Exception as exc:
                utf8_failures.append(f"{p.relative_to(root)}: {exc}")
    for item in utf8_failures:
        issues.append(fail("UTF8_READ_FAILURE", item))

    summary = {
        "root": root.name,
        "expected_package": EXPECTED_PACKAGE,
        "manifest_records": len(manifest_records),
        "actual_manifest_subjects": len(actual_records),
        "load_order_paths": len(load_paths),
        "utf8_failures": len(utf8_failures),
    }
    return issues, summary


def write_report(path: Path, target: Path, decision: str, summary: dict, issues: list[dict]) -> None:
    lines = [
        "# SP00 Runtime Package Check Report",
        "",
        f"target: `{target}`",
        f"checked_at_utc: `{datetime.now(timezone.utc).isoformat()}`",
        f"decision: **{decision}**",
        "",
        "## summary",
        "",
        "```json",
        json.dumps(summary, ensure_ascii=False, indent=2),
        "```",
        "",
        "## issues",
        "",
    ]
    if issues:
        for issue in issues:
            lines.append(f"- `{issue['code']}`: {issue['detail']}")
    else:
        lines.append("- none")
    lines.extend(["", "## manifest", "", f"records: {summary.get('manifest_records', 0)}", ""])
    path.write_text("\n".join(lines), encoding="utf-8")


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("target", type=Path)
    parser.add_argument("--report", type=Path)
    args = parser.parse_args()
    root, tmp, initial = materialize(args.target.resolve())
    try:
        issues, summary = check(root)
        issues = initial + issues
        decision = "STOP" if issues else "PASS"
        summary["decision"] = decision
        if args.report:
            write_report(args.report, args.target, decision, summary, issues)
        if issues:
            print(json.dumps({"decision": decision, "summary": summary, "issues": issues}, ensure_ascii=False, indent=2), file=sys.stderr)
            return 1
        print(json.dumps({"decision": decision, "summary": summary}, ensure_ascii=False, indent=2))
        return 0
    finally:
        if tmp:
            tmp.cleanup()

if __name__ == "__main__":
    raise SystemExit(main())
