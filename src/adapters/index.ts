import { validateArtifact, validateState, type ArtifactValidationOptions, type JSONValue, type UIActionContext, type UIArtifactV1, type UIHostAdapter } from "../protocol/index";
export interface WebResolverOptions {
  fetch?: typeof fetch;
  wikipediaOrigin?: string;
  commonsOrigin?: string;
  routeOrigin?: string;
  timeoutMs?: number;
  maxResponseBytes?: number;
  maxConcurrent?: number;
  cacheEntries?: number;
}
const contextKey = (ctx: UIActionContext) => JSON.stringify([ctx.hostSessionId, ctx.hostTurnId, ctx.artifactId]);
const point = (p: unknown): p is [number, number] => Array.isArray(p) && p.length === 2 && typeof p[0] === "number" && typeof p[1] === "number" && Number.isFinite(p[0]) && Number.isFinite(p[1]) && Math.abs(p[0]) <= 90 && Math.abs(p[1]) <= 180;
const origin = (value: string) => { const url = new URL(value); if (url.protocol !== "https:" || url.origin !== value || url.username || url.password) throw new Error("Resolver endpoints require exact HTTPS origins"); return value; };
function imageUrl(value: unknown): string | null {
  if (typeof value !== "string" || value.length > 4096) return null;
  try { const url = new URL(value.startsWith("//") ? `https:${value}` : value); return url.protocol === "https:" && !url.username && !url.password && !/\.(svg|gif)(?:$|[/?])/i.test(url.pathname) && !/(?:logo|flag|icon|seal|locator[_-]?map)/i.test(url.pathname) ? url.href : null; } catch { return null; }
}
/** Optional public-service ports. No requests or global fetch lookup occur until invoked. */
export function createWebResolvers(options: WebResolverOptions = {}): Pick<UIHostAdapter, "resolveImage" | "resolveRoute" | "onDispose"> {
  const wiki = origin(options.wikipediaOrigin ?? "https://en.wikipedia.org");
  const commons = origin(options.commonsOrigin ?? "https://commons.wikimedia.org");
  const route = origin(options.routeOrigin ?? "https://router.project-osrm.org");
  const pending = new Map<string, Set<AbortController>>(), cache = new Map<string, unknown>();
  let active = 0;
  const remember = <T,>(key: string, result: T): T => { cache.set(key, result); while (cache.size > Math.max(0, Math.min(256, options.cacheEntries ?? 32))) cache.delete(cache.keys().next().value!); return structuredClone(result); };
  async function json(url: string, ctx: UIActionContext): Promise<any> {
    if (active >= (options.maxConcurrent ?? 4)) throw new Error("Resolver concurrency limit exceeded");
    active++;
    const key = contextKey(ctx), controllers = pending.get(key) ?? new Set<AbortController>();
    pending.set(key, controllers);
    const controller = new AbortController(); controllers.add(controller);
    const timer = setTimeout(() => controller.abort(), options.timeoutMs ?? 10_000);
    try {
      const response = await (options.fetch ?? globalThis.fetch)(url, { signal: controller.signal, credentials: "omit", referrerPolicy: "no-referrer", redirect: "error", headers: { Accept: "application/json" } });
      if (!response.ok) throw new Error(`Resolver HTTP ${response.status}`);
      const max = Math.max(1, Math.min(options.maxResponseBytes ?? 2_097_152, 8_388_608));
      if (Number(response.headers.get("content-length")) > max) throw new Error("Resolver response too large");
      const reader = response.body?.getReader();
      if (!reader) throw new Error("Resolver returned no response body");
      const decoder = new TextDecoder(); let text = "", size = 0;
      try { while (true) { const { done, value } = await reader.read(); if (done) break; size += value.byteLength; if (size > max) throw new Error("Resolver response too large"); text += decoder.decode(value, { stream: true }); } text += decoder.decode(); }
      finally { await reader.cancel().catch(() => {}); reader.releaseLock(); }
      if (controller.signal.aborted) throw new Error("Resolver cancelled");
      return JSON.parse(text);
    } finally { clearTimeout(timer); active--; controllers.delete(controller); if (!controllers.size && pending.get(key) === controllers) pending.delete(key); }
  }
  return {
    async resolveImage(query, ctx) {
      if (typeof query !== "string" || !query.trim() || query.length > 512) return [];
      query = query.trim(); const key = `image:${query}`;
      if (cache.has(key)) return structuredClone(cache.get(key) as { url: string; alt: string }[]);
      const scope = contextKey(ctx), controllers = pending.get(scope) ?? new Set<AbortController>();
      pending.set(scope, controllers); const operation = new AbortController(); controllers.add(operation);
      try {
      const candidates: unknown[] = [];
      const read = async (url: string) => { if (operation.signal.aborted) return null; try { return await json(url, ctx); } catch { return null; } };
      const exact = await read(`${wiki}/api/rest_v1/page/summary/${encodeURIComponent(query.replaceAll(" ", "_"))}`);
      if (exact?.type !== "disambiguation") candidates.push(exact?.originalimage?.source, exact?.thumbnail?.source);
      if (!candidates.some(imageUrl)) {
        const media = await read(`${wiki}/api/rest_v1/page/media-list/${encodeURIComponent(query.replaceAll(" ", "_"))}`);
        for (const item of Array.isArray(media?.items) ? media.items.slice(0, 30) : []) if (item?.type === "image") for (const src of item.srcset ?? []) candidates.push(src.src);
      }
      if (!candidates.some(imageUrl)) {
        const params = new URLSearchParams({ action: "query", format: "json", formatversion: "2", origin: "*", generator: "search", gsrsearch: query, gsrlimit: "6", prop: "pageimages", piprop: "thumbnail", pithumbsize: "960" });
        const result = await read(`${wiki}/w/api.php?${params}`);
        for (const page of result?.query?.pages ?? []) candidates.push(page.thumbnail?.source);
      }
      for (const terms of [query, query.split(/\s+/).slice(0, 3).join(" "), query.split(/\s+/).slice(0, 2).join(" ")].filter((q, i, all) => all.indexOf(q) === i)) {
        if (candidates.some(imageUrl)) break;
        const params = new URLSearchParams({ action: "query", format: "json", formatversion: "2", origin: "*", generator: "search", gsrnamespace: "6", gsrsearch: `${terms} filetype:bitmap`, gsrlimit: "6", prop: "imageinfo", iiprop: "url|mime", iiurlwidth: "960" });
        const result = await read(`${commons}/w/api.php?${params}`);
        for (const page of result?.query?.pages ?? []) for (const image of page.imageinfo ?? []) if (/^image\/(jpeg|png|webp|avif)$/.test(image.mime)) candidates.push(image.thumburl ?? image.url);
      }
      const results = [...new Set(candidates.map(imageUrl).filter((url): url is string => !!url))].slice(0, 6).map(url => ({ url, alt: query }));
      return !operation.signal.aborted && results.length ? remember(key, results) : [];
      } finally { controllers.delete(operation); if (!controllers.size && pending.get(scope) === controllers) pending.delete(scope); }
    },
    async resolveRoute(points, ctx) {
      if (!Array.isArray(points) || points.length < 2 || points.length > 25 || !points.every(point)) throw new Error("Route requires 2–25 valid latitude/longitude pairs");
      const key = `route:${JSON.stringify(points)}`;
      if (cache.has(key)) return structuredClone(cache.get(key) as [number, number][]);
      const coords = points.map(([lat, lng]) => `${lng},${lat}`).join(";");
      const data = await json(`${route}/route/v1/driving/${coords}?overview=full&geometries=geojson&steps=false`, ctx);
      const geometry = data?.routes?.[0]?.geometry;
      if (data.code !== "Ok" || geometry?.type !== "LineString" || !Array.isArray(geometry.coordinates) || geometry.coordinates.length < 2 || geometry.coordinates.length > 20_000) throw new Error("Invalid route response");
      const result = geometry.coordinates.map((p: unknown) => Array.isArray(p) && p.length === 2 ? [p[1], p[0]] : null);
      if (!result.every(point)) throw new Error("Invalid route coordinates");
      return remember(key, result as [number, number][]);
    },
    onDispose(ctx) { const key = contextKey(ctx); for (const controller of pending.get(key) ?? []) controller.abort(); pending.delete(key); },
  };
}
export interface ArtifactStorage { getItem(key: string): string | null; setItem(key: string, value: string): void; removeItem(key: string): void }
/** Caller supplies storage and library signatures; no global browser state is accessed. */
export function createArtifactStore(storage: ArtifactStorage, options: ArtifactValidationOptions & { prefix?: string } = {}) {
  const key = (ctx: UIActionContext) => `${options.prefix ?? "iui:v1:"}${contextKey(ctx)}`;
  return {
    save(artifact: UIArtifactV1, ctx: UIActionContext) { const checked = validateArtifact(artifact, options); if (!checked.success || checked.data.artifactId !== ctx.artifactId) throw new Error("Invalid stored artifact"); storage.setItem(key(ctx), JSON.stringify(checked.data)); },
    load(ctx: UIActionContext): UIArtifactV1 | null { try { const raw = storage.getItem(key(ctx)); if (!raw || raw.length > 1_048_576) return null; const checked = validateArtifact(JSON.parse(raw), options); return checked.success && checked.data.artifactId === ctx.artifactId ? checked.data : null; } catch { return null; } },
    saveState(state: Record<string, JSONValue>, ctx: UIActionContext) { const checked = validateState(state); const artifact = this.load(ctx); if (!artifact || !checked.success) throw new Error("Missing artifact or invalid state"); this.save({ ...artifact, state: checked.data }, ctx); },
    remove(ctx: UIActionContext) { storage.removeItem(key(ctx)); },
  };
}
export function createBrowserPorts(options: { allowUrl: (url: URL) => boolean; open: (url: string) => void; writeText: (text: string) => Promise<void> }): Pick<UIHostAdapter, "openUrl" | "copyText"> {
  return {
    openUrl(raw) { const url = new URL(raw); if (!["https:", "http:"].includes(url.protocol) || url.username || url.password || !options.allowUrl(url)) throw new Error("Navigation denied by Host"); options.open(url.href); },
    async copyText(text) { if (typeof text !== "string" || text.length > 262_144) return false; await options.writeText(text); return true; },
  };
}
