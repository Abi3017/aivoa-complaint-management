import { createSlice } from "@reduxjs/toolkit";

const emptyForm = {
  complaint_source: null,
  customer_name: null,
  product_name: null,
  product_strength_grade: null,
  batch_lot_number: null,
  manufacturing_date: null,
  expiry_date: null,
  quantity_affected: null,
  complaint_type: null,
  complaint_date: null,
  complaint_description: null,
};

const emptyRisk = {
  initial_severity: null,
  priority: null,
  recommended_next_action: null,
  root_cause_recommendation: null,
  capa_recommendation: null,
  complaint_summary: null,
  risk_classification: null,
  completeness_check: [],
  duplicate_flag: false,
  duplicate_note: null,
};

const initialState = {
  complaintId: null,
  status: "Pending Triage",
  form: emptyForm,
  risk: emptyRisk,
};

const complaintSlice = createSlice({
  name: "complaint",
  initialState,
  reducers: {
    applyTurnResult(state, action) {
      const { complaint_id, form, risk_assessment } = action.payload;
      state.complaintId = complaint_id;
      // The backend already preserves untouched fields, but never let a
      // null/empty value from a response clobber a field the form already
      // has -- keeps a partial or stale response from erasing known data.
      for (const [key, value] of Object.entries(form || {})) {
        if (value !== null && value !== undefined && value !== "") {
          state.form[key] = value;
        }
      }
      state.risk = { ...state.risk, ...risk_assessment };
      if (risk_assessment?.initial_severity) {
        state.status = `Triaged - ${risk_assessment.initial_severity}`;
      }
    },
    resetComplaint(state) {
      state.complaintId = null;
      state.status = "Pending Triage";
      state.form = emptyForm;
      state.risk = emptyRisk;
    },
    loadComplaint(state, action) {
      const { id, status, form_data, risk_assessment } = action.payload;
      state.complaintId = id;
      state.status = status;
      state.form = { ...emptyForm, ...form_data };
      state.risk = { ...emptyRisk, ...risk_assessment };
    },
  },
});

export const { applyTurnResult, resetComplaint, loadComplaint } = complaintSlice.actions;
export default complaintSlice.reducer;
