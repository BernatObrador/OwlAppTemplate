import { Component } from "@odoo/owl";

export class Pagination extends Component {
  static template = "components.Pagination";
  static props = { page: Number, pages: Number, onChange: Function };

  previous() {
    if (this.props.page > 1) this.props.onChange(this.props.page - 1);
  }
  next() {
    if (this.props.page < this.props.pages)
      this.props.onChange(this.props.page + 1);
  }
}
