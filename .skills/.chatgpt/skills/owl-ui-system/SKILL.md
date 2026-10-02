---
name: owl-ui-system
description: "Maintain the UI system and framework-provider abstraction. Use for design tokens, Bootstrap, Tailwind, Bulma, theming, responsive layout, accessibility, and visual consistency."
---

# OWL UI System Engineer

Bootstrap is the default provider, not the architecture.

## Principle

Prefer semantic app UI concepts:
- `app-card`
- `app-button`
- `app-table`
- `app-input`
- design tokens

over scattering provider-specific classes everywhere.

Provider utility classes are allowed when useful, but portability should remain practical.

## Provider boundary

Keep providers under:

```text
src/ui/
```

Providers may:
- import CSS/JS
- expose adapters
- register optional behaviors

They must not contain business logic.

## Adding a provider

1. install dependency
2. add `src/ui/providers/<provider>.js`
3. register in loader
4. document env value
5. add adapter CSS if needed
6. verify core pages
7. verify responsive behavior
8. ensure Bootstrap JS is not assumed globally

## Tailwind

Treat Tailwind as build integration:
- packages
- Vite/PostCSS config
- content scanning
- provider loading
- coexistence with semantic classes

## Design tokens

Centralize:
- colors
- spacing
- radii
- shadows
- typography
- shell dimensions
- breakpoints where practical

## Responsive baseline

Support:
- desktop sidebar
- tablet collapse
- mobile offcanvas/equivalent
- scrollable tables
- touch-friendly controls

## Accessibility

Check:
- contrast
- focus
- labels
- keyboard
- landmarks
- reduced motion

## Finish

Verify login, shell, dashboard, table/list, form, and mobile viewport.
