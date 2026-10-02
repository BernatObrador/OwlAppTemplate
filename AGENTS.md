# Project conventions



## Stack
- Standalone OWL app
- Vite
- Bootstrap is default UI provider, not mandatory
- Always inspect `package.json` before using version-specific OWL APIs

## Architecture
- `src/app/`: bootstrap/environment/app shell
- `src/router/`: SPA router/routes
- `src/services/`: API/auth/storage/loading/notifications
- `src/components/`: reusable generic UI
- `src/pages/`: route-level screens
- `src/ui/`: CSS-framework/provider integration
- `src/styles/`: semantic app CSS/design tokens
- `src/mocks/`: dev/test API transport

## Rules
- Never mix OWL major-version APIs
- Never invent OWL APIs
- Treat helpers like `buildEnvironment()` as project code
- Prefer existing conventions over parallel abstractions
- Move complex JS out of XML templates
- Backend authorization remains authoritative
- Never place secrets in `VITE_*`
- Keep Bootstrap assumptions out of domain/business logic
- Add dependencies only when justified
- Write all project documentation, generated READMEs, code examples and code comments in English.
- Follow the project skills in `.skills/.chatgpt/skills/` when relevant.
- Target the installed OWL version and keep infrastructure separate from business pages.
- Use `pageProps` from `src/router/pageProps.js` for page prop validation. Use `usePageProps()` in `setup()` when a page needs access to route values.
- Extend the shared schema with object spread for additional props; do not mutate it or duplicate its fields across pages.
- Update generators and their documentation whenever a shared page or component convention changes.
- Run the relevant tests and `npm run build` (which includes `npm run check`) before finishing code changes.

## Before finishing
Run available equivalents of:

```bash
npm run check
npm test
npm run build
```

If a command is unavailable, say so instead of claiming it passed.
