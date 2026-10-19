import type { LibraryDefinition } from "@openuidev/react-lang";
/** Trusted application code only. Plugins never come from Artifact JSON. */
export interface IuiPlugin {
  id: string;
  components?: LibraryDefinition["components"];
  functions?: NonNullable<LibraryDefinition["functions"]>;
  actions?: NonNullable<LibraryDefinition["actions"]>;
}
