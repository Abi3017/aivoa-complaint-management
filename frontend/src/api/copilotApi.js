import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Sends one turn to the AI Copilot. Handles all three mandatory tools:
 *  - message only, complaintId null   -> "log complaint" tool
 *  - message only, complaintId set    -> "edit complaint" tool
 *  - file present                     -> "document extraction" tool
 */
export async function sendCopilotTurn({ message, file, complaintId }) {
  const formData = new FormData();
  if (message) formData.append("message", message);
  if (complaintId) formData.append("complaint_id", complaintId);
  if (file) formData.append("file", file);

  const { data } = await axios.post(`${API_BASE_URL}/api/copilot/message`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
}
