import React from "react";
export default function ServiceCard({ service, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(service)}
      style={{
        background: selected ? "#1e1a15" : "#111",
        border: selected ? "1px solid #d4b896" : "1px solid #222",
        borderRadius: 12,
        padding: "20px 24px",
        cursor: "pointer",
        textAlign: "left",
        width: "100%",
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between" }}>
        <div>
          <p style={{ margin: 0, color: selected ? "#d4b896" : "#e0e0e0" }}>
            {service.name}
          </p>
          <p style={{ margin: "4px 0 0", color: "#666", fontSize: 13 }}>
            {service.duration_minutes} min
          </p>
        </div>

        <span style={{ color: "#aaa" }}>
          GHS {service.price}
        </span>
      </div>
    </button>
  );
}