import { mkdir, cp, writeFile, readFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { spawnSync } from "node:child_process";
import { createHash } from "node:crypto";
const root = resolve(".");
const tarball = resolve("artifacts/intelligent-ui-framework-0.1.0.tgz");
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
  await writeFile(join(cwd, "package.json"), JSON.stringify({ name: `iui-clean-consumer-${zod}`, private: true, type: "module", scripts: { build: "tsc --noEmit && vite build" }, dependencies: { "@intelligent-ui/framework": `file:${tarball.replaceAll("\\", "/")}`, react: "19.2.3", "react-dom": "19.2.3", zod }, devDependencies }, null, 2));
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
await writeFile("artifacts/consumer-results.json", JSON.stringify({ tarball, sha256, node: process.version, results }, null, 2));
