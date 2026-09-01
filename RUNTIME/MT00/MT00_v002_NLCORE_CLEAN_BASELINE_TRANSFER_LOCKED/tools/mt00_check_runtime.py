#!/usr/bin/env python3
"""MT00 runtime package checker.

Checks runtime ZIP or expanded directory integrity against updated_manifest.json.
This does not validate a produced TRANSFER_CONTAINER.zip; use validate_transfer_container.js for that.

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
REQUIRED_ROOT_DIRS = {"assets", "backpacks", "contract", "docs", "examples", "src", "tools"}
EXPECTED_PACKAGE = "MT00_v002_NLCORE_CLEAN_BASELINE_TRANSFER_LOCKED"
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
    parts = set(path.parts)
    return "__pycache__" in parts or path.suffix == ".pyc" or path.name in GENERATED_SIDECARS


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
            # force CRC read
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
    load_paths = load_order_paths(root)
    for rel in load_paths:
        if not (root / rel).exists():
            issues.append(fail("LOAD_ORDER_PATH_MISSING", rel))
    manifest_path = root / "updated_manifest.json"
    if not manifest_path.exists():
        return issues, {"actual_file_count": 0, "manifest_record_count": 0, "load_order_paths": len(load_paths)}
    try:
        manifest = json.loads(manifest_path.read_text(encoding="utf-8"))
    except Exception as exc:
        return issues + [fail("MANIFEST_JSON_INVALID", str(exc))], {"actual_file_count": 0, "manifest_record_count": 0}
    if manifest.get("package") != EXPECTED_PACKAGE:
        issues.append(fail("PACKAGE_NAME_MISMATCH", str(manifest.get("package"))))
    records = manifest.get("files", [])
    if manifest.get("file_count") != len(records):
        issues.append(fail("FILE_COUNT_MISMATCH", f"declared={manifest.get('file_count')} actual={len(records)}"))
    record_map = {rec.get("path"): rec for rec in records}
    actual_files = sorted(
        str(p.relative_to(root)).replace(os.sep, "/")
        for p in root.rglob("*")
        if p.is_file()
        and p.name != "updated_manifest.json"
        and not is_ignored_generated_path(p.relative_to(root))
    )
    actual_set = set(actual_files)
    manifest_set = set(record_map)
    for path in sorted(manifest_set - actual_set):
        issues.append(fail("MANIFEST_FILE_MISSING", path))
    for path in sorted(actual_set - manifest_set):
        issues.append(fail("MANIFEST_FILE_EXTRA", path))
    for path in sorted(actual_set & manifest_set):
        full = root / path
        rec = record_map[path]
        size = full.stat().st_size
        digest = sha256(full)
        if rec.get("size") != size:
            issues.append(fail("MANIFEST_SIZE_MISMATCH", f"{path}: manifest={rec.get('size')} actual={size}"))
        if rec.get("sha256") != digest:
            issues.append(fail("MANIFEST_SHA256_MISMATCH", path))
        if full.suffix.lower() in TEXT_SUFFIXES:
            try:
                full.read_text(encoding="utf-8")
            except UnicodeDecodeError:
                issues.append(fail("UTF8_FAILURE", path))
    summary = {
        "actual_file_count": len(actual_files),
        "manifest_record_count": len(records),
        "required_root_files": len(REQUIRED_ROOT_FILES),
        "required_root_dirs": len(REQUIRED_ROOT_DIRS),
        "load_order_paths": len(load_paths),
    }
    return issues, summary


def render_report(target: Path, result: dict) -> str:
    lines = [
        "# MT00 CHECK_REPORT",
        "",
        f"Generated: {datetime.now(timezone.utc).isoformat()}",
        f"Target: `{target}`",
        f"Decision: **{result['decision']}**",
        "",
        "## Summary",
        "",
    ]
    for key, value in result.get("summary", {}).items():
        lines.append(f"- {key}: {value}")
    lines += ["", "## Issues", ""]
    issues = result.get("issues", [])
    if not issues:
        lines.append("No issues detected.")
    else:
        lines += ["| code | detail |", "|---|---|"]
        for issue in issues:
            detail = str(issue.get("detail", "")).replace("|", "\\|")
            lines.append(f"| `{issue.get('code')}` | {detail} |")
    lines += ["", "## Next action", ""]
    if result["decision"] == "PASS":
        lines.append("AI may read this CHECK_REPORT.md and continue to the next runtime step. This PASS certifies the MT00 runtime package only, not a produced TRANSFER_CONTAINER.zip.")
    else:
        lines.append("Fix the listed issues, regenerate updated_manifest.json when source files change, then rerun the runtime package checker.")
    lines.append("")
    return "\n".join(lines)


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("target", type=Path)
    parser.add_argument("--json", action="store_true")
    parser.add_argument("--report", type=Path, default=None, help="Write Markdown CHECK_REPORT.md sidecar.")
    args = parser.parse_args()
    root, tmp, issues = materialize(args.target)
    try:
        more, summary = check(root)
        issues.extend(more)
        result = {"decision": "PASS" if not issues else "STOP", "summary": summary, "issues": issues}
        if args.report is not None:
            args.report.write_text(render_report(args.target, result), encoding="utf-8")
        if args.json:
            print(json.dumps(result, ensure_ascii=False, indent=2))
        else:
            print(result["decision"])
            for issue in issues:
                print(f"- {issue['code']}: {issue['detail']}")
            if args.report is not None:
                print(f"CHECK_REPORT: {args.report}")
        return 0 if not issues else 1
    finally:
        if tmp is not None:
            tmp.cleanup()

if __name__ == "__main__":
    raise SystemExit(main())
