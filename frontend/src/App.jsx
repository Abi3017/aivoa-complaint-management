import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./layouts/AppLayout.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import ComplaintWorkspace from "./pages/ComplaintWorkspace.jsx";
import ComplaintLedger from "./pages/ComplaintLedger.jsx";
import AICopilotPage from "./pages/AICopilotPage.jsx";
import Analytics from "./pages/Analytics.jsx";
import Settings from "./pages/Settings.jsx";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AppLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="complaints/new" element={<ComplaintWorkspace />} />
          <Route path="complaints/ledger" element={<ComplaintLedger />} />
          <Route path="complaints/:id" element={<ComplaintWorkspace />} />
          <Route path="copilot" element={<AICopilotPage />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}
