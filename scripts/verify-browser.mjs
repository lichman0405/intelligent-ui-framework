import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, mkdir, access, writeFile } from "node:fs/promises";
import { resolve, extname, sep } from "node:path";
import { chromium } from "playwright-core";
const artifacts = resolve("artifacts");
await mkdir(artifacts, { recursive: true });
let executablePath = process.env.IUI_BROWSER_PATH;
if (!executablePath) for (const candidate of ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"]) { try { await access(candidate); executablePath = candidate; break; } catch {} }
if (!executablePath) throw new Error("Set IUI_BROWSER_PATH to a local Chrome/Edge executable");
const browser = await chromium.launch({ executablePath, headless: true, args: ["--disable-background-networking"] });
const results = [];
const consumers = JSON.parse(await readFile(resolve(artifacts, "consumer-results.json"), "utf8"));
try {
  for (const zod of ["4.4.3", "3.25.76"]) {
    const fixture = consumers.results.find(result => result.zod === zod && result.status === "passed");
    if (!fixture) throw new Error(`Missing passed clean consumer ${zod}`);
    const root = resolve(fixture.cwd, "dist");
    const server = createServer(async (req, res) => {
      try {
        const path = new URL(req.url, "http://localhost").pathname;
        if (path === "/favicon.ico") { res.writeHead(204).end(); return; }
        const file = resolve(root, `.${decodeURIComponent(path === "/" ? "/index.html" : path)}`);
        if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
        const mime = { ".html": "text/html", ".js": "text/javascript", ".css": "text/css", ".woff2": "font/woff2", ".woff": "font/woff", ".ttf": "font/ttf" }[extname(file)] ?? "application/octet-stream";
        res.writeHead(200, { "Content-Type": mime }); res.end(await readFile(file));
      } catch { res.writeHead(404).end(); }
    });
    await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
    const url = `http://127.0.0.1:${server.address().port}`;
    const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
    const failures = [], externalRequests = [];
    page.on("pageerror", error => failures.push(error.message));
    page.on("console", message => { if (message.type() === "error") failures.push(message.text()); });
    await page.route("**/*", route => { if (route.request().url().startsWith(url + "/")) return route.continue(); externalRequests.push(route.request().url()); return route.abort(); });
    try {
      await page.goto(url);
      await page.getByText("Selected: 4", { exact: true }).waitFor();
      assert.equal(await page.locator("aside button").count(), 16);
      for (let i = 0; i < 16; i++) {
        await page.locator("aside button").nth(i).click();
        await page.locator(".preview .iui-root").waitFor();
        assert.equal(await page.locator(".preview .iui-fallback").count(), 0, `Gallery ${i + 1} fell back`);
      }
      await page.locator("aside button").nth(1).click();
      const slider = page.getByRole("slider");
      await slider.press("End"); for (let i = 0; i < 3; i++) await slider.press("ArrowLeft");
      await page.getByText("Selected: 7", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Save state", exact: true }).click();
      await page.getByRole("button", { name: "Reload state", exact: true }).click();
      await page.getByText("Selected: 7", { exact: true }).waitFor();
      await page.getByRole("button", { name: "Mock stream", exact: true }).click();
      await page.waitForFunction(() => document.querySelector(".iui-root")?.getAttribute("aria-busy") === null);
      await page.getByText("Selected: 7", { exact: true }).waitFor();
      if (zod === "4.4.3") await page.screenshot({ path: resolve(artifacts, "demo-light.png"), fullPage: true });
      const light = await page.locator(".iui-root").evaluate(el => getComputedStyle(el).getPropertyValue("--iui-ink"));
      await page.getByRole("button", { name: "Dark theme", exact: true }).click();
      const dark = await page.locator(".iui-root").evaluate(el => getComputedStyle(el).getPropertyValue("--iui-ink"));
      assert.notEqual(light, dark);
      assert.equal(await page.evaluate(() => getComputedStyle(document.documentElement).getPropertyValue("--iui-ink")), "");
      if (zod === "4.4.3") await page.screenshot({ path: resolve(artifacts, "demo-dark.png"), fullPage: true });
      await page.locator("aside button").nth(13).click();
      await page.getByRole("textbox", { name: "Name", exact: true }).fill("Grace");
      await page.getByRole("button", { name: "Continue", exact: true }).click();
      await page.waitForFunction(() => document.querySelector(".events pre")?.textContent.includes("continue_conversation") && document.querySelector(".events pre")?.textContent.includes("Grace"));
      await page.locator("aside button").nth(14).click();
      await page.getByText("Mock A", { exact: true }).waitFor();
      const before = await page.locator(".events pre").textContent();
      assert.equal((before.match(/"tool":"demo_save"/g) ?? []).length, 0);
      await page.getByRole("button", { name: "Save mock", exact: true }).click();
      await page.waitForFunction(() => document.querySelector(".events pre")?.textContent.includes('"tool":"demo_save"'));
      await page.locator("aside button").nth(1).click();
      await page.getByRole("button", { name: "Mock stream", exact: true }).click();
      await page.getByRole("button", { name: "Interrupt", exact: true }).click();
      await page.locator("aside button").nth(0).click();
      await page.locator(".iui-root").waitFor();
      await page.setViewportSize({ width: 390, height: 844 });
      await page.locator("aside button").nth(8).click();
      await page.locator(".iui-chart svg").waitFor();
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
      if (zod === "4.4.3") await page.screenshot({ path: resolve(artifacts, "demo-mobile.png"), fullPage: true });
      assert.deepEqual(failures, []); assert.deepEqual(externalRequests, []);
      results.push({ zod, galleryExamples: 16, stateRestore: true, streamingAndInterrupt: true, hostAction: true, queryMutation: true, themes: true, mobile: true, pageErrors: failures, externalRequests, status: "passed" });
      console.log(`Browser consumer ${zod}: 16 gallery examples, state, streaming, actions, tools, themes and mobile passed`);
    } finally { await page.close(); await new Promise(resolve => server.close(resolve)); }
  }
  await writeFile(resolve(artifacts, "browser-results.json"), JSON.stringify({ browser: browser.version(), executablePath, tarballSha256: consumers.sha256, results }, null, 2));
} finally { await browser.close(); }
