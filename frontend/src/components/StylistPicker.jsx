import React from "react";
import { theme } from "../theme";
import Avatar from "./Avatar";

export default function StylistPicker({ stylist, selected, onSelect }) {
  const role = stylist.specialty || "Stylist";
  const inactive = stylist.status !== "active";

  return (
    <div
      onClick={() => !inactive && onSelect(stylist)}
      style={{
        textAlign: "center",
        cursor: inactive ? "not-allowed" : "pointer",
        flexShrink: 0,
        width: 64,
        opacity: inactive ? 0.35 : 1,
        transition: "opacity 0.2s",
      }}
    >
      <div style={{ display: "flex", justifyContent: "center", marginBottom: 6 }}>
        <Avatar name={stylist.name} size={52} selected={selected} accent={theme.accent} />
      </div>
      <div style={{ fontSize: 12, color: "#ccc", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
        {stylist.name}
      </div>
      <div style={{ fontSize: 11, color: theme.textFaint }}>{role}</div>
      {inactive && (
        <div style={{ fontSize: 10, color: theme.textFaint, marginTop: 2 }}>Unavailable</div>
      )}
    </div>
  );
}