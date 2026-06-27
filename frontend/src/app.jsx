import React, { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from "react-router-dom";
import Booking from "./pages/booking.jsx";
import Admin from "./pages/admin.jsx";
import Settings from "./pages/settings.jsx";
import MyBookings from "./pages/MyBookings.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import { theme, applyTheme } from "./theme";

function Layout() {
  const [token, setToken] = useState(() => localStorage.getItem("token") || null);
  const [themeMode, setThemeMode] = useState(
    () => localStorage.getItem("theme") || "dark"
  );
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    applyTheme(themeMode);
    localStorage.setItem("theme", themeMode);
  }, [themeMode]);

  function handleLogin(newToken) {
    setToken(newToken);
    navigate("/mybookings");
  }

  function handleLogout() {
    localStorage.removeItem("token");
    setToken(null);
    navigate("/");
  }

  const isAdmin = location.pathname === "/admin";
  if (isAdmin) {
    return <Admin />;
  }

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

  const p = location.pathname;

  return (
    <div style={{ background: theme.bg, minHeight: "100vh" }}>
      <div style={navStyle}>
        <button style={btn(p === "/")} onClick={() => navigate("/")}>
          Booking
        </button>
        <button style={btn(p === "/settings")} onClick={() => navigate("/settings")}>
          Settings
        </button>

        {token ? (
          <>
            <button style={btn(p === "/mybookings")} onClick={() => navigate("/mybookings")}>
              My Bookings
            </button>
            <button
              style={{ ...btn(false), marginLeft: "auto", color: theme.danger }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </>
        ) : (
          <button style={btn(p === "/login")} onClick={() => navigate("/login")}>
            Login
          </button>
        )}
      </div>

      <Routes>
        <Route path="/" element={<Booking token={token} />} />
        <Route path="/mybookings" element={<MyBookings token={token} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} onGoRegister={() => navigate("/register")} />} />
        <Route path="/register" element={<Register onLogin={handleLogin} onGoLogin={() => navigate("/login")} />} />
        <Route path="/settings" element={<Settings onThemeChange={setThemeMode} />} />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  );
}