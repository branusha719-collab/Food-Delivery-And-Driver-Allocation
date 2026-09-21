import { useState } from "react";
import { adminApi } from "../api/admin.js";
import { useAsync } from "../lib/useAsync.js";
import { useTable } from "../components/useTable.js";
import DataTable from "../components/DataTable.jsx";
import NotConnected from "../components/NotConnected.jsx";
import { FEATURES } from "../config.js";
import { dateTime, endOfDayIso, startOfDayIso } from "../lib/format.js";

export default function AuditLogs() {
  const t = useTable({ sort: "at", dir: "desc" });
  const [q, setQ] = useState("");
  const p = { ...t.state, from: startOfDayIso(t.state.from), to: endOfDayIso(t.state.to) };
  const { data, loading, error } = useAsync(() => adminApi.audit(p), [JSON.stringify(p)]);

  // Columns follow the PRD: who, what, when, old value, new value, IP/device.
  const columns = [
    { key: "at", label: "When", sortable: true, render: (r) => dateTime(r.at) },
    { key: "actor", label: "Who", sortable: true },
    { key: "action", label: "What", sortable: true, render: (r) => String(r.action ?? "").replaceAll("_", " ").toLowerCase() },
    { key: "entity", label: "Record" },
    { key: "oldValue", label: "Old value", render: (r) => <code>{r.oldValue ?? "—"}</code> },
    { key: "newValue", label: "New value", render: (r) => <code>{r.newValue ?? "—"}</code> },
    { key: "ip", label: "IP / device", render: (r) => [r.ip, r.device].filter(Boolean).join(" · ") || "—" },
  ];

  return (
    <>
      <h1>Audit log</h1>
      {!FEATURES.audit && <NotConnected what="Audit entries" endpoint="GET /api/admin/audit-logs" flag="VITE_ENABLE_AUDIT" />}
      <form className="filters" onSubmit={(e) => { e.preventDefault(); t.setFilter("q", q); }} role="search">
        <label>Who or record<input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Email or order reference" /></label>
        <label>Action<input value={t.state.action ?? ""} onChange={(e) => t.setFilter("action", e.target.value)} placeholder="e.g. ORDER_STATUS_CHANGED" /></label>
        <label>From<input type="date" value={t.state.from ?? ""} onChange={(e) => t.setFilter("from", e.target.value)} /></label>
        <label>To<input type="date" value={t.state.to ?? ""} onChange={(e) => t.setFilter("to", e.target.value)} /></label>
        <button className="btn btn-primary">Search</button>
      </form>
      <DataTable columns={columns} rows={data?.items ?? []} total={data?.total ?? 0} page={t.state.page} pageSize={t.state.pageSize}
        sort={t.state.sort} dir={t.state.dir} onSort={t.toggleSort} onPage={t.setPage} loading={loading} error={error} empty="No audit entries yet." />
    </>
  );
}
