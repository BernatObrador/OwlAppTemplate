import { ApiError } from "./api.js";

export class AuthService {
  constructor({ api, storage }) {
    this.api = api;
    this.storage = storage;
    this.user = null;
    this.restoreError = "";
    this.revision = 0;
  }

  get isAuthenticated() { return this.user !== null; }

  async restore() {
    this.storage.remove("user"); // Discard the old template's cached identity.
    this.user = null;
    this.restoreError = "";
    const revision = ++this.revision;
    try {
      const result = await this.api.get("/auth/me", { loading: false, auth: false });
      if (revision === this.revision) this.user = this.readUser(result);
    } catch (error) {
      if (revision === this.revision && error.status !== 401) this.restoreError = error.message;
    }
    return this.user;
  }

  readUser(result) {
    if (!result?.user || typeof result.user !== "object" || result.user.id == null) {
      throw new ApiError("The server returned an invalid session.", { code: "INVALID_SESSION" });
    }
    return result.user;
  }

  async login(credentials) {
    const revision = ++this.revision;
    const result = await this.api.post("/auth/login", credentials, { auth: false });
    const user = this.readUser(result);
    if (revision === this.revision) { this.user = user; this.restoreError = ""; }
    return this.user;
  }

  clear() {
    this.revision += 1;
    this.user = null;
    this.storage.remove("user");
  }

  async logout() {
    // A failed server logout must be visible: its cookie may still be valid.
    try { await this.api.post("/auth/logout", {}, { auth: false }); }
    catch (error) { if (error.status !== 401) throw error; }
    finally { this.clear(); }
  }
}
