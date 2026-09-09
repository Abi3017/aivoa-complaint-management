import React from "react";
import LogComplaintForm from "./components/LogComplaintForm.jsx";
import AICopilotPanel from "./components/AICopilotPanel.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <header className="app-header">
        <h1>AIVOA Customer Complaint Management</h1>
      </header>
      <main className="app-grid">
        <LogComplaintForm />
        <AICopilotPanel />
      </main>
    </div>
  );
}
