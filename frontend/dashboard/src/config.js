const flag = (v) => String(v) === "true";

// Empty string = same origin (dev proxy / reverse proxy). Otherwise the backend's public URL.
export const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");

// Features the backend doesn't have yet. When false the screen renders empty and makes no request.
export const FEATURES = {
  auth: flag(import.meta.env.VITE_ENABLE_AUTH),
  users: flag(import.meta.env.VITE_ENABLE_USERS),
  drivers: flag(import.meta.env.VITE_ENABLE_DRIVERS),
  audit: flag(import.meta.env.VITE_ENABLE_AUDIT),
};
