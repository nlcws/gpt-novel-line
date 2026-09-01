# DSGN current-package audit boundary

STATUS: AUDIT_HISTORY_WITH_CURRENT_V020_EVIDENCE

- `root_reports_v020/` は現行V020の検証証跡を置く。
- `root_reports_v019_*` と `DSGN_CURRENT_PACKAGE_DRY_RUN_REPORT_v1.*` は成立時点の監査snapshotであり、active instructionではない。
- snapshot内部の旧path・旧status・旧件数は履歴値として保存し、現行runtimeの正本、読了順、または合否根拠に使わない。
- 現行の実行境界はroot `ALWAYS_READ` / `OPERATION_READS`、構成境界は
  `00_MANIFEST/current/DSGN_CURRENT_PACKAGE_MANIFEST_v1.json` が定める。
