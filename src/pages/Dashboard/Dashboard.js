import {
    Component,
    useState,
    onMounted,
    onWillDestroy,
} from "@odoo/owl";

import { DataTable } from "@/components/DataTable/DataTable.js";
import { pageProps } from "@/router/pageProps.js";
import { formatCurrency } from "@/utils/format.js";

export class Dashboard extends Component {
    static template = "pages.Dashboard";
    static components = { DataTable };
    static props = pageProps;

    setup() {
        this.state = useState({
            summary: {
                contacts: 0,
                opportunities: 0,
                pipeline: 0,
            },
            records: [],
            loading: false,
            error: "",
        });

        this.controller = new AbortController();

        onMounted(() => {
            void this.load();
        });

        onWillDestroy(() => {
            this.controller.abort();
        });
    }

    columns = [
        { key: "name", label: "Opportunity" },
        { key: "customer", label: "Customer" },
        { key: "amount", label: "Amount", format: (value) => formatCurrency(value) },
        { key: "stage", label: "Stage" },
    ];

    async load() {
        this.controller.abort();
        const controller = this.controller = new AbortController();
        this.state.loading = true;
        this.state.error = "";

        try {
            const result = await this.env.api.get(
                "/dashboard",
                {
                    signal: controller.signal,
                }
            );

            if (controller.signal.aborted) return;
            this.state.summary = result.summary;
            this.state.records = result.records;
        } catch (error) {
            if (!controller.signal.aborted) {
                this.state.error =
                    error instanceof Error
                        ? error.message
                        : "Could not load dashboard.";
            }
        } finally {
            if (!controller.signal.aborted) {
                this.state.loading = false;
            }
        }
    }

    formatCurrency(value) {
        return formatCurrency(value);
    }
}
