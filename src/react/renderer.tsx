import { Renderer, type OpenUIError } from "@openuidev/react-lang";
import { createParser } from "@openuidev/lang-core";
import { Component, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { validateArtifact, type Diagnostic, type UIArtifactV1, type UIHostAdapter, type UIActionContext, type ArtifactValidationOptions } from "../protocol/index";
import { createHostBridge, HostContext } from "./host";
import { library, trustedLibrary } from "./library";

export interface IntelligentUIRendererProps {
  artifact: UIArtifactV1 | unknown;
  isStreaming?: boolean;
  hostAdapter?: UIHostAdapter;
  hostSessionId?: string;
  hostTurnId?: string;
  theme?: "light" | "dark";
  themeTokens?: Readonly<Record<`--iui-${string}`, string>>;
  mode?: "core" | "trusted-extras";
  onError?: (errors: Diagnostic[]) => void;
  fallback?: ReactNode;
  className?: string;
  validation?: ArtifactValidationOptions;
}
const EMPTY_HOST: UIHostAdapter = Object.freeze({});
const coreParser = createParser(library.toJSONSchema(), library.root);
const extrasParser = createParser(trustedLibrary.toJSONSchema(), trustedLibrary.root);
class Boundary extends Component<{ children: ReactNode; fallback: ReactNode; onError: () => void; resetKey: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  componentDidUpdate(previous: Readonly<{ resetKey: string }>) { if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false }); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export function IntelligentUIRenderer(props: IntelligentUIRendererProps) {
  const checked = useMemo(() => validateArtifact(props.artifact, { ...props.validation, supportedLibraries: props.mode === "trusted-extras" ? { "core-trusted": ["0.1.0"] } : { core: ["0.1.0"] } }), [props.artifact, props.validation, props.mode]);
  const onError = useRef(props.onError); onError.current = props.onError;
  const source = checked.success ? checked.data.source : "";
  const sourceErrors = useMemo<Diagnostic[]>(() => {
    if (!source || props.isStreaming) return !source && !props.isStreaming ? [{ code: "empty-source", message: "No completed UI source" }] : [];
    try {
      const result = (props.mode === "trusted-extras" ? extrasParser : coreParser).parse(source);
      const errors: Diagnostic[] = result.meta.errors.filter(e => e.severity !== "warning").map(e => ({ code: e.code, message: e.message }));
      if (result.meta.incomplete || result.meta.unresolved.length) errors.push({ code: "incomplete-source", message: "Completed UI contains incomplete syntax or unresolved references" });
      return errors;
    } catch { return [{ code: "parse-failed", message: "OpenUI source could not be parsed" }]; }
  }, [source, props.isStreaming, props.mode]);
  const diagnostics = checked.success ? sourceErrors : checked.errors;
  const diagnosticKey = JSON.stringify(diagnostics);
  useEffect(() => { if (diagnosticKey !== "[]") onError.current?.(JSON.parse(diagnosticKey)); }, [diagnosticKey]);
  const fallback = props.fallback ?? <div className="iui-fallback" role="status">This interactive content could not be displayed.</div>;
  if (!checked.success || sourceErrors.length) return <>{fallback}</>;
  const a = checked.data;
  // Host lifecycle IDs isolate identical artifact IDs reused in another conversation.
  const key = JSON.stringify([a.artifactId, props.hostSessionId, props.hostTurnId, props.mode]);
  return <Session key={key} {...props} artifact={a} fallback={fallback} />;
}
function Session(props: IntelligentUIRendererProps & { artifact: UIArtifactV1; fallback: ReactNode }) {
  const { artifact, hostAdapter = EMPTY_HOST } = props;
  const [errors, setErrors] = useState<OpenUIError[]>([]);
  const report = useRef(props.onError); report.current = props.onError;
  const bridge = useMemo(() => {
    const ctx: UIActionContext = { artifactId: artifact.artifactId, ...(props.hostSessionId ? { hostSessionId: props.hostSessionId } : {}), ...(props.hostTurnId ? { hostTurnId: props.hostTurnId } : {}) };
    return createHostBridge(hostAdapter, ctx, { onError: errors => report.current?.(errors) });
  }, [hostAdapter, artifact.artifactId, props.hostSessionId, props.hostTurnId]);
  useEffect(() => { bridge.retain(); return () => bridge.release(); }, [bridge]);
  const onError = useCallback((list: OpenUIError[]) => { setErrors(list); report.current?.(list.map(e => ({ code: e.code, message: e.message }))); }, []);
  const fatal = !props.isStreaming && errors.some(e => e.severity !== "warning" && e.source !== "query" && e.source !== "mutation");
  const style: CSSProperties = {};
  for (const [key, value] of Object.entries(props.themeTokens ?? {})) if (/^--iui-[a-z0-9-]+$/.test(key) && typeof value === "string" && !/url\s*\(|[;{}<>]/i.test(value)) (style as Record<string, string>)[key] = value;
  return <div className={`iui-root ${props.className ?? ""}`} data-theme={props.theme ?? "light"} style={style} aria-busy={props.isStreaming || undefined} onClickCapture={event => {
    const anchor = (event.target as Element).closest?.("a");
    if (anchor) { event.preventDefault(); void bridge.dispatch({ type: "open_url", params: { url: anchor.href }, humanFriendlyMessage: anchor.textContent ?? "Open link" }); }
  }}>
    <HostContext.Provider value={bridge}>
      <Boundary resetKey={artifact.source} fallback={props.fallback} onError={() => report.current?.([{ code: "render-error", message: "Component render failed" }])}>
        {fatal && props.fallback}
        <div hidden={fatal}>
          <Renderer library={props.mode === "trusted-extras" ? trustedLibrary : library} response={artifact.source} isStreaming={props.isStreaming ?? false} initialState={artifact.state} onAction={event => void bridge.dispatch(event)} onStateUpdate={bridge.stateChanged} onError={onError} toolProvider={bridge.toolProvider} publishObservability={false} />
        </div>
      </Boundary>
    </HostContext.Provider>
  </div>;
}
