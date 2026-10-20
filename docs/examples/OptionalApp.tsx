import { createArtifact, IntelligentUIRenderer, createIuiRegistry, type UIHostAdapter } from "@intelligent-ui/framework";
import { createUpstreamRegistration } from "@intelligent-ui/framework/plugins/upstream";
import { createWebResolvers } from "@intelligent-ui/framework/adapters";
import "@intelligent-ui/framework/styles.css";
import "@intelligent-ui/framework/plugins/map/styles.css";

const registration = createUpstreamRegistration({ map: { basemap: "blank" }, html: {} });
const registry = createIuiRegistry(registration);
// Optional network capability: omit this object to keep image/road resolvers disabled.
const resolvers = createWebResolvers();
const host: UIHostAdapter = { ...resolvers };
const artifact = createArtifact(`$place = ""
root = Col([Map([MapMarker("First", 37.78, -122.42), MapMarker("Second", 37.80, -122.40)], true, $place), Text("Selected: " + $place), HtmlView("<button onclick='this.textContent=42'>Play</button>", 120, "Sandbox")])`, "optional-1", undefined, { libraryId: registration.id, libraryVersion: registration.version });
export default function OptionalApp() { return <IntelligentUIRenderer artifact={artifact} registry={registry} hostAdapter={host} hostSessionId="session-demo" hostTurnId="turn-demo" />; }
