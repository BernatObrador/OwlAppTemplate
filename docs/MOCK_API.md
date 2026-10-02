# Declarative mock API

[Documentation index](README.md) · [Services](SERVICES.md) · [Feature tutorial](CREATING_A_FEATURE.md)

`src/mocks/restTransport.js` implements a JSON-only REST simulator. `mockResources.js` supplies domain data and validation; `mockTransport.js` composes resources and custom endpoints. A clean generated application starts with an empty resource registry and mock authentication.

## Add a resource

```js
import { ApiError } from "../services/api.js";

export function createMockResources() {
  return {
    tasks: {
      records: [{ id: 1, name: "Write report", status: "open" }],
      label: "Task",
      searchFields: ["name"],
      sortFields: ["name", "status"],
      filterFields: ["status"],
      validate(data) {
        const name = typeof data.name === "string" ? data.name.trim() : "";
        if (!name) throw new ApiError("Review the form.", {
          status: 422, data: { errors: { name: "Name is required." } },
        });
        return { name, status: data.status || "open" };
      },
    },
  };
}
```

Merge this entry with existing resources instead of replacing them. `npm run resource -- tasks` generates a resource module and precise registration instructions.

| Request | Behavior |
| --- | --- |
| GET /tasks | Filter, sort and paginate |
| GET /tasks/1 | Return one record or 404 |
| POST /tasks | Validate, assign a monotonically increasing numeric ID and create |
| PUT /tasks/1 | Validate and replace fields, preserving ID |
| PATCH /tasks/1 | Merge existing fields, validate and preserve ID |
| DELETE /tasks/1 | Delete and return null |

The list response is `{ records, page, pages, total, query }`. Query parameters are q, page, perPage, sort, order and declared filterFields. Search uses case-insensitive substring matching; filters use case-insensitive equality. Sort fields must be allowlisted; if sortFields is omitted, searchFields supplies the allowed sort fields. Filtering and sorting happen before pagination. perPage defaults to 5 and is capped at 100. Empty lists still report one page.

Resource names support letters, digits, underscores and hyphens; detail IDs are numeric. Use a custom endpoint for nested URLs or other identifier formats. Returned records are cloned to prevent accidental mutation of stored data. Resource data resets whenever the transport is recreated, including browser reloads.

## Custom endpoints

```js
import { createRestTransport } from "./restTransport.js";
import { createMockResources } from "./mockResources.js";

export function createMockTransport({ storage } = {}) {
  return createRestTransport({
    storage,
    resources: createMockResources(),
    endpoints: {
      "GET /summary": ({ resources }) => ({ count: resources.tasks.records.length }),
    },
  });
}
```

Handlers receive `{ resources, url, data }` and may be async. Auth endpoints run first; all resources and custom endpoints require the mock session. Custom handlers precede generic CRUD. Throw ApiError to simulate an HTTP failure. `delay` defaults to 180 ms; tests can pass zero. AbortSignal is honored during the simulated delay.

The simulator does not implement backend permissions, persistence or database transactions. Keep validators close to domain definitions and reproduce their rules on the backend. Shared frontend domain helpers are useful for consistent UX, but a server must independently validate every write.
