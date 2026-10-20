import { useEffect, useMemo, useRef, useState } from "react";
import { IntelligentUIRenderer, createArtifact, type JSONValue, type UIHostAdapter } from "@intelligent-ui/framework";
import "@intelligent-ui/framework/styles.css";

const complete = '$x = 4\nroot = Col([Slider($x, 0, 10, 1, "Value"), Text("Selected: " + $x)])';
async function* mockDeltas(signal: AbortSignal) {
  for (let offset = 0; offset < complete.length; offset += 11) {
    await new Promise(resolve => setTimeout(resolve, 35));
    if (signal.aborted) return;
    yield complete.slice(offset, offset + 11);
  }
}
export default function StreamingState() {
  const [source, setSource] = useState(complete);
  const [streaming, setStreaming] = useState(false);
  const [artifactId, setArtifactId] = useState("stream-0");
  const [mount, setMount] = useState(0);
  const [hydration, setHydration] = useState<Record<string, JSONValue>>({});
  const [notice, setNotice] = useState("");
  const request = useRef<AbortController | null>(null);
  const generation = useRef(0);
  const latest = useRef<Record<string, JSONValue>>({});
  const saved = useRef(new Map<string, Record<string, JSONValue>>());
  useEffect(() => () => { generation.current++; request.current?.abort(); }, []);
  const host = useMemo<UIHostAdapter>(() => ({ onStateChange: state => { latest.current = state; } }), []);
  const artifact = useMemo(() => createArtifact(source, artifactId, hydration), [source, artifactId, hydration]);
  async function start() {
    request.current?.abort(); const run = ++generation.current;
    const controller = new AbortController(); request.current = controller;
    setArtifactId(`stream-${run}`); setSource(""); setHydration({}); latest.current = {};
    setStreaming(true); setNotice("");
    try { for await (const delta of mockDeltas(controller.signal)) { if (run !== generation.current || controller.signal.aborted) return; setSource(previous => previous + delta); } }
    catch { if (run === generation.current) setNotice("Transport failed"); }
    finally { if (run === generation.current) setStreaming(false); }
  }
  function cancel() { generation.current++; request.current?.abort(); setStreaming(false); setNotice("Cancelled; incomplete source uses fallback."); }
  return <main>
    <button onClick={() => void start()}>Stream a new message</button>
    <button onClick={cancel} disabled={!streaming}>Cancel</button>
    <button disabled={streaming} onClick={() => { saved.current.set(artifactId, structuredClone(latest.current)); setNotice("Saved in memory"); }}>Save state</button>
    <button disabled={streaming} onClick={() => { setHydration(structuredClone(saved.current.get(artifactId) ?? {})); setMount(value => value + 1); }}>Restore state</button>
    <p>{notice}</p>
    <IntelligentUIRenderer key={mount} artifact={artifact} hostAdapter={host} isStreaming={streaming}
      hostSessionId="session-demo" hostTurnId="turn-demo" fallback={<p>UI source is incomplete or invalid.</p>} />
  </main>;
}
