# OpenUI, streaming and state

[中文](../zh-CN/STREAMING_STATE.md) · [Contents](README.md) · [Complete example](../examples/StreamingState.tsx)

## 1. OpenUI essentials

```text
$count = 4
root = Col([Slider($count, 0, 10), Text("Count: " + $count), Button("More", @Set($count, @Clamp($count + 1, 0, 10)))])
```

- `$count` is a mutable binding; initialize bindings with literals. Events use `@Set`; derived expressions update automatically.
- `root` is the rendered entry; statements support forward references. Components take positional arguments; see the [reference](REFERENCE.md).
- `@` introduces functions/actions. Local expressions require no model inference.
- Some functions such as `@Set`, `@Each`, `@Filter` and `@Run` are official runtime capabilities, outside the count of 59 library-defined functions.
- `Query` performs external reads; `Mutation` requires explicit `@Run`. Host authorizes real effects.

## 2. Chunk rules

Renderer takes **accumulated source**. Append transport deltas; replace complete snapshots instead of appending them again. Do not assign a new artifact ID to each chunk or use source text as the React key.

```ts
let accumulated = "";
for await (const delta of hostTextStream) {
  accumulated += delta;
  updateArtifact({ ...currentArtifact, source: accumulated });
}
```

This is transport pseudocode; `StreamingState.tsx` is the complete implementation. Set `isStreaming=true` at start and false at completion. Final syntax is checked: unknown components, invalid syntax and unresolved forward references produce fallback. Partial source remains previewable; HtmlView scripts stay dormant until streaming completes.

## 3. Identity and lifecycle

Keep `(artifactId, libraryId, libraryVersion, hostSessionId, hostTurnId, mode)` stable within a message. Use new trusted identities for a different message/session. Keep `hostAdapter`, `registry` and `toolOptions` stable with module constants or `useMemo`, rather than rebuilding them for each streaming frame.

Changing the adapter replaces the capability bridge and cleans up its requests; a different registry instance also replaces the bridge. Never silently change component signatures under the same library ID/version. Use an explicit React key when a configuration change requires a full remount.

## 4. Cancellation, ordering and unmount

Host terminates its SSE/IPC subscription; Framework creates no second model transport. Use an AbortController and generation number to prevent old chunks from reaching a new message. Unsubscribe/abort on unmount. The complete example implements both guards.

An interrupted partial program marked non-streaming may fall back. Your product can instead retain the last complete snapshot or show plain text. Do not label truncated source as a successful final result. `onDispose(ctx)` cancels Host tool/resolver work; it does not automatically cancel the Host's text stream.

## 5. Save and restore

`onStateChange` returns serializable state. Preserve the **entire object and original keys**, for example `{"$count":8}`; do not rename it to `{"count":8}` or persist only part of the field state.

Store it with session/turn/artifact identity. `artifact.state` hydrates the first mount; it is not a controlled state prop. To restore the same message: load state → create Artifact → remount with a new React key. Changing `state` alone does not guarantee rehydration.

```tsx
const restored = createArtifact(source, artifactId, savedState);
<IntelligentUIRenderer key={restoreRevision} artifact={restored} hostAdapter={stableHost} />;
```

The memory example does not survive a page refresh. Use the Host chapter's `createArtifactStore` for persistence. Form state is not authentication or permission evidence. Restoring state must not automatically run mutations; Host still needs idempotency for retries, repeated clicks and cross-process replay.

## 6. Large scientific data

Default limits are 256 KiB source, 256 KiB state and 1 MiB total JSON. Do not place trajectories, matrices, volumes or entire scientific files in state. Future native scientific components should persist selections, camera, frame, filters and data references, with Host range/paged access. Generic scientific data references/resolvers are roadmap work, not a current 0.2.0 API.
