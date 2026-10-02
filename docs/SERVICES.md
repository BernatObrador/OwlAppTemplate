# Services and HTTP endpoints

[Documentation index](README.md) · [Mock API](MOCK_API.md) · [Authentication](AUTHENTICATION.md)

`buildEnvironment()` composes services once. Components and pages access them through `this.env`; do not construct duplicate API or auth instances inside pages.

## API

```js
const result = await this.env.api.get("/tasks?q=report&page=1&perPage=10");
const created = await this.env.api.post("/tasks", { name: "Report" });
await this.env.api.put(`/tasks/${created.id}`, { name: "Final report" });
await this.env.api.patch(`/tasks/${created.id}`, { name: "Revised report" });
await this.env.api.delete(`/tasks/${created.id}`);
```

Methods accept an options object last. Supported options are `headers`, `loading` (default true), `signal`, `auth` (default true) and `perPage`. `request(path, options)` also accepts method and data. perPage is encoded in the query for both the mock and HTTP transport; explicit query strings are usually clearer.

JSON is serialized automatically; Accept is sent on every request and Content-Type when data exists. HTTP uses the configured baseUrl plus your path and includes cookies. 204 returns null. This service targets JSON APIs; use a deliberate extension for uploads or streaming.

```js
const controller = new AbortController();
const result = await this.env.api.get("/tasks", {
  signal: controller.signal,
  loading: false,
});
```

AbortError remains distinguishable from ordinary failures. BaseListPage and BaseForm handle request cleanup already. A custom page should abort pending reads on destruction and ignore stale responses.

## Error contract

ApiError exposes `message`, `status`, `data`, `code` and cause. HTTP errors preserve the server's JSON payload. Invalid successful JSON has code INVALID_RESPONSE; connection failures have NETWORK_ERROR. Backend field validation can return:

```json
{ "message": "Review the form.", "errors": { "name": "Name is required." } }
```

Return that body with status 422. BaseForm maps known field errors. A protected 401 invokes onUnauthorized; `{ auth: false }` suppresses that callback for login/session probes, not server authorization.

## Other services

- `env.notifications.add(message, { type, title, timeout })` adds a toast and returns its ID. Types include info, success, warning and danger. Default timeout is 3500 ms; zero keeps it until removed. `remove(id)` dismisses it.
- `env.loading.start()` / `stop()` track concurrent operations. ApiService balances them in finally. Subscriptions drive LoadingBar, so one finished request cannot hide another pending request.
- `env.storage.get(key, fallback)` / `set(key, value)` / `remove(key)` provide namespaced JSON localStorage with safe failure handling. Storage is for preferences and mock state, not proof of authentication.
- `env.auth` implements the session lifecycle described in [authentication](AUTHENTICATION.md).
- `env.router` handles URLs and page selection; see [routing](ROUTING.md).

Notifications and loading expose subscribe callbacks returning an unsubscribe function. Reusable bridge components subscribe in setup and unsubscribe on destruction.

## Add a service

Create a class or factory under src/services, construct it in buildEnvironment and include it in the returned env. Keep services independent of page classes and XML. For business-specific transformations, a feature module may call env.api rather than extending the generic API class.

A screen route is registered in src/router/routes.js. A mock endpoint is registered in src/mocks. A real HTTP endpoint must be implemented by your server: none of the frontend generators starts a server API. Match its response to the [mock contract](MOCK_API.md) so switching transports does not rewrite pages.
