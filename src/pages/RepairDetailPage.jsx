import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import api from "../api/client";
import { formatDate, formatMoney, getErrorMessage } from "../utils/helpers";
import StatusBadge from "../components/StatusBadge";
import { useAuth } from "../context/AuthContext";

export default function RepairDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [repair, setRepair] = useState(null);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [note, setNote] = useState("");
  const [nextStatus, setNextStatus] = useState("diagnosis");
  const [technicians, setTechnicians] = useState([]);
  const [technicianId, setTechnicianId] = useState("");
  const [adminForm, setAdminForm] = useState({ diagnosis: "", estimated_cost: "", final_cost: "", priority: "normal", admin_notes: "" });

  const load = async () => {
    try {
      const { data } = await api.get(`/repairs/${id}/`);
      setRepair(data);
      setNextStatus(data.status);
      setAdminForm({ diagnosis: data.diagnosis || "", estimated_cost: data.estimated_cost ?? "", final_cost: data.final_cost ?? "", priority: data.priority || "normal", admin_notes: data.admin_notes || "" });
    } catch (err) { setError(getErrorMessage(err)); }
  };

  useEffect(() => { load(); if (user?.role === "admin" || user?.is_superuser) api.get("/technicians/").then(({ data }) => setTechnicians(Array.isArray(data) ? data : data.results || [])).catch(() => {}); }, [id]);

  const isAdmin = user?.role === "admin" || user?.is_superuser;
  const updateStatus = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try { await api.post(`/repairs/${id}/update-status/`, { status: nextStatus, note }); setNote(""); await load(); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  const saveAdmin = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    const payload = { ...adminForm, estimated_cost: adminForm.estimated_cost === "" ? null : adminForm.estimated_cost, final_cost: adminForm.final_cost === "" ? null : adminForm.final_cost };
    try { await api.patch(`/repairs/${id}/`, payload); await load(); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };
  const assign = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try { await api.post(`/repairs/${id}/assign-technician/`, { technician_id: Number(technicianId) }); await load(); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };

  if (!repair && !error) return <div className="panel p-5 text-center"><div className="spinner-border text-primary" /></div>;
  if (!repair) return <div><Link to="/repairs" className="text-link">← Back to repairs</Link><div className="alert alert-danger mt-3">{error}</div></div>;

  return <div>
    <div className="page-heading"><div><Link to="/repairs" className="back-link"><i className="bi bi-arrow-left" /> All repairs</Link><h1>Repair details</h1><p>Ticket #{String(repair.ticket_number).slice(0, 8).toUpperCase()} · Submitted {formatDate(repair.submitted_at)}</p></div><StatusBadge status={repair.status} /></div>
    {error && <div className="alert alert-danger">{error}</div>}
    <div className="row g-4">
      <div className="col-lg-7">
        <div className="panel mb-4"><div className="panel-heading"><div><h2>Reported problem</h2><p>Device and issue information</p></div></div><div className="detail-body">
          <div className="detail-device"><div className="device-icon large"><i className="bi bi-laptop" /></div><div><strong>{repair.device_details || `Device #${repair.device}`}</strong><span>Device ID: {repair.device}</span></div></div>
          <div className="detail-field"><label>Problem description</label><p>{repair.problem_description}</p></div>
          <div className="detail-field"><label>Technician diagnosis</label><p>{repair.diagnosis || "Diagnosis has not been added yet."}</p></div>
          <div className="detail-grid"><div><label>Estimated cost</label><strong>{repair.estimated_cost == null ? "Not estimated" : formatMoney(repair.estimated_cost)}</strong></div><div><label>Final cost</label><strong>{repair.final_cost == null ? "Not finalized" : formatMoney(repair.final_cost)}</strong></div><div><label>Priority</label><strong className={`priority-text priority-${repair.priority}`}>{repair.priority}</strong></div><div><label>Technician</label><strong>{repair.technician_name || "Not assigned"}</strong></div></div>
        </div></div>
        <div className="panel"><div className="panel-heading"><div><h2>Repair timeline</h2><p>Recorded status updates</p></div></div><div className="timeline">
          {(repair.status_history || []).length ? repair.status_history.map((h) => <div className="timeline-item" key={h.id}><div className="timeline-dot" /><div className="timeline-content"><div className="timeline-title">{h.new_status.replaceAll("_", " ")}</div><div className="timeline-meta">{formatDate(h.created_at)}{h.changed_by_name ? ` · ${h.changed_by_name}` : ""}</div>{h.note && <p>{h.note}</p>}</div></div>) : <p className="text-secondary">No timeline entries are available.</p>}
        </div></div>
      </div>
      <div className="col-lg-5">
        {(isAdmin || user?.role === "technician") && <div className="panel mb-4"><div className="panel-heading"><div><h2>Update progress</h2><p>Record the next repair status</p></div></div><form className="p-4 pt-0" onSubmit={updateStatus}><label className="form-label">New status</label><select className="form-select mb-3" value={nextStatus} onChange={(e) => setNextStatus(e.target.value)}>{["submitted","diagnosis","awaiting_approval","in_progress","waiting_parts","completed","ready_for_pickup","delivered","cancelled"].map((s) => <option key={s} value={s}>{s.replaceAll("_", " ")}</option>)}</select><label className="form-label">Update note</label><textarea className="form-control" rows="3" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Describe the work completed or next steps" /><button className="btn btn-primary w-100 mt-3" disabled={busy}>{busy ? "Saving…" : "Update status"}</button></form></div>}
        {isAdmin && <><div className="panel mb-4"><div className="panel-heading"><div><h2>Assign technician</h2><p>Choose a technician for this repair</p></div></div><form className="p-4 pt-0" onSubmit={assign}><select className="form-select mb-3" required value={technicianId} onChange={(e) => setTechnicianId(e.target.value)}><option value="">Select technician</option>{technicians.map((t) => <option key={t.id} value={t.id}>{t.first_name || t.username} {t.last_name || ""}</option>)}</select><button className="btn btn-outline-primary w-100" disabled={busy || !technicianId}>Assign technician</button></form></div>
        <div className="panel"><div className="panel-heading"><div><h2>Administrative details</h2><p>Diagnosis and cost management</p></div></div><form className="p-4 pt-0" onSubmit={saveAdmin}><label className="form-label">Diagnosis</label><textarea className="form-control mb-3" rows="3" value={adminForm.diagnosis} onChange={(e) => setAdminForm({ ...adminForm, diagnosis: e.target.value })} /><div className="row g-3"><div className="col-6"><label className="form-label">Estimate (₦)</label><input className="form-control" type="number" min="0" step="0.01" value={adminForm.estimated_cost} onChange={(e) => setAdminForm({ ...adminForm, estimated_cost: e.target.value })} /></div><div className="col-6"><label className="form-label">Final cost (₦)</label><input className="form-control" type="number" min="0" step="0.01" value={adminForm.final_cost} onChange={(e) => setAdminForm({ ...adminForm, final_cost: e.target.value })} /></div><div className="col-12"><label className="form-label">Priority</label><select className="form-select" value={adminForm.priority} onChange={(e) => setAdminForm({ ...adminForm, priority: e.target.value })}><option value="low">Low</option><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div><div className="col-12"><label className="form-label">Admin notes</label><textarea className="form-control" rows="2" value={adminForm.admin_notes} onChange={(e) => setAdminForm({ ...adminForm, admin_notes: e.target.value })} /></div></div><button className="btn btn-primary w-100 mt-3" disabled={busy}>{busy ? "Saving…" : "Save repair details"}</button></form></div></>}
      </div>
    </div>
  </div>;
}
