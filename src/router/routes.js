import { Dashboard } from "@/pages/Dashboard/Dashboard.js";
import { Contacts } from "@/pages/Contacts/Contacts.js";
import { ContactForm } from "@/pages/ContactForm/ContactForm.js";
import { Login } from "@/pages/Login/Login.js";
import { NotFound } from "@/pages/NotFound/NotFound.js";
import { Projects } from "@/pages/Projects/Projects.js";
import { Opportunities } from "@/pages/Opportunities/Opportunities.js";
import { OpportunityForm } from "@/pages/OpportunityForm/OpportunityForm.js";

export const routes = [
  { path: "/login", name: "login", component: Login, guestOnly: true },
  { path: "/", name: "dashboard", component: Dashboard, auth: true, layout: "main" },
  { path: "/contacts", name: "contacts", component: Contacts, auth: true, layout: "main" },
  { path: "/contacts/new", name: "contact-new", component: ContactForm, auth: true, layout: "main", breadCrumbsName: "New" },
  { path: "/contacts/:id", name: "contact-detail", component: ContactForm, auth: true, layout: "main", breadCrumbsName: ({ params }) => `Contact ${params.id}`},
  { path: "/projects", name: "projects", component: Projects, auth: true, layout: "main" },
  { path: "/opportunities", name: "opportunities", component: Opportunities, auth: true, layout: "main" },
  { path: "/opportunities/new", name: "opportunity-new", component: OpportunityForm, auth: true, layout: "main" },
  { path: "/opportunities/:id", name: "opportunity-detail", component: OpportunityForm, auth: true, layout: "main" },
  { path: "*", name: "not-found", component: NotFound },
];
