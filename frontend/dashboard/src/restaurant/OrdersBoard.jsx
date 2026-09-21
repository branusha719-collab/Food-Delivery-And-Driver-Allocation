import { useMemo, useState, useEffect } from "react";
import { useAsync } from "../lib/useAsync.js";
import { listActiveRestaurantOrders, listRestaurantOrders, updateOrderStatus } from "../api/orders.js";
import { STATUS, STATUS_LABEL } from "../lib/status.js";
import { dateTime, money } from "../lib/format.js";
import { useTable } from "../components/useTable.js";
import DataTable from "../components/DataTable.jsx";
import StatusBadge from "../components/StatusBadge.jsx";
import OrderTicket from "./OrderTicket.jsx";
import RestaurantPicker from "./RestaurantPicker.jsx";
import { useRestaurant } from "./useRestaurant.js";
import Shell from "../components/Shell.jsx";

const COLUMNS = [
  { key: "new", title: "New", statuses: [STATUS.PLACED] },
  { key: "accepted", title: "Accepted", statuses: [STATUS.ACCEPTED] },
  { key: "preparing", title: "Preparing", statuses: [STATUS.PREPARING] },
  { key: "ready", title: "Ready & with drivers", statuses: [STATUS.READY, STATUS.DRIVER_ASSIGNED, STATUS.PICKED_UP] },
];

export default function OrdersBoard() {
  const { restaurant, select, clear, locked, unlinked } = useRestaurant();
  const switcher = restaurant && !locked ? <button className="btn btn-ghost" onClick={clear}>Switch restaurant</button> : null;

  return (
    <Shell title={restaurant ? restaurant.name : "Kitchen"} right={switcher}>
      {unlinked ? (
        <div className="notice" role="note"><strong>Your account isn't linked to a restaurant yet.</strong> Ask an administrator to link it, then sign in again.</div>
      ) : restaurant ? <Board restaurant={restaurant} /> : <RestaurantPicker onSelect={select} />}
    </Shell>
  );
}

function Board({ restaurant }) {
  const [view, setView] = useState("active");
  const [pending, setPending] = useState(null);
  const [message, setMessage] = useState(null);
  const { data, loading, error, reload, refresh } = useAsync(() => listActiveRestaurantOrders(restaurant.id), [restaurant.id], { interval: 10000 });
  const orders = data ?? [];
  const grouped = useMemo(() => COLUMNS.map((c) => ({ ...c, orders: orders.filter((o) => c.statuses.includes(o.status)) })), [orders]);

  useEffect(() => {
    // Assuming backend runs on 5000 in dev
    const socketUrl = import.meta.env.VITE_API_URL ? import.meta.env.VITE_API_URL.replace('/api', '') : 'http://localhost:5000';
    import('socket.io-client').then(({ io }) => {
      const socket = io(socketUrl);
      
      socket.on('connect', () => {
        console.log('OrdersBoard connected to WebSockets');
      });

      socket.on('order_created', (order) => {
        if (order.restaurantId === restaurant.id || order.restaurantId?._id === restaurant.id) {
          console.log('New order received!', order);
          refresh();
        }
      });

      socket.on('order_updated', (order) => {
        if (order.restaurantId === restaurant.id || order.restaurantId?._id === restaurant.id) {
          console.log('Order updated:', order);
          refresh();
        }
      });

      return () => {
        socket.disconnect();
      };
    });
  }, [restaurant.id, refresh]);

  async function act(order, to) {
    setPending(order.id); setMessage(null);
    try {
      await updateOrderStatus(order.id, to);
      setMessage({ ok: true, text: `Order #${order.ref} is now ${STATUS_LABEL[to].toLowerCase()}.` });
    } catch (e) {
      setMessage({ ok: false, text: `Order #${order.ref} wasn't updated. ${e.message}` });
    } finally {
      setPending(null); refresh();
    }
  }

  return (
    <>
      <div className="board-head">
        <div>
          <h1>Orders</h1>
          <p className="muted">{grouped[0].orders.length} waiting for your decision. Updates every 10 seconds.</p>
        </div>
        <div className="seg" role="group" aria-label="Order view">
          <button className={view === "active" ? "on" : ""} aria-pressed={view === "active"} onClick={() => setView("active")}>Active</button>
          <button className={view === "history" ? "on" : ""} aria-pressed={view === "history"} onClick={() => setView("history")}>History</button>
          <button className="btn-ghost" onClick={reload}>Refresh</button>
        </div>
      </div>

      <div aria-live="polite" className="live">
        {message && <div className={message.ok ? "toast" : "alert"} role={message.ok ? "status" : "alert"}>{message.text}</div>}
        {error && (
          <div className="alert" role="alert">
            {error.errorCode === "RESTAURANT_NOT_FOUND" ? "This restaurant no longer exists. Switch to another restaurant." : `Couldn't refresh orders. ${error.message}`}
          </div>
        )}
      </div>

      {view === "active" ? (
        <>
          {loading && !data && <p className="muted">Loading orders…</p>}
          {data && !orders.length && <p className="empty-board">No active orders right now. New orders appear here automatically.</p>}
          <div className="board">
            {grouped.map((c) => (
              <section key={c.key} className="lane" aria-label={c.title}>
                <h2>{c.title} <span className="count">{c.orders.length}</span></h2>
                {c.orders.map((o) => <OrderTicket key={o.id} order={o} busy={pending === o.id} onAct={act} />)}
                {!c.orders.length && !loading && <p className="lane-empty">No orders here.</p>}
              </section>
            ))}
          </div>
        </>
      ) : (
        <History restaurantId={restaurant.id} />
      )}
    </>
  );
}

function History({ restaurantId }) {
  const t = useTable({ sort: "createdAt", dir: "desc", status: STATUS.DELIVERED });
  const p = { ...t.state };
  const { data, loading, error } = useAsync(
    () => listRestaurantOrders(restaurantId, { table: t.state, filters: { status: t.state.status } }),
    [restaurantId, JSON.stringify(p)]
  );
  const columns = [
    { key: "ref", label: "Order", render: (o) => `#${o.ref}` },
    { key: "createdAt", label: "Placed", sortable: true, render: (o) => dateTime(o.createdAt) },
    { key: "items", label: "Items", render: (o) => o.items.map((i) => `${i.quantity}× ${i.name}`).join(", ") },
    { key: "totalAmount", label: "Amount", sortable: true, render: (o) => money(o.totalAmount) },
    { key: "status", label: "Status", render: (o) => <StatusBadge status={o.status} /> },
  ];
  return (
    <>
      <form className="filters" onSubmit={(e) => e.preventDefault()}>
        <label>Show
          <select value={t.state.status} onChange={(e) => t.setFilter("status", e.target.value)}>
            <option value={STATUS.DELIVERED}>Delivered orders</option>
            <option value={STATUS.REJECTED}>Rejected orders</option>
          </select>
        </label>
      </form>
      <DataTable columns={columns} rows={data?.items ?? []} total={data?.total ?? 0} page={t.state.page} pageSize={t.state.pageSize}
        sort={t.state.sort} dir={t.state.dir} onSort={t.toggleSort} onPage={t.setPage} loading={loading} error={error}
        empty={t.state.status === STATUS.REJECTED ? "No rejected orders." : "No delivered orders yet."} />
    </>
  );
}
