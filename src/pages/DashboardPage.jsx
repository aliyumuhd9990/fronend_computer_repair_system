import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { formatDate, formatMoney, getErrorMessage, unwrapList } from "../utils/helpers";
import StatusBadge from "../components/StatusBadge";

export default function DashboardPage() {
  const [summary, setSummary] = useState(null);
  const [repairs, setRepairs] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([api.get("/dashboard/summary/"), api.get("/repairs/")])
      .then(([s, r]) => { if (active) { setSummary(s.data); setRepairs(unwrapList(r.data).slice(0, 5)); } })
      .catch((err) => { if (active) setError(getErrorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);

  const admin = summary?.role === "admin";
  const technician = summary?.role === "technician";
  const cards = admin ? [
    ["Total customers", summary.customers, "bi-people", "stat-blue"],
    ["Registered devices", summary.devices, "bi-laptop", "stat-violet"],
    ["Open repairs", summary.open_repairs, "bi-tools", "stat-orange"],
    ["Paid amount", formatMoney(summary.paid_amount), "bi-cash-stack", "stat-green"],
  ] : technician ? [
    ["Assigned repairs", summary.assigned_repairs, "bi-clipboard2-check", "stat-blue"],
    ["Open repairs", summary.open_repairs, "bi-tools", "stat-orange"],
    ["Completed repairs", summary.completed_repairs, "bi-check-circle", "stat-green"],
  ] : [
    ["My devices", summary?.my_devices ?? "—", "bi-laptop", "stat-blue"],
    ["My repair requests", summary?.my_repairs ?? "—", "bi-tools", "stat-violet"],
    ["Open repairs", summary?.open_repairs ?? "—", "bi-hourglass-split", "stat-orange"],
    ["Completed", summary?.completed_repairs ?? "—", "bi-check-circle", "stat-green"],
  ];

  return (
    <div>
      <div className="page-heading">
        <div><span className="eyebrow">YOUR WORKSPACE</span><h1>Overview</h1><p>Here’s what’s happening with your repair service today.</p></div>
        <Link to={technician ? "/repairs" : "/repairs/new"} className="btn btn-primary"><i className={`bi ${technician ? "bi-list-task" : "bi-plus-lg"} me-2`} />{technician ? "View assigned work" : "New repair request"}</Link>
      </div>
      {error && <div className="alert alert-danger">{error}</div>}
      {loading ? <div className="panel p-5 text-center"><div className="spinner-border text-primary" /></div> : <>
        <div className="row g-3 mb-4">
          {cards.map(([label, value, icon, color]) => <div className="col-sm-6 col-xl-3" key={label}><div className="stat-card"><div className={`stat-icon ${color}`}><i className={`bi ${icon}`} /></div><div className="stat-label">{label}</div><div className="stat-value">{value}</div><div className="stat-foot">Updated from your records</div></div></div>)}
        </div>
        <div className="panel">
          <div className="panel-heading"><div><h2>Recent repair requests</h2><p>Your latest repair activity</p></div><Link to="/repairs" className="text-link">View all <i className="bi bi-arrow-up-right" /></Link></div>
          {repairs.length ? <div className="table-responsive"><table className="table align-middle data-table mb-0"><thead><tr><th>Ticket</th><th>Device</th><th>Submitted</th><th>Status</th><th></th></tr></thead><tbody>{repairs.map((repair) => <tr key={repair.id}><td><strong className="ticket-id">#{String(repair.ticket_number).slice(0, 8).toUpperCase()}</strong></td><td>{repair.device_details || `Device #${repair.device}`}</td><td>{formatDate(repair.submitted_at)}</td><td><StatusBadge status={repair.status} /></td><td><Link to={`/repairs/${repair.id}`} className="table-action" aria-label="View repair"><i className="bi bi-chevron-right" /></Link></td></tr>)}</tbody></table></div> : <div className="empty-state"><div className="empty-icon"><i className="bi bi-tools" /></div><h3>No repair requests yet</h3><p>When you submit a repair, its progress will appear here.</p><Link to="/repairs/new" className="btn btn-primary">Submit a repair</Link></div>}
        </div>
        {admin && summary?.repairs_by_status?.length > 0 && <div className="panel mt-4"><div className="panel-heading"><div><h2>Repairs by status</h2><p>Current workload distribution</p></div></div><div className="p-4">{summary.repairs_by_status.map((item) => <div className="status-count-row" key={item.status}><span>{item.status.replaceAll("_", " ")}</span><div className="progress flex-grow-1"><div className="progress-bar" style={{ width: `${Math.min(100, item.count / Math.max(1, summary.total_repairs) * 100)}%` }} /></div><strong>{item.count}</strong></div>)}</div></div>}
      </>}
    </div>
  );
}
