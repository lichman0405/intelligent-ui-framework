import { generateSystemPrompt, type LibrarySpec, type SystemPromptOptions } from "@openuidev/lang-core";
import core from "../generated/library-spec.json";
import trusted from "../generated/trusted-library-spec.json";
import upstream from "../generated/upstream-library-spec.json";
import { promptOptions, dashboardPromptOptions } from "./presets";
export { promptOptions, dashboardPromptOptions, exampleShoppingList, exampleTrip, exampleSteps, exampleDashboard } from "./presets";

export type { LibrarySpec, SystemPromptOptions, ToolSpec } from "@openuidev/lang-core";
export type PromptLibrary = "core" | "trusted-extras" | "upstream" | LibrarySpec;
export function getComponentSpec(mode: PromptLibrary = "core"): LibrarySpec {
  return JSON.parse(JSON.stringify(typeof mode === "object" ? mode : mode === "upstream" ? upstream : mode === "trusted-extras" ? trusted : core)) as LibrarySpec;
}
/** Pure prompt construction. No provider, API key, or model request is created. */
export function createSystemPrompt(options: SystemPromptOptions = {}, mode: PromptLibrary = "core", profile: "chat" | "dashboard" = "chat"): string {
  const spec = getComponentSpec(mode);
  const preset = profile === "dashboard" ? dashboardPromptOptions : promptOptions;
  const rules = (preset.additionalRules ?? []).map(rule => rule
    .replace("SearchImage for every place, dish, product or thing that has a look (the app finds the photo, so never say you cannot show photos)", "SearchImage for visual subjects when Host supplies an image resolver")
    .replace("Map with MapMarker for places and routes; ", spec.components.Map ? "Map with MapMarker for places and routes; " : "")
    .replace("HtmlView only for a game or animation that needs a loop.", spec.components.HtmlView ? "HtmlView only for a game or animation that needs a loop." : "Use reactive Svg for animation; HtmlView is not registered."));
  return generateSystemPrompt({ library: spec, promptOptions: {
    ...preset,
    bindings: true,
    ...options,
    additionalRules: [
      ...rules,
      "Use only registered components, functions and tools. Outside an explicitly registered HtmlView, never produce JavaScript or HTML scripts.",
      "Every input changes visible content via $variables or sends a short @ToAssistant action. Host owns conversation and tool permissions.",
      "Do not invent data. Query only tools explicitly included in this prompt; mutations require the Host's authorization.",
      "SearchImage requires an optional Host resolver. Use Map, HtmlView and YouTube only if present in the component specification. HTML scripts are permitted only inside an explicitly registered HtmlView sandbox.",
      ...(options.additionalRules ?? []),
    ],
  } });
}
