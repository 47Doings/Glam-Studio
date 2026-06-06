import React from "react";
import { initials, avatarColors } from "../theme";

export default function Avatar({ name = "", size = 40, selected = false, accent = "#22c97e" }) {
  const { bg, fg } = avatarColors(name);
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: bg,
        color: fg,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontSize: Math.round(size * 0.32),
        fontWeight: 700,
        border: `2px solid ${selected ? accent : "transparent"}`,
        transition: "border-color 0.2s",
        flexShrink: 0,
      }}
    >
      {initials(name)}
    </div>
  );
}
