import { BaseForm } from "@/forms/BaseForm.js";

export class ContactForm extends BaseForm {
  static template = "pages.ContactForm";
  get apiUrl() { return "/contacts"; }
  get routeUrl() { return "/contacts"; }
  get recordLabel() { return "Contact"; }
  getInitialForm() { return { name: "", email: "", company: "", status: "Lead" }; }
  statusOptions = ["Lead", "Customer", "Inactive"].map((value) => ({ value, label: value }));
  validate() {
    const errors = {};
    if (!this.state.form.name.trim()) errors.name = "Name is required.";
    if (this.state.form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.state.form.email)) errors.email = "Enter a valid email.";
    this.state.errors = errors;
    return Object.keys(errors).length === 0;
  }
}
