import React from "react";
import {
  MapPin,
  Package,
  CheckCircle,
  User,
} from "@phosphor-icons/react";

const DriverOrderCard = ({
  order,
  accepted,
  onAccept,
  onStatusUpdate,
  loading,
}) => {
  const isAssigned = order.status === "DRIVER_ASSIGNED";
  const isPickedUp = order.status === "PICKED_UP";
  const isDelivered = order.status === "DELIVERED";

  return (
    <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm transition hover:shadow-md">
      <div className="mb-5 flex items-center justify-between border-b border-gray-100 pb-4">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">
            Order
          </p>

          <h3 className="mt-1 text-xl font-bold text-gray-900">
            #{order._id?.slice(-6).toUpperCase()}
          </h3>
        </div>

        <span
          className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
            isAssigned
              ? "bg-blue-100 text-blue-700"
              : isPickedUp
              ? "bg-orange-100 text-orange-700"
              : "bg-green-100 text-green-700"
          }`}
        >
          {order.status.replaceAll("_", " ")}
        </span>
      </div>

      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <User size={21} weight="duotone" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400">Customer</p>
            <p className="mt-1 break-words font-medium text-gray-800">
              {order.customerId}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <MapPin size={21} weight="duotone" />
          </div>

          <div className="min-w-0">
            <p className="text-xs font-medium text-gray-400">
              Delivery Address
            </p>
            <p className="mt-1 break-words font-medium text-gray-800">
              {order.deliveryAddress}
            </p>
          </div>
        </div>

        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-orange-50 text-orange-500">
            <Package size={21} weight="duotone" />
          </div>

          <div>
            <p className="text-xs font-medium text-gray-400">Order Total</p>
            <p className="mt-1 text-lg font-bold text-gray-900">
              ₹{((order.totalAmount || 0) / 100).toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-6 border-t border-gray-100 pt-5">
        {isAssigned && !accepted && (
          <button
            onClick={() => onAccept(order._id)}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-orange-500 px-4 py-3 font-semibold text-white transition hover:bg-orange-600 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle size={20} weight="bold" />
            {loading ? "Processing..." : "Accept Delivery"}
          </button>
        )}

        {isAssigned && accepted && (
          <button
            onClick={() => onStatusUpdate(order._id, "PICKED_UP")}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Package size={20} weight="bold" />
            {loading ? "Updating..." : "Mark Picked Up"}
          </button>
        )}

        {isPickedUp && (
          <button
            onClick={() => onStatusUpdate(order._id, "DELIVERED")}
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-600 px-4 py-3 font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <CheckCircle size={20} weight="bold" />
            {loading ? "Updating..." : "Mark Delivered"}
          </button>
        )}

        {isDelivered && (
          <div className="flex items-center justify-center gap-2 rounded-xl bg-green-50 px-4 py-3 font-semibold text-green-700">
            <CheckCircle size={20} weight="fill" />
            Delivery Completed
          </div>
        )}
      </div>
    </div>
  );
};

export default DriverOrderCard;