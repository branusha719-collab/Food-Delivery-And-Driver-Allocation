import axios from "axios";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const getStoredUser = () => {
  const keys = ["user", "authUser", "currentUser"];

  for (const key of keys) {
    const value = localStorage.getItem(key);

    if (value) {
      try {
        return JSON.parse(value);
      } catch {
        return null;
      }
    }
  }

  return null;
};

export const getDriverId = () => {
  const user = getStoredUser();

  return user?.id || user?._id || null;
};

export const getAssignedOrders = async () => {
  const driverId = getDriverId();

  if (!driverId) {
    throw new Error("Driver information not found. Please log in again.");
  }

  const response = await api.get("/orders", {
    params: {
      driverId,
      limit: 100,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
  });

  return response.data?.data?.items || [];
};

export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(`/orders/${orderId}/status`, {
    status,
  });

  return response.data?.data;
};

export const getDriverProfile = async () => {
  const response = await api.get("/drivers/profile");

  return response.data?.data;
};

export const updateDriverAvailability = async (isOnline) => {
  const response = await api.patch("/drivers/availability", {
    isOnline,
  });

  return response.data?.data;
};