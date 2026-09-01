#!/usr/bin/env python3
"""Regenerate the current DS90 runtime updated_manifest.json.

Mechanical packaging metadata only. Runtime identity is read from the current
README instead of being hard-coded so future runtime revisions do not regress
the manifest version during packaging. Release history belongs in the separate
Update-History artifact, not in this runtime manifest.
"""
from __future__ import annotations

import argparse
import hashlib
import json
import re
from datetime import datetime, timezone
from pathlib import Path

EXCLUDE = {"updated_manifest.json"}


def runtime_identity(root: Path) -> tuple[str, str]:
    readme = (root / "README.md").read_text(encoding="utf-8")
    version_match = re.search(r"^VERSION:\s*`([^`]+)`", readme, re.MULTILINE)
    runtime_match = re.search(r"^RUNTIME_LINE:\s*`([^`]+)`", readme, re.MULTILINE)
    if not version_match or not runtime_match:
        raise RuntimeError("README.md must declare VERSION and RUNTIME_LINE")
    return runtime_match.group(1), version_match.group(1)


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def build_records(root: Path) -> list[dict]:
    records = []
    for file in sorted(p for p in root.rglob("*") if p.is_file()):
        rel = file.relative_to(root).as_posix()
        if rel in EXCLUDE:
            continue
        records.append({"path": rel, "sha256": sha256_file(file), "bytes": file.stat().st_size})
    return records


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument("root", type=Path)
    parser.add_argument("--write", action="store_true")
    args = parser.parse_args()
    root = args.root.resolve()
    manifest_path = root / "updated_manifest.json"
    records = build_records(root)
    runtime_name, runtime_version = runtime_identity(root)
    metadata = {
        "runtime": runtime_name,
        "version": runtime_version,
        "status": "CURRENT_SHELF_PKDB_ORIGIN_TURN_RUNTIME",
        "runtime_base": "v0309_host_adapter_v2_hardened",
        "shelf_operation_base": "v0301_v008",
        "project_knowledge_route": "DS90_INDEX_SEARCH_TO_PKDB_CURRENT_SOURCE_LOCATOR_TO_CURRENT_PROJECT_SHELF",
        "project_authority": "CURRENT_PROJECT_SHELF",
        "pkdb_role": "TAG_ALIAS_CURRENT_SOURCE_LOCATOR_BACKEND",
        "source_materialize_role": "EXPLICIT_FALLBACK_ONLY",
        "update_history_in_runtime": False,
        "updated_at": datetime.now(timezone.utc).isoformat(),
        "file_count_excluding_updated_manifest": len(records),
        "files": records,
        "tooling_boundary_policy": {
            "pythonized_scope": "mechanical_inspection_manifest_hash_mount_compatibility_and_packaging_only",
            "markdown_scope": "runtime_law_role_boundary_stop_and_intent",
            "json_scope": "machine_readable_lists_and_contracts",
            "non_goal": "no_story_quality_scoring_no_mt00_sp00_pw90_ts90_replacement_no_runtime_history_embedding"
        }
    }
    text = json.dumps(metadata, ensure_ascii=False, indent=2) + "\n"
    if args.write:
        manifest_path.write_text(text, encoding="utf-8")
    else:
        print(text)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
