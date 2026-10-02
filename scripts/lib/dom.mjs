import { JSDOM } from "jsdom";

export function installDom(url = "https://app.test/") {
  const dom = new JSDOM('<!doctype html><html><body><div id="app"></div></body></html>', { url, pretendToBeVisual: true });
  for (const name of ["window", "document", "Node", "Element", "HTMLElement", "Document", "DocumentFragment", "DOMParser", "DOMTokenList", "CharacterData", "Text", "Comment", "CustomEvent", "Event", "ShadowRoot", "localStorage"]) {
    globalThis[name] = name === "window" ? dom.window : dom.window[name];
  }
  globalThis.requestAnimationFrame = dom.window.requestAnimationFrame.bind(dom.window);
  globalThis.cancelAnimationFrame = dom.window.cancelAnimationFrame.bind(dom.window);
  return dom;
}
