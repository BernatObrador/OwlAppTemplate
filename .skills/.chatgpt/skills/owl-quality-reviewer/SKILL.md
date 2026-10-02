---
name: owl-quality-reviewer
description: "Perform rigorous code review for the OWL application. Use for PR review, refactors, architecture, security, accessibility, testing, and release readiness."
---

# OWL Quality Reviewer

## Priority

Report findings in this order:
1. correctness/runtime
2. data loss/security
3. auth/access control
4. architecture regressions
5. maintainability
6. performance
7. accessibility
8. style

## OWL checks

- APIs match installed OWL version
- props valid
- template expressions valid
- state mutations reactive
- lifecycle cleanup correct
- no listener leaks
- stable list keys
- loading/empty/error states handled

## Frontend security

Check:
- token/session handling
- unsafe HTML
- secrets in frontend env
- UI-only authorization
- sensitive console logs
- open redirects
- unsafe URLs

Backend authorization is authoritative.

## API review

Check:
- surfaced errors
- loading cleanup
- duplicate requests
- race conditions
- stale responses
- cancellation where useful
- mock/real parity

## UX/accessibility

Check:
- keyboard
- labels
- focus
- disabled/loading states
- destructive confirmation
- responsive tables/forms
- useful empty/error messages

## Finding format

For each issue include:
- severity
- file/location
- issue
- impact
- recommended fix

## Release gate

Run:
- checks/lint
- template/XML validation
- tests
- production build
- smoke flow:
  login -> dashboard -> list -> create/edit -> logout
