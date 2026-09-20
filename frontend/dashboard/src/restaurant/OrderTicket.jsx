import { useState } from "react";
import StatusBadge from "../components/StatusBadge.jsx";
import { RESTAURANT_ACTIONS, STATUS } from "../lib/status.js";
import { minutesSince, money } from "../lib/format.js";

export default function OrderTicket({ order, onAct, busy, readOnly }) {
  const [confirming, setConfirming] = useState(null);
  const actions = readOnly ? [] : RESTAURANT_ACTIONS[order.status] ?? [];
  const age = order.createdAt ? minutesSince(order.createdAt) : 0;
  const late = order.status === STATUS.PLACED && age >= 5;

  return (
    <article className={`ticket ${late ? "ticket-late" : ""}`} aria-label={`Order ${order.ref}`}>
      <header>
        <h3 className="ticket-no">#{order.ref}</h3>
        <span className={late ? "age age-late" : "age"}>{late ? `Waiting ${age} min` : `${age} min ago`}</span>
      </header>
      <p className="customer">Customer {order.customerId}</p>
      <ul className="lines">
        {order.items.map((i, k) => <li key={k}><span className="qty">{i.quantity}×</span> {i.name}</li>)}
      </ul>
      {order.deliveryAddress && <p className="address">{order.deliveryAddress}</p>}
      <footer>
        <span className="total">{money(order.totalAmount)}</span>
        {!actions.length && <StatusBadge status={order.status} />}
      </footer>

      {actions.length > 0 && !confirming && (
        <div className="actions">
          {actions.map((a) => (
            <button key={a.to} className={`btn btn-${a.tone}`} disabled={busy}
              onClick={() => (a.confirm ? setConfirming(a) : onAct(order, a.to))}>{a.label}</button>
          ))}
        </div>
      )}
      {confirming && (
        <div className="reject">
          <p className="confirm-text">Reject order #{order.ref}? This can't be undone and the customer's order will be cancelled.</p>
          <div className="actions two">
            <button className="btn btn-danger" disabled={busy} onClick={() => onAct(order, confirming.to)}>Yes, reject order</button>
            <button className="btn btn-ghost" onClick={() => setConfirming(null)}>Keep order</button>
          </div>
        </div>
      )}
    </article>
  );
}
