import { Component } from "@odoo/owl";

export class BreadCrumbs extends Component {
  static template = "components.BreadCrumbs";
  static props = {
    pathList: {type: Array,},
  }
  onClickPath(path) {
    this.env.router.navigate(path.url);
  }
}
