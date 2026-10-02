import { Component } from "@odoo/owl";

export class SearchInput extends Component {
  static template = "components.SearchInput";

  static props = {
    value: String,
    placeholder: { type: String, optional: true },
    onInput: Function,
  };

  onInput(ev) {
    this.props.onInput(ev.target.value);
  }
}
