import { Home } from "@/pages/Home/Home.js";
import { Login } from "@/pages/Login/Login.js";
import { NotFound } from "@/pages/NotFound/NotFound.js";

export const routes = [
  { path: "/login", name: "login", component: Login, guestOnly: true },
  { path: "/", name: "home", component: Home, auth: true, layout: "main" },
  { path: "*", name: "not-found", component: NotFound },
];
