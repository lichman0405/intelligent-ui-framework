# Changelog

## 0.1.0 — 2026-10-19

- Initial standalone package with protocol, React, Prompt and styles entry points.
- Core registry version `0.1.0`: 51 components, 59 reusable functions; `core-trusted@0.1.0` adds a fixed-origin YouTube embed.
- Official OpenUI Lang 1.0 parser and React Renderer; streaming, reactive inputs, state hydration, Host actions, Query and Mutation.
- Host allowlist, JSON/size validation, URL restrictions, request budgets, concurrent deduplication and lifecycle disposal.
- 16 model-free demo samples and preserved upstream prompt examples.
- `UIArtifactV1` remains wire protocol `1.0`. No fields changed meaning. The handoff's illustrative fixture is replaced by actual component signatures and the official `$x` state key.
- Additive Host fields: `allowedTools`, typed optional image/route resolvers and `onDispose`. Existing Host callback signatures remain unchanged; tool access remains denied until explicitly allowlisted.
- Maps are deferred and HtmlView is disabled. There is no Forge/Next.js/Electron/model dependency.
