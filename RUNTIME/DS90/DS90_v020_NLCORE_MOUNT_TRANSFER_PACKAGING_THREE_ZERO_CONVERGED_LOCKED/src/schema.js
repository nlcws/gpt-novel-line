import { readFileSync } from "node:fs";

const schema = JSON.parse(readFileSync(
  new URL("../protocol/request.schema.json", import.meta.url),
  "utf8"
));

function isObject(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function matchesType(value, type) {
  if (type === "object") return isObject(value);
  if (type === "array") return Array.isArray(value);
  if (type === "null") return value === null;
  if (type === "integer") return Number.isInteger(value);
  return typeof value === type;
}

function validateNode(value, node, path, issues) {
  if (Array.isArray(node.anyOf)) {
    const matched = node.anyOf.some((candidate) => {
      const candidateIssues = [];
      validateNode(value, candidate, path, candidateIssues);
      return candidateIssues.length === 0;
    });
    if (!matched) issues.push({ code: "SCHEMA_ANY_OF", path, message: "no anyOf branch matched" });
  }
  const types = Array.isArray(node.type) ? node.type : node.type ? [node.type] : [];
  if (types.length > 0 && !types.some((type) => matchesType(value, type))) {
    issues.push({ code: "SCHEMA_TYPE", path, message: `expected ${types.join("|")}` });
    return;
  }
  if (typeof value === "string") {
    if (node.minLength != null && value.length < node.minLength) {
      issues.push({ code: "SCHEMA_MIN_LENGTH", path, message: `minLength ${node.minLength}` });
    }
    if (node.enum != null && !node.enum.includes(value)) {
      issues.push({ code: "SCHEMA_ENUM", path, message: "value is not in enum" });
    }
  }
  if (isObject(value)) {
    for (const key of node.required ?? []) {
      if (!(key in value)) issues.push({ code: "SCHEMA_REQUIRED", path: `${path}.${key}`,
        message: "required property" });
    }
    for (const [key, child] of Object.entries(node.properties ?? {})) {
      if (key in value) validateNode(value[key], child, `${path}.${key}`, issues);
    }
    const allowed = new Set(Object.keys(node.properties ?? {}));
    for (const key of Object.keys(value)) {
      if (!allowed.has(key)) {
        if (node.additionalProperties === false) {
          issues.push({ code: "SCHEMA_ADDITIONAL", path: `${path}.${key}`,
            message: "additional property is forbidden" });
        } else if (isObject(node.additionalProperties)) {
          validateNode(value[key], node.additionalProperties, `${path}.${key}`, issues);
        }
      }
    }
  }
  if (Array.isArray(value) && node.items != null) {
    value.forEach((item, index) => validateNode(item, node.items, `${path}[${index}]`, issues));
  }
}

export function validateSchema(input) {
  const issues = [];
  validateNode(input, schema, "$", issues);
  return issues;
}
