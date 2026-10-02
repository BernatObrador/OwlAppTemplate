# Create a clean application

```bash
npm run createApp -- my-erp
cd apps/my-erp
npm ci
npm run dev
```

The generator uses built-in Node modules and can run before installing dependencies in the template. Install the generated application's dependencies with `npm ci`.

To choose a destination:

```bash
npm run createApp -- my-erp --dir ../my-erp
```

`--dir` is the final directory, relative to the command's working directory. The default is `apps/<name>` inside the template. Within the template, generated projects must stay under `apps/` to avoid mixing them with `src`, `scripts` or `docs`. The destination must be new; there is no overwrite mode.

Names accept lowercase letters, numbers and hyphens, must start with a letter and cannot exceed 80 characters. Windows device names are rejected. Examples: `my-erp`, `sales-crm`, `warehouse2`.

## Included

- Protected Home, login and 404 pages.
- Responsive layout and declarative menu.
- API, session, loading, notifications and namespaced storage.
- Generic components, styles and visual providers.
- Shared `pageProps` schema and `usePageProps()` hook.
- BaseForm, BaseListPage, DataTable, reusable fields and generic REST transport.
- Development mock session: `demo@example.com` / `demo`.
- Generation scripts, validation, infrastructure tests and English documentation.
- Local project skills and `AGENTS.md`, when present in the template.
- `package-lock.json` retaining reproducible dependency versions.
- New `.env` and `.env.example` files with the application name and storage namespace.

## Excluded

ContactForm, Contacts, Opportunities, OpportunityForm, Projects, Dashboard, CRM records and business endpoints are not copied. Neither are `node_modules`, builds, Git history, previously generated applications, the source `.env` or private environment variants.

The minimum application content lives in `scripts/starter/src/`; the generated README comes from `scripts/starter/README.md`. Infrastructure is copied through an explicit allowlist in `scripts/create-app.mjs`. Update that list and generator tests when extending the shared foundation.

## After generation

1. Replace Home with your product's first screen.
2. Generate a list/form/resource with `npm run resource -- tasks`, or individual pages and components with the npm commands.
3. Define routes and menu entries in their respective files.
4. Add mock endpoints while developing your backend.
5. Connect real sessions using the [authentication guide](AUTHENTICATION.md).
6. Run `npm run check`, `npm test` and `npm run build`.
7. Initialize your own repository if needed; the generator does not do this.

Generated applications are independent copies, with no automatic update link to the template. They retain `createApp`, so they can generate another clean base using their shared components. Business pages remain excluded by the explicit allowlist.

The template ignores `apps/` in Git. Each generated application should have its own repository. Nothing is installed or published automatically. Keep its documentation in English.

Generated apps track their core baseline in .owl-core.json. See [Core updates](CORE_UPDATES.md) for the preview/apply workflow.
