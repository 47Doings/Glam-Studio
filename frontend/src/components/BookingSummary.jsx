import React from "react";
import { theme, formatGHS, formatDuration } from "../theme";

const Dash = () => <span style={{ color: "#555" }}>—</span>;

function Row({ label, children }) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: 10,
        fontSize: 14,
      }}
    >
      <span style={{ color: theme.textMuted }}>{label}</span>
      <span style={{ color: theme.text, fontWeight: 500 }}>{children}</span>
    </div>
  );
}

export default function BookingSummary({ service, stylist, dateTimeLabel }) {
  return (
    <div style={{ background: "#1a1a1a", borderRadius: theme.radiusLg, padding: 20 }}>
      <div
        style={{
          fontSize: 11,
          letterSpacing: "1.5px",
          color: theme.textFaint,
          textTransform: "uppercase",
          marginBottom: 14,
        }}
      >
        Booking Summary
      </div>

      <Row label="Service">{service ? service.name : <Dash />}</Row>
      <Row label="Stylist">{stylist ? stylist.name : <Dash />}</Row>
      <Row label="Date & time">{dateTimeLabel || <Dash />}</Row>
      <Row label="Duration">
        {service ? formatDuration(service.duration_minutes) : <Dash />}
      </Row>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          paddingTop: 12,
          marginTop: 4,
          borderTop: `1px solid ${theme.border}`,
          fontSize: 16,
          fontWeight: 700,
          color: theme.text,
        }}
      >
        <span>Total</span>
        <span style={{ color: theme.accent, fontSize: 18 }}>
          {formatGHS(service ? service.price : 0)}
        </span>
      </div>
    </div>
  );
}
