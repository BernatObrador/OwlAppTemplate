import { BaseListPage } from "@/pages/BaseListPage.js";
import { DataTable } from "@/components/DataTable/DataTable.js";
import { SearchInput } from "@/components/SearchInput/SearchInput.js";
import { Pagination } from "@/components/Pagination/Pagination.js";
import { formatCurrency } from "@/utils/format.js";
import { FormField } from "@/components/FormField/FormField.js";
import { opportunityStages } from "@/features/opportunities.js";

export class Opportunities extends BaseListPage {
  static template = "pages.Opportunities";
  static components = { DataTable, SearchInput, Pagination, FormField };
  get filterKeys() {
    return ["stage"];
  }
  stageOptions = [
    { value: "", label: "All stages" },
    ...opportunityStages.map((label) => ({
      value: label.toLowerCase(),
      label,
    })),
  ];
  get apiUrl() {
    return "/opportunities";
  }
  get routeUrl() {
    return "/opportunities";
  }
  columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "customer", label: "Customer", sortable: true },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      format: (value) => formatCurrency(value),
    },
    { key: "stage", label: "Stage", sortable: true, type: "badge" },
  ];
  rowActions = [
    { key: "edit", label: "Edit", onClick: (record) => this.open(record) },
  ];
}
