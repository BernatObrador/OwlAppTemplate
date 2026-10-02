import fs from "node:fs";
for (const name of ["node_modules", "dist"]) fs.rmSync(name, { recursive: true, force: true });
console.log("Removed node_modules and dist.");
