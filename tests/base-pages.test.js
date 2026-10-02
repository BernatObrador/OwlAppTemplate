import test from "node:test";
import assert from "node:assert/strict";
import { register } from "node:module";
import { installDom } from "../scripts/lib/dom.mjs";
import { ApiError } from "../src/services/api.js";
register("../scripts/lib/alias-loader.mjs", import.meta.url);

test("shared page foundations", async (t) => {
  const dom = installDom();
  const { App, Component, useState, xml } = await import("@odoo/owl");
  const { BaseForm } = await import("../src/forms/BaseForm.js");
  const { BaseListPage } = await import("../src/pages/BaseListPage.js");
  const frame = () => new Promise((resolve) => setTimeout(resolve, 35));
  const until = async (condition) => {
    const deadline = Date.now() + 2000;
    while (!condition()) { if (Date.now() > deadline) assert.fail("Timed out waiting for page state"); await frame(); }
  };
  class Form extends BaseForm {
    static template = xml`<div><span t-esc="state.form.name"/></div>`;
    get apiUrl() { return "/api-items"; }
    get routeUrl() { return "/screens"; }
    getInitialForm() { return { name: "" }; }
    validate() { this.state.errors = this.state.form.name ? {} : { name: "Required" }; return !this.state.errors.name; }
  }
  try {
    await t.test("save and cancel retain the list query without putting it on API URLs", async () => {
      const navigation = [], requests = [];
      const query = { q: "two words&more", stage: "won", sort: "name", order: "desc", page: "2" };
      const env = { api: { post: async (path) => { requests.push(path); } }, router: { navigate: async (path) => { navigation.push(path); } }, notifications: { add() {} } };
      const app = new App(Form, { env, props: { query }, dev: true });
      try {
        const form = await app.mount(document.getElementById("app"));
        await form.cancel();
        form.setField("name", "Saved");
        await form.save(null);
        const expected = `/screens?${new URLSearchParams(query)}`;
        assert.deepEqual(navigation, [expected, expected]);
        assert.deepEqual(requests, ["/api-items"]);
      } finally { app.destroy(); }
    });
    await t.test("form validates, resets, maps backend errors, prevents duplicate saves and uses separate route URL", async () => {
      const calls = [], navigation = [];
      let fail = false;
      let finish = () => {};
      const env = {
        api: { post: async (path, values) => {
          calls.push({ path, values });
          if (fail) throw new ApiError("Invalid", { status: 422, data: { errors: { name: "Already exists", other: "Ignored" } } });
          await new Promise((resolve) => { finish = () => resolve(undefined); });
        } },
        router: { navigate: async (path) => { navigation.push(path); } }, notifications: { add() {} },
      };
      const app = new App(Form, { env, dev: true });
      try {
        const form = await app.mount(document.getElementById("app"));
        await form.save(null); assert.equal(calls.length, 0); assert.equal(form.state.errors.name, "Required");
        form.setField("name", "First"); assert.equal(form.dirty, true); assert.equal(form.state.errors.name, "");
        form.reset(); assert.equal(form.state.form.name, ""); assert.equal(form.dirty, false);
        form.setField("name", "Save me");
        const pending = form.save(null); await form.save(null);
        assert.equal(calls.length, 1); assert.equal(form.state.saving, true);
        finish(); await pending;
        assert.deepEqual(navigation, ["/screens"]); assert.equal(calls[0].path, "/api-items");
        fail = true; await form.save(null);
        assert.equal(form.state.saveError, "Invalid"); assert.equal(form.state.errors.name, "Already exists");
        assert.equal(form.state.errors.other, undefined); assert.equal(form.state.saving, false);
      } finally { app.destroy(); }
    });
    await t.test("existing form loads /id, uses PUT, and aborts reads when destroyed", async () => {
      let signal = new AbortController().signal, requested = "", putPath = "";
      /** @type {(value: any) => void} */
      let release = () => {};
      const env = {
        api: { get: async (path, options) => { requested = path; signal = options.signal; return { id: 7, name: "Existing" }; }, put: async (path) => { putPath = path; } },
        router: { navigate() {} }, notifications: { add() {} },
      };
      const app = new App(Form, { env, props: { params: { id: "7" } }, dev: true });
      const form = await app.mount(document.getElementById("app"));
      await until(() => !form.state.loading);
      assert.equal(requested, "/api-items/7"); assert.equal(form.state.form.name, "Existing"); assert.equal(form.dirty, false);
      form.setField("name", "Edited"); await form.save(null); assert.equal(putPath, "/api-items/7");
      env.api.get = async () => null;
      await form.load();
      assert.equal(form.state.loadError, "Invalid record response from the server.");
      assert.equal(form.state.form.name, "Edited");
      assert.equal(form.state.loading, false);
      env.api.get = async (_path, options) => { signal = options.signal; return await new Promise((resolve) => { release = resolve; }); };
      const pending = form.load(); app.destroy(); assert.equal(signal.aborted, true);
      release({ id: 7, name: "Late" }); await pending;
      assert.equal(form.state.form.name, "Edited");
    });
    await t.test("list parses pages, debounces search, rejects stale responses, syncs query, and handles errors", async () => {
      /** @type {InstanceType<typeof BaseListPage>} */
      let list;
      let parent;
      let release = () => {};
      const calls = [], navigations = [];
      class List extends BaseListPage {
        static template = xml`<div t-esc="state.error"/>`;
        get apiUrl() { return "/records"; }
        get routeUrl() { return "/screen"; }
        get perPage() { return 3; }
        get filterKeys() { return ["stage"]; }
        setup() { super.setup(); list = this; }
      }
      class Parent extends Component {
        static components = { List };
        static template = xml`<List query="state.query"/>`;
        setup() { this.state = useState({ query: { page: "invalid", stage: "proposal" } }); }
      }
      const env = { api: { get: async (path, { signal }) => {
        calls.push({ path, signal });
        const query = new URL(path, "https://test").searchParams;
        const result = { records: [{ id: 1, name: query.get("q") }], page: Number(query.get("page")), pages: 5, total: 15 };
        if (query.get("q") === "slow") return new Promise((resolve) => { release = () => resolve(result); });
        if (query.get("q") === "error") throw new Error("Unavailable");
        return result;
      } }, router: { navigate: async (path) => {
        navigations.push(path);
        parent.state.query = Object.fromEntries(new URL(path, "https://test").searchParams);
      }, checkPathExists: () => true } };
      const app = new App(Parent, { env, dev: true });
      try {
        parent = await app.mount(document.getElementById("app"));
        await until(() => !list.state.loading);
        assert.match(calls[0].path, /page=1/); assert.match(calls[0].path, /perPage=3/);
        list.changePage(2); await until(() => !list.state.loading && list.state.page === 2 && calls.at(-1).path.includes("page=2"));
        assert.match(navigations.at(-1), /^\/screen\?/);
        list.search("slow"); await until(() => calls.at(-1).path.includes("q=slow"));
        const previousSignal = calls.at(-1).signal;
        list.search("fast"); await until(() => !list.state.loading && list.state.records[0].name === "fast");
        assert.equal(previousSignal.aborted, true); release(); await frame();
        assert.equal(list.state.records[0].name, "fast"); assert.equal(list.state.page, 1);
        list.changeFilter("stage", "won"); await until(() => calls.at(-1).path.includes("stage=won"));
        list.changeSort("name", "desc"); await until(() => calls.at(-1).path.includes("order=desc"));
        list.search("two words&more");
        const beforeOpen = calls.length;
        await list.open({ id: "a/b" });
        const detail = new URL(navigations.at(-1), "https://test");
        assert.equal(detail.pathname, "/screen/a%2Fb");
        assert.equal(detail.searchParams.get("q"), "two words&more");
        assert.equal(detail.searchParams.get("stage"), "won");
        assert.equal(detail.searchParams.get("sort"), "name");
        assert.equal(detail.searchParams.get("order"), "desc");
        assert.equal(detail.searchParams.has("perPage"), false);
        await until(() => calls.length > beforeOpen && !list.state.loading);
        list.changePage(2); await until(() => calls.at(-1).path.includes("page=2"));
        const beforeCreate = calls.length;
        await list.createRecord();
        const create = new URL(navigations.at(-1), "https://test");
        assert.equal(create.pathname, "/screen/new");
        assert.equal(create.searchParams.get("page"), "2");
        assert.equal(create.searchParams.get("q"), "two words&more");
        await until(() => calls.length > beforeCreate && !list.state.loading);
        list.search("error"); await until(() => list.state.error === "Unavailable");
        assert.equal(list.state.loading, false);
        list.search("never-requested"); const count = calls.length; app.destroy();
        await new Promise((resolve) => setTimeout(resolve, 300)); assert.equal(calls.length, count);
      } finally { app.destroy(); }
    });
  } finally { dom.window.close(); }
});
