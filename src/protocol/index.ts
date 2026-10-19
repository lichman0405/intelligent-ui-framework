/** Frozen JSON wire contract 1.0. This module has no React or Zod dependency. */
export type JSONPrimitive = string | number | boolean | null;
export type JSONValue = JSONPrimitive | JSONValue[] | { [key: string]: JSONValue };
export interface UIArtifactV1 {
  kind: "intelligent_ui";
  protocolVersion: "1.0";
  artifactId: string;
  language: "openui-lang";
  libraryId: string;
  libraryVersion: string;
  source: string;
  state?: Record<string, JSONValue>;
  metadata?: { title?: string; provenance?: string };
}
export interface UIActionContext { artifactId: string; hostSessionId?: string; hostTurnId?: string }
export type UIHostAction =
  | { kind: "continue_conversation"; message: string; formState?: Record<string, JSONValue> }
  | { kind: "custom_action"; name: string; params: Record<string, JSONValue> };
export interface UIHostAdapter {
  onAction?(action: UIHostAction, ctx: UIActionContext): void | Promise<void>;
  onStateChange?(state: Record<string, JSONValue>, ctx: UIActionContext): void;
  invokeTool?(name: string, args: Record<string, JSONValue>, ctx: UIActionContext): Promise<JSONValue>;
  openUrl?(url: string, ctx: UIActionContext): void | Promise<void>;
  copyText?(text: string, ctx: UIActionContext): Promise<boolean>;
  /** Additive runtime capabilities. An omitted allowlist grants no tool access. */
  allowedTools?: readonly string[];
  resolveImage?(query: string, ctx: UIActionContext): Promise<readonly { url: string; alt?: string }[]>;
  resolveRoute?(points: readonly [number, number][], ctx: UIActionContext): Promise<readonly [number, number][]>;
  /** Allows Host to abort its requests when an artifact is replaced/unmounted. */
  onDispose?(ctx: UIActionContext): void;
}
export const PROTOCOL_VERSION = "1.0" as const;
export const LIBRARY_ID = "core";
export const LIBRARY_VERSION = "0.1.0";
export const PACKAGE_VERSION = "0.2.0";
export interface Diagnostic { code: string; message: string; path?: string }
export interface ValidationLimits { maxBytes: number; maxSourceBytes: number; maxStateBytes: number; maxDepth: number; maxNodes: number }
export const DEFAULT_LIMITS: Readonly<ValidationLimits> = Object.freeze({ maxBytes: 1_048_576, maxSourceBytes: 262_144, maxStateBytes: 262_144, maxDepth: 32, maxNodes: 30_000 });
export type ValidationResult<T> = { success: true; data: T } | { success: false; errors: Diagnostic[] };
export interface ArtifactValidationOptions {
  limits?: Partial<ValidationLimits>;
  /** Exact supported signatures. Custom registries must be explicitly supplied by Host. */
  supportedLibraries?: Readonly<Record<string, readonly string[]>>;
}
const bytes = (s: string) => new TextEncoder().encode(s).byteLength;
export function isJsonRecord(value: unknown): value is Record<string, JSONValue> {
  if (value === null || typeof value !== "object" || Array.isArray(value)) return false;
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}
export function validateJSON(value: unknown, options: Partial<ValidationLimits> = {}): ValidationResult<JSONValue> {
  const limits = { ...DEFAULT_LIMITS, ...options };
  const seen = new WeakSet<object>();
  let nodes = 0;
  function visit(v: unknown, depth: number, path: string): Diagnostic | undefined {
    if (++nodes > limits.maxNodes || depth > limits.maxDepth) return { code: "json-limit", message: "JSON nesting or node limit exceeded", path };
    if (v === null || typeof v === "string" || typeof v === "boolean") return;
    if (typeof v === "number" && Number.isFinite(v)) return;
    if (typeof v !== "object" || !v) return { code: "invalid-json", message: "Expected finite JSON data", path };
    if (seen.has(v)) return { code: "invalid-json", message: "Cyclic objects are not wire JSON", path };
    seen.add(v);
    if (!Array.isArray(v) && !isJsonRecord(v)) return { code: "invalid-json", message: "Only plain JSON objects are allowed", path };
    if (Object.getOwnPropertySymbols(v).length) return { code: "invalid-json", message: "Symbol properties are not wire JSON", path };
    for (const [key, desc] of Object.entries(Object.getOwnPropertyDescriptors(v))) {
      if (Array.isArray(v) && key === "length") continue;
      if (!desc.enumerable || !('value' in desc) || ["__proto__", "prototype", "constructor"].includes(key)) return { code: "invalid-json", message: "Unsafe JSON property", path: `${path}.${key}` };
      const issue = visit(desc.value, depth + 1, `${path}.${key}`);
      if (issue) return issue;
    }
    seen.delete(v);
  }
  try {
    const issue = visit(value, 0, "$" );
    if (issue) return { success: false, errors: [issue] };
    const encoded = JSON.stringify(value);
    if (bytes(encoded) > limits.maxBytes) return { success: false, errors: [{ code: "json-limit", message: "JSON byte limit exceeded" }] };
    return { success: true, data: JSON.parse(encoded) as JSONValue };
  } catch { return { success: false, errors: [{ code: "invalid-json", message: "Could not read JSON data" }] }; }
}
export function validateState(value: unknown, limits: Partial<ValidationLimits> = {}): ValidationResult<Record<string, JSONValue>> {
  const checked = validateJSON(value, { ...limits, maxBytes: limits.maxStateBytes ?? DEFAULT_LIMITS.maxStateBytes });
  if (!checked.success) return checked;
  if (!isJsonRecord(checked.data)) return { success: false, errors: [{ code: "invalid-state", message: "State must be a JSON object" }] };
  return { success: true, data: checked.data };
}
export function validateArtifact(value: unknown, options: ArtifactValidationOptions = {}): ValidationResult<UIArtifactV1> {
  const checked = validateJSON(value, options.limits);
  if (!checked.success) return checked;
  if (!isJsonRecord(checked.data)) return { success: false, errors: [{ code: "invalid-artifact", message: "Artifact must be a JSON object" }] };
  const a = checked.data;
  const errors: Diagnostic[] = [];
  const fail = (code: string, message: string, path?: string) => errors.push({ code, message, path });
  for (const key of Object.keys(a)) if (!["kind", "protocolVersion", "artifactId", "language", "libraryId", "libraryVersion", "source", "state", "metadata"].includes(key)) fail("unknown-field", "Unexpected artifact field", key);
  if (a.kind !== "intelligent_ui" || a.language !== "openui-lang") fail("invalid-artifact", "Unsupported kind or language");
  if (a.protocolVersion !== PROTOCOL_VERSION) fail("unsupported-protocol", "Only protocol 1.0 is supported", "protocolVersion");
  for (const key of ["artifactId", "libraryId", "libraryVersion"] as const) if (typeof a[key] !== "string" || !a[key].trim() || a[key].length > 128) fail("invalid-artifact", `${key} must be a nonempty string up to 128 characters`, key);
  if (typeof a.libraryVersion !== "string" || !/^\d+\.\d+\.\d+(?:-[\da-z.-]+)?(?:\+[\da-z.-]+)?$/i.test(a.libraryVersion)) fail("invalid-version", "libraryVersion must be a full semantic version");
  const libraries = options.supportedLibraries ?? { [LIBRARY_ID]: [LIBRARY_VERSION] };
  if (typeof a.libraryId !== "string" || typeof a.libraryVersion !== "string" || !libraries[a.libraryId]?.includes(a.libraryVersion)) fail("unsupported-library", "Library signature is not supported");
  if (typeof a.source !== "string") fail("invalid-source", "source must be OpenUI Lang text");
  else if (bytes(a.source) > (options.limits?.maxSourceBytes ?? DEFAULT_LIMITS.maxSourceBytes)) fail("source-limit", "OpenUI source byte limit exceeded");
  if (a.state !== undefined) { const state = validateState(a.state, options.limits); if (!state.success) errors.push(...state.errors); }
  if (a.metadata !== undefined && (!isJsonRecord(a.metadata) || Object.entries(a.metadata).some(([k, v]) => !["title", "provenance"].includes(k) || typeof v !== "string" || v.length > 4096))) fail("invalid-metadata", "Metadata only accepts bounded title/provenance strings");
  return errors.length ? { success: false, errors } : { success: true, data: a as unknown as UIArtifactV1 };
}
export function createArtifact(source: string, artifactId: string, state?: Record<string, JSONValue>, signature?: { libraryId: string; libraryVersion: string }): UIArtifactV1 {
  const artifact: UIArtifactV1 = { kind: "intelligent_ui", protocolVersion: PROTOCOL_VERSION, artifactId, language: "openui-lang", libraryId: signature?.libraryId ?? LIBRARY_ID, libraryVersion: signature?.libraryVersion ?? LIBRARY_VERSION, source, ...(state ? { state } : {}) };
  const result = validateArtifact(artifact, signature ? { supportedLibraries: { [signature.libraryId]: [signature.libraryVersion] } } : undefined);
  if (!result.success) throw new Error(result.errors.map(e => e.message).join("; "));
  return result.data;
}
