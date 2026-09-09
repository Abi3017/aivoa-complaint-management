import React from "react";

export default function ChatMessage({ role, text }) {
  return (
    <div className={`chat-message ${role}`}>
      {role === "assistant" && <span className="avatar">✦</span>}
      <div className="bubble">{text}</div>
    </div>
  );
}
