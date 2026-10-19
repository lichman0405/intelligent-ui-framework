import { programs } from "./programs";
import { compositionPrograms } from "./composition-programs";
import { toolPrograms } from "./tool-programs";
import { exampleShoppingList, exampleTrip, exampleSteps, exampleDashboard } from "../prompt/presets";
import { createArtifact } from "../protocol/index";
export { programs, compositionPrograms, toolPrograms };
export { demoTools, demoToolSpecs } from "./demo-data";
export type { Program } from "./programs";
export type { ToolProgram } from "./tool-programs";
export const galleryPrograms = [
  ...programs.map(p => ({ ...p, id: `component-${p.id}`, category: "components" })),
  ...compositionPrograms.map(p => ({ ...p, id: `composition-${p.id}`, category: "composition" })),
  ...toolPrograms.map(p => ({ ...p, id: `tool-${p.id}`, category: "tools" })),
  ...[exampleShoppingList, exampleTrip, exampleSteps, exampleDashboard].map((code, i) => ({ id: `prompt-${i + 1}`, title: ["Shopping list", "Lisbon trip", "Bookcase instructions", "Sales dashboard"][i], note: "Original upstream prompt example", code, category: "prompt" })),
].map(p => ({ ...p, capabilities: [...(/\bMap\(/.test(p.code) ? ["map"] : []), ...(/\bHtmlView\(/.test(p.code) ? ["html"] : []), ...(/\bYouTube\(/.test(p.code) ? ["video"] : []), ...(/\bQuery\(/.test(p.code) ? ["tools"] : [])] }));
export function createGalleryArtifact(id: string) {
  const program = galleryPrograms.find(p => p.id === id);
  if (!program) throw new Error("Unknown gallery program");
  return createArtifact(program.code, program.id, undefined, { libraryId: "upstream", libraryVersion: "0.1.0" });
}
