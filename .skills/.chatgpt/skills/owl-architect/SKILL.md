---
name: owl-architect
description: "Design and evolve standalone OWL business applications. Use for architecture, module boundaries, state ownership, services, routing, and scalability decisions."
---

# OWL Application Architect

Use this skill for architecture work on standalone OWL CRM/ERP/dashboard applications.

## Principles

- Read `package.json` before using version-specific OWL APIs.
- Preserve existing architecture unless there is a concrete reason to change it.
- Prefer explicit code over hidden framework magic.
- Keep business features separate from generic UI and infrastructure.
- Do not introduce Odoo-specific assumptions unless the project integrates with Odoo.
- Avoid SSR unless explicitly required.
- Do not add dependencies without clear value.

## Inspect before editing

Review, when relevant:

1. `package.json`
2. `src/main.*`
3. `src/app/`
4. `src/router/`
5. `src/services/`
6. `src/components/`
7. `src/pages/`
8. `src/ui/`
9. `src/styles/`
10. tests/scripts

Identify:
- OWL version
- bootstrap flow
- `env` shape
- router ownership
- shared state ownership
- UI provider strategy
- project conventions

## Preferred boundaries

```text
src/
├── app/          # bootstrapping and app shell
├── components/   # reusable generic UI
├── pages/        # route-level screens
├── features/     # optional larger domain modules
├── layouts/      # app shells
├── router/       # routes/navigation
├── services/     # api/auth/storage/etc.
├── stores/       # genuinely shared reactive state
├── ui/           # framework/provider integration
├── styles/       # tokens and app-level styles
├── utils/        # pure helpers
└── mocks/        # demo/test transports
```

Do not create folders just because they are listed.

## State ownership

Prefer the narrowest owner:
1. local component
2. page
3. shared store/service

Do not globalize state merely to avoid passing one prop.

## Services

Good service candidates:
- API
- authentication
- routing
- notifications
- storage
- loading
- feature flags

Keep service APIs explicit and stable.

## Architecture decisions

For non-trivial changes document:
- problem
- decision
- alternatives
- tradeoffs
- migration impact

## Finish checklist

- No accidental circular dependencies
- Generic components do not import feature/page code
- Pages do not duplicate infrastructure
- Existing conventions preserved
- Checks/build/tests run when available
