import {
  Component,
  useState,
  onMounted,
  onWillUpdateProps,
  onWillDestroy,
} from "@odoo/owl";
import { pageProps, usePageProps } from "@/router/pageProps.js";

export class BaseListPage extends Component {
  static props = pageProps;
  setup() {
    this.page = usePageProps();
    this.urlQuery = { ...this.page.query };
    this.state = useState({
      records: [],
      query: this.page.query.q || "",
      page: this.readPage(this.page.query.page),
      sort: this.page.query.sort || "",
      order: this.page.query.order === "desc" ? "desc" : "asc",
      filters: this.readFilters(this.page.query),
      pages: 1,
      total: 0,
      loading: false,
      error: "",
    });
    this.requestId = 0;
    this.controller = null;
    this.searchTimer = null;
    this.destroyed = false;
    onMounted(() => {
      void this.load();
    });
    onWillUpdateProps((props) => {
      clearTimeout(this.searchTimer);
      this.urlQuery = { ...props.query };
      this.state.query = props.query?.q || "";
      this.state.page = this.readPage(props.query?.page);
      this.state.sort = props.query?.sort || "";
      this.state.order = props.query?.order === "desc" ? "desc" : "asc";
      this.state.filters = this.readFilters(props.query || {});
      void this.load();
    });
    onWillDestroy(() => {
      this.destroyed = true;
      clearTimeout(this.searchTimer);
      this.requestId++;
      this.controller?.abort();
    });
  }
  /** @returns {string} */
  get apiUrl() {
    throw new Error("Define apiUrl on the list subclass.");
  }
  /** @returns {string} */
  get routeUrl() {
    throw new Error("Define routeUrl on the list subclass.");
  }
  get perPage() {
    return 5;
  }
  /** @returns {string[]} */
  get filterKeys() {
    return [];
  }
  readFilters(query) {
    return Object.fromEntries(
      this.filterKeys.map((key) => [key, query[key] || ""]),
    );
  }
  /** @returns {string | null} */
  get detailRoute() {
    return `${this.routeUrl}/:id`;
  }
  readPage(value) {
    const page = Number(value);
    return Number.isSafeInteger(page) && page > 0 ? page : 1;
  }
  buildQueryParams() {
    const query = new URLSearchParams({
      ...this.urlQuery,
      q: this.state.query,
      page: String(this.state.page),
    });
    if (this.state.sort) {
      query.set("sort", this.state.sort);
      query.set("order", this.state.order);
    } else {
      query.delete("sort");
      query.delete("order");
    }
    for (const key of this.filterKeys) {
      if (this.state.filters[key]) query.set(key, this.state.filters[key]);
      else query.delete(key);
    }
    return query;
  }
  changeSort(sort, order) {
    this.state.sort = sort;
    this.state.order = order;
    this.state.page = 1;
    this.navigateQuery();
  }
  changeFilter(key, value) {
    if (!this.filterKeys.includes(key)) return;
    this.state.filters[key] = value;
    this.state.page = 1;
    this.navigateQuery();
  }

  async load() {
    const requestId = ++this.requestId;
    this.controller?.abort();
    this.controller = new AbortController();
    this.state.loading = true;
    this.state.error = "";
    const params = this.buildQueryParams();
    params.set("perPage", String(this.perPage));
    try {
      const result = await this.env.api.get(`${this.apiUrl}?${params}`, {
        signal: this.controller.signal,
      });
      if (this.destroyed || requestId !== this.requestId) return;
      if (
        !Array.isArray(result?.records) ||
        !Number.isInteger(result.page) ||
        result.page < 1 ||
        !Number.isInteger(result.pages) ||
        result.pages < 1 ||
        !Number.isFinite(result.total)
      )
        throw new Error("Invalid list response from the server.");
      this.state.records = result.records;
      this.state.page = result.page;
      this.state.pages = result.pages;
      this.state.total = result.total;
      if (String(result.page) !== params.get("page")) this.navigateQuery(true);
    } catch (error) {
      if (
        !this.destroyed &&
        requestId === this.requestId &&
        error.name !== "AbortError"
      )
        this.state.error = error.message || "Could not load records.";
    } finally {
      if (!this.destroyed && requestId === this.requestId)
        this.state.loading = false;
    }
  }
  search(value) {
    this.state.query = value;
    this.state.page = 1;
    this.requestId++;
    this.controller?.abort();
    this.state.loading = true;
    clearTimeout(this.searchTimer);
    this.searchTimer = setTimeout(() => this.navigateQuery(true), 250);
  }
  changePage(page) {
    this.state.page = this.readPage(page);
    this.navigateQuery();
  }
  navigateQuery(replace = false) {
    clearTimeout(this.searchTimer);
    void this.env.router.navigate(
      `${this.routeUrl}?${this.buildQueryParams()}`,
      { replace },
    );
  }
  open(record) {
    if (!this.detailRoute) return;
    const path = this.detailRoute.replace(":id", encodeURIComponent(record.id));
    if (this.env.router.checkPathExists(path))
      return this.navigateWithQuery(path);
  }
  createRecord() {
    return this.navigateWithQuery(`${this.routeUrl.replace(/\/$/, "")}/new`);
  }
  navigateWithQuery(path) {
    clearTimeout(this.searchTimer);
    const query = this.buildQueryParams().toString();
    return this.env.router.navigate(query ? `${path}?${query}` : path);
  }
}
