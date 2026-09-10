import React, { useEffect } from "react";
import { CheckCircleIcon } from "./icons.jsx";

export default function Toast({ message, onDone, durationMs = 3000 }) {
  useEffect(() => {
    const id = setTimeout(onDone, durationMs);
    return () => clearTimeout(id);
  }, [onDone, durationMs]);

  return (
    <div className="toast">
      <CheckCircleIcon />
      <span>{message}</span>
    </div>
  );
}
