import { generateSystemPrompt, type LibrarySpec, type SystemPromptOptions } from "@openuidev/lang-core";
import core from "../generated/library-spec.json";
import trusted from "../generated/trusted-library-spec.json";

export type { LibrarySpec, SystemPromptOptions, ToolSpec } from "@openuidev/lang-core";
export function getComponentSpec(mode: "core" | "trusted-extras" = "core"): LibrarySpec {
  return JSON.parse(JSON.stringify(mode === "trusted-extras" ? trusted : core)) as LibrarySpec;
}
/** Pure prompt construction. No provider, API key, or model request is created. */
export function createSystemPrompt(options: SystemPromptOptions = {}, mode: "core" | "trusted-extras" = "core"): string {
  return generateSystemPrompt({ library: getComponentSpec(mode), promptOptions: {
    bindings: true,
    ...options,
    additionalRules: [
      "Use only the registered components and functions. Do not produce JavaScript, HTML scripts, or unknown tools.",
      "Every input changes visible content via $variables or sends a short @ToAssistant action. Host owns conversation and tool permissions.",
      "Do not invent data. Query only tools explicitly included in this prompt; mutations require the Host's authorization.",
      "SearchImage requires an optional Host resolver. Never assume image search, Map or HtmlView is available.",
      ...(options.additionalRules ?? []),
    ],
  } });
}
