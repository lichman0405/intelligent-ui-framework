import { mkdir, cp, writeFile, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
const root = resolve(".");
const manifest = JSON.parse(await readFile("package.json", "utf8"));
const tarball = resolve(`artifacts/intelligent-ui-framework-${manifest.version}.tgz`);
const sha256 = createHash("sha256").update(await readFile(tarball)).digest("hex");
const output = resolve("..", "consumer-validation", sha256.slice(0, 12));
const lock = JSON.parse(await readFile("package-lock.json", "utf8"));
const versions = process.argv.includes("--both") ? ["4.4.3", "3.25.76"] : ["4.4.3"];
await mkdir("artifacts", { recursive: true });
const results = [];
for (const zod of versions) {
  const cwd = join(output, `zod-${zod}`);
  await mkdir(cwd, { recursive: true });
  await cp("examples/vite-react-demo/src", join(cwd, "src"), { recursive: true });
  await cp("examples/vite-react-demo/index.html", join(cwd, "index.html"));
  await cp("examples/vite-react-demo/vite.config.ts", join(cwd, "vite.config.ts"));
  const devDependencies = Object.fromEntries(["vite", "typescript", "@types/react", "@types/react-dom", "@types/node"].map(n => [n, lock.packages[`node_modules/${n}`].version]));
  await writeFile(join(cwd, "package.json"), JSON.stringify({ name: `iui-clean-consumer-${zod}`, private: true, type: "module", scripts: { build: "tsc --noEmit && vite build" }, dependencies: { "@intelligent-ui/framework": `file:${tarball.replaceAll("\\", "/")}`, react: "19.2.3", "react-dom": "19.2.3", "maplibre-gl": lock.packages["node_modules/maplibre-gl"].version, zod }, devDependencies }, null, 2));
  await writeFile(join(cwd, "tsconfig.json"), JSON.stringify({ compilerOptions: { target: "ES2022", module: "ESNext", moduleResolution: "Bundler", jsx: "react-jsx", strict: true, skipLibCheck: false, esModuleInterop: true, lib: ["ES2022", "DOM", "DOM.Iterable"], types: ["node"], noEmit: true }, include: ["src", "vite.config.ts"] }));
  await cp("tests/consumer-smoke.mjs", join(cwd, "consumer-smoke.mjs"));
  const logs = [];
  function run(args) {
    const result = spawnSync(process.execPath, args, { cwd, encoding: "utf8", env: { ...process.env, OPENUI_TELEMETRY_DISABLED: "1" }, maxBuffer: 8_000_000 });
    logs.push(`> node ${args.join(" ")}\n${result.stdout ?? ""}${result.stderr ?? ""}`);
    if (result.status !== 0) { throw new Error(`Consumer ${zod} failed (${result.status}): ${(result.stderr || result.stdout || String(result.error)).slice(-5000)}`); }
  }
  try {
    const npm = process.env.npm_execpath;
    if (!npm) throw new Error("Run through npm run verify:consumers");
    run([npm, "install", "--ignore-scripts", "--no-audit", "--no-fund", "--cache", join(root, ".npm-cache"), ...(process.argv.includes("--offline") ? ["--offline"] : [])]);
    run(["consumer-smoke.mjs"]);
    run([npm, "run", "build"]);
    results.push({ zod, cwd, status: "passed" });
    console.log(`Clean consumer ${zod}: installed tarball, SSR/prompt/protocol imports, typecheck and production bundle passed`);
  } finally { await writeFile(join(root, "artifacts", `consumer-zod-${zod}.log`), logs.join("\n")); }
}
const coreCwd = join(output, "core-only"); await mkdir(coreCwd, { recursive: true });
await writeFile(join(coreCwd, "package.json"), JSON.stringify({ name: "iui-core-only-consumer", private: true, type: "module", dependencies: { "@intelligent-ui/framework": `file:${tarball.replaceAll("\\", "/")}`, react: "19.2.3", "react-dom": "19.2.3", zod: "4.4.3" }, devDependencies: Object.fromEntries(["typescript", "@types/react", "@types/react-dom", "@types/node"].map(n => [n, lock.packages[`node_modules/${n}`].version])) }, null, 2));
await writeFile(join(coreCwd, "usage.tsx"), `import {IntelligentUIRenderer,createArtifact} from '@intelligent-ui/framework'; import {createSystemPrompt} from '@intelligent-ui/framework/prompt'; export const view=<IntelligentUIRenderer artifact={createArtifact('root = Text("Core")','core')}/>; export const prompt=createSystemPrompt();`);
await writeFile(join(coreCwd, "smoke.mjs"), `import assert from 'node:assert/strict'; import {createRequire} from 'node:module'; let requests=0; globalThis.fetch=async()=>{requests++;throw Error('Network denied')}; const React=await import('react');const {renderToString}=await import('react-dom/server');const {IntelligentUIRenderer,createArtifact}=await import('@intelligent-ui/framework'); const {createSystemPrompt}=await import('@intelligent-ui/framework/prompt');const {runBenchmark}=await import('@intelligent-ui/framework/benchmark'); assert.ok(renderToString(React.createElement(IntelligentUIRenderer,{artifact:createArtifact('root = Text("Core only")','core')})).includes('Core only')); assert.ok(createSystemPrompt().includes('Slider')); assert.equal((await runBenchmark([{id:'x',prompt:'x'}],async()=>'root = Text("OK")',{library:'core'}))[0].passed,true); assert.throws(()=>createRequire(import.meta.url).resolve('maplibre-gl'),{code:'MODULE_NOT_FOUND'});assert.equal(requests,0);console.log('Core SSR/types/prompt/benchmark passed without MapLibre installed');`);
const coreLogs = [];
for (const args of [[process.env.npm_execpath, "install", "--ignore-scripts", "--no-audit", "--no-fund", "--cache", join(root, ".npm-cache"), ...(process.argv.includes("--offline") ? ["--offline"] : [])], ["smoke.mjs"], ["node_modules/typescript/bin/tsc", "--noEmit", "--strict", "--types", "node", "--esModuleInterop", "--moduleResolution", "bundler", "--module", "esnext", "--target", "es2022", "--jsx", "react-jsx", "usage.tsx"]]) {
 const result = spawnSync(process.execPath, args, { cwd: coreCwd, encoding: "utf8", env: { ...process.env, OPENUI_TELEMETRY_DISABLED: "1" }, maxBuffer: 8_000_000 }); coreLogs.push((result.stdout ?? "") + (result.stderr ?? ""));
 await writeFile("artifacts/consumer-core-only.log", coreLogs.join("\n")); if (result.status !== 0) throw new Error(`Core-only consumer failed: ${coreLogs.at(-1)}`);
}
console.log("Core-only clean consumer passed without optional MapLibre installed");
await writeFile("artifacts/consumer-results.json", JSON.stringify({ tarball, sha256, node: process.version, results, coreOnly: { cwd: coreCwd, status: "passed", optionalMapLibreAbsent: true } }, null, 2));
