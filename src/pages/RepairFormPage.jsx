import { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../api/client";
import { getErrorMessage, unwrapList } from "../utils/helpers";

export default function RepairFormPage() {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState({ device: "", problem_description: "", priority: "normal" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    api.get("/devices/").then(({ data }) => {
      const list = unwrapList(data);
      setDevices(list);
      const requested = searchParams.get("device");
      if (requested && list.some((d) => String(d.id) === requested)) setForm((f) => ({ ...f, device: requested }));
      else if (list.length) setForm((f) => ({ ...f, device: String(list[0].id) }));
    }).catch((err) => setError(getErrorMessage(err)));
  }, []);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try {
      const { data } = await api.post("/repairs/", { ...form, device: Number(form.device) });
      navigate(`/repairs/${data.id}`, { state: { justCreated: true } });
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };

  return <div>
    <div className="page-heading"><div><span className="eyebrow">SERVICE REQUEST</span><h1>Request a repair</h1><p>Tell us which device needs attention and what is wrong.</p></div><Link to="/repairs" className="btn btn-light"><i className="bi bi-arrow-left me-2" />Back to repairs</Link></div>
    {error && <div className="alert alert-danger">{error}</div>}
    <div className="panel form-panel form-panel-narrow"><div className="panel-heading"><div><h2>Repair details</h2><p>Fields marked with * are required.</p></div><span className="form-step">STEP 01 / 01</span></div>
      {devices.length === 0 ? <div className="empty-state"><div className="empty-icon"><i className="bi bi-laptop" /></div><h3>Register a device first</h3><p>A repair request must be linked to one of your devices.</p><Link to="/devices" className="btn btn-primary">Go to my devices</Link></div> : <form className="p-4 pt-0" onSubmit={submit}>
        <label className="form-label">Device to repair *</label><select className="form-select mb-3" required value={form.device} onChange={(e) => setForm({ ...form, device: e.target.value })}>{devices.map((d) => <option key={d.id} value={d.id}>{d.brand} {d.model_name} ({d.device_type})</option>)}</select>
        <label className="form-label">Describe the problem *</label><textarea className="form-control" rows="5" required minLength="8" value={form.problem_description} onChange={(e) => setForm({ ...form, problem_description: e.target.value })} placeholder="Explain what happens, when it started, and any error messages you noticed." /><div className="form-text mb-3">Please do not include passwords or other sensitive account credentials.</div>
        <label className="form-label">Priority</label><select className="form-select" value={form.priority} onChange={(e) => setForm({ ...form, priority: e.target.value })}><option value="low">Low — not urgent</option><option value="normal">Normal</option><option value="high">High — important</option><option value="urgent">Urgent</option></select>
        <div className="notice-box mt-4"><i className="bi bi-info-circle" /><span>Submitting this request does not confirm the final repair cost. The repair team will review the device and update the diagnosis and estimate.</span></div>
        <div className="d-flex justify-content-end gap-2 mt-4"><Link to="/repairs" className="btn btn-light">Cancel</Link><button className="btn btn-primary" disabled={busy || !form.device}>{busy ? "Submitting…" : "Submit repair request"} <i className="bi bi-arrow-right ms-2" /></button></div>
      </form>}
    </div>
  </div>;
}
