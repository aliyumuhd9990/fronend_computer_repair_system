import React from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const navItems = [
  { to: "/dashboard", label: "Overview", icon: "bi-grid-1x2", roles: ["customer", "technician", "admin"] },
  { to: "/devices", label: "My devices", icon: "bi-laptop", roles: ["customer", "admin"] },
  { to: "/repairs", label: "Repair requests", icon: "bi-tools", roles: ["customer", "technician", "admin"] },
  { to: "/payments", label: "Payments", icon: "bi-credit-card", roles: ["customer", "admin"] },
  { to: "/technicians", label: "Technicians", icon: "bi-people", roles: ["admin"] },
];

export default function AppLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const signOut = async () => {
    await logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <NavLink to="/dashboard" className="brand-lockup">
          <span className="brand-mark"><i className="bi bi-wrench-adjustable-circle" /></span>
          <span><strong>FixDesk</strong><small>REPAIR MANAGEMENT</small></span>
        </NavLink>
        <div className="sidebar-label">WORKSPACE</div>
        <nav className="sidebar-nav">
          {navItems.filter((item) => item.roles.includes(user?.role) || user?.is_superuser).map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? "active" : ""}`}>
              <i className={`bi ${item.icon}`} /><span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="help-card">
            <div className="help-icon"><i className="bi bi-headset" /></div>
            <strong>Need assistance?</strong>
            <p>Contact your repair shop administrator for help.</p>
          </div>
          <button className="signout-button" onClick={signOut}><i className="bi bi-box-arrow-left" /> Sign out</button>
        </div>
      </aside>

      <div className="main-area">
        <header className="topbar">
          <div className="topbar-mobile-brand"><i className="bi bi-wrench-adjustable-circle" /> FixDesk</div>
          <div className="topbar-caption">Computer Repair Service Portal</div>
          <div className="profile-menu">
            <div className="avatar">{(user?.first_name?.[0] || user?.username?.[0] || "U").toUpperCase()}</div>
            <div className="profile-text"><strong>{user?.first_name ? `${user.first_name} ${user.last_name || ""}` : user?.username}</strong><small>{user?.role || "user"}</small></div>
          </div>
        </header>
        <main className="page-content"><Outlet /></main>
        <footer className="app-footer">© {new Date().getFullYear()} FixDesk · Computer Repair Service Management</footer>
      </div>
    </div>
  );
}
