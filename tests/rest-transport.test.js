import test from "node:test";
import assert from "node:assert/strict";
import { createRestTransport } from "../src/mocks/restTransport.js";
import { ApiError } from "../src/services/api.js";

test("generic REST resources implement CRUD, search, sort, filters, pagination and protected custom endpoints", async () => {
  const transport = createRestTransport({ delay: 0, resources: { items: {
    records: [{ id: 1, name: "Beta", stage: "Open", amount: 20 }, { id: 2, name: "Alpha", stage: "Won", amount: 10 }],
    searchFields: ["name"], sortFields: ["amount"], filterFields: ["stage"],
    validate(data) { if (!data.name) throw new ApiError("Name required", { status: 422 }); return data; },
  } }, endpoints: { "GET /summary": ({ resources }) => ({ total: resources.items.records.length }) } });
  const request = (method, path, data = undefined) => transport({ method, path, data });
  await assert.rejects(request("GET", "/summary"), { status: 401 });
  await request("POST", "/auth/login", { email: "demo@example.com", password: "demo" });
  const sorted = await request("GET", "/items?sort=amount&order=asc&perPage=1&page=2");
  assert.equal(sorted.records[0].name, "Beta"); assert.equal(sorted.pages, 2);
  assert.equal((await request("GET", "/items?q=alpha&stage=won")).total, 1);
  assert.equal((await request("GET", "/items?stage=missing")).total, 0);
  await assert.rejects(request("GET", "/missing"), { status: 404 });
  await assert.rejects(request("GET", "/items/999"), { status: 404 });
  await assert.rejects(request("POST", "/items", {}), { status: 422 });
  const created = await request("POST", "/items", { name: "New", amount: 30 });
  const patched = await request("PATCH", `/items/${created.id}`, { amount: 40 });
  assert.equal(patched.name, "New"); assert.equal(patched.amount, 40);
  const replaced = await request("PUT", `/items/${created.id}`, { name: "Replacement" });
  assert.equal(replaced.amount, undefined);
  await request("DELETE", `/items/${created.id}`);
  const next = await request("POST", "/items", { name: "Next" });
  assert.ok(next.id > created.id);
  await assert.rejects(request("DELETE", "/items"), { status: 405 });
  assert.equal((await request("GET", "/summary")).total, 3);
  const controller = new AbortController(); controller.abort();
  await assert.rejects(transport({ path: "/items", signal: controller.signal }), { name: "AbortError" });
});
