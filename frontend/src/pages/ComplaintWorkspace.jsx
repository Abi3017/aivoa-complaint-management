import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import { getComplaint } from "../api/complaintsApi.js";
import { loadComplaint, resetComplaint } from "../store/complaintSlice.js";
import LogComplaintForm from "../components/LogComplaintForm.jsx";
import AICopilotPanel from "../components/AICopilotPanel.jsx";
import Toast from "../components/Toast.jsx";
import { BackIcon, CheckCircleIcon } from "../components/icons.jsx";

export default function ComplaintWorkspace() {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const complaintId = useSelector((state) => state.complaint.complaintId);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (id) {
      getComplaint(id).then((data) => dispatch(loadComplaint(data)));
    } else {
      dispatch(resetComplaint());
    }
  }, [id, dispatch]);

  function handleCommit() {
    setToast("Complaint saved to the QMS ledger.");
    setTimeout(() => navigate("/complaints/ledger"), 900);
  }

  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <h1>AI Complaint Analysis</h1>
          <p className="subtitle">
            Review the extracted complaint information, then correct and commit it to the QMS ledger.
          </p>
        </div>
      </div>

      <div className="workspace-grid">
        <LogComplaintForm />
        <AICopilotPanel />
      </div>

      <div className="action-bar">
        <button className="btn-secondary" onClick={() => navigate("/complaints/ledger")}>
          <BackIcon /> Back
        </button>
        <button
          className="btn-primary"
          disabled={!complaintId}
          onClick={handleCommit}
        >
          <CheckCircleIcon /> Commit to QMS Ledger
        </button>
      </div>

      {toast && <Toast message={toast} onDone={() => setToast(null)} />}
    </div>
  );
}
