# Authentication

[Documentation index](README.md) · [API services](SERVICES.md) · [Deployment](DEPLOYMENT.md)

The template supplies an HTTP session client and a development mock. Your backend owns session creation, authorization and persistence.

## Contract

| Endpoint | Request | Successful response |
| --- | --- | --- |
| `POST /auth/login` | `{ "email": "...", "password": "..." }` | `{ "user": { "id": 1, "name": "...", "email": "..." } }` |
| `GET /auth/me` | Session cookie | Same user envelope |
| `POST /auth/logout` | `{}` and session cookie | JSON or 204 |

An anonymous or expired session returns 401. Validation errors may use `{ message, errors }`. At least user.id is required for a valid session response.

ApiService sends `credentials: "include"`. For production, use an appropriate Secure/HttpOnly cookie, server-side expiry and CSRF protection. Configure credentialed CORS with an explicit allowed origin if the frontend and backend differ. Route guards do not replace endpoint permissions.

## Client lifecycle

`buildEnvironment()` creates AuthService and awaits `restore()` before mounting the application. Restoration always calls `/auth/me`; a locally stored user never authenticates. The old `user` storage key is discarded. A non-401 restoration failure is retained in `restoreError` so login can explain the connection failure.

`login(credentials)` verifies the response, updates the in-memory user and lets Login navigate to the validated local `next` URL. Request revisions prevent late restore/login responses from undoing a newer clear/logout.

A protected API 401 invokes the environment's unauthorized handler: it clears identity, shows a session-expired notification and resolves the current route through its guard. Auth requests use `{ auth: false }` to avoid treating invalid login credentials as expiration of an existing session. This flag only controls client error handling; it does not change server authorization or omit cookies.

`logout()` calls the server and always clears local identity. A remote failure remains visible because a server cookie might still be valid. The next reload verifies it again with `/auth/me`; the client does not claim the server session was revoked when it was not.

## Connect your backend

```dotenv
VITE_USE_MOCK_API=false
VITE_API_URL=/api
VITE_STORAGE_PREFIX=my-app
```

Restart Vite after changing environment variables. Implement the three auth endpoints under the API base URL and protect business endpoints. The frontend does not create a backend or database. Never store secrets in VITE_* variables: they are embedded in the client bundle.

Use ApiService's getHeaders callback for a backend-specific CSRF header or other request metadata. Keep token refresh or alternative authentication protocols in services, not page components.

## Development mock

Credentials are `demo@example.com` / `demo`. `mockAuth.js` keeps a development-only `mock-session` marker in namespaced storage, so a refresh preserves login. Business records live in memory and reset on refresh. This marker is intentionally forgeable and is never used by HTTP authentication. Disable the mock for production.

Tests cover forged cached identity, restoration, malformed sessions, connection errors, logout failures, stale responses and mock refresh. See [testing](TESTING.md).
