import { API_URL } from "../config.js";

// Every call goes through here so the backend envelope
// { success, message, errorCode, data } is handled in exactly one place.
let token = null;
export const setToken = (t) => { token = t; };

// Called when the server rejects our token (expired or invalid) so the app can sign the user out.
let onUnauthorized = null;
export const setUnauthorizedHandler = (fn) => { onUnauthorized = fn; };

export class ApiError extends Error {
  constructor(message, errorCode, status) {
    super(message);
    this.errorCode = errorCode;
    this.status = status;
  }
}

export async function request(path, { method = "GET", body, params } = {}) {
  const url = new URL(API_URL + path, window.location.origin);
  Object.entries(params || {}).forEach(([k, v]) => {
    if (v !== undefined && v !== null && v !== "") url.searchParams.set(k, v);
  });
  let res;
  try {
    res = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError("Can't reach the server. Check your connection and that the backend is running.", "NETWORK_ERROR", 0);
  }
  let json = null;
  try { json = await res.json(); } catch { /* non-JSON body */ }
  if (res.status === 401 && token && onUnauthorized) onUnauthorized();
  if (!res.ok || json?.success === false) {
    throw new ApiError(json?.message || `The server returned an error (${res.status}).`, json?.errorCode || "UNKNOWN", res.status);
  }
  return json && "data" in json ? json.data : json;
}

// Backend list shape: { items, pagination: { page, limit, totalItems, totalPages } }
export function toPage(raw, page = 1, pageSize = 10, mapItem = (x) => x) {
  const items = (Array.isArray(raw) ? raw : raw?.items ?? []).map(mapItem);
  const total = raw?.pagination?.totalItems ?? raw?.total ?? items.length;
  return { items, total, page, pageSize };
}
export const emptyPage = (page = 1, pageSize = 10) => ({ items: [], total: 0, page, pageSize });

// UI table state -> backend query parameters
export const listParams = ({ page, pageSize, sort, dir }) => ({
  page, limit: pageSize, sortBy: sort || undefined, sortOrder: sort ? dir : undefined,
});
