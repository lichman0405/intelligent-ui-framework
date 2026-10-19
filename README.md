# Intelligent UI Framework

Standalone React 19 components, streaming OpenUI Lang rendering, recoverable JSON state, controlled Host tools, and backend prompt generation. Official OpenUI Lang parser and React Renderer are runtime dependencies.

```sh
npm install --ignore-scripts ./artifacts/intelligent-ui-framework-0.2.0.tgz react@19 react-dom@19 zod@4
```

The package is delivered as a local tarball. Nothing has been published.

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

Run `npm run verify:upstream-browser` for the complete original gallery, real MapLibre worker and sandbox checks. `npm run bench:fixtures` streams all 45 programs through the official parser. `npm run bench -- --help` is not required: see the provider, saved-answer and OpenAI-compatible endpoint commands in [optional capabilities](docs/OPTIONAL_CAPABILITIES.md).

Runtime telemetry in the official OpenUI dependency is opt-in; installation telemetry is disabled by the commands above. Core remains 51 components. Explicit map/HTML/video registration provides all 55 original components under a separate signature. No registry publication, Git push, or Electron/Forge certification is claimed.
