import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteComplaint, listComplaints } from "../api/complaintsApi.js";
import { InboxIcon, TrashIcon, ViewIcon } from "../components/icons.jsx";

export default function ComplaintLedger() {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  function refresh() {
    setLoading(true);
    listComplaints()
      .then(setComplaints)
      .finally(() => setLoading(false));
  }

  useEffect(refresh, []);

  async function handleDelete(e, id) {
    e.stopPropagation();
    if (!window.confirm("Delete this complaint record? This cannot be undone.")) return;
    await deleteComplaint(id);
    refresh();
  }

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <h1>Complaint Ledger</h1>
          <p className="subtitle">Every complaint tracked in the QMS, newest first.</p>
        </div>
        <button className="btn-primary" onClick={() => navigate("/complaints/new")}>
          Log Complaint
        </button>
      </div>

      <div className="card">
        {loading ? (
          <p className="muted">Loading…</p>
        ) : complaints.length === 0 ? (
          <div className="empty-state">
            <InboxIcon />
            <h3>No complaints yet</h3>
            <p>Complaints logged through the AI Copilot will appear here.</p>
          </div>
        ) : (
          <div className="table-wrap">
            <table className="ledger-table">
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Batch / Lot</th>
                  <th>Type</th>
                  <th>Severity</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {complaints.map((c) => (
                  <tr key={c.id} onClick={() => navigate(`/complaints/${c.id}`)}>
                    <td>{c.form_data?.product_name || "—"}</td>
                    <td>{c.form_data?.batch_lot_number || "—"}</td>
                    <td>{c.form_data?.complaint_type || "—"}</td>
                    <td>
                      {c.risk_assessment?.initial_severity ? (
                        <span
                          className={`pill severity-${c.risk_assessment.initial_severity.toLowerCase()}`}
                        >
                          {c.risk_assessment.initial_severity}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>{c.status}</td>
                    <td className="table-actions">
                      <button
                        className="icon-btn"
                        title="View"
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/complaints/${c.id}`);
                        }}
                      >
                        <ViewIcon />
                      </button>
                      <button
                        className="icon-btn icon-btn-danger"
                        title="Delete"
                        onClick={(e) => handleDelete(e, c.id)}
                      >
                        <TrashIcon />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
