import { pathToFileURL } from "node:url";
import path from "node:path";

// Node-only test loader; Vite supplies the same alias in the application.
export async function resolve(specifier, context, nextResolve) {
  if (specifier.startsWith("@/")) return nextResolve(pathToFileURL(path.resolve("src", specifier.slice(2))).href, context);
  return nextResolve(specifier, context);
}
