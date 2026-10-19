import { StrictMode, useEffect, useMemo, useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import { IntelligentUIRenderer, createArtifact, type JSONValue, type UIHostAdapter } from "@intelligent-ui/framework";
import { createSystemPrompt } from "@intelligent-ui/framework/prompt";
import { galleryPrograms, demoTools } from "@intelligent-ui/framework/gallery";
import { createUpstreamRegistration } from "@intelligent-ui/framework/plugins/upstream";
import { createIuiRegistry } from "@intelligent-ui/framework/react";
import { createWebResolvers } from "@intelligent-ui/framework/adapters";
import "@intelligent-ui/framework/styles.css";
import "@intelligent-ui/framework/plugins/map/styles.css";
import "./demo.css";
import { samples as coreSamples } from "./samples";
const original = new URLSearchParams(location.search).has("gallery");
const samples = original ? galleryPrograms.map(p => ({ id: p.id, title: p.title, source: p.code })) : coreSamples;
const systemPrompt = createSystemPrompt({}, original ? "upstream" : "core");
const demoBudget = { maxToolResultBytes: 4_194_304, maxToolResultNodes: 250_000 };

function App() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [selected, select] = useState(1);
  const [events, setEvents] = useState<string[]>([]);
  const [revision, reload] = useState(0);
  const [stream, setStream] = useState<string | null>(null);
  const [streaming, setStreaming] = useState(false);
  const [network, setNetwork] = useState(false);
  const [basemap, setBasemap] = useState(false);
  const [edited, setEdited] = useState<string | null>(null);
  const editor = useRef<HTMLTextAreaElement>(null);
  const resolvers = useMemo(() => createWebResolvers(), []);
  const registry = useMemo(() => original ? createIuiRegistry(createUpstreamRegistration({ map: { basemap: basemap ? "openfreemap" : "blank" } })) : undefined, [basemap]);
  const state = useRef<Record<string, JSONValue>>({});
  const saved = useRef<Record<string, JSONValue>>({});
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => () => { if (timer.current) clearInterval(timer.current); }, []);
  const log = (event: unknown) => setEvents(e => [JSON.stringify(event), ...e].slice(0, 8));
  const host = useMemo<UIHostAdapter>(() => ({
    ...(network ? resolvers : {}),
    allowedTools: ["demo_read", "demo_save", ...Object.keys(demoTools)],
    invokeTool: async (name, args): Promise<JSONValue> => { log({ tool: name, args }); if (demoTools[name]) return await demoTools[name](args) as JSONValue; return name === "demo_read" ? { rows: [["Mock A", 12], ["Mock B", 18]] } : { saved: true }; },
    onAction: action => log(action),
    onStateChange: next => { state.current = next; },
    copyText: async text => { await navigator.clipboard.writeText(text); return true; },
    openUrl: url => { window.open(url, "_blank", "noopener,noreferrer"); },
  }), [network, resolvers]);
  const stop = () => { if (timer.current) clearInterval(timer.current); timer.current = null; setStreaming(false); };
  const start = () => {
    stop(); setStream(""); setStreaming(true); let offset = 0;
    const source = edited ?? samples[selected].source;
    timer.current = setInterval(() => { offset += 13; setStream(source.slice(0, offset)); if (offset >= source.length) stop(); }, 70);
  };
  const sample = samples[selected];
  const artifact = useMemo(() => createArtifact(stream ?? edited ?? sample.source, sample.id, saved.current, original ? { libraryId: "upstream", libraryVersion: "0.1.0" } : undefined), [stream, edited, sample, revision]);
  return <main className={`demo ${theme}`}>
    <header><div><p className="eyebrow">STANDALONE REACT FRAMEWORK</p><h1>Intelligent UI</h1><p>{original ? `55 components · ${galleryPrograms.length} upstream programs` : "51 core components · 16 framework examples"}</p><a href={original ? "./" : "?gallery"}>{original ? "Framework examples" : `Original gallery (${galleryPrograms.length})`}</a></div><button onClick={() => setTheme(theme === "light" ? "dark" : "light")}>{theme === "light" ? "Dark" : "Light"} theme</button></header>
    <div className="workspace"><aside aria-label="Gallery examples">{samples.map((s, i) => <button key={s.id} data-program={s.id} className={i === selected ? "selected" : ""} onClick={() => { stop(); select(i); setStream(null); setEdited(null); state.current = {}; saved.current = {}; reload(r => r + 1); }}>{String(i + 1).padStart(2, "0")} {s.title}</button>)}</aside>
      <section className="preview"><h2>{sample.title}</h2><div className="toolbar"><button onClick={start}>Mock stream</button><button onClick={stop} disabled={!streaming}>Interrupt</button><button onClick={() => { saved.current = state.current; log({ savedState: saved.current }); }}>Save state</button><button onClick={() => reload(r => r + 1)}>Reload state</button></div>
        {original && <div><label><input type="checkbox" checked={network} onChange={event => setNetwork(event.target.checked)} /> Enable Wikipedia/Commons image search and OSRM routes</label><br /><label><input type="checkbox" checked={basemap} onChange={event => { setBasemap(event.target.checked); reload(r => r + 1); }} /> Enable public basemap tiles</label></div>}
        <IntelligentUIRenderer key={revision} artifact={artifact} registry={registry} toolOptions={demoBudget} hostAdapter={host} theme={theme} isStreaming={streaming} onError={errors => { if (errors.length) log({ errors }); }} />
        <details key={`${selected}-${revision}`}><summary>Edit program</summary><textarea ref={editor} aria-label="Program source" defaultValue={edited ?? sample.source} style={{ width: "100%", minHeight: 180 }} /><button onClick={() => { stop(); setStream(null); setEdited(editor.current?.value ?? null); }}>Apply program</button></details>
        <details><summary>OpenUI Lang source</summary><pre>{stream ?? sample.source}</pre></details>
        <details><summary>Generated system prompt</summary><pre>{systemPrompt}</pre></details>
      </section>
    </div><section className="events"><h2>Host events</h2><pre>{events.join("\n") || "Interact with the UI to see structured events."}</pre></section>
  </main>;
}
createRoot(document.getElementById("root")!).render(<StrictMode><App /></StrictMode>);
