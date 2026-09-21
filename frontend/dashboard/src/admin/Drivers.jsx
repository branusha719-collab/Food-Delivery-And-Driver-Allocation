import { useState } from "react";
import { adminApi } from "../api/admin.js";
import { useAsync } from "../lib/useAsync.js";
import { useTable } from "../components/useTable.js";
import DataTable from "../components/DataTable.jsx";
import NotConnected from "../components/NotConnected.jsx";
import { FEATURES } from "../config.js";

const AVAIL = { ONLINE: "pill-ok", BUSY: "pill-warn", OFFLINE: "pill-off" };
const cap = (s = "") => s.charAt(0) + s.slice(1).toLowerCase();

export default function Drivers() {
  const t = useTable({ sort: "rating", dir: "desc" });
  const [q, setQ] = useState("");
  const [note, setNote] = useState(null);
  const p = { ...t.state };
  const { data, loading, error, reload } = useAsync(() => adminApi.drivers(p), [JSON.stringify(p)]);

  async function toggle(d) {
    try { await adminApi.setDriverApproval(d.id, !d.approved); setNote({ ok: true, text: `${d.name} ${d.approved ? "suspended" : "approved"}.` }); }
    catch (e) { setNote({ ok: false, text: e.message }); }
    reload();
  }

  const columns = [
    { key: "name", label: "Driver", sortable: true },
    { key: "phone", label: "Phone" },
    { key: "vehicle", label: "Vehicle", sortable: true, render: (d) => cap(d.vehicle) },
    { key: "rating", label: "Rating", sortable: true, render: (d) => Number(d.rating ?? 0).toFixed(1) },
    { key: "availability", label: "Availability", sortable: true, render: (d) => <span className={`pill ${AVAIL[d.availability] ?? "pill-off"}`}>{cap(d.availability)}</span> },
    { key: "activeOrders", label: "Active orders", sortable: true },
    { key: "deliveries", label: "Deliveries", sortable: true },
    { key: "approved", label: "Account", render: (d) => <span className={`pill ${d.approved ? "pill-ok" : "pill-bad"}`}>{d.approved ? "Approved" : "Not approved"}</span> },
    { key: "act", label: "Action", render: (d) => <button className="btn btn-ghost" onClick={() => toggle(d)}>{d.approved ? "Suspend" : "Approve"}</button> },
  ];

  return (
    <>
      <h1>Drivers</h1>
      {!FEATURES.drivers && <NotConnected what="Drivers" endpoint="GET /api/admin/drivers" flag="VITE_ENABLE_DRIVERS" />}
      <form className="filters" onSubmit={(e) => { e.preventDefault(); t.setFilter("q", q); }} role="search">
        <label>Search<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name or phone" /></label>
        <label>Availability<select value={t.state.availability ?? ""} onChange={(e) => t.setFilter("availability", e.target.value)}>
          <option value="">Any</option><option value="ONLINE">Online</option><option value="BUSY">Busy</option><option value="OFFLINE">Offline</option></select></label>
        <label>Vehicle<select value={t.state.vehicle ?? ""} onChange={(e) => t.setFilter("vehicle", e.target.value)}>
          <option value="">Any</option><option value="BIKE">Bike</option><option value="SCOOTER">Scooter</option><option value="CAR">Car</option></select></label>
        <button className="btn btn-primary">Search</button>
      </form>
      {note && <div className={note.ok ? "toast" : "alert"} role="status">{note.text}</div>}
      <DataTable columns={columns} rows={data?.items ?? []} total={data?.total ?? 0} page={t.state.page} pageSize={t.state.pageSize}
        sort={t.state.sort} dir={t.state.dir} onSort={t.toggleSort} onPage={t.setPage} loading={loading} error={error} empty="No drivers yet." />
    </>
  );
}
