import { Component } from "@odoo/owl";

export class StartEndDate extends Component {
  static template = "components.StartEndDate";
  static props = {
    value: [String, { value: null }],
    record: Object,
    column: Object,
  };

  get label() {
    const start = this.dateLabel(this.props.value);
    const end = this.props.record.end_date;

    return end ? `${start} → ${this.dateLabel(end)}` : start;
  }
  dateLabel(value) {
    return value ? String(value).split("-").reverse().join("/") : "No deadline";
  }
}
