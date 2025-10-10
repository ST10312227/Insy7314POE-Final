// src/lib/api.js
export async function api(path, { method = "GET", body, headers = {} } = {}) {
  const token = localStorage.getItem("token");
  const res = await fetch(`/api${path}`, {
    method,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    credentials: "include",
  });

  // try parse json (even on error)
  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    const err = new Error(data?.error || data?.message || res.statusText);
    err.status = res.status;
    throw err;
  }
  return data ?? {};
}
