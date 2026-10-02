import { Component, useState } from "@odoo/owl";
import { pageProps, usePageProps } from "@/router/pageProps.js";
import { safePath } from "@/router/router.js";
export class Login extends Component {
  static template = "pages.Login";
  static props = pageProps;
  setup() {
    this.page = usePageProps();
    this.state = useState({
      email: this.env.useMock ? "demo@example.com" : "",
      password: this.env.useMock ? "demo" : "",
      error: this.env.auth.restoreError,
      submitting: false,
    });
  }
  async submit(ev) {
    ev.preventDefault();
    if (this.state.submitting) return;
    this.state.error = "";
    this.state.submitting = true;
    try {
      await this.env.auth.login({
        email: this.state.email,
        password: this.state.password,
      });
      await this.env.router.navigate(safePath(this.page.query.next), {
        replace: true,
      });
    } catch (error) {
      this.state.error = error.message || "Login failed.";
    } finally {
      this.state.submitting = false;
    }
  }
}
