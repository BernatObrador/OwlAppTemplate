import { ApiError } from "../services/api.js";

// Demo only: a session marker, never used by real HTTP authentication.
export function createMockAuth(storage) {
  let active = storage?.get("mock-session") === true;
  const user = { id: 1, name: "Demo User", email: "demo@example.com" };
  return {
    handle(path, method, data) {
      if (path === "/auth/login" && method === "POST") {
        if (data?.email !== user.email || data?.password !== "demo") throw new ApiError("Use demo@example.com / demo", { status: 401 });
        active = true;
        storage?.set("mock-session", true);
        return { user: { ...user } };
      }
      if (path === "/auth/logout" && method === "POST") {
        active = false;
        storage?.remove("mock-session");
        return { ok: true };
      }
      if (path === "/auth/me" && method === "GET") {
        this.requireSession();
        return { user: { ...user } };
      }
      return undefined;
    },
    requireSession() {
      if (!active) throw new ApiError("Your session has expired. Please sign in.", { status: 401 });
    },
  };
}
