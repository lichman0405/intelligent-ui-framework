// @vitest-environment node
import { expect, it } from "vitest";
import { runBenchmark } from "../src/benchmark/index";
it("runs a provider independently, collects stream chunks and checks official syntax", async () => {
  const result = await runBenchmark([{ id: "a", prompt: "hello" }], async function* ({ system }) { expect(system).toContain("MapMarker"); yield '```openui\nroot = '; yield 'Text("Hello")\n```'; });
  expect(result[0].passed).toBe(true); expect(result[0].chunks).toBe(2); expect(result[0].source).toBe('root = Text("Hello")');
});
it("records invalid syntax, oversized output, exceptions and uncooperative timeouts", async () => {
  for (const provider of [async () => 'root = NotRegistered("x")', async () => { throw new Error("failed"); }, async () => new Promise<string>(() => {})]) { const [result] = await runBenchmark([{ id: "bad", prompt: "bad" }], provider, { timeoutMs: 10 }); expect(result.passed).toBe(false); expect(result.errors.length).toBeGreaterThan(0); }
  const [large] = await runBenchmark([{ id: "big", prompt: "big" }], async () => "x".repeat(100), { maxSourceBytes: 10 }); expect(large.errors[0].message).toContain("too large");
});
it("uses the exact selected core schema and accepts cancellation", async () => {
  const [result] = await runBenchmark([{ id: "html", prompt: "html" }], async () => 'root = HtmlView("<b>x</b>")', { library: "core" }); expect(result.passed).toBe(false);
  const controller = new AbortController(); controller.abort(); expect(await runBenchmark([{ id: "skip", prompt: "skip" }], async () => "", { signal: controller.signal })).toEqual([]);
});
