import { useState } from "react";
import { listRestaurants } from "../api/orders.js";
import { useAsync } from "../lib/useAsync.js";

const OBJECT_ID = /^[a-f\d]{24}$/i;

export default function RestaurantPicker({ onSelect }) {
  const { data, loading, error, reload } = useAsync(() => listRestaurants({ active: "true" }), []);
  const [manualId, setManualId] = useState("");
  const [manualError, setManualError] = useState("");

  const useManual = (e) => {
    e.preventDefault();
    const id = manualId.trim();
    if (!OBJECT_ID.test(id)) { setManualError("A restaurant ID is 24 letters and numbers, for example 64b7f0f0f0f0f0f0f0f0f0f0."); return; }
    onSelect({ id, name: `Restaurant …${id.slice(-6)}` });
  };

  return (
    <div className="picker">
      <h1>Choose your restaurant</h1>
      <p className="muted">Orders for the restaurant you pick appear on the kitchen board. This choice is remembered on this device.</p>
      {loading && !data && <p className="muted">Loading restaurants…</p>}
      {error && <div className="alert" role="alert">{error.message} <button className="btn btn-ghost" onClick={reload}>Try again</button></div>}
      {data && !data.length && (
        <div className="notice" role="note"><strong>No restaurants yet.</strong> Restaurants appear here once they exist in the database. If you already know a restaurant's ID you can enter it below.</div>
      )}
      <ul className="picker-list">
        {(data ?? []).map((r) => (
          <li key={r.id}><button className="btn" onClick={() => onSelect({ id: r.id, name: r.name })}><strong>{r.name}</strong><span>{r.address}</span></button></li>
        ))}
      </ul>
      <form className="manual" onSubmit={useManual}>
        <label>Restaurant ID
          <input value={manualId} onChange={(e) => { setManualId(e.target.value); setManualError(""); }} placeholder="24-character ID" aria-describedby="manual-err" />
        </label>
        <button className="btn">Use this ID</button>
        {manualError && <div id="manual-err" className="alert" role="alert">{manualError}</div>}
      </form>
    </div>
  );
}
