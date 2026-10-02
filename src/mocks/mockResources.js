import {
    contacts as seedContacts,
    opportunities as seedOpportunities,
    projects as seedProjects,
} from "./mockData.js";

import { ApiError } from "../services/api.js";
import { opportunityErrors } from "../features/opportunities.js";

function validateContact(data) {
    const record = {
        name:
            typeof data?.name === "string"
                ? data.name.trim()
                : "",

        email:
            typeof data?.email === "string"
                ? data.email.trim()
                : "",

        company:
            typeof data?.company === "string"
                ? data.company.trim()
                : "",

        status: data?.status ?? "Lead",
    };

    const errors = {};

    if (!record.name) {
        errors.name = "Name is required.";
    }

    if (
        record.email &&
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(record.email)
    ) {
        errors.email = "Enter a valid email.";
    }

    if (
        !["Lead", "Customer", "Inactive"].includes(
            record.status
        )
    ) {
        errors.status = "Choose a valid status.";
    }

    if (Object.keys(errors).length) {
        throw new ApiError(
            "Review the form.",
            {
                status: 422,
                data: {
                    errors,
                },
            }
        );
    }

    return record;
}

export function createMockResources() {
    return {
        contacts: {
            label: "Contact",
            filterFields: ["status"],
            records: structuredClone(seedContacts),

            searchFields: [
                "name",
                "email",
                "company",
                "status",
            ],

            validate: validateContact,
        },

        opportunities: {
            label: "Opportunity",
            filterFields: ["stage"],
            sortFields: ["name", "customer", "amount", "stage"],
            records: structuredClone(
                seedOpportunities
            ),

            searchFields: [
                "name",
                "customer",
                "stage",
            ],
            validate(data) {
                const errors = opportunityErrors(data);
                if (Object.keys(errors).length) throw new ApiError("Review the form.", { status: 422, data: { errors } });
                return { name: data.name.trim(), customer: data.customer.trim(), amount: Number(data.amount), stage: data.stage };
            },
        },
        projects: {
            records: structuredClone(
                seedProjects
            ),

            searchFields : [
                "name"
            ]
        }
    };
}
