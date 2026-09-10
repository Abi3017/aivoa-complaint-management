import React from "react";
import { NavLink, Outlet, useLocation } from "react-router-dom";
import useHealthCheck from "../hooks/useHealthCheck.js";
import {
  DashboardIcon,
  NewComplaintIcon,
  LedgerIcon,
  CopilotIcon,
  AnalyticsIcon,
  SettingsIcon,
} from "../components/icons.jsx";

const PRIMARY_NAV = [
  { to: "/", label: "Dashboard", icon: DashboardIcon, end: true },
  { to: "/complaints/new", label: "New Complaint", icon: NewComplaintIcon },
  { to: "/complaints/ledger", label: "Complaint Ledger", icon: LedgerIcon },
];

const SECONDARY_NAV = [
  { to: "/copilot", label: "AI Copilot", icon: CopilotIcon },
  { to: "/analytics", label: "Analytics", icon: AnalyticsIcon },
  { to: "/settings", label: "Settings", icon: SettingsIcon },
];

const PAGE_TITLES = {
  "/": "Dashboard",
  "/complaints/new": "New Complaint",
  "/complaints/ledger": "Complaint Ledger",
  "/copilot": "AI Copilot",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

function pageTitleFor(pathname) {
  if (PAGE_TITLES[pathname]) return PAGE_TITLES[pathname];
  if (pathname.startsWith("/complaints/")) return "Complaint Analysis";
  return "AIVOA";
}

export default function AppLayout() {
  const isOnline = useHealthCheck();
  const location = useLocation();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="sidebar-brand">
          <div className="brand-mark">AI</div>
          <div>
            <div className="brand-title">AIVOA</div>
            <div className="brand-subtitle">AI Quality Intelligence</div>
          </div>
        </div>

        <nav className="sidebar-nav">
          {PRIMARY_NAV.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}

          <div className="nav-section-label">More</div>

          {SECONDARY_NAV.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) => `nav-item${isActive ? " active" : ""}`}
            >
              <Icon />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
          <span>{isOnline ? "Backend connected" : "Backend disconnected"}</span>
        </div>
      </aside>

      <div className="shell-main">
        <header className="topbar">
          <div className="breadcrumb">
            <span className="breadcrumb-root">AIVOA</span>
            <span className="breadcrumb-sep">/</span>
            <span className="breadcrumb-current">{pageTitleFor(location.pathname)}</span>
          </div>

          <div className="topbar-right">
            <span className={`status-badge ${isOnline ? "" : "status-badge-off"}`}>
              <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
              API {isOnline ? "Connected" : "Offline"}
            </span>
            <span className={`status-badge ${isOnline ? "" : "status-badge-off"}`}>
              <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
              AI {isOnline ? "Online" : "Offline"}
            </span>
            <div className="user-chip">
              <div className="user-avatar">QA</div>
              <div>
                <div className="user-name">Quality Admin</div>
                <div className="user-role">QA</div>
              </div>
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
