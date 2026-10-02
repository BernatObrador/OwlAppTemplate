import { createRestTransport } from "./restTransport.js";
import { createMockResources } from "./mockResources.js";

export function createMockTransport({ storage = null } = {}) {
  return createRestTransport({
    storage,
    resources: createMockResources(),
    endpoints: {
      "GET /dashboard": ({ resources }) => ({
        summary: {
          contacts: resources.contacts.records.length,
          opportunities: resources.opportunities.records.length,
          pipeline: resources.opportunities.records.reduce((sum, item) => sum + Number(item.amount || 0), 0),
        },
        records: resources.opportunities.records.slice(0, 5),
      }),
    },
  });
}
