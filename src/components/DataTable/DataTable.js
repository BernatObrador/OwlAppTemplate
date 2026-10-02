import { Component, useState } from "@odoo/owl";

export class DataTable extends Component {
  static template = "components.DataTable";
  static props = {
    columns: Array, records: Array,
    keyField: { type: String, optional: true }, emptyMessage: { type: String, optional: true },
    caption: { type: String, optional: true }, loading: { type: Boolean, optional: true },
    onRowClick: { type: Function, optional: true },
    sort: { type: String, optional: true }, order: { type: String, optional: true }, onSort: { type: Function, optional: true },
    actions: { type: Array, optional: true }, selectable: { type: Boolean, optional: true },
    selectedKeys: { type: Array, optional: true }, onSelectionChange: { type: Function, optional: true },
  };
  setup() { this.ui = useState({ sort: "", order: "asc", selected: [] }); }
  key(record) { return record[this.props.keyField || "id"]; }
  raw(record, column) { return column.value ? column.value(record) : record[column.key]; }
  value(record, column) { const raw = this.raw(record, column); return column.format ? column.format(raw, record) : raw; }
  get sortKey() { return this.props.onSort ? (this.props.sort || "") : this.ui.sort; }
  get sortOrder() { return this.props.onSort ? (this.props.order || "asc") : this.ui.order; }
  get colspan() { return this.props.columns.length + Number(Boolean(this.props.selectable)) + Number(Boolean(this.props.actions?.length)); }
  get records() {
    const column = this.props.columns.find((item) => item.key === this.sortKey && item.sortable);
    if (this.props.onSort || !column) return this.props.records;
    return [...this.props.records].sort((a, b) => {
      const left = this.raw(a, column), right = this.raw(b, column);
      const comparison = typeof left === "number" && typeof right === "number" ? left - right : String(left ?? "").localeCompare(String(right ?? ""), undefined, { numeric: true });
      return comparison * (this.sortOrder === "desc" ? -1 : 1);
    });
  }
  sortColumn(column) {
    if (!column.sortable || this.props.loading) return;
    const order = this.sortKey === column.key && this.sortOrder === "asc" ? "desc" : "asc";
    if (this.props.onSort) this.props.onSort(column.key, order);
    else { this.ui.sort = column.key; this.ui.order = order; }
  }
  ariaSort(column) { return this.sortKey === column.key ? (this.sortOrder === "desc" ? "descending" : "ascending") : "none"; }
  sortSymbol(column) { return this.sortKey === column.key ? (this.sortOrder === "desc" ? "↓" : "↑") : "↕"; }
  rowClick(ev, record) {
    if (this.props.loading || ev.target.closest("a, button, input, select, textarea")) return;
    this.props.onRowClick?.(record);
  }
  rowKeydown(ev, record) {
    if (ev.target === ev.currentTarget && this.props.onRowClick && ["Enter", " "].includes(ev.key)) {
      ev.preventDefault(); this.props.onRowClick(record);
    }
  }
  actions(record) { return (this.props.actions || []).filter((action) => !action.visible || action.visible(record)); }
  actionDisabled(action, record) { return Boolean(this.props.loading || (typeof action.disabled === "function" ? action.disabled(record) : action.disabled)); }
  runAction(action, record) { if (!this.actionDisabled(action, record)) action.onClick(record); }
  get selection() { return this.props.selectedKeys ?? this.ui.selected; }
  selected(record) { return this.selection.includes(this.key(record)); }
  get allSelected() { return this.records.length > 0 && this.records.every((record) => this.selected(record)); }
  select(keys) {
    if (this.props.selectedKeys === undefined) this.ui.selected = keys;
    this.props.onSelectionChange?.(keys);
  }
  toggle(record) {
    const key = this.key(record);
    this.select(this.selected(record) ? this.selection.filter((item) => item !== key) : [...this.selection, key]);
  }
  toggleAll() {
    const visible = this.records.map((record) => this.key(record));
    this.select(this.allSelected ? this.selection.filter((key) => !visible.includes(key)) : [...new Set([...this.selection, ...visible])]);
  }
  cellProps(record, column) { return { value: this.raw(record, column), record, column }; }
}
