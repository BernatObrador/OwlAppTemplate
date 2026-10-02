import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap";

// Bootstrap is the default provider, but application templates deliberately use
// app-* classes instead of Bootstrap utility classes. This keeps the business UI
// portable. Replace this provider without rewriting OWL components.
export const uiProvider = "bootstrap";
