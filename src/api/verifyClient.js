// src/api/verifyClient.js
const RAW_BASE = import.meta.env.VITE_APP_SERVER_URL || "";
export const BASE = RAW_BASE.replace(/\/+$/, "");

function buildURL(path = "") {
  const p = String(path);
  const left = BASE.replace(/\/+$/, "");
  const right = p.startsWith("/") ? p : `/${p}`;
  return `${left}${right}`;
}

export async function api(path, init = {}) {
  const headers = new Headers(init.headers || {});

  // 👉 JWT token (login success হলে localStorage এ রাখবে)
  const token = localStorage.getItem("token"); // প্রয়োজন হলে key বদলাও
  if (token) headers.set("Authorization", `Bearer ${token}`);

  // 👉 যদি FormData না হয় এবং body object হয়, JSON বানিয়ে পাঠাও
  let body = init.body;
  if (body && !(body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
    if (typeof body !== "string") body = JSON.stringify(body);
  }

  const res = await fetch(buildURL(path), {
    credentials: "include",         // cookie থাকলে তাও যাবে
    ...init,
    headers,
    body,
  });

  // error handling
  if (!res.ok) {
    let msg = `HTTP ${res.status}`;
    try {
      const data = await res.json();
      msg = data?.message || msg;
    } catch (_) {}
    throw new Error(msg);
  }

  // 204 হলে body নাই
  if (res.status === 204) return undefined;
  return res.json();
}
