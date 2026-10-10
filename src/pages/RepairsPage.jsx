import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { formatDate, getErrorMessage, unwrapList } from "../utils/helpers";
import StatusBadge from "../components/StatusBadge";

export default function RepairsPage() {
  const [repairs, setRepairs] = useState([]);
  const [status, setStatus] = useState("");
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    setLoading(true);
    const params = {};
    if (status) params.status = status;
    if (search.trim()) params.search = search.trim();
    api.get("/repairs/", { params }).then(({ data }) => { if (active) setRepairs(unwrapList(data)); })
      .catch((err) => { if (active) setError(getErrorMessage(err)); })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [status, search]);

  const cancelRepair = async (repair) => {
    if (!window.confirm("Cancel this repair request?")) return;
    try {
      await api.post(`/repairs/${repair.id}/cancel/`);
      setRepairs((old) => old.map((r) => r.id === repair.id ? { ...r, status: "cancelled" } : r));
    } catch (err) { setError(getErrorMessage(err)); }
  };

  return <div>
    <div className="page-heading"><div><span className="eyebrow">REPAIR WORKFLOW</span><h1>Repair requests</h1><p>View, filter and track repair jobs.</p></div><Link to="/repairs/new" className="btn btn-primary"><i className="bi bi-plus-lg me-2" />New repair</Link></div>
    {error && <div className="alert alert-danger">{error}</div>}
    <div className="panel">
      <div className="filter-toolbar"><div className="search-box"><i className="bi bi-search" /><input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search device or problem…" /></div><select className="form-select status-filter" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option><option value="submitted">Submitted</option><option value="diagnosis">Under diagnosis</option><option value="awaiting_approval">Awaiting approval</option><option value="in_progress">In progress</option><option value="waiting_parts">Waiting for parts</option><option value="completed">Completed</option><option value="ready_for_pickup">Ready for pickup</option><option value="delivered">Delivered</option><option value="cancelled">Cancelled</option></select></div>
      {loading ? <div className="p-5 text-center"><div className="spinner-border text-primary" /></div> : repairs.length ? <div className="table-responsive"><table className="table align-middle data-table mb-0"><thead><tr><th>Ticket</th><th>Device</th><th>Problem</th><th>Priority</th><th>Status</th><th>Submitted</th><th></th></tr></thead><tbody>{repairs.map((r) => <tr key={r.id}><td><strong className="ticket-id">#{String(r.ticket_number).slice(0, 8).toUpperCase()}</strong></td><td>{r.device_details || `Device #${r.device}`}</td><td className="problem-cell">{r.problem_description}</td><td><span className={`priority-text priority-${r.priority}`}>{r.priority}</span></td><td><StatusBadge status={r.status} /></td><td>{formatDate(r.submitted_at)}</td><td><Link className="table-action" to={`/repairs/${r.id}`}><i className="bi bi-chevron-right" /></Link></td></tr>)}</tbody></table></div> : <div className="empty-state"><div className="empty-icon"><i className="bi bi-inbox" /></div><h3>No matching repairs</h3><p>Try changing your search or submit a new repair request.</p><Link to="/repairs/new" className="btn btn-primary">Submit a repair</Link></div>}
    </div>
  </div>;
}
