import { Component, useState, onWillStart, onWillUnmount } from "@odoo/owl";
import { LoadingBar } from "@/components/LoadingBar/LoadingBar.js";
import { ToastHost } from "@/components/ToastHost/ToastHost.js";

export class App extends Component {
  static template = "app.App";
  static components = { LoadingBar, ToastHost };

  setup() {
    this.state = useState({ route: this.env.router.current });
    this.unsubscribe = null;

    onWillStart(async () => {
      this.unsubscribe = this.env.router.subscribe((route) => {
        this.state.route = route;
      });
      await this.env.router.start();
      this.state.route = this.env.router.current;
    });

    onWillUnmount(() => { this.unsubscribe?.(); this.env.router.stop(); });
  }

  get currentComponent() {
    return this.state.route?.component;
  }

  get currentProps() {
    return {
      ...(this.state.route?.props || {}),
      params: this.state.route?.params || {},
      query: this.state.route?.query || {},
      route: this.state.route,
    };
  }
}
