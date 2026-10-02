import test from "node:test";
import assert from "node:assert/strict";
import { AuthService } from "../src/services/auth.js";
import { ApiError, ApiService } from "../src/services/api.js";
import { LoadingService } from "../src/services/loading.js";
import { createMockAuth } from "../src/mocks/mockAuth.js";

function storage() {
  const values = new Map();
  return { get: (key) => values.get(key), set: (key, value) => values.set(key, value), remove: (key) => values.delete(key) };
}

test("a forged local user never authenticates; restore verifies /auth/me", async () => {
  const store = storage();
  store.set("user", { id: 1 });
  const auth = new AuthService({ storage: store, api: { get: async (path) => { assert.equal(path, "/auth/me"); throw new ApiError("Unauthenticated", { status: 401 }); } } });
  await auth.restore();
  assert.equal(auth.isAuthenticated, false);
  assert.equal(store.get("user"), undefined);
  assert.equal(auth.restoreError, "");
});

test("server restoration, malformed sessions and offline errors", async () => {
  const api = { get: async () => ({ user: { id: 8 } }) };
  const auth = new AuthService({ storage: storage(), api });
  await auth.restore();
  assert.equal(auth.user.id, 8);
  api.get = async () => /** @type {any} */ ({});
  await auth.restore();
  assert.equal(auth.isAuthenticated, false);
  assert.match(auth.restoreError, /invalid session/);
  api.get = async () => { throw new ApiError("Offline"); };
  await auth.restore();
  assert.equal(auth.restoreError, "Offline");
});

test("logout clears local identity but reports a server failure", async () => {
  const auth = new AuthService({ storage: storage(), api: { post: async () => { throw new ApiError("Offline"); } } });
  auth.user = { id: 1 };
  await assert.rejects(auth.logout(), /Offline/);
  assert.equal(auth.isAuthenticated, false);
});

test("late session restoration cannot undo clear()", async () => {
  /** @type {(value: any) => void} */
  let complete = () => {};
  const auth = new AuthService({ storage: storage(), api: { get: () => new Promise((resolve) => { complete = resolve; }) } });
  const pending = auth.restore();
  auth.clear();
  complete({ user: { id: 1 } });
  await pending;
  assert.equal(auth.isAuthenticated, false);
});

test("mock login, refresh and logout follow the same session contract", async () => {
  const store = storage();
  const create = () => {
    const mock = createMockAuth(store);
    const api = new ApiService({ baseUrl: "", loading: new LoadingService(), transport: async ({ path, method, data }) => mock.handle(path, method, data) });
    return new AuthService({ api, storage: store });
  };
  const auth = create();
  await auth.restore();
  assert.equal(auth.isAuthenticated, false);
  await assert.rejects(auth.login({ email: "bad", password: "bad" }), { status: 401 });
  await auth.login({ email: "demo@example.com", password: "demo" });
  assert.equal(auth.isAuthenticated, true);
  const refreshed = create();
  await refreshed.restore();
  assert.equal(refreshed.user.email, "demo@example.com");
  await refreshed.logout();
  const afterLogout = create();
  await afterLogout.restore();
  assert.equal(afterLogout.isAuthenticated, false);
});
