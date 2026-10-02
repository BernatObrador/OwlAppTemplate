import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function createResource(name, root = process.cwd()) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name || "") || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/.test(name)) throw new Error("Use a lowercase resource name, for example: npm run resource -- tasks");
  const Page = name.split("-").map((part) => part[0].toUpperCase() + part.slice(1)).join("");
  const Form = `${Page}Form`;
  const files = {
    [`src/pages/${Page}/${Page}.js`]: `import { BaseListPage } from "@/pages/BaseListPage.js";
import { DataTable } from "@/components/DataTable/DataTable.js";
import { SearchInput } from "@/components/SearchInput/SearchInput.js";
import { Pagination } from "@/components/Pagination/Pagination.js";

export class ${Page} extends BaseListPage {
  static template = "pages.${Page}";
  static components = { DataTable, SearchInput, Pagination };
  get apiUrl() { return "/${name}"; }
  get routeUrl() { return "/${name}"; }
  columns = [{ key: "name", label: "Name", sortable: true }];
}
`,
    [`src/pages/${Page}/${Page}.xml`]: `<templates xml:space="preserve">
  <t t-name="pages.${Page}">
    <section class="app-page">
      <div class="app-page-header"><h1>${Page}</h1><button class="app-button app-button-primary" t-on-click="createRecord">New record</button></div>
      <article class="app-card">
        <div class="app-toolbar"><SearchInput value="state.query" onInput.bind="search"/></div>
        <div t-if="state.error" role="alert" class="app-alert app-alert-danger"><p t-esc="state.error"/><button class="app-button app-button-ghost" t-on-click="load">Retry</button></div>
        <DataTable t-else="" columns="columns" records="state.records" loading="state.loading" sort="state.sort" order="state.order" onSort.bind="changeSort" onRowClick.bind="open"/>
        <Pagination t-if="!state.loading and !state.error" page="state.page" pages="state.pages" onChange.bind="changePage"/>
      </article>
    </section>
  </t>
</templates>
`,
    [`src/pages/${Form}/${Form}.js`]: `import { BaseForm } from "@/forms/BaseForm.js";

export class ${Form} extends BaseForm {
  static template = "pages.${Form}";
  get apiUrl() { return "/${name}"; }
  get routeUrl() { return "/${name}"; }
  getInitialForm() { return { name: "" }; }
  validate() {
    this.state.errors = this.state.form.name.trim() ? {} : { name: "Name is required." };
    return Object.keys(this.state.errors).length === 0;
  }
}
`,
    [`src/pages/${Form}/${Form}.xml`]: `<templates xml:space="preserve">
  <t t-name="pages.${Form}">
    <section class="app-page app-page-narrow">
      <div class="app-page-header"><h1 t-esc="isNew ? 'New record' : 'Edit record'"/></div>
      <p t-if="state.loading" role="status">Loading…</p>
      <div t-elif="state.loadError" role="alert" class="app-alert app-alert-danger"><p t-esc="state.loadError"/><button class="app-button app-button-ghost" t-on-click="load">Retry</button></div>
      <form t-else="" class="app-card app-form" t-on-submit="save">
        <p t-if="state.saveError" role="alert" t-esc="state.saveError"/>
        <FormField name="'name'" label="'Name'" value="state.form.name" required="true" disabled="state.saving" error="state.errors.name" onInput="(value) => this.setField('name', value)"/>
        <div class="app-form-actions">
          <button type="button" class="app-button app-button-ghost" t-att-disabled="state.saving" t-on-click="cancel">Cancel</button>
          <button type="button" class="app-button app-button-ghost" t-att-disabled="state.saving || !dirty" t-on-click="reset">Reset</button>
          <button type="submit" class="app-button app-button-primary" t-att-disabled="state.saving"><t t-esc="state.saving ? 'Saving…' : 'Save'"/></button>
        </div>
      </form>
    </section>
  </t>
</templates>
`,
    [`src/mocks/resources/${name}.js`]: `import { ApiError } from "../../services/api.js";

export function create${Page}Resource() {
  return {
    records: [],
    searchFields: ["name"],
    sortFields: ["name"],
    validate(data) {
      const name = typeof data.name === "string" ? data.name.trim() : "";
      if (!name) throw new ApiError("Review the form.", { status: 422, data: { errors: { name: "Name is required." } } });
      return { name };
    },
  };
}
`,
    [`docs/features/${name}.md`]: `# Register ${Page}

## Routes

Import these classes in src/router/routes.js:

\`\`\`js
import { ${Page} } from "@/pages/${Page}/${Page}.js";
import { ${Form} } from "@/pages/${Form}/${Form}.js";
\`\`\`

Add these entries before the wildcard route, with /new before /:id:

\`\`\`js
{ path: "/${name}", name: "${name}", component: ${Page}, auth: true, layout: "main" },
{ path: "/${name}/new", name: "${name}-new", component: ${Form}, auth: true, layout: "main" },
{ path: "/${name}/:id", name: "${name}-detail", component: ${Form}, auth: true, layout: "main" },
\`\`\`

## Navigation

Add to src/router/navigation.js:

\`\`\`js
{ label: "${Page}", path: "/${name}", routes: ["${name}", "${name}-new", "${name}-detail"] },
\`\`\`

## Mock resource

Import in src/mocks/mockResources.js:

\`\`\`js
import { create${Page}Resource } from "./resources/${name}.js";
\`\`\`

Add to the object returned by createMockResources():

\`\`\`js
"${name}": create${Page}Resource(),
\`\`\`

The generic transport implements CRUD at /${name}. Implement the same contract in your real backend and enforce authorization there.

Run npm run check, npm test and npm run build, then verify listing, creation, editing, validation errors and navigation. See [the feature guide](../CREATING_A_FEATURE.md).
`,
  };
  for (const file of Object.keys(files)) if (fs.existsSync(path.join(root, file))) throw new Error(`${file} already exists. No files were changed.`);
  for (const [file, content] of Object.entries(files)) { fs.mkdirSync(path.dirname(path.join(root, file)), { recursive: true }); fs.writeFileSync(path.join(root, file), content); }
  return Object.keys(files);
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const [name, ...extra] = process.argv.slice(2);
    if (extra.length) throw new Error("Usage: npm run resource -- resource-name");
    const files = createResource(name);
    console.log(`Created ${files.length} files. Register routes, navigation and the mock resource using docs/features/${name}.md.`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
