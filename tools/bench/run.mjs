import { parseArgs } from "node:util";
import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve, join } from "node:path";
import { pathToFileURL } from "node:url";
import { runBenchmark } from "../../dist/benchmark/index.js";
import { galleryPrograms } from "../../dist/gallery/index.js";
const { values: opt } = parseArgs({ options: { fixtures: { type: "boolean" }, answers: { type: "string" }, provider: { type: "string" }, model: { type: "string" }, "base-url": { type: "string" }, "key-env": { type: "string", default: "BENCH_API_KEY" }, only: { type: "string" }, out: { type: "string", default: "artifacts/benchmark" } } });
let cases = opt.fixtures ? galleryPrograms.map(p => ({ id: p.id, prompt: p.title, kind: p.capabilities.includes("tools") ? "dashboard" : "tool" })) : JSON.parse(await readFile(new URL("./prompts.json", import.meta.url), "utf8"));
if (opt.only) cases = cases.filter(p => opt.only.split(",").includes(p.id));
let provider;
if (opt.fixtures) provider = async function* ({ prompt, signal }) { const source = galleryPrograms.find(p => p.title === prompt).code; for (let i = 0; i < source.length && !signal.aborted; i += 97) yield source.slice(i, i + 97); };
else if (opt.answers) provider = ({ prompt }) => readFile(join(resolve(opt.answers), cases.find(p => p.prompt === prompt).id + ".oui"), "utf8");
else if (opt.provider) provider = (await import(pathToFileURL(resolve(opt.provider)).href)).default;
else {
  if (!opt.model || !opt["base-url"] || !process.env[opt["key-env"]]) throw new Error("Use --fixtures, --answers DIR, --provider MODULE, or --model/--base-url and an environment API key");
  const base = new URL(opt["base-url"]); if (base.protocol !== "https:" || base.username || base.password) throw new Error("Model endpoint must use credential-free HTTPS");
  provider = async function* ({ prompt, system, signal }) {
    const response = await fetch(base.href.replace(/\/$/, "") + "/chat/completions", { method: "POST", signal, redirect: "error", headers: { "Content-Type": "application/json", Authorization: `Bearer ${process.env[opt["key-env"]]}` }, body: JSON.stringify({ model: opt.model, stream: true, messages: [{ role: "system", content: system }, { role: "user", content: prompt }] }) });
    if (!response.ok || !response.body) throw new Error(`Model endpoint HTTP ${response.status}`);
    const reader = response.body.getReader(), decoder = new TextDecoder(); let pending = "", bytes = 0;
    try { while (true) { const { value, done } = await reader.read(); if (done) break; bytes += value.byteLength; if (bytes > 4_194_304) throw new Error("Model response exceeds limit"); pending += decoder.decode(value, { stream: true }); let index; while ((index = pending.indexOf("\n")) >= 0) { const line = pending.slice(0, index).trim(); pending = pending.slice(index + 1); if (!line.startsWith("data:") || line.slice(5).trim() === "[DONE]") continue; const data = JSON.parse(line.slice(5)); if (data.error) throw new Error("Model provider returned an error"); const text = data.choices?.[0]?.delta?.content; if (text) yield text; } } }
    finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
  };
}
if (typeof provider !== "function" || !cases.length) throw new Error("Missing provider or benchmark cases");
const output = resolve(opt.out); await mkdir(join(output, "answers"), { recursive: true });
const results = await runBenchmark(cases, provider);
for (const result of results) await writeFile(join(output, "answers", `${result.id}.oui`), result.source);
await writeFile(join(output, "results.json"), JSON.stringify({ mode: opt.fixtures ? "fixture-stream" : opt.answers ? "saved-answers" : "provider", model: opt.model, passed: results.filter(r => r.passed).length, total: results.length, results }, null, 2));
console.log(`${results.filter(r => r.passed).length}/${results.length} programs passed official parser; ${output}`);
if (results.some(r => !r.passed)) { for (const r of results.filter(r => !r.passed)) console.error(r.id, r.errors); process.exitCode = 1; }
