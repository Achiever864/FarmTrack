const API_BASE = "https://farmtrack-bd7x.onrender.com";

function getToken() {
  return localStorage.getItem("farmtrack_token");
}

async function request(endpoint, options = {}) {
  const token = getToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    let errorMsg = `Request failed (${response.status})`;
    try {
      const errJson = await response.json();
      errorMsg = errJson.error || errJson.message || errorMsg;
    } catch (_) {}
    throw new Error(errorMsg);
  }

  // Handle blob or text responses (e.g. CSV export)
  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("text/csv")) {
    return response.blob();
  }
  if (contentType && contentType.includes("image/")) {
    return response.blob();
  }

  return response.json();
}

export const api = {
  // Authentication
  auth: {
    login: (credentials) =>
      request("/auth/login", { method: "POST", body: JSON.stringify(credentials) }),
    register: (userData) =>
      request("/auth/register", { method: "POST", body: JSON.stringify(userData) }),
    getMe: () => request("/auth/me"),
  },

  // Farms
  farms: {
    list: (params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/farms${q ? `?${q}` : ""}`);
    },
    getById: (id) => request(`/farms/${id}`),
    create: (farmData) =>
      request("/farms", { method: "POST", body: JSON.stringify(farmData) }),
    update: (id, farmData) =>
      request(`/farms/${id}`, { method: "PATCH", body: JSON.stringify(farmData) }),
    delete: (id) => request(`/farms/${id}`, { method: "DELETE" }),
    getTimeseries: (id) => request(`/farms/${id}/timeseries`),
    getAnalysis: (id) => request(`/farms/${id}/analysis`),
    bulkImport: (payload) =>
      request("/farms/import", { method: "POST", body: JSON.stringify(payload) }),
  },

  // Organizations
  orgs: {
    create: (data) =>
      request("/orgs", { method: "POST", body: JSON.stringify(data) }),
    listMine: () => request("/orgs"),
    getById: (id) => request(`/orgs/${id}`),
    getPortfolio: (id) => request(`/orgs/${id}/portfolio`),
    exportCsv: async (id) => {
      const token = getToken();
      const res = await fetch(`${API_BASE}/orgs/${id}/portfolio/export`, {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) throw new Error("Failed to export CSV");
      return res.blob();
    },
    getMembers: (id) => request(`/orgs/${id}/members`),
    addMember: (id, data) =>
      request(`/orgs/${id}/members`, { method: "POST", body: JSON.stringify(data) }),
    updateMemberRole: (id, userId, role) =>
      request(`/orgs/${id}/members/${userId}`, {
        method: "PATCH",
        body: JSON.stringify({ role }),
      }),
    removeMember: (id, userId) =>
      request(`/orgs/${id}/members/${userId}`, { method: "DELETE" }),
    getAlerts: (id, params = {}) => {
      const q = new URLSearchParams(params).toString();
      return request(`/orgs/${id}/alerts${q ? `?${q}` : ""}`);
    },
    acknowledgeAlert: (alertId, action = "acknowledge") =>
      request(`/orgs/alerts/${alertId}`, {
        method: "PATCH",
        body: JSON.stringify({ action }),
      }),
  },

  // NDVI Sentinel Image Overlay
  ndvi: {
    getOverlayUrl: ({ bbox, from, to }) =>
      `${API_BASE}/ndvi?bbox=${bbox.join(",")}&from=${from}&to=${to}`,
  },
};
