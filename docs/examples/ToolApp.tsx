import { useMemo, useState } from "react";
import { IntelligentUIRenderer, createArtifact, type UIHostAdapter, type JSONValue } from "@intelligent-ui/framework";
import "@intelligent-ui/framework/styles.css";

const artifact = createArtifact(`$label = "example"
data = Query("demo_read", {}, {rows: []})
save = Mutation("demo_save", {label: $label})
root = Col([Table(["Name", "Count"], data.rows), Input($label, "Label"), Button("Save mock", @Run(save))])`, "tools-1");
const budgets = { maxCalls: 100, maxConcurrent: 4, toolTimeoutMs: 30_000, maxToolResultBytes: 262_144, maxToolResultNodes: 30_000 };

export default function ToolApp() {
  const [events, setEvents] = useState<string[]>([]);
  const host = useMemo<UIHostAdapter>(() => ({
    allowedTools: ["demo_read", "demo_save"],
    invokeTool: async (name, args, ctx): Promise<JSONValue> => {
      setEvents(previous => [...previous, JSON.stringify({ name, args, ctx })]);
      if (name === "demo_read") return { rows: [["Mock A", 12], ["Mock B", 18]] };
      if (name === "demo_save" && typeof args.label === "string" && args.label.length <= 128) return { saved: true, label: args.label };
      throw new Error("Invalid mock request");
    },
  }), []);
  return <main><IntelligentUIRenderer artifact={artifact} hostAdapter={host} toolOptions={budgets}
    hostSessionId="session-demo" hostTurnId="turn-demo" /><pre>{events.join("\n")}</pre></main>;
}
