import assert from "node:assert/strict";
import { createServer } from "node:http";
import { readFile, writeFile, access } from "node:fs/promises";
import { resolve, sep, extname } from "node:path";
import { chromium } from "playwright-core";
const consumers = JSON.parse(await readFile("artifacts/consumer-results.json", "utf8"));
let executablePath = process.env.IUI_BROWSER_PATH;
if (!executablePath) for (const path of ["C:/Program Files/Google/Chrome/Application/chrome.exe", "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe"]) { try { await access(path); executablePath = path; break; } catch {} }
const browser = await chromium.launch({ executablePath, headless: true, args: ["--disable-background-networking", "--enable-unsafe-swiftshader"] });
const results = [];
try {
 for (const consumer of consumers.results) {
  const root = resolve(consumer.cwd, "dist");
  const server = createServer(async (req, res) => { try {
    const path = new URL(req.url, "http://localhost").pathname;
    if (path === "/favicon.ico") { res.writeHead(204).end(); return; }
    const file = resolve(root, `.${decodeURIComponent(path === "/" ? "/index.html" : path)}`);
    if (!file.startsWith(root + sep)) { res.writeHead(403).end(); return; }
    res.writeHead(200, { "Content-Type": { ".html": "text/html", ".js": "text/javascript", ".mjs": "text/javascript", ".css": "text/css", ".woff": "font/woff", ".woff2": "font/woff2" }[extname(file)] ?? "application/octet-stream" }); res.end(await readFile(file));
  } catch { res.writeHead(404).end(); } });
  await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
  const url = `http://127.0.0.1:${server.address().port}`, page = await browser.newPage({ viewport: { width: 1280, height: 1000 } });
  const errors = [], consoleErrors = [], requests = []; let imageSearch = 0, routes = 0;
  page.on("pageerror", error => errors.push(error.message));
  page.on("console", msg => { if (msg.type() === "error") consoleErrors.push(msg.text()); });
  await page.route("**/*", async route => {
    const href = route.request().url();
    if (href.startsWith(url + "/") || href.startsWith("blob:") || href.startsWith("data:")) return route.continue();
    requests.push(href);
    if (href.includes("wikipedia.org/api/rest_v1/page/summary")) { imageSearch++; return route.fulfill({ json: { originalimage: { source: "https://fixture.example/photo.png" } } }); }
    if (href.includes("router.project-osrm.org/route/")) { routes++; return route.fulfill({ json: { code: "Ok", routes: [{ geometry: { type: "LineString", coordinates: [[-122.42, 37.78], [-122.41, 37.79], [-122.40, 37.80]] } }] } }); }
    if (href.includes("youtube-nocookie.com")) return route.fulfill({ contentType: "text/html", body: "<!doctype html><title>Isolated embed fixture</title>" });
    if (/\.(png|jpe?g|webp)(?:\?|$)/i.test(href)) return route.fulfill({ contentType: "image/png", body: Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Y9Zl1sAAAAASUVORK5CYII=", "base64") });
    return route.abort();
  });
  const apply = async source => {
    const edit = page.locator("details").filter({ has: page.getByLabel("Program source") });
    if (!await edit.evaluate(el => el.open)) await edit.locator("summary").click();
    await page.getByLabel("Program source").fill(source);
    await page.getByRole("button", { name: "Apply program", exact: true }).click();
    await page.locator(".preview .iui-root").waitFor();
    assert.equal(await page.locator(".preview .iui-fallback").count(), 0);
  };
  try {
    await page.goto(`${url}/?gallery`); await page.locator("aside button").first().waitFor();
    assert.equal(await page.locator("aside button").count(), 45);
    for (let i = 0; i < 45; i++) {
      const button = page.locator("aside button").nth(i); const id = await button.getAttribute("data-program"); await button.click();
      await page.locator(".preview .iui-root").waitFor(); await page.waitForTimeout(100);
      assert.equal(await page.locator(".preview .iui-fallback").count(), 0, id);
      assert.equal(await page.locator('.preview [hidden]').count(), 0, `${id} runtime failed`);
      assert.equal(await page.locator(".events pre").textContent().then(text => text.includes('"errors"')), false, `${id} diagnostics`);
      if (i % 10 === 0) console.log(`Upstream ${consumer.zod}: ${i + 1}/45 rendered`);
    }
    assert.deepEqual(errors, []); assert.deepEqual(consoleErrors, []);
    await apply('$selected = ""\nroot = Col([Map([MapMarker("First", 37.78, -122.42, "Museums"), MapMarker("Second", 37.80, -122.40, "Parks")], true, $selected, 360), Text("Selected: " + $selected)])');
    await page.locator("canvas.maplibregl-canvas").waitFor(); await page.locator('.iui-map-marker[aria-label="First"]').waitFor();
    await page.locator('.iui-map-marker[aria-label="First"]').click(); await page.getByText("Selected: First", { exact: true }).waitFor();
    await page.getByLabel("Filter places").selectOption("Parks"); assert.equal(await page.locator(".iui-map-marker").count(), 1);
    await page.getByLabel("Filter places").selectOption("all");
    await page.getByRole("button", { name: /expand/i }).click(); await page.locator(".iui-map.is-expanded").waitFor(); await page.keyboard.press("Escape"); assert.equal(await page.locator(".iui-map.is-expanded").count(), 0);
    await page.getByLabel("Enable Wikipedia/Commons image search and OSRM routes").check();
    await page.waitForFunction(() => document.querySelector(".iui-map-slot")?.textContent.includes("Street route loaded."));
    assert.ok(routes > 0, "Host road resolver was not called");
    await page.screenshot({ path: resolve(`artifacts/upstream-map-zod-${consumer.zod}.png`), fullPage: true });
    await apply('root = SearchImage("Fixture subject")'); await page.locator('.preview .iui-root img').waitFor(); assert.ok(imageSearch > 0);
    await page.getByLabel("Enable Wikipedia/Commons image search and OSRM routes").uncheck();
    const payload = `<div id="checks">pending</div><canvas id="canvas" width="60" height="60"></canvas><button id="play">Play</button><script>let parentBlocked=false;try{parent.document.body}catch(e){parentBlocked=e.name==='SecurityError'}const g=document.getElementById('canvas').getContext('2d');g.fillRect(0,0,30,30);document.getElementById('play').onclick=()=>document.getElementById('checks').textContent='played';fetch('https://deny.example/network').then(()=>document.getElementById('checks').textContent='BAD').catch(()=>document.getElementById('checks').textContent=JSON.stringify({parentBlocked,require:typeof require,process:typeof process,canvas:!!g,networkBlocked:true}));</script>`;
    const html = `root = HtmlView(${JSON.stringify(payload)}, null, "Security fixture")`;
    const expectedErrors = consoleErrors.length;
    await apply(html); const frame = page.frameLocator('iframe[title="Security fixture"]');
    await frame.getByText(/networkBlocked/).waitFor();
    const checks = JSON.parse(await frame.locator("#checks").textContent()); assert.deepEqual(checks, { parentBlocked: true, require: "undefined", process: "undefined", canvas: true, networkBlocked: true });
    assert.equal(await page.locator('iframe[title="Security fixture"]').getAttribute("sandbox"), "allow-scripts");
    await frame.getByRole("button", { name: "Play" }).click(); await frame.getByText("played", { exact: true }).waitFor();
    await page.getByRole("button", { name: "Mock stream", exact: true }).click(); assert.equal(await page.locator('iframe[title="Security fixture"]').count(), 0);
    await page.getByRole("button", { name: "Interrupt", exact: true }).click();
    await apply(html); await frame.getByText(/networkBlocked/).waitFor();
    await page.evaluate(() => window.postMessage({ type: "iui-html-height", height: 2400 }, "*"));
    assert.ok(await page.locator(".iui-html-view").evaluate(el => el.getBoundingClientRect().height) < 2400);
    await page.screenshot({ path: resolve(`artifacts/upstream-html-zod-${consumer.zod}.png`), fullPage: true });
    await apply(`root = HtmlView(${JSON.stringify('<button id="escape" onclick="location.href=\'https://deny.example/navigation\'">Navigate</button>')}, null, "Navigation fixture")`);
    const navigation = page.frameLocator('iframe[title="Navigation fixture"]'); await navigation.getByRole("button", { name: "Navigate" }).click(); await page.waitForTimeout(200); await navigation.getByRole("button", { name: "Navigate" }).waitFor();
    assert.equal(requests.some(url => url.includes("deny.example")), false, "CSP allowed a forbidden request");
    assert.deepEqual(errors, []);
    const expectedCsp = consoleErrors.slice(expectedErrors); assert.ok(expectedCsp.every(message => /Content Security Policy|Refused to connect|violates.*policy|Fetch API cannot load/i.test(message)), JSON.stringify(expectedCsp));
    results.push({ zod: consumer.zod, originalPrograms: 45, realMapLibreWorker: true, markerSelection: true, filterExpand: true, fixtureImageAndRoutePorts: true, htmlScriptsAndCanvas: true, opaqueSandbox: true, cspFetchBlocked: true, parentCspNavigationBlocked: true, streamingDormant: true, forgedHeightIgnored: true, externalServices: "deterministic intercepted responses; no live API claims", status: "passed" });
    console.log(`Upstream ${consumer.zod}: all 45 + map, resolvers and sandbox passed`);
  } finally { await page.close(); await new Promise(resolve => server.close(resolve)); }
 }
 await writeFile("artifacts/upstream-browser-results.json", JSON.stringify({ browser: browser.version(), tarballSha256: consumers.sha256, results }, null, 2));
} finally { await browser.close(); }
