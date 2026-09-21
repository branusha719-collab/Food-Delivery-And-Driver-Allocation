import { useMemo, useState } from "react";
import { request } from "../api/client.js";
import { useAsync } from "../lib/useAsync.js";
import { listActiveRestaurantOrders, updateOrderStatus } from "../api/orders.js"; // Wait, we'll need listDriverOrders
import { STATUS, STATUS_LABEL } from "../lib/status.js";
import { dateTime, money } from "../lib/format.js";
import Shell from "../components/Shell.jsx";
import { useAuth } from "../auth/AuthContext.jsx";
import { io } from "socket.io-client";
import { useEffect } from "react";

const COLUMNS = [
  { key: "available", title: "Ready for Pickup", statuses: [STATUS.READY, STATUS.DRIVER_ASSIGNED] },
  { key: "active", title: "Active Deliveries", statuses: [STATUS.PICKED_UP] },
];

export default function DriverDashboard() {
  const { user } = useAuth();
  const driverId = user?.driverId || "drv-test-1"; // Fallback for testing if driverId is missing

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch initial orders - fetch everything that is ready or active
    const fetchOrders = async () => {
      try {
        const data = await request(`/api/orders?limit=100`);
        setOrders(data.items.filter(o => [STATUS.READY, STATUS.DRIVER_ASSIGNED, STATUS.PICKED_UP].includes(o.status)));
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrders();

    // Setup Socket.IO for real-time notifications
    const socket = io("http://localhost:5000");
    
    socket.on("connect", () => {
      console.log("Driver connected to WebSocket server");
      socket.emit("join_driver", driverId);
    });

    // Listen for new assignments specifically for this driver
    socket.on(`new_assignment`, (order) => {
      // In a real app, we'd check if order.driverId === driverId, but the room driver_${driverId} ensures this.
      console.log("New assignment received!", order);
      
      // Add or update order in state
      setOrders(prev => {
        const existing = prev.findIndex(o => o._id === order._id);
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = order;
          return next;
        }
        return [order, ...prev];
      });
      
      // Play a sound or show a browser notification here
      if (Notification.permission === "granted") {
        new Notification("New Delivery Assignment!", {
          body: `Order #${order._id.substring(0, 8)} is ready for pickup.`
        });
      }
    });
    
    socket.on("order_updated", (order) => {
      setOrders(prev => {
        const existing = prev.findIndex(o => o._id === order._id);
        if (existing >= 0) {
          const next = [...prev];
          if (order.status === STATUS.DELIVERED || order.status === STATUS.CANCELLED) {
            return next.filter(o => o._id !== order._id); // Remove finished orders
          }
          next[existing] = order;
          return next;
        }
        return prev;
      });
    });

    return () => socket.disconnect();
  }, [driverId]);

  const requestNotificationPermission = () => {
    if (Notification.permission !== "granted" && Notification.permission !== "denied") {
      Notification.requestPermission();
    }
  };

  const handleUpdateStatus = async (orderId, currentStatus) => {
    let nextStatus = "";
    if (currentStatus === STATUS.READY || currentStatus === STATUS.DRIVER_ASSIGNED) nextStatus = STATUS.PICKED_UP;
    else if (currentStatus === STATUS.PICKED_UP) nextStatus = STATUS.DELIVERED;
    else return;

    try {
      await updateOrderStatus(orderId, nextStatus);
    } catch (err) {
      alert("Failed to update status: " + err.message);
    }
  };

  const grouped = useMemo(() => COLUMNS.map((c) => ({ ...c, orders: orders.filter((o) => c.statuses.includes(o.status)) })), [orders]);

  return (
    <Shell title="Driver Dashboard" right={<button className="btn btn-ghost" onClick={requestNotificationPermission}>Enable Notifications</button>}>
      {loading ? (
        <p>Loading assignments...</p>
      ) : error ? (
        <div className="alert">{error}</div>
      ) : (
        <div className="board">
          {grouped.map((col) => (
            <div key={col.key} className="board-col lane">
              <div className="board-col-header lane h2">
                <h2>{col.title}</h2>
                <span className="count">{col.orders.length}</span>
              </div>
              {col.orders.length === 0 ? (
                <div className="lane-empty">No orders here.</div>
              ) : (
                <div className="board-col-cards">
                  {col.orders.map((order) => (
                    <div key={order._id} className="ticket">
                      <div className="ticket-header">
                        <h3 className="ticket-no">#{order._id.substring(0, 8).toUpperCase()}</h3>
                      </div>
                      <div className="ticket-meta lines">
                        <div className="meta-label">Restaurant: {order.restaurantId?.name || "Unknown"}</div>
                        <div className="meta-value address">{order.restaurantId?.address || "Unknown"}</div>
                      </div>
                      <div className="ticket-meta lines">
                        <div className="meta-label">Delivery To:</div>
                        <div className="meta-value address">{order.deliveryAddress}</div>
                      </div>
                      
                      <div className="ticket-actions actions">
                        {(order.status === STATUS.READY || order.status === STATUS.DRIVER_ASSIGNED) && (
                          <button className="btn btn-primary" onClick={() => handleUpdateStatus(order._id, order.status)}>Pick Up Order</button>
                        )}
                        {order.status === STATUS.PICKED_UP && (
                          <button className="btn btn-primary" onClick={() => handleUpdateStatus(order._id, order.status)}>Mark Delivered</button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </Shell>
  );
}
