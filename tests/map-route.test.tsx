import { act, renderHook } from "@testing-library/react";
import { afterEach, expect, it, vi } from "vitest";
import { HostContext, createHostBridge } from "../src/react/host";
import { useStreetRoute } from "../src/plugins/map/use-street-route";
afterEach(() => vi.useRealTimers());
it("skips routes during streaming and falls back without Host capability", async () => {
  vi.useFakeTimers(); const resolveRoute = vi.fn(async () => [[1, 2], [3, 4]] as [number, number][]);
  const bridge = createHostBridge({ resolveRoute }, { artifactId: "route" });
  const wrapper = ({ children }: { children: React.ReactNode }) => <HostContext.Provider value={bridge}>{children}</HostContext.Provider>;
  const hook = renderHook(({ enabled }) => useStreetRoute("2,1;4,3", enabled), { wrapper, initialProps: { enabled: false } });
  await act(async () => vi.advanceTimersByTimeAsync(301)); expect(resolveRoute).not.toHaveBeenCalled();
  hook.rerender({ enabled: true }); await act(async () => vi.advanceTimersByTimeAsync(301)); expect(hook.result.current).toEqual([[1, 2], [3, 4]]);
  const empty = renderHook(() => useStreetRoute("2,1;4,3", true)); expect(empty.result.current).toBeNull();
});
it("discards stale geometry after route input changes", async () => {
  vi.useFakeTimers(); let old!: (p: [number, number][]) => void;
  const resolveRoute = vi.fn().mockImplementationOnce(() => new Promise(resolve => { old = resolve; })).mockResolvedValue([[5, 6], [7, 8]]);
  const bridge = createHostBridge({ resolveRoute }, { artifactId: "route" });
  const wrapper = ({ children }: { children: React.ReactNode }) => <HostContext.Provider value={bridge}>{children}</HostContext.Provider>;
  const hook = renderHook(({ key }) => useStreetRoute(key, true), { wrapper, initialProps: { key: "2,1;4,3" } });
  await act(async () => vi.advanceTimersByTimeAsync(301)); hook.rerender({ key: "6,5;8,7" });
  await act(async () => vi.advanceTimersByTimeAsync(301)); await act(async () => old([[1, 2], [3, 4]]));
  expect(hook.result.current).toEqual([[5, 6], [7, 8]]);
});
it("rejects any invalid route coordinate and cleans debounced work on unmount", async () => {
  vi.useFakeTimers(); const resolveRoute = vi.fn(async () => [[1, 2], [Infinity, 4]] as [number, number][]);
  const bridge = createHostBridge({ resolveRoute }, { artifactId: "route" });
  const wrapper = ({ children }: { children: React.ReactNode }) => <HostContext.Provider value={bridge}>{children}</HostContext.Provider>;
  const hook = renderHook(() => useStreetRoute("2,1;4,3", true), { wrapper }); await act(async () => vi.advanceTimersByTimeAsync(301)); expect(hook.result.current).toBeNull();
  const second = renderHook(() => useStreetRoute("6,5;8,7", true), { wrapper }); second.unmount(); await act(async () => vi.advanceTimersByTimeAsync(301)); expect(resolveRoute).toHaveBeenCalledTimes(1);
});
