# Deployment

[Documentation index](README.md) · [Authentication](AUTHENTICATION.md)

Set production environment values before building:

```dotenv
VITE_APP_NAME=My App
VITE_API_URL=/api
VITE_USE_MOCK_API=false
VITE_UI_PROVIDER=bootstrap
VITE_STORAGE_PREFIX=my-app
```

Vite embeds VITE_* values into the client bundle at build time. They are public configuration, never secrets. Changing the server environment after building does not rewrite a deployed bundle.

```bash
npm ci
npm run check
npm test
npm run build
```

Publish dist using your chosen static host. `npm run preview` is a local build check, not a production server.

## Hosting requirements

The router uses History API URLs. Serve index.html for unknown frontend paths such as /contacts/42. Serve assets normally and send /api requests to the backend before applying any SPA fallback. The template assumes deployment at the origin root; subdirectory hosting requires coordinated Vite base and router/navigation path changes.

Use HTTPS and configure the backend's session cookie, CSRF protection, authorization and allowed origins. Confirm POST /auth/login, GET /auth/me and POST /auth/logout behave as documented. A successful frontend build does not validate your backend deployment.

## Release checks

Open a deep link directly, sign in, refresh, navigate with Back/Forward and verify session expiry/logout. Exercise a list and form against the real API, including 422 validation errors and network failures. Check mobile navigation and table scrolling. Ensure demo credentials and mock data are not the production authentication system.

Keep hashed assets cacheable and allow index.html to refresh for new releases. Retain the previous deployment for rollback. This repository does not publish or deploy automatically.
