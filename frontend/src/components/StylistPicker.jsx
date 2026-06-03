import React from "react";
export default function StylistPicker({ stylist, selected, onSelect }) {
  return (
    <button
      onClick={() => onSelect(stylist)}
      style={{
        background: selected ? "#1e1a15" : "#111",
        border: selected ? "1px solid #d4b896" : "1px solid #222",
        padding: 16,
        borderRadius: 12,
        width: "100%",
        textAlign: "left",
      }}
    >
      <p style={{ margin: 0, color: selected ? "#d4b896" : "#fff" }}>
        {stylist.name}
      </p>
      <p style={{ margin: "4px 0 0", color: "#666", fontSize: 13 }}>
        {stylist.bio}
      </p>
    </button>
  );
}