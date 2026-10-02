import fs from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { initializeCore } from "./core-update.mjs";

const sourceRoot = fileURLToPath(new URL("../", import.meta.url));

/** Create an independent starter. Never copies dependencies, local env files or CRM pages. */
export function createApp(name, { directory = path.join(sourceRoot, "apps", name || ""), source = sourceRoot } = {}) {
  if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(name || "") || name.length > 80 || /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/.test(name)) {
    throw new Error("Use a lowercase app name, for example: npm run createApp -- my-crm");
  }
  const target = path.resolve(directory);
  const relative = path.relative(path.resolve(source), target);
  if (!relative || (!relative.startsWith(`..${path.sep}`) && !path.isAbsolute(relative) && relative.split(path.sep)[0] !== "apps")) {
    throw new Error("Inside this project, generated apps must be placed under apps/.");
  }
  if (fs.existsSync(target)) throw new Error(`Destination already exists: ${target}. Nothing was overwritten.`);
  fs.mkdirSync(target, { recursive: true });

  const copy = (entry) => fs.cpSync(path.join(source, entry), path.join(target, entry), { recursive: true, errorOnExist: true, force: false });
  for (const entry of ["src/app", "src/forms", "src/pages/BaseListPage.js", "src/components", "src/layouts", "src/services", "src/styles", "src/ui", "src/utils", "src/pages/Login", "src/pages/NotFound", "src/mocks/mockAuth.js", "src/router/router.js", "src/router/pageProps.js", "src/router/breadcrumbs.js", "src/mocks/restTransport.js", "src/main.js", "src/vite-env.d.ts", "scripts", "docs", "jsconfig.json", "vite.config.js", ".gitignore", "LICENSE"]) copy(entry);
  for (const entry of [".skills", "AGENTS.md"]) if (fs.existsSync(path.join(source, entry))) copy(entry);
  for (const entry of ["core-update.test.js", "api.test.js", "auth.test.js", "router.test.js", "page-props.test.js", "generator.test.js", "data-table.test.js", "form-field.test.js", "base-pages.test.js", "rest-transport.test.js", "small-components.test.js"]) {
    if (fs.existsSync(path.join(source, "tests", entry))) copy(`tests/${entry}`);
  }
  const write = (entry, content) => {
    fs.mkdirSync(path.dirname(path.join(target, entry)), { recursive: true });
    fs.writeFileSync(path.join(target, entry), content);
  };
  const pkg = JSON.parse(fs.readFileSync(path.join(source, "package.json"), "utf8"));
  pkg.name = name;
  pkg.version = "0.1.0";
  write("package.json", JSON.stringify(pkg, null, 2) + "\n");
  const lock = JSON.parse(fs.readFileSync(path.join(source, "package-lock.json"), "utf8"));
  lock.name = name;
  lock.version = pkg.version;
  lock.packages[""].name = name;
  lock.packages[""].version = pkg.version;
  lock.packages[""].dependencies = pkg.dependencies;
  write("package-lock.json", JSON.stringify(lock, null, 2) + "\n");
  const env = `VITE_APP_NAME=${name}\nVITE_STORAGE_PREFIX=${name}\nVITE_API_URL=/api\nVITE_USE_MOCK_API=true\nVITE_UI_PROVIDER=bootstrap\n`;
  write(".env.example", env);
  write(".env", env);
  write("index.html", `<!doctype html>\n<html lang="en"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width, initial-scale=1.0"/><title>${name}</title></head><body><div id="app"></div><script type="module" src="/src/main.js"></script></body></html>\n`);
  fs.cpSync(path.join(source, "scripts/starter/src"), path.join(target, "src"), { recursive: true });
  write("README.md", fs.readFileSync(path.join(source, "scripts/starter/README.md"), "utf8").replaceAll("__APP_NAME__", name));
  copy("core-files.json");
  initializeCore(target, source);
  return target;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  try {
    const [name, flag, directory, ...extra] = process.argv.slice(2);
    if (extra.length || (flag && (flag !== "--dir" || !directory))) throw new Error("Usage: npm run createApp -- app-name [--dir path]");
    const target = createApp(name, directory ? { directory } : {});
    console.log(`Created ${target}\n\nNext:\n  cd "${target}"\n  npm ci\n  npm run dev\n\nGuide: docs/README.md`);
  } catch (error) { console.error(error.message); process.exitCode = 1; }
}




