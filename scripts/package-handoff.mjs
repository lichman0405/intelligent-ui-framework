import { cp, mkdir, readFile, writeFile, readdir } from "node:fs/promises";
import { resolve, relative, join } from "node:path";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
const root=resolve("."), date="2026-10-20", stage=resolve("artifacts",`handoff-0.2.0-${date}`), archive=stage+".zip";
const baseline=JSON.parse(await readFile("artifacts/delivery-verification.json","utf8"));
const documentation=JSON.parse(await readFile("artifacts/documentation-checks.json","utf8"));
const tarball="intelligent-ui-framework-0.2.0.tgz";
const digest=buffer=>createHash("sha256").update(buffer).digest("hex");
if(digest(await readFile(`artifacts/${tarball}`))!==baseline.sha256)throw Error("Verified tarball hash changed");
if(documentation.status!=="passed")throw Error("Documentation checks have not passed");
if(process.platform!=="win32")throw Error("This handoff archiver uses native Windows .NET ZIP support");
await mkdir(stage,{recursive:true}); // Reuse the fixed generated staging folder; never recursively delete it.
for(const path of ["src","dist","docs","examples","tests","scripts","tools","package.json","package-lock.json","tsconfig.json","vitest.config.ts","README.md","LICENSE","THIRD_PARTY_NOTICES.md",".gitignore",".gitattributes"])await cp(path,join(stage,path),{recursive:true});
await mkdir(join(stage,"artifacts"));
const evidence=[tarball,"delivery-verification.json","documentation-checks.json","pack.json","consumer-results.json","browser-results.json","upstream-browser-results.json","adapter-live-results.json","npm-audit-production.json","reproducibility.json","node22-validation.log","node26-validation.log","consumer-core-only.log"];
for(const path of evidence)await cp(join("artifacts",path),join(stage,"artifacts",path));
await cp("artifacts/benchmark",join(stage,"artifacts/benchmark"),{recursive:true});
await writeFile(join(stage,"HANDOFF.md"),`# Developer handoff / 开发交付\n\nDate / 日期: ${date}. Runtime / 运行时: @intelligent-ui/framework@0.2.0.\n\n- [中文手册](docs/zh-CN/README.md)\n- [English handbook](docs/en/README.md)\n- [中文原生 UI 路线](docs/zh-CN/ROADMAP.md) / [English roadmap](docs/en/ROADMAP.md)\n\nThis archive contains source, built runtime, bilingual manuals, examples, the unchanged verified tarball, and baseline evidence. No additional skills are required. Scientific widgets are roadmap work, not existing 0.2.0 exports.\n\n本包包含源码、已构建运行时、完整双语手册、示例、未修改的已验收 tarball 和基线证据。无需额外 skill。科学领域组件属于后续原生 UI 升级，不是已实现的 0.2.0 导出。\n\nTarball SHA-256: \`${baseline.sha256}\`. Baseline runtime commit: \`${baseline.commit}\`. Historical runtime evidence retains original machine paths; it is not a new Desktop acceptance run.\n\n原有运行时报告保留原机器路径，不能作为新 Desktop 集成环境的已执行验收。本次只增加文档和文档检查工具，原 tgz 内的旧文档没有被修改；新版手册见本包 docs。\n\nFrom this source root / 在本源码根目录: \`npm ci --ignore-scripts\`, \`npm run build\`, \`npm run demo\`. Documentation tooling / 文档工具: \`node scripts/build-docs.mjs\`, \`node scripts/check-docs.mjs\`.\n`);
const records=[];
async function walk(path){for(const entry of await readdir(path,{withFileTypes:true})){const file=join(path,entry.name);if(entry.isDirectory())await walk(file);else{const bytes=await readFile(file);records.push({path:relative(stage,file).replaceAll("\\","/"),bytes:bytes.length,sha256:digest(bytes)});}}}
await walk(stage); records.sort((a,b)=>a.path.localeCompare(b.path));
await writeFile(join(stage,"MANIFEST.json"),JSON.stringify({date,runtimeVersion:"0.2.0",runtimeTarballSha256:baseline.sha256,baselineCommit:baseline.commit,sourceCommit:execFileSync("git",["rev-parse","HEAD"],{encoding:"utf8"}).trim(),documentationStatus:documentation.status,files:records},null,2));
const quote=value=>"'"+value.replaceAll("'","''")+"'";
execFileSync("powershell.exe",["-NoLogo","-NoProfile","-NonInteractive","-Command",`Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::CreateFromDirectory(${quote(stage)}, ${quote(archive)}, [System.IO.Compression.CompressionLevel]::Optimal, $true)`],{stdio:"inherit"});
const report={archive,sha256:digest(await readFile(archive)),files:records.length+1,runtimeTarballSha256:baseline.sha256,documentationStatus:documentation.status};
await writeFile("artifacts/handoff-package.json",JSON.stringify(report,null,2));console.log(report);
