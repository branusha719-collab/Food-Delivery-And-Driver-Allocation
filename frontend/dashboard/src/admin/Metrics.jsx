import { getOrderSummary } from "../api/orders.js";
import { useAsync } from "../lib/useAsync.js";
import { ALL_STATUSES, IN_PROGRESS, STATUS, STATUS_LABEL } from "../lib/status.js";
import { money } from "../lib/format.js";

export default function Metrics() {
  const { data: m, loading, error, reload } = useAsync(() => getOrderSummary(), [], { interval: 30000 });
  if (error && !m) return <div className="alert" role="alert">{error.message} <button className="btn btn-ghost" onClick={reload}>Try again</button></div>;
  if (loading && !m) return <p className="muted">Loading overview…</p>;

  const count = (s) => m.byStatus?.[s]?.count ?? 0;
  const inProgress = IN_PROGRESS.reduce((n, s) => n + count(s), 0);
  const max = Math.max(1, ...ALL_STATUSES.map(count));

  return (
    <>
      <h1>Overview</h1>
      {m.totalOrders === 0 && <p className="muted">No orders have been placed yet. Figures appear here as orders come in.</p>}
      <dl className="stats">
        <div><dt>Orders placed</dt><dd>{m.totalOrders}</dd></div>
        <div><dt>In progress</dt><dd>{inProgress}</dd></div>
        <div><dt>Delivered</dt><dd>{count(STATUS.DELIVERED)}</dd></div>
        <div><dt>Rejected</dt><dd>{count(STATUS.REJECTED)}</dd></div>
        <div><dt>Revenue from delivered orders</dt><dd>{money(m.byStatus?.[STATUS.DELIVERED]?.amount)}</dd></div>
      </dl>

      <section aria-labelledby="funnel">
        <h2 id="funnel">Orders by stage</h2>
        <ol className="funnel">
          {ALL_STATUSES.map((s) => (
            <li key={s}>
              <span className="f-label">{STATUS_LABEL[s]}</span>
              <span className="f-bar"><span style={{ width: `${(count(s) / max) * 100}%` }} className={`fill fill-${s.toLowerCase()}`} /></span>
              <span className="f-val">{count(s)}</span>
            </li>
          ))}
        </ol>
      </section>
    </>
  );
}
