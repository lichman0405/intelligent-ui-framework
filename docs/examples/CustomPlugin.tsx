import { defineAction, defineComponent, defineFunction } from "@openuidev/react-lang";
import { z } from "zod/v4";
import { createArtifact, createIuiLibrary, createIuiRegistry, IntelligentUIRenderer, type UIHostAdapter } from "@intelligent-ui/framework";
import { createSystemPrompt } from "@intelligent-ui/framework/prompt";
import "@intelligent-ui/framework/styles.css";

const Measurement = defineComponent({
  name: "Measurement", description: "Display one supplied value with its supplied unit; no conversion.",
  props: z.object({ value: z.number(), unit: z.string() }),
  component: ({ props }) => <output>{props.value} {props.unit}</output>,
});
const Twice = defineFunction({ name: "Twice", description: "Double a supplied number", params: z.object({ value: z.number() }), returns: z.number(), fn: ({ value }) => value * 2 });
const Inspect = defineAction({ name: "Inspect", description: "Ask Host to inspect a result ID", params: z.object({ resultId: z.string() }) });
export const customLibrary = createIuiLibrary({ id: "measurement-demo", plugins: [{ id: "Measurement demo", components: [Measurement], functions: [Twice], actions: [Inspect] }] });
export const customRegistry = createIuiRegistry({ id: "measurement-demo", version: "1.0.0", library: customLibrary });
export const customSpec = customLibrary.toSpec();
// Export/serialize customSpec for backend use; the backend can import /prompt alone.
export const systemPrompt = createSystemPrompt({}, customSpec);
const artifact = createArtifact('root = Col([Measurement(@Twice(2), "eV"), Button("Inspect result", @Inspect("mock-result-1"))])', "custom-1", undefined, { libraryId: "measurement-demo", libraryVersion: "1.0.0" });
const host: UIHostAdapter = { onAction: action => { console.info(action); } };
export default function CustomPlugin() { return <IntelligentUIRenderer artifact={artifact} registry={customRegistry} hostAdapter={host} />; }
