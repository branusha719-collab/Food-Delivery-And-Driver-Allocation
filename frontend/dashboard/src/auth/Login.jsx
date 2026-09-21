import { useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext.jsx";
import { FEATURES } from "../config.js";
import { homeFor } from "./roles.js";


export default function Login() {
  const { user, login, notice } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (!FEATURES.auth) return <Navigate to="/" replace />;
  if (user) return <Navigate to={homeFor(user)} replace />;

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try { nav(homeFor(await login(form)), { replace: true }); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  };

  return (
    <main className="center-page">
      <form className="login" onSubmit={submit}>
        <h1>Sign in</h1>
        <p className="muted">Use your restaurant or admin account.</p>
        <label>Email<input type="email" required autoComplete="username" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" required autoComplete="current-password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        {notice && !error && <div className="notice" role="status">{notice}</div>}
        {error && <div className="alert" role="alert">{error}</div>}
        <button className="btn btn-primary" disabled={busy}>{busy ? "Signing in…" : "Sign in"}</button>
      </form>
    </main>
  );
}
