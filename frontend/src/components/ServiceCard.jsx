import React from "react";
import { theme, formatGHS, formatDuration } from "../theme";

export default function ServiceCard({ service, selected, onSelect }) {
  return (
    <div
      onClick={() => onSelect(service)}
      style={{
        background: theme.cardAlt,
        borderRadius: theme.radius,
        padding: 14,
        cursor: "pointer",
        border: `1.5px solid ${selected ? theme.accent : "transparent"}`,
        transition: "border-color 0.2s",
      }}
    >
      <div
        style={{
          width: 18,
          height: 18,
          borderRadius: 4,
          marginBottom: 10,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontSize: 12,
          border: `1.5px solid ${selected ? theme.accent : "#444"}`,
          background: selected ? theme.accent : "transparent",
          color: theme.accentInk,
        }}
      >
        {selected ? "✓" : ""}
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: theme.text }}>
        {service.name}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600, color: theme.accent }}>
        {formatGHS(service.price)}
      </div>
      <div style={{ fontSize: 12, color: theme.textFaint, marginTop: 2 }}>
        {formatDuration(service.duration_minutes)}
      </div>
    </div>
  );
}
