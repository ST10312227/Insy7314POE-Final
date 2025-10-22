// Robust JSON fetch with JWT header and optional CSRF support.
// Safe against double-prefixing when VITE_API_BASE=/api.

const RAW_BASE = import.meta?.env?.VITE_API_BASE ?? "/api";
const BASE = (RAW_BASE || "/api").replace(/\/+$/, ""); // strip trailing slashes

function buildUrl(path) {
  // Absolute URL? (http/https) -> use as-is
  if (/^https?:\/\//i.test(path)) return path;

  // Normalize incoming path
  const p = (path || "").startsWith("/") ? path : `/${path || ""}`;

  // If BASE is empty, just return the normalized path
  if (!BASE) return p;

  // If path already starts with BASE (/api or your absolute base), don't prefix again
  if (p === BASE || p.startsWith(`${BASE}/`)) return p;

  // Special guard: if BASE is "/api" and path already starts with "/api", don't prefix
  if (BASE === "/api" && p.startsWith("/api")) return p;

  // Otherwise prepend BASE
  return `${BASE}${p}`;
}

function getToken() {
  const s = sessionStorage.getItem("token");
  const l = localStorage.getItem("token");
  return s ?? l ?? "";
}

function asBearer(token) {
  if (!token) return "";
  return token.startsWith("Bearer ") ? token : `Bearer ${token}`;
}

/**
 * api(path, options)
 *  - path: string ("/accounts/me", "beneficiaries", "/api/beneficiaries", etc.)
 *  - options:
 *      - json: any (if provided -> POST by default; body is JSON.stringified)
 *      - method: "GET" | "POST" | ...
 *      - headers: object
 *      - withCsrf: boolean
 *      - csrfToken: string
 *      - ...rest: fetch init overrides
 */
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

  const url = buildUrl(path);

  const res = await fetch(url, {
    method: method || (json !== undefined ? "POST" : "GET"),
    headers: finalHeaders,
    credentials: "include",
    body: json !== undefined ? JSON.stringify(json) : undefined,
    ...rest,
  });

  let data = null;
  try {
    data = await res.json();
  } catch {
    data = null;
  }

  if (!res.ok) {
    const err = new Error(
      data?.issues?.[0]?.message ||
      data?.message ||
      data?.error ||
      `HTTP ${res.status}`
    );
    err.status = res.status;
    err.response = { data, url };
    throw err;
  }

  return data ?? {};
}
