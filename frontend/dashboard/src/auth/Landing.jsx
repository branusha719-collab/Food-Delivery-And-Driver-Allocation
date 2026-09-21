import { Link, Navigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { FEATURES } from "../config.js";
import { homeFor } from "./roles.js";

export default function Landing() {
  const { user } = useAuth();
  if (FEATURES.auth) return <Navigate to={user ? homeFor(user) : "/login"} replace />;
  return (
    <main className="center-page">
      <h1>Kitchen &amp; admin console</h1>
      <p className="muted">Choose where you're working.</p>
      <div className="portal-links">
        <Link className="portal" to="/restaurant"><strong>Restaurant portal</strong><span>Accept, prepare and hand over incoming orders.</span></Link>
        <Link className="portal" to="/admin"><strong>Admin console</strong><span>Order overview and reports, plus users, drivers and the audit log.</span></Link>
      </div>
    </main>
  );
}
