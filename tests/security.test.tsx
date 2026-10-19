import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IntelligentUIRenderer } from "../src/react/renderer";
import { createArtifact } from "../src/protocol/index";
import { bg, fg, size, webUrl } from "../src/react/components/style";
describe("untrusted visual data", () => {
  it("rejects CSS network/expression injection and privileged URL schemes", () => {
    for (const attack of ['url("https://example.com/track")', "expression(alert(1))", "red;position:fixed", "var(--host-secret)"]) { expect(bg(attack)).toBeUndefined(); expect(fg(attack)).toBeUndefined(); }
    expect(size("10px; background:url(https://example.com)")).toBeUndefined();
    expect(webUrl("file:///private")).toBeNull();
  });
  it("renders KaTeX without trusting hyperlinks, external images or raw HTML", () => {
    const source = String.raw`root = Math("\\href{javascript:alert(1)}{bad} + \\includegraphics{https://example.com/track}")`;
    const view = render(<IntelligentUIRenderer artifact={createArtifact(source, "math-security")} />);
    expect(view.container.querySelector("a, img, script, iframe")).toBeNull();
  });
});
