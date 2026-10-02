const title = (value) => value.replace(/[-_]/g, " ").replace(/\b\w/g, (char) => char.toUpperCase());

/** Derive ancestry from the URL, never from visit history. */
export function buildBreadcrumbs(pathname, routes, search = "") {
  const root = routes.find((route) => route.path === "/");
  const crumbs = root ? [{ name: label(root, "", {}), url: "/" }] : [];
  const segments = pathname.split("/").filter(Boolean);

  const query = new URLSearchParams(search).toString();
  const suffix = query ? `?${query}` : "";
  for (let i = 0; i < segments.length; i++) {
    const parts = segments.slice(0, i + 1);
    const route = routes.find((item) => {
      if (item.path === "*" || item.path === "/") return false;
      const pattern = item.path.split("/").filter(Boolean);
      return pattern.length === parts.length && pattern.every((part, index) => part.startsWith(":") || part === parts[index]);
    });
    if (!route) continue;
    const pattern = route.path.split("/").filter(Boolean);
    const params = {};
    pattern.forEach((part, index) => { if (part.startsWith(":")) params[part.slice(1)] = decodeURIComponent(parts[index]); });
    crumbs.push({
      name: label(route, pattern.at(-1), params),
      url: "/" + parts.join("/") + suffix,
    });
  }
  return crumbs;
}

function label(route, segment, params) {
  const custom = route.breadCrumbsName;
  if (typeof custom === "function") return custom({ params, route });
  if (custom) return custom;
  if (segment?.startsWith(":")) return "Detail";
  if (segment === "new") return "New";
  return title(route.name || segment || "Home");
}
