import { expect, it, vi } from "vitest";
import { createWebResolvers, createArtifactStore, createBrowserPorts } from "../src/adapters/index";
import { createArtifact } from "../src/protocol/index";
const ctx = { artifactId: "same", hostSessionId: "s", hostTurnId: "1" };
const reply = (data: unknown) => new Response(JSON.stringify(data), { headers: { "Content-Type": "application/json" } });
it("resolves exact Wikipedia images, caches defensively and emits no eager requests", async () => {
  const fetch = vi.fn(async () => reply({ originalimage: { source: "https://images.example/photo.jpg" } }));
  const ports = createWebResolvers({ fetch }); expect(fetch).not.toHaveBeenCalled();
  const first = await ports.resolveImage!("Lisbon", ctx); expect(first).toEqual([{ url: "https://images.example/photo.jpg", alt: "Lisbon" }]);
  (first as any)[0].url = "bad";
  expect((await ports.resolveImage!("Lisbon", ctx))[0].url).toContain("photo.jpg"); expect(fetch).toHaveBeenCalledTimes(1);
});
it("falls back through media, Wikipedia search and Commons, filtering SVGs and credentials", async () => {
  const fetch = vi.fn(async (url: any) => reply(String(url).startsWith("https://commons") ? { query: { pages: [{ imageinfo: [{ mime: "image/jpeg", thumburl: "https://images.example/subject.jpg" }] }] } } : String(url).includes("summary") ? { thumbnail: { source: "https://images.example/icon.svg" } } : { query: { pages: [{ thumbnail: { source: "https://user:pass@example.com/photo.png" } }] } }));
  expect(await createWebResolvers({ fetch }).resolveImage!("Long subject phrase", ctx)).toEqual([{ url: "https://images.example/subject.jpg", alt: "Long subject phrase" }]); expect(fetch).toHaveBeenCalledTimes(4);
});
it("validates road geometry, converts longitude/latitude and bounds inputs/results", async () => {
  const fetch = vi.fn(async () => reply({ code: "Ok", routes: [{ geometry: { type: "LineString", coordinates: [[-122, 37], [-123, 38]] } }] }));
  const ports = createWebResolvers({ fetch }); expect(await ports.resolveRoute!([[37, -122], [38, -123]], ctx)).toEqual([[37, -122], [38, -123]]);
  expect(String(fetch.mock.calls[0][0])).toContain("-122,37;-123,38");
  await expect(ports.resolveRoute!([[91, 0], [0, 0]], ctx)).rejects.toThrow("2–25");
  await expect(createWebResolvers({ fetch, maxResponseBytes: 10 }).resolveRoute!([[1, 2], [3, 4]], ctx)).rejects.toThrow("large");
  await expect(createWebResolvers({ fetch: async () => reply({ code: "Ok", routes: [] }) }).resolveRoute!([[1, 2], [3, 4]], ctx)).rejects.toThrow("Invalid route");
  expect(() => createWebResolvers({ routeOrigin: "http://example.com" })).toThrow("HTTPS");
});
it("cancels disposed requests without starting image fallback requests", async () => {
  let signal: AbortSignal | undefined;
  const fetch = vi.fn((_url: any, init: any) => { signal = init.signal; return new Promise<Response>((_, reject) => signal!.addEventListener("abort", () => reject(new Error("abort")), { once: true })); });
  const ports = createWebResolvers({ fetch }); const image = ports.resolveImage!("query", ctx); ports.onDispose!(ctx);
  expect(signal?.aborted).toBe(true); expect(await image).toEqual([]); expect(fetch).toHaveBeenCalledTimes(1);
});
it("times out route calls and applies concurrency limits", async () => {
  const fetch = vi.fn((_url: any, init: any) => new Promise<Response>((_, reject) => init.signal.addEventListener("abort", () => reject(new Error("abort")), { once: true })));
  const ports = createWebResolvers({ fetch, timeoutMs: 10, maxConcurrent: 1 }); const one = ports.resolveRoute!([[1, 2], [3, 4]], ctx);
  await expect(ports.resolveRoute!([[2, 3], [4, 5]], ctx)).rejects.toThrow("concurrency"); await expect(one).rejects.toThrow("abort");
});
it("persists only valid artifacts/state, isolates conversations and handles corrupt storage", () => {
  const entries = new Map<string, string>(); const storage = { getItem: (k: string) => entries.get(k) ?? null, setItem: (k: string, v: string) => { entries.set(k, v); }, removeItem: (k: string) => { entries.delete(k); } };
  const store = createArtifactStore(storage); store.save(createArtifact('root = Text("saved")', "same"), ctx); store.saveState({ count: 8 }, ctx);
  expect(store.load(ctx)?.state).toEqual({ count: 8 }); expect(store.load({ ...ctx, hostSessionId: "other" })).toBeNull();
  expect(() => store.save({ ...store.load(ctx)!, libraryId: "unknown" }, ctx)).toThrow();
  storage.setItem([...entries.keys()][0], "bad JSON"); expect(store.load(ctx)).toBeNull(); store.remove(ctx); expect(entries.size).toBe(0);
});
it("requires Host navigation policy and explicitly supplied browser capabilities", async () => {
  const open = vi.fn(), writeText = vi.fn(async () => {}); const ports = createBrowserPorts({ allowUrl: url => url.hostname === "example.com", open, writeText });
  expect(() => ports.openUrl!("file:///secret", ctx)).toThrow(); expect(() => ports.openUrl!("https://evil.com", ctx)).toThrow();
  ports.openUrl!("https://example.com", ctx); expect(open).toHaveBeenCalledWith("https://example.com/"); expect(await ports.copyText!("text", ctx)).toBe(true); expect(writeText).toHaveBeenCalledWith("text");
});
