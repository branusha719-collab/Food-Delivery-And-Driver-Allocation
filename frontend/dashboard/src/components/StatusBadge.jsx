import { STATUS_LABEL } from "../lib/status.js";
export default function StatusBadge({ status }) {
  return <span className={`badge badge-${String(status).toLowerCase()}`}>{STATUS_LABEL[status] ?? status}</span>;
}
