import { request, setToken } from "./client.js";

// Backend contract (Role 6):
//   POST /api/auth/login { email, password }
//     -> data: { token, user: { id, name, email, role: "customer"|"driver"|"admin"|"restaurant", restaurantId } }
// Tokens are stateless JWTs and there is no logout endpoint, so signing out just discards the token.
export async function login({ email, password }) {
  const data = await request("/api/auth/login", { method: "POST", body: { email, password } });
  setToken(data.token);
  return data;
}
export function logout() {
  setToken(null);
}
