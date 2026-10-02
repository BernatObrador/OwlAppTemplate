# Development guide

Recommended reading order:

1. [Create a clean application](CREATE_APP.md).
2. [Understand architecture and state](ARCHITECTURE.md).
3. [Build your first feature](CREATING_A_FEATURE.md).
4. [Register routes, navigation and page props](ROUTING.md).
5. [Create and use components](COMPONENTS.md).
6. [Implement mock endpoints and consume a backend](SERVICES.md).
7. [Connect real authentication](AUTHENTICATION.md).
8. [Change styling or the CSS provider](UI_FRAMEWORKS.md).
9. [Run tests and diagnose errors](TESTING.md).
10. [Deploy](DEPLOYMENT.md).

Implementation references:

- [BaseForm: create, edit, validation and dirty state](BASE_FORM.md).
- [BaseListPage: URL filters, search and pagination](BASE_LIST_PAGE.md).
- [DataTable: sorting, cells, actions and selection](DATA_TABLE.md).
- [Declarative mock resources and custom endpoints](MOCK_API.md).
- [Implementation review and verified quality status](RELEASE_REVIEW.md).

## Where to make changes

| I want to... | File or directory |
| --- | --- |
| Change the application name | `.env`: `VITE_APP_NAME`; `index.html` for the browser title |
| Add a screen URL | `src/router/routes.js` |
| Add a menu entry | `src/router/navigation.js` |
| Access or extend page props | `src/router/pageProps.js` |
| Create a screen | `npm run page -- Name` → `src/pages/Name/` |
| Create reusable UI | `npm run component -- Name` → `src/components/Name/` |
| Generate a list, form and mock resource | `npm run resource -- tasks` |
| Add simulated data and validation | `src/mocks/mockResources.js` |
| Add a custom simulated endpoint | `src/mocks/mockTransport.js` |
| Connect a real API | `.env`, `src/services/api.js`, `src/app/environment.js` |
| Change the session contract | `src/services/auth.js` and your backend |
| Inject a shared service | `src/app/environment.js` |
| Change colors or dimensions | `src/styles/tokens.css` |
| Change the application shell | `src/layouts/MainLayout/` |
| Change createApp output | `scripts/create-app.mjs` and `scripts/starter/` |

The demo and clean applications share infrastructure. CRM examples in these guides illustrate feature development; those screens are not all present in a freshly generated application.

Keep all documentation, generated READMEs and code examples in English. Update the relevant guide and generator whenever a shared convention changes.

See [Core updates](CORE_UPDATES.md) to update an existing application safely.
