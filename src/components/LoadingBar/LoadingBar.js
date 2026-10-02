import { Component, useState, onMounted, onWillUnmount } from "@odoo/owl";

export class LoadingBar extends Component {
  static template = "components.LoadingBar";

  setup() {
    this.state = useState({ active: this.env.loading.active });
    onMounted(() => {
      this.unsubscribe = this.env.loading.subscribe(
        (active) => (this.state.active = active),
      );
      this.state.active = this.env.loading.active;
    });
    onWillUnmount(() => this.unsubscribe?.());
  }
}
