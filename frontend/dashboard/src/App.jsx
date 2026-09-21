import { Navigate, Route, Routes } from "react-router-dom";
import Landing from "./auth/Landing.jsx";
import Login from "./auth/Login.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import OrdersBoard from "./restaurant/OrdersBoard.jsx";
import AdminLayout from "./admin/AdminLayout.jsx";
import Metrics from "./admin/Metrics.jsx";
import Users from "./admin/Users.jsx";
import Drivers from "./admin/Drivers.jsx";
import AuditLogs from "./admin/AuditLogs.jsx";
import Reports from "./admin/Reports.jsx";

import DriverDashboard from "./driver/DriverDashboard.jsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/restaurant" element={<ProtectedRoute role="restaurant"><OrdersBoard /></ProtectedRoute>} />
      <Route path="/driver" element={<ProtectedRoute role="driver"><DriverDashboard /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute role="admin"><AdminLayout /></ProtectedRoute>}>
        <Route index element={<Metrics />} />
        <Route path="reports" element={<Reports />} />
        <Route path="users" element={<Users />} />
        <Route path="drivers" element={<Drivers />} />
        <Route path="audit" element={<AuditLogs />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
