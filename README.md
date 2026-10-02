# OwlAppTemplate

A working foundation for business applications built with **OWL 2.8.3, JavaScript and Vite**: ERP, CRM, backoffice and internal tools. It runs independently of Odoo and lets you choose your backend.

The root project contains a CRM demo. The generator creates clean applications while preserving the infrastructure and reusable components.

## Create your application

Requirements: Node.js `^20.19.0` or `>=22.12.0`, and npm.

From this template:

```bash
npm run createApp -- my-crm
cd apps/my-crm
npm ci
npm run dev
```

You get an independent project with Home, login, a responsive layout, routing, services, components, tests and documentation. **Contact and opportunity pages, data and endpoints are excluded.** The generator does not copy `node_modules`, `.git` or private configuration. It creates a new `.env`.

To choose another directory:

```bash
npm run createApp -- my-crm --dir ../my-crm
```

Use a lowercase name with optional hyphens. The destination must not exist. See [the generator guide](docs/CREATE_APP.md).

## Run the demo

```bash
npm ci
npm run dev
```

Without `.env`, the application uses the mock API and Bootstrap. To customize configuration, copy `.env.example` to `.env` (`Copy-Item .env.example .env` in PowerShell, or `cp .env.example .env` in a Unix shell).

Open the URL printed by Vite. Development credentials: `demo@example.com` / `demo`. The mock session survives reloads; CRM records reset because they are stored in memory.

## Daily workflow

```bash
npm run page -- Customers
npm run component -- CustomerCard
npm run resource -- tasks
npm run check
npm test
npm run build
```

1. Generate a page: its JavaScript class and XML template are created together.
2. Register it in `src/router/routes.js`.
3. Add its menu entry in `src/router/navigation.js`.
4. Load data through `this.env.api`; implement the mock endpoint and its backend equivalent.
5. Reuse the base components and handle loading, empty, error and success states.

The [complete feature tutorial](docs/CREATING_A_FEATURE.md) includes code for these steps. A **page route** selects a frontend screen; an **HTTP endpoint** provides data from your chosen backend.

Generated pages use a shared validation schema and a hook to access current routing values:

```js
import { pageProps, usePageProps } from "@/router/pageProps.js";

// Inside your page class:
static props = pageProps;
setup() {
  this.page = usePageProps();
}
```

Read `this.page.params`, `this.page.query` and `this.page.route`. Extend validation with `static props = { ...pageProps, customValue: String }`. These are project helpers, not built-in OWL APIs. See [page props](docs/ROUTING.md#shared-page-props).

## Project structure

```text
src/
  app/           # Environment composition and root component
  components/    # Generic UI with props and callbacks
  forms/         # BaseForm lifecycle and reusable CRUD behavior
  layouts/       # Header, menu and page container
  pages/         # Screens and business state
  router/        # Router, routes, navigation and page-prop helpers
  services/      # API, session, storage, loading and notifications
  mocks/         # Development contracts without a server
  styles/        # CSS tokens and app-* classes
  ui/            # Visual providers: bootstrap or none
  utils/         # Shared utilities
scripts/         # Generators and validation
tests/           # Infrastructure and demo tests
docs/            # Development guides
```

`buildEnvironment()` creates services once and exposes them through `env`. Keep page state local; introduce a store when several screens need shared state. Components, `app-*` classes and CSS variables make Bootstrap replaceable.

## Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start Vite; initial port 5173 |
| `npm run createApp -- app-name` | Create a clean project in `apps/app-name` |
| `npm run page -- PageName` | Generate a page using shared page props |
| `npm run component -- ComponentName` | Generate a generic JS + XML component |
| `npm run resource -- tasks` | Generate a list, form, mock resource and registration guide |
| `npm run check` | Check JS types, XML compilation, template references and local imports |
| `npm test` | Run Node and JSDOM tests |
| `npm run build` | Run checks and create a production build in `dist/` |
| `npm run preview` | Serve the build locally |
| `npm run owl-version` | Display the installed OWL version |
| `npm run owl-update` | Install and pin the release published under `latest`; review and test before adopting it |
| `npm run clean` | Remove this project's `node_modules` and `dist` |
| `npm run reinstall` | Clean and reinstall from the lockfile |

OWL is pinned to **2.8.3** in both `package.json` and the lockfile. Keep version-specific APIs consistent.

## Backend and sessions

Set `VITE_USE_MOCK_API=false` and configure `VITE_API_URL`. The session contract is `POST /auth/login`, `GET /auth/me` and `POST /auth/logout`. Identity is verified with the server at startup; a locally stored user does not grant access. Requests send cookies using `credentials: "include"`.

The server must implement session management, authorization and appropriate CSRF protection. This template supplies a client and a mock, not an authentication server. Never place secrets in `VITE_*` variables.

## Documentation

Start with [the documentation index](docs/README.md) for architecture, generation, routing, components, API, authentication, UI, testing and deployment. Local project skills live in `.skills/.chatgpt/skills/`.

All project documentation, generated READMEs and code examples must remain in English.
