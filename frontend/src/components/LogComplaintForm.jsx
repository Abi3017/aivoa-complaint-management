import React from "react";
import { useSelector } from "react-redux";

const FIELD_GROUPS = [
  {
    title: "1. Origin & Customer Details",
    fields: [
      ["complaint_source", "Complaint Source"],
      ["customer_name", "Customer Name"],
    ],
  },
  {
    title: "2. Product & Batch Identification",
    fields: [
      ["product_name", "Product Name"],
      ["product_strength_grade", "Product Strength / Grade"],
      ["batch_lot_number", "Batch / Lot Number"],
      ["manufacturing_date", "Manufacturing Date"],
      ["expiry_date", "Expiry Date"],
      ["quantity_affected", "Quantity Affected"],
    ],
  },
  {
    title: "3. Complaint Details",
    fields: [
      ["complaint_type", "Complaint Type"],
      ["complaint_date", "Complaint Date"],
    ],
  },
];

function ReadOnlyField({ label, value }) {
  return (
    <div className="field">
      <label>{label}</label>
      <input type="text" readOnly value={value ?? ""} placeholder="Awaiting AI extraction..." />
    </div>
  );
}

export default function LogComplaintForm() {
  const { form, risk, status } = useSelector((state) => state.complaint);

  return (
    <div className="panel form-panel">
      <div className="panel-header">
        <div>
          <h2>Log Customer Complaint</h2>
          <p className="subtitle">API &amp; FDF Quality Assurance Module</p>
        </div>
        <span className="badge">{status}</span>
      </div>

      {FIELD_GROUPS.map((group) => (
        <fieldset key={group.title}>
          <legend>{group.title}</legend>
          <div className="field-grid">
            {group.fields.map(([key, label]) => (
              <ReadOnlyField key={key} label={label} value={form[key]} />
            ))}
          </div>
        </fieldset>
      ))}

      <fieldset>
        <legend>3. Complaint Details (cont.)</legend>
        <div className="field">
          <label>Detailed Complaint Description</label>
          <textarea
            readOnly
            rows={3}
            value={form.complaint_description ?? ""}
            placeholder="Awaiting AI extraction..."
          />
        </div>
      </fieldset>

      <fieldset>
        <legend>4. Initial Assessment &amp; Priority (AI Co-Pilot)</legend>
        <div className="field-grid">
          <ReadOnlyField label="Initial Severity" value={risk.initial_severity} />
          <ReadOnlyField label="Priority" value={risk.priority} />
        </div>
      </fieldset>

      <p className="hint">
        This form is populated only by the AI Copilot on the right — it is not editable by hand,
        per the assignment's mandatory workflow.
      </p>
    </div>
  );
}
