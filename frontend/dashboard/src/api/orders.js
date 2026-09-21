import { request, toPage, listParams } from "./client.js";
import { STATUS } from "../lib/status.js";

// Backend order -> UI order. Money stays in integer paise.
export const normalizeOrder = (o) => {
  const rest = o.restaurantId && typeof o.restaurantId === "object" ? o.restaurantId : null;
  const id = String(o._id ?? o.id);
  return {
    id,
    ref: id.slice(-6).toUpperCase(),
    status: o.status,
    items: (o.items ?? []).map((i) => ({ name: i.itemNameSnapshot, quantity: i.quantity, unitPrice: i.unitPrice, subtotal: i.subtotal })),
    customerId: o.customerId,
    driverId: o.driverId ?? null,
    deliveryAddress: o.deliveryAddress ?? "",
    subtotal: o.subtotal ?? 0,
    deliveryFee: o.deliveryFee ?? 0,
    totalAmount: o.totalAmount ?? 0,
    restaurantId: rest ? String(rest._id ?? rest.id) : o.restaurantId,
    restaurantName: rest?.name ?? "",
    createdAt: o.createdAt,
    updatedAt: o.updatedAt,
  };
};

// GET /api/orders
export async function listOrders({ table, filters = {} }) {
  const raw = await request("/api/orders", { params: { ...listParams(table), ...filters } });
  return toPage(raw, table.page, table.pageSize, normalizeOrder);
}

// GET /api/restaurants/:restaurantId/orders
export async function listRestaurantOrders(restaurantId, { table, filters = {} }) {
  const raw = await request(`/api/restaurants/${restaurantId}/orders`, { params: { ...listParams(table), ...filters } });
  return toPage(raw, table.page, table.pageSize, normalizeOrder);
}

// Everything the kitchen still has to act on or watch, oldest first.
// The backend filters by one status at a time, so one request per status.
export async function listActiveRestaurantOrders(restaurantId) {
  const statuses = [STATUS.PLACED, STATUS.ACCEPTED, STATUS.PREPARING, STATUS.READY, STATUS.DRIVER_ASSIGNED, STATUS.PICKED_UP];
  const pages = await Promise.all(
    statuses.map((status) =>
      request(`/api/restaurants/${restaurantId}/orders`, { params: { status, limit: 100, sortBy: "createdAt", sortOrder: "asc" } })
    )
  );
  return pages.flatMap((p) => (p?.items ?? []).map(normalizeOrder));
}

// PATCH /api/orders/:id/status
export async function updateOrderStatus(id, status, reason = null) {
  const body = reason ? { status, cancellationReason: reason } : { status };
  return normalizeOrder(await request(`/api/orders/${id}/status`, { method: "PATCH", body }));
}

// GET /api/orders/summary  -> { totalOrders, totalAmount, byStatus: { STATUS: { count, amount } } }
export const getOrderSummary = (filters = {}) => request("/api/orders/summary", { params: filters });

// GET /api/restaurants
export async function listRestaurants({ active } = {}) {
  const raw = await request("/api/restaurants", { params: { limit: 100, active } });
  return (raw?.items ?? []).map((r) => ({ id: String(r._id ?? r.id), name: r.name, address: r.address, active: r.active }));
}
