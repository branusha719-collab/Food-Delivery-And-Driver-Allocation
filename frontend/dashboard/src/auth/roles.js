// Backend roles are lowercase: customer, driver, admin, restaurant.
export const normalizeUser = (u) => (u ? { ...u, role: String(u.role || "").toLowerCase(), restaurantId: u.restaurantId || null } : null);

// Where each role lands after signing in.
export const homeFor = (user) => (user?.role === "admin" ? "/admin" : "/restaurant");
