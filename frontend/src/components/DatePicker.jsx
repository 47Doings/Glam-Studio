import React from "react";

export default function DatePicker({ slots, selected, onSelect }) {
  if (!slots || slots.length === 0) {
    return (
      <p style={{ color: "#666", marginTop: 12 }}>
        No available slots for this date. Try another day.
      </p>
    );
  }

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 12 }}>
      {slots.map((slot) => (
        <button
          key={slot}
          onClick={() => onSelect(slot)}
          style={{
            background: selected === slot ? "#d4b896" : "#111",
            color: selected === slot ? "#0d0d0d" : "#e0e0e0",
            border: selected === slot ? "1px solid #d4b896" : "1px solid #2a2a2a",
            borderRadius: 8,
            padding: "8px 16px",
            cursor: "pointer",
            fontSize: 14,
          }}
        >
          {slot}
        </button>
      ))}
    </div>
  );
}