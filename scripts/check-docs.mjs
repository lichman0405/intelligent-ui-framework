import { readFile, writeFile, readdir, mkdir, access } from "node:fs/promises";
import { resolve, dirname, relative, extname } from "node:path";
import { execFileSync } from "node:child_process";
import ts from "typescript";
import { build } from "esbuild";
import { pathToFileURL } from "node:url";
import { createParser } from "@openuidev/lang-core";
import { upstreamRegistration } from "../dist/plugins/upstream.js";
const root = resolve("."), problems = [], checked = [];
async function walk(path) { const files = []; for (const entry of await readdir(path, { withFileTypes: true })) { if ([".vitepress", "public"].includes(entry.name)) continue; const full = resolve(path, entry.name); if (entry.isDirectory()) files.push(...await walk(full)); else files.push(full); } return files; }
const cn = (await readdir("docs/zh-CN")).filter(p=>p.endsWith(".md")).sort();
const en = (await readdir("docs/en")).filter(p=>p.endsWith(".md")).sort();
if (JSON.stringify(cn)!==JSON.stringify(en)) problems.push("Language chapter lists differ");
const files = [resolve("README.md"), ...(await walk(resolve("docs"))).filter(p=>extname(p)===".md")];
let links = 0, programs = 0, jsonBlocks = 0;
const parser = createParser(upstreamRegistration.library.toJSONSchema(), upstreamRegistration.library.root);
for (const path of files) {
 const source = await readFile(path,"utf8");
 for (const match of source.matchAll(/\[[^\]\n]*\]\(<?([^\s)>]+)>?\)/g)) {
  const href = match[1]; if (/^[a-z][a-z0-9+.-]*:/i.test(href)||href.startsWith("#")) continue;
  const target = resolve(dirname(path), decodeURIComponent(href.split("#")[0])); links++;
  try { await access(target); } catch { problems.push(`${relative(root,path)}: missing ${href}`); }
 }
 if (!/[\\/](zh-CN|en)[\\/]/.test(path)) continue;
 const fences = source.match(/^```[^\n]*$/gm) ?? []; if (fences.length%2) problems.push(`${relative(root,path)}: unbalanced fences`);
 for(const match of source.matchAll(/^```(openui|json|text)\s*\n([\s\S]*?)^```\s*$/gm)) {
  const [, language, text] = match;
  if(language==="json") { jsonBlocks++; try { JSON.parse(text); } catch(error) { problems.push(`${relative(root,path)}: invalid JSON: ${error.message}`); } }
  else if(language==="openui"||/^root\s*=|\nroot\s*=/m.test(text)) {
   programs++; const result=parser.parse(text); if(result.meta.incomplete||result.meta.unresolved.length||result.meta.errors.some(e=>e.severity!=="warning")) problems.push(`${relative(root,path)}: invalid OpenUI example`);
  }
 }
 checked.push(relative(root,path));
}
// Compile the shared modules against public exports, with strict consumer types.
const examples = (await readdir("docs/examples")).filter(p=>p.endsWith(".tsx")).map(p=>`docs/examples/${p}`);
let types = "not-run";
try { execFileSync(process.execPath,[resolve("node_modules/typescript/bin/tsc"),"--noEmit","--strict","--skipLibCheck","false","--jsx","react-jsx","--moduleResolution","bundler","--module","esnext","--target","es2022","--esModuleInterop","--types","node",...examples],{stdio:"pipe",encoding:"utf8"}); types="passed"; }
catch(error) { types="failed"; problems.push(String(error.stdout||error.stderr||error.message)); }
// Syntax-check literal Artifact sources in examples. The custom library needs its own schema.
let literalExamples=0;
await mkdir(".build",{recursive:true});
await build({entryPoints:["docs/examples/CustomPlugin.tsx"],outfile:".build/docs-custom.mjs",bundle:true,format:"esm",platform:"node",packages:"external",logLevel:"warning",plugins:[{name:"documentation-css",setup(b){b.onResolve({filter:/\.css$/},args=>({path:args.path,namespace:"documentation-css"}));b.onLoad({filter:/.*/,namespace:"documentation-css"},()=>({contents:"",loader:"js"}));}}]});
const {customLibrary}=await import(pathToFileURL(resolve(".build/docs-custom.mjs")).href);
const customParser=createParser(customLibrary.toJSONSchema(),customLibrary.root);
for(const file of examples) {
 const source=ts.createSourceFile(file,await readFile(file,"utf8"),ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX);
 function visit(node) { if(ts.isCallExpression(node)&&node.expression.getText(source)==="createArtifact") { const first=node.arguments[0]; if(first&&(ts.isStringLiteral(first)||ts.isNoSubstitutionTemplateLiteral(first))) { literalExamples++;const result=(file.endsWith("CustomPlugin.tsx")?customParser:parser).parse(first.text);if(result.meta.incomplete||result.meta.errors.some(e=>e.severity!=="warning"))problems.push(`${file}: invalid literal Artifact`); } } ts.forEachChild(node,visit); }
 visit(source);
}
await mkdir("artifacts",{recursive:true});
const report={date:"2026-10-20",scope:"documentation and shared examples only; not a rerun of runtime acceptance",chaptersPerLanguage:cn.length,markdownFiles:files.length,localLinksChecked:links,openuiBlocks:programs,jsonBlocks,literalArtifactExamples:literalExamples,sharedExamples:examples.length,strictTypes:types,problems,status:problems.length?"failed":"passed"};
await writeFile("artifacts/documentation-checks.json",JSON.stringify(report,null,2));
console.log(report); if(problems.length) process.exitCode=1;
