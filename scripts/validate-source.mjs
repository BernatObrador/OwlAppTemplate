import fs from "node:fs";
import path from "node:path";
import { pathToFileURL } from "node:url";

export function validateSource(root = path.resolve("src")) {
  const files = [];
  const walk = (dir) => { for (const item of fs.readdirSync(dir, { withFileTypes: true })) { const full = path.join(dir, item.name); if (item.isDirectory()) walk(full); else files.push(full); } };
  walk(root);
  const names = new Set(files.filter((file) => file.endsWith(".xml")).flatMap((file) => [...fs.readFileSync(file, "utf8").matchAll(/t-name="([^"]+)"/g)].map((match) => match[1])));
  const issues = [];
  for (const file of files.filter((item) => item.endsWith(".js"))) {
    const source = fs.readFileSync(file, "utf8");
    for (const match of source.matchAll(/static\s+template\s*=\s*["']([^"']+)["']/g)) if (!names.has(match[1])) issues.push(`${file}: missing template ${match[1]}`);
    for (const match of source.matchAll(/(?:from\s*|import\s*\(?\s*)["']((?:@\/|\.{1,2}\/)[^"']+)["']/g)) {
      const target = match[1].startsWith("@/") ? path.join(root, match[1].slice(2)) : path.resolve(path.dirname(file), match[1]);
      if (!path.extname(target)) issues.push(`${file}: local imports must include an extension (${match[1]})`);
      else if (!fs.existsSync(target)) issues.push(`${file}: missing import ${match[1]}`);
    }
  }
  return issues;
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const issues = validateSource();
  if (issues.length) { console.error(issues.join("\n")); process.exitCode = 1; }
  else console.log("Validated component template references and local imports.");
}
