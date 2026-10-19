import { act, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { createSystemPrompt, getComponentSpec } from "../src/prompt/index";
import { library, trustedLibrary } from "../src/react/library";
import { IntelligentUIRenderer } from "../src/react/renderer";
import { createArtifact, type JSONValue } from "../src/protocol/index";
import { exampleShoppingList, exampleTrip, exampleSteps, exampleDashboard } from "../src/react/prompt-options";

describe("model-independent prompt API", () => {
  it("keeps generated specs identical to the real registries", () => {
    expect(getComponentSpec()).toEqual(JSON.parse(JSON.stringify(library.toSpec())));
    expect(getComponentSpec("trusted-extras")).toEqual(JSON.parse(JSON.stringify(trustedLibrary.toSpec())));
    expect(getComponentSpec().components.HtmlView).toBeUndefined();
    expect(getComponentSpec().components.Map).toBeUndefined();
    expect(getComponentSpec().components.YouTube).toBeUndefined();
  });
  it("returns a defensive spec copy and generates signatures/rules/tool schemas", () => {
    const spec = getComponentSpec(); delete spec.components.Slider;
    expect(getComponentSpec().components.Slider).toBeTruthy();
    const prompt = createSystemPrompt({ tools: [{ name: "allowed_read", description: "Read only", inputSchema: { type: "object" }, outputSchema: { type: "object" } }], additionalRules: ["My domain rule"] });
    for (const text of ["Slider", "@", "allowed_read", "My domain rule", "Query"]) expect(prompt).toContain(text);
  });
});
describe("real mock streams and upstream prompt examples", () => {
  it("renders incremental chunks and resolves forward references at completion", async () => {
    const full = '$x = 4\nroot = Col([Slider($x, 0, 10), label])\nlabel = Text("Stream value: " + $x)';
    const a = createArtifact("", "chunked");
    const view = render(<IntelligentUIRenderer artifact={a} isStreaming />);
    async function* mockStream() { for (let i = 0; i < full.length; i += 7) { await Promise.resolve(); yield full.slice(i, i + 7); } }
    let source = "";
    for await (const chunk of mockStream()) { source += chunk; await act(async () => view.rerender(<IntelligentUIRenderer artifact={{ ...a, source }} isStreaming />)); }
    view.rerender(<IntelligentUIRenderer artifact={{ ...a, source }} isStreaming={false} />);
    await waitFor(() => expect(screen.getByText("Stream value: 4")).toBeTruthy());
    expect(view.container.querySelector(".iui-fallback")).toBeNull();
  });
  it("reports interrupted/incomplete source and recovers with a replacement artifact", () => {
    const view = render(<IntelligentUIRenderer artifact={createArtifact('root = Col([Text("unfinished")', "interrupted")} />);
    expect(screen.getByRole("status")).toBeTruthy();
    view.rerender(<IntelligentUIRenderer artifact={createArtifact('root = Text("Recovered")', "replacement")} />);
    expect(screen.getByText("Recovered")).toBeTruthy();
  });
  it.each([exampleShoppingList, exampleTrip, exampleSteps, exampleDashboard])("renders preserved upstream prompt example %#", async source => {
    const errors: string[] = [];
    const view = render(<IntelligentUIRenderer artifact={createArtifact(source, "upstream-example")} hostAdapter={{ allowedTools: ["get_orders"], invokeTool: async (): Promise<JSONValue> => ({ rows: [{ date: "2026-10-19", product: "Example", region: "North", amount: 12 }] }) }} onError={list => errors.push(...list.map(e => e.code))} />);
    await act(async () => { await Promise.resolve(); });
    expect(errors).toEqual([]);
    expect(view.container.querySelector(".iui-root")).toBeTruthy();
  });
});
