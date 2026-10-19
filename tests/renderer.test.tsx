import { StrictMode } from "react";
import { act, fireEvent, render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { IntelligentUIRenderer } from "../src/react/index";
import { createArtifact, type Diagnostic } from "../src/protocol/index";
import { samples } from "../examples/vite-react-demo/src/samples";
describe("official React Renderer bridge", () => {
  it.each(samples)("renders gallery: $id", async sample => {
    const errors: Diagnostic[][] = [];
    const host = { allowedTools: ["demo_read", "demo_save"], invokeTool: async () => ({ rows: [["Mock", 2]] }) };
    const view = render(<IntelligentUIRenderer artifact={createArtifact(sample.source, sample.id)} hostAdapter={host} onError={list => errors.push(list)} />);
    await waitFor(() => expect(view.container.querySelector(".iui-root")?.textContent?.length).toBeGreaterThan(0));
    await act(async () => { await Promise.resolve(); });
    expect(errors.flat()).toEqual([]);
    expect(view.container.querySelector(".iui-fallback")).toBeNull();
  });
  it("updates reactive expressions, saves and reloads the exact raw state", async () => {
    const changed = vi.fn();
    const a = createArtifact(samples[1].source, "state", { $x: 6 });
    const view = render(<IntelligentUIRenderer artifact={a} hostAdapter={{ onStateChange: changed }} />);
    expect(screen.getByText("Selected: 6")).toBeTruthy();
    fireEvent.change(screen.getByRole("slider"), { target: { value: "8" } });
    expect(screen.getByText("Selected: 8")).toBeTruthy();
    await waitFor(() => expect(changed).toHaveBeenCalled());
    const restored = changed.mock.calls.at(-1)![0];
    expect(restored.$x).toBe(8);
    view.unmount();
    render(<IntelligentUIRenderer artifact={{ ...a, state: restored }} />);
    expect(screen.getByText("Selected: 8")).toBeTruthy();
  });
  it("preserves mounted state while streaming forward references resolve", async () => {
    const a = createArtifact('$x = 4\nroot = Col([Slider($x, 0, 10), label])', "stream");
    const view = render(<IntelligentUIRenderer artifact={a} isStreaming />);
    view.rerender(<IntelligentUIRenderer artifact={{ ...a, source: a.source + '\nlabel = Text("Value: " + $x)' }} isStreaming={false} />);
    await waitFor(() => expect(screen.getByText("Value: 4")).toBeTruthy());
    expect(screen.getByRole("slider")).toBeTruthy();
  });
  it("isolates state across Host session/turn identities", () => {
    const a = createArtifact(samples[1].source, "same-id");
    const view = render(<IntelligentUIRenderer artifact={a} hostSessionId="a" />);
    fireEvent.change(screen.getByRole("slider"), { target: { value: "9" } });
    view.rerender(<IntelligentUIRenderer artifact={a} hostSessionId="b" />);
    expect(screen.getByText("Selected: 4")).toBeTruthy();
  });
  it("reports invalid schema and unknown components with a safe fallback", async () => {
    const report = vi.fn();
    const view = render(<IntelligentUIRenderer artifact={{ kind: "invalid" }} onError={report} />);
    expect(screen.getByRole("status")).toBeTruthy();
    expect(report).toHaveBeenCalled();
    view.rerender(<IntelligentUIRenderer artifact={createArtifact('root = DoesNotExist("bad")', "invalid")} onError={report} />);
    await waitFor(() => expect(view.container.querySelector(".iui-fallback")).toBeTruthy());
  });
  it("maps a real ToAssistant event and Host context", async () => {
    const onAction = vi.fn();
    render(<StrictMode><IntelligentUIRenderer artifact={createArtifact(samples[13].source, "form")} hostAdapter={{ onAction }} hostSessionId="host-session" hostTurnId="host-turn" /></StrictMode>);
    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    await waitFor(() => expect(onAction).toHaveBeenCalledTimes(1));
    expect(onAction.mock.calls[0][0]).toMatchObject({ kind: "continue_conversation", message: "Help me choose" });
    expect(onAction.mock.calls[0][1]).toEqual({ artifactId: "form", hostSessionId: "host-session", hostTurnId: "host-turn" });
  });
});
