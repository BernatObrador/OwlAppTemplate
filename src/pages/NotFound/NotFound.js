import { Component } from "@odoo/owl";
import { pageProps } from "@/router/pageProps.js";

export class NotFound extends Component {
  static template = "pages.NotFound";
  static props = pageProps;
}
