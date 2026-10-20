# Deployment, themes, diagnostics and handoff

[中文](../zh-CN/DEPLOYMENT_TROUBLESHOOTING.md) · [Contents](README.md)

## 1. Verified environment and assets

| Surface | Current scope |
| --- | --- |
| Runtime/build | Native Windows; Node 22.12.0 and 26.7.0 |
| Frontend | React/React DOM 19.2.3; Vite production consumers |
| Schemas | Zod 3.25.76 and 4.4.3; components import zod/v4 |
| Modules | ESM; CommonJS require is not exported |
| SSR | Public imports/renderToString smoke, not hydration acceptance for every server framework |
| Browser | Recorded Chrome 155; Electron/other browsers need separate acceptance |

Explicitly import styles.css; KaTeX fonts are packaged. Maps additionally need map CSS, the MapLibre peer and the packaged worker. Check MIME/path/CSP/offline availability. Core does not require MapLibre; only map usage loads it.

Full registries retain components/KaTeX/dynamic icons and the Demo has large-chunk warnings. There is no comprehensive performance benchmark or screenshot-diff baseline yet. Build success does not establish low-memory, large-data or production performance.

## 2. Themes

```tsx
<IntelligentUIRenderer artifact={artifact} theme="dark" themeTokens={{
  "--iui-chart-1": "#3d9dff",
  "--iui-focus": "#6cb6ff",
  "--iui-font": "system-ui, sans-serif",
}} />;
```

themeTokens accepts only --iui-* keys; resource URLs and delimiter/injection-like values are filtered. Tokens are scoped to .iui-root. Framework does not set Desktop's global page background/theme.

Useful tokens: canvas/ink/muted/faint/border/focus/surface; success/warning/danger; chart-1 through chart-6; font/mono; space-tight/inner/group/group-lg/section; radius-sm/md/lg/xl/2xl. Component schemas specify allowed prop types; numeric padding/gap generally use 4px steps. Full defaults are in src/react/components/theme.css.

## 3. Diagnostics and failure handling

onError receives Diagnostic[] with code/message/path?. Do not classify failures by English message text. Some codes come from the official parser and may evolve with the SDK. Source may contain user data; apply Host privacy policy to logging.

| Code | Meaning/action |
| --- | --- |
| invalid-json / json-limit | Non-finite JSON, prototypes/accessors or size/depth/node limits; do not execute |
| invalid-state / invalid-artifact / unknown-field | State/envelope shape error; fix producer schema |
| unsupported-protocol / unsupported-library / invalid-version | Choose the correct registration or migrate explicitly |
| invalid-source / source-limit / invalid-metadata | Invalid/oversized source or metadata |
| empty-source / incomplete-source | No complete final source or unresolved references |
| parse-failed / render-error | Parser/component exception; show fallback and record redacted diagnostics |
| host-action-error / host-state-error | Check Host capability, authorization and arguments |
| Other parser/Query/Mutation diagnostics | Classify by code; data-source errors may remain in view, with retry owned by Host |

Default envelope limit 1 MiB, source/state each 256 KiB, depth 32, nodes 30,000. Tools default to 100 calls/4 concurrent/30s, with 256 KiB/30,000-node results. These are separate budgets. Prefer pagination/external references to unbounded budget increases.

## 4. Troubleshooting

| Symptom | Check |
| --- | --- |
| Fallback/unknown component | libraryId/version, registry, Prompt and final syntax |
| Every chunk resets state | Stable IDs/key/Host/registry/toolOptions; accumulated text |
| Restore has no effect | Preserve $ keys; hydrate before mount and remount for explicit restore |
| Tool never runs | Both allowedTools/invokeTool; explicit @Run for Mutation |
| Duplicate/timed-out operation | Host durable idempotency; timeout does not undo remote effects; cancel underlying work |
| Missing image | Resolver, permission, CORS, image origin, service failure; placeholders can be expected |
| Blank map background | Default blank is expected; check CSS/peer/worker/WebGL and explicit basemap opt-in |
| HTML does not run | Registration, streaming completion, parent/child CSP |
| Module/hooks error | Public ESM paths, one React instance, peers/optional dependencies |
| Zod/GeoJSON types | zod/v4-capable version; retain packaged GeoJSON references/dependency, not partial d.ts copies |
| Offline failure | Fonts/workers/tiles/images; replace public services with Host-local capabilities |

## 5. Source build and renewed acceptance

```sh
npm ci --ignore-scripts
npm run typecheck
npm run build
npm test
npm run demo:build
npm pack --ignore-scripts --pack-destination artifacts --json
npm run verify:consumers -- --both
npm run verify:browser
npm run verify:upstream-browser
npm run bench:fixtures
```

Create artifacts first. pack skips scripts because build ran explicitly; this also keeps prepack logs out of JSON. Browser scripts need a local Chrome/Edge executable (IUI_BROWSER_PATH). Reports establish the actual browser run. Changed package bytes/hash require new evidence; do not reuse an old SHA's report.

## 6. This documentation delivery and baseline evidence

This update adds manuals without changing runtime code or the verified 0.2.0 tgz. Original SHA-256:

```text
16b333dcdbe2f0c071114ed9e078fe1498d276af8665c70b0ec22112249fdc15
```

The handoff archive includes tgz, bilingual docs/shared examples, licenses and baseline evidence. Handoff source separately. The tgz retains its release-time documentation; use the archive/current repository docs for these expanded manuals. Do not claim the old tgz contains the new handbook. Documentation checks and historical runtime evidence remain separate.

artifacts is Git-ignored; a Git source handoff alone omits binary/evidence. Verify manifest/hashes, shared contract, optional resources and limits. Production acceptance still needs the target Desktop's real model/tools/permissions/persistence/offline workflow. Native scientific UI phases and gates are in the [roadmap](ROADMAP.md).
