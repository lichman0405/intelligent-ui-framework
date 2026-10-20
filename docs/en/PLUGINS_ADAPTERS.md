# Plugins, resources and adapters

[中文](../zh-CN/PLUGINS_ADAPTERS.md) · [Contents](README.md) · [Complete example](../examples/OptionalApp.tsx)

## 1. Choose a registry

| Registration | Artifact signature | Components |
| --- | --- | --- |
| Default coreRegistry | core@0.1.0 | 51 |
| mode="trusted-extras" or trustedRegistry | core-trusted@0.1.0 | 52 |
| upstreamRegistry or createUpstreamRegistration | upstream@0.1.0 | 55 |
| Custom createIuiRegistry | New Host-defined ID/version | Definition-dependent |

Artifacts cannot elevate their own capabilities; registration is trusted code. The fourth createArtifact argument declares a signature but does not make Renderer load that library automatically. A full library needs a matching Prompt too.

## 2. Maps

```sh
npm install --ignore-scripts maplibre-gl@6.13.0
```

```tsx
import { createUpstreamRegistration } from "@intelligent-ui/framework/plugins/upstream";
import { createIuiRegistry } from "@intelligent-ui/framework/react";
import "@intelligent-ui/framework/styles.css";
import "@intelligent-ui/framework/plugins/map/styles.css";
const registration = createUpstreamRegistration({ map: { basemap: "blank", maxMarkers: 500 } });
const registry = createIuiRegistry(registration);
```

OptionalApp.tsx includes the Artifact/render call. Geographic Map supports markers, category filters, selection bindings, fit/zoom, expansion and routes. Default blank style makes no remote map requests. Explicit `basemap:"openfreemap"` uses public vector tiles/fonts with Esri raster fallback. Production may supply private style/fallbackStyle objects or `(dark)=>style` functions. These options are trusted configuration, never model input.

| MapPluginOptions | Meaning |
| --- | --- |
| basemap | blank (default) or openfreemap |
| style / fallbackStyle | Custom MapLibre style or dark-mode function |
| workerUrl | Override packaged worker URL |
| maxMarkers | Default 500, maximum 2000 |

The package includes a same-origin worker; Vite asset rewriting has been exercised. Other bundlers, Electron protocols and CSP need target acceptance. Host a worker explicitly and pass workerUrl when necessary. Never return SPA index.html for a worker request. Import map CSS separately. A selectable place list is offered if WebGL is unavailable.

Host resolveRoute takes/returns `[latitude,longitude]`. Without a resolver, or on failure, the view shows direct-connection overview rather than navigation instructions. The plugin validates 2–20,000 returned points; the public OSRM adapter accepts 2–25 input stops.

## 3. HtmlView

```tsx
import { createHtmlPlugin } from "@intelligent-ui/framework/plugins/html";
// Register using createIuiLibrary({id:"my-ui",plugins:[createHtmlPlugin()]}); see Development.
```

Signature: `HtmlView(html,height?,title?)`; execution begins after streaming completes. The iframe has only allow-scripts, without same-origin access, forms, popups, top navigation, nested frames or Host/IPC channels. Default CSP denies fetch/XHR/WebSocket and external resources; inline JS/canvas/animation work, unsafe-eval does not.

| HtmlPluginOptions | Meaning |
| --- | --- |
| scriptOrigins / styleOrigins / imageOrigins / fontOrigins | Exact HTTPS origins; no paths, credentials or wildcards |
| maxHtmlBytes | Default 131072, maximum 262144 |

Fixed/automatic heights clamp to 80–2400px. Height messages must come from the actual frame with origin null and never become business events. Theme changes update srcdoc and may reset internal JS state; use native components for durable business state.

**Parent CSP is required.** Sandboxing alone does not prevent frame self-navigation. The Demo uses:

```html
<meta http-equiv="Content-Security-Policy"
  content="frame-src 'self' https://www.youtube-nocookie.com; object-src 'none'; base-uri 'self'">
```

This is a frame-policy example, not a complete production CSP. Merge it with Desktop's policy and remove YouTube when unused. Keep Electron nodeIntegration disabled and contextIsolation enabled; do not inject privileged preload capabilities into generated pages. CPU-intensive scripts can still occupy the renderer thread.

## 4. Image and route services

```ts
import { createWebResolvers } from "@intelligent-ui/framework/adapters";
const web = createWebResolvers({ timeoutMs: 10000, maxConcurrent: 4 });
const hostAdapter = { ...web };
```

Construction performs no network request. Invocation uses Wikipedia exact article → media-list → search → Commons bitmap fallback. Non-HTTPS/credentialed URLs, SVGs and some logo-like results are rejected. The application handles image rights/attribution. Failed searches produce placeholders; retrieval is not guaranteed.

WebResolverOptions supports injected fetch and exact HTTPS wikipediaOrigin/commonsOrigin/routeOrigin. Defaults: 10s timeout, 4 concurrent requests, 2 MiB response (maximum 8 MiB), 32 cacheEntries (maximum 256). Requests omit credentials, reject redirects and read bodies with a byte bound; cached results are defensive copies. Connectivity, CORS and rate limits must be checked in the target environment. onDispose aborts that context's requests and stops image fallback. Keep private results out of a resolver cache intended for public results.

## 5. Browser ports

```ts
import { createBrowserPorts } from "@intelligent-ui/framework/adapters";
const ports = createBrowserPorts({
  allowUrl: url => url.hostname === "example.org",
  open: url => { window.open(url, "_blank", "noopener,noreferrer"); },
  writeText: text => navigator.clipboard.writeText(text),
});
```

Host supplies an explicit navigation policy and implementations. Clipboard still requires browser activation/secure context and rejects oversized text. Desktop can supply narrow native equivalents, without exposing whole Electron/IPC objects to generated components.
