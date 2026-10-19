# Compatibility and limits

| Surface | Scope / evidence |
| --- | --- |
| Windows | Native PowerShell, Git, Node/npm; no Docker or WSL |
| Node | Package floor is 22.12.0; an official checksum-verified Windows 22.12.0 runtime is used for final build/tests. Node 26.7.0 is also used in this workspace. Exact final results are recorded in `docs/DELIVERY.md` |
| React | React/React DOM 19 peer dependencies; clean fixtures use 19.2.3. React is not bundled into the library |
| Zod | Peer range `^3.25.0 || ^4.0.0`; component schemas import `zod/v4`. Clean fixtures use 3.25.76 and 4.4.3. Host Zod 3 schemas cross only as JSON DTOs |
| Browser | Chrome/Edge Chromium exercised by `npm run verify:browser`; exact browser version is recorded in `artifacts/browser-results.json`. Other browsers are not certified |
| Build / distribution | ESM, generated `.d.ts`, explicit CSS import and packaged KaTeX font assets; Vite 7.3.7 production consumers |
| CommonJS | Not exported. A `require()` check must fail with `ERR_PACKAGE_PATH_NOT_EXPORTED`; use ESM or an ESM-capable bundler |
| SSR | Public ESM imports and static `renderToString` are checked with no `window`/`document`; browser observers/timers are initialized in effects |
| Streaming | Host accumulates source and supplies `isStreaming`. Incremental source keeps the Renderer mounted within a message identity; interrupted final syntax falls back |
| Tree shaking | Protocol and Prompt are independent entries without React imports. React UI uses the full core registry; importing it retains registered components and KaTeX |
| Electron / Forge | No application-level Electron/Forge build has been run. Integration is delegated through the public contract and tarball |

Dynamic Lucide icons preserve upstream by-name coverage and generate many small lazy chunks in Vite. The full demo also produces a large main chunk warning (OpenUI/KaTeX/specs). These are build warnings, not claimed optimizations. Applications needing smaller UI bundles can use the pure protocol/prompt paths and compose a narrower official OpenUI library; the shipped wrapper targets its fixed `core`/`core-trusted` signatures.

Core has 51 components and 59 library functions. `core-trusted` adds YouTube only. Map/MapMarker are deferred pending a resolver-only map plugin with separately tested optional dependencies. HtmlView stays disabled. No Thesys Gateway, LLM key, Next.js service, browser thread storage, model provider or Agent runtime is required.

Native date functions use the viewer's local timezone. Upstream date test expectations use UTC, so the deterministic test runner sets `TZ=UTC`; it does not change product date behavior. Report only environments actually listed in the final verification evidence as tested.
