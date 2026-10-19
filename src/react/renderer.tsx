import { Renderer, type OpenUIError } from "@openuidev/react-lang";
import { Component, useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { validateArtifact, type Diagnostic, type UIArtifactV1, type UIHostAdapter, type UIActionContext, type ArtifactValidationOptions } from "../protocol/index";
import { createHostBridge, HostContext, type HostBridgeOptions } from "./host";
import { coreRegistry, trustedRegistry, getLibraryParser, type IuiRegistry, type IuiLibraryRegistration } from "./registry";

export interface IntelligentUIRendererProps {
  artifact: UIArtifactV1 | unknown;
  isStreaming?: boolean;
  hostAdapter?: UIHostAdapter;
  hostSessionId?: string;
  hostTurnId?: string;
  theme?: "light" | "dark";
  themeTokens?: Readonly<Record<`--iui-${string}`, string>>;
  mode?: "core" | "trusted-extras";
  registry?: IuiRegistry;
  toolOptions?: Pick<HostBridgeOptions, "maxCalls" | "maxConcurrent" | "toolTimeoutMs" | "maxToolResultBytes" | "maxToolResultNodes">;
  onError?: (errors: Diagnostic[]) => void;
  fallback?: ReactNode;
  className?: string;
  validation?: ArtifactValidationOptions;
}
const EMPTY_HOST: UIHostAdapter = Object.freeze({});
class Boundary extends Component<{ children: ReactNode; fallback: ReactNode; onError: () => void; resetKey: string }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch() { this.props.onError(); }
  componentDidUpdate(previous: Readonly<{ resetKey: string }>) { if (this.state.failed && previous.resetKey !== this.props.resetKey) this.setState({ failed: false }); }
  render() { return this.state.failed ? this.props.fallback : this.props.children; }
}
export function IntelligentUIRenderer(props: IntelligentUIRendererProps) {
  const registry = props.registry ?? (props.mode === "trusted-extras" ? trustedRegistry : coreRegistry);
  const checked = useMemo(() => validateArtifact(props.artifact, { ...props.validation, supportedLibraries: registry.supportedLibraries }), [props.artifact, props.validation, registry]);
  const registration = checked.success ? registry.get(checked.data.libraryId, checked.data.libraryVersion) : undefined;
  const onError = useRef(props.onError); onError.current = props.onError;
  const source = checked.success ? checked.data.source : "";
  const sourceErrors = useMemo<Diagnostic[]>(() => {
    if (!source || props.isStreaming) return !source && !props.isStreaming ? [{ code: "empty-source", message: "No completed UI source" }] : [];
    try {
      if (!registration) return [{ code: "unsupported-library", message: "Library was not registered by Host" }];
      const result = getLibraryParser(registration.library).parse(source);
      const errors: Diagnostic[] = result.meta.errors.filter(e => e.severity !== "warning").map(e => ({ code: e.code, message: e.message }));
      if (result.meta.incomplete || result.meta.unresolved.length) errors.push({ code: "incomplete-source", message: "Completed UI contains incomplete syntax or unresolved references" });
      return errors;
    } catch { return [{ code: "parse-failed", message: "OpenUI source could not be parsed" }]; }
  }, [source, props.isStreaming, registration]);
  const diagnostics = checked.success ? sourceErrors : checked.errors;
  const diagnosticKey = JSON.stringify(diagnostics);
  useEffect(() => { if (diagnosticKey !== "[]") onError.current?.(JSON.parse(diagnosticKey)); }, [diagnosticKey]);
  const fallback = props.fallback ?? <div className="iui-fallback" role="status">This interactive content could not be displayed.</div>;
  if (!checked.success || !registration || sourceErrors.length) return <>{fallback}</>;
  const a = checked.data;
  // Host lifecycle IDs isolate identical artifact IDs reused in another conversation.
  const key = JSON.stringify([a.artifactId, a.libraryId, a.libraryVersion, props.hostSessionId, props.hostTurnId, props.mode]);
  return <Session key={key} {...props} artifact={a} registration={registration} fallback={fallback} />;
}
function Session(props: IntelligentUIRendererProps & { artifact: UIArtifactV1; fallback: ReactNode; registration: IuiLibraryRegistration }) {
  const { artifact, hostAdapter = EMPTY_HOST } = props;
  const [errors, setErrors] = useState<OpenUIError[]>([]);
  const report = useRef(props.onError); report.current = props.onError;
  const bridge = useMemo(() => {
    const ctx: UIActionContext = { artifactId: artifact.artifactId, ...(props.hostSessionId ? { hostSessionId: props.hostSessionId } : {}), ...(props.hostTurnId ? { hostTurnId: props.hostTurnId } : {}) };
    return createHostBridge(hostAdapter, ctx, { ...props.toolOptions, customActions: Object.keys(props.registration.library.actions ?? {}), onError: errors => report.current?.(errors) });
  }, [hostAdapter, artifact.artifactId, props.hostSessionId, props.hostTurnId, props.registration, props.toolOptions]);
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
          <Renderer library={props.registration.library} response={artifact.source} isStreaming={props.isStreaming ?? false} initialState={artifact.state} onAction={event => void bridge.dispatch(event)} onStateUpdate={bridge.stateChanged} onError={onError} toolProvider={bridge.toolProvider} publishObservability={false} />
        </div>
      </Boundary>
    </HostContext.Provider>
  </div>;
}
