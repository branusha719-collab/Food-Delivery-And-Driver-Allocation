import { Outlet } from "react-router-dom";
import Shell from "../components/Shell.jsx";

const NAV = [
  { to: "/admin", label: "Overview", end: true },
  { to: "/admin/reports", label: "Reports" },
  { to: "/admin/users", label: "Users" },
  { to: "/admin/drivers", label: "Drivers" },
  { to: "/admin/audit", label: "Audit log" },
];
export default function AdminLayout() {
  return <Shell title="Admin" nav={NAV}><Outlet /></Shell>;
}
