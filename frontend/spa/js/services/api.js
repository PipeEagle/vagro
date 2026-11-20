/* Cliente API - Envoltorio sobre fetch nativo con manejo de errores estandar */

const API_BASE = "";

const api = (async (method, path, body = null, options = {}) => {
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
    const response = await fetch(url, config);

    if (response.status === 401) {
      store.setState({ isAuthenticated: false, user: null });
      throw new Error("Sesion expirada o no autorizada");
    }

    const contentType = response.headers.get("content-type") || "";
    let data;
    if (contentType.includes("application/json")) {
      data = await response.json();
    } else {
      data = await response.text();
    }

    if (!response.ok) {
      const errorMsg =
        data && data.message ? data.message : `Error ${response.status}`;
      throw { status: response.status, message: errorMsg, data };
    }

    return data;
  } catch (error) {
    if (error.status) {
      throw error;
    }
    throw { status: 0, message: error.message || "Error de red", data: null };
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
