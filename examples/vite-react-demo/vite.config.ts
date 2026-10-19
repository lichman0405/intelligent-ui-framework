import { defineConfig } from "vite";
import { fileURLToPath } from "node:url";
export default defineConfig({ root: fileURLToPath(new URL(".", import.meta.url)), logLevel: "warn", server: { host: "127.0.0.1", port: 5173 }, build: { outDir: "dist", reportCompressedSize: false } });
