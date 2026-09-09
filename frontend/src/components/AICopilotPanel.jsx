import React, { useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { sendCopilotTurn } from "../api/copilotApi.js";
import { applyTurnResult } from "../store/complaintSlice.js";
import { sendFailed, sendStarted, sendSucceeded } from "../store/chatSlice.js";
import ChatMessage from "./ChatMessage.jsx";
import RiskAssessmentCard from "./RiskAssessmentCard.jsx";

export default function AICopilotPanel() {
  const dispatch = useDispatch();
  const { messages, isLoading } = useSelector((state) => state.chat);
  const complaintId = useSelector((state) => state.complaint.complaintId);

  const [input, setInput] = useState("");
  const fileInputRef = useRef(null);

  async function runTurn({ message, file }) {
    dispatch(sendStarted(message));
    try {
      const result = await sendCopilotTurn({ message, file, complaintId });
      dispatch(applyTurnResult(result));
      dispatch(sendSucceeded(result.ai_reply));
    } catch (err) {
      dispatch(sendFailed(err?.response?.data?.detail || err.message));
    }
  }

  function handleSend() {
    const text = input.trim();
    if (!text || isLoading) return;
    setInput("");
    runTurn({ message: text });
  }

  function handleFilePicked(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    dispatch(sendStarted(`📎 Uploaded ${file.name}`));
    (async () => {
      try {
        const result = await sendCopilotTurn({ file, complaintId });
        dispatch(applyTurnResult(result));
        dispatch(sendSucceeded(result.ai_reply));
      } catch (err) {
        dispatch(sendFailed(err?.response?.data?.detail || err.message));
      }
    })();
    e.target.value = "";
  }

  return (
    <div className="panel copilot-panel">
      <div className="panel-header">
        <h2>AIVOA Co-Pilot</h2>
        <span className="badge beta">BETA</span>
      </div>

      <div className="upload-zone" onClick={() => fileInputRef.current?.click()}>
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,.docx,.txt,.eml"
          hidden
          onChange={handleFilePicked}
        />
        <p>⬆ Drag &amp; drop complaint document here, or click to browse</p>
        <p className="upload-hint">Supported: PDF, DOCX, TXT, EML</p>
      </div>

      <div className="chat-log">
        {messages.map((m, i) => (
          <ChatMessage key={i} role={m.role} text={m.text} />
        ))}
        {isLoading && <ChatMessage role="assistant" text="Analyzing and extracting details…" />}
      </div>

      <RiskAssessmentCard />

      <div className="chat-input-row">
        <input
          type="text"
          placeholder="Ask me anything about this complaint, or paste details to log/edit it…"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          disabled={isLoading}
        />
        <button onClick={handleSend} disabled={isLoading || !input.trim()}>
          Send
        </button>
      </div>
      <p className="disclaimer">AI responses may contain errors. Please verify information.</p>
    </div>
  );
}
