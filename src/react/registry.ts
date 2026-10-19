import { createParser } from "@openuidev/lang-core";
import type { Library } from "@openuidev/react-lang";
import { library, trustedLibrary } from "./library";
export interface IuiLibraryRegistration { id: string; version: string; library: Library }
export interface IuiRegistry {
  readonly registrations: readonly Readonly<IuiLibraryRegistration>[];
  readonly supportedLibraries: Readonly<Record<string, readonly string[]>>;
  get(id: string, version: string): Readonly<IuiLibraryRegistration> | undefined;
}
export function createIuiRegistry(...registrations: IuiLibraryRegistration[]): IuiRegistry {
  const entries = registrations.map(entry => {
    if (!/^[a-z][a-z0-9.-]{0,127}$/.test(entry.id) || !/^\d+\.\d+\.\d+(?:-[\da-z.-]+)?$/i.test(entry.version) || entry.library.id !== entry.id) throw new Error("Invalid library registration identity/version");
    return Object.freeze({ ...entry });
  });
  const index = new Map<string, Readonly<IuiLibraryRegistration>>();
  const supported: Record<string, string[]> = Object.create(null);
  for (const entry of entries) {
    const key = `${entry.id}@${entry.version}`;
    if (index.has(key)) throw new Error("Duplicate library registration");
    index.set(key, entry); (supported[entry.id] ??= []).push(entry.version);
  }
  for (const versions of Object.values(supported)) Object.freeze(versions);
  return Object.freeze({ registrations: Object.freeze(entries), supportedLibraries: Object.freeze(supported), get: (id: string, version: string) => index.get(`${id}@${version}`) });
}
export const coreRegistration: IuiLibraryRegistration = Object.freeze({ id: "core", version: "0.1.0", library });
export const trustedRegistration: IuiLibraryRegistration = Object.freeze({ id: "core-trusted", version: "0.1.0", library: trustedLibrary });
export const coreRegistry = createIuiRegistry(coreRegistration);
export const trustedRegistry = createIuiRegistry(trustedRegistration);
const parsers = new WeakMap<Library, ReturnType<typeof createParser>>();
export function getLibraryParser(lib: Library) { let parser = parsers.get(lib); if (!parser) { parser = createParser(lib.toJSONSchema(), lib.root); parsers.set(lib, parser); } return parser; }
