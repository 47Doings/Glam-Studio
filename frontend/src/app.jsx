import React from "react";
import { useState } from "react";
import Booking from "./pages/booking.jsx";
import Admin from "./pages/admin.jsx";
import Settings from "./pages/settings.jsx";

export default function App() {
  const [page, setPage] = useState("booking");

  const navStyle = {
    display: "flex",
    gap: 12,
    padding: "16px 24px",
    borderBottom: "1px solid #1a1a1a",
    background: "#0d0d0d",
    position: "sticky",
    top: 0,
    zIndex: 10,
  };

  const btn = (active) => ({
    background: "none",
    border: "none",
    color: active ? "#d4b896" : "#666",
    cursor: "pointer",
    fontFamily: "'DM Sans', sans-serif",
    fontSize: 14,
    letterSpacing: "0.04em",
  });

  return (
    <div style={{ background: "#0d0d0d", minHeight: "100vh" }}>
      {/* NAV */}
      <div style={navStyle}>
        <button style={btn(page === "booking")} onClick={() => setPage("booking")}>
          Booking
        </button>
        <button style={btn(page === "admin")} onClick={() => setPage("admin")}>
          Admin
        </button>
        <button style={btn(page === "settings")} onClick={() => setPage("settings")}>
          Settings
        </button>
      </div>

      {/* PAGES */}
      {page === "booking" && <Booking />}
      {page === "admin" && <Admin />}
      {page === "settings" && <Settings />}
    </div>
  );
}