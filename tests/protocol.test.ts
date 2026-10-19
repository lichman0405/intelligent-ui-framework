import { describe, expect, it } from "vitest";
import { createArtifact, validateArtifact, validateJSON, validateState } from "../src/protocol/index";
describe("wire contract 1.0", () => {
  it("round-trips a real library-compatible artifact", () => {
    const a = createArtifact('$x = 4\nroot = Col([Title("Interactive example", "md"), Slider($x, 0, 10), Text("Choose a value")])', "demo-chart-001", { $x: 4 });
    expect(validateArtifact(JSON.parse(JSON.stringify(a)))).toEqual({ success: true, data: a });
  });
  it.each([{ protocolVersion: "2.0" }, { libraryId: "unknown" }, { libraryVersion: "0.2.0" }, { kind: "markdown" }, { source: null }, { state: [] }, { metadata: { apiKey: "secret" } }])("rejects unsupported or malformed envelope %j", patch => {
    expect(validateArtifact({ ...createArtifact('root = Text("ok")', "a"), ...patch }).success).toBe(false);
  });
  it("rejects function, class, accessor, prototype pollution and nonfinite data without invoking getters", () => {
    let accessed = false;
    for (const value of [() => 1, new Date(), { x: Infinity }, { get x() { accessed = true; return "bad"; } }, JSON.parse('{"__proto__":{"polluted":true}}')]) expect(validateJSON(value).success).toBe(false);
    expect(accessed).toBe(false);
    expect(({} as { polluted?: boolean }).polluted).toBeUndefined();
  });
  it("bounds source, state, recursion and cycles", () => {
    expect(validateArtifact({ ...createArtifact("", "a"), source: "x".repeat(262_145) }).success).toBe(false);
    expect(validateState({ x: "x".repeat(262_145) }).success).toBe(false);
    let nested: unknown = 0; for (let i = 0; i < 40; i++) nested = [nested];
    expect(validateJSON(nested).success).toBe(false);
    const cycle: unknown[] = []; cycle.push(cycle); expect(validateJSON(cycle).success).toBe(false);
  });
});
