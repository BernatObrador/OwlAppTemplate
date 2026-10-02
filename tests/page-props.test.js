import test from "node:test";
import assert from "node:assert/strict";
import { installDom } from "../scripts/lib/dom.mjs";

test("page props retain validation, support extensions, and read current props after updates", async () => {
  const dom = installDom();
  const { App, Component, useState, xml, validate } = await import("@odoo/owl");
  const { pageProps, usePageProps } =
    await import("../src/router/pageProps.js");
  const schema = { ...pageProps, title: String };
  assert.doesNotThrow(() => validate({ title: "Home" }, schema));
  assert.throws(() => validate({ title: "Home", params: "invalid" }, schema));
  assert.throws(() => validate({ title: 42 }, schema));
  assert.throws(() => usePageProps(), /component|active|setup/i);

  let instances = 0;
  /** @type {ReturnType<typeof usePageProps> | undefined} */
  let view;
  class Page extends Component {
    static props = schema;
    static template = xml`<div><span t-esc="page.params.id || 'none'"/><span t-esc="page.query.tab || 'none'"/><span t-esc="page.route?.name || 'none'"/><span t-esc="props.title"/></div>`;
    setup() {
      instances++;
      this.page = usePageProps();
      view = this.page;
    }
  }
  class Parent extends Component {
    static components = { Page };
    static template = xml`<Page t-props="state.pageProps"/>`;
    setup() {
      this.state = useState({
        pageProps: {
          params: { id: "1" },
          query: { tab: "first" },
          route: { name: "detail" },
          title: "Initial",
        },
      });
    }
  }
  const app = new App(Parent, { dev: true });
  const settle = async (text) => {
    for (let i = 0; i < 100 && document.body.textContent !== text; i++)
      await new Promise((resolve) => setTimeout(resolve, 10));
    assert.equal(document.body.textContent, text);
  };
  try {
    const root = await app.mount(document.getElementById("app"));
    assert.equal(document.body.textContent, "1firstdetailInitial");
    const originalView = view;
    root.state.pageProps = {
      params: { id: "2" },
      query: { tab: "second" },
      route: { name: "updated" },
      title: "Changed",
    };
    await settle("2secondupdatedChanged");
    assert.equal(view, originalView);
    assert.equal(instances, 1);
    assert.equal(view.params.id, "2");
    root.state.pageProps = /** @type {any} */ ({ title: "Optional" });
    await settle("nonenonenoneOptional");
    assert.deepEqual(view.params, {});
    assert.deepEqual(view.query, {});
    assert.equal(view.route, null);
    assert.equal(Object.hasOwn(pageProps, "title"), false);
  } finally {
    app.destroy();
    dom.window.close();
  }
});
