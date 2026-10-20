# Host and MiQroForge Desktop integration

[中文](../zh-CN/HOST_INTEGRATION.md) · [Contents](README.md) · [Tool example](../examples/ToolApp.tsx)

## 1. Responsibilities and wiring

```text
Desktop model/Agent → UIArtifactV1 → IntelligentUIRenderer
  ↑ conversation events/state           ↓ named tools/data requests
Desktop sessions/storage ← UIHostAdapter → authorization/compute services
```

No additional skill process is required. Desktop registers components during its own startup and supplies a Host Adapter to its existing model/tool services. Generated IPC channel names, arbitrary file paths or executable commands must not replace controlled tool arguments.

## 2. Wire DTO

```json
{
  "kind": "intelligent_ui",
  "protocolVersion": "1.0",
  "artifactId": "message-1",
  "language": "openui-lang",
  "libraryId": "core",
  "libraryVersion": "0.1.0",
  "source": "$x = 4\nroot = Col([Slider($x, 0, 10), Text($x + \"\")])",
  "state": {"$x": 8},
  "metadata": {"title": "Example", "provenance": "mock-data"}
}
```

Call `validateArtifact(raw)` and use its defensive copy on success; show an ordinary message on failure. Default validation accepts core only; other libraries need an explicit `supportedLibraries` map. Renderer trusts its `registry`; `validation.supportedLibraries` cannot bypass registration.

Wire values must be finite JSON: no functions, Date/DOM objects, cycles, accessors or class instances. Trusted Renderer props carry session/turn identity; do not invent additional envelope fields. See the [frozen contract](../03_CONTRACT_V1.md).

## 3. Adapter callbacks

| Field | Integration contract |
| --- | --- |
| `allowedTools` | Explicit names; empty by default. invokeTool alone grants no tools |
| `invokeTool(name,args,ctx)` | Promise<JSONValue>; Host validates schema, project/resource ownership, permissions and approvals |
| `onAction(action,ctx)` | Route continue_conversation to existing chat; handle registered custom_action names |
| `onStateChange(state,ctx)` | Persist complete original state; synchronous notification, with an async persistence queue owned by Host |
| `openUrl(url,ctx)` | Host applies destination policy; Framework performs basic HTTP(S)/credential filtering |
| `copyText(text,ctx)` | Promise<boolean>; Host supplies browser/native clipboard capability |
| `resolveImage`/`resolveRoute` | Optional capabilities, supplied only when authorized |
| `onDispose(ctx)` | Cancel underlying requests/subscriptions for that session/turn/artifact |

Context is `{artifactId,hostSessionId?,hostTurnId?}`. Do not let distinct messages share ambiguous storage keys. Keep the adapter object stable.

## 4. Query and Mutation

`ToolApp.tsx` is a complete local teaching example with only demo_read/demo_save. Do not turn it into an unrestricted forwarding proxy. A real adapter also needs:

1. Input/output schema validation per tool.
2. Authorization from trusted user/project/job context, not identity fields supplied in a form.
3. Host approval before mutations or job submission.
4. Durable idempotency keys and audit records; Framework only coalesces identical requests while in flight.
5. Service-specific cancellation/timeouts; timeout does not prove an operation never occurred.

Defaults per bridge: 100 calls, 4 concurrent requests, 30s timeout; tool result limit 256 KiB/30,000 nodes. Stable `toolOptions` can adjust these. Larger tool budgets do not increase Artifact/state limits. Prefer bounded summaries and external result IDs.

## 5. Lifecycle and cancellation

Wire v1 invokeTool has no AbortSignal. Host can index controllers/IPC request IDs by context and cancel them in onDispose. Framework timeout ends waiting and discards late results; it cannot undo a remote computation. Old requests must not overwrite a new message.

Preserve resolver cleanup when composing capabilities:

```ts
const web = createWebResolvers();
const adapter: UIHostAdapter = {
  ...web,
  onDispose(ctx) {
    web.onDispose?.(ctx);
    hostRequests.cancelFor(ctx); // Host-owned service, not a Framework API
  },
};
```

This wiring fragment requires Desktop to implement hostRequests. An empty cancellation callback is not a working compute cancellation mechanism.

## 6. Storage adapter

```ts
import { createArtifactStore } from "@intelligent-ui/framework/adapters";
const store = createArtifactStore(window.localStorage);
const ctx = { artifactId: "message-1", hostSessionId: "s1", hostTurnId: "t1" };
store.save(artifact, ctx);
store.saveState({ "$x": 8 }, ctx);
const restored = store.load(ctx); // invalid/missing/corrupt → null
store.remove(ctx);
```

Access window.localStorage only on the client; SSR/Desktop services can provide a Storage-like implementation. Full registries require `createArtifactStore(storage,{supportedLibraries:registry.supportedLibraries})`. Save an Artifact before saveState. Writes may throw and need user feedback. saveState uses the store method's `this`; do not call it as a detached destructured function.

Production persistence can use Desktop's existing database with the same validation/identity/version rules. No upstream browser chat-thread mechanism is required.

## 7. Integration acceptance

- Same artifactId reused in separate sessions remains isolated.
- Markdown, unsupported signatures and invalid source fall back to ordinary messages.
- Prompt tool descriptions agree with the actual allowlist.
- Restore/replay/unmount do not automatically resubmit computations.
- Permissions, timeouts, cancellation and expired resources have feedback; sensitive errors stay in Host logs.
- Test maps, image origins, iframes and offline resources in the real target Desktop. Framework browser evidence does not replace Desktop acceptance.
