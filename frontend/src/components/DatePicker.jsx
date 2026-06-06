import React from "react";
import { theme } from "../theme";

// Standard salon working-hour slots (30-min steps). Availability comes from the API;
// slots not in `available` are shown greyed-out to match the design.
const ALL_SLOTS = [];
for (let h = 9; h < 17; h++) {
  ALL_SLOTS.push(`${String(h).padStart(2, "0")}:00`);
  ALL_SLOTS.push(`${String(h).padStart(2, "0")}:30`);
}

const to12h = (hhmm) => {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

export default function DatePicker({ slots, selected, onSelect, ready }) {
  if (!ready) {
    return (
      <p style={{ color: theme.textFaint, fontSize: 13 }}>
        Pick a stylist and date to see available times.
      </p>
    );
  }

  const available = new Set(slots || []);

  return (
    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
      {ALL_SLOTS.map((slot) => {
        const isAvailable = available.has(slot);
        const isSelected = selected === slot;
        return (
          <div
            key={slot}
            onClick={() => isAvailable && onSelect(slot)}
            style={{
              padding: "7px 12px",
              borderRadius: 8,
              fontSize: 13,
              cursor: isAvailable ? "pointer" : "default",
              background: theme.cardAlt,
              border: `1.5px solid ${isSelected ? theme.accent : "transparent"}`,
              color: isAvailable ? (isSelected ? "#fff" : "#ccc") : "#444",
              transition: "all 0.2s",
            }}
          >
            {to12h(slot)}
          </div>
        );
      })}
    </div>
  );
}
