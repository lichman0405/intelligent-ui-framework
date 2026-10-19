import { describe, expect, it, vi } from "vitest";
import { createHostBridge, safeWebUrl } from "../src/react/host";
const ctx = { artifactId: "artifact", hostSessionId: "session", hostTurnId: "turn" };
describe("controlled Host capabilities", () => {
  it("grants no tools without an explicit allowlist, including when invokeTool exists", () => {
    expect(Object.keys(createHostBridge({ invokeTool: vi.fn() }, ctx).toolProvider)).toEqual([]);
  });
  it("never exposes inherited names or the SDK MCP-client sentinel", () => {
    const bridge = createHostBridge({ allowedTools: ["callTool", "constructor", "__proto__", "read"], invokeTool: async () => null }, ctx);
    expect(Object.keys(bridge.toolProvider)).toEqual(["read"]);
    expect(Object.getPrototypeOf(bridge.toolProvider)).toBeNull();
  });
  it("validates and clones arguments/results while supplying Host-owned context", async () => {
    const invokeTool = vi.fn(async (name, args, context) => { expect(name).toBe("read"); expect(context).toEqual(ctx); args.value = 9; return { rows: [2] }; });
    const bridge = createHostBridge({ allowedTools: ["read"], invokeTool }, ctx);
    const args = { value: 1 };
    expect(await bridge.toolProvider.read(args)).toEqual({ rows: [2] });
    expect(args.value).toBe(1);
    await expect(bridge.toolProvider.read({ x: () => 1 })).rejects.toThrow("Invalid tool arguments");
    expect(invokeTool).toHaveBeenCalledTimes(1);
  });
  it("rejects non-JSON and oversized tool results", async () => {
    for (const result of [new Date(), { x: NaN }, "x".repeat(262_145)]) {
      const bridge = createHostBridge({ allowedTools: ["read"], invokeTool: async () => result as never }, ctx);
      await expect(bridge.toolProvider.read({})).rejects.toThrow("invalid or oversized");
    }
  });
  it("bounds hung requests and redacts Host exception secrets", async () => {
    const bridge = createHostBridge({ allowedTools: ["read"], invokeTool: () => new Promise(() => {}) }, ctx, { toolTimeoutMs: 5 });
    await expect(bridge.toolProvider.read({})).rejects.toThrow("timed out");
    const failed = createHostBridge({ allowedTools: ["read"], invokeTool: async () => { throw new Error("private-secret"); } }, ctx);
    await expect(failed.toolProvider.read({})).rejects.toThrow(/^Host tool failed$/);
  });
  it("deduplicates concurrent identical requests without replaying a settled mutation", async () => {
    let finish!: (value: null) => void;
    const invokeTool = vi.fn(() => new Promise<null>(resolve => { finish = resolve; }));
    const bridge = createHostBridge({ allowedTools: ["save"], invokeTool }, ctx);
    const first = bridge.toolProvider.save({ x: 1 });
    const second = bridge.toolProvider.save({ x: 1 });
    await Promise.resolve();
    expect(invokeTool).toHaveBeenCalledTimes(1);
    finish(null);
    expect(await Promise.all([first, second])).toEqual([null, null]);
  });
  it("bounds concurrent calls and total lifecycle requests", async () => {
    const bridge = createHostBridge({ allowedTools: ["read"], invokeTool: async () => null }, ctx, { maxCalls: 1 });
    await bridge.toolProvider.read({});
    await expect(bridge.toolProvider.read({})).rejects.toThrow("budget");
    const busy = createHostBridge({ allowedTools: ["read"], invokeTool: () => new Promise(() => {}) }, ctx, { maxConcurrent: 1 });
    const pending = busy.toolProvider.read({ x: 1 });
    await expect(busy.toolProvider.read({ x: 2 })).rejects.toThrow("budget");
    const rejected = expect(pending).rejects.toThrow("cancelled"); busy.dispose(); await rejected;
  });
  it("rejects pending work on disposal, calls Host cancellation once and ignores later actions", async () => {
    const onDispose = vi.fn(), onAction = vi.fn();
    const bridge = createHostBridge({ allowedTools: ["read"], invokeTool: () => new Promise(() => {}), onDispose, onAction }, ctx);
    const pending = bridge.toolProvider.read({});
    const rejected = expect(pending).rejects.toThrow("cancelled"); bridge.dispose(); bridge.dispose(); await rejected;
    expect(onDispose).toHaveBeenCalledExactlyOnceWith(ctx);
    await expect(bridge.toolProvider.read({})).rejects.toThrow("lifecycle");
    await bridge.dispatch({ type: "continue_conversation", params: {}, humanFriendlyMessage: "hello" });
    expect(onAction).not.toHaveBeenCalled();
  });
  it.each(["javascript:alert(1)", "data:text/html,bad", "file:///etc/passwd", "https://user:secret@example.com", "/local-api"])("rejects unsafe URL %s", url => expect(safeWebUrl(url)).toBeNull());
  it("routes copy and safe links only through explicit Host ports", async () => {
    const copyText = vi.fn(async () => true), openUrl = vi.fn();
    const bridge = createHostBridge({ copyText, openUrl }, ctx);
    await bridge.dispatch({ type: "CopyToClipboard", params: { text: "copy me" }, humanFriendlyMessage: "copy" });
    await bridge.dispatch({ type: "open_url", params: { url: "https://example.com" }, humanFriendlyMessage: "open" });
    expect(copyText).toHaveBeenCalledExactlyOnceWith("copy me", ctx);
    expect(openUrl).toHaveBeenCalledExactlyOnceWith("https://example.com/", ctx);
  });
  it("denies unknown actions and redacts Host exception details", async () => {
    const onError = vi.fn(), onAction = vi.fn(async () => { throw new Error("secret-key"); });
    const bridge = createHostBridge({ onAction }, ctx, { onError });
    await bridge.dispatch({ type: "unknown", params: {}, humanFriendlyMessage: "bad" });
    expect(onAction).not.toHaveBeenCalled();
    await bridge.dispatch({ type: "continue_conversation", params: {}, humanFriendlyMessage: "go" });
    expect(JSON.stringify(onError.mock.calls)).not.toContain("secret-key");
  });
  it("suppresses repeated concurrent action clicks", async () => {
    let finish!: () => void;
    const onAction = vi.fn(() => new Promise<void>(resolve => { finish = resolve; }));
    const bridge = createHostBridge({ onAction }, ctx);
    const action = { type: "continue_conversation", params: {}, humanFriendlyMessage: "go" };
    const first = bridge.dispatch(action);
    await bridge.dispatch(action); await bridge.dispatch(action);
    expect(onAction).toHaveBeenCalledTimes(1);
    finish(); await first;
  });
});
