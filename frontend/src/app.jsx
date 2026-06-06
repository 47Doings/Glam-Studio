import React from "react";
import { useState } from "react";
import Booking from "./pages/booking.jsx";
import Admin from "./pages/admin.jsx";
import Settings from "./pages/settings.jsx";
import { theme } from "./theme";

export default function App() {
  const [page, setPage] = useState("booking");

  const navStyle = {
    display: "flex",
    gap: 8,
    padding: "12px 16px",
    borderBottom: `1px solid ${theme.borderSubtle}`,
    background: theme.bg,
    position: "sticky",
    top: 0,
    zIndex: 10,
  };

  const btn = (active) => ({
    background: active ? theme.card : "none",
    border: `1.5px solid ${active ? theme.accent : "transparent"}`,
    borderRadius: 8,
    padding: "7px 14px",
    color: active ? "#fff" : "#888",
    cursor: "pointer",
    fontFamily: theme.font,
    fontSize: 13,
    fontWeight: 600,
  });

  return (
    <div style={{ background: theme.bg, minHeight: "100vh" }}>
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