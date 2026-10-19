import { MapConfig, type MapPluginOptions } from "./config";
import { MapView, MapMarker } from "./map";
import type { IuiPlugin } from "../../react/plugin";
export type { MapPluginOptions } from "./config";
export type { LatLng } from "./map-utils";
export function createMapPlugin(options: MapPluginOptions = {}): IuiPlugin {
  const config = Object.freeze({ ...options });
  const View = MapView.component;
  return { id: "Map", components: [MapMarker, { ...MapView, component: props => <MapConfig.Provider value={config}><View {...props} /></MapConfig.Provider> }] };
}
export { MapMarker };
