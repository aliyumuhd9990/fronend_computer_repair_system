import { useEffect, useState } from "react";
import api from "../api/client";
import { getErrorMessage, unwrapList } from "../utils/helpers";

export default function TechniciansPage() {
  const [technicians, setTechnicians] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => { api.get("/technicians/").then(({ data }) => setTechnicians(unwrapList(data))).catch((err) => setError(getErrorMessage(err))); }, []);
  return <div><div className="page-heading"><div><span className="eyebrow">TEAM DIRECTORY</span><h1>Technicians</h1><p>Technicians available for repair assignment.</p></div></div>{error && <div className="alert alert-danger">{error}</div>}<div className="row g-3">{technicians.map((t) => <div className="col-md-6 col-xl-4" key={t.id}><div className="device-card technician-card"><div className="avatar technician-avatar">{(t.first_name?.[0] || t.username?.[0] || "T").toUpperCase()}</div><h3>{t.first_name} {t.last_name}</h3><p className="text-secondary mb-2">@{t.username}</p><div className="technician-contact"><i className="bi bi-envelope" /> {t.email}</div><div className="technician-contact"><i className="bi bi-telephone" /> {t.phone || "Phone not provided"}</div></div></div>)}{!technicians.length && !error && <div className="col-12"><div className="panel"><div className="empty-state"><div className="empty-icon"><i className="bi bi-people" /></div><h3>No technicians found</h3><p>Create technician accounts in Django Admin, then refresh this page.</p></div></div></div>}</div></div>;
}
