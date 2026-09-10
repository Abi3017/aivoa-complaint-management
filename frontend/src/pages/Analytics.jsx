import React, { useEffect, useState } from "react";
import { listComplaints } from "../api/complaintsApi.js";
import MeterList from "../components/MeterList.jsx";

const SEVERITY_META = [
  { key: "Minor", status: "good" },
  { key: "Major", status: "warning" },
  { key: "Critical", status: "critical" },
];

function countBy(items, getKey) {
  const counts = new Map();
  for (const item of items) {
    const key = getKey(item);
    if (!key) continue;
    counts.set(key, (counts.get(key) || 0) + 1);
  }
  return counts;
}

export default function Analytics() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    listComplaints()
      .then(setComplaints)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="page">
        <h1>Analytics</h1>
        <p className="muted">Loading…</p>
      </div>
    );
  }

  const severityCounts = SEVERITY_META.map((s) => ({
    label: s.key,
    status: s.status,
    count: complaints.filter((c) => c.risk_assessment?.initial_severity === s.key).length,
  }));

  const typeCounts = countBy(complaints, (c) => c.form_data?.complaint_type);
  const typeItems = Array.from(typeCounts.entries())
    .sort((a, b) => b[1] - a[1])
    .map(([label, count]) => ({ label, count, status: "good" }));

  const duplicateCount = complaints.filter((c) => c.risk_assessment?.duplicate_flag).length;

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <h1>Analytics</h1>
          <p className="subtitle">Trends across every complaint the AI Copilot has processed.</p>
        </div>
      </div>

      <div className="stat-grid">
        <div className="stat-tile">
          <div className="stat-value">{complaints.length}</div>
          <div className="stat-label">Total Complaints</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value stat-critical">
            {severityCounts.find((s) => s.label === "Critical")?.count ?? 0}
          </div>
          <div className="stat-label">Critical Severity</div>
        </div>
        <div className="stat-tile">
          <div className="stat-value">{duplicateCount}</div>
          <div className="stat-label">Possible Duplicates</div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="card">
          <h2>By Severity</h2>
          {complaints.length === 0 ? (
            <p className="muted">No complaints logged yet.</p>
          ) : (
            <MeterList items={severityCounts} />
          )}
        </div>

        <div className="card">
          <h2>By Complaint Type</h2>
          {typeItems.length === 0 ? (
            <p className="muted">No complaints logged yet.</p>
          ) : (
            <MeterList items={typeItems} />
          )}
        </div>
      </div>
    </div>
  );
}
