import React from "react";

export default function MeterList({ items }) {
  const max = Math.max(1, ...items.map((item) => item.count));

  return (
    <div className="meter-list">
      {items.map((item) => (
        <div className="meter-row" key={item.label}>
          <div className="meter-label-row">
            <span>{item.label}</span>
            <span>{item.count}</span>
          </div>
          <div className="meter-track">
            <div
              className={`meter-fill status-${item.status}`}
              style={{ width: `${(item.count / max) * 100}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
