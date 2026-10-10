import { useEffect, useState } from "react";
import api from "../api/client";
import { formatDate, formatMoney, getErrorMessage, unwrapList } from "../utils/helpers";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

export default function PaymentsPage() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [repairs, setRepairs] = useState([]);
  const [form, setForm] = useState({ repair: "", amount: "", method: "transfer", reference: "", notes: "" });
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busy, setBusy] = useState(false);

  const load = async () => {
    try { const [p, r] = await Promise.all([api.get("/payments/"), api.get("/repairs/")]); setPayments(unwrapList(p.data)); setRepairs(unwrapList(r.data)); }
    catch (err) { setError(getErrorMessage(err)); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError(""); setSuccess("");
    try {
      await api.post("/payments/", { ...form, repair: Number(form.repair), amount: String(form.amount), status: "pending" });
      setForm({ repair: "", amount: "", method: "transfer", reference: "", notes: "" }); setShowForm(false); setSuccess("Payment record submitted as pending for verification."); await load();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };

  const paidTotal = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);
  const pendingTotal = payments.filter((p) => p.status === "pending").reduce((sum, p) => sum + Number(p.amount), 0);
  const admin = user?.role === "admin" || user?.is_superuser;

  return <div>
    <div className="page-heading"><div><span className="eyebrow">PAYMENT RECORDS</span><h1>Payments</h1><p>Review payments linked to computer repair requests.</p></div>{!admin && <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><i className="bi bi-plus-lg me-2" />Add payment record</button>}</div>
    {error && <div className="alert alert-danger">{error}</div>}{success && <div className="alert alert-success">{success}</div>}
    <div className="row g-3 mb-4"><div className="col-md-4"><div className="stat-card compact"><div className="stat-icon stat-green"><i className="bi bi-check2-circle" /></div><div className="stat-label">Confirmed payments</div><div className="stat-value">{formatMoney(paidTotal)}</div></div></div><div className="col-md-4"><div className="stat-card compact"><div className="stat-icon stat-orange"><i className="bi bi-hourglass-split" /></div><div className="stat-label">Pending payments</div><div className="stat-value">{formatMoney(pendingTotal)}</div></div></div><div className="col-md-4"><div className="stat-card compact"><div className="stat-icon stat-blue"><i className="bi bi-receipt" /></div><div className="stat-label">Payment records</div><div className="stat-value">{payments.length}</div></div></div></div>
    {showForm && !admin && <div className="panel mb-4"><div className="panel-heading"><div><h2>Add payment record</h2><p>This record will remain pending until verified.</p></div></div><form className="p-4 pt-0" onSubmit={submit}><div className="row g-3"><div className="col-md-6"><label className="form-label">Repair request *</label><select className="form-select" required value={form.repair} onChange={(e) => setForm({ ...form, repair: e.target.value })}><option value="">Select a repair</option>{repairs.map((r) => <option key={r.id} value={r.id}>#{String(r.ticket_number).slice(0,8).toUpperCase()} — {r.device_details || `Device #${r.device}`}</option>)}</select></div><div className="col-md-6"><label className="form-label">Amount (₦) *</label><input className="form-control" type="number" min="0.01" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} /></div><div className="col-md-6"><label className="form-label">Method</label><select className="form-select" value={form.method} onChange={(e) => setForm({ ...form, method: e.target.value })}><option value="transfer">Bank transfer</option><option value="cash">Cash</option><option value="pos">POS</option><option value="online">Online</option><option value="other">Other</option></select></div><div className="col-md-6"><label className="form-label">Reference</label><input className="form-control" value={form.reference} onChange={(e) => setForm({ ...form, reference: e.target.value })} /></div><div className="col-12"><label className="form-label">Notes</label><textarea className="form-control" rows="2" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} /></div></div><button className="btn btn-primary mt-3" disabled={busy}>{busy ? "Submitting…" : "Submit for verification"}</button></form></div>}
    <div className="panel"><div className="panel-heading"><div><h2>Payment history</h2><p>{payments.length} record(s)</p></div></div>{payments.length ? <div className="table-responsive"><table className="table align-middle data-table mb-0"><thead><tr><th>Repair ticket</th><th>Amount</th><th>Method</th><th>Reference</th><th>Date</th><th>Status</th></tr></thead><tbody>{payments.map((p) => <tr key={p.id}><td><strong className="ticket-id">#{String(p.ticket_number || p.repair).slice(0,8).toUpperCase()}</strong></td><td><strong>{formatMoney(p.amount)}</strong></td><td>{p.method}</td><td>{p.reference || "—"}</td><td>{formatDate(p.created_at)}</td><td><StatusBadge status={p.status} /></td></tr>)}</tbody></table></div> : <div className="empty-state"><div className="empty-icon"><i className="bi bi-credit-card" /></div><h3>No payment records</h3><p>Payment records for your repair requests will appear here.</p></div>}</div>
  </div>;
}
