
export const API_BASE = import.meta.env.VITE_APP_SERVER_URL || "http://localhost:5000/";
async function jsonOrThrow(res) {
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data?.success === false) {
    throw new Error(data?.message || `Request failed (${res.status})`);
  }
  return data;
}

function getToken() {
  return localStorage.getItem("token") || sessionStorage.getItem("token");
}

export async function fetchPublicSettings() {
  const res = await fetch(`${API_BASE}api/settings/public`, {
    method: "GET",
    credentials: "include",
  });
  return jsonOrThrow(res);
}

export async function uploadLogo(file) {
  const fd = new FormData();
  fd.append("logo", file);

  const res = await fetch(`${API_BASE}api/settings/logo`, {
    method: "POST",
    body: fd,
    credentials: "include",
  });
  return jsonOrThrow(res);
}

export async function deleteLogo() {
  const res = await fetch(`${API_BASE}api/settings/logo`, {
    method: "DELETE",
    credentials: "include",
  });
  return jsonOrThrow(res);
}

export async function updateBrandName(brandName) {
  const res = await fetch(`${API_BASE}api/settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ brandName }),
    credentials: "include",
  });
  return jsonOrThrow(res);
}
// frontend/public use (social + text)
export async function fetchPublicHeaderSettings() {
  const res = await fetch(`${API_BASE}api/header-settings`, {
    method: "GET",
    credentials: "include",
  });
  return jsonOrThrow(res);
}

// admin panel theke update korar jonno
export async function updateHeaderSettings(payload) {
const res = await fetch(`${API_BASE}api/header-settings`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return jsonOrThrow(res);
}

// ✅ admin read
export async function fetchAdminShippingSettings() {
  const token = getToken();
  const res = await fetch(`${API_BASE}api/shipping-settings`, {
    method: "GET",
    headers: token ? { Authorization: `Bearer ${token}` } : {},
    credentials: "include",
  });
  return jsonOrThrow(res);
}

// ✅ admin update
export async function updateShippingSettings(payload) {
  const token = getToken();
  const res = await fetch(`${API_BASE}api/shipping-settings`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(payload),
    credentials: "include",
  });
  return jsonOrThrow(res);
}


// ✅ default export add (so no import error)
export default {
  API_BASE,
  fetchPublicSettings,
  uploadLogo,
  deleteLogo,
  updateBrandName,
   fetchPublicHeaderSettings,
  updateHeaderSettings,
  fetchAdminShippingSettings,
  // fetchAdminShippingSettings,
  updateShippingSettings

};
