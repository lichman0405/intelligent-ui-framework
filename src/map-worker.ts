/** Stable package-relative asset URL, rewritten by bundlers such as Vite. */
export const mapWorkerUrl = new URL("./assets/maplibre-worker.mjs", import.meta.url).toString();
