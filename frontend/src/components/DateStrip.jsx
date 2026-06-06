import React from "react";
import { theme } from "../theme";

export default function DateStrip({ dates, selected, onSelect }) {
  return (
    <div className="no-scrollbar" style={{ display: "flex", gap: 6, overflowX: "auto", paddingBottom: 4 }}>
      {dates.map((d) => {
        const active = selected === d.value;
        return (
          <div
            key={d.value}
            onClick={() => onSelect(d.value)}
            style={{
              flexShrink: 0,
              textAlign: "center",
              padding: "8px 12px",
              borderRadius: 10,
              cursor: "pointer",
              background: theme.cardAlt,
              border: `1.5px solid ${active ? theme.accent : "transparent"}`,
              transition: "all 0.2s",
            }}
          >
            <div style={{ fontSize: 10, color: theme.textFaint, textTransform: "uppercase" }}>
              {d.day}
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, marginTop: 2, color: theme.text }}>
              {d.num}
            </div>
          </div>
        );
      })}
    </div>
  );
}
