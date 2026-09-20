import { describe, expect, test } from "vitest";
import { money, toCsv, startOfDayIso, endOfDayIso } from "../src/lib/format.js";
import { RESTAURANT_ACTIONS, STATUS } from "../src/lib/status.js";
import { normalizeOrder } from "../src/api/orders.js";
import { toPage, emptyPage, listParams } from "../src/api/client.js";

describe("money (paise -> rupees)", () => {
  test("formats whole and fractional rupees", () => {
    expect(money(80300)).toContain("803");
    expect(money(80350)).toContain("803.50");
    expect(money(undefined)).toContain("0");
  });
});

describe("restaurant transitions", () => {
  test("only offers the transitions the restaurant role owns", () => {
    expect(RESTAURANT_ACTIONS[STATUS.PLACED].map((a) => a.to)).toEqual([STATUS.ACCEPTED, STATUS.REJECTED]);
    expect(RESTAURANT_ACTIONS[STATUS.ACCEPTED].map((a) => a.to)).toEqual([STATUS.PREPARING]);
    expect(RESTAURANT_ACTIONS[STATUS.PREPARING].map((a) => a.to)).toEqual([STATUS.READY]);
    expect(RESTAURANT_ACTIONS[STATUS.READY]).toBeUndefined();
    expect(RESTAURANT_ACTIONS[STATUS.DELIVERED]).toBeUndefined();
  });
  test("rejecting requires confirmation", () => {
    expect(RESTAURANT_ACTIONS[STATUS.PLACED].find((a) => a.to === STATUS.REJECTED).confirm).toBe(true);
  });
});

describe("normalizeOrder (backend shape)", () => {
  const raw = {
    _id: "6aaf9c26cc9f185a78036c99", customerId: "customer-101", driverId: null, status: "PLACED",
    restaurantId: { _id: "r1", name: "Spice" }, deliveryAddress: "Flat 301", subtotal: 76300, deliveryFee: 4000, totalAmount: 80300,
    items: [{ menuItemId: "m1", itemNameSnapshot: "Biryani", unitPrice: 34900, quantity: 2, subtotal: 69800 }],
    createdAt: "2026-09-20T08:41:10.748Z",
  };
  test("maps ids, items and populated restaurant", () => {
    const o = normalizeOrder(raw);
    expect(o.id).toBe("6aaf9c26cc9f185a78036c99");
    expect(o.ref).toBe("036C99");
    expect(o.items[0]).toMatchObject({ name: "Biryani", quantity: 2 });
    expect(o.restaurantName).toBe("Spice");
    expect(o.totalAmount).toBe(80300);
  });
  test("handles an unpopulated restaurant id and missing items", () => {
    const o = normalizeOrder({ ...raw, restaurantId: "abc", items: undefined });
    expect(o.restaurantId).toBe("abc");
    expect(o.items).toEqual([]);
  });
});

describe("pagination helpers", () => {
  test("reads the backend pagination envelope", () => {
    const p = toPage({ items: [{ a: 1 }], pagination: { totalItems: 42 } }, 2, 10);
    expect(p).toEqual({ items: [{ a: 1 }], total: 42, page: 2, pageSize: 10 });
  });
  test("empty page and query mapping", () => {
    expect(emptyPage()).toEqual({ items: [], total: 0, page: 1, pageSize: 10 });
    expect(listParams({ page: 2, pageSize: 25, sort: "createdAt", dir: "asc" })).toEqual({ page: 2, limit: 25, sortBy: "createdAt", sortOrder: "asc" });
    expect(listParams({ page: 1, pageSize: 10, sort: "", dir: "asc" }).sortBy).toBeUndefined();
  });
});

describe("csv + dates", () => {
  test("escapes quotes and neutralises spreadsheet formulas", () => {
    const csv = toCsv([{ n: 'a "b"', f: "=SUM(A1)" }], [{ key: "n", label: "N" }, { key: "f", label: "F" }]);
    expect(csv).toContain('"a ""b"""');
    expect(csv).toContain("\"'=SUM(A1)\"");
  });
  test("day boundaries are ordered and empty-safe", () => {
    expect(new Date(startOfDayIso("2026-09-20")) < new Date(endOfDayIso("2026-09-20"))).toBe(true);
    expect(startOfDayIso("")).toBeUndefined();
  });
});

import { normalizeUser, homeFor } from "../src/auth/roles.js";
describe("auth roles (backend uses lowercase)", () => {
  test("normalizes the user and routes by role", () => {
    const u = normalizeUser({ id: "1", name: "K", role: "Restaurant", restaurantId: "r1" });
    expect(u.role).toBe("restaurant");
    expect(homeFor(u)).toBe("/restaurant");
    expect(homeFor({ role: "admin" })).toBe("/admin");
    expect(normalizeUser(null)).toBeNull();
    expect(normalizeUser({ role: "admin" }).restaurantId).toBeNull();
  });
});
