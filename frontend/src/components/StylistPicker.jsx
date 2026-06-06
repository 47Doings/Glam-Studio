import React from "react";
import { theme } from "../theme";
import Avatar from "./Avatar";

export default function StylistPicker({ stylist, selected, onSelect }) {
  const role = stylist.specialties?.join(" · ") || "Stylist";
  return (
    <div
      onClick={() => onSelect(stylist)}
      style={{ textAlign: "center", cursor: "pointer", flexShrink: 0, width: 64 }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
        <Avatar name={stylist.name} size={52} selected={selected} accent={theme.accent} />
      </div>
      <div style={{ fontSize: 12, color: "#ccc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {stylist.name}
      </div>
      <div style={{ fontSize: 11, color: theme.textFaint }}>{role}</div>
    </div>
  );
}
