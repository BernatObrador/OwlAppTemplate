import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { installDom } from "../scripts/lib/dom.mjs";

test("FormField covers typed controls, errors, help and disabled updates", async () => {
  const dom = installDom();
  const { App, Component, useState, xml } = await import("@odoo/owl");
  const { FormField } = await import("../src/components/FormField/FormField.js");
  class Parent extends Component {
    static components = { FormField };
    static template = xml`<div><FormField name="'field'" label="'Field'" type="state.type" value="state.value" options="options" error="'Invalid'" help="'Useful hint'" disabled="state.disabled" onInput="(value) => this.state.value = value"/></div>`;
    options = [{ value: "a", label: "A" }, { value: "b", label: "B" }];
    setup() { this.state = useState({ type: "text", value: /** @type {string | number | boolean} */ ("Initial"), disabled: false }); }
  }
  const app = new App(Parent, { dev: true });
  app.addTemplates(fs.readFileSync(new URL("../src/components/FormField/FormField.xml", import.meta.url), "utf8"));
  const frame = async () => {
    await Promise.resolve();
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
  };
  const field = () => /** @type {HTMLInputElement} */ (document.getElementById("field"));
  try {
    const root = await app.mount(document.getElementById("app"));
    assert.equal(field().value, "Initial");
    assert.equal(field().getAttribute("aria-describedby"), "field-help field-error");
    assert.equal(document.querySelector("label").htmlFor, "field");
    root.state.type = "textarea"; root.state.value = "Notes"; await frame();
    assert.equal(field().value, "Notes");
    root.state.type = "select"; root.state.value = "b"; await frame();
    assert.equal(field().value, "b");
    field().value = "a"; field().dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    assert.equal(root.state.value, "a");
    root.state.type = "checkbox"; root.state.value = false; await frame();
    field().checked = true; field().dispatchEvent(new dom.window.Event("change", { bubbles: true }));
    assert.equal(root.state.value, true);
    root.state.type = "number"; root.state.value = 10; await frame();
    field().value = "42.5"; field().dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    assert.equal(root.state.value, 42.5);
    root.state.type = "date"; root.state.value = "2026-09-27"; root.state.disabled = true; await frame();
    assert.equal(field().value, "2026-09-27");
    field().value = "2026-10-01"; field().dispatchEvent(new dom.window.Event("input", { bubbles: true }));
    assert.equal(root.state.value, "2026-09-27");
    assert.equal(field().disabled, true);
  } finally { app.destroy(); dom.window.close(); }
});
