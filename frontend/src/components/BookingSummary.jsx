import React from "react";

export default function BookingSummary({ service, stylist, date, time, form }) {
  return (
    <div style={{ background: "#111", padding: 20, borderRadius: 12 }}>
      <h3 style={{ color: "#d4b896", marginBottom: 16 }}>Booking Summary</h3>

      <p style={{ color: "#aaa", margin: "6px 0" }}>
        <span style={{ color: "#666" }}>Service: </span>
        {service?.name}
      </p>

      <p style={{ color: "#aaa", margin: "6px 0" }}>
        <span style={{ color: "#666" }}>Stylist: </span>
        {stylist?.name}
      </p>

      <p style={{ color: "#aaa", margin: "6px 0" }}>
        <span style={{ color: "#666" }}>Date: </span>
        {date}
      </p>

      <p style={{ color: "#aaa", margin: "6px 0" }}>
        <span style={{ color: "#666" }}>Time: </span>
        {time}
      </p>

      <p style={{ color: "#aaa", margin: "6px 0" }}>
        <span style={{ color: "#666" }}>Name: </span>
        {form?.name}
      </p>

      <p style={{ color: "#aaa", margin: "6px 0" }}>
        <span style={{ color: "#666" }}>Email: </span>
        {form?.email}
      </p>

      <p style={{ color: "#aaa", margin: "6px 0" }}>
        <span style={{ color: "#666" }}>Phone: </span>
        {form?.phone}
      </p>

      {form?.notes && (
        <p style={{ color: "#aaa", margin: "6px 0" }}>
          <span style={{ color: "#666" }}>Notes: </span>
          {form.notes}
        </p>
      )}
    </div>
  );
}