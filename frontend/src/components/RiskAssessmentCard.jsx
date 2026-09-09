import React from "react";
import { useSelector } from "react-redux";

export default function RiskAssessmentCard() {
  const risk = useSelector((state) => state.complaint.risk);

  const hasAnyData = risk.initial_severity || risk.complaint_summary;
  if (!hasAnyData) return null;

  return (
    <div className="risk-card">
      <h3>AI Co-Pilot Risk Assessment</h3>
      <dl>
        <dt>Severity</dt>
        <dd className={`pill severity-${(risk.initial_severity || "").toLowerCase()}`}>
          {risk.initial_severity || "—"}
        </dd>

        <dt>Priority</dt>
        <dd>{risk.priority || "—"}</dd>

        <dt>Recommended Next Action</dt>
        <dd>{risk.recommended_next_action || "—"}</dd>

        <dt>Root Cause Hypothesis</dt>
        <dd>{risk.root_cause_recommendation || "—"}</dd>

        <dt>CAPA Recommendation</dt>
        <dd>{risk.capa_recommendation || "—"}</dd>

        <dt>Risk Classification</dt>
        <dd>{risk.risk_classification || "—"}</dd>

        <dt>Summary</dt>
        <dd>{risk.complaint_summary || "—"}</dd>

        {risk.completeness_check?.length > 0 && (
          <>
            <dt>Missing Info</dt>
            <dd>{risk.completeness_check.join(", ")}</dd>
          </>
        )}

        {risk.duplicate_flag && (
          <>
            <dt>⚠ Possible Duplicate</dt>
            <dd>{risk.duplicate_note}</dd>
          </>
        )}
      </dl>
    </div>
  );
}
