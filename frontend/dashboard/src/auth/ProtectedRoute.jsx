import { Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { FEATURES } from "../config.js";

// Role gate for the UI. The backend must enforce the same rule on every endpoint.
// With auth switched off (VITE_ENABLE_AUTH=false) the routes are open.
export default function ProtectedRoute({ role, children }) {
  const { user, logout } = useAuth();
  if (!FEATURES.auth) return children;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== role) {
    return (
      <main className="center-page">
        <h1>You don't have access to this area</h1>
        <p>You're signed in as {user.role}. This section is for {role} accounts.</p>
        <button className="btn" onClick={logout}>Sign in with a different account</button>
      </main>
    );
  }
  return children;
}
