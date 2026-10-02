/**
 * @typedef {Object} RequestOptions
 * @property {string} [method]
 * @property {*} [data]
 * @property {Record<string, string>} [headers]
 * @property {boolean} [loading]
 * @property {AbortSignal} [signal]
 * @property {boolean} [auth]
 * @property {number} [perPage]
 */

export class ApiError extends Error {
  constructor(
    message,
    { status = 0, data = null, code = "", cause = undefined } = {},
  ) {
    super(message, { cause });
    this.name = "ApiError";
    this.status = status;
    this.data = data;
    this.code = code;
  }
}

export class ApiService {
  constructor({ baseUrl, loading, transport = null, getHeaders = () => ({}) }) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
    this.loading = loading;
    this.transport = transport;
    this.getHeaders = getHeaders;
    /** @type {null | (() => void)} */
    this.onUnauthorized = null;
  }

  get(path, options = {}) {
    return this.request(path, { ...options, method: "GET" });
  }
  post(path, data, options = {}) {
    return this.request(path, { ...options, method: "POST", data });
  }
  put(path, data, options = {}) {
    return this.request(path, { ...options, method: "PUT", data });
  }
  patch(path, data, options = {}) {
    return this.request(path, { ...options, method: "PATCH", data });
  }
  delete(path, options = {}) {
    return this.request(path, { ...options, method: "DELETE" });
  }

  /**
   * @param {string} path
   * @param {RequestOptions} [options]
   */
  async request(
    path,
    {
      method = "GET",
      data,
      headers = {},
      loading = true,
      signal,
      auth = true,
      perPage,
    } = {},
  ) {
    if (loading) this.loading.start();
    try {
      signal?.throwIfAborted();
      if (perPage !== undefined) {
        const [pathname, search = ""] = path.split("?");
        const query = new URLSearchParams(search);
        query.set("perPage", String(perPage));
        path = `${pathname}?${query}`;
      }
      const requestHeaders = {
        Accept: "application/json",
        ...(data === undefined ? {} : { "Content-Type": "application/json" }),
        ...this.getHeaders(),
        ...headers,
      };
      if (this.transport)
        return await this.transport({
          path,
          method,
          data,
          headers: requestHeaders,
          signal,
        });
      const response = await fetch(`${this.baseUrl}${path}`, {
        method,
        credentials: "include",
        headers: requestHeaders,
        signal,
        body: data === undefined ? undefined : JSON.stringify(data),
      });
      const text = response.status === 204 ? "" : await response.text();
      let responseData = null;
      try {
        responseData = text ? JSON.parse(text) : null;
      } catch (cause) {
        if (response.ok)
          throw new ApiError("The server returned invalid JSON.", {
            status: response.status,
            code: "INVALID_RESPONSE",
            cause,
          });
      }
      if (!response.ok)
        throw new ApiError(
          responseData?.message || `Request failed (${response.status}).`,
          {
            status: response.status,
            data: responseData,
            code: responseData?.code || "HTTP_ERROR",
          },
        );
      return responseData;
    } catch (cause) {
      if (cause.name === "AbortError") throw cause;
      const error =
        cause instanceof ApiError
          ? cause
          : new ApiError("Could not connect to the server. Please try again.", {
              code: "NETWORK_ERROR",
              cause,
            });
      if (error.status === 401 && auth) this.onUnauthorized?.();
      throw error;
    } finally {
      if (loading) this.loading.stop();
    }
  }
}
