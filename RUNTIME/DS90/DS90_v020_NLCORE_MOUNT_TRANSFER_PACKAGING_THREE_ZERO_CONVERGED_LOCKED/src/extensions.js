const META_REGISTRY = Object.freeze({
  requestId: "string",
  traceId: "string",
  caller: "string",
  displayNote: "string",
  timestamp: "string"
});

const PAYLOAD_REGISTRY = Object.freeze({
  BOOT: Object.freeze({}),
  CHECK: Object.freeze({
    checkScope: "string"
  }),
  TAG_SEARCH: Object.freeze({
    queryMode: "string",
    resultLimit: "integer"
  }),
  CARD: Object.freeze({
    presentationMode: "string",
    targetLength: "integer"
  }),
  CARD_TEST: Object.freeze({
    comparisonLabel: "string"
  }),
  LOG: Object.freeze({
    outputFormat: "string"
  }),
  MOUNT_TRANSFER: Object.freeze({
    dryRun: "boolean"
  }),
  ARCHIVE: Object.freeze({
    retentionLabel: "string"
  }),
  SINGLE_EPISODE_PROFILE_GATE: Object.freeze({
    passLabel: "string"
  }),
  EPISODE_PACK: Object.freeze({
    packLabel: "string"
  }),
  PACK_CUTOUT: Object.freeze({
    packLabel: "string"
  })
});

const RESERVED_PATTERN = /(canon|canonical|evidence|source|read|proof|assertion)/i;

function matchesType(value, type) {
  if (type === "integer") return Number.isInteger(value);
  return typeof value === type;
}

function inspectReserved(value, path, issues) {
  if (value == null || typeof value !== "object") return;
  for (const [key, child] of Object.entries(value)) {
    if (RESERVED_PATTERN.test(key)) {
      issues.push({
        code: "EXTENSION_RESERVED_KEY",
        path: `${path}.${key}`,
        message: "正本・根拠・資料・読了情報は拡張領域へ置けません"
      });
    }
    inspectReserved(child, `${path}.${key}`, issues);
  }
}

function validateRegistry(value, registry, path, issues) {
  if (value == null) return;
  for (const [key, item] of Object.entries(value)) {
    const expected = registry[key];
    if (expected == null) {
      issues.push({
        code: "EXTENSION_UNDECLARED_KEY",
        path: `${path}.${key}`,
        message: "レジストリ未宣言の拡張キーです"
      });
    } else if (!matchesType(item, expected)) {
      issues.push({
        code: "EXTENSION_TYPE",
        path: `${path}.${key}`,
        message: `expected ${expected}`
      });
    }
  }
}

export function validateExtensions(operation, meta, payload) {
  const issues = [];
  validateRegistry(meta, META_REGISTRY, "meta", issues);
  validateRegistry(payload, PAYLOAD_REGISTRY[operation] ?? {}, "payload", issues);
  inspectReserved(meta, "meta", issues);
  inspectReserved(payload, "payload", issues);
  return issues;
}

export { META_REGISTRY, PAYLOAD_REGISTRY };
