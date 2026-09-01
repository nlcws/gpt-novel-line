export const BODY_CHAR_OBSERVER_ID = "PW90_BODY_CHAR_OBSERVER_v001";
export const NORMAL_FULLBURN_TARGET_CHARS = 15000;

const normalizeNewlines = (text) => String(text ?? "").replace(/\r\n?/g, "\n");
const isMarkdownHeading = (line) => /^\s{0,3}#{1,6}\s+\S/.test(line ?? "");

export function countUnicodeBodyChars(text) {
  if (typeof text !== "string") return null;
  return Array.from(normalizeNewlines(text).replace(/\n/g, "")).length;
}

export function extractNormalFullburnBody(text) {
  if (typeof text !== "string") return { valid:false, bodyText:"", failures:[{ code:"BODY_TEXT_REQUIRED_FOR_RUNTIME_COUNT", path:"output.text" }] };
  const lines = normalizeNewlines(text).split("\n");
  while (lines.length && lines[0].trim() === "") lines.shift();
  while (lines.length && isMarkdownHeading(lines[0])) {
    lines.shift();
    while (lines.length && lines[0].trim() === "") lines.shift();
  }
  const bodyText = lines.join("\n");
  return { valid:true, bodyText, failures:[] };
}

export function observeNormalFullburnBody(text) {
  const extracted = extractNormalFullburnBody(text);
  if (!extracted.valid) return { ...extracted, observedBodyCharCount:null, under15k:null };
  const observedBodyCharCount = countUnicodeBodyChars(extracted.bodyText);
  return { ...extracted, observedBodyCharCount, under15k: observedBodyCharCount < NORMAL_FULLBURN_TARGET_CHARS };
}

export function extractSecondDraftBody(text, directive) {
  const failures = [];
  if (typeof text !== "string") return { valid:false, bodyText:"", titleLine:null, failures:[{ code:"SECOND_DRAFT_TEXT_REQUIRED_FOR_RUNTIME_COUNT", path:"output.text" }] };
  if (typeof directive !== "string" || !text.startsWith(directive)) {
    return { valid:false, bodyText:"", titleLine:null, failures:[{ code:"SECOND_DRAFT_BODY_HEAD_DIRECTIVE_MISSING", path:"output.text" }] };
  }
  let rest = normalizeNewlines(text.slice(directive.length));
  let lines = rest.split("\n");
  while (lines.length && lines[0].trim() === "") lines.shift();
  if (!lines.length) return { valid:false, bodyText:"", titleLine:null, failures:[{ code:"SECOND_DRAFT_TITLE_OR_BODY_MISSING", path:"output.text" }] };

  // The first non-empty line after the exact directive is mechanically treated as the episode title and excluded.
  const titleLine = lines.shift();
  while (lines.length && lines[0].trim() === "") lines.shift();

  // Markdown headings are structural headers, not manuscript body characters.
  const bodyLines = lines.filter((line) => !isMarkdownHeading(line));
  const bodyText = bodyLines.join("\n");
  if (bodyText.trim() === "") failures.push({ code:"SECOND_DRAFT_BODY_TEXT_EMPTY_AFTER_STRUCTURE_EXCLUSION", path:"output.text" });
  return { valid: failures.length === 0, bodyText, titleLine, failures };
}

export function observeSecondDraftBody(text, directive) {
  const extracted = extractSecondDraftBody(text, directive);
  if (!extracted.valid) return { ...extracted, observedBodyCharCount:null, under15k:null };
  const observedBodyCharCount = countUnicodeBodyChars(extracted.bodyText);
  return { ...extracted, observedBodyCharCount, under15k: observedBodyCharCount < NORMAL_FULLBURN_TARGET_CHARS };
}
