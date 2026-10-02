import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { register } from "node:module";
import { installDom } from "../scripts/lib/dom.mjs";
import { ApiService, ApiError } from "../src/services/api.js";
import { AuthService } from "../src/services/auth.js";
import { StorageService } from "../src/services/storage.js";
import { LoadingService } from "../src/services/loading.js";
import { NotificationService } from "../src/services/notification.js";
import { createMockTransport } from "../src/mocks/mockTransport.js";
import { createRouter } from "../src/router/router.js";

register("../scripts/lib/alias-loader.mjs", import.meta.url);

test("OWL smoke: login, dashboard, search, create, edit, errors, logout", async () => {
  const dom = installDom();
  const { App: OwlApp } = await import("@odoo/owl");
  const { App } = await import("../src/app/App.js");
  const { MainLayout } = await import("../src/layouts/MainLayout/MainLayout.js");
  const { routes } = await import("../src/router/routes.js");
  const { navigation } = await import("../src/router/navigation.js");
  const loading = new LoadingService();
  const storage = new StorageService("smoke");
  const notifications = new NotificationService();
  const transport = createMockTransport({ storage });
  let failContacts = false;
  let holdSearch = false;
  /** @type {() => Promise<void>} */
  let releaseSearch = async () => {};
  const api = new ApiService({ baseUrl: "/api", loading, transport: (args) => {
    if (failContacts && args.path.startsWith("/contacts")) throw new ApiError("Test service unavailable", { status: 503 });
    if (holdSearch && args.path.startsWith("/contacts?q=Ada")) {
      return new Promise((resolve) => {
        // Deliberately ignore cancellation to simulate a transport with a late response.
        releaseSearch = async () => resolve(await transport({ ...args, signal: undefined }));
      });
    }
    return transport(args);
  } });
  const auth = new AuthService({ api, storage });
  await auth.restore();
  const router = createRouter({ routes, auth, layouts: { main: MainLayout } });
  const env = { api, auth, loading, storage, notifications, router, navigation, appName: "Smoke app", useMock: true };
  const app = new OwlApp(App, { env, dev: true });
  const add = (dir) => {
    for (const item of fs.readdirSync(dir, { withFileTypes: true })) {
      const file = path.join(dir, item.name);
      if (item.isDirectory()) add(file);
      else if (file.endsWith(".xml")) app.addTemplates(fs.readFileSync(file, "utf8"));
    }
  };
  add("src");
  const until = async (condition) => {
    const deadline = Date.now() + 4000;
    while (!condition()) {
      if (Date.now() > deadline) assert.fail(`UI did not settle. DOM: ${document.body.textContent}`);
      await new Promise((resolve) => setTimeout(resolve, 20));
    }
  };
  const input = (selector, value) => {
    const element = /** @type {HTMLInputElement} */ (document.querySelector(selector));
    assert.ok(element, selector);
    element.value = value;
    element.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
  };
  const submit = () => document.querySelector("form").dispatchEvent(new dom.window.Event("submit", { bubbles: true, cancelable: true }));
  const nameValue = () => /** @type {HTMLInputElement} */ (document.querySelector("#name"))?.value;
  try {
    await app.mount(document.getElementById("app"));
    assert.ok(document.querySelector("#password"));
    submit();
    await until(() => document.body.textContent.includes("Recent opportunities") && !loading.active);
    await router.navigate("/contacts");
    await until(() => document.querySelectorAll("tbody tr").length === 5);
    input("input[type=search]", "Ada");
    await until(() => router.current.query.q === "Ada" && document.querySelectorAll("tbody tr").length === 1 && !loading.active);
    assert.match(document.querySelector("tbody").textContent, /Ada/);
    holdSearch = true;
    input("input[type=search]", "Ada Lovelace");
    await until(() => router.current.query.q === "Ada Lovelace" && loading.active);
    input("input[type=search]", "Grace");
    await until(() => router.current.query.q === "Grace" && document.querySelector("tbody")?.textContent.includes("Grace"));
    await releaseSearch();
    await until(() => !loading.active);
    assert.match(document.querySelector("tbody").textContent, /Grace/);
    assert.equal(/** @type {HTMLInputElement} */ (document.querySelector("input[type=search]")).value, "Grace");
    holdSearch = false;
    await router.navigate("/contacts/new");
    await until(() => document.querySelector("#name"));
    assert.equal(document.querySelector("#email").getAttribute("type"), "email");
    input("#name", "Created by smoke"); input("#email", "smoke@example.com");
    submit(); submit(); // duplicate submission must not create two contacts
    await until(() => router.current.name === "contacts" && !loading.active && document.body.textContent.includes("Created by smoke"));
    const found = await api.get("/contacts?q=Created%20by%20smoke");
    assert.equal(found.total, 1);
    await router.navigate(`/contacts/${found.records[0].id}`);
    await until(() => nameValue() === "Created by smoke");
    input("#name", "Edited by smoke"); submit();
    await until(() => router.current.name === "contacts" && !loading.active && document.body.textContent.includes("Edited by smoke"));
    await router.navigate("/contacts/1");
    await until(() => nameValue() === "Ada Lovelace");
    await router.navigate("/contacts/2");
    await until(() => nameValue() === "Grace Hopper");
    failContacts = true;
    await router.navigate("/contacts");
    await until(() => document.body.textContent.includes("Test service unavailable"));
    assert.ok(document.body.textContent.includes("Retry"));
    failContacts = false;
    await router.navigate("/contacts/99999");
    await until(() => document.body.textContent.includes("Contact not found"));
    assert.equal(document.querySelector("form"), null);
    await router.navigate("/opportunities");
    await until(() => document.querySelector("tbody")?.textContent.includes("CRM rollout"));
    await router.navigate("/opportunities/new");
    await until(() => document.getElementById("customer"));
    assert.match(document.querySelector(".app-breadcrumbs").textContent, /Dashboard.*Opportunities.*New/);
    input("#name", "Smoke opportunity"); input("#customer", "Acme"); input("#amount", "1250.50");
    submit();
    await until(() => router.current.name === "opportunities" && !loading.active && document.querySelector("tbody")?.textContent.includes("Smoke opportunity"));
    const opportunities = await api.get("/opportunities?q=Smoke");
    assert.equal(opportunities.records[0].amount, 1250.5);
    await router.navigate(`/opportunities/${opportunities.records[0].id}`);
    await until(() => nameValue() === "Smoke opportunity");
    input("#name", "Updated opportunity"); submit();
    await until(() => router.current.name === "opportunities" && !loading.active && document.querySelector("tbody")?.textContent.includes("Updated opportunity"));
    await router.navigate("/opportunities?q=acme&stage=proposal&sort=amount&order=desc&page=1");
    await until(() => !loading.active && document.querySelector("tbody")?.textContent.includes("CRM rollout") && !document.querySelector("tbody")?.textContent.includes("Updated opportunity"));
    assert.equal(/** @type {HTMLSelectElement} */ (document.getElementById("stage-filter")).value, "proposal");
    assert.equal(/** @type {HTMLInputElement} */ (document.querySelector("input[type=search]")).value, "acme");
    assert.equal(document.querySelector('th[aria-sort="descending"]')?.textContent.trim(), "Amount ↓");
    const filteredQuery = { ...router.current.query };
    document.querySelector("tbody tr").dispatchEvent(new dom.window.MouseEvent("click", { bubbles: true }));
    await until(() => nameValue() === "CRM rollout");
    assert.deepEqual(router.current.query, filteredQuery);
    const listCrumb = /** @type {HTMLAnchorElement} */ (document.querySelector('.app-breadcrumbs a[href^="/opportunities?"]'));
    assert.ok(listCrumb);
    listCrumb.click();
    await until(() => router.current.name === "opportunities" && !loading.active && document.getElementById("stage-filter"));
    assert.deepEqual(router.current.query, filteredQuery);
    assert.equal(/** @type {HTMLSelectElement} */ (document.getElementById("stage-filter")).value, "proposal");
    assert.equal(/** @type {HTMLInputElement} */ (document.querySelector("input[type=search]")).value, "acme");
    const logout = [...document.querySelectorAll("button")].find((button) => button.textContent === "Log out");
    logout.click();
    await until(() => document.querySelector("#password"));
    assert.equal(auth.isAuthenticated, false);
  } finally { app.destroy(); dom.window.close(); }
});
