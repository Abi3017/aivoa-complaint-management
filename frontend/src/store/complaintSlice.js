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
      state.form = { ...state.form, ...form };
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
  },
});

export const { applyTurnResult, resetComplaint } = complaintSlice.actions;
export default complaintSlice.reducer;
