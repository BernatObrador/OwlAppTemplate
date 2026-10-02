# Testing and diagnostics

[Documentation index](README.md)

```bash
npm run check
npm test
npm run build
```

check runs TypeScript's JavaScript checking, XML parsing, unique template-name validation, OWL template compilation and source-reference validation. Source validation checks literal static template references and local import paths/extensions; it is not a general JavaScript parser and does not prove every dynamic component path. build runs check again and bundles with Vite.

## Automated coverage

Tests use Node's test runner and JSDOM with real OWL mounting and XML templates. They cover:

- Cookie/JSON requests, error normalization, aborts and overlapping loading operations.
- Server-verified sessions, malformed/offline restoration, logout failure and stale results.
- Protected deep links, params/query, rejected destinations, 404, detached router methods, breadcrumbs and browser history traversal.
- Shared page prop validation, schema extensions and current-value getters after updates.
- BaseForm load/create/update/reset/dirty/error mapping and duplicate submits.
- BaseListPage debounce, pagination, filters, sorting, stale responses and destruction cleanup.
- Generic mock CRUD, validation, sorting, filters, pagination, cloning and monotonically increasing IDs.
- DataTable custom cells, sorting, actions, selection, loading and empty states.
- FormField typed values, disabled states and accessible errors; Pagination, SearchInput and BreadCrumbs callbacks.
- App/page/component/resource generators, collision rejection and source references.
- Full demo smoke: login, dashboard, contact creation/editing, search races, failures, opportunity creation/editing, URL filters and logout.

The root suite currently reports 26 tests including nested subtests. Clean apps contain 24 infrastructure tests; demo-specific mock and UI smoke tests are excluded. Counts can change as coverage grows.

## Manual browser checks

JSDOM does not verify visual layout or browser rendering. At desktop and mobile widths, inspect login, menu, dashboard, list overflow, filters and forms. Check keyboard focus, loading/errors and browser Back/Forward. Repeat with provider none. After a provider change, restart Vite; verify both a development page and a production build.

For a clean-app release check, generate a temporary app, run npm ci, its checks/tests/build, generate a resource, follow its registration guide and exercise create/edit. Keep verification output outside src; remove only the temporary app you created.

## Common failures

| Failure | Check |
| --- | --- |
| Missing template | Match static template and XML t-name; keep XML under src |
| Unknown prop | Use pageProps for pages and explicit component prop schemas |
| Hook called outside setup | Move usePageProps/useState into setup; call super.setup in subclasses |
| Missing local import | Include .js/.xml/.css and verify case/path |
| Blank production deep link | Configure SPA fallback to index.html |
| HTML instead of API JSON | Exclude /api from the SPA fallback and check API_URL |
| Repeated login redirect | Inspect /auth/me, cookies and backend status; local user storage is not trusted |
| Old search results | Use BaseListPage or equivalent abort plus stale-response guards |
| Different provider not loaded | Restart Vite and check VITE_UI_PROVIDER and registry |

Do not suppress OWL validation to hide a mismatch. Fix the schema or caller. Tests should verify observable behavior and business invariants rather than implementation details.
