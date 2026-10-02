# Creating a form with BaseForm

[Documentation index](README.md) · [Fields](COMPONENTS.md) · [Mock API](MOCK_API.md)

Generate a complete list/form pair with `npm run resource -- tasks`, then follow `docs/features/tasks.md`. For a custom form, extend `src/forms/BaseForm.js`:

```js
import { BaseForm } from "@/forms/BaseForm.js";

export class TaskForm extends BaseForm {
  static template = "pages.TaskForm";
  get apiUrl() { return "/tasks"; }
  get routeUrl() { return "/tasks"; }
  get recordLabel() { return "Task"; }
  getInitialForm() { return { name: "", completed: false }; }
  validate() {
    this.state.errors = this.state.form.name.trim()
      ? {} : { name: "Name is required." };
    return Object.keys(this.state.errors).length === 0;
  }
}
```

`apiUrl` is the API collection; `routeUrl` is the screen to return to. They need not match. `params.id` identifies an existing record; its absence means creation. Do not use a literal `id=new`: register `/tasks/new` as a static route without params.

`returnUrl` combines routeUrl with the current page query. Save and cancel use it to restore the list's filters, search, sorting and pagination. API record URLs do not include this navigation context. Override returnUrl if a custom form has detail-only query parameters that should not return to the list.

## Lifecycle and state

| Member | Purpose |
| --- | --- |
| `state.form` | Editable JSON-compatible object |
| `state.errors` | Field-name to message mapping |
| `state.loading`, `state.loadError` | Existing-record GET state |
| `state.saving`, `state.saveError` | Mutation state |
| `page` | Current routing values from usePageProps |
| `isNew` | Whether params.id is absent |
| `dirty` | Whether JSON form values differ from the initial snapshot |
| `setField(name, value)` | Update a field and clear its field error |
| `reset()` | Restore the initial snapshot and clear save/field errors |
| `cancel()` | Return to routeUrl unless saving |
| `load()` | Load or retry GET apiUrl/id for an existing record |
| `save(event?)` | Validate, POST or PUT, notify and return to routeUrl |

The base snapshots loaded data for reset and snapshots submitted values so later edits cannot change an in-flight payload. Duplicate submits are ignored. Load requests are aborted on destruction; completed requests cannot update destroyed components. Mutations are not cancelled, because aborting a client request would not guarantee a server rollback.

Backend errors shaped as `{ message, errors: { name: "..." } }` appear in `saveError` and recognized field errors. Only fields declared by `getInitialForm()` receive field errors. Validation and authorization still belong on the backend.

## Template pattern

```xml
<templates xml:space="preserve">
  <t t-name="pages.TaskForm">
    <section class="app-page app-page-narrow">
      <h1 t-esc="isNew ? 'New task' : 'Edit task'"/>
      <p t-if="state.loading" role="status">Loading…</p>
      <div t-elif="state.loadError" role="alert">
        <p t-esc="state.loadError"/>
        <button t-on-click="load">Retry</button>
      </div>
      <form t-else="" class="app-card app-form" t-on-submit="save">
        <p t-if="state.saveError" role="alert" t-esc="state.saveError"/>
        <FormField name="'name'" label="'Name'" value="state.form.name"
          required="true" disabled="state.saving" error="state.errors.name"
          onInput="(value) => this.setField('name', value)"/>
        <div class="app-form-actions">
          <button type="button" t-att-disabled="state.saving" t-on-click="cancel">Cancel</button>
          <button type="button" t-att-disabled="state.saving || !dirty" t-on-click="reset">Reset</button>
          <button type="submit" t-att-disabled="state.saving">Save</button>
        </div>
      </form>
    </section>
  </t>
</templates>
```

FormField is inherited through `BaseForm.components`. Merge that registry if adding components: `static components = { ...BaseForm.components, MyWidget }`. If overriding setup, call `super.setup()` first. Keep defaults in `getInitialForm()`; subclass fields are initialized after the base constructor invokes setup.

The base intentionally assumes JSON data and conventional collection/detail endpoints. Override behavior for file uploads, nested forms or unusual APIs. `dirty` supports UI indicators and reset; it does not install an unsaved-navigation prompt.
