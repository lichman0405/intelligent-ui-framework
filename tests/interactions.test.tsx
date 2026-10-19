import { StrictMode } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IntelligentUIRenderer } from "../src/react/index";
import { createArtifact, type JSONValue } from "../src/protocol/index";
import { samples } from "../examples/vite-react-demo/src/samples";
describe("component/Host integration", () => {
  it("runs Query but never a Mutation during hydration or replay", async () => {
    const invokeTool = vi.fn(async (name: string): Promise<JSONValue> => name === "demo_read" ? { rows: [["Fetched", 42]] } : { saved: true });
    const host = { allowedTools: ["demo_read", "demo_save"], invokeTool };
    const a = createArtifact(samples[14].source, "tools", { $value: "restored" });
    const view = render(<StrictMode><IntelligentUIRenderer artifact={a} hostAdapter={host} /></StrictMode>);
    await waitFor(() => expect(screen.getByText("Fetched")).toBeTruthy());
    expect(invokeTool.mock.calls.filter(c => c[0] === "demo_save")).toHaveLength(0);
    fireEvent.click(screen.getByRole("button", { name: "Save mock" }));
    await waitFor(() => expect(invokeTool.mock.calls.filter(c => c[0] === "demo_save")).toHaveLength(1));
    view.unmount();
    render(<IntelligentUIRenderer artifact={a} hostAdapter={host} />);
    await waitFor(() => expect(screen.getByText("Fetched")).toBeTruthy());
    expect(invokeTool.mock.calls.filter(c => c[0] === "demo_save")).toHaveLength(1);
  });
  it("denies Query by default and never calls Host from a malformed completed artifact", async () => {
    const invokeTool = vi.fn(async () => null), report = vi.fn();
    const view = render(<IntelligentUIRenderer artifact={createArtifact('data = Query("demo_read", {}, {})\nroot = Text("Read")', "denied")} hostAdapter={{ invokeTool }} onError={report} />);
    await waitFor(() => expect(JSON.stringify(report.mock.calls)).toContain("tool-not-found"));
    expect(invokeTool).not.toHaveBeenCalled();
    view.rerender(<IntelligentUIRenderer artifact={createArtifact('data = Query("demo_read", {}, {})\nroot = Unknown("bad")', "broken")} hostAdapter={{ allowedTools: ["demo_read"], invokeTool }} />);
    expect(screen.getByRole("status")).toBeTruthy();
    await act(async () => { await Promise.resolve(); });
    expect(invokeTool).not.toHaveBeenCalled();
  });
  it("uses Host openUrl for Markdown links and ignores script URLs", () => {
    const openUrl = vi.fn();
    render(<IntelligentUIRenderer artifact={createArtifact('root = Text("[Safe](https://example.com) [Unsafe](javascript:alert)")', "links")} hostAdapter={{ openUrl }} />);
    fireEvent.click(screen.getByRole("link", { name: "Safe" }));
    expect(openUrl).toHaveBeenCalledTimes(1);
    expect(screen.queryByRole("link", { name: "Unsafe" })).toBeNull();
  });
  it("keeps HTML disabled and requires explicit library identity for trusted embeds", () => {
    const view = render(<IntelligentUIRenderer artifact={createArtifact('root = HtmlView("<script>bad</script>")', "html")} />);
    expect(screen.getByRole("status")).toBeTruthy();
    const artifact = { ...createArtifact('root = YouTube("dQw4w9WgXcQ")', "video"), libraryId: "core-trusted" };
    view.rerender(<IntelligentUIRenderer artifact={artifact} />);
    expect(screen.getByRole("status")).toBeTruthy();
    view.rerender(<IntelligentUIRenderer artifact={artifact} mode="trusted-extras" />);
    expect(view.container.querySelector("iframe")?.getAttribute("src")).toBe("https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ");
  });
  it("uses a bounded optional image resolver and handles failures without app-local APIs", async () => {
    const resolveImage = vi.fn(async () => [{ url: "javascript:bad" }, { url: "https://example.com/photo.png" }]);
    const view = render(<IntelligentUIRenderer artifact={createArtifact('root = SearchImage("A subject")', "image")} hostAdapter={{ resolveImage }} />);
    await waitFor(() => expect(view.container.querySelector("img")?.getAttribute("src")).toBe("https://example.com/photo.png"), { timeout: 1500 });
    expect(resolveImage.mock.calls[0][0]).toBe("A subject");
    view.unmount();
  });
});
