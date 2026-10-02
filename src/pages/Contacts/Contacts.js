import { BaseListPage } from "@/pages/BaseListPage.js";
import { DataTable } from "@/components/DataTable/DataTable.js";
import { Pagination } from "@/components/Pagination/Pagination.js";
import { SearchInput } from "@/components/SearchInput/SearchInput.js";
import { FormField } from "@/components/FormField/FormField.js";

export class Contacts extends BaseListPage {
  static template = "pages.Contacts";

  static components = {
    DataTable,
    Pagination,
    SearchInput,
    FormField,
  };

  columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status", type: "badge", sortable: true },
  ];
  get filterKeys() {
    return ["status"];
  }
  statusOptions = [
    { value: "", label: "All statuses" },
    ...["Lead", "Customer", "Inactive"].map((label) => ({
      value: label.toLowerCase(),
      label,
    })),
  ];

  get apiUrl() {
    return "/contacts";
  }

  get routeUrl() {
    return "/contacts";
  }
}
