# __APP_NAME__

An independent OWL 2.8.3 + Vite application with login, session management, a responsive layout, routing, services and reusable components.

## Get started

```bash
npm ci
npm run dev
```

Mock mode accepts `demo@example.com` / `demo`. The Home page is ready for your application; no CRM pages, records or business endpoints are included.

## Create a feature

```bash
npm run page -- Customers
npm run component -- CustomerCard
npm run resource -- tasks
```

Register the page in `src/router/routes.js` and its menu entry in `src/router/navigation.js`. Generated pages use the shared `pageProps` schema and `usePageProps()` hook.

The resource command creates a list extending BaseListPage, a form extending BaseForm, and a mock resource. Follow the generated `docs/features/tasks.md` to register all three routes, navigation and the resource. Search, URL filters, sorting, pagination, form validation and reset are provided by the shared foundation.

Read the [complete tutorial](docs/CREATING_A_FEATURE.md), [components guide](docs/COMPONENTS.md), [API guide](docs/SERVICES.md), [authentication contract](docs/AUTHENTICATION.md) and [documentation index](docs/README.md).

## Check your changes

```bash
npm run check
npm test
npm run build
```

To connect a backend, configure `.env` as described in `docs/AUTHENTICATION.md`. Mock sessions are for development only. Keep all project documentation in English.

## Update the core

Run npm run core:update to preview shared template changes, then npm run core:update -- --apply to apply them. Local core edits block the update. See [Core updates](docs/CORE_UPDATES.md).
