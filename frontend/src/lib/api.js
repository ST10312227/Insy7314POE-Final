// src/lib/api.js
// Robust JSON fetch with JWT header and optional CSRF support.

const BASE = (import.meta?.env?.VITE_API_BASE ?? "").replace(/\/+$/, "");

function getToken() {
  const s = sessionStorage.getItem("token");
  const l = localStorage.getItem("token");
  return s ?? l ?? "";
}

function asBearer(token) {
  if (!token) return "";
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

export async function api(path, options = {}) {
  const token = getToken();
  const bearer = asBearer(token);

  const {
    json,
    method,
    headers = {},
    withCsrf,
    csrfToken,
    ...rest
  } = options;

  const finalHeaders = {
    ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
    ...(bearer ? { Authorization: bearer } : {}),
    ...(withCsrf && csrfToken ? { "x-csrf-token": csrfToken } : {}),
    ...headers,
  };

  const res = await fetch(`${BASE}${path}`, {
    method: method || (json !== undefined ? "POST" : "GET"),
    headers: finalHeaders,
    credentials: "include",
    body: json !== undefined ? JSON.stringify(json) : undefined,
    ...rest,
  });

  let data = null;
  try { data = await res.json(); } catch {}

  if (!res.ok) {
    const err = new Error(
      data?.issues?.[0]?.message ||
      data?.message ||
      data?.error ||
      `HTTP ${res.status}`
    );
    err.status = res.status;
    err.response = { data };
    throw err;
  }

  return data ?? {};
}
