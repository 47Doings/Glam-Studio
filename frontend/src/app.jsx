import React from "react";
import { useState, useEffect } from "react";
import Booking from "./pages/booking.jsx";
import Admin from "./pages/admin.jsx";
import Settings from "./pages/settings.jsx";
import { theme, applyTheme } from "./theme";
import MyBookings from "./pages/MyBookings.jsx";

export default function App() {
  const [page, setPage] = useState("booking");
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    applyTheme(themeMode);
    localStorage.setItem("theme", themeMode);
  }, [themeMode]);

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
    color: active ? theme.text : "#888",
    cursor: "pointer",
    fontFamily: theme.font,
    fontSize: 13,
    fontWeight: 600,
  });

  return (
    <div style={{ background: theme.bg, minHeight: "100vh" }}>
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
        <button style={btn(page === "mybookings")} onClick={() => setPage("mybookings")}>
          My Bookings
        </button>
      </div>

      {page === "booking" && <Booking />}
      {page === "admin" && <Admin />}
      {page === "settings" && <Settings onThemeChange={setThemeMode} />}
      {page === "mybookings" && <MyBookings />}
    </div>
  );
}