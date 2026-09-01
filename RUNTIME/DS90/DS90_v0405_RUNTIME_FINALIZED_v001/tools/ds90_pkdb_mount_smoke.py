#!/usr/bin/env python3
"""DS90 v0401 mounted PKDB/000_C compatibility smoke.

Mechanical maintenance test only. This checks that the inherited resident K01/K02
host capabilities in the supplied current 000_C still execute against the supplied
PKDB snapshot without mutation. It is NOT the v0401 standard project-authority
route; K04 current-shelf authority is tested by the Node runtime/negative suite.
"""
from __future__ import annotations

import argparse
import hashlib
import importlib
import inspect
import json
import shutil
import sys
import tempfile
import zipfile
import subprocess
import base64
from collections import Counter
from pathlib import Path


def sha256_file(path: Path) -> str:
    h = hashlib.sha256()
    with path.open("rb") as f:
        for chunk in iter(lambda: f.read(1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


def safe_extract(zf: zipfile.ZipFile, dest: Path) -> None:
    dest = dest.resolve()
    for info in zf.infolist():
        name = info.filename.replace("\\", "/")
        if name.startswith("/") or any(part == ".." for part in name.split("/")):
            raise RuntimeError(f"unsafe zip path: {info.filename}")
        target = (dest / name).resolve()
        if target != dest and dest not in target.parents:
            raise RuntimeError(f"unsafe zip path: {info.filename}")
    zf.extractall(dest)


def extract_zip(path: Path, dest: Path) -> None:
    with zipfile.ZipFile(path) as zf:
        bad = zf.testzip()
        if bad is not None:
            raise RuntimeError(f"CRC failure in {path.name}: {bad}")
        safe_extract(zf, dest)


def single_root(dest: Path) -> Path:
    entries = [p for p in dest.iterdir()]
    dirs = [p for p in entries if p.is_dir()]
    files = [p for p in entries if p.is_file()]
    if len(dirs) == 1 and not files:
        return dirs[0]
    return dest


def copy_schemas(*roots: Path, dest: Path) -> None:
    schema = dest / "schema"
    schema.mkdir(parents=True, exist_ok=True)
    for root in roots:
        for file in sorted((root / "schema").glob("*.json")):
            shutil.copy2(file, schema / file.name)




def import_versioned_skill_module(root: Path, prefix: str):
    files = sorted(root.glob(prefix + "_v*.py"))
    if len(files) != 1:
        raise RuntimeError(f"versioned skill module resolution failed: {prefix} count={len(files)}")
    module_name = files[0].stem
    if str(root) not in sys.path:
        sys.path.insert(0, str(root))
    return importlib.import_module(module_name), module_name


def execute_access_compat(module, volume_root: Path, request: dict, skill_schema_root: Path, core_root: Path):
    fn = module.execute_access
    argc = len(inspect.signature(fn).parameters)
    if argc == 3:
        return fn(volume_root, request, skill_schema_root)
    if argc == 4:
        return fn(volume_root, request, skill_schema_root, core_root)
    raise RuntimeError(f"unsupported execute_access signature: {argc}")


def execute_materialize_compat(module, volume_root: Path, request: dict, skill_schema_root: Path, core_root: Path, output_zip: Path):
    fn = module.execute_materialize
    argc = len(inspect.signature(fn).parameters)
    if argc == 4:
        return fn(volume_root, request, skill_schema_root, output_zip)
    if argc == 5:
        return fn(volume_root, request, skill_schema_root, core_root, output_zip)
    raise RuntimeError(f"unsupported execute_materialize signature: {argc}")


def read_records(volume_root: Path) -> list[dict]:
    records: list[dict] = []
    for file in sorted(volume_root.glob("PKDB_VOLUME_*/records/records.jsonl")):
        for line in file.read_text(encoding="utf-8").splitlines():
            if line.strip():
                records.append(json.loads(line))
    return records


def make_query(term: str, query_schema_version: str) -> dict:
    return {
        "query_schema_version": query_schema_version,
        "lookup": {"channel": "SEARCH_TERM", "value": term},
        "filters": {"record_types": ["SOURCE"], "statuses": ["CONFIRMED"], "reference_all": []},
        "scope_context": [],
        "cardinality": "ONE",
        "lineage_mode": "ACTIVE",
    }




def current_query_schema_version(core_root: Path) -> str:
    files = sorted((core_root / "schema").glob("PKDB_QUERY_SCHEMA_v*.json"))
    if len(files) != 1:
        raise RuntimeError(f"query schema resolution failed: count={len(files)}")
    schema = json.loads(files[0].read_text(encoding="utf-8"))
    try:
        value = schema["properties"]["query_schema_version"]["const"]
    except Exception as exc:
        raise RuntimeError("query schema const missing") from exc
    if not isinstance(value, str) or not value:
        raise RuntimeError("query schema const invalid")
    return value


def choose_fixture(records: list[dict]) -> tuple[str, str]:
    pairs: list[tuple[str, str, bool]] = []
    for rec in records:
        if rec.get("record_type") != "SOURCE" or rec.get("status") != "CONFIRMED":
            continue
        media_type = str((rec.get("payload") or {}).get("media_type", "")).lower()
        textual = media_type.startswith("text/") or media_type in {"application/json", "application/xml", "application/javascript", "application/yaml", "application/x-yaml"} or media_type.endswith("+json") or media_type.endswith("+xml")
        for term in rec.get("search_terms", []):
            if isinstance(term, str) and term:
                pairs.append((term, rec["record_id"], textual))
    counts = Counter(term for term, _, _ in pairs)
    unique = sorted((0 if textual else 1, term, rid) for term, rid, textual in pairs if counts[term] == 1)
    if not unique:
        raise RuntimeError("no unique CONFIRMED SOURCE search_term fixture exists")
    _, term, rid = unique[0]
    return term, rid


def fail(code: str, detail: str, report_path: Path | None) -> int:
    report = {"decision": "STOP", "code": code, "detail": detail}
    text = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
    if report_path:
        report_path.parent.mkdir(parents=True, exist_ok=True)
        report_path.write_text(text, encoding="utf-8")
    print(text, end="")
    return 1


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--c-zip", required=True, type=Path)
    ap.add_argument("--volume-zip", required=True, action="append", type=Path)
    ap.add_argument("--report", type=Path)
    args = ap.parse_args()

    c_zip = args.c_zip.resolve()
    volume_zips = [p.resolve() for p in args.volume_zip]
    report_path = args.report.resolve() if args.report else None
    if not c_zip.is_file() or not volume_zips or any(not p.is_file() for p in volume_zips):
        return fail("INPUT_MISSING", "000_C or one or more volume ZIPs are missing", report_path)

    before_hashes = {str(p): sha256_file(p) for p in [c_zip, *volume_zips]}

    try:
        with tempfile.TemporaryDirectory(prefix="ds90_pkdb_smoke_") as td:
            tmp = Path(td)
            c_dir = tmp / "c"
            pk_dir = tmp / "pk"
            c_dir.mkdir(); pk_dir.mkdir()
            extract_zip(c_zip, c_dir)
            for vol in volume_zips:
                extract_zip(vol, pk_dir)

            dispatch_path = c_dir / "00_READ_FIRST" / "RUNTIME_DIRECT_DISPATCH.json"
            dispatch = json.loads(dispatch_path.read_text(encoding="utf-8"))
            deps = dispatch.get("dependencies", {})
            dep_names = ["PKDB_ACCESS_SKILL", "PKDB_CORE", "PKDB_SOURCE_MATERIALIZE_SKILL"]
            dep_roots: dict[str, Path] = {}
            dep_facts: dict[str, dict] = {}
            for name in dep_names:
                spec = deps.get(name)
                if not isinstance(spec, dict):
                    raise RuntimeError(f"dispatch dependency missing: {name}")
                embedded = c_dir / spec["path"]
                data = embedded.read_bytes()
                actual = hashlib.sha256(data).hexdigest()
                declared = str(spec["sha256"]).lower()
                if actual != declared:
                    raise RuntimeError(f"dispatch SHA mismatch: {name}")
                out = tmp / name.lower()
                out.mkdir()
                extract_zip(embedded, out)
                dep_roots[name] = single_root(out)
                dep_facts[name] = {"path": spec["path"], "sha256": actual, "sha256_verified": True}

            query_schema_version = current_query_schema_version(dep_roots["PKDB_CORE"])
            records = read_records(pk_dir)
            if not records:
                raise RuntimeError("no PKDB records found")
            fixture_term, fixture_record_id = choose_fixture(records)
            all_terms = {t for r in records for t in r.get("search_terms", []) if isinstance(t, str)}
            missing_term = "__DS90_PKDB_MOUNT_SMOKE_REQUIRED_MISSING__"
            while missing_term in all_terms:
                missing_term += "_X"

            access_root = tmp / "access_runtime"
            copy_schemas(dep_roots["PKDB_ACCESS_SKILL"], dep_roots["PKDB_CORE"], dest=access_root)
            sys.path.insert(0, str(dep_roots["PKDB_CORE"] / "src"))
            access_mod, access_module_name = import_versioned_skill_module(dep_roots["PKDB_ACCESS_SKILL"], "pkdb_access_skill")

            positive_request = {
                "request_schema_version": "PKDB_ACCESS_REQUEST_v001",
                "execution_id": "AS-DS90-MOUNT-SMOKE-001",
                "consumer_id": "DS90_MOUNT_SMOKE",
                "snapshot_binding": {"mode": "CURRENT"},
                "clauses": [
                    {
                        "clause_id": "Q0001", "required": True,
                        "query": make_query(fixture_term, query_schema_version), "delivery_limit": 1,
                        "projection": {"mode": "FULL_RECORD"},
                    },
                    {
                        "clause_id": "Q0002", "required": False,
                        "query": make_query(missing_term, query_schema_version), "delivery_limit": 1,
                        "projection": {"mode": "FULL_RECORD"},
                    },
                ],
            }
            access_packet = execute_access_compat(access_mod, pk_dir, positive_request, access_root, dep_roots["PKDB_CORE"])
            if access_packet.get("decision") != "DELIVERED":
                raise RuntimeError(f"positive ACCESS not DELIVERED: {access_packet.get('decision')}")
            clauses = access_packet.get("clause_results", [])
            if len(clauses) != 2:
                raise RuntimeError("positive ACCESS clause count mismatch")
            if clauses[0].get("state") != "DELIVERED" or clauses[0].get("delivery_count") != 1:
                raise RuntimeError("positive ACCESS required clause did not deliver exactly one record")
            delivered = clauses[0]["delivered_records"][0]
            resolved_record_id = delivered["record_id"]
            if resolved_record_id != fixture_record_id:
                raise RuntimeError("positive ACCESS resolved unexpected SOURCE record")
            if clauses[1].get("state") != "BLOCKED" or "DB_NOT_FOUND" not in clauses[1].get("reason_codes", []):
                raise RuntimeError("optional NOT_FOUND boundary not preserved")

            materialize_root = tmp / "materialize_runtime"
            copy_schemas(dep_roots["PKDB_SOURCE_MATERIALIZE_SKILL"], dep_roots["PKDB_CORE"], dest=materialize_root)
            materialize_mod, materialize_module_name = import_versioned_skill_module(dep_roots["PKDB_SOURCE_MATERIALIZE_SKILL"], "pkdb_source_materialize_skill")
            mat_request = {
                "request_schema_version": "PKDB_SOURCE_MATERIALIZE_REQUEST_v001",
                "execution_id": "SM-DS90-MOUNT-SMOKE-001",
                "consumer_id": "DS90_MOUNT_SMOKE",
                "snapshot_binding": {"mode": "EXACT", "snapshot_sha256": access_packet["snapshot"]["snapshot_sha256"]},
                "items": [{"item_id": "S0001", "required": True, "source_record_id": resolved_record_id}],
            }
            bundle = tmp / "materialized.zip"
            mat_packet = execute_materialize_compat(materialize_mod, pk_dir, mat_request, materialize_root, dep_roots["PKDB_CORE"], bundle)
            if mat_packet.get("decision") != "DELIVERED":
                raise RuntimeError(f"MATERIALIZE not DELIVERED: {mat_packet.get('decision')}")
            item = mat_packet["item_results"][0]
            with zipfile.ZipFile(bundle) as zf:
                raw = zf.read(item["bundle_object_path"])
            if hashlib.sha256(raw).hexdigest() != item["sha256"] or len(raw) != item["bytes"]:
                raise RuntimeError("materialized source byte/hash binding mismatch")

            # Feed the actual resident ACCESS/MATERIALIZE packets through the DS90 Node adapter.
            # This closes the gap between "resident tools work" and "DS90 can consume their real packets".
            adapter_input = tmp / "adapter_probe_input.json"
            adapter_report = tmp / "adapter_probe_report.json"
            adapter_input.write_text(json.dumps({
                "accessPacket": access_packet,
                "materializePacket": mat_packet,
                "bundleObjects": {item["bundle_object_path"]: base64.b64encode(raw).decode("ascii")},
                "expectedSourceId": resolved_record_id,
            }, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            adapter_probe = Path(__file__).resolve().parent / "ds90_pkdb_adapter_probe.mjs"
            adapter_run = subprocess.run([
                "node", str(adapter_probe), "--input", str(adapter_input), "--report", str(adapter_report)
            ], text=True, capture_output=True)
            if adapter_run.returncode != 0:
                raise RuntimeError(f"DS90 PKDB host adapter E2E failed: {adapter_run.stdout}{adapter_run.stderr}")
            adapter_probe_result = json.loads(adapter_report.read_text(encoding="utf-8"))
            if adapter_probe_result.get("decision") != "PASS":
                raise RuntimeError("DS90 PKDB host adapter E2E did not PASS")

            negative_request = {
                "request_schema_version": "PKDB_ACCESS_REQUEST_v001",
                "execution_id": "AS-DS90-MOUNT-SMOKE-NEG-001",
                "consumer_id": "DS90_MOUNT_SMOKE",
                "snapshot_binding": {"mode": "EXACT", "snapshot_sha256": access_packet["snapshot"]["snapshot_sha256"]},
                "clauses": [{
                    "clause_id": "Q0001", "required": True,
                    "query": make_query(missing_term, query_schema_version), "delivery_limit": 1,
                    "projection": {"mode": "FULL_RECORD"},
                }],
            }
            negative_packet = execute_access_compat(access_mod, pk_dir, negative_request, access_root, dep_roots["PKDB_CORE"])
            if negative_packet.get("decision") != "BLOCKED" or "REQUIRED_CLAUSE_BLOCKED" not in negative_packet.get("reason_codes", []):
                raise RuntimeError("required NOT_FOUND did not BLOCK")
            nclause = negative_packet.get("clause_results", [{}])[0]
            if nclause.get("state") != "BLOCKED" or "DB_NOT_FOUND" not in nclause.get("reason_codes", []) or nclause.get("delivery_count") != 0:
                raise RuntimeError("required NOT_FOUND boundary was not exact")

            after_hashes = {str(p): sha256_file(p) for p in [c_zip, *volume_zips]}
            if before_hashes != after_hashes:
                raise RuntimeError("input ZIP bytes changed during read-only smoke test")

            report = {
                "decision": "PASS",
                "test": "DS90_V0400_MOUNT_COMPATIBILITY_SMOKE_v001",
                "v0401_standard_route_proved_here": False,
                "scope": "INHERITED_K01_K02_RESIDENT_CAPABILITY_AND_INPUT_IMMUTABILITY",
                "c_zip": {"path": str(c_zip), "sha256": before_hashes[str(c_zip)]},
                "volume_zips": [{"path": str(p), "sha256": before_hashes[str(p)]} for p in volume_zips],
                "resident_dependencies": dep_facts,
                "resident_python_modules": {"PKDB_ACCESS_SKILL": access_module_name, "PKDB_SOURCE_MATERIALIZE_SKILL": materialize_module_name},
                "resident_query_schema_version": query_schema_version,
                "snapshot_sha256": access_packet["snapshot"]["snapshot_sha256"],
                "record_count": access_packet["snapshot"]["record_count"],
                "source_object_count": access_packet["snapshot"]["source_object_count"],
                "fixture": {
                    "search_term": fixture_term,
                    "source_record_id": resolved_record_id,
                    "materialized_sha256": item["sha256"],
                    "materialized_bytes": item["bytes"],
                    "source_bytes_read": True,
                },
                "positive_access": {
                    "decision": access_packet["decision"],
                    "optional_not_found_preserved": True,
                },
                "materialize": {"decision": mat_packet["decision"], "exact_snapshot_binding": True},
                "ds90_host_adapter": adapter_probe_result,
                "negative_required_not_found": {
                    "decision": negative_packet["decision"],
                    "reason_codes": negative_packet["reason_codes"],
                    "delivery_count": nclause["delivery_count"],
                },
                "db_mutation_performed": False,
                "input_zip_hashes_unchanged": True,
            }
            text = json.dumps(report, ensure_ascii=False, indent=2) + "\n"
            if report_path:
                report_path.parent.mkdir(parents=True, exist_ok=True)
                report_path.write_text(text, encoding="utf-8")
            print(text, end="")
            return 0
    except Exception as exc:
        return fail("MOUNT_SMOKE_FAILED", str(exc), report_path)


if __name__ == "__main__":
    raise SystemExit(main())
