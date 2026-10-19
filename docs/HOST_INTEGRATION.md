# Host integration guide

This guide is sufficient for a separate Host/Forge developer. Use only the public npm entry points and `UIArtifactV1`; no Framework internal source path is required.

1. Install the local tarball plus React 19, React DOM 19 and Zod 3.25.76 or 4. Import `styles.css` once in the renderer application.
2. Select UI mode in the existing Agent/Host lifecycle. Generate the system prompt with only allowed tool specifications. Plain knowledge responses may remain Markdown. The Framework does not select a model or run an Agent loop.
3. Construct an explicit `kind:"intelligent_ui"` envelope with stable artifact ID, `protocolVersion:"1.0"`, `language:"openui-lang"`, `libraryId:"core"`, and `libraryVersion:"0.1.0"`. Do not auto-promote arbitrary Markdown code fences into UI artifacts.
4. Validate before storing/rendering. If unsupported or invalid, retain the ordinary message fallback. Host may keep the original source for diagnosis, but should not execute it.
5. Accumulate existing transport chunks into `source`, retaining the same trusted Host session/turn IDs. Pass `isStreaming`; stop updates when the message is cancelled. No second SSE transport is needed.
6. Persist the exact JSON map from `onStateChange` alongside its artifact identity. Hydrate via `artifact.state` only in the matching message/session. The supplied fixture uses the SDK's real `$x` binding key.
7. Implement `allowedTools` and `invokeTool` in a narrow adapter. Revalidate input, session/project ownership, permissions and mutation approvals in the real Host runtime. Never pass an unrestricted IPC/MCP/Node client to generated components.
8. Handle `onAction` by forwarding structured data to the existing conversation mechanism. Handle `onDispose` by cancelling pending Host requests for that lifecycle. Late responses are ignored by the Framework bridge.

Mutation hydration/replay never executes `@Run` automatically. Concurrent identical requests are coalesced only while in flight. Durable idempotency, user approval, retry policy, and audit IDs belong to Host; this contract does not add a second transaction or conversation system.

For data beyond artifact/tool-result limits, keep datasets/files in Host storage and return bounded summaries or external IDs. Any resolver for those IDs must enforce its own authorization. Do not put file bytes, process objects, working-directory access or credentials into artifacts or tool JSON.

The Framework demo uses only named local mock tools. Its `invokeTool` is an example of the adapter shape, not a permission policy for a desktop product. Final tarball path, checksums and test evidence are in `docs/DELIVERY.md` and `artifacts/`.
