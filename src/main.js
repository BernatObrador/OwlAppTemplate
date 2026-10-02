import { mount } from "@odoo/owl";

import { App } from "@/app/App.js";
import { buildEnvironment } from "@/app/environment.js";
import { loadUiProvider } from "@/ui/loadUiProvider.js";
import { loadTemplates } from "@/utils/loadTemplates.js";

import "@/styles/tokens.css";
import "@/styles/app.css";

await loadUiProvider(import.meta.env.VITE_UI_PROVIDER || "bootstrap");

const env = await buildEnvironment();
const target = document.getElementById("app");

if (!target) {
  throw new Error('Missing root element "#app"');
}

mount(App, target, {
  templates: loadTemplates(),
  env,
  dev: import.meta.env.DEV,
});
