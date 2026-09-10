import React from "react";
import AICopilotPanel from "../components/AICopilotPanel.jsx";

export default function AICopilotPage() {
  return (
    <div className="page">
      <div className="page-title-row">
        <div>
          <h1>AI Copilot</h1>
          <p className="subtitle">
            Paste complaint details, upload a document, or ask a follow-up question about the
            complaint currently in view.
          </p>
        </div>
      </div>

      <div className="copilot-page-grid">
        <AICopilotPanel />
      </div>
    </div>
  );
}
