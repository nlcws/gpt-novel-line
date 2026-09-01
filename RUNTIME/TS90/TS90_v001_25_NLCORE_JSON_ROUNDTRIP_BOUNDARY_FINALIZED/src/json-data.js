import { types as utilTypes } from "node:util";

export const JSON_DATA_LIMITS = Object.freeze({
  maxDepth: 512,
  maxNodes: 200000,
  maxCanonicalBytes: 16 * 1024 * 1024
});

function boundaryError(code, detail = null) {
  const error = new Error(code);
  error.code = code;
  if (detail != null) error.detail = detail;
  return error;
}

function isArrayIndexKey(key, length) {
  if (typeof key !== "string" || key === "" || !/^(0|[1-9]\d*)$/.test(key)) return false;
  const n = Number(key);
  return Number.isSafeInteger(n) && n >= 0 && n < length && String(n) === key;
}

function inheritedCallableToJSON(value) {
  let current = value;
  while (current != null) {
    const descriptor = Object.getOwnPropertyDescriptor(current, "toJSON");
    if (descriptor) {
      if (typeof descriptor.get === "function" || typeof descriptor.set === "function") return true;
      return typeof descriptor.value === "function";
    }
    current = Object.getPrototypeOf(current);
  }
  return false;
}

function canonicalize(value, depth, ancestors, budget, path) {
  if (depth > budget.limits.maxDepth) throw boundaryError("JSON_DATA_MAX_DEPTH_EXCEEDED", path);
  budget.nodes += 1;
  if (budget.nodes > budget.limits.maxNodes) throw boundaryError("JSON_DATA_MAX_NODES_EXCEEDED", path);

  if (value === null) return null;
  const type = typeof value;
  if (type === "string" || type === "boolean") return value;
  if (type === "number") {
    if (!Number.isFinite(value)) throw boundaryError("JSON_DATA_NON_FINITE_NUMBER_DENIED", path);
    if (Object.is(value, -0)) throw boundaryError("JSON_DATA_NEGATIVE_ZERO_DENIED", path);
    return value;
  }
  if (type === "undefined") throw boundaryError("JSON_DATA_UNDEFINED_DENIED", path);
  if (type === "bigint") throw boundaryError("JSON_DATA_BIGINT_DENIED", path);
  if (type === "function") throw boundaryError("JSON_DATA_FUNCTION_DENIED", path);
  if (type === "symbol") throw boundaryError("JSON_DATA_SYMBOL_DENIED", path);
  if (type !== "object") throw boundaryError("JSON_DATA_TYPE_DENIED", path);

  if (utilTypes.isProxy(value)) throw boundaryError("JSON_DATA_PROXY_DENIED", path);
  if (ancestors.has(value)) throw boundaryError("STABLE_SERIALIZATION_CIRCULAR_REFERENCE", path);
  if (inheritedCallableToJSON(value)) throw boundaryError("JSON_DATA_CALLABLE_TOJSON_DENIED", path);

  ancestors.add(value);
  try {
    if (Array.isArray(value)) {
      const out = [];
      for (let i = 0; i < value.length; i += 1) {
        if (!Object.prototype.hasOwnProperty.call(value, i)) throw boundaryError("JSON_DATA_SPARSE_ARRAY_DENIED", `${path}[${i}]`);
        const descriptor = Object.getOwnPropertyDescriptor(value, String(i));
        if (!descriptor || typeof descriptor.get === "function" || typeof descriptor.set === "function") {
          throw boundaryError("JSON_DATA_ACCESSOR_DENIED", `${path}[${i}]`);
        }
        out.push(canonicalize(descriptor.value, depth + 1, ancestors, budget, `${path}[${i}]`));
      }
      return out;
    }

    const proto = Object.getPrototypeOf(value);
    if (proto !== Object.prototype && proto !== null) throw boundaryError("JSON_DATA_NON_PLAIN_OBJECT_DENIED", path);

    const names = Object.keys(value).sort();
    const out = Object.create(null);
    for (const key of names) {
      const descriptor = Object.getOwnPropertyDescriptor(value, key);
      if (!descriptor || typeof descriptor.get === "function" || typeof descriptor.set === "function") {
        throw boundaryError("JSON_DATA_ACCESSOR_DENIED", `${path}.${key}`);
      }
      const child = canonicalize(descriptor.value, depth + 1, ancestors, budget, `${path}.${key}`);
      Object.defineProperty(out, key, { value: child, enumerable: true, writable: true, configurable: true });
    }
    return out;
  } finally {
    ancestors.delete(value);
  }
}

export function stableStringify(value, limits = JSON_DATA_LIMITS) {
  const budget = { nodes: 0, limits };
  const canonical = canonicalize(value, 0, new WeakSet(), budget, "$" );
  const json = JSON.stringify(canonical);
  const bytes = Buffer.byteLength(json, "utf8");
  if (bytes > limits.maxCanonicalBytes) throw boundaryError("JSON_DATA_MAX_CANONICAL_BYTES_EXCEEDED", `$:${bytes}`);
  return json;
}

export function assertJsonRoundTripData(value, limits = JSON_DATA_LIMITS) {
  const json = stableStringify(value, limits);
  const parsed = JSON.parse(json);
  return Object.freeze({ json, parsed });
}

export function jsonDataFailureCode(error, fallback = "JSON_DATA_BOUNDARY_DENIED") {
  return typeof error?.code === "string" ? error.code : fallback;
}
