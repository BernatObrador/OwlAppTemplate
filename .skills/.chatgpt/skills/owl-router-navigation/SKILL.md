---
name: owl-router-navigation
description: "Develop and debug SPA routing, route definitions, navigation guards, layouts, URL params, query strings, history, and protected routes."
---

# OWL Router & Navigation Engineer

## Goals

Support as needed:
- static routes
- dynamic params
- query params
- programmatic navigation
- back/forward
- 404
- route metadata
- auth guards
- layouts

## Invariants

- URL is source of truth for navigable app state
- internal navigation does not reload the page
- use router for internal links/actions
- route matching is deterministic
- specific routes must not be shadowed by broad dynamic routes

## Route shape

Prefer declarative definitions, for example:

```js
{
    path: "/contacts/:id",
    component: ContactForm,
    auth: true,
    layout: "main",
}
```

Adapt to existing project conventions.

## Guards

Expected behavior:
- protected + anonymous -> login
- guest-only + authenticated -> app landing route

Preserve intended destination only when implemented safely.

## Debug checklist

Inspect:
1. current URL
2. matched route
3. params/query
4. guard result
5. selected component
6. layout
7. history mutation
8. reactive router notification

## Finish tests

Verify:
- direct nested URL
- click navigation
- programmatic navigation
- back
- forward
- refresh
- unknown route
- protected route logged out
- post-login redirect
