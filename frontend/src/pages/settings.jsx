import React, { useEffect, useState } from "react";
import { theme, applyTheme } from "../theme";

const DEFAULT_API = "http://localhost:8000";

export default function Settings() {
  const [apiUrl, setApiUrl] = useState(
    () => localStorage.getItem("apiUrl") || DEFAULT_API
  );
  const [currentTheme, setCurrentTheme] = useState(
    () => localStorage.getItem("theme") || "dark"
  );

  useEffect(() => {
    localStorage.setItem("apiUrl", apiUrl);
  }, [apiUrl]);

  useEffect(() => {
    localStorage.setItem("theme", currentTheme);
    applyTheme(currentTheme);
  }, [currentTheme]);

  const resetSettings = () => {
    setApiUrl(DEFAULT_API);
    setCurrentTheme("dark");
    localStorage.removeItem("apiUrl");
    localStorage.removeItem("theme");
    applyTheme("dark");
  };

  const sectionTitle = {
    fontSize: 11,
    letterSpacing: "1.5px",
    color: theme.textFaint,
    textTransform: "uppercase",
    marginBottom: 12,
  };

  const card = {
    background: theme.card,
    border: `1.5px solid ${theme.border}`,
    borderRadius: theme.radiusLg,
    padding: 20,
    marginBottom: 12,
  };

  const inputStyle = {
    width: "100%",
    padding: "11px 14px",
    background: theme.cardAlt,
    border: `1.5px solid ${theme.border}`,
    borderRadius: theme.radius,
    color: theme.text,
    fontFamily: theme.font,
    fontSize: 14,
    outline: "none",
    marginTop: 8,
    boxSizing: "border-box",
  };

  return (
    <div style={{ background: theme.bgRaised, minHeight: "100vh", color: theme.text, padding: 20 }}>
      <h2 style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Settings</h2>
      <p style={{ fontSize: 13, color: theme.textFaint, marginBottom: 24 }}>
        Configure your app preferences
      </p>

      {/* API URL */}
      <div style={card}>
        <div style={sectionTitle}>API URL</div>
        <input
          value={apiUrl}
          onChange={(e) => setApiUrl(e.target.value)}
          style={inputStyle}
          placeholder="http://localhost:8000"
        />
        <p style={{ fontSize: 12, color: theme.textFaint, marginTop: 8 }}>
          Used by Booking + Admin for all requests
        </p>
      </div>

      {/* THEME */}
      <div style={card}>
        <div style={sectionTitle}>Theme</div>
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          {["dark", "light"].map((t) => (
            <div
              key={t}
              onClick={() => setCurrentTheme(t)}
              style={{
                flex: 1,
                padding: "12px 0",
                textAlign: "center",
                borderRadius: theme.radius,
                border: `1.5px solid ${currentTheme === t ? theme.accent : theme.border}`,
                background: currentTheme === t ? "rgba(34,201,126,0.08)" : theme.cardAlt,
                color: currentTheme === t ? theme.accent : theme.textMuted,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
                fontFamily: theme.font,
                transition: "all 0.2s",
                textTransform: "capitalize",
              }}
            >
              {t === "dark" ? "🌙 Dark" : "☀️ Light"}
            </div>
          ))}
        </div>
        <p style={{ fontSize: 12, color: theme.textFaint, marginTop: 8 }}>
          Controls global UI appearance
        </p>
      </div>

      {/* RESET */}
      <div style={card}>
        <div style={sectionTitle}>Reset</div>
        <p style={{ fontSize: 13, color: theme.textMuted, marginBottom: 12 }}>
          Restore all settings to their defaults
        </p>
        <button
          onClick={resetSettings}
          style={{
            padding: "10px 20px",
            background: "transparent",
            border: `1.5px solid ${theme.danger}`,
            color: theme.danger,
            borderRadius: theme.radius,
            fontSize: 13,
            fontWeight: 600,
            cursor: "pointer",
            fontFamily: theme.font,
          }}
        >
          Reset settings
        </button>
      </div>
    </div>
  );
}