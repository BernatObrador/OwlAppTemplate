import fs from "node:fs";
import path from "node:path";
import { installDom } from "./lib/dom.mjs";

const dom = installDom();
const { App, Component } = await import("@odoo/owl");
const app = new App(Component);
const names = new Map();
let count = 0;
let failed = false;

function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(file);
    else if (entry.name.endsWith(".xml")) {
      count++;
      try {
        const source = fs.readFileSync(file, "utf8");
        const document = new dom.window.DOMParser().parseFromString(source, "text/xml");
        const error = document.querySelector("parsererror");
        if (error) throw new Error(error.textContent);
        if (document.documentElement.tagName !== "templates") throw new Error("Expected a <templates> root.");
        for (const node of document.querySelectorAll("[t-name]")) {
          const name = node.getAttribute("t-name");
          if (names.has(name)) throw new Error(`Duplicate t-name ${name}; first declared in ${names.get(name)}`);
          names.set(name, file);
        }
        app.addTemplates(source);
      } catch (error) { console.error(`${file}: ${error.message}`); failed = true; }
    }
  }
}
walk(path.resolve("src"));
for (const [name, file] of names) {
  try { app.getTemplate(name); }
  catch (error) { console.error(`${file} (${name}): ${error.message}`); failed = true; }
}
dom.window.close();
if (failed) process.exitCode = 1;
else console.log(`Validated ${count} XML files and compiled ${names.size} OWL templates.`);
