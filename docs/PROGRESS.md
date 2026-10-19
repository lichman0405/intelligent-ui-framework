# Development progress

Last updated: 2026-10-19

## Baseline

- Upstream reference: `thesysdev/open-intelligent-ui`
- Upstream commit: `03213439358bf3408ad61a46ec9e3230c5572e48` (cloned into the sibling `reference/open-intelligent-ui/`; read-only)
- Framework repository: local Git repository on `feat/standalone-framework`; no remote configured
- Scope: standalone Intelligent UI Framework only. No MiQroForge source was cloned, opened, or modified.
- Frozen wire contract: `docs/03_CONTRACT_V1.md`, copied from the workspace handoff without changing field meanings.

## Stage status

- [x] F0: source map, parity inventory, architecture, and contract freeze recorded.
- [x] F1: publishable core, renderer wrapper, scoped theme, 16-sample Vite demo, npm tarball and clean Zod 4 consumer.
- [x] F2: state, components, actions, allowlisted tools, bounded requests, disposal, replay safety, optional resolvers and trusted video gating.
- [ ] F3: generated component spec and model-independent prompt API; gallery/mock-stream verification.
- [ ] F4: compatibility/security checks, clean npm consumer, package tarball, docs, and final local commit.

## Commands and evidence

- `git --version`: `2.56.0.windows.2`
- `node --version`: `v26.7.0`
- `npm --version`: `11.19.0`
- `git clone --filter=blob:none https://github.com/thesysdev/open-intelligent-ui.git reference/open-intelligent-ui`: passed after network access approval.
- Reference SHA: `03213439358bf3408ad61a46ec9e3230c5572e48`.
- `npm run build`: passed, 51 core components and 59 functions; ESM and declarations emitted.
- `npm test`: 302 passing tests (271 upstream function tests plus protocol and real Renderer checks); tests use UTC for upstream's date expectations.
- `npm run demo:build`: passed on native Windows. Vite reports a 500 kB chunk warning from KaTeX/OpenUI/dynamic icon support; no build error.
- `npm pack --pack-destination artifacts`: passed; tarball installed into sibling `../consumer-validation/zod-4.4.3/` with no reference/Forge sources.
- `npm run verify:consumers -- --offline`: clean Zod 4 consumer passed ESM/SSR, protocol/prompt, zero-default-network smoke, strict consumer typecheck, and production Vite bundle.
- Vitest's Windows sandbox temp rename failed initially. `scripts/test.mjs` now puts its temp cache under this repository and sets UTC; no product date semantics changed.
- F2 targeted Host/integration suite: 20 tests passed, including no automatic mutation on hydration/replay, unknown tools/actions, URL schemes, resolver behavior, concurrent request/action deduplication, request budgets and lifecycle cancellation.
- Completed-source preflight uses the official parser and prevents an invalid completed artifact from mounting a tool-capable Renderer. Unknown/incomplete source produces a diagnostic and safe fallback.

## Next

1. Finish Host tool/action lifecycle checks and partial-stream/error regressions (F2).
2. Check generated spec/prompt drift, actual mock chunk sequences, and provider-free backend usage (F3).
3. Finalize API/security/compatibility docs and run Zod 3.25 + Zod 4 clean-consumer/browser verification (F4).

