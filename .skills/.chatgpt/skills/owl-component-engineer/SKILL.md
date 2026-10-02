---
name: owl-component-engineer
description: "Build and refactor OWL components and templates using the project's actual OWL version. Use for component APIs, reactivity, lifecycle, props, templates, composition, and reusable UI."
---

# OWL Component Engineer

## Version rule

`package.json` is authoritative.

Before using OWL APIs:
1. inspect installed `@odoo/owl`
2. inspect existing working components
3. use patterns compatible with that version

Never mix OWL 2 and OWL 3 APIs silently.

## Component design

Reusable components should have:
- one responsibility
- small prop API
- callbacks/events instead of hidden mutation
- no domain assumptions unless feature-specific
- loading/empty/error states when relevant

Prefer composition over mega-components.

## Template rules

Keep XML expressions simple.

Avoid doing this in templates:
- `new Intl.NumberFormat(...)`
- `Boolean(...)`
- large ternaries
- sorting/filtering pipelines
- data normalization

Move non-trivial logic to JS helpers or component methods.

Remember:
- native HTML attributes are not the same as component props
- component prop values are expressions in OWL/QWeb contexts
- literal-string syntax must match the installed OWL version

## Formatting

Prefer `src/utils/format.js` for:
- currency
- numbers
- percentages
- dates
- date/time
- labels

## Events

- Prevent bubbling explicitly where needed
- Use named handlers for non-trivial logic
- Keep handlers small

## Accessibility

Use semantic HTML.
Support keyboard interaction.
Label icon-only buttons.
Associate labels with inputs.
Preserve focus behavior.

## Debugging generated-template failures

1. inspect `OwlError.cause`
2. identify concrete template expression
3. reduce it
4. move unsupported globals/logic to JS
5. validate XML independently

## Finish

Run template/XML validation and project checks.
State which OWL version the change targets if version-sensitive.
