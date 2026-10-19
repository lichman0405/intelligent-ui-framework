# Local delivery 0.1.0

## Deliverable

- Repository: the `intelligent-ui-framework/` directory containing this document, independently initialized on `feat/standalone-framework` with no remote.
- npm package: `@intelligent-ui/framework@0.1.0`.
- Tarball: `artifacts/intelligent-ui-framework-0.1.0.tgz` at the repository root. No registry publication or Git push is performed.
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
npm audit --omit=dev --json > artifacts/npm-audit-production.json
```

`verify:browser` uses an existing Chrome/Edge executable. Set `IUI_BROWSER_PATH` if needed. It serves only the clean fixture's production `dist`, blocks external page requests and records any browser errors.

Native Node 22.12.0 and 26.7.0 builds and all 334 tests (11 files) passed. Both React 19.2.3 / Zod 3.25.76 and 4.4.3 clean consumers passed strict types, SSR/import checks and production builds. Chrome 155.0.8059.80 passed all 16 examples per consumer plus state, streaming, action/tool, theme and mobile checks with no page/console errors or external requests. Production npm audit reports zero advisories after the KaTeX patch.

Stage commits and resolved failures are recorded in `docs/PROGRESS.md`. Machine evidence beside the tarball identifies the exact packaged build; `artifacts/reproducibility.json` records whether rebuilding and packing produces identical bytes.

## Limits and next integration work

Map/MapMarker remain deferred; a future optional plugin must isolate MapLibre and consume Host route resolvers. HtmlView remains disabled. Trusted extras currently add only fixed-origin YouTube. The shipped wrapper supports its exact core registry signatures; customized official OpenUI libraries need their own new library ID/version and integration wrapper.

ESM only; CommonJS is intentionally unexported. React 19 and the two tested Zod versions are the initial peer scope. Other browsers and real Electron/Forge are not certified. Full registry imports retain KaTeX and by-name Lucide support, resulting in a Vite large-chunk warning. Host still owns native cancellation, approval, durable mutation idempotency, storage and CSP.
