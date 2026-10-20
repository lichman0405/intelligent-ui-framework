# Quickstart

[中文](../zh-CN/QUICKSTART.md) · [Contents](README.md)

## 1. Requirements and installation

Use React 19, ESM and a build tool that supports CSS imports. The lowest verified Node version for project builds is 22.12.0. Existing acceptance uses Vite; this guide does not establish support for React 18, CommonJS or every SSR platform.

The package is a local tarball, not a published registry release. Copy it into the consumer's `vendor/` directory:

```sh
npm install --ignore-scripts ./vendor/intelligent-ui-framework-0.2.0.tgz react@19 react-dom@19 zod@4
```

An existing Zod 3.25.76 consumer may retain that version because it provides `zod/v4`. Custom components still need v4 schemas; do not pass v3 schema instances to definitions expecting v4. `--ignore-scripts` skips dependency installation scripts. `OPENUI_TELEMETRY_DISABLED=1` also disables the dependency's installation telemetry.

## 2. Start an empty React application

Skip scaffolding if you already have a React 19 application. The following command downloads a Vite template; it is not a required Framework runtime service:

```sh
npm create vite@7 iui-consumer -- --template react-ts
cd iui-consumer
npm install
```

Copy the tarball into `vendor/` and run the package installation command above. Copy the complete [BasicApp.tsx](../examples/BasicApp.tsx) to `src/App.tsx`. Use this entry in the template's `src/main.tsx`:

```tsx
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
```

Remove template-only centering/fixed-width rules from `App.css`/`index.css` so they do not constrain your layout. Framework does not require the template styles. Run:

```sh
npm run dev
```

Acceptance: moving the slider updates `Selected`; Continue logs `continue_conversation` with form state and Host context; no model request occurs.

## 3. Meaning of the minimal integration

```tsx
import { IntelligentUIRenderer, createArtifact } from "@intelligent-ui/framework";
import "@intelligent-ui/framework/styles.css";
const artifact = createArtifact('root = Text("Hello")', "message-1");
// Use inside a React render:
<IntelligentUIRenderer artifact={artifact} hostSessionId="session-1" hostTurnId="turn-1" />;
```

`artifact.source` is OpenUI Lang text, not JSX, HTML or arbitrary JavaScript. The envelope is JSON. Do not automatically promote Markdown fences into executable UI. Trusted Host code determines artifact, session and turn identities.

## 4. Run the complete source Demo

From the independent Framework repository root:

```sh
npm ci --ignore-scripts
npm run build
npm run demo
```

Open `http://127.0.0.1:5173`. The initial page has 16 framework examples; Original gallery opens 45 original programs. Exercise themes, source editing, mock streaming, state save/restore and Query/Mutation. Image/route services and public basemap tiles have separate opt-in switches.

The Demo and build scripts belong to the source distribution. Installing the npm package does not install a standalone Demo into your application. Do not run repository-only npm scripts from a consumer directory.

## 5. Choose a complete example

- [StreamingState](../examples/StreamingState.tsx): chunks, cancellation and memory save/restore without a model.
- [ToolApp](../examples/ToolApp.tsx): Query loads automatically; a button explicitly runs the mock Mutation.
- [CustomPlugin](../examples/CustomPlugin.tsx): define/register a component, function and action.
- [OptionalApp](../examples/OptionalApp.tsx): full registry, map and HTML; requires the optional map dependency and parent CSP.

These teaching modules are not Desktop authorization policies. Read [Host integration](HOST_INTEGRATION.md) before connecting real services.
