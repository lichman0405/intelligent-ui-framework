import { createIuiLibrary } from "../react/library";
import { createIuiRegistry } from "../react/registry";
import { createMapPlugin, type MapPluginOptions } from "./map/index";
import { createHtmlPlugin, type HtmlPluginOptions } from "./html/index";
/** Explicit Host opt-in. Importing core never imports this module or MapLibre. */
export function createUpstreamRegistration(options: { map?: MapPluginOptions; html?: HtmlPluginOptions } = {}) {
  return { id: "upstream", version: "0.1.0", library: createIuiLibrary({ id: "upstream", trustedExtras: true, plugins: [createMapPlugin(options.map), createHtmlPlugin(options.html)] }) };
}
export const upstreamRegistration = createUpstreamRegistration();
export const upstreamRegistry = createIuiRegistry(upstreamRegistration);
