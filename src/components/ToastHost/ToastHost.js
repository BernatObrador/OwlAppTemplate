import { Component, useState, onMounted, onWillUnmount } from "@odoo/owl";

export class ToastHost extends Component {
  static template = "components.ToastHost";

  setup() {
    this.state = useState({ items: [] });
    onMounted(() => {
      this.unsubscribe = this.env.notifications.subscribe(
        (items) => (this.state.items = items),
      );
    });
    onWillUnmount(() => this.unsubscribe?.());
  }
  remove(id) {
    this.env.notifications.remove(id);
  }
}
