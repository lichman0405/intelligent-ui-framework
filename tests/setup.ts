import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
afterEach(cleanup);
globalThis.ResizeObserver = class { observe() {} unobserve() {} disconnect() {} };
if (typeof HTMLElement !== "undefined") Object.defineProperty(HTMLElement.prototype, "clientWidth", { configurable: true, get: () => 640 });
