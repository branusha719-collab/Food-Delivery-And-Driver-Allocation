import { useState } from "react";
import { adminApi } from "../api/admin.js";
import { useAsync } from "../lib/useAsync.js";
import { useTable } from "../components/useTable.js";
import DataTable from "../components/DataTable.jsx";
import NotConnected from "../components/NotConnected.jsx";
import { FEATURES } from "../config.js";
import { dateTime } from "../lib/format.js";

export default function Users() {
  const t = useTable({ sort: "createdAt", dir: "desc" });
  const [q, setQ] = useState("");
  const [note, setNote] = useState(null);
  const p = { ...t.state };
  const { data, loading, error, reload } = useAsync(() => adminApi.users(p), [JSON.stringify(p)]);

  async function toggle(u) {
    const next = u.status === "BLOCKED" ? "ACTIVE" : "BLOCKED";
    if (next === "BLOCKED" && !window.confirm(`Block ${u.name}? They won't be able to sign in.`)) return;
    try { await adminApi.setUserStatus(u.id, next); setNote({ ok: true, text: `${u.name} is now ${next.toLowerCase()}.` }); }
    catch (e) { setNote({ ok: false, text: e.message }); }
    reload();
  }

  const columns = [
    { key: "name", label: "Name", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "phone", label: "Phone" },
    { key: "role", label: "Role", sortable: true },
    { key: "status", label: "Status", sortable: true, render: (u) => <span className={`pill ${u.status === "BLOCKED" ? "pill-bad" : "pill-ok"}`}>{u.status === "BLOCKED" ? "Blocked" : "Active"}</span> },
    { key: "createdAt", label: "Joined", sortable: true, render: (u) => dateTime(u.createdAt) },
    { key: "act", label: "Action", render: (u) => <button className="btn btn-ghost" onClick={() => toggle(u)}>{u.status === "BLOCKED" ? "Unblock" : "Block"}</button> },
  ];

  return (
    <>
      <h1>Users</h1>
      {!FEATURES.users && <NotConnected what="Users" endpoint="GET /api/admin/users" flag="VITE_ENABLE_USERS" />}
      <form className="filters" onSubmit={(e) => { e.preventDefault(); t.setFilter("q", q); }} role="search">
        <label>Search<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, email or phone" /></label>
        <label>Role<select value={t.state.role ?? ""} onChange={(e) => t.setFilter("role", e.target.value)}>
          <option value="">All roles</option><option value="CUSTOMER">Customer</option><option value="RESTAURANT">Restaurant</option><option value="DRIVER">Driver</option><option value="ADMIN">Admin</option></select></label>
        <label>Status<select value={t.state.status ?? ""} onChange={(e) => t.setFilter("status", e.target.value)}>
          <option value="">Any status</option><option value="ACTIVE">Active</option><option value="BLOCKED">Blocked</option></select></label>
        <button className="btn btn-primary">Search</button>
      </form>
      {note && <div className={note.ok ? "toast" : "alert"} role="status">{note.text}</div>}
      <DataTable columns={columns} rows={data?.items ?? []} total={data?.total ?? 0} page={t.state.page} pageSize={t.state.pageSize}
        sort={t.state.sort} dir={t.state.dir} onSort={t.toggleSort} onPage={t.setPage} loading={loading} error={error} empty="No users yet." />
    </>
  );
}
