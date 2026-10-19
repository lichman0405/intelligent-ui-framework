"use client";

import { defineComponent } from "@openuidev/react-lang";
import { ImageIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { z } from "zod/v4";
import { useIuiHost } from "../host";
import { Glyph } from "./glyph";
import { color, cx, fg, radius, radiusSchema, webUrl } from "./style";

const ICON_SIZE = { sm: 14, md: 18, lg: 24, xl: 32 } as const;

export const Icon = defineComponent({
  name: "Icon",
  props: z.object({
    name: z.string(),
    size: z.enum(["sm", "md", "lg", "xl"]).optional(),
    color: color.optional(),
  }),
  description: 'Lucide icon by name, e.g. "map-pin".',
  component: ({ props }) => (
    <span className="iui-icon" style={{ color: fg(props.color) }}>
      <Glyph name={props.name} size={ICON_SIZE[props.size ?? "md"] ?? 18} />
    </span>
  ),
});

/** Search results for `query`, or undefined while waiting. The query settles first: it may still be streaming. */
function useImageSearch(query: string | null): string[] | undefined {
  const bridge = useIuiHost();
  const [result, setResult] = useState<{ query: string; bridge: typeof bridge; images: string[] } | null>(null);
  useEffect(() => {
    if (!query) return;
    let active = true;
    const timer = setTimeout(() => {
      Promise.resolve().then(() => bridge?.host.resolveImage?.(query.slice(0, 2048), bridge.context) ?? []).then((images) => {
        const safe = Array.isArray(images) ? images.slice(0, 64).flatMap(image => { const url = webUrl(image?.url); return url ? [url] : []; }) : [];
        if (active) setResult({ query, bridge, images: [...new Set(safe)] });
      }).catch(() => { if (active) setResult({ query, bridge, images: [] }); });
    }, 500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [query, bridge]);
  if (!bridge?.host.resolveImage) return [];
  return query && result?.query === query && result.bridge === bridge ? result.images : undefined;
}

type PhotoProps = { query: string; src?: string | null; aspectRatio?: number | null; radius?: unknown; fit?: string | null };

/** A photo from src, or, without one or when it fails, the best search result for query. */
function Photo(props: PhotoProps) {
  const alt = typeof props.query === "string" ? props.query.trim() : "";
  const src = webUrl(props.src);
  const [failed, setFailed] = useState<string[]>([]);
  const [loaded, setLoaded] = useState<string | null>(null);
  const needSearch = (!src || failed.includes(src)) && alt.length > 2;
  const found = useImageSearch(needSearch ? alt : null);
  const current = [src, ...(found ?? [])].find((url): url is string => !!url && !failed.includes(url));
  const settled = !current && (!needSearch || found !== undefined);
  const ratio = typeof props.aspectRatio === "number" && props.aspectRatio > 0.2 && props.aspectRatio < 5 ? props.aspectRatio : 1.5;
  return (
    <div
      className={cx("iui-image", props.fit === "contain" && "is-contain", loaded === current && "is-loaded")}
      style={{ aspectRatio: ratio, borderRadius: radius(props.radius ?? "lg") }}
      role={current ? undefined : "img"}
      aria-label={current ? undefined : alt}
    >
      {current ? (
        <img
          key={current}
          src={current}
          alt={alt}
          loading="lazy"
          referrerPolicy="no-referrer"
          onLoad={() => setLoaded(current)}
          onError={() => setFailed((list) => [...list, current])}
        />
      ) : settled ? (
        <ImageIcon aria-hidden className="iui-image-empty" strokeWidth={1.5} />
      ) : null}
    </div>
  );
}

const fit = z.enum(["cover", "contain"]).optional();

export const SearchImage = defineComponent({
  name: "SearchImage",
  props: z.object({ query: z.string(), aspectRatio: z.number().optional(), radius: radiusSchema.optional(), fit }),
  description: 'An image from the optional Host image resolver. Without a resolver a labeled placeholder is shown. Name the exact subject.',
  component: ({ props }) => <Photo {...props} />,
});

export const Image = defineComponent({
  name: "Image",
  props: z.object({ src: z.string(), alt: z.string(), aspectRatio: z.number().optional(), radius: radiusSchema.optional(), fit }),
  description: "Photo from a URL the user or a tool gave; if it fails, a photo is found for alt.",
  component: ({ props }) => <Photo query={props.alt} src={props.src} aspectRatio={props.aspectRatio} radius={props.radius} fit={props.fit} />,
});
