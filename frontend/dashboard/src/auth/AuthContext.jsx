import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { login as apiLogin, logout as apiLogout } from "../api/auth.js";
import { setToken, setUnauthorizedHandler } from "../api/client.js";
import { normalizeUser } from "./roles.js";

// With VITE_ENABLE_AUTH=false, user is always null and routes are open.
const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx);

const KEY = "fd-console-session";
const load = () => { try { return JSON.parse(sessionStorage.getItem(KEY)); } catch { return null; } };
const save = (v) => { try { v ? sessionStorage.setItem(KEY, JSON.stringify(v)) : sessionStorage.removeItem(KEY); } catch { /* storage unavailable */ } };

export function AuthProvider({ children }) {
  const [session, setSession] = useState(() => {
    const s = load();
    if (s?.token) setToken(s.token);
    return s;
  });
  const [notice, setNotice] = useState("");

  const login = useCallback(async (creds) => {
    const data = await apiLogin(creds);
    const next = { token: data.token, user: normalizeUser(data.user) };
    save(next); setNotice(""); setSession(next);
    return next.user;
  }, []);

  const logout = useCallback(() => {
    apiLogout(); save(null); setSession(null);
  }, []);

  // Expired or invalid token: sign out and explain why on the sign-in screen.
  useEffect(() => {
    setUnauthorizedHandler(() => { apiLogout(); save(null); setSession(null); setNotice("Your session ended. Please sign in again."); });
    return () => setUnauthorizedHandler(null);
  }, []);

  const value = useMemo(() => ({ user: session?.user ?? null, login, logout, notice }), [session, login, logout, notice]);
  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
}
