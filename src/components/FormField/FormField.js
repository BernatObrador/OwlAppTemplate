import { Component } from "@odoo/owl";

export class FormField extends Component {
  static template = "components.FormField";
  static props = {
    name: String, label: String, value: [String, Number, Boolean], onInput: Function,
    id: { type: String, optional: true }, type: { type: String, optional: true },
    placeholder: { type: String, optional: true }, required: { type: Boolean, optional: true },
    disabled: { type: Boolean, optional: true }, loading: { type: Boolean, optional: true },
    error: { type: String, optional: true }, help: { type: String, optional: true },
    options: { type: Array, optional: true }, rows: { type: Number, optional: true },
    min: { type: [String, Number], optional: true }, max: { type: [String, Number], optional: true }, step: { type: [String, Number], optional: true },
    autocomplete: { type: String, optional: true },
  };
  get id() { return this.props.id || this.props.name; }
  get disabled() { return Boolean(this.props.disabled || this.props.loading); }
  get describedBy() { return [this.props.help ? `${this.id}-help` : "", this.props.error ? `${this.id}-error` : ""].filter(Boolean).join(" ") || undefined; }
  input(ev) {
    if (this.disabled) return;
    let value = ev.target.value;
    if (this.props.type === "checkbox") value = ev.target.checked;
    if (this.props.type === "number" && value !== "") value = Number(value);
    if (this.props.type === "select") value = this.props.options?.find((option) => String(option.value) === value)?.value ?? value;
    this.props.onInput(value);
  }
}
