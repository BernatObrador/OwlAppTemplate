import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { installDom } from "../scripts/lib/dom.mjs";

test("DataTable sorts, renders custom cells, isolates row actions and selects visible records", async () => {
  const dom = installDom();
  const { App, Component, useState, xml } = await import("@odoo/owl");
  const { DataTable } = await import("../src/components/DataTable/DataTable.js");
  let opened = 0, actions = 0;
  class Cell extends Component {
    static props = ["value", "record", "column"];
    static template = xml`<strong t-esc="props.value"/>`;
  }
  class Parent extends Component {
    static components = { DataTable };
    static template = xml`<DataTable columns="columns" records="state.records" loading="state.loading" selectable="true" actions="actions" onRowClick="() => this.open()"/>`;
    columns = [{ key: "name", label: "Name", sortable: true, component: Cell }, { key: "status", label: "Status", type: "badge" }];
    actions = [{ key: "edit", label: "Edit", onClick: () => actions++ }];
    setup() { this.state = useState({ records: [{ id: 1, name: "Zeta", status: "Lead" }, { id: 2, name: "Alpha", status: "Customer" }], loading: false }); }
    open() { opened++; }
  }
  const app = new App(Parent, { dev: true });
  app.addTemplates(fs.readFileSync(new URL("../src/components/DataTable/DataTable.xml", import.meta.url), "utf8"));
  const frame = async () => {
    await Promise.resolve();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  };
  const click = (selector) => /** @type {HTMLElement} */ (document.querySelector(selector)).click();
  try {
    const root = await app.mount(document.getElementById("app"));
    assert.equal(document.querySelector("tbody strong").textContent, "Zeta");
    click(".app-table-sort"); await frame();
    assert.equal(document.querySelector("tbody strong").textContent, "Alpha");
    assert.equal(document.querySelector("th[aria-sort]").getAttribute("aria-sort"), "ascending");
    click(".app-table-sort"); await frame();
    assert.equal(document.querySelector("tbody strong").textContent, "Zeta");
    click(".app-row-actions button"); assert.equal(actions, 1); assert.equal(opened, 0);
    click("tbody input"); await frame(); assert.equal(opened, 0);
    assert.equal(/** @type {HTMLInputElement} */ (document.querySelector("tbody input")).checked, true);
    click("thead input"); await frame();
    assert.equal(document.querySelectorAll("tbody input:checked").length, 2);
    document.querySelector("tbody tr").dispatchEvent(new dom.window.KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
    assert.equal(opened, 1);
    assert.equal(document.querySelectorAll(".app-badge").length, 2);
    root.state.loading = true; await frame();
    assert.match(document.querySelector("tbody").textContent, /Loading/);
    assert.equal(document.querySelectorAll("tbody input").length, 0);
    root.state.loading = false; root.state.records = []; await frame();
    assert.match(document.querySelector("tbody").textContent, /No records/);
  } finally { app.destroy(); dom.window.close(); }
});
