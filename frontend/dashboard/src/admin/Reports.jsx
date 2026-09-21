import { getOrderSummary, listOrders, listRestaurants } from "../api/orders.js";
import { useAsync } from "../lib/useAsync.js";
import { useTable } from "../components/useTable.js";
import DataTable from "../components/DataTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import { ALL_STATUSES, STATUS, STATUS_LABEL } from "../lib/status.js";
import { dateTime, endOfDayIso, money, startOfDayIso, toCsv, download } from "../lib/format.js";
import { useState } from "react";

const COLUMNS = [
  { key: "ref", label: "Order", render: (o) => `#${o.ref}`, csv: (o) => o.id },
  { key: "createdAt", label: "Placed", sortable: true, render: (o) => dateTime(o.createdAt), csv: (o) => o.createdAt },
  { key: "restaurantName", label: "Restaurant" },
  { key: "customerId", label: "Customer" },
  { key: "driverId", label: "Driver", render: (o) => o.driverId ?? "—", csv: (o) => o.driverId ?? "" },
  { key: "status", label: "Status", sortable: true, render: (o) => <StatusBadge status={o.status} />, csv: (o) => STATUS_LABEL[o.status] },
  { key: "totalAmount", label: "Amount", sortable: true, render: (o) => money(o.totalAmount), csv: (o) => (o.totalAmount / 100).toFixed(2) },
];
const EXPORT_PAGE = 100;
const EXPORT_MAX_PAGES = 50; // 5,000 orders

export default function Reports() {
  const t = useTable({ sort: "createdAt", dir: "desc" });
  const [exporting, setExporting] = useState(false);
  const [exportNote, setExportNote] = useState(null);

  // Same filters drive the table, the summary and the CSV, so they always reconcile.
  const filters = { status: t.state.status, restaurantId: t.state.restaurantId, from: startOfDayIso(t.state.from), to: endOfDayIso(t.state.to) };
  const key = JSON.stringify([t.state, filters]);
  const orders = useAsync(() => listOrders({ table: t.state, filters }), [key]);
  const summary = useAsync(() => getOrderSummary(filters), [JSON.stringify(filters)]);
  const restaurants = useAsync(() => listRestaurants(), []);

  async function exportCsv() {
    setExporting(true); setExportNote(null);
    try {
      let rows = []; let page = 1; let totalPages = 1;
      do {
        const res = await listOrders({ table: { page, pageSize: EXPORT_PAGE, sort: t.state.sort, dir: t.state.dir }, filters });
        rows = rows.concat(res.items);
        totalPages = Math.ceil(res.total / EXPORT_PAGE);
        page += 1;
      } while (page <= totalPages && page <= EXPORT_MAX_PAGES);
      download("orders-report.csv", toCsv(rows, COLUMNS));
      setExportNote({ ok: true, text: page <= totalPages ? `Downloaded the first ${rows.length} orders. Narrow the filters to export the rest.` : `Downloaded ${rows.length} orders.` });
    } catch (e) {
      setExportNote({ ok: false, text: `Couldn't create the CSV. ${e.message}` });
    } finally { setExporting(false); }
  }

  const s = summary.data;
  return (
    <>
      <h1>Order reports</h1>
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <label>From<input type="date" value={t.state.from ?? ""} max={t.state.to || undefined} onChange={(e) => t.setFilter("from", e.target.value)} /></label>
        <label>To<input type="date" value={t.state.to ?? ""} min={t.state.from || undefined} onChange={(e) => t.setFilter("to", e.target.value)} /></label>
        <label>Restaurant<select value={t.state.restaurantId ?? ""} onChange={(e) => t.setFilter("restaurantId", e.target.value)}>
          <option value="">All restaurants</option>{(restaurants.data ?? []).map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}</select></label>
        <label>Status<select value={t.state.status ?? ""} onChange={(e) => t.setFilter("status", e.target.value)}>
          <option value="">All statuses</option>{ALL_STATUSES.map((st) => <option key={st} value={st}>{STATUS_LABEL[st]}</option>)}</select></label>
        <button type="button" className="btn btn-primary" onClick={exportCsv} disabled={exporting || !orders.data?.total}>{exporting ? "Preparing CSV…" : "Download CSV"}</button>
      </form>
      {exportNote && <div className={exportNote.ok ? "toast" : "alert"} role="status">{exportNote.text}</div>}
      {s && (
        <p className="summary" aria-live="polite">
          <strong>{s.totalOrders}</strong> order{s.totalOrders === 1 ? "" : "s"} match these filters, worth <strong>{money(s.totalAmount)}</strong>
          {s.byStatus?.[STATUS.DELIVERED]?.count > 0 && <> ({money(s.byStatus[STATUS.DELIVERED].amount)} from delivered orders)</>}. The table and CSV use the same filters.
        </p>
      )}
      <DataTable columns={COLUMNS} rows={orders.data?.items ?? []} total={orders.data?.total ?? 0} page={t.state.page} pageSize={t.state.pageSize}
        sort={t.state.sort} dir={t.state.dir} onSort={t.toggleSort} onPage={t.setPage} loading={orders.loading} error={orders.error}
        empty="No orders match these filters." />
    </>
  );
}
