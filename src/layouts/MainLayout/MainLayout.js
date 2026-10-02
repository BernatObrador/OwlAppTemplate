import { Component, useState } from "@odoo/owl";
import { pageProps } from "@/router/pageProps.js";
import { BreadCrumbs } from "@/components/BreadCrumbs/BreadCrumbs.js";

export class MainLayout extends Component {
  static template = "layouts.MainLayout";
  static props = { ...pageProps, PageComponent: Function };
  static components = { BreadCrumbs }

  setup() {
    this.ui = useState({ sidebarOpen: false, loggingOut: false });
  }

  get user() {
    return this.env.auth.user;
  }
  get pageProps() {
    return {
      params: this.props.params || {},
      query: this.props.query || {},
      route: this.props.route,
    };
  }
  isActive(item) {
    return item.routes.includes(this.props.route?.name);
  }
  
  navigate(path) {
    this.ui.sidebarOpen = false;
    this.env.router.navigate(path);
  }
  async logout() {
    if (this.ui.loggingOut) return;
    this.ui.loggingOut = true;
    try {
      await this.env.auth.logout();
    } catch {
      this.env.notifications.add(
        "Signed out locally, but the server could not confirm logout. Your server session may still be active.",
        { type: "danger", timeout: 0 },
      );
    } finally {
      this.ui.loggingOut = false;
      await this.env.router.navigate("/login", { replace: true });
    }
  }
  get breadcrumbs() {
    return this.props.route?.breadcrumbs || [];
  }
}
