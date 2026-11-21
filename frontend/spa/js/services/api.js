/* Cliente API - Envoltorio sobre fetch nativo con reintentos, logging y manejo de errores robusto */

const API_BASE = "";
const MAX_RETRIES = 3;
const RETRY_DELAY_MS = 500;

const log = (level, msg, data) => {
  const prefix = `[API ${level.toUpperCase()}]`;
  console[level](prefix, msg, data ?? "");
};

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

const api = (async (method, path, body = null, options = {}, attempt = 1) => {
  const url = `${API_BASE}${path}`;
  const headers = {
    "Content-Type": "application/json",
    ...options.headers,
  };

  const config = {
    method,
    headers,
    credentials: "same-origin",
  };

  if (body !== null) {
    config.body = JSON.stringify(body);
  }

  try {
    log("debug", `${method} ${url} (attempt ${attempt})`);
    const response = await fetch(url, config);

    log("debug", `${method} ${url} -> ${response.status}`);

    if (response.status === 401) {
      log("warn", "Sesión expirada (401)");
      const store = (await import("../store.js")).default;
      store.setState({ isAuthenticated: false, user: null });
      throw { status: 401, message: "Sesion expirada o no autorizada", data: null };
    }

    const contentType = response.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg = data?.error || data?.message || `Error ${response.status}`;
      log("error", `${method} ${url} failed: ${errorMsg}`, data);
      throw { status: response.status, message: errorMsg, data };
    }

    log("info", `${method} ${url} OK`, data);
    return data;
  } catch (error) {
    if (error?.status === 401 || error?.status === 403) {
      throw error;
    }
    if (attempt < MAX_RETRIES && (error.status === 0 || error.status >= 500)) {
      log("warn", `Reintentando (${attempt}/${MAX_RETRIES})...`, error);
      await sleep(RETRY_DELAY_MS * attempt);
      return api(method, path, body, options, attempt + 1);
    }
    if (!error.status) {
      log("error", `Error de red: ${error.message}`);
      throw { status: 0, message: error.message || "Error de red", data: null };
    }
    throw error;
  }
});

export const apiClient = {
  get: (path, options) => api("GET", path, null, options),
  post: (path, body, options) => api("POST", path, body, options),
  put: (path, body, options) => api("PUT", path, body, options),
  patch: (path, body, options) => api("PATCH", path, body, options),
  delete: (path, options) => api("DELETE", path, null, options),
};

export default apiClient;