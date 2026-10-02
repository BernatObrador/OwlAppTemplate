import { BaseForm } from "@/forms/BaseForm.js";
import { opportunityStages, opportunityErrors } from "@/features/opportunities.js";

export class OpportunityForm extends BaseForm {
  static template = "pages.OpportunityForm";
  get apiUrl() { return "/opportunities"; }
  get routeUrl() { return "/opportunities"; }
  get recordLabel() { return "Opportunity"; }
  stageOptions = opportunityStages.map((value) => ({ value, label: value }));
  getInitialForm() { return { name: "", customer: "", amount: 0, stage: "Qualified" }; }
  validate() {
    this.state.errors = opportunityErrors(this.state.form);
    return Object.keys(this.state.errors).length === 0;
  }
}
