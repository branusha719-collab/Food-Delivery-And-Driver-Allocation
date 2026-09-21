import React, { useCallback, useEffect, useState } from "react";
import {
  Bicycle,
  Clock,
  Package,
  Power,
  MapPin,
  CheckCircle,
  WarningCircle,
} from "@phosphor-icons/react";

import DriverOrderCard from "../components/DriverOrderCard";
import {
  getAssignedOrders,
  getStoredUser,
  updateOrderStatus,
  getDriverProfile,
  updateDriverAvailability,
} from "../services/driverApi";

const DriverDashboard = () => {
  const [online, setOnline] = useState(false);
  const [orders, setOrders] = useState([]);
  const [acceptedOrders, setAcceptedOrders] = useState({});
  const [loading, setLoading] = useState(false);
  const [activeOrderId, setActiveOrderId] = useState(null);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const user = getStoredUser();

  const loadOrders = useCallback(async () => {
    try {
      setError("");

      const data = await getAssignedOrders();
      setOrders(data);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to load assigned orders."
      );
    }
  }, []);

  useEffect(() => {
    const initializeDashboard = async () => {
      const storedUser = getStoredUser();

      if (!storedUser || storedUser.role !== "driver") {
        window.location.href = "/driver/login";
        return;
      }

      try {
        const profile = await getDriverProfile();
        setOnline(Boolean(profile?.isOnline));
      } catch (err) {
        console.error("Unable to load driver profile:", err);
      }

      await loadOrders();
    };

    initializeDashboard();
  }, [loadOrders]);

  const handleAccept = (orderId) => {
    setAcceptedOrders((previous) => ({
      ...previous,
      [orderId]: true,
    }));

    setSuccess("Delivery accepted successfully.");

    setTimeout(() => {
      setSuccess("");
    }, 3000);
  };

  const handleStatusUpdate = async (orderId, status) => {
    try {
      setLoading(true);
      setActiveOrderId(orderId);
      setError("");
      setSuccess("");

      await updateOrderStatus(orderId, status);

      setSuccess(
        status === "PICKED_UP"
          ? "Order marked as picked up."
          : "Order marked as delivered."
      );

      await loadOrders();

      setAcceptedOrders((previous) => {
        const updated = { ...previous };
        delete updated[orderId];
        return updated;
      });
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update order status."
      );
    } finally {
      setLoading(false);
      setActiveOrderId(null);
    }
  };

  const toggleOnline = async () => {
    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const newStatus = !online;

      const driver = await updateDriverAvailability(newStatus);

      setOnline(Boolean(driver?.isOnline));

      setSuccess(
        newStatus
          ? "You are now online and ready to accept deliveries."
          : "You are now offline."
      );

      setTimeout(() => {
        setSuccess("");
      }, 3000);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          err.message ||
          "Unable to update availability."
      );
    } finally {
      setLoading(false);
    }
  };

  const assignedOrders = orders.filter(
    (order) =>
      order.status === "DRIVER_ASSIGNED" ||
      order.status === "PICKED_UP"
  );

  const deliveredOrders = orders.filter(
    (order) => order.status === "DELIVERED"
  );

  const pickedUpOrders = orders.filter(
    (order) => order.status === "PICKED_UP"
  );

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6 md:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-1 text-sm font-medium text-orange-500">
              Delivery Partner
            </p>

            <h1 className="text-3xl font-bold text-gray-900">
              Driver Dashboard
            </h1>

            <p className="mt-1 text-gray-500">
              Welcome back{user?.name ? `, ${user.name}` : ""}.
            </p>
          </div>

          <button
            onClick={toggleOnline}
            disabled={loading}
            className={`flex items-center justify-center gap-2 rounded-xl px-5 py-3 font-semibold transition ${
              online
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-800 text-white hover:bg-gray-900"
            } ${
              loading
                ? "cursor-not-allowed opacity-60"
                : ""
            }`}
          >
            <Power size={20} weight="bold" />

            {online ? "Online" : "Go Online"}
          </button>
        </div>

        {success && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-green-700">
            <CheckCircle size={20} weight="fill" />
            {success}
          </div>
        )}

        {error && (
          <div className="mb-5 flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-700">
            <WarningCircle size={20} weight="fill" />
            {error}
          </div>
        )}

        {!online && (
          <div className="mb-6 rounded-2xl border border-yellow-200 bg-yellow-50 p-5">
            <div className="flex items-start gap-3">
              <Clock
                size={24}
                weight="fill"
                className="mt-0.5 text-yellow-600"
              />

              <div>
                <h3 className="font-semibold text-yellow-800">
                  You are currently offline
                </h3>

                <p className="mt-1 text-sm text-yellow-700">
                  Go online to start accepting delivery assignments.
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-orange-100 text-orange-600">
              <Package size={24} weight="fill" />
            </div>

            <p className="text-sm text-gray-500">
              Active Deliveries
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {assignedOrders.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-blue-100 text-blue-600">
              <Bicycle size={24} weight="fill" />
            </div>

            <p className="text-sm text-gray-500">
              Picked Up
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {pickedUpOrders.length}
            </p>
          </div>

          <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
            <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-600">
              <CheckCircle size={24} weight="fill" />
            </div>

            <p className="text-sm text-gray-500">
              Completed
            </p>

            <p className="mt-1 text-2xl font-bold text-gray-900">
              {deliveredOrders.length}
            </p>
          </div>
        </div>

        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              Assigned Deliveries
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Manage your active delivery orders.
            </p>
          </div>

          <button
            onClick={loadOrders}
            disabled={loading}
            className="rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Refresh
          </button>
        </div>

        {assignedOrders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-gray-300 bg-white px-6 py-14 text-center">
            <MapPin
              size={42}
              weight="duotone"
              className="mx-auto mb-3 text-gray-400"
            />

            <h3 className="text-lg font-semibold text-gray-800">
              No active deliveries
            </h3>

            <p className="mt-1 text-sm text-gray-500">
              New delivery assignments will appear here.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            {assignedOrders.map((order) => (
              <DriverOrderCard
                key={order._id}
                order={order}
                accepted={Boolean(acceptedOrders[order._id])}
                onAccept={handleAccept}
                onStatusUpdate={handleStatusUpdate}
                loading={
                  loading && activeOrderId === order._id
                }
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverDashboard;