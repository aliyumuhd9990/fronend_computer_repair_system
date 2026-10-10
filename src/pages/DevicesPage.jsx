import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/client";
import { getErrorMessage, unwrapList, formatDate } from "../utils/helpers";

const initial = { device_type: "laptop", brand: "", model_name: "", serial_number: "", description: "" };

export default function DevicesPage() {
  const [devices, setDevices] = useState([]);
  const [form, setForm] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const load = async () => {
    try { const { data } = await api.get("/devices/"); setDevices(unwrapList(data)); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError(""); setSuccess("");
    try {
      await api.post("/devices/", form);
      setForm(initial); setShowForm(false); setSuccess("Device registered successfully."); await load();
    } catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };

  const remove = async (device) => {
    if (!window.confirm(`Delete ${device.brand} ${device.model_name}? This may be blocked if repair requests reference this device.`)) return;
    try { await api.delete(`/devices/${device.id}/`); setDevices((old) => old.filter((d) => d.id !== device.id)); }
    catch (err) { setError(getErrorMessage(err)); }
  };

  return <div>
    <div className="page-heading"><div><span className="eyebrow">DEVICE REGISTER</span><h1>My devices</h1><p>Keep your computer and device details organized.</p></div><button className="btn btn-primary" onClick={() => setShowForm(!showForm)}><i className="bi bi-plus-lg me-2" />Register device</button></div>
    {error && <div className="alert alert-danger">{error}</div>}{success && <div className="alert alert-success">{success}</div>}
    {showForm && <div className="panel form-panel mb-4"><div className="panel-heading"><div><h2>Register a device</h2><p>Enter the details of the device you want serviced.</p></div><button className="icon-button" onClick={() => setShowForm(false)}><i className="bi bi-x-lg" /></button></div>
      <form onSubmit={submit} className="p-4 pt-0"><div className="row g-3">
        <div className="col-md-4"><label className="form-label">Device type</label><select className="form-select" value={form.device_type} onChange={(e) => setForm({ ...form, device_type: e.target.value })}><option value="laptop">Laptop</option><option value="desktop">Desktop</option><option value="printer">Printer</option><option value="other">Other</option></select></div>
        <div className="col-md-4"><label className="form-label">Brand *</label><input className="form-control" required value={form.brand} onChange={(e) => setForm({ ...form, brand: e.target.value })} placeholder="e.g. HP" /></div>
        <div className="col-md-4"><label className="form-label">Model</label><input className="form-control" value={form.model_name} onChange={(e) => setForm({ ...form, model_name: e.target.value })} placeholder="e.g. EliteBook 840" /></div>
        <div className="col-md-6"><label className="form-label">Serial number</label><input className="form-control" value={form.serial_number} onChange={(e) => setForm({ ...form, serial_number: e.target.value })} /></div>
        <div className="col-12"><label className="form-label">Device notes</label><textarea className="form-control" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Any useful information about the device" /></div>
      </div><div className="d-flex justify-content-end gap-2 mt-4"><button type="button" className="btn btn-light" onClick={() => setShowForm(false)}>Cancel</button><button className="btn btn-primary" disabled={busy}>{busy ? "Saving…" : "Save device"}</button></div></form>
    </div>}
    <div className="row g-3">{loading ? <div className="col-12"><div className="panel p-5 text-center"><div className="spinner-border text-primary" /></div></div> : devices.length ? devices.map((device) => <div className="col-md-6 col-xl-4" key={device.id}><div className="device-card"><div className="device-card-top"><div className="device-icon"><i className={`bi ${device.device_type === "printer" ? "bi-printer" : device.device_type === "desktop" ? "bi-pc-display" : "bi-laptop"}`} /></div><span className="device-type">{device.device_type}</span></div><h3>{device.brand} {device.model_name}</h3><p className="device-serial">Serial: {device.serial_number || "Not provided"}</p><p className="device-description">{device.description || "No additional notes."}</p><div className="device-card-footer"><small>Added {formatDate(device.created_at)}</small><div className="d-flex gap-2"><Link to={`/repairs/new?device=${device.id}`} className="btn btn-sm btn-outline-primary">Request repair</Link><button className="btn btn-sm btn-outline-danger" onClick={() => remove(device)} aria-label="Delete device"><i className="bi bi-trash" /></button></div></div></div></div>) : <div className="col-12"><div className="panel"><div className="empty-state"><div className="empty-icon"><i className="bi bi-laptop" /></div><h3>No devices registered</h3><p>Register a laptop, desktop or other device to get started.</p><button className="btn btn-primary" onClick={() => setShowForm(true)}>Register your first device</button></div></div></div>}</div>
  </div>;
}
