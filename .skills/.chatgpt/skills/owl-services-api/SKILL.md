---
name: owl-services-api
description: "Build and review app services: API client, auth, storage, loading, notifications, transports, mocks, error normalization, and environment wiring."
---

# OWL Services & API Engineer

## Environment

Prefer one obvious environment builder such as:

```text
src/app/environment.js
```

If `buildEnvironment()` already builds services, do not introduce another parallel `initializeServices()` abstraction without a proven need.

## API service

Centralize:
- base URL
- headers
- serialization
- auth token
- parsing
- HTTP error normalization
- loading
- custom/mock transport

Pages should not duplicate raw `fetch()` logic.

Suggested conceptual API:

```js
api.get(path, options)
api.post(path, body, options)
api.put(path, body, options)
api.patch(path, body, options)
api.delete(path, options)
```

Follow existing project conventions.

## Errors

Normalize errors with:
- status
- message
- validation details
- machine code when available
- original cause

Never swallow request errors silently.

## Auth

Keep behind `AuthService`:
- restore
- login
- logout
- current user
- authenticated state
- token/session handling

Do not let pages parse JWTs or manipulate storage directly.

## Storage

Namespace keys.
Do not store secrets that do not belong in browser storage.

`VITE_*` values are public in the built frontend.

## Mock transport

Must match the real API client's logical contract.
Mock-only behavior must not leak into page code.

## Loading

Use `try/finally` or centralized request wrapping.
Never leave loading permanently active after errors.

## Finish

Test mock path and real HTTP path when possible.
Document new public service methods.
