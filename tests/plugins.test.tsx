import { act, fireEvent, render, screen } from "@testing-library/react";
import { defineAction, defineComponent } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { expect, it, vi } from "vitest";
import { createArtifact } from "../src/protocol/index";
import { createIuiLibrary } from "../src/react/library";
import { createIuiRegistry } from "../src/react/registry";
import { IntelligentUIRenderer } from "../src/react/renderer";
import { upstreamRegistration, upstreamRegistry } from "../src/plugins/upstream";
import { htmlContentSecurityPolicy, createHtmlPlugin } from "../src/plugins/html/index";
import { configuredStyle } from "../src/plugins/map/config";
import { coordinate, lngLat, partialLine, pinEmoji, createPinElement } from "../src/plugins/map/map-utils";
import { galleryPrograms } from "../src/gallery/index";
import { getLibraryParser } from "../src/react/registry";
import { getComponentSpec, createSystemPrompt } from "../src/prompt/index";

it("registers all 55 original components, versions and generated backend spec", () => {
  expect(Object.keys(upstreamRegistration.library.components)).toHaveLength(55);
  expect(getComponentSpec("upstream")).toEqual(JSON.parse(JSON.stringify(upstreamRegistration.library.toSpec())));
  expect(createSystemPrompt({}, "upstream", "dashboard")).toContain("get_tickets");
  expect(createSystemPrompt()).toContain("Step-by-step instructions");
  expect(createSystemPrompt()).toContain("HtmlView is not registered");
});
it("parses every original gallery, composition, tool and prompt example", () => {
  expect(galleryPrograms).toHaveLength(45);
  expect(new Set(galleryPrograms.map(p => p.id)).size).toBe(45);
  const parser = getLibraryParser(upstreamRegistration.library);
  for (const program of galleryPrograms) { const result = parser.parse(program.code); expect(result.meta.errors.filter(e => e.severity !== "warning"), program.id).toEqual([]); expect(result.meta.incomplete, program.id).toBe(false); expect(result.meta.unresolved, program.id).toEqual([]); }
});
it("supports a Host custom component/action while rejecting implicit registration", async () => {
  const Greeting = defineComponent({ name: "Greeting", props: z.object({ name: z.string() }), component: ({ props }) => <strong>Hello {props.name}</strong> });
  const Ping = defineAction({ name: "Ping", params: z.object({ value: z.string() }), description: "Host ping" });
  const library = createIuiLibrary({ id: "custom", plugins: [{ id: "custom", components: [Greeting], actions: [Ping] }] });
  const registry = createIuiRegistry({ id: "custom", version: "2.1.0", library });
  const artifact = createArtifact('root = Col([Greeting("Ada"), Button("Ping", @Ping("test"))])', "plugin", undefined, { libraryId: "custom", libraryVersion: "2.1.0" });
  const onAction = vi.fn(); const view = render(<IntelligentUIRenderer artifact={artifact} />);
  expect(view.container.querySelector(".iui-fallback")).toBeTruthy();
  view.rerender(<IntelligentUIRenderer artifact={artifact} registry={registry} hostAdapter={{ onAction }} />);
  expect(screen.getByText("Hello Ada")).toBeTruthy();
  await act(async () => fireEvent.click(screen.getByRole("button", { name: "Ping" })));
  expect(onAction.mock.calls[0][0]).toEqual({ kind: "custom_action", name: "Ping", params: { value: "test" } });
  expect(() => createIuiRegistry({ id: "wrong", version: "2.1.0", library })).toThrow();
  expect(() => createIuiRegistry(...[registry.registrations[0], registry.registrations[0]])).toThrow("Duplicate");
  expect(() => createIuiLibrary({ plugins: [createHtmlPlugin()] })).toThrow("distinct");
  expect(() => createIuiLibrary({ id: "custom", plugins: [{ id: "dup", components: [Greeting, Greeting] }] })).toThrow("Duplicate");
});
it("keeps HTML opaque and dormant while streaming and validates resource policies", () => {
  const csp = htmlContentSecurityPolicy(); expect(csp).toContain("connect-src 'none'"); expect(csp).toContain("frame-src 'none'"); expect(csp).not.toContain("unsafe-eval");
  expect(() => createHtmlPlugin({ scriptOrigins: ["https://example.com/path"] })).toThrow();
  expect(htmlContentSecurityPolicy({ scriptOrigins: ["https://example.com"] })).toContain("https://example.com");
  const artifact = createArtifact('root = HtmlView("<h1>Inside</h1>")', "html", undefined, { libraryId: "upstream", libraryVersion: "0.1.0" });
  const view = render(<IntelligentUIRenderer registry={upstreamRegistry} artifact={artifact} isStreaming />);
  expect(view.container.querySelector("iframe")).toBeNull();
  view.rerender(<IntelligentUIRenderer registry={upstreamRegistry} artifact={artifact} />);
  expect(view.container.querySelector("iframe")?.getAttribute("sandbox")).toBe("allow-scripts");
  expect(view.container.querySelector("iframe")?.srcdoc).toContain("Inside");
});
it("defaults maps to an offline style, validates coordinates and offers accessible pins", () => {
  expect(configuredStyle({}, false).sources).toEqual({});
  expect(JSON.stringify(configuredStyle({ basemap: "openfreemap" }, false))).toContain("openfreemap");
  expect(coordinate({ lat: 91, lng: 0 })).toBeNull(); expect(coordinate({ lat: 0, lng: NaN })).toBeNull();
  expect(lngLat([20, 30])).toEqual([30, 20]); expect(partialLine([[0, 0], [0, 10]], 0.5)).toEqual([[0, 0], [0, 5]]);
  expect(pinEmoji("hello")).toBeNull(); expect(pinEmoji("🌳 tree")).toBe("🌳");
  const click = vi.fn(), pin = createPinElement(click); fireEvent.keyDown(pin.element, { key: "Enter" }); fireEvent.keyDown(pin.element, { key: " " }); fireEvent.click(pin.element); expect(click).toHaveBeenCalledTimes(3);
});
it("drops image results immediately when the Host capability changes", async () => {
  vi.useFakeTimers();
  try {
    const artifact = createArtifact('root = SearchImage("subject")', "image-context");
    const host = { resolveImage: async () => [{ url: "https://example.com/old.jpg" }] };
    const view = render(<IntelligentUIRenderer artifact={artifact} hostAdapter={host} />);
    await act(async () => vi.advanceTimersByTimeAsync(501)); expect(view.container.querySelector("img")?.src).toContain("old.jpg");
    view.rerender(<IntelligentUIRenderer artifact={artifact} hostAdapter={{}} />); expect(view.container.querySelector("img")).toBeNull();
  } finally { vi.useRealTimers(); }
});
