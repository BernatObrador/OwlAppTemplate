import test from "node:test";
import assert from "node:assert/strict";
import { createMockTransport } from "../src/mocks/mockTransport.js";
import { ApiError, ApiService } from "../src/services/api.js";
import { LoadingService } from "../src/services/loading.js";

test("CRM mock requires session, validates input, bounds pages and returns detached records", async () => {
  const transport = createMockTransport();
  const api = new ApiService({ baseUrl: "", transport, loading: new LoadingService() });
  const send = (method, path, data = undefined) => api.request(path, { method, data });
  await assert.rejects(send("GET", "/contacts"), { status: 401 });
  await send("POST", "/auth/login", { email: "demo@example.com", password: "demo" });
  await assert.rejects(send("POST", "/contacts", { name: "" }), (error) => error instanceof ApiError && error.status === 422 && Boolean(error.data.errors.name));
  const created = await send("POST", "/contacts", { name: "  Test contact  " });
  assert.equal(created.name, "Test contact");
  created.name = "Changed externally";
  const loaded = await send("GET", `/contacts/${created.id}`);
  assert.equal(loaded.name, "Test contact");
  const last = await send("GET", "/contacts?page=999");
  assert.equal(last.page, last.pages);
  assert.equal((await send("GET", "/contacts?page=-1")).page, 1);
  await send("DELETE", `/contacts/${created.id}`);
  await assert.rejects(send("GET", `/contacts/${created.id}`), { status: 404 });
});
