# Intelligent UI Framework

Standalone React 19 components, streaming OpenUI Lang rendering, recoverable JSON state, controlled Host tools, and backend prompt generation. Official OpenUI Lang parser and React Renderer are runtime dependencies.

```sh
npm install @intelligent-ui/framework react@19 react-dom@19 zod@4
```

For the local deliverable, install `artifacts/intelligent-ui-framework-0.1.0.tgz` instead of a registry package. Nothing has been published.

```tsx
import { IntelligentUIRenderer, createArtifact } from "@intelligent-ui/framework";
import "@intelligent-ui/framework/styles.css";

const artifact = createArtifact(
  '$x = 4\nroot = Col([Title("Example", "md"), Slider($x, 0, 10), Text("Selected: " + $x)])',
  "message-ui-1"
);

<IntelligentUIRenderer artifact={artifact} hostSessionId="session-1"
  hostAdapter={{ onStateChange: (state, ctx) => saveState(ctx.artifactId, state) }} />;
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

The Demo at `http://127.0.0.1:5173` contains 16 local examples, mock tools, streaming, state save/reload, and themes. It requires no LLM key. See [API](docs/API.md), [security](docs/SECURITY.md), [compatibility](docs/COMPATIBILITY.md), [provenance](docs/SOURCE_MAP.md), and [progress](docs/PROGRESS.md) for the delivery details and limitations.
