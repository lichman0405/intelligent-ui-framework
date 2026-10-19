import { useEffect, useState } from "react";
import { useIuiHost } from "../../react/host";
import { coordinate, type LatLng } from "./map-utils";
/** Route geometry comes only from the Host capability; no app-local API. */
export function useStreetRoute(routingKey: string, enabled: boolean): LatLng[] | null | undefined {
  const bridge = useIuiHost();
  const [result, setResult] = useState<{ key: string; bridge: typeof bridge; points: LatLng[] | null } | null>(null);
  useEffect(() => {
    if (!enabled || !routingKey.includes(";")) return;
    let active = true;
    const timer = setTimeout(async () => {
      try {
        const stops = routingKey.split(";").map(pair => { const [lng, lat] = pair.split(",").map(Number); return coordinate({ lat, lng }); });
        if (!bridge?.host.resolveRoute || stops.some(p => !p)) throw new Error("No route capability");
        const raw = await bridge.host.resolveRoute(stops as LatLng[], bridge.context);
        if (!Array.isArray(raw) || raw.length < 2 || raw.length > 20_000) throw new Error("Invalid route geometry");
        const points = raw.map(point => Array.isArray(point) && point.length === 2 ? coordinate({ lat: point[0], lng: point[1] }) : null);
        if (points.some(p => !p)) throw new Error("Invalid route geometry");
        if (active) setResult({ key: routingKey, bridge, points: points as LatLng[] });
      } catch { if (active) setResult({ key: routingKey, bridge, points: null }); }
    }, 300);
    return () => { active = false; clearTimeout(timer); };
  }, [routingKey, enabled, bridge]);
  if (!bridge?.host.resolveRoute) return null;
  return result?.key === routingKey && result.bridge === bridge ? result.points : undefined;
}
