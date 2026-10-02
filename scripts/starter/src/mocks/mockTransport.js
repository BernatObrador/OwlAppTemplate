import { createRestTransport } from "./restTransport.js";
import { createMockResources } from "./mockResources.js";

export function createMockTransport({ storage = null } = {}) {
  return createRestTransport({ storage, resources: createMockResources() });
}
