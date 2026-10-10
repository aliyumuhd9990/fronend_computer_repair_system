import React, { useState } from "react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getErrorMessage } from "../utils/helpers";

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to="/dashboard" replace />;

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true); setError("");
    try {
      await login(form.username, form.password);
      navigate(location.state?.from?.pathname || "/dashboard", { replace: true });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally { setBusy(false); }
  };

  return (
    <div className="auth-page">
      <section className="auth-visual">
        <Link to="/login" className="auth-brand"><span className="brand-mark"><i className="bi bi-wrench-adjustable-circle" /></span><strong>FixDesk</strong></Link>
        <div className="auth-hero-copy">
          <span className="eyebrow light">REPAIR MANAGEMENT, SIMPLIFIED</span>
          <h1>Every repair.<br /><span>Under control.</span></h1>
          <p>Keep devices, repair progress, technicians and payments organized in one dependable workspace.</p>
          <div className="hero-check"><i className="bi bi-check-circle-fill" /> Clear repair tracking</div>
          <div className="hero-check"><i className="bi bi-check-circle-fill" /> Organized service records</div>
          <div className="hero-check"><i className="bi bi-check-circle-fill" /> One connected workflow</div>
        </div>
        <div className="auth-visual-footer">A smarter way to manage computer repairs.</div>
      </section>
      <section className="auth-form-side">
        <div className="auth-form-wrap">
          <span className="eyebrow">WELCOME BACK</span>
          <h2>Sign in to FixDesk</h2>
          <p className="text-secondary mb-4">Enter your account details to continue.</p>
          {error && <div className="alert alert-danger py-2">{error}</div>}
          <form onSubmit={submit}>
            <label className="form-label">Username</label>
            <div className="input-icon-wrap"><i className="bi bi-person" /><input className="form-control" value={form.username} onChange={(e) => setForm({ ...form, username: e.target.value })} autoComplete="username" required placeholder="Your username" /></div>
            <label className="form-label mt-3">Password</label>
            <div className="input-icon-wrap"><i className="bi bi-lock" /><input className="form-control" type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete="current-password" required placeholder="Enter your password" /></div>
            <button className="btn btn-primary w-100 auth-submit mt-4" disabled={busy}>{busy ? <><span className="spinner-border spinner-border-sm me-2" />Signing in…</> : <>Sign in <i className="bi bi-arrow-right ms-2" /></>}</button>
          </form>
          <p className="auth-switch">New to FixDesk? <Link to="/register">Create a customer account</Link></p>
          <div className="auth-security"><i className="bi bi-shield-check" /> Secure access to your repair workspace</div>
        </div>
      </section>
    </div>
  );
}
