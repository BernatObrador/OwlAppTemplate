# OwlAppTemplate Desktop Skills

Project-local skill pack for ChatGPT Desktop when working on a standalone OWL business application.

## Skills

- `owl-architect` — architecture and boundaries
- `owl-component-engineer` — OWL components/templates
- `owl-router-navigation` — SPA router and guards
- `owl-services-api` — API/auth/storage/loading/mocks
- `owl-ui-system` — Bootstrap/Tailwind/Bulma/providers
- `owl-debugger` — runtime/template/Vite debugging
- `owl-quality-reviewer` — PR/code/release review
- `owl-feature-builder` — end-to-end CRM/ERP features

## Recommended placement

Copy `.chatgpt/` and `AGENTS.md` to the repository root:

```text
OwlAppTemplate/
├── .chatgpt/
│   └── skills/
│       ├── owl-architect/
│       │   └── SKILL.md
│       └── ...
├── AGENTS.md
├── src/
└── package.json
```

If your Desktop build expects another project-local skill directory, keep the individual `SKILL.md` files and move the `skills/` folder there.

## Philosophy

These skills deliberately:
- treat the installed OWL version as authoritative;
- avoid mixing OWL 2/OWL 3;
- avoid presenting project helpers as OWL APIs;
- keep Bootstrap replaceable;
- debug from `OwlError.cause`;
- favor explicit architecture over hidden magic.

## Example use

```text
"Add Opportunities CRUD"
-> owl-feature-builder

"Refactor services/env"
-> owl-architect + owl-services-api

"Create reusable autocomplete"
-> owl-component-engineer

"Login route breaks after auth"
-> owl-router-navigation + owl-debugger

"Switch UI from Bootstrap to Tailwind"
-> owl-ui-system

"Review branch before merge"
-> owl-quality-reviewer
```
