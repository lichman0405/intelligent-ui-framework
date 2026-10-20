# Local delivery 0.2.0

## 2026-10-20 documentation handoff

Start with the [Chinese handbook](zh-CN/README.md) or [English handbook](en/README.md). Each language has 11 corresponding chapters, complete component/function signatures and 45 runnable OpenUI programs. Five shared React modules demonstrate static/reactive UI, streaming/state, tools, custom extensions and optional map/HTML. [Native scientific UI roadmap](en/ROADMAP.md) covers materials, chemistry, quantum computing and biology as planned built-in Desktop functionality without additional skills.

`artifacts/handoff-0.2.0-2026-10-20.zip` is a separate dated developer handoff containing source, built runtime, current bilingual documentation, examples, licenses, the unchanged verified 0.2.0 tarball and baseline evidence. `HANDOFF.md` and `MANIFEST.json` inside the archive explain entry points and file SHA-256 values. `artifacts/handoff-package.json` records archive integrity. The original tgz retains its release-time documentation; it is not silently replaced/repacked. Current expanded handbooks come from the archive/repository docs.

`artifacts/documentation-checks.json` records language parity, links, JSON/OpenUI examples and strict TypeScript checks for the five complete example modules. Runtime evidence below remains the original 0.2.0 baseline, not a new scientific component or Desktop acceptance run. No native scientific widgets were implemented by this documentation update.

## Deliverable

- Repository: the `intelligent-ui-framework/` directory containing this document, independently initialized on `feat/standalone-framework` with no remote.
- npm package: `@intelligent-ui/framework@0.2.0`.
- Tarball: `artifacts/intelligent-ui-framework-0.2.0.tgz` at the repository root. No registry publication or Git push is performed.
- Frozen wire contract: `docs/03_CONTRACT_V1.md`; real fixture: `docs/fixtures/artifact-v1.json`.
- Integrator starts with `README.md`, `docs/API.md`, `docs/HOST_INTEGRATION.md` and the tarball. No private import or reference repository is needed.

## Verification and evidence

The `artifacts/` folder is generated locally and intentionally excluded from Git. Evidence files identify the exact tested tarball by SHA-256:

| Evidence | Meaning |
| --- | --- |
| `pack.json` | npm pack file manifest, integrity, size, and tarball filename |
| `consumer-results.json` | Exact tarball SHA-256, Node version, and fresh Zod 3.25.76 / 4.4.3 consumer paths/results |
| `consumer-zod-*.log` | Install, strict consumer typecheck, SSR/ESM/protocol/prompt/no-default-network/CJS-rejection smoke and Vite production logs |
| `browser-results.json` | Browser version and matching tarball hash; 16 gallery samples, state restore, chunk streaming/interruption, Host action, Query/Mutation, themes and mobile checks |
| `demo-light.png`, `demo-dark.png`, `demo-mobile.png` | Screenshots captured from the installed tarball consumer, not the source workspace |
| `npm-audit-production.json` | Production dependency advisory report after patching KaTeX |
| `node22-validation.log`, `node26-validation.log` | Native Windows library build/type/test evidence |
| `upstream-browser-results.json`, `upstream-{map,html}-zod-*.png` | Matching tarball hash; 45 original programs per Zod version, actual MapLibre worker, pins/filter/expand, fixture resolver calls, opaque HTML scripts/canvas/CSP/streaming/height checks |
| `adapter-live-results.json` | Actual public Wikipedia/OSRM probe, separately identified from deterministic browser interception |
| `benchmark/results.json` | 45 original fixture programs streamed through the official parser; sources/chunks/latency/errors |
| `consumer-core-only.log` | Strict core types/SSR/prompt/benchmark with MapLibre absent and zero network requests |

Reproduce from a fresh repository install:

```powershell
$env:OPENUI_TELEMETRY_DISABLED = "1"
npm ci --ignore-scripts
npm run build
npm test
New-Item -ItemType Directory -Force artifacts
npm pack --pack-destination artifacts --json > artifacts/pack.json
npm run verify:consumers -- --both
npm run verify:browser
npm run verify:upstream-browser
npm run bench:fixtures
npm audit --omit=dev --json > artifacts/npm-audit-production.json
```

`verify:browser` uses an existing Chrome/Edge executable. Set `IUI_BROWSER_PATH` if needed. It serves only the clean fixture's production `dist`, blocks external page requests and records any browser errors.

Current acceptance covers 353 tests in 15 files, including 271 original function tests; strict types/builds on Node 22.12.0 and 26.7.0; clean React 19.2.3 consumers using Zod 3.25.76 and 4.4.3; and a core-only consumer without MapLibre. Machine reports identify the exact package tested. Browser suites exercise the 16 framework examples and all 45 original programs per consumer. Original-gallery media responses are intercepted deterministic fixtures; intentional CSP violations are checked separately. A separate live probe returned Wikipedia image results and 179 OSRM route coordinates. No live model request was made because no model endpoint/key was supplied.

Stage commits and resolved failures are recorded in `docs/PROGRESS.md`. Machine evidence beside the tarball identifies the exact packaged build; `artifacts/reproducibility.json` records whether rebuilding and packing produces identical bytes.

## Limits and next integration work

All 55 original components are available through explicit `upstream@0.1.0` registration. Core remains 51 components and `core-trusted` adds YouTube. Maps have separate optional runtime/CSS/worker assets and Host-only route resolution. HtmlView runs in an opaque script sandbox with restrictive child CSP; Host parent CSP is required to prevent external frame self-navigation. Custom components/functions/actions use the public registry API with distinct signatures. Full presets/gallery, image/route/browser/storage adapters and provider-neutral benchmark are included; see `OPTIONAL_CAPABILITIES.md`.

ESM only; CommonJS is intentionally unexported. React 19 and the two tested Zod versions are the initial peer scope. Other browsers and real Electron/Forge are not certified. Full registry imports retain KaTeX and by-name Lucide support, resulting in a Vite large-chunk warning. Host still owns native cancellation, approval, durable mutation idempotency, storage and CSP.
