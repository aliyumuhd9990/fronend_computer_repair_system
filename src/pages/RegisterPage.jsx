import { useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/helpers";

const initial = { username: "", first_name: "", last_name: "", email: "", phone: "", address: "", password: "", password_confirm: "" };

export default function RegisterPage() {
  const { user, register } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(initial);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  if (user) return <Navigate to="/dashboard" replace />;

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError("");
    try { await register(form); navigate("/dashboard", { replace: true }); }
    catch (err) { setError(getErrorMessage(err)); }
    finally { setBusy(false); }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <Link to="/login" className="brand-lockup register-brand"><span className="brand-mark"><i className="bi bi-wrench-adjustable-circle" /></span><span><strong>FixDesk</strong><small>REPAIR MANAGEMENT</small></span></Link>
        <div className="eyebrow mt-4">GET STARTED</div>
        <h1>Create your account</h1>
        <p className="text-secondary">Register as a customer to manage your devices and repair requests.</p>
        {error && <div className="alert alert-danger py-2">{error}</div>}
        <form onSubmit={submit}>
          <div className="row g-3">
            <div className="col-md-6"><label className="form-label">First name</label><input className="form-control" name="first_name" value={form.first_name} onChange={change} required /></div>
            <div className="col-md-6"><label className="form-label">Last name</label><input className="form-control" name="last_name" value={form.last_name} onChange={change} required /></div>
            <div className="col-12"><label className="form-label">Username</label><input className="form-control" name="username" value={form.username} onChange={change} autoComplete="username" required /></div>
            <div className="col-md-6"><label className="form-label">Email</label><input className="form-control" type="email" name="email" value={form.email} onChange={change} required /></div>
            <div className="col-md-6"><label className="form-label">Phone</label><input className="form-control" name="phone" value={form.phone} onChange={change} /></div>
            <div className="col-12"><label className="form-label">Address</label><textarea className="form-control" rows="2" name="address" value={form.address} onChange={change} /></div>
            <div className="col-md-6"><label className="form-label">Password</label><input className="form-control" type="password" name="password" value={form.password} onChange={change} minLength="8" autoComplete="new-password" required /></div>
            <div className="col-md-6"><label className="form-label">Confirm password</label><input className="form-control" type="password" name="password_confirm" value={form.password_confirm} onChange={change} minLength="8" autoComplete="new-password" required /></div>
          </div>
          <button className="btn btn-primary w-100 auth-submit mt-4" disabled={busy}>{busy ? "Creating account…" : "Create customer account"}</button>
        </form>
        <p className="auth-switch">Already registered? <Link to="/login">Sign in</Link></p>
      </div>
    </div>
  );
}
