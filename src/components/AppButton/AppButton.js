import { Component } from "@odoo/owl";
export class AppButton extends Component {
  static template = "components.AppButton";
  static props = {
    label: String,
    type: { type: String, optional: true },
    variant: { type: String, optional: true },
    disabled: { type: Boolean, optional: true },
    onClick: { type: Function, optional: true },
  };
  click(ev) {
    this.props.onClick?.(ev);
  }
}
