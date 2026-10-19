import { defineComponent, useIsStreaming } from "@openuidev/react-lang";
import { useEffect, useMemo, useRef, useState } from "react";
import { z } from "zod/v4";
import type { IuiPlugin } from "../../react/plugin";
import { useColorScheme } from "../scheme";
export interface HtmlPluginOptions {
  scriptOrigins?: readonly string[];
  styleOrigins?: readonly string[];
  imageOrigins?: readonly string[];
  fontOrigins?: readonly string[];
  maxHtmlBytes?: number;
}
const origins = (values: readonly string[] = []) => values.map(value => {
  const url = new URL(value);
  if (url.protocol !== "https:" || url.origin !== value || url.username || url.password) throw new Error("HTML resource policies require exact HTTPS origins");
  return url.origin;
}).join(" ");
export function htmlContentSecurityPolicy(options: HtmlPluginOptions = {}): string {
  return ["default-src 'none'", `script-src 'unsafe-inline' ${origins(options.scriptOrigins)}`, `style-src 'unsafe-inline' ${origins(options.styleOrigins)}`, `img-src data: blob: ${origins(options.imageOrigins)}`, `font-src data: ${origins(options.fontOrigins)}`, "media-src data: blob:", "connect-src 'none'", "frame-src 'none'", "object-src 'none'", "form-action 'none'", "base-uri 'none'"].join("; ");
}
// The frame may report only bounded layout height; no tool or Host event channel exists.
const reporter = `<script>(()=>{let last=0;const send=()=>{const h=Math.ceil(document.documentElement.getBoundingClientRect().height);if(h!==last){last=h;parent.postMessage({type:'iui-html-height',height:h},'*')}};addEventListener('load',send);new ResizeObserver(send).observe(document.documentElement);send()})()</script>`;
export function createHtmlPlugin(options: HtmlPluginOptions = {}): IuiPlugin {
  const csp = htmlContentSecurityPolicy(options);
  const maxBytes = Math.min(options.maxHtmlBytes ?? 131_072, 262_144);
  const HtmlView = defineComponent({
    name: "HtmlView", description: "Opaque-origin sandboxed HTML/inline JS for games, canvas and animation. No Host access, network, forms, popups or child frames by default. Runs after streaming completes.",
    props: z.object({ html: z.string(), height: z.number().optional(), title: z.string().optional() }),
    component: function HtmlViewView({ props }) {
      const streaming = useIsStreaming();
      const frame = useRef<HTMLIFrameElement>(null), box = useRef<HTMLDivElement>(null);
      const scheme = useColorScheme(box);
      const [height, setHeight] = useState(360);
      const fixed = typeof props.height === "number" && Number.isFinite(props.height) ? Math.min(2400, Math.max(80, props.height)) : null;
      const html = typeof props.html === "string" ? props.html : "";
      const oversized = new TextEncoder().encode(html).byteLength > maxBytes;
      const srcDoc = useMemo(() => `<!doctype html><html><head><meta charset="utf-8"><meta http-equiv="Content-Security-Policy" content="${csp}"><meta name="viewport" content="width=device-width,initial-scale=1"><style>:root{color-scheme:${scheme}}body{margin:0;font:14px/1.5 system-ui,sans-serif}</style></head><body>${oversized ? "Content size limit exceeded" : html}${reporter}</body></html>`, [html, scheme, oversized]);
      useEffect(() => {
        if (fixed !== null) return;
        const onMessage = (event: MessageEvent) => {
          if (event.source !== frame.current?.contentWindow || event.origin !== "null") return;
          const data = event.data;
          if (data && typeof data === "object" && data.type === "iui-html-height" && typeof data.height === "number" && Number.isFinite(data.height)) setHeight(Math.min(2400, Math.max(80, data.height)));
        };
        window.addEventListener("message", onMessage); return () => window.removeEventListener("message", onMessage);
      }, [fixed]);
      return <div ref={box} className="iui-html-view" style={{ height: fixed ?? height }}>
        {streaming ? <div role="status">Preparing the interactive view…</div> : <iframe ref={frame} title={props.title ?? "Interactive view"} sandbox="allow-scripts" srcDoc={srcDoc} referrerPolicy="no-referrer" style={{ border: 0, width: "100%", height: "100%" }} />}
      </div>;
    },
  });
  return { id: "Sandboxed HTML", components: [HtmlView] };
}
