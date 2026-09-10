import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { listComplaints } from "../api/complaintsApi.js";
import { InboxIcon, SparkleIcon } from "../components/icons.jsx";
import MeterList from "../components/MeterList.jsx";

const PRIORITY_BUCKETS = [
  { key: "Low", label: "Low", status: "good" },
  { key: "Medium", label: "Medium", status: "warning" },
  { key: "High", label: "High", status: "serious" },
  { key: "Urgent", label: "Critical", status: "critical" },
];

function displayName(form) {
  return form.product_name || form.complaint_type || "Untitled complaint";
}

export default function Dashboard() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    listComplaints()
      .then((data) => !cancelled && setComplaints(data))
      .catch(() => !cancelled && setComplaints([]))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, []);

  const total = complaints.length;
  const pendingReview = complaints.filter((c) => c.status === "Pending Triage").length;
  const highRisk = complaints.filter((c) => c.risk_assessment?.initial_severity === "Critical").length;
  const complete = complaints.filter(
    (c) => c.status !== "Pending Triage" && !(c.risk_assessment?.completeness_check?.length)
  ).length;

  const priorityCounts = PRIORITY_BUCKETS.map((bucket) => ({
    ...bucket,
    count: complaints.filter((c) => c.risk_assessment?.priority === bucket.key).length,
  }));

  const flagged = complaints
    .filter((c) => c.risk_assessment?.initial_severity === "Critical")
    .slice(0, 3);

  const recent = complaints.slice(0, 5);

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <h1>Good morning, Quality Team</h1>
          <p className="subtitle">Monitor, analyze and resolve customer complaints with AI-assisted quality intelligence.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/complaints/new")}>
          Log Complaint
        </button>
      </div>

      <div className="stat-grid">
        <StatTile label="Total Complaints" hint="Tracked in the QMS ledger" value={total} />
        <StatTile label="Pending Review" hint="Awaiting QA disposition" value={pendingReview} />
        <StatTile label="High Risk" hint="Requires attention" value={highRisk} tone="critical" />
        <StatTile label="Complete Records" hint="Fully documented" value={complete} tone="good" />
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <div className="card-header">
            <h2>Recent Complaints</h2>
            {total > 0 && (
              <button className="link-btn" onClick={() => navigate("/complaints/ledger")}>
                View all &#8599;
              </button>
            )}
          </div>

          {loading ? (
            <p className="muted">Loading…</p>
          ) : recent.length === 0 ? (
            <div className="empty-state">
              <InboxIcon />
              <h3>No complaints yet</h3>
              <p>Start by logging a customer complaint and let AIVOA analyze it with AI.</p>
              <button className="btn-primary" onClick={() => navigate("/complaints/new")}>
                Create Complaint
              </button>
            </div>
          ) : (
            <ul className="recent-list">
              {recent.map((c) => (
                <li key={c.id} className="recent-row" onClick={() => navigate(`/complaints/${c.id}`)}>
                  <div>
                    <div className="recent-row-title">{displayName(c.form_data || {})}</div>
                    <div className="recent-row-sub">{c.form_data?.batch_lot_number || "No batch recorded"}</div>
                  </div>
                  <span className="pill">{c.status}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="side-stack">
          <div className="card">
            <h2>AI Risk Overview</h2>
            <MeterList items={priorityCounts} />
          </div>

          <div className="card">
            <div className="card-header">
              <h2>AI Insights</h2>
              <SparkleIcon />
            </div>
            {flagged.length === 0 ? (
              <p className="muted">No outstanding AI-flagged issues right now.</p>
            ) : (
              <ul className="insight-list">
                {flagged.map((c) => (
                  <li key={c.id} onClick={() => navigate(`/complaints/${c.id}`)}>
                    {c.risk_assessment?.complaint_summary || displayName(c.form_data || {})}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function StatTile({ label, hint, value, tone }) {
  return (
    <div className="stat-tile">
      <div className={`stat-value${tone ? ` stat-${tone}` : ""}`}>{value}</div>
      <div className="stat-label">{label}</div>
      <div className="stat-hint">{hint}</div>
    </div>
  );
}
