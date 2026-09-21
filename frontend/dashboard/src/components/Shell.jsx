import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../auth/AuthContext.jsx";
import { FEATURES } from "../config.js";

export default function Shell({ title, nav, children, right }) {
  const { user, logout } = useAuth();
  return (
    <>
      <a className="skip" href="#main">Skip to content</a>
      <header className="topbar">
        <div className="brand">{title}</div>
        {nav && (
          <nav aria-label="Sections" className="tabs">
            {nav.map((n) => (
              <NavLink key={n.to} to={n.to} end={n.end} className={({ isActive }) => (isActive ? "tab active" : "tab")}>{n.label}</NavLink>
            ))}
          </nav>
        )}
        <div className="who">
          {right}
          {FEATURES.auth ? (
            <>
              <span>{user?.name}</span>
              <button className="btn btn-ghost" onClick={logout}>Sign out</button>
            </>
          ) : (
            <Link className="btn btn-ghost link-btn" to="/">Switch portal</Link>
          )}
        </div>
      </header>
      {!FEATURES.auth && (
        <p className="open-banner" role="note">Sign-in isn't connected yet, so anyone with this link can open this console.</p>
      )}
      <main id="main" className="page">{children}</main>
    </>
  );
}
