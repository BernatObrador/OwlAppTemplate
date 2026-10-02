import { Component, useState, onMounted, onWillDestroy } from "@odoo/owl";
import { pageProps, usePageProps } from "@/router/pageProps.js";
import { FormField } from "@/components/FormField/FormField.js";

export class BaseForm extends Component {
  static props = pageProps;
  static components = { FormField };

  setup() {
    this.page = usePageProps();
    this.state = useState({
      form: this.getInitialForm(),
      errors: {},
      loading: false,
      saving: false,
      loadError: "",
      saveError: "",
    });
    this.initialForm = JSON.parse(JSON.stringify(this.state.form));
    this.controller = null;
    this.destroyed = false;
    onMounted(() => {
      void this.load();
    });
    onWillDestroy(() => {
      this.destroyed = true;
      this.abortRequest();
    });
  }

  getInitialForm() {
    return {};
  }
  /** @returns {string} */
  get apiUrl() {
    throw new Error("Define apiUrl on the form subclass.");
  }
  /** @returns {string} */
  get routeUrl() {
    throw new Error("Define routeUrl on the form subclass.");
  }
  get recordLabel() {
    return "Record";
  }
  get dirty() {
    return JSON.stringify(this.state.form) !== JSON.stringify(this.initialForm);
  }
  reset() {
    if (this.state.saving || this.state.loading) return;
    this.state.form = JSON.parse(JSON.stringify(this.initialForm));
    this.state.errors = {};
    this.state.saveError = "";
  }
  cancel() {
    if (!this.state.saving) return this.env.router.navigate(this.returnUrl);
  }
  get returnUrl() {
    const query = new URLSearchParams(this.page.query).toString();
    return query ? `${this.routeUrl}?${query}` : this.routeUrl;
  }
  get isNew() {
    return this.page.params.id == null;
  }
  get recordUrl() {
    return `${this.apiUrl.replace(/\/$/, "")}/${encodeURIComponent(this.page.params.id)}`;
  }

  abortRequest() {
    this.controller?.abort();
    this.controller = null;
  }

  async load() {
    if (this.isNew) return;
    this.abortRequest();
    const controller = (this.controller = new AbortController());
    this.state.loading = true;
    this.state.loadError = "";
    try {
      const form = await this.env.api.get(this.recordUrl, {
        signal: controller.signal,
      });
      if (!this.destroyed && !controller.signal.aborted) {
        if (!form || typeof form !== "object" || Array.isArray(form))
          throw new Error("Invalid record response from the server.");
        this.initialForm = JSON.parse(JSON.stringify(form));
        this.state.form = form;
      }
    } catch (error) {
      if (!this.destroyed && !controller.signal.aborted)
        this.state.loadError = error.message || "Could not load record.";
    } finally {
      if (!this.destroyed && !controller.signal.aborted)
        this.state.loading = false;
    }
  }

  setField(name, value) {
    this.state.form[name] = value;
    this.state.errors[name] = "";
  }
  validate() {
    this.state.errors = {};
    return true;
  }

  async save(ev) {
    ev?.preventDefault();
    if (
      this.state.saving ||
      this.state.loading ||
      this.state.loadError ||
      !this.validate()
    )
      return;
    this.state.saving = true;
    this.state.saveError = "";
    const isNew = this.isNew;
    // Snapshot JSON form data so edits during an in-flight request cannot change its payload.
    const values = JSON.parse(JSON.stringify(this.state.form));
    try {
      await (isNew
        ? this.env.api.post(this.apiUrl.replace(/\/$/, ""), values)
        : this.env.api.put(this.recordUrl, values));
      if (this.destroyed) return;
      this.env.notifications.add(
        `${this.recordLabel} ${isNew ? "created" : "updated"}.`,
        { type: "success" },
      );
      await this.env.router.navigate(this.returnUrl);
    } catch (error) {
      if (this.destroyed) return;
      this.state.saveError = error.message || "Could not save record.";
      for (const name of Object.keys(this.getInitialForm())) {
        if (typeof error.data?.errors?.[name] === "string")
          this.state.errors[name] = error.data.errors[name];
      }
    } finally {
      if (!this.destroyed) this.state.saving = false;
    }
  }
}
