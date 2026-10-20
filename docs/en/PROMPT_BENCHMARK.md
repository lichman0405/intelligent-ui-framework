# Prompt, Gallery and benchmark

[中文](../zh-CN/PROMPT_BENCHMARK.md) · [Contents](README.md)

## 1. Backend Prompt API

```ts
import { createSystemPrompt, getComponentSpec } from "@intelligent-ui/framework/prompt";
const spec = getComponentSpec("core");
const system = createSystemPrompt({ tools: [], additionalRules: ["Use supplied data only."] }, "core", "chat");
```

This entry imports no React, creates no provider client and sends no requests. Argument two is core/trusted-extras/upstream or a serialized LibrarySpec; argument three is chat/dashboard. getComponentSpec returns a defensive copy.

Defaults preserve the original composition, spacing, reactive computation, SVG and date rules with three examples. Dashboard adds demonstration tool schemas and a dashboard example. **Override tools with actual Host schemas** for real integration; demo get_orders must not mislead the model. Raw promptOptions/dashboardPromptOptions and four example strings are also exported.

## 2. Keep model output aligned with the registry

```ts
const system = createSystemPrompt({ tools: permittedToolSpecs }, "upstream", "chat");
// Supply system to Desktop's existing model transport; consume the OpenUI source portion.
```

permittedToolSpecs is Host-owned. A full-library Prompt needs an upstream Artifact and matching registry. Serialize custom `library.toSpec()` once and load that JSON in the backend, rather than importing frontend components just to obtain a spec. Prompt descriptions grant no permission; allowedTools and Host services enforce execution.

Desktop decides when to use UI mode; ordinary knowledge answers may remain Markdown. Framework should not create a second Agent loop. Future scientific components also need unit/structure/selection/data-reference rules; current generic prompts do not establish scientific native UI support.

## 3. Gallery

```ts
import { galleryPrograms, createGalleryArtifact, demoTools, demoToolSpecs } from "@intelligent-ui/framework/gallery";
const example = galleryPrograms[0];
const artifact = createGalleryArtifact(example.id);
```

45 original programs: 19 component, 4 composition, 18 tool and 4 Prompt examples. Each has id/title/note/code/category/capabilities. Capability metadata marks map/html/video/tools; it is not a complete authorization declaration (images can still require services). Gallery Artifacts use upstream and need explicit registration.

demoTools generates synthetic date-relative data, not scientific/business results. The 16 framework acceptance samples belong to the source Demo and are separate.

## 4. Provider-neutral benchmark API

```ts
import { runBenchmark } from "@intelligent-ui/framework/benchmark";
const results = await runBenchmark([{ id: "hello", prompt: "Show a greeting" }],
  async function* ({ signal }) {
    if (signal.aborted) return;
    yield 'root = ';
    yield 'Text("Hello")';
  }, { library: "core", timeoutMs: 60000, maxSourceBytes: 262144 });
```

Providers receive `{prompt,system,signal}` and return a Promise of text or an async iterable of text. Results contain id/source/passed/chunks/elapsedMs/errors. Execution is sequential by default, with timeout/output-size/parser diagnostics. Custom libraries need matching library spec, schema and root. Optional signal/onResult are available.

Passing means official syntax validation, not scientific correctness, visual quality or model reliability. Browser interactions are validated separately.

## 5. Source-repository CLI

```sh
npm run build
npm run bench:fixtures
npm run bench -- --answers ./saved-model-answers --only bicycle
npm run bench -- --provider ./my-provider.mjs --only bicycle
npm run bench -- --model MODEL_ID --base-url https://provider.example/v1 --key-env BENCH_API_KEY
```

Read real keys from named environment variables, never frontend/Artifact/source/result files. A provider module default export uses the same neutral signature. The SSE CLI targets OpenAI-compatible chat/completions, not every provider protocol; use a provider module for alternatives.

The original 24 model cases are in tools/bench/prompts.json; fixture mode uses 45 Gallery IDs. Saved answers must be named `<case-id>.oui`; do not mix the ID namespaces. --only filters IDs and --out changes output. Default answers/results are under ignored artifacts/benchmark. CLI is source-repository tooling, not an npm executable bin.

The existing 45 fixture results are deterministic mock streams. Without endpoint/key configuration, they do not establish live model acceptance.
