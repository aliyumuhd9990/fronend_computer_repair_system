import { statusLabel } from "../utils/helpers";

const styles = {
  submitted: "status-blue",
  diagnosis: "status-purple",
  awaiting_approval: "status-amber",
  in_progress: "status-cyan",
  waiting_parts: "status-amber",
  completed: "status-green",
  ready_for_pickup: "status-green",
  delivered: "status-green",
  cancelled: "status-red",
  pending: "status-amber",
  paid: "status-green",
  failed: "status-red",
  refunded: "status-purple",
};

export default function StatusBadge({ status }) {
  return <span className={`status-badge ${styles[status] || "status-gray"}`}>{statusLabel(status)}</span>;
}
