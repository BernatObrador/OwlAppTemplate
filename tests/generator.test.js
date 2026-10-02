import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createApp } from "../scripts/create-app.mjs";
import { createArtifact } from "../scripts/component.mjs";
import { createResource } from "../scripts/resource.mjs";
import { validateSource } from "../scripts/validate-source.mjs";

test("clean app is independent, named, locked, and has no CRM or copied secrets", () => {
  const temp = fs.mkdtempSync(path.join(os.tmpdir(), "owl-generator-"));
  try {
    const directory = path.join(temp, "test-workspace");
    createApp("test-workspace", { directory });
    const read = (file) => fs.readFileSync(path.join(directory, file), "utf8");
    const pkg = JSON.parse(read("package.json"));
    const lock = JSON.parse(read("package-lock.json"));
    assert.equal(pkg.name, "test-workspace");
    assert.equal(pkg.dependencies["@odoo/owl"], "2.8.3");
    assert.deepEqual(pkg.dependencies, lock.packages[""].dependencies);
    assert.equal(read(".env"), read(".env.example"));
    assert.match(read(".env"), /VITE_STORAGE_PREFIX=test-workspace/);
    assert.match(read("src/router/routes.js"), /Home/);
    assert.doesNotMatch(read("src/router/routes.js"), /Contacts|Dashboard/);
    for (const excluded of ["node_modules", ".git", "src/pages/Contacts", "src/pages/Dashboard", "src/pages/ContactForm", "src/pages/Opportunities", "src/pages/OpportunityForm", "src/pages/Projects", "src/mocks/mockData.js"]) assert.equal(fs.existsSync(path.join(directory, excluded)), false, excluded);
    assert.ok(fs.existsSync(path.join(directory, "src/components/DataTable/DataTable.js")));
    assert.throws(() => createApp("test-workspace", { directory }), /already exists/);
    createArtifact("page", "Customers", directory);
    assert.match(read("src/pages/Customers/Customers.js"), /static props = pageProps/);
    assert.match(read("src/pages/Customers/Customers.js"), /this.page = usePageProps\(\)/);
    assert.ok(fs.existsSync(path.join(directory, "src/router/pageProps.js")));
    createResource("work-orders", directory);
    assert.match(read("src/pages/WorkOrders/WorkOrders.js"), /extends BaseListPage/);
    assert.match(read("src/pages/WorkOrdersForm/WorkOrdersForm.js"), /extends BaseForm/);
    assert.deepEqual(validateSource(path.join(directory, "src")), []);
    assert.throws(() => createResource("work-orders", directory), /already exists/);
    assert.throws(() => createResource("../outside", directory), /lowercase/);
    fs.writeFileSync(path.join(directory, "src", "bad.js"), 'import { Missing } from "./missing.js"; class Bad { static template = "missing.Template"; }');
    assert.equal(validateSource(path.join(directory, "src")).length, 2);
    assert.throws(() => createArtifact("page", "Customers", directory), /already exists/);
    assert.throws(() => createArtifact("page", "../Oops", directory), /PascalCase/);
  } finally { fs.rmSync(temp, { recursive: true, force: true }); }
});

test("invalid app names and project source destinations are rejected before writing", () => {
  for (const name of ["../escape", "Bad Name", "con", "", "a/b"]) assert.throws(() => createApp(name), /lowercase/);
  const root = fileURLToPath(new URL("../", import.meta.url));
  assert.throws(() => createApp("safe-name", { directory: path.join(root, "src", "safe-name") }), /under apps/);
});
