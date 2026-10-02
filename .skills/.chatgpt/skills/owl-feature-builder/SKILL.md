---
name: owl-feature-builder
description: "Implement end-to-end CRM/ERP features spanning routes, pages, services, reusable components, mocks, tests, and documentation."
---

# OWL Feature Builder

## Workflow

1. understand user flow
2. inspect similar existing feature
3. define routes
4. define data/API contract
5. add mock transport behavior if supported
6. build pages
7. extract reusable UI only when justified
8. handle loading/empty/error/success
9. add nav entry if appropriate
10. tests/checks
11. docs

## Example vertical slice

```text
/opportunities
  -> Opportunities page
      -> filters/search
      -> API
      -> DataTable
      -> row navigation

/opportunities/:id
  -> Opportunity detail/form
      -> load
      -> edit
      -> validate
      -> save
      -> notify
      -> navigate
```

## CRUD baseline

List:
- loading
- empty
- search/filter
- pagination if needed
- stable IDs
- error state

Form:
- create/edit distinction
- initial load
- local editable state
- validation
- saving
- success notification
- API error mapping
- duplicate-submit protection

Delete:
- explicit action
- confirmation
- success/failure feedback
- update route/list state

## Avoid premature abstraction

Do not create:
- schema form engine for two forms
- global store for one page
- plugin/framework for one helper

## Documentation

Document:
- routes
- API contract
- permission assumptions
- components
- extension points

## Finish

Smoke-test the full flow from navigation to persisted result.
