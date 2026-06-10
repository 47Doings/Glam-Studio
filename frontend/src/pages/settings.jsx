import React from "react";
import { useEffect, useState } from "react";

const DEFAULT_API = "http://localhost:8000";

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(
    () => localStorage.getItem("apiUrl") || DEFAULT_API
  );

  const [theme, setTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  // ── SAVE API URL GLOBALLY ─────────────────────────────
  useEffect(() => {
    localStorage.setItem("apiUrl", apiUrl);
  }, [apiUrl]);

  // ── APPLY THEME GLOBALLY ──────────────────────────────
  useEffect(() => {
    localStorage.setItem("theme", theme);

    if (theme === "dark") {
      document.body.style.background = "#0d0d0d";
      document.body.style.color = "#e0e0e0";
    } else {
      document.body.style.background = "#f5f5f5";
      document.body.style.color = "#111";
    }
  }, [theme]);

  const box = {
    background: "#111",
    border: "1px solid #222",
    borderRadius: 12,
    padding: 20,
    maxWidth: 600,
    marginTop: 16,
  };

  const input = {
    width: "100%",
    padding: 12,
    background: "#0d0d0d",
    border: "1px solid #2a2a2a",
    borderRadius: 8,
    color: "#e0e0e0",
    outline: "none",
    marginTop: 8,
  };

  const resetSettings = () => {
    setApiUrl(DEFAULT_API);
    setTheme("dark");
    localStorage.removeItem("apiUrl");
    localStorage.removeItem("theme");
  };

  return (
    <div style={{ padding: 24 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: "inherit" }}>
        Settings
      </h2>

      {/* API URL CONTROL */}
      <div style={box}>
        <label style={{ fontSize: 12, color: "#666" }}>API URL</label>
        <input
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          style={input}
        />
        <p style={{ fontSize: 11, color: "#555", marginTop: 8 }}>
          Used by Booking + Admin for all requests
        </p>
      </div>

      {/* THEME CONTROL */}
      <div style={box}>
        <label style={{ fontSize: 12, color: "#666" }}>Theme</label>
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value)}
          style={input}
        >
          <option value="dark">Dark</option>
          <option value="light">Light</option>
        </select>

        <p style={{ fontSize: 11, color: "#555", marginTop: 8 }}>
          Controls global UI appearance
        </p>
      </div>

      {/* RESET */}
      <div style={box}>
        <button
          onClick={resetSettings}
          style={{
            padding: "10px 16px",
            background: "#1a1a1a",
            border: "1px solid #333",
            color: "#c06060",
            borderRadius: 8,
            cursor: "pointer",
          }}
        >
          Reset settings
        </button>
      </div>
    </div>
  );
}