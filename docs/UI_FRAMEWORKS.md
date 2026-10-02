# UI providers and styling

[Documentation index](README.md) · [Components](COMPONENTS.md)

The application uses semantic app-* classes and variables in `src/styles/tokens.css`. `src/ui/loadUiProvider.js` loads the selected provider before mounting OWL. Providers contain CSS/framework integration, never routing or business logic.

Bootstrap is the default. Set `VITE_UI_PROVIDER=none` to use only the template's styles, then restart Vite. Unknown names warn and fall back to none. The registry uses explicit dynamic imports so Vite can discover provider dependencies.

## Add a provider

Create `src/ui/providers/my-provider.js`, import its CSS and export `uiProvider`. Add `myProvider: () => import("./providers/my-provider.js")` to the registry and select it through VITE_UI_PROVIDER. A provider may import a UI library, but OWL still owns component DOM and state.

Registered imports must resolve even if another provider is selected. To remove Bootstrap from dependencies, remove its registry entry and provider file first, change the default in main.js and environment examples, then uninstall the package. Selecting none alone does not remove Bootstrap's emitted build chunks.

## Bulma recipe

Install `npm install bulma@1`. Create src/ui/providers/bulma.js:

```js
import "bulma/css/bulma.css";
export const uiProvider = "bulma";
```

Register `bulma: () => import("./providers/bulma.js")`, set `VITE_UI_PROVIDER=bulma`, restart and build. Bulma's global styles can affect defaults; keep product styling in app-* rules and test forms and tables. See the [official Bulma overview](https://bulma.io/documentation/start/overview/).

## Tailwind 4 recipe

Install `npm install -D tailwindcss@4 @tailwindcss/vite@4`. Add the plugin to the existing vite.config.js, preserving its alias and server configuration:

```js
import tailwindcss from "@tailwindcss/vite";
// Inside defineConfig:
plugins: [tailwindcss()],
```

Create src/ui/providers/tailwind.css:

```css
@import "tailwindcss";
@source "../../**/*.{xml,js}";
```

Create src/ui/providers/tailwind.js:

```js
import "./tailwind.css";
export const uiProvider = "tailwind";
```

Register `tailwind: () => import("./providers/tailwind.js")`, select tailwind and restart. The explicit source includes OWL XML. Use complete literal utility names so scanning can discover them. Keep framework integration in the provider and reusable UI layer. Follow the [official Vite integration](https://tailwindcss.com/docs/installation/using-vite) when upgrading.

## Verification and responsive behavior

The recipes above were installed and production-built in a disposable generated application with Vite 7.3.6; they are not dependencies of the root template. Bootstrap and none are built-in providers. A provider import does not automatically redesign all semantic components to look like that framework.

The shell switches to a toggleable sidebar at 800 px. Tables scroll inside their container; page headers, filters and form actions adapt to narrow widths. KPI cards stack. Focus indicators and reduced-motion rules are included. When customizing, inspect login, dashboard, menu, list and form at mobile and desktop widths, including loading/empty/error states and keyboard navigation. Check contrast after changing token values.
