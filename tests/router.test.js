import test from "node:test";
import assert from "node:assert/strict";
import { JSDOM } from "jsdom";
import { createRouter, safePath } from "../src/router/router.js";

const routes = [
  { path: "/login", name: "login", component: "Login", guestOnly: true },
  { path: "/", name: "home", component: "Home", auth: true, layout: "main" },
  { path: "/items/new", name: "new", component: "Form", auth: true },
  { path: "/items/:id", name: "item", component: "Form", auth: true },
  { path: "*", name: "404", component: "NotFound" },
];

test("detail breadcrumbs preserve list query through navigation and reload", async () => {
  const listRoutes = [{ path: "/items", name: "items", component: "List" }, ...routes];
  const query = "q=two+words%26more&status=done&sort=name&order=desc&page=2";
  const dom = new JSDOM("", { url: `https://app.test/items/42?${query}` });
  const options = { routes: listRoutes, auth: { isAuthenticated: true }, browser: dom.window, layouts: { main: "Layout" } };
  const router = createRouter(options);
  try {
    await router.start();
    assert.equal(router.current.breadcrumbs[0].url, "/");
    assert.equal(router.current.breadcrumbs[1].url, `/items?${query}`);
    await router.navigate(router.current.breadcrumbs[1].url);
    assert.equal(router.current.query.q, "two words&more");
    assert.equal(router.current.query.page, "2");
    await router.navigate(`/items/new?${query}`);
    const reloaded = createRouter(options);
    await reloaded.resolve();
    assert.equal(reloaded.current.breadcrumbs[1].url, `/items?${query}`);
  } finally { router.stop(); dom.window.close(); }
});

test("protected deep link, login redirect, params, query, malformed URL and 404", async () => {
  const dom = new JSDOM("", { url: "https://app.test/items/42?q=hello" });
  const auth = { isAuthenticated: false };
  const router = createRouter({ routes, auth, browser: dom.window, layouts: { main: "Layout" } });
  await router.start();
  assert.equal(router.current.name, "login");
  assert.equal(router.current.query.next, "/items/42?q=hello");
  auth.isAuthenticated = true;
  await router.navigate(router.current.query.next);
  assert.equal(router.current.params.id, "42");
  assert.equal(router.current.query.q, "hello");
  await router.navigate("/items/new");
  assert.equal(router.current.name, "new");
  await router.navigate("/items/%E0%A4%A");
  assert.equal(router.current.name, "404");
  await router.navigate("/missing");
  assert.equal(router.current.name, "404");
  await router.navigate("/login");
  assert.equal(router.current.component, "Layout");
  assert.equal(router.current.props.PageComponent, "Home");
  router.stop(); dom.window.close();
});

test("start is idempotent, popstate notifies once, stop detaches", async () => {
  const dom = new JSDOM("", { url: "https://app.test/" });
  const router = createRouter({ routes, auth: { isAuthenticated: true }, browser: dom.window, layouts: { main: "Layout" } });
  await router.start(); await router.start();
  let calls = 0;
  router.subscribe(() => calls++);
  dom.window.history.pushState({}, "", "/items/3");
  dom.window.dispatchEvent(new dom.window.PopStateEvent("popstate"));
  assert.equal(router.current.params.id, "3");
  assert.equal(calls, 1);
  router.stop();
  dom.window.dispatchEvent(new dom.window.PopStateEvent("popstate"));
  assert.equal(calls, 1);
  dom.window.close();
});

test("external or ambiguous destinations are rejected", () => {
  for (const path of ["https://evil.test", "//evil.test", "/\\evil.test", "javascript:alert(1)", " /items", "/\nevil"]) assert.equal(safePath(path), "/");
  assert.equal(safePath("/items/1?q=two%20words"), "/items/1?q=two%20words");
});

test("detached router methods, path existence, automatic breadcrumbs and real history traversal", async () => {
  const dom = new JSDOM("", { url: "https://app.test/" });
  const router = createRouter({ routes, auth: { isAuthenticated: true }, browser: dom.window, layouts: { main: "Layout" } });
  const { start, navigate, checkPathExists, stop } = router;
  await start();
  assert.equal(checkPathExists("/items/42?q=test"), true);
  assert.equal(checkPathExists("/items/:id"), true);
  assert.equal(checkPathExists("/unknown"), false);
  assert.equal(checkPathExists("https://outside.test"), false);
  await navigate("/items/42?tab=a");
  assert.deepEqual(router.current.breadcrumbs.map((item) => item.name), ["Home", "Detail"]);
  await navigate("/items/new");
  const back = new Promise((resolve) => dom.window.addEventListener("popstate", resolve, { once: true }));
  dom.window.history.back(); await back;
  assert.equal(router.current.params.id, "42"); assert.equal(router.current.query.tab, "a");
  const forward = new Promise((resolve) => dom.window.addEventListener("popstate", resolve, { once: true }));
  dom.window.history.forward(); await forward;
  assert.equal(router.current.name, "new");
  stop(); dom.window.close();
});
