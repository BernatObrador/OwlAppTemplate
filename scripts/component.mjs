import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function createArtifact(kind, name, root = process.cwd()) {
  if (!["component", "page"].includes(kind) || !/^[A-Z][A-Za-z0-9]*$/.test(name || "")) {
    throw new Error("Use a PascalCase name: npm run component -- CustomerCard OR npm run page -- Customers");
  }
  const prefix = kind === "component" ? "components" : "pages";
  const dir = path.join(root, "src", prefix, name);
  if (fs.existsSync(dir)) throw new Error(`${dir} already exists. No files were changed.`);
  fs.mkdirSync(dir, { recursive: true });
  const pageImport = kind === "page" ? '\nimport { pageProps, usePageProps } from "@/router/pageProps.js";' : "";
  const props = kind === "page" ? '  static props = pageProps;\n\n  setup() {\n    this.page = usePageProps();\n  }' : "  static props = [];";
  fs.writeFileSync(path.join(dir, `${name}.js`), `import { Component } from "@odoo/owl";${pageImport}\n\nexport class ${name} extends Component {\n  static template = "${prefix}.${name}";\n${props}\n}\n`);
  fs.writeFileSync(path.join(dir, `${name}.xml`), `<templates xml:space="preserve">\n  <t t-name="${prefix}.${name}">\n    <section class="app-page">\n      <h1>${name}</h1>\n    </section>\n  </t>\n</templates>\n`);
  return dir;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const [kind, name] = process.argv.slice(2);
    console.log(`Created: ${createArtifact(kind, name)}`);
    if (kind === "page") console.log("Next: import and register the page in src/router/routes.js; add its menu entry in src/router/navigation.js. See docs/CREATING_A_FEATURE.md.");
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}
