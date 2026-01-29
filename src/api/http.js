export const BASE = (import.meta.env.VITE_APP_SERVER_URL || "").replace(/\/+$/,"");

export async function api(path, init = {}) {
  const url = `${BASE}${path.startsWith("/") ? path : "/" + path}`;
  console.log(">>> API call:", url, init);   // ← লগ যোগ করো
  const token = localStorage.getItem("token");
  const res = await fetch(url, {
    headers: {
      ...(init.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      "Content-Type": init.body instanceof FormData ? undefined : "application/json",
    },
    credentials: "include",
    ...init,
  });
  if (!res.ok) throw new Error((await res.json().catch(()=>({}))).message || res.statusText);
  return res.json();
}
