import { useMemo, useState } from "react";
import { IntelligentUIRenderer, createArtifact, type UIHostAdapter } from "@intelligent-ui/framework";
import "@intelligent-ui/framework/styles.css";

const artifact = createArtifact(`$x = 4
root = Col([Title("Interactive UI", "md"), Slider($x, 0, 10, 1, "Value"), Text("Selected: " + $x), Button("Continue", @ToAssistant("Use this value"))])`, "basic-1");

export default function BasicApp() {
  const [events, setEvents] = useState<string[]>([]);
  const host = useMemo<UIHostAdapter>(() => ({
    onAction: (action, ctx) => setEvents(previous => [...previous, JSON.stringify({ action, ctx })]),
  }), []);
  return <main style={{ maxWidth: 760, margin: "32px auto", padding: 16 }}>
    <IntelligentUIRenderer artifact={artifact} hostAdapter={host}
      hostSessionId="session-demo" hostTurnId="turn-demo" theme="light" />
    <pre>{events.join("\n")}</pre>
  </main>;
}
