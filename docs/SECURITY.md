# Security model

Artifacts, expressions, source, state and tool arguments are untrusted. The Framework renders OpenUI Lang with the official parser/runtime; it does not evaluate arbitrary JavaScript, expose Node/Electron objects, or own a model/tool loop.

## Controls implemented

- Strict JSON envelope validation, exact library signature/version matching, finite JSON values, prototype/accessor/symbol rejection, bounded depth/nodes and byte limits.
- Final-source validation with the official parser before a tool-capable renderer mounts. Unknown components/actions and incomplete/unresolved final programs fall back safely.
- An empty default tool map. A Host must explicitly name `allowedTools` and implement `invokeTool`. Only narrow wrapper callbacks reach the official renderer; no raw MCP/IPC client is forwarded.
- Tool argument/result JSON validation; default 100-call, 4-in-flight and 30-second response budgets. Concurrent identical requests/actions are coalesced. Late results are discarded after lifecycle disposal. Host tool/action exception details are redacted at the adapter boundary.
- `onDispose(ctx)` notifies Host to abort native requests. The stable v1 `invokeTool` callback has no AbortSignal: only the Host can cancel underlying network/IPC work. Response timeout ends the framework promise, not a remote operation.
- No mutation runs during initial state hydration. Durable mutation idempotency, approval, authentication, resource ownership, retries and auditing remain Host duties. In-flight deduplication is not durable transaction control.
- HTTP(S)-only, credential-free URLs. Navigation/copy actions require Host ports. Images use `no-referrer`; image searches require an optional Host resolver and have no built-in `/api/*` endpoint.
- CSS prop helpers reject resource loads, expressions and unsafe tokens. Theme variables are scoped to `.iui-root`; they do not change Host global variables.
- HtmlView is excluded. Math uses patched KaTeX with `trust:false`, bounded macro expansion and size. Trusted video mode is separate `core-trusted` identity and uses a fixed YouTube no-cookie embed origin.

## Host deployment requirements and limits

Set an application CSP that restricts image/frame/network origins, especially inside Electron. An explicit HTTP(S) Image source still makes a browser image request; the Framework does not classify private-network addresses or replace browser CSP. Optional data resolvers must validate origin, authorization, output and request lifetime themselves. No default resolver fetches data.

Do not put keys, file bytes, process objects or unrestricted filesystem paths into Artifact/tool data. For large datasets use bounded summaries and authorized external IDs/resolvers. Host must route a schema/library mismatch to an ordinary message fallback and must never infer trusted session/turn identity from source text.

The OpenUI runtime remains an upstream trusted dependency. Source byte limits and function bounds reduce resource exhaustion but are not process isolation. If hard CPU/memory isolation is required, Host must isolate rendering or prevalidate in a controlled worker/process. No claim of arbitrary hostile-code sandboxing is made.

## Dependency and telemetry audit

OpenUI `lang-core@1.0.0` runtime telemetry is opt-in through `OPENUI_RUNTIME_TELEMETRY_ENABLED`; disable flags are `OPENUI_TELEMETRY_DISABLED=1` or `DO_NOT_TRACK=1`. Its npm **postinstall** sends installation telemetry unless disabled. All development/consumer installs for this delivery use `--ignore-scripts`; no global Node installation was changed. The wrapper sets `publishObservability={false}`.

For installation without dependency scripts:

```powershell
$env:OPENUI_TELEMETRY_DISABLED = "1"
npm install --ignore-scripts path/to/intelligent-ui-framework-0.1.0.tgz react@19 react-dom@19 zod@4
```

The initial production `npm audit` found [GHSA-238p-pmpm-9mq7](https://github.com/advisories/GHSA-238p-pmpm-9mq7) in upstream KaTeX 0.16.47. The Framework pins the patched 0.18.2 release; actual final audit output is `artifacts/npm-audit-production.json`. Package versions, tests and browser evidence are in the delivery report. Audit results describe the registry at verification time, not a future guarantee.
