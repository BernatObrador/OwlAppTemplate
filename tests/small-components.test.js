import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { installDom } from "../scripts/lib/dom.mjs";

test("Pagination, SearchInput and BreadCrumbs expose user actions without owning history", async () => {
  const dom = installDom();
  const { App, Component, xml } = await import("@odoo/owl");
  const { Pagination } = await import("../src/components/Pagination/Pagination.js");
  const { SearchInput } = await import("../src/components/SearchInput/SearchInput.js");
  const { BreadCrumbs } = await import("../src/components/BreadCrumbs/BreadCrumbs.js");
  const pages = [], searches = [], navigation = [];
  class Root extends Component {
    static components = { Pagination, SearchInput, BreadCrumbs };
    static template = xml`<div><Pagination page="1" pages="3" onChange="(page) => this.change(page)"/><SearchInput value="''" onInput="(value) => this.search(value)"/><BreadCrumbs pathList="crumbs"/></div>`;
    crumbs = [{ name: "Dashboard", url: "/" }, { name: "Contacts", url: "/contacts" }];
    change(page) { pages.push(page); }
    search(value) { searches.push(value); }
  }
  const app = new App(Root, { env: { router: { navigate: (path) => navigation.push(path) } }, dev: true });
  for (const name of ["Pagination", "SearchInput", "BreadCrumbs"]) app.addTemplates(fs.readFileSync(new URL(`../src/components/${name}/${name}.xml`, import.meta.url), "utf8"));
  try {
    await app.mount(document.getElementById("app"));
    const buttons = document.querySelectorAll("button");
    assert.equal(buttons[0].disabled, true); buttons[1].click(); assert.deepEqual(pages, [2]);
    const input = document.querySelector("input"); input.value = "Ada"; input.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    assert.deepEqual(searches, ["Ada"]);
    document.querySelector("a").click(); assert.deepEqual(navigation, ["/"]);
    assert.equal(document.querySelector('[aria-current="page"]').textContent, "Contacts");
  } finally { app.destroy(); dom.window.close(); }
});
