# Creating a list with BaseListPage

[Documentation index](README.md) · [DataTable](DATA_TABLE.md) · [Mock API](MOCK_API.md)

`npm run resource -- tasks` generates this pattern with a matching form, mock resource and registration guide.

```js
import { BaseListPage } from "@/pages/BaseListPage.js";
import { DataTable } from "@/components/DataTable/DataTable.js";
import { SearchInput } from "@/components/SearchInput/SearchInput.js";
import { Pagination } from "@/components/Pagination/Pagination.js";

export class Tasks extends BaseListPage {
  static template = "pages.Tasks";
  static components = { DataTable, SearchInput, Pagination };
  get apiUrl() { return "/tasks"; }
  get routeUrl() { return "/tasks"; }
  get perPage() { return 10; }
  get filterKeys() { return ["status"]; }
  columns = [{ key: "name", label: "Name", sortable: true }];
}
```

`apiUrl` is the API collection; `routeUrl` is the screen URL. `detailRoute` defaults to `routeUrl + '/:id'`; return null for a list without detail navigation. `open(record)` encodes the ID and checks that the route exists before navigating.

## State and URL contract

The base reads `q`, `page`, `sort`, `order` and declared `filterKeys` from the URL. For example:

```text
/opportunities?q=acme&stage=proposal&sort=amount&order=desc&page=1
```

| Member | Purpose |
| --- | --- |
| `state.records`, `state.total` | Loaded records and matching count |
| `state.page`, `state.pages` | Current and total pages |
| `state.query` | Search text mapped to q |
| `state.sort`, `state.order` | Sort field and asc/desc |
| `state.filters` | Values for declared filterKeys |
| `state.loading`, `state.error` | Request state |
| `search(value)` | Debounced search, reset page and replace URL |
| `changePage(page)` | Navigate to a page |
| `changeSort(key, order)` | Reset page and navigate with sorting |
| `changeFilter(key, value)` | Update an allowed filter and reset page |
| `load()` | Fetch or retry the current list |

Search is debounced by 250 ms; pagination/filter/sort changes navigate immediately. Query-only navigation and browser Back/Forward synchronize the existing component. Unrelated query keys are preserved. Invalid page inputs become page 1. Server-clamped pages replace the URL with the returned page. The base adds perPage to the API request, not the screen URL.

Requests use AbortController and a request counter so stale responses cannot overwrite a newer search, even when a transport ignores cancellation. Destruction cancels timers and requests.

## Keep filters when opening a form

`open(record)` carries the current list query to the detail URL. Bind new-record buttons with `t-on-click="createRecord"` so creation carries the same query. Both capture current search/filter/sort/page values, including a search still waiting for its debounce timer. API requests remain separate from these screen URLs.

The router passes the query to breadcrumbs. BaseForm uses `returnUrl` to preserve it on save and cancel. This keeps filtered views reproducible after a reload without a global history store. Custom navigation with a bare `/resource/new` or `/resource/id` deliberately starts without list context. Query parameters carried this way should describe the list; override navigation for screens with unrelated detail-only query parameters.

## API response

```json
{ "records": [{ "id": 1, "name": "Write report" }], "page": 1, "pages": 1, "total": 1 }
```

An empty result still has page 1 and pages 1. The base validates the response envelope. Backend sorting and filtering must operate before pagination. Declare permitted fields on the mock resource and implement equivalent rules on the server.

## Template bindings

```xml
<SearchInput value="state.query" onInput.bind="search"/>
<div t-if="state.error" role="alert">
  <p t-esc="state.error"/>
  <button t-on-click="load">Retry</button>
</div>
<DataTable t-else="" columns="columns" records="state.records"
  loading="state.loading" sort="state.sort" order="state.order"
  onSort.bind="changeSort" onRowClick.bind="open"/>
<Pagination t-if="!state.loading and !state.error"
  page="state.page" pages="state.pages" onChange.bind="changePage"/>
```

Passing onSort delegates sorting to the URL/API layer instead of sorting only the displayed page. See Contacts and Opportunities for select filters using FormField. If overriding setup, call `super.setup()` first. Use getters for configuration needed during setup.
