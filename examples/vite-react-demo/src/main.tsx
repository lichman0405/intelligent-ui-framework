import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { IntelligentUIRenderer, createArtifact, type JSONValue, type UIHostAdapter } from "@intelligent-ui/framework";
import { createSystemPrompt } from "@intelligent-ui/framework/prompt";
import "@intelligent-ui/framework/styles.css";
import "./demo.css";
import { samples } from "./samples";
const systemPrompt = createSystemPrompt();

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selected, select] = useState(1);
  const [events, setEvents] = useState<string[]>([]);
  const [revision, reload] = useState(0);
  const [stream, setStream] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const state = useRef<Record<string, JSONValue>>({});
  const saved = useRef<Record<string, JSONValue>>({});
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const log = (event: unknown) => setEvents(e => [JSON.stringify(event), ...e].slice(0, 8));
  const host = useMemo<UIHostAdapter>(() => ({
    allowedTools: ["demo_read", "demo_save"],
    invokeTool: async (name, args): Promise<JSONValue> => { log({ tool: name, args }); return name === "demo_read" ? { rows: [["Mock A", 12], ["Mock B", 18]] } : { saved: true }; },
    onAction: action => log(action),
    onStateChange: next => { state.current = next; },
    copyText: async text => { await navigator.clipboard.writeText(text); return true; },
    openUrl: url => { window.open(url, "_blank", "noopener,noreferrer"); },
  }), []);
  const stop = () => { if (timer.current) clearInterval(timer.current); timer.current = null; setStreaming(false); };
  const start = () => {
    stop(); setStream(""); setStreaming(true); let offset = 0;
    const source = samples[selected].source;
    timer.current = setInterval(() => { offset += 13; setStream(source.slice(0, offset)); if (offset >= source.length) stop(); }, 70);
  };
  const sample = samples[selected];
  const artifact = useMemo(() => createArtifact(stream ?? sample.source, sample.id, saved.current), [stream, sample, revision]);
  return <main className={`demo ${theme}`}>
    <header><div><p className="eyebrow">STANDALONE REACT FRAMEWORK</p><h1>Intelligent UI</h1><p>51 components · reactive state · controlled Host tools</p></div><button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "Dark" : "Light"} theme</button></header>
    <div className="workspace"><aside aria-label="Gallery examples">{samples.map((s, i) => <button key={s.id} className={i === selected ? "selected" : ""} onClick={() => { stop(); select(i); setStream(null); state.current = {}; saved.current = {}; reload(r => r + 1); }}>{String(i + 1).padStart(2, "0")} {s.title}</button>)}</aside>
      <section className="preview"><h2>{sample.title}</h2><div className="toolbar"><button onClick={start}>Mock stream</button><button onClick={stop} disabled={!streaming}>Interrupt</button><button onClick={() => { saved.current = state.current; log({ savedState: saved.current }); }}>Save state</button><button onClick={() => reload(r => r + 1)}>Reload state</button></div>
        <IntelligentUIRenderer key={revision} artifact={artifact} hostAdapter={host} theme={theme} isStreaming={streaming} onError={errors => { if (errors.length) log({ errors }); }} />
        <details><summary>OpenUI Lang source</summary><pre>{stream ?? sample.source}</pre></details>
        <details><summary>Generated system prompt</summary><pre>{systemPrompt}</pre></details>
      </section>
    </div><section className="events"><h2>Host events</h2><pre>{events.join("\n") || "Interact with the UI to see structured events."}</pre></section>
  </main>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
