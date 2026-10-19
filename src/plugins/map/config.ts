/// <reference types="geojson" preserve="true" />
import { createContext } from "react";
import type { StyleSpecification } from "maplibre-gl";
import { rasterStyle, vectorStyle } from "./basemap";
export interface MapPluginOptions {
  /** Explicit network opt-in. Default blank canvas loads no map service. */
  basemap?: "blank" | "openfreemap";
  style?: StyleSpecification | ((dark: boolean) => StyleSpecification);
  fallbackStyle?: StyleSpecification | ((dark: boolean) => StyleSpecification);
  workerUrl?: string;
  maxMarkers?: number;
}
export const MapConfig = createContext<Readonly<MapPluginOptions>>({});
export function blankStyle(dark: boolean): StyleSpecification { return { version: 8, sources: {}, layers: [{ id: "background", type: "background", paint: { "background-color": dark ? "#1c1d1f" : "#f4f2f0" } }] }; }
export function configuredStyle(options: MapPluginOptions, dark: boolean, fallback = false): StyleSpecification {
  const custom = fallback ? options.fallbackStyle : options.style;
  if (custom) return typeof custom === "function" ? custom(dark) : structuredClone(custom);
  if (options.basemap === "openfreemap") return fallback ? rasterStyle(dark) : vectorStyle(dark);
  return blankStyle(dark);
}
