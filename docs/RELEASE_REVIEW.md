# Implementation review

Reviewed on 2026-10-02. This report describes the reusable starter and the checks actually performed; it is not a certification of a deployed backend.

## Architecture

The application remains a standalone OWL 2.8.3 SPA with Vite. Startup loads the UI provider, builds one environment, restores the server session and mounts the root App. The router selects a layout and page; pages combine reusable components with services from env.

Shared page props use an immutable validation schema and the usePageProps setup hook. BaseListPage centralizes URL-backed list state and safe asynchronous loading. BaseForm centralizes conventional JSON CRUD form behavior. Domain pages supply fields, validation and separate API/screen URLs. Declarative resource definitions feed a generic REST mock transport.

See [architecture](ARCHITECTURE.md) for ownership and lifecycle details.

## Included features

- Protected routes, guest-only login, server-verified session restoration, 401 handling and visible logout failures.
- Static/dynamic routes, query parsing, Back/Forward, 404 handling, closure-safe router methods and automatic breadcrumbs.
- Search debounce, pagination, URL-backed sorting/filters, cancellation and stale-response protection.
- Form load/save/error state, validation hooks, dirty/reset, backend field errors, duplicate-submit protection and cancellation navigation.
- DataTable sorting, custom cells, badges, row actions, optional selection and responsive overflow.
- Accessible reusable fields for text, select, textarea, checkbox, date and numeric values.
- Contacts and Opportunities CRUD examples, plus the existing read-only Projects list.
- Generic mock GET/POST/PUT/PATCH/DELETE, search/filter/sort/pagination and separate custom endpoints.
- Independent app generation and page/component/resource generators with collision protection.
- XML compilation, template/import checks, behavior tests and English developer documentation.
- Bootstrap by default, framework-free styling, and verified Bulma/Tailwind integration recipes without adding them to root dependencies.

## Extension points

| Need | Starting point |
| --- | --- |
| Clean app | `npm run createApp -- my-app`; [guide](CREATE_APP.md) |
| Ordinary page | `npm run page -- Reports`; [routing and props](ROUTING.md) |
| List, form and mock resource | `npm run resource -- tasks`; follow its generated registration guide |
| Custom list | Extend BaseListPage; [list guide](BASE_LIST_PAGE.md) |
| Custom form | Extend BaseForm; [form guide](BASE_FORM.md) |
| Reusable component | `npm run component -- CustomerCard`; [component guide](COMPONENTS.md) |
| Screen route/menu | src/router/routes.js and navigation.js |
| Mock resource or endpoint | [mock API guide](MOCK_API.md) |
| Real backend | [services](SERVICES.md) and [authentication](AUTHENTICATION.md) |
| Visual provider | src/ui registry/provider module; [provider guide](UI_FRAMEWORKS.md) |

## Quality results

| Verification | Actual result |
| --- | --- |
| Root `npm run check` | Passed: JavaScript checking, 18 XML templates compiled, local imports/template references validated |
| Root `npm test` | Passed: 26 tests, zero failures |
| Root `npm run build` | Passed with Vite 7.3.6 |
| Independent generated app | Offline npm ci, check, 24 tests and production build passed |
| Generated resource | Tasks list/form/mock registered from generated instructions; check, tests and build passed |
| Optional providers | Bulma 1 and Tailwind 4 installed and production-built only in a disposable generated app |
| Browser verification | Bootstrap mobile login/dashboard/menu/list/form; framework-free mobile form and collapsed navigation; generated Tasks create/edit flow with Tailwind |
| Documentation links | Local Markdown link targets resolved |

A fixed 35 ms wait caused an intermittent DataTable test failure under load. Component tests now wait for animation frames; the full suite passed after that change. Final review also added malformed-record response handling and removed collapsed mobile menu links from keyboard/accessibility navigation.

The smoke suite mounts the real OWL app in JSDOM. It verifies behavior, not pixel rendering. Browser checks supplement it but do not constitute an exhaustive browser/accessibility matrix. Bulma's integration was build-verified, not exhaustively visually tested.

## Useful next steps for a product

1. Implement the real API and server-side session/authorization/CSRF contract; verify it with the mock disabled.
2. Add product-specific permissions and business validation rather than extending generic components with domain rules.
3. Add CI for the existing check/test/build commands and browser regression coverage for the product's critical flows.
4. Choose persistence and deployment for the actual application. Mock records intentionally reset on reload; generated apps are independent copies and do not receive automatic template upgrades.

Unsaved-navigation prompts, uploads, virtualized tables and schema-driven forms are intentionally not part of this baseline. Add them when a concrete product workflow requires them.
