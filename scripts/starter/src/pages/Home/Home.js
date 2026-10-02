import { Component } from "@odoo/owl";
import { pageProps } from "@/router/pageProps.js";

export class Home extends Component {
  static template = "pages.Home";
  static props = pageProps;
}
