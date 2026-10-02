# Build a feature from scratch

[Documentation index](README.md) · [Create an app](CREATE_APP.md)

This workflow works in both the demo and a clean generated application. It creates a Tasks list and form using the shared foundations.

## 1. Generate the files

```bash
npm run resource -- tasks
```

The command creates six files: Tasks JS/XML, TasksForm JS/XML, a mock resource and `docs/features/tasks.md`. The list includes search, server sorting, pagination, retry and row navigation. The form includes validation, load/save errors, reset and duplicate-submit protection. No central registries are edited automatically; the generated guide contains exact snippets to review and insert.

Resource names use lowercase words with optional hyphens, for example work-orders. Page/component generators use PascalCase. Existing targets are rejected before any files are written.

## 2. Register routes and navigation

Import Tasks and TasksForm in src/router/routes.js:

```js
import { Tasks } from "@/pages/Tasks/Tasks.js";
import { TasksForm } from "@/pages/TasksForm/TasksForm.js";
```

Add routes before the wildcard, with new before id:

```js
{ path: "/tasks", name: "tasks", component: Tasks, auth: true, layout: "main" },
{ path: "/tasks/new", name: "tasks-new", component: TasksForm, auth: true, layout: "main" },
{ path: "/tasks/:id", name: "tasks-detail", component: TasksForm, auth: true, layout: "main" },
```

Add to src/router/navigation.js:

```js
{ label: "Tasks", path: "/tasks", routes: ["tasks", "tasks-new", "tasks-detail"] },
```

Breadcrumbs are derived automatically. Use breadCrumbsName for custom labels. See [routing](ROUTING.md) for page props, guards and history behavior.

## 3. Register the mock resource

Import in src/mocks/mockResources.js:

```js
import { createTasksResource } from "./resources/tasks.js";
```

Add `tasks: createTasksResource()` to the object returned by createMockResources. This enables GET/POST /tasks and GET/PUT/PATCH/DELETE /tasks/:id through the generic transport. No endpoint switch statements are required.

The frontend route selects a screen. The resource supplies data. A real server must implement the same API separately. See [mock resources](MOCK_API.md) and [services](SERVICES.md).

## 4. Add domain fields

Add defaults in getInitialForm, validation in validate, and FormField instances in the form XML. Extend the resource validator to normalize and validate those fields. Add DataTable columns in the list. For a filter, declare its key in BaseListPage.filterKeys and in the resource's filterFields, then bind a control to changeFilter.

Keep API collection paths in apiUrl and browser screen paths in routeUrl. Use the [form guide](BASE_FORM.md), [list guide](BASE_LIST_PAGE.md) and [table guide](DATA_TABLE.md) for customization. Ordinary screens that do not fit CRUD can use `npm run page -- Reports`; generic UI can use `npm run component -- ReportCard`.

## 5. Verify the workflow

```bash
npm run check
npm test
npm run build
npm run dev
```

Sign in with demo@example.com / demo. Open Tasks, confirm the empty state, create a task, edit it, reset changes, search, sort and use browser Back/Forward. Try an invalid form and a missing detail ID. Refresh a deep link. Mock records reset on reload; the mock session survives.

Add behavioral tests for new validation or business workflows. The existing smoke test covers Contacts and Opportunities in the demo; clean apps include infrastructure tests and should add a smoke test for their own product flow.

## Existing examples

Contacts demonstrates required text/email fields and a status filter. Opportunities adds a numeric currency field, stage validation, formatted table cells and row actions. Projects is a read-only list without detail navigation. These demo pages are excluded by createApp; their shared components, bases and transport are retained.
