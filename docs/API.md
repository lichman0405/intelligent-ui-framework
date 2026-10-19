# Public API 0.2.0

## Imports and versions

| Import | Runtime dependency boundary |
| --- | --- |
| `@intelligent-ui/framework` | React renderer plus protocol conveniences |
| `@intelligent-ui/framework/react` | React wrapper, registries, Host bridge |
| `@intelligent-ui/framework/protocol` | Pure JSON types/validation; no React or Zod import |
| `@intelligent-ui/framework/prompt` | Generated LibrarySpec + official lang-core prompt generator; no React import |
| `@intelligent-ui/framework/styles.css` | Explicit component/theme/KaTeX styles and packaged font assets |

`PACKAGE_VERSION = 0.2.0`, `PROTOCOL_VERSION = 1.0`, `LIBRARY_VERSION = 0.1.0`. Core signatures remain compatible. Explicit Host registration supports custom IDs/versions and the complete `upstream@0.1.0` library. See `OPTIONAL_CAPABILITIES.md` for `/plugins/map`, `/plugins/html`, `/plugins/upstream`, `/adapters`, `/gallery` and `/benchmark` exports.

## Artifact and validation

`UIArtifactV1`, `UIActionContext`, `UIHostAction`, and the original Host callback signatures implement `03_CONTRACT_V1.md`. Wire fields were not renamed or repurposed.

```ts
const result = validateArtifact(untrustedJson);
if (result.success) render(result.data);
else showFallback(result.errors);
const artifact = createArtifact(source, "stable-artifact-id", state);
```

`validateArtifact` returns `{success:true,data}` with a defensive JSON copy, or `{success:false,errors}`. It validates kind, protocol, library signature, semantic version, strings, metadata, JSON state, and limits. `validateJSON` and `validateState` are also public. The default limits are 1 MiB total JSON, 256 KiB source, 256 KiB state, depth 32, and 30,000 JSON nodes. Use `ArtifactValidationOptions.limits` to lower them. Standalone validators can accept an explicit `supportedLibraries` version map; the React wrapper accepts only signatures from the Host-supplied registry.

The renderer passes raw state unchanged in meaning. **Bound variables use `$` keys**: persist `{"$x":8}` rather than `{"x":8}`. Other keys contain OpenUI form-state records. The real fixture is `docs/fixtures/artifact-v1.json` (also tracked under tests). This replaces the handoff's illustrative example without changing the wire schema.

## React renderer

```tsx
<IntelligentUIRenderer
  artifact={artifact}
  isStreaming={false}
  hostAdapter={adapter}
  hostSessionId={session.id}
  hostTurnId={turn.id}
  theme="dark"
  themeTokens={{ "--iui-chart-1": "#0969da" }}
  onError={diagnostics => report(diagnostics)}
  fallback={<p>Interactive view unavailable.</p>}
/>
```

Accumulated `artifact.source` is forwarded to the official Renderer with `isStreaming`, `initialState = artifact.state`, `onAction`, `onStateUpdate`, `onError`, and an allowlisted `toolProvider`. Forward references, expressions, form state, Query and Mutation remain OpenUI runtime behavior. Keep Host adapter object identity stable with `useMemo` or module scope. A changed adapter disposes the previous capability bridge.

The lifecycle identity is `(artifactId, libraryId, libraryVersion, hostSessionId, hostTurnId, mode)`. Streaming updates within it preserve the mounted renderer; a changed identity remounts state and invalidates pending requests. `artifact.state` is initial hydration, not a controlled state prop. To reload a saved snapshot for the same identity, remount the component with a React `key`.

Final source is preflighted with the official parser before mounting a tool-capable view. Invalid artifacts, unknown components/functions, unresolved/incomplete final source and render errors produce a safe fallback. Streaming partial source remains previewable. Query/Mutation data-source failures stay in the view and are reported, so Host may offer retry. Diagnostic objects contain at least `code` and `message`; never parse message text as an API.

`createIuiLibrary({trustedExtras?,id?,plugins?})` creates an official OpenUI Library. `library` and `trustedLibrary` are stable instances. `createIuiRegistry(...{id,version,library})` supplies trusted registrations through the Renderer's `registry` prop; `validation.supportedLibraries` cannot override that registry. Default core excludes map/HTML; explicit plugins enable them. Create libraries and registries outside render loops.

## Host adapter

All original callbacks are optional. Default action/navigation/clipboard/network behavior is inert unless a capability is supplied. Host context comes exclusively from trusted React props.

Additive runtime capabilities in 0.1.0:

| Field | Behavior |
| --- | --- |
| `allowedTools?: readonly string[]` | Empty by default. Only explicitly named tools reach `invokeTool`. No raw MCP client is accepted by this wrapper |
| `resolveImage?(query, ctx)` | Returns `Promise<readonly {url:string;alt?:string}[]>`. Results are bounded and HTTP(S)-validated; absent/failing resolvers yield placeholders |
| `resolveRoute?(points, ctx)` | Map plugin road geometry in `[latitude,longitude]`; absent/failing capability yields direct connections |
| `onDispose?(ctx)` | Host notification to cancel its underlying requests when a bridge is replaced/unmounted |

`@ToAssistant` becomes `{kind:"continue_conversation",message,formState}`. Registered custom actions become `{kind:"custom_action",name,params}`. `CopyToClipboard` uses `copyText` when supplied. OpenUrl and rendered Markdown/Link clicks use `openUrl`; URLs with unsafe schemes or credentials are rejected. An unknown action is rejected.

`createHostBridge(adapter, context, options?)` is public for adapter tests. It exposes `toolProvider`, `dispatch`, `stateChanged`, and `dispose`; optional budgets default to 100 tool invocations, 4 concurrent calls and a 30-second response timeout per lifecycle. Identical concurrent tool requests and actions are coalesced. There is no persisted mutation-result cache: Host must enforce approval and durable idempotency. Disposal rejects outstanding framework promises; Host `onDispose` must cancel underlying I/O because the frozen `invokeTool` signature does not carry an AbortSignal. Timeout drops a late result; Host still owns cancellation of its native work.

## Prompt API

```ts
import { createSystemPrompt, getComponentSpec } from "@intelligent-ui/framework/prompt";
const spec = getComponentSpec();
const prompt = createSystemPrompt({
  bindings: true,
  tools: hostToolSpecs,
  additionalRules: ["Use the approved domain units."],
});
```

The spec is generated from `library.toSpec()` at build time. Tests detect drift between checked-in generated data and runtime component signatures. Prompt construction delegates to official `generateSystemPrompt`, imports no React components, and creates no model client or request. `getComponentSpec("trusted-extras")` and `createSystemPrompt(options,"trusted-extras")` target the explicitly enabled video registry. Prompt tool descriptions do **not** grant runtime permission; the Host allowlist still controls execution.
