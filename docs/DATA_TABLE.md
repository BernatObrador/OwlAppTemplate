# DataTable

[Documentation index](README.md) · [List pages](BASE_LIST_PAGE.md)

Import `DataTable` from `@/components/DataTable/DataTable.js` and register it in `static components`. It renders records supplied by its parent; it does not fetch or route by itself.

## Props

| Prop | Meaning |
| --- | --- |
| `columns`, `records` | Required arrays |
| `keyField` | Unique record key, default id |
| `caption` | Accessible table caption, default Records |
| `emptyMessage` | Message when records is empty |
| `loading` | Show a loading row and disable relevant controls |
| `onRowClick(record)` | Optional row activation callback |
| `sort`, `order`, `onSort(key, order)` | Controlled sorting |
| `actions` | Array of row action definitions |
| `selectable` | Enable checkbox selection |
| `selectedKeys`, `onSelectionChange(keys)` | Controlled selection |

Without onSort, sortable columns sort a copied array locally. With onSort, the parent must return ordered records and current sort/order. Never use local sorting as a replacement for server sorting across multiple pages.

## Columns and cells

```js
columns = [
  { key: "name", label: "Name", sortable: true },
  { key: "amount", label: "Amount", sortable: true,
    format: (value) => formatCurrency(value) },
  { key: "stage", label: "Stage", type: "badge" },
  { key: "owner", label: "Owner", value: (record) => record.owner.name },
  { key: "progress", label: "Progress", component: ProgressCell },
];
```

Import formatCurrency from `@/utils/format.js`. A custom cell component receives `{ value, record, column }`; declare these props on the component. `format(value, record)` customizes text; `value(record)` supplies a derived value. Use a component for interactive or structured cells rather than injecting HTML.

## Actions and selection

```js
rowActions = [
  { key: "edit", label: "Edit", onClick: (record) => this.open(record) },
  { key: "archive", label: "Archive", onClick: (record) => this.archive(record),
    visible: (record) => !record.archived,
    disabled: (record) => record.locked },
];
```

`disabled` can also be a boolean. Action clicks and interactive cell controls do not activate the row. Rows support Enter/Space when onRowClick is provided. Sort headers expose aria-sort; checkbox labels identify records. The table scrolls horizontally on narrow screens.

With selectable alone, the component keeps local keys. Pass selectedKeys and update them in onSelectionChange for parent-controlled selection. Select-all changes the visible page while preserving selected keys on other pages. The parent owns bulk actions, confirmation, permissions and removal of obsolete keys after deleting records.
