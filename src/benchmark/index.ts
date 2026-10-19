import { createParser } from "@openuidev/lang-core";
import { createSystemPrompt, type PromptLibrary } from "../prompt/index";
import schema from "../generated/upstream-schema.json";
import coreSchema from "../generated/core-schema.json";
import trustedSchema from "../generated/trusted-schema.json";
export interface BenchmarkCase { id: string; prompt: string; kind?: "tool" | "dashboard" }
export interface BenchmarkRequest { prompt: string; system: string; signal: AbortSignal }
export type BenchmarkProvider = (request: BenchmarkRequest) => Promise<string | AsyncIterable<string>> | AsyncIterable<string>;
export interface BenchmarkResult { id: string; source: string; passed: boolean; chunks: number; elapsedMs: number; errors: { code: string; message: string }[] }
export async function runBenchmark(cases: readonly BenchmarkCase[], provider: BenchmarkProvider, options: { library?: PromptLibrary; schema?: Parameters<typeof createParser>[0]; root?: string; timeoutMs?: number; maxSourceBytes?: number; signal?: AbortSignal; onResult?: (result: BenchmarkResult) => void } = {}): Promise<BenchmarkResult[]> {
  if (typeof options.library === "object" && !options.schema) throw new Error("Custom benchmark libraries require their matching schema");
  const selected = options.library === "core" ? coreSchema : options.library === "trusted-extras" ? trustedSchema : schema;
  const parser = createParser(options.schema ?? selected, options.root ?? "Col");
  const prompts = { tool: createSystemPrompt({}, options.library ?? "upstream"), dashboard: createSystemPrompt({}, options.library ?? "upstream", "dashboard") };
  const results: BenchmarkResult[] = [];
  for (const item of cases) {
    if (options.signal?.aborted) break;
    const controller = new AbortController(), start = performance.now();
    const abort = () => controller.abort(); options.signal?.addEventListener("abort", abort, { once: true });
    let chunks = 0, source = "", timer: ReturnType<typeof setTimeout> | undefined;
    let errors: BenchmarkResult["errors"] = [];
    try {
      await Promise.race([
        (async () => {
          const output = await provider({ prompt: item.prompt, system: prompts[item.kind ?? "tool"], signal: controller.signal });
          let bytes = 0;
          const add = (chunk: string) => { if (controller.signal.aborted) throw new Error("Benchmark cancelled"); if (typeof chunk !== "string") throw new Error("Provider must yield text"); bytes += new TextEncoder().encode(chunk).byteLength; if (bytes > (options.maxSourceBytes ?? 262_144)) throw new Error("Provider output too large"); source += chunk; chunks++; };
          if (typeof output === "string") add(output); else for await (const chunk of output) add(chunk);
        })(),
        new Promise<never>((_, reject) => { const cancel = () => reject(new Error("Benchmark cancelled or timed out")); controller.signal.addEventListener("abort", cancel, { once: true }); timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 60_000); }),
      ]);
      const fence = /```[\w-]*\s*\n([\s\S]*?)```/.exec(source); source = (fence?.[1] ?? source).trim();
      const parsed = parser.parse(source);
      errors = parsed.meta.errors.filter(e => e.severity !== "warning").map(e => ({ code: e.code, message: e.message }));
      if (!source || parsed.meta.incomplete || parsed.meta.unresolved.length) errors.push({ code: "incomplete-source", message: "Empty, incomplete or unresolved program" });
    } catch (error) { errors = [{ code: "provider-error", message: error instanceof Error ? error.message : "Provider failed" }]; }
    finally { clearTimeout(timer); options.signal?.removeEventListener("abort", abort); controller.abort(); }
    const result = { id: item.id, source, passed: errors.length === 0, chunks, elapsedMs: performance.now() - start, errors };
    results.push(result); options.onResult?.(result);
  }
  return results;
}
