import React from "react";
import logo from "../assets/navbar.png";
import { useAuth } from "../context/AuthContext";

export default function NavbarCommon({ onToggle }) {
  const { user, logout } = useAuth();

  return (
    <nav className="top-navbar shadow-sm">
      <div className="navbar-content container-fluid">
        {/* ---------- LEFT: Logo + Title ---------- */}
        <div className="navbar-brand-section">
         <img src={logo} alt="Logo" className="navbar-logo" />
          <span className="navbar-title">NLNG LMS</span>
        </div>

        {/* ---------- RIGHT: Search + Logout ---------- */}
        <div className="navbar-actions">
          <input
            type="text"
            placeholder="Search..."
            className="navbar-search"
          />

          {user && (
            <button className="navbar-logout" onClick={logout}>
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
