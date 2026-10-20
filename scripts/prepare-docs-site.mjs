import { cp, mkdir, readdir, writeFile } from "node:fs/promises";
import { resolve, join, relative, extname } from "node:path";
const docs = resolve("docs"), downloads = resolve("docs/public/downloads");
await mkdir(downloads, { recursive: true });
let count = 0;
async function walk(path) {
  for (const entry of await readdir(path, { withFileTypes: true })) {
    if (entry.name.startsWith(".") || entry.name === "public") continue;
    const file = join(path, entry.name);
    if (entry.isDirectory()) await walk(file);
    else if ([".tsx", ".json", ".txt"].includes(extname(file))) { const target = join(downloads, relative(docs, file)); await mkdir(resolve(target, ".."), { recursive: true }); await cp(file, target); count++; }
  }
}
await walk(docs);
await writeFile("docs/public/.nojekyll", "");
console.log(`Prepared ${count} example/schema/license downloads for the documentation site`);
