import React from "react";
import useHealthCheck from "../hooks/useHealthCheck.js";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export default function Settings() {
  const isOnline = useHealthCheck();

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <h1>Settings</h1>
          <p className="subtitle">Connection and environment information for this AIVOA instance.</p>
        </div>
      </div>

      <div className="card">
        <h2>Backend Connection</h2>
        <dl className="settings-list">
          <dt>API base URL</dt>
          <dd>{API_BASE_URL}</dd>

          <dt>Status</dt>
          <dd>
            <span className={`status-badge${isOnline ? "" : " status-badge-off"}`}>
              <span className={`status-dot ${isOnline ? "online" : "offline"}`} />
              {isOnline ? "Connected" : "Unreachable"}
            </span>
          </dd>
        </dl>
        <p className="hint">
          The AI model and CORS configuration are managed on the backend via environment
          variables (see the backend's <code>.env</code> file) and are not editable here.
        </p>
      </div>
    </div>
  );
}
