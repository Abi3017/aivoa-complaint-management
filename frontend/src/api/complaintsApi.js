import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

export async function listComplaints() {
  const { data } = await axios.get(`${API_BASE_URL}/api/complaints`);
  return data;
}

export async function getComplaint(complaintId) {
  const { data } = await axios.get(`${API_BASE_URL}/api/complaints/${complaintId}`);
  return data;
}

export async function deleteComplaint(complaintId) {
  await axios.delete(`${API_BASE_URL}/api/complaints/${complaintId}`);
}

export async function checkHealth() {
  const { data } = await axios.get(`${API_BASE_URL}/api/health`, { timeout: 4000 });
  return data.status === "ok";
}
