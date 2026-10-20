# Intelligent UI Framework

## Developer documentation / 开发者文档

**Online / 在线：** [中文站](https://lichman0405.github.io/intelligent-ui-framework/zh-CN/) · [English site](https://lichman0405.github.io/intelligent-ui-framework/en/) · [GitHub](https://github.com/lichman0405/intelligent-ui-framework)

- [中文完整使用与开发手册](docs/zh-CN/README.md)
- [Complete English usage and development handbook](docs/en/README.md)
- [Native scientific UI roadmap / 原生科学 UI 路线](docs/zh-CN/ROADMAP.md) · [English roadmap](docs/en/ROADMAP.md)

The 2026-10-20 handbook update is delivered alongside the unchanged, verified 0.2.0 tarball. The dated handoff archive contains the expanded bilingual manuals and shared examples. Scientific components in the roadmap are planned native Desktop features, without additional skills; they are not implemented 0.2.0 exports.

2026-10-20 的手册更新与已验证的 0.2.0 tarball 配套交付；按日期生成的交付包包含完整双语文档与共用示例。路线图中的科学组件将作为 Desktop 原生功能交付，无需额外 skill；它们不是 0.2.0 已实现的导出。

Standalone React 19 components, streaming OpenUI Lang rendering, recoverable JSON state, controlled Host tools, and backend prompt generation. Official OpenUI Lang parser and React Renderer are runtime dependencies.

```sh
npm install --ignore-scripts ./artifacts/intelligent-ui-framework-0.2.0.tgz react@19 react-dom@19 zod@4
```

The npm package is delivered as a local tarball and has not been published to the npm registry. Source and documentation are hosted on GitHub.

```tsx
import { IntelligentUIRenderer, createArtifact } from "@intelligent-ui/framework";
import "@intelligent-ui/framework/styles.css";

const artifact = createArtifact(
  '$x = 4\nroot = Col([Title("Example", "md"), Slider($x, 0, 10), Text("Selected: " + $x)])',
  "message-ui-1"
);
const snapshots = new Map();

<IntelligentUIRenderer artifact={artifact} hostSessionId="session-1"
  hostAdapter={{ onStateChange: (state, ctx) => snapshots.set(ctx.artifactId, state) }} />;
```

Accumulate model chunks into `artifact.source` and pass `isStreaming`. Keep `artifactId`, `hostSessionId`, and `hostTurnId` stable during a message. Persist the exact state map received by `onStateChange` (including `$` prefixes) and restore it through `artifact.state` before mounting.

```ts
import { validateArtifact } from "@intelligent-ui/framework/protocol";
import { createSystemPrompt, getComponentSpec } from "@intelligent-ui/framework/prompt";
const prompt = createSystemPrompt({ bindings: true, tools: myAllowedToolSpecs });
```

Tools are denied by default. To opt in, provide both `allowedTools: ["list_rows"]` and `invokeTool`. Host must validate arguments, permissions, approval, and mutation idempotency. No model client, private key, or conversation loop is included.

Run locally on Windows with Node/npm:

```sh
npm ci --ignore-scripts
npm run build
npm test
npm run demo
```

The Demo at `http://127.0.0.1:5173` contains 16 framework examples and a link to all 45 original programs, mock dashboard tools, streaming, an editable source preview, state save/reload, and themes. It requires no LLM key. External image/route services and public basemap tiles have separate explicit switches. See [API](docs/API.md), [optional capabilities](docs/OPTIONAL_CAPABILITIES.md), [security](docs/SECURITY.md), [compatibility](docs/COMPATIBILITY.md), and [progress](docs/PROGRESS.md).

Use `npm run verify:consumers -- --both` after `npm pack --pack-destination artifacts`, then `npm run verify:browser` with an installed Chrome/Edge. The consumer script creates fresh directories named from the tarball hash outside this repository, installs only the tarball/public dependencies and checks both Zod peer versions.

Run `npm run verify:upstream-browser` for the complete original gallery, real MapLibre worker and sandbox checks. `npm run bench:fixtures` streams all 45 programs through the official parser. See the provider, saved-answer and OpenAI-compatible endpoint commands in [Prompt and benchmark](docs/en/PROMPT_BENCHMARK.md).

Runtime telemetry in the official OpenUI dependency is opt-in; installation telemetry is disabled by the commands above. Core remains 51 components. Explicit map/HTML/video registration provides all 55 original components under a separate signature. npm registry publication and Electron/Forge certification have not been performed.

## Documentation website / 文档站

```sh
npm run docs:dev
npm run docs:build
npm run docs:preview
```

Edit paired Markdown under `docs/zh-CN` and `docs/en`. `docs:generate` refreshes API/Gallery from the built library; `docs:check` validates links, examples and language parity. Default-branch changes are published by `.github/workflows/docs-pages.yml`. See [Pages setup](docs/en/PAGES.md) / [文档站维护](docs/zh-CN/PAGES.md).
