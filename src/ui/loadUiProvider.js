const providers = {
  bootstrap: () => import("@/ui/providers/bootstrap.js"),
  none: () => import("@/ui/providers/none.js"),
};

export async function loadUiProvider(name) {
  const loader = Object.hasOwn(providers, name) ? providers[name] : null;
  if (!loader) {
    console.warn(`[UI] Unknown provider "${name}". Falling back to "none".`);
    return providers.none();
  }
  return loader();
}
