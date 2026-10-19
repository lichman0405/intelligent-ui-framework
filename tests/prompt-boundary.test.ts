// @vitest-environment node
import { build } from "esbuild";
import { expect, it } from "vitest";
it("bundles the backend Prompt API without React or renderer inputs", async () => {
  const output = await build({ entryPoints: ["src/prompt/index.ts"], bundle: true, platform: "node", format: "esm", packages: "external", write: false, metafile: true });
  expect(Object.keys(output.metafile!.inputs).some(path => /src\/react\//.test(path))).toBe(false);
  expect(output.outputFiles[0].text).not.toContain("@openuidev/react-lang");
});
