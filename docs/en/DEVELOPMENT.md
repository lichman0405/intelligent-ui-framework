# Development and versioning

[中文](../zh-CN/DEVELOPMENT.md) · [Contents](README.md) · [Complete extension example](../examples/CustomPlugin.tsx)

## 1. Layout and public boundaries

| Directory | Responsibility |
| --- | --- |
| src/protocol | Pure JSON DTOs, validation and versions |
| src/react | Renderer, Host bridge, core registry/functions/components |
| src/plugins | Map, isolated HTML and full upstream registration |
| src/prompt / src/generated | Prompt API and specs/schemas generated from real libraries |
| src/adapters | Optional network/storage/browser ports |
| src/gallery / src/benchmark | Example data and provider-neutral validation |
| examples/vite-react-demo | Interactive Demo using public package imports |
| tests / scripts | Checks, builds, independent consumers and browser acceptance |

Consumers import package exports, not private src/dist chunks/.build files. Plugins must not access internal HostContext to obtain privileged capabilities. Declare the official `@openuidev/react-lang@1.0.0` dependency directly in an application that imports defineComponent, rather than relying on accidental dependency hoisting.

## 2. Components, functions and actions

CustomPlugin.tsx runs as an App and demonstrates Measurement, Twice and Inspect. Measurement is a teaching component that displays a supplied unit; **it is not a scientific units engine or a shipped materials widget**.

1. Define props with official defineComponent and zod/v4.
2. Use defineFunction for bounded local computation, with empty/invalid input handling and no rendering stalls.
3. Register Host requests through defineAction with named JSON parameters; an existing Button can trigger the action plan.
4. Put definitions in IuiPlugin components/functions/actions and call createIuiLibrary({id,plugins}).
5. Register a specific {id,version,library} using createIuiRegistry and create an Artifact with that signature.
6. Export matching spec/schema, Prompt and runnable Gallery examples.

Plugins are trusted application code, never Artifact/model/network JSON. Duplicate names are rejected. Avoid collisions with component names and official runtime built-ins as well.

## 3. Reactive custom controls

Inputs need reactive schemas and useStateField. React useState alone does not participate in OpenUI state restoration. This definition fragment uses the registration pattern from the complete example:

```tsx
import { defineComponent, reactive, useStateField } from "@openuidev/react-lang";
import { useId } from "react";
import { z } from "zod/v4";
const Stepper = defineComponent({
  name: "Stepper", description: "Increase a bound value locally",
  props: z.object({ value: reactive(z.number()) }),
  component: ({ props, statementId }) => {
    const fallback = useId();
    const field = useStateField(statementId ?? fallback, props.value);
    return <button onClick={() => field.setValue(Number(field.value ?? 0) + 1)}>{String(field.value)}</button>;
  },
});
```

After registration, use `$n = 0` and `Stepper($n)`. Give restorable selections/zoom/frame indices explicit bindings. Job status and authorization outcomes are authoritative Host data, not locally editable truth.

Use the official action mechanism or controlled Host capabilities for effects, not an independent tool loop. Initialize third-party renderers in effects; destroy event listeners/WebGL/workers/timers on cleanup and discard obsolete async results.

## 4. Custom Prompt and backend

```ts
const spec = customLibrary.toSpec();
const schema = customLibrary.toJSONSchema();
// Serialize these for Host loading; do not send functions or React components.
```

The backend imports /prompt and calls createSystemPrompt(options,spec). Custom benchmarks also need the matching schema/root/spec. Changes to argument order, enums, units or return structures need corresponding definitions, Prompt, schema, examples and version updates. npm run build regenerates shipped libraries; it does not turn arbitrary external libraries into default core.

## 5. Version rules

- Package version describes npm API/distribution; protocol version describes wire semantics; library ID/version describes OpenUI signatures.
- Use a distinct ID for custom libraries; do not label an extended library core@0.1.0.
- Registry matching is exact, not a version range/latest lookup. Retain old registrations or explicitly migrate saved Artifacts.
- Agree protocol breaking changes with integrators; do not silently add business fields to frozen v1.
- Future scientific schemas require their own versions and must preserve saved-session compatibility.

## 6. Commands and acceptance

In the Framework repository run npm ci --ignore-scripts, npm run typecheck, npm run build and npm test. Exercise npm run demo. Before distribution, pack and run independent consumer/browser acceptance; commands are in Deployment.

New controls need normal/empty/invalid/large/streaming/hydration/unmount/theme/keyboard/Host-failure coverage. Scientific controls additionally need unit/coordinate/selection-ID/sampling/precision/provenance validation. Fixture results must never be presented as real computations.

## 7. Built-in scientific UI constraints

Implementation packages may split or lazy-load code, but Desktop must ship required code/fonts/workers/schemas and default registration. Users open results and interact without skills, MCP plugins or a separate cloud site. Desktop's existing services execute computations; UI owns parameter editing, visualization, selection, comparison, export and controlled task actions. See the [roadmap](ROADMAP.md).
