import { request, toPage, emptyPage, listParams } from "./client.js";
import { FEATURES } from "../config.js";

// Users, drivers and audit log don't exist in the backend yet.
// While a feature flag is off these return an empty page and make NO request.
// When the backend ships the endpoint, set the flag to "true" in .env and rebuild.
// Expected contract: GET <path>?page&limit&sortBy&sortOrder&q&<filters>
//   -> { success, message, errorCode, data: { items: [...], pagination: { page, limit, totalItems, totalPages } } }
async function guardedList(enabled, path, p, filters) {
  if (!enabled) return emptyPage(p.page, p.pageSize);
  return toPage(await request(path, { params: { ...listParams(p), q: p.q, ...filters } }), p.page, p.pageSize);
}

export const adminApi = {
  users: (p) => guardedList(FEATURES.users, "/api/admin/users", p, { role: p.role, status: p.status }),
  setUserStatus: (id, status) => request(`/api/admin/users/${id}/status`, { method: "PATCH", body: { status } }),

  drivers: (p) => guardedList(FEATURES.drivers, "/api/admin/drivers", p, { availability: p.availability, vehicle: p.vehicle }),
  setDriverApproval: (id, approved) => request(`/api/admin/drivers/${id}/approval`, { method: "PATCH", body: { approved } }),

  audit: (p) => guardedList(FEATURES.audit, "/api/admin/audit-logs", p, { action: p.action, from: p.from, to: p.to }),
};
