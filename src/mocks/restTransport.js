import { ApiError } from "../services/api.js";
import { createMockAuth } from "./mockAuth.js";

function wait(ms, signal) {
  return new Promise((resolve, reject) => {
    signal?.throwIfAborted();
    const abort = () => { clearTimeout(timer); reject(signal.reason); };
    const timer = setTimeout(() => { signal?.removeEventListener("abort", abort); resolve(undefined); }, ms);
    signal?.addEventListener("abort", abort, { once: true });
  });
}

/** JSON-only REST simulator. Resource definitions contain records, searchFields and validate. */
export function createRestTransport({ storage = null, resources = {}, endpoints = {}, delay = 180 } = {}) {
  const auth = createMockAuth(storage);
  const collections = Object.fromEntries(Object.entries(resources).map(([name, resource]) => [name, {
    ...resource, records: structuredClone(resource.records),
    nextId: Math.max(0, ...resource.records.map((record) => Number(record.id) || 0)) + 1,
  }]));
  return async ({ path, method = "GET", data = undefined, signal = undefined }) => {
    await wait(delay, signal);
    signal?.throwIfAborted();
    method = method.toUpperCase();
    const url = new URL(path, "https://mock.local");
    const authResult = auth.handle(url.pathname, method, data);
    if (authResult !== undefined) return authResult;
    auth.requireSession();
    const endpoint = endpoints[`${method} ${url.pathname}`];
    if (typeof endpoint === "function") return structuredClone(await endpoint({ resources: collections, url, data }));
    const match = url.pathname.match(/^\/([\w-]+)(?:\/(\d+))?\/?$/);
    const resource = match && Object.hasOwn(collections, match[1]) ? collections[match[1]] : null;
    if (!resource) throw new ApiError("Resource not found.", { status: 404 });
    const id = match[2] === undefined ? null : Number(match[2]);
    const values = (input) => {
      if (!input || typeof input !== "object" || Array.isArray(input)) throw new ApiError("Expected a JSON object.", { status: 422 });
      return resource.validate ? resource.validate(input) : { ...input };
    };
    if (id === null) {
      if (method === "GET") {
        const query = url.searchParams.get("q") || "";
        const records = resource.records.filter((record) => {
          const searchMatch = !query || (resource.searchFields || []).some((key) => String(record[key] ?? "").toLowerCase().includes(query.toLowerCase()));
          return searchMatch && (resource.filterFields || []).every((key) => !url.searchParams.get(key) || String(record[key] ?? "").toLowerCase() === url.searchParams.get(key).toLowerCase());
        });
        const sort = url.searchParams.get("sort");
        if (sort && (resource.sortFields || resource.searchFields || []).includes(sort)) {
          const direction = url.searchParams.get("order") === "desc" ? -1 : 1;
          records.sort((a, b) => direction * (typeof a[sort] === "number" && typeof b[sort] === "number" ? a[sort] - b[sort] : String(a[sort] ?? "").localeCompare(String(b[sort] ?? ""), undefined, { numeric: true })));
        }
        const requestedSize = Number(url.searchParams.get("perPage") || 5);
        const perPage = Number.isSafeInteger(requestedSize) && requestedSize > 0 ? Math.min(requestedSize, 100) : 5;
        const pages = Math.max(1, Math.ceil(records.length / perPage));
        const requestedPage = Number(url.searchParams.get("page") || 1);
        const page = Number.isSafeInteger(requestedPage) ? Math.max(1, Math.min(requestedPage, pages)) : 1;
        return { records: structuredClone(records.slice((page - 1) * perPage, page * perPage)), page, pages, total: records.length, query };
      }
      if (method === "POST") {
        const record = { ...values(data), id: resource.nextId++ };
        resource.records.unshift(record);
        return structuredClone(record);
      }
    } else {
      const index = resource.records.findIndex((record) => Number(record.id) === id);
      if (index < 0) throw new ApiError(`${resource.label || "Record"} not found.`, { status: 404 });
      if (method === "GET") return structuredClone(resource.records[index]);
      if (method === "PUT" || method === "PATCH") {
        const input = method === "PATCH" ? { ...resource.records[index], ...data } : data;
        resource.records[index] = { ...values(input), id };
        return structuredClone(resource.records[index]);
      }
      if (method === "DELETE") { resource.records.splice(index, 1); return null; }
    }
    throw new ApiError(`Method ${method} not allowed.`, { status: 405 });
  };
}
