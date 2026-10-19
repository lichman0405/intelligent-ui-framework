import { build } from "esbuild";
import { cp, mkdir, writeFile } from "node:fs/promises";
import { execFileSync } from "node:child_process";
import { resolve } from "node:path";

await mkdir(".build", { recursive: true });
await build({ entryPoints: ["src/react/library.ts"], outfile: ".build/library.mjs", bundle: true, platform: "node", format: "esm", packages: "external", logLevel: "warning" });
const { library, trustedLibrary } = await import(new URL(`../.build/library.mjs?${Date.now()}`, import.meta.url));
await writeFile("src/generated/library-spec.json", JSON.stringify(library.toSpec(), null, 2) + "\n");
await writeFile("src/generated/trusted-library-spec.json", JSON.stringify(trustedLibrary.toSpec(), null, 2) + "\n");
await mkdir("docs/fixtures", { recursive: true });
await cp("tests/fixtures/artifact-v1.json", "docs/fixtures/artifact-v1.json");
await build({ entryPoints: ["src/index.ts", "src/react/index.ts", "src/protocol/index.ts", "src/prompt/index.ts"], outdir: "dist", bundle: true, format: "esm", platform: "neutral", packages: "external", splitting: true, sourcemap: true, target: "es2022", logLevel: "warning" });
await build({ entryPoints: ["src/styles.css"], outfile: "dist/styles.css", bundle: true, loader: { ".woff": "file", ".woff2": "file", ".ttf": "file" }, assetNames: "assets/[name]-[hash]", logLevel: "warning" });
execFileSync(process.execPath, [resolve("node_modules/typescript/bin/tsc"), "--emitDeclarationOnly"], { stdio: "inherit" });
console.log(`Built framework: ${Object.keys(library.components).length} core components, ${Object.keys(library.functions).length} functions`);
