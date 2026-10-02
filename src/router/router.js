import { buildBreadcrumbs } from "./breadcrumbs.js";

export function safePath(value, fallback = "/") {
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020]/.test(value)) return fallback;
  return value;
}

function compilePath(path) {
  if (path === "*") return { regex: /.*/, keys: [] };
  const keys = [];
  const pattern = path
    .split("/")
    .map((segment) => {
      if (segment.startsWith(":")) {
        keys.push(segment.slice(1));
        return "([^/]+)";
      }
      return segment.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    })
    .join("/");
  return { regex: new RegExp(`^${pattern}/?$`), keys };
}

function parseQuery(search) {
  return Object.fromEntries(new URLSearchParams(search).entries());
}

export function createRouter({ routes, auth, layouts = {}, browser = window }) {
  if (!routes.some((route) => route.path === "*")) throw new Error("Router requires a '*' fallback route.");
  const compiled = routes.map((route) => ({ ...route, ...compilePath(route.path) }));
  const listeners = new Set();
  let started = false;
  const onPopState = () => { void router.resolve(); };

  const router = {
    current: null,

    subscribe(callback) {
      listeners.add(callback);
      return () => listeners.delete(callback);
    },

    checkPathExists(path) {
      if (!safePath(path, null)) return false;
      const pathname = new URL(path, "https://router.local").pathname;
      try { decodeURIComponent(pathname); } catch { return false; }
      return compiled.some((route) => route.path !== "*" && (route.path === path || route.regex.test(pathname)));
    },

    async start() {
      if (!started) browser.addEventListener("popstate", onPopState);
      started = true;
      await router.resolve();
    },

    stop() {
      browser.removeEventListener("popstate", onPopState);
      started = false;
    },

    async resolve() {
      const { pathname, search } = browser.location;
      const fallback = compiled.find((item) => item.path === "*");
      let route = compiled.find((item) => item.path !== "*" && item.regex.test(pathname)) || fallback;
      const match = pathname.match(route.regex);
      let params = {};
      try { params = Object.fromEntries(route.keys.map((key, index) => [key, decodeURIComponent(match?.[index + 1] || "")])); }
      catch { route = fallback; }

      if (route.auth && !auth.isAuthenticated) {
        return router.navigate(`/login?next=${encodeURIComponent(pathname + search)}`, { replace: true });
      }
      if (route.guestOnly && auth.isAuthenticated) {
        return router.navigate("/", { replace: true });
      }

      const Layout = route.layout ? layouts[route.layout] : null;
      if (route.layout && !Layout) throw new Error(`Unknown layout: ${route.layout}`);
      const resolved = {
        ...route,
        params,
        query: parseQuery(search),
        key: pathname,
        pathname,
        breadcrumbs: route === fallback ? [] : buildBreadcrumbs(pathname, routes, search),
        component: Layout || route.component,
        props: Layout ? { PageComponent: route.component } : {},
      };
      router.current = resolved;
      listeners.forEach((callback) => callback(resolved));
      return resolved;
    },

    async navigate(path, { replace = false } = {}) {
      browser.history[replace ? "replaceState" : "pushState"]({}, "", safePath(path));
      return router.resolve();
    },
  };

  return router;
}
