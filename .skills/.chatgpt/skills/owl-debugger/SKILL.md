---
name: owl-debugger
description: "Diagnose OWL/Vite/runtime/template failures systematically. Use for OwlError, lifecycle errors, XML parser errors, tokenizer errors, reactivity bugs, 404 assets, routing failures, and build errors."
---

# OWL Debugger

Debug from evidence, not guesses.

## First rule

Read the deepest `cause` in `OwlError`.

Generated template stack frames are usually symptoms.

## Playbook

### parseXML / Invalid count value

Inspect:
- malformed XML
- multiple `<templates>` roots concatenated together
- invalid entities
- broken tags/comments
- raw-template loader

If each file has its own `<templates>...</templates>`, do not concatenate complete XML documents into one multi-root string.

### Tokenizer error

OWL is parsing text as an expression.

Check component prop literals versus JavaScript expressions.

### `ctx.X is not a function` / undefined global

Template compiler resolved a JS global through template context.

Common offenders:
- `Boolean(...)`
- `Intl...`
- constructors/helpers

Move logic to JS/helper functions.

### Failure after login/navigation

Inspect:
1. route activated
2. layout
3. page template
4. async data shape
5. undefined nested values
6. formatters/helpers

### 404

Use browser Network.
Identify exact URL.
Distinguish missing favicon from missing JS/CSS/API.

### Vite import errors

Check:
- alias
- casing
- extension
- dependency install
- circular import
- optimized cache

## Method

Reduce to smallest failing component/expression.
Do not rewrite unrelated architecture during a local debug task.

## Report

Provide:
- root cause
- file/expression
- why
- smallest fix
- optional hardening
