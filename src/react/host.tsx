import { createContext, useContext } from "react";
import type { ActionEvent } from "@openuidev/react-lang";
import { validateJSON, validateState, type Diagnostic, type UIActionContext, type UIHostAdapter } from "../protocol/index";

export function safeWebUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 8192) return null;
  try { const url = new URL(value); return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : null; } catch { return null; }
}
export interface HostBridgeOptions { maxCalls?: number; maxConcurrent?: number; toolTimeoutMs?: number; customActions?: readonly string[]; onError?: (errors: Diagnostic[]) => void }
/** Holds only named callback capabilities. Never passes Host objects to OpenUI. */
export function createHostBridge(host: UIHostAdapter = {}, context: UIActionContext, options: HostBridgeOptions = {}) {
  const ctx = Object.freeze({ ...context });
  let disposed = false, calls = 0, active = 0, retainCount = 0;
  const controller = new AbortController();
  const pending = new Map<string, Promise<unknown>>();
  const pendingActions = new Set<string>();
  const actions = new Set(options.customActions ?? ["CopyToClipboard"]);
  const report = (code: string, message: string) => options.onError?.([{ code, message }]);
  const check = () => { if (disposed) throw new Error("Artifact lifecycle ended"); };
  const toolProvider: Record<string, (args: Record<string, unknown>) => Promise<unknown>> = Object.create(null);
  for (const name of new Set(host.allowedTools ?? [])) {
    if (!/^[a-zA-Z][\w.-]{0,127}$/.test(name) || ["callTool", "constructor", "prototype"].includes(name)) continue;
    toolProvider[name] = async (raw) => {
      check();
      if (!host.invokeTool) throw new Error("Host tool capability unavailable");
      const args = validateState(raw);
      if (!args.success) throw new Error("Invalid tool arguments");
      const key = `${name}:${JSON.stringify(args.data)}`;
      if (pending.has(key)) return pending.get(key);
      if (++calls > (options.maxCalls ?? 100) || active >= (options.maxConcurrent ?? 4)) throw new Error("Tool resource budget exceeded");
      active++;
      let cleanup = () => {};
      const request = new Promise<unknown>((resolve, reject) => {
        const abort = () => reject(new Error("Artifact request cancelled"));
        const timer = setTimeout(() => reject(new Error("Host tool timed out")), options.toolTimeoutMs ?? 30_000);
        controller.signal.addEventListener("abort", abort, { once: true });
        cleanup = () => { clearTimeout(timer); controller.signal.removeEventListener("abort", abort); };
        Promise.resolve().then(async () => {
          check();
          try { return await host.invokeTool!(name, args.data, ctx); }
          catch { throw new Error("Host tool failed"); }
        }).then(value => {
          check();
          const result = validateJSON(value, { maxBytes: 262_144 });
          if (!result.success) throw new Error("Host returned invalid or oversized tool JSON");
          resolve(result.data);
        }).catch(reject);
      }).finally(() => { cleanup(); active--; pending.delete(key); });
      pending.set(key, request);
      return request;
    };
  }
  async function dispatch(event: ActionEvent) {
    let actionKey: string | undefined;
    try {
      check();
      const params = validateState(event.params);
      if (!params.success) throw new Error("Invalid action data");
      const key = JSON.stringify([event.type, params.data, event.humanFriendlyMessage, event.formState]);
      if (pendingActions.has(key)) return;
      actionKey = key;
      pendingActions.add(actionKey);
      if (event.type === "open_url") {
        const url = safeWebUrl(params.data.url);
        if (!url) throw new Error("URL scheme or credentials rejected");
        await host.openUrl?.(url, ctx);
      } else if (event.type === "continue_conversation") {
        const state = event.formState === undefined ? undefined : validateState(event.formState);
        if (state && !state.success) throw new Error("Invalid action form state");
        if (typeof event.humanFriendlyMessage !== "string" || event.humanFriendlyMessage.length > 16_384) throw new Error("Invalid conversation message");
        await host.onAction?.({ kind: "continue_conversation", message: event.humanFriendlyMessage, ...(state?.success ? { formState: state.data } : {}) }, ctx);
      } else if (actions.has(event.type)) {
        if (event.type === "CopyToClipboard" && host.copyText && typeof params.data.text === "string") await host.copyText(params.data.text, ctx);
        else await host.onAction?.({ kind: "custom_action", name: event.type, params: params.data }, ctx);
      } else throw new Error("Unknown action rejected");
    } catch { if (!disposed) report("host-action-error", "Host action was invalid, unavailable or failed"); }
    finally { if (actionKey) pendingActions.delete(actionKey); }
  }
  return {
    host, context: ctx, toolProvider, dispatch,
    stateChanged(raw: unknown) {
      if (disposed) return;
      const result = validateState(raw);
      if (result.success) { try { host.onStateChange?.(result.data, ctx); } catch { report("host-state-error", "Host state callback failed"); } }
      else options.onError?.(result.errors);
    },
    retain() { retainCount++; },
    release() { retainCount--; queueMicrotask(() => { if (retainCount <= 0) this.dispose(); }); },
    dispose() { if (disposed) return; disposed = true; controller.abort(); try { host.onDispose?.(ctx); } catch { /* cleanup must finish */ } },
  };
}
export type HostBridge = ReturnType<typeof createHostBridge>;
export const HostContext = createContext<HostBridge | null>(null);
export const useIuiHost = () => useContext(HostContext);
