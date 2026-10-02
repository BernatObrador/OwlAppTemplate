import test from "node:test";
import assert from "node:assert/strict";
import { ApiService, ApiError } from "../src/services/api.js";
import { LoadingService } from "../src/services/loading.js";

test("HTTP requests use cookies, serialize JSON, and allow custom headers", async (t) => {
  /** @type {{ url?: any, credentials?: string, body?: any, headers?: any }} */
  let request = {};
  t.mock.method(globalThis, "fetch", async (url, options) => {
    request = { url, ...options };
    return new Response(JSON.stringify({ id: 7 }), { status: 201 });
  });
  const loading = new LoadingService();
  const api = new ApiService({ baseUrl: "/api/", loading, getHeaders: () => ({ "X-CSRF-Token": "test" }) });
  assert.deepEqual(await api.post("/items", { name: "A" }), { id: 7 });
  assert.equal(request.url, "/api/items");
  assert.equal(request.credentials, "include");
  assert.equal(request.body, '{"name":"A"}');
  assert.equal(request.headers["X-CSRF-Token"], "test");
  assert.equal(loading.active, false);
});

test("401 expires a session, login 401 does not; validation errors retain details", async (t) => {
  let status = 401;
  t.mock.method(globalThis, "fetch", async () => new Response(JSON.stringify({ message: "Invalid", errors: { name: "Required" } }), { status }));
  const api = new ApiService({ baseUrl: "/api", loading: new LoadingService() });
  let expired = 0;
  api.onUnauthorized = () => { expired++; };
  await assert.rejects(api.get("/items"), { status: 401 });
  await assert.rejects(api.post("/auth/login", {}, { auth: false }), { status: 401 });
  assert.equal(expired, 1);
  status = 422;
  await assert.rejects(api.post("/items", {}), (error) => error instanceof ApiError && error.data.errors.name === "Required");
  assert.equal(api.loading.pending, 0);
});

test("invalid JSON, network failures, 204 and aborts are distinct", async (t) => {
  const api = new ApiService({ baseUrl: "/api", loading: new LoadingService() });
  const fetchMock = t.mock.method(globalThis, "fetch", async () => new Response("<html>oops</html>"));
  await assert.rejects(api.get("/items"), { code: "INVALID_RESPONSE" });
  fetchMock.mock.mockImplementation(async () => { throw new TypeError("offline"); });
  await assert.rejects(api.get("/items"), (error) => error instanceof ApiError && error.code === "NETWORK_ERROR" && error.cause instanceof Error && error.cause.message === "offline");
  fetchMock.mock.mockImplementation(async () => new Response(null, { status: 204 }));
  assert.equal(await api.delete("/items/1"), null);
  const controller = new AbortController();
  controller.abort();
  await assert.rejects(api.get("/items", { signal: controller.signal }), { name: "AbortError" });
  assert.equal(api.loading.pending, 0);
});

test("overlapping requests keep the loading counter until both settle", async () => {
  const resolvers = [];
  const loading = new LoadingService();
  const api = new ApiService({ baseUrl: "", loading, transport: () => new Promise((resolve) => resolvers.push(resolve)) });
  const first = api.get("/one");
  const second = api.get("/two");
  assert.equal(loading.pending, 2);
  resolvers[1]({}); await second;
  assert.equal(loading.active, true);
  resolvers[0]({}); await first;
  assert.equal(loading.active, false);
});
