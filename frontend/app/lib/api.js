const raw = (process.env.NEXT_PUBLIC_API_BASE || "").trim();
const API_BASE = /^https?:\/\//i.test(raw) ? raw.replace(/\/+$/, "") : "http://localhost:4000";

export async function api(path, options = {}) {
  const url = `${API_BASE}${path.startsWith("/") ? path : `/${path}`}`;
  const res = await fetch(url, {
    credentials: "include",
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw Object.assign(new Error(data?.message || "Request failed"), { status: res.status, data });
  return data;
}
