# Development progress

Last updated: 2026-10-20

## 2026-10-20 bilingual developer documentation

- Added matching `docs/zh-CN/` and `docs/en/` handbooks, 11 chapters per language: onboarding, streaming/state, Host integration, optional plugins/adapters, Prompt/benchmark, development, deployment/diagnostics, generated API reference, 45 complete Gallery programs, index and native scientific UI roadmap.
- Generated references cover all 55 original components, 59 library functions and the clipboard action, with positional signatures, required arguments, validation schemas and usage links. Chinese explanations and English originals share actual generated definitions.
- Added 5 complete React example modules using public exports. Documentation checks pass strict consumer TypeScript, literal Artifact syntax, 92 OpenUI blocks, 2 JSON blocks, chapter parity and local links. This is documentation validation, not a rerun of the 353 runtime tests.
- Native roadmap explicitly includes materials, chemistry, quantum computing and computational biology. Desktop should ship/register interactive components itself, without user-installed skills. Planned domain widgets are not described as implemented 0.2.0 exports.
- Kept the previously verified 0.2.0 tarball byte-for-byte unchanged. A dated handoff archive adds current source/built runtime, expanded bilingual docs/examples, baseline binary/evidence and a file hash manifest. Old consumer report paths remain historical evidence.
- Documentation tooling: `node scripts/build-docs.mjs` (after runtime build), `node scripts/check-docs.mjs`, `node scripts/package-handoff.mjs` (native Windows .NET ZIP; fixed generated staging folder, archive destination must be new). Runtime package/protocol/library versions are unchanged. Local commits only, no push.

## 0.2 parity completion

Protocol 1.0 and core@0.1.0 remain compatible. Local implementation commit: `240bfa2`.

- Implemented map and sandboxed HTML plugins, all 55 original components, explicit custom registries and plugin actions/functions.
- Added Wikipedia/Commons/OSRM ports with bounded I/O and cancellation, caller-owned storage/navigation/clipboard ports.
- Preserved the complete prompt rules/presets and all 45 original programs (19 component, 4 composition, 18 tools, 4 prompt examples), alongside 16 framework examples.
- Added provider-neutral benchmark API, original 24 live prompts and fixture/saved/SSE local CLI; 45 streamed fixture programs passed the official parser.
- Native Node 22.12.0 and 26.7.0 type/build/test checks: 353 tests in 15 files, including 271 original function tests.
- Strict clean tarball consumers: React 19.2.3 with Zod 3.25.76 / 4.4.3, plus a core-only install without MapLibre. Exact final tarball identity is in `artifacts/consumer-results.json`.
- Chrome exercised all 45 original programs, actual packaged map worker, pins/selection/filter/expansion, image/route ports and iframe scripts/canvas/isolation/streaming/height checks in both Zod consumers. Separate core browser checks cover all 16 examples, state, stream/actions/tools/themes/mobile. Final reports bind to the tarball SHA.
- Separate live public-service probe returned 2 Wikipedia images and 179 OSRM coordinates. Deterministic browser routes are labeled fixtures; live model execution remains untested without credentials.
- Production audit: zero advisories. MapLibre worker/CSS license is bundled. All implementation/docs commits are local; no remote or push.

The remaining sections retain the original 0.1 phase history. Current limits and APIs are described in `DELIVERY.md` and `OPTIONAL_CAPABILITIES.md`.

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
- [x] F3: generated component spec and backend Prompt API without React; 16 gallery samples, 4 upstream prompt examples and real mock-stream chunks verified.
- [x] F4: compatibility/security checks, clean dual-Zod consumers, real browser acceptance, npm tarball, docs, and local-only delivery.

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
- F3 additional suite: 9 tests passed for spec drift/defensive copies, backend bundling without React, tool-aware prompt generation, 7-character async stream chunks, interrupted-source recovery, and four preserved upstream prompt examples.
- Added `docs/API.md`, `docs/HOST_INTEGRATION.md`, `docs/CHANGELOG.md`, and a real `docs/fixtures/artifact-v1.json` for the independent Host integrator.
- Dependency audit: runtime telemetry in lang-core 1.0.0 is opt-in, but its npm postinstall sends installation telemetry unless disabled. All project/consumer installs so far use `--ignore-scripts`; final installation docs will document `OPENUI_TELEMETRY_DISABLED=1`.
- Final native Windows checks: Node 22.12.0 and 26.7.0 built the package and passed 334 tests across 11 files. Official Node 22 archive was SHA-256 checked before execution; runtime is local under ignored `.tools/`.
- Production audit identified the upstream KaTeX advisory; pinning patched KaTeX 0.18.2 resolved it. Final `npm audit --omit=dev` reports 0 advisories.
- Fresh tarball-only consumers with React 19.2.3 and Zod 4.4.3 / 3.25.76 passed strict typecheck, production Vite build, SSR/ESM/protocol/prompt imports, zero-default-network smoke, and intentional CommonJS rejection.
- Chrome 155.0.8059.80 passed all 16 gallery samples in both consumers, state save/reload, streaming/interruption, Host actions, Query/Mutation, themes and 390px mobile layout. No browser console/page errors or external requests. Screenshots are in `artifacts/`.
- Browser verification found standalone dark neutrals still depending on the upstream app's globals. Fixed by defining full scoped light/dark tokens; both final consumers then passed. The sandbox initially denied the local browser server; authorized local-network execution completed the checks.
- Final artifact hash, fresh consumer paths, browser version and package integrity are recorded in `artifacts/{consumer-results,browser-results,pack}.json`; reproducibility comparison is recorded in `artifacts/reproducibility.json`.

## Local phase commits

- F0: `2d20903` — source map, architecture and unchanged contract freeze.
- F1: `6aef858` — standalone core, renderer, demo and clean consumer.
- F2: `1cf8db5` — tool/action lifecycle and interaction verification.
- F3: `e78f1cb` — generated Prompt API, chunk streams and Host integration docs.
- F4: the final local commit after this log; identify with `git log -1 --oneline`. No remote is configured and no push is performed.

## Next

1. The independent integrator should install `artifacts/intelligent-ui-framework-0.2.0.tgz`, read `docs/HOST_INTEGRATION.md` and `docs/OPTIONAL_CAPABILITIES.md`, and consume public exports and the real artifact fixture.
2. Forge/Electron integration is intentionally unexecuted here. Host owns IPC, native cancellation, permissions/approval, persistence, CSP and durable mutation idempotency.
3. Known limits: ESM only, Chromium acceptance scope, large full-demo chunks, Host-owned iframe parent CSP/native permissions and unexecuted live-model credentials. Map/MapMarker and HtmlView are now explicit plugins. See `docs/COMPATIBILITY.md` and `docs/PARITY_MATRIX.md`.
