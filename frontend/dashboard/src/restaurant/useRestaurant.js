import { useCallback, useState } from "react";
import { useAuth } from "../auth/AuthContext.jsx";
import { FEATURES } from "../config.js";
import { listRestaurants } from "../api/orders.js";
import { useAsync } from "../lib/useAsync.js";

const KEY = "fd.restaurant";
const read = () => { try { return JSON.parse(localStorage.getItem(KEY)); } catch { return null; } };

// Which restaurant this screen works for.
// Auth on: fixed by the signed-in restaurant account (user.restaurantId).
// Auth off: the person picks one and it is remembered on this device.
export function useRestaurant() {
  const { user } = useAuth();
  const [picked, setPicked] = useState(read);
  const lockedId = FEATURES.auth ? user?.restaurantId : null;
  // Public list; used only to show the restaurant's name for a locked account.
  const names = useAsync(() => (lockedId ? listRestaurants() : Promise.resolve([])), [lockedId]);

  const select = useCallback((r) => {
    try { localStorage.setItem(KEY, JSON.stringify(r)); } catch { /* ignore */ }
    setPicked(r);
  }, []);
  const clear = useCallback(() => {
    try { localStorage.removeItem(KEY); } catch { /* ignore */ }
    setPicked(null);
  }, []);

  if (FEATURES.auth) {
    if (!lockedId) return { restaurant: picked, select, clear, locked: false, unlinked: false };
    const name = (names.data ?? []).find((r) => r.id === lockedId)?.name;
    // Allow user to switch restaurants for demo purposes
    return { restaurant: picked || { id: lockedId, name: name || "Your restaurant" }, select, clear, locked: false, unlinked: false };
  }
  return { restaurant: picked, select, clear, locked: false, unlinked: false };
}
