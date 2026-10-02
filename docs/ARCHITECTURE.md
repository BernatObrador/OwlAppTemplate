# Architecture

An independent SPA built with OWL 2.8.3 and Vite. OWL provides components, reactivity and templates; the router and services are project code. The application does not assume Odoo web-client APIs.

## Startup

1. `src/main.js` imports styles and loads the visual provider.
2. `buildEnvironment()` creates services and restores the session through `/auth/me`.
3. `loadTemplates()` discovers XML files and combines their content under one `<templates>` root.
4. `App` mounts, subscribes to the router and starts it.
5. The router resolves the URL, applies guards and selects the page and layout.
6. `MainLayout` displays the page and the menu defined in `navigation.js`.

## Responsibilities

| Layer | Responsibility | Dependencies |
| --- | --- | --- |
| Page | Screen data, validation and actions | Components and services through `env` |
| Component | Reusable UI | Props and callbacks; cross-cutting services where appropriate |
| Layout | Shell, menu and visible session state | Router and auth through `env` |
| Service | Infrastructure or long-lived shared state | Browser/backend; no pages |
| Mock | Simulate the API contract | Development data and `ApiError` |
| UI provider | Load the visual framework's CSS/JS | No business logic |

`env` contains `appName`, `useMock`, `navigation`, `api`, `auth`, `router`, `loading`, `notifications` and `storage`.

## State and reactivity

Use `useState()` in the page or component that owns the data. Loading and notification services expose subscriptions; their bridge components translate updates into OWL state. Session changes are reflected through router transitions.

Introduce a store when data must be shared across distant screens or outlive a page. A store per entity is not required. Larger modules may use `src/features/`; this structure is optional.

## Navigation and lifecycle

The router uses the History API. The layout receives `PageComponent`, `params`, `query` and `route`. Its page uses `t-key="props.route.key"`, based on pathname: moving from `/contacts/1` to `/contacts/2` creates a new form. Query-only changes retain the instance and are handled through `onWillUpdateProps`.

Demo pages load data in `onMounted` so loading states can be displayed. Requests are cancelled when a page is destroyed. Contacts also tracks request IDs to prevent old responses from replacing newer results.

## Shared page props

`src/router/pageProps.js` centralizes two separate responsibilities:

- `pageProps` is the shared validation schema used by `static props`.
- `usePageProps()` is a setup hook exposing getters for the component's current `params`, `query` and `route`.

The hook reads current component props rather than copying them into another store. It relies on normal OWL prop updates for rendering and does not subscribe independently to the router. It must not mutate the component class: OWL validates props before `setup()` runs.

Extend a page's schema with `{ ...pageProps, extra: Type }`. The shared schema is frozen to prevent one page from changing validation for every other page. The hook does not replace access to custom props via `this.props`.

Ordinary pages use the schema and hook directly. Specialized BaseForm and BaseListPage classes inherit that convention and centralize CRUD behavior; a universal base class is not required just to share props. Existing `this.props.params` access still works. See [routing](ROUTING.md#shared-page-props) for lifecycle details.

## Shared business-screen foundations

`src/forms/BaseForm.js` owns load/save state, validation hooks, dirty/reset behavior and mutation feedback. `src/pages/BaseListPage.js` owns URL-backed filters, search, sorting, pagination and stale-request protection. Domain subclasses provide endpoints, fields and validation. API and screen URLs remain separate.

The generic mock REST transport consumes declarative resource definitions. Domain validators and seed records live outside transport dispatch. DataTable receives records and callbacks, while FormField handles accessible input rendering; neither owns backend operations. Formatting helpers live in src/utils/format.js.

See [forms](BASE_FORM.md), [lists](BASE_LIST_PAGE.md), [tables](DATA_TABLE.md) and [mock resources](MOCK_API.md).

## Other decisions

- **OWL pinned to 2.8.3:** reproducible installation with `npm ci`; upgrades are explicit.
- **Server-verified sessions:** localStorage does not prove authentication. The mock uses its own development-only marker.
- **Router independent of layouts:** `buildEnvironment()` injects the layout map, making the router easier to test.
- **Declarative menu:** adding a screen does not require editing layout XML.
- **Explicit-copy generator:** applications are independent, without a plugin framework or monorepo requirement.
- **No SSR:** the base targets interactive business tools.

## Migration from the original demo

A connected backend must now implement `GET /auth/me`; the old `user` storage key is discarded. Menu links live in `navigation.js`. If you construct a router manually, provide `layouts: { main: MainLayout }`. Generated pages use shared page props. The tests cover behavior instead of a placeholder arithmetic assertion.
