# Routing and page props

[Documentation index](README.md) · [List pages](BASE_LIST_PAGE.md) · [Forms](BASE_FORM.md)

## Register a screen

Import a page in `src/router/routes.js` and add a route before the wildcard:

```js
{ path: "/tasks", name: "tasks", component: Tasks, auth: true, layout: "main" },
{ path: "/tasks/new", name: "task-new", component: TaskForm, auth: true, layout: "main" },
{ path: "/tasks/:id", name: "task-detail", component: TaskForm, auth: true, layout: "main" },
```

Declare static paths such as `/new` before parameter paths. Keep the required `*` route for NotFound. `auth: true` redirects anonymous users to `/login?next=...`; `guestOnly: true` redirects signed-in users to `/`. These are navigation guards, not backend authorization.

Add navigation separately in `src/router/navigation.js`:

```js
{ label: "Tasks", path: "/tasks", routes: ["tasks", "task-new", "task-detail"] },
```

`routes` lists route names that keep this menu entry active. An API endpoint and a screen URL are independent; a page at `/customers` can request `/crm/contacts`.

## Shared page props

OWL validates props before `setup()`. A hook cannot replace that declaration safely. The project therefore provides **one shared schema** for validation and **one hook** for convenient access:

```js
import { Component } from "@odoo/owl";
import { pageProps, usePageProps } from "@/router/pageProps.js";

export class TaskPage extends Component {
  static template = "pages.TaskPage";
  static props = pageProps;
  setup() {
    this.page = usePageProps();
  }
  get title() { return this.page.params.id || "New task"; }
}
```

`pageProps` declares optional `params`, `query` and `route` objects. `usePageProps()` must run in `setup()`. Its stable getters read the component's current props and default to empty params/query and a null route. It is a project helper, not a built-in OWL hook. Do not destructure its result when you need updated values, and do not mutate the frozen schema.

To accept additional props:

```js
static props = { ...pageProps, readOnly: { type: Boolean, optional: true } };
```

`BaseForm` and `BaseListPage` already declare the schema and call the hook. Their subclasses inherit both. If overriding `setup()`, call `super.setup()` first.

Inside `onWillUpdateProps(nextProps)`, read **nextProps**: current component props have not been committed yet. This is how BaseListPage restores filters after browser history navigation.

## Navigation API

```js
await this.env.router.navigate("/tasks/42");
await this.env.router.navigate("/tasks?q=report&page=1", { replace: true });
const exists = this.env.router.checkPathExists("/tasks/42");
```

Use local absolute paths. External URLs, protocol-relative paths and malformed paths are rejected. `checkPathExists()` accepts registered patterns or concrete paths with optional query strings; the wildcard does not count as an existing route. Router methods use their router closure and can be passed as callbacks.

`start()` resolves the initial URL and subscribes to `popstate`; `stop()` removes the listener. The root App handles these lifecycle calls. `navigate()` updates browser history and resolves the page. `replace` is useful for debounced searches. Query values are strings. Encode dynamic IDs and use `URLSearchParams` for queries.

MainLayout keys the rendered page by pathname. Changing record IDs remounts forms; query-only changes update the existing list page.

## Breadcrumbs

Breadcrumb URLs retain the current query string except for the root dashboard link. BaseListPage.open and createRecord carry list state into detail/create URLs, allowing breadcrumbs to restore it after navigation or reload. Merely accepting a search argument in buildBreadcrumbs is insufficient: the router must pass it and the incoming detail URL must contain it.

The router builds `route.breadcrumbs` from registered path prefixes. MainLayout renders it with BreadCrumbs. `/contacts/new` becomes Dashboard → Contacts → New; dynamic IDs default to Detail. The wildcard has no breadcrumb trail.

Override a label with the existing `breadCrumbsName` property:

```js
{ path: "/tasks/:id", name: "task-detail", component: TaskForm,
  auth: true, layout: "main",
  breadCrumbsName: ({ params }) => `Task ${params.id}` },
```

A string is also supported. This callback receives `{ params, route }`, not loaded API records. Breadcrumb construction is a pure helper in `src/router/breadcrumbs.js`; it does not import the route registry.
