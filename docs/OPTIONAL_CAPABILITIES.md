# Optional capabilities (0.2.0)

Protocol 1.0 and the `core@0.1.0` library remain unchanged. Features are enabled by trusted Host code, never by artifact data. No provider, network service, storage or plugin is selected from source text.

## Complete original component library

Install the optional map peer only when using maps:

```sh
npm install --ignore-scripts maplibre-gl@6.13.0
```

```tsx
import { IntelligentUIRenderer, createArtifact, createIuiRegistry } from "@intelligent-ui/framework";
import { createUpstreamRegistration } from "@intelligent-ui/framework/plugins/upstream";
import "@intelligent-ui/framework/styles.css";
import "@intelligent-ui/framework/plugins/map/styles.css";

// Construct once outside render, or useMemo with stable options.
const registration = createUpstreamRegistration({
  map: { basemap: "blank" }, // offline, with pins and optional route geometry
  html: {},                 // inline JS sandbox; no external resource origins
});
const registry = createIuiRegistry(registration);
const artifact = createArtifact('root = HtmlView("<b>Sandbox content</b>")',
  "example", undefined, { libraryId: registration.id, libraryVersion: registration.version });
<IntelligentUIRenderer registry={registry} artifact={artifact} />;
```

`upstream@0.1.0` has 55 components and 59 functions: 51 core plus YouTube, Map, MapMarker and HtmlView. `upstreamRegistry` and `upstreamRegistration` provide stable default instances. Maps dynamically load the optional peer and use a packaged same-origin worker. CSP needs `worker-src 'self' blob:` and `script-src` compatible with the Host's bundler. A custom `workerUrl` is accepted for alternative hosting; core imports never load MapLibre or the map worker.

`basemap:"openfreemap"` explicitly permits public vector tiles/fonts and an Esri raster fallback. Supply `style`/`fallbackStyle` (objects or functions of the dark-mode boolean) for a private tile service. These styles and URLs are trusted Host configuration. The default blank map intentionally contains no cartography; marker/filter/selection/route behavior still works. When WebGL is unavailable, a selectable place list replaces the canvas. Route geometry uses only `hostAdapter.resolveRoute`, otherwise a direct-connection overview is shown. Points are `[latitude,longitude]`, 2–25 stops for the public OSRM adapter; the plugin accepts at most 20,000 returned geometry points. Markers default to a 500 limit (configurable up to 2,000).

You can register only the needed plugins:

```ts
import { createMapPlugin } from "@intelligent-ui/framework/plugins/map";
import { createHtmlPlugin } from "@intelligent-ui/framework/plugins/html";
const library = createIuiLibrary({ id: "my-ui", plugins: [createHtmlPlugin()] });
const registry = createIuiRegistry({ id: "my-ui", version: "1.0.0", library });
```

`IuiPlugin` accepts official OpenUI component, function and action definitions. Duplicate names/signatures fail. Add a new library version when changing signatures. Generate a matching backend prompt from `createSystemPrompt(options, library.toSpec())`. `createArtifact` takes an optional fourth `{libraryId,libraryVersion}` argument; the Renderer still rejects it without an explicit matching registry.

## HtmlView boundary

`HtmlView(html,height?,title?)` runs only after streaming completes, inside `sandbox="allow-scripts"`. It has an opaque origin: no parent DOM, Node, storage, Host callbacks, forms, popups, top navigation or child frames. Inline JS, canvas, games and animation work. CSP forbids fetch/XHR/WebSocket and external resources by default. Exact HTTPS `scriptOrigins`, `styleOrigins`, `imageOrigins`, `fontOrigins` are optional trusted configuration. No `unsafe-eval`. HTML defaults to 128 KiB (configurable up to 256 KiB); heights clamp to 80–2400px. Auto-height messages validate the actual frame source and `origin="null"`; they never dispatch tools/actions.

**Parent CSP is required** to prevent an iframe navigating its own browsing context to external pages. Sandboxing alone does not prevent self-navigation. The Demo sets `frame-src 'self' https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'`. Omit the YouTube origin when video is unused. For Electron also keep contextIsolation enabled, nodeIntegration disabled and avoid privileged preload bridges in this frame. A tight Host CSP and process isolation are Host duties; a CPU-bound inline loop can still consume renderer resources.

## Optional web, storage and browser ports

```ts
import { createWebResolvers, createArtifactStore, createBrowserPorts } from "@intelligent-ui/framework/adapters";
const resolvers = createWebResolvers();
const hostAdapter = { ...resolvers, onAction: handleAction }; // memoize
```

`createWebResolvers` implements Wikipedia exact article/thumbnail, media-list and search, then Commons bitmap search; it rejects SVG, logos, credentialed and non-HTTPS result URLs. OSRM geometry is validated and converted into latitude/longitude. Public services require connectivity/CORS and may fail or rate-limit. Failures produce placeholders or route overviews in the components. Images may carry attribution obligations; Host owns content/license presentation. No location geocoding is invented from an image query.

Defaults: 10s per request, 4 concurrent requests, 2 MiB response body and 32 cached public results. All are configurable. Fetch is injectable; endpoints require exact HTTPS origins, redirects fail, credentials are omitted and content is read with a byte bound. `onDispose(ctx)` aborts in-progress fetches and stops fallback searches for that artifact/session/turn. If combining Host cleanup callbacks, call both; do not overwrite resolver cleanup. Cache results are defensive copies, limited to public image/route data.

`createArtifactStore(storage,{supportedLibraries,prefix,limits})` takes a caller-supplied `getItem/setItem/removeItem` interface. `save/load/saveState/remove` validate wire DTOs, match artifact IDs, preserve `$variable` names and isolate session/turn/artifact keys. `load` returns null for invalid/corrupt/unavailable storage; writes propagate storage failures to the Host. No implicit global localStorage or conversation format is used.

`createBrowserPorts({allowUrl,open,writeText})` requires a caller policy and browser implementations. HTTP(S) URLs must pass `allowUrl`; clipboard is size-bounded and remains subject to browser user activation. No native filesystem/IPC capability is introduced.

## Prompt and gallery

`createSystemPrompt(options, libraryOrSpec="core", profile="chat")` includes the full original composition, spacing, reactive state, drawing, date and data rules plus three worked examples. `profile:"dashboard"` adds the original dashboard example/tool schemas; override `options.tools` with the actual Host schemas. Descriptions never grant runtime permissions. Rules are adapted to registered capabilities and optional image resolvers. `getComponentSpec("upstream")` returns a defensive copy without importing React. The original `promptOptions`, `dashboardPromptOptions` and four example strings are also exported for callers who need raw presets.

`/gallery` exports all 19 component programs, 4 composition programs, 18 tool programs and 4 prompt examples (45 total), their capability metadata, deterministic `demoTools` and `demoToolSpecs`. `createGalleryArtifact(id)` uses the explicit upstream signature. The 16 framework acceptance examples are separate. Demo data is synthetic, not a business data provider; it generates dates relative to the current date.

## Provider-neutral benchmark

```sh
npm run build
npm run bench:fixtures
npm run bench -- --answers ./saved-model-answers --only bicycle
npm run bench -- --provider ./my-provider.mjs --only bicycle
npm run bench -- --model MODEL_ID --base-url https://provider.example/v1 --key-env BENCH_API_KEY
```

Saved-answer files are named from the selected case ID; the original 24 live prompts are in `tools/bench/prompts.json`. Fixture mode uses 45 gallery IDs instead. Use a fixture ID only with `--fixtures`, or rename a saved file to the live case ID when rechecking it. Provider module default export receives `{prompt,system,signal}` and returns text or an async iterable of text chunks. `/benchmark` exposes `runBenchmark(cases,provider,options)` with the same neutral API and no React dependency. It checks official parser errors, unresolved/incomplete source, output byte limits, cancellation/timeouts and chunk/latency measurements. Custom libraries must supply matching `schema`, `root` and `library` options.

The CLI is local tooling, outside the runtime package. Its optional OpenAI-compatible SSE provider reads a key from the named environment variable and writes only answers/results, never the key. Default execution is sequential. Results and sources go to ignored `artifacts/benchmark/`; they measure syntax/provider behavior, not semantic truth or visual quality. `verify:upstream-browser` performs the separate real Renderer/interaction/screenshot checks against the installed tarball. Live model execution requires Host credentials and is not represented as passed by fixture results.
