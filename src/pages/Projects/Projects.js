import { BaseListPage } from "@/pages/BaseListPage.js";
import { DataTable } from "@/components/DataTable/DataTable.js";
import { StartEndDate } from "@/features/StartEndDate/StartEndDate";

export class Projects extends BaseListPage {
  static template = "pages.Projects";
  static components = {
    DataTable,
  };

  columns = [
    {key: "name", label: "Name"},
    {key: "start_date", label: "Dates", component: StartEndDate}
  ]
  get apiUrl() {
    return "/projects";
  }
  get detailRoute() { return null; }

  get routeUrl() {
    return "/projects";
  }
}
