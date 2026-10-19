import { mkdirSync } from "node:fs";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
const temp = resolve(".tmp");
mkdirSync(temp, { recursive: true });
const result = spawnSync(process.execPath, [resolve("node_modules/vitest/vitest.mjs"), "run", ...process.argv.slice(2)], { stdio: "inherit", env: { ...process.env, TMP: temp, TEMP: temp, TZ: "UTC", OPENUI_TELEMETRY_DISABLED: "1" } });
process.exit(result.status ?? 1);
