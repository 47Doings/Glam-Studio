import React, { useState } from "react";
import { theme } from "../theme";

const getAPI = () => localStorage.getItem("apiUrl") || "http://localhost:8000";

const inputStyle = {
  background: theme.cardAlt,
  border: `1.5px solid ${theme.border}`,
  borderRadius: 10,
  padding: "11px 14px",
  color: theme.text,
  fontFamily: theme.font,
  fontSize: 14,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

export default function Login({ onLogin, onGoRegister }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleLogin() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${getAPI()}/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Login failed.");
      } else {
        localStorage.setItem("token", data.access_token);
        onLogin(data.access_token);
      }
    } catch {
      setError("Could not reach the server.");
    }
    setLoading(false);
  }

  return (
    <div style={{ background: theme.bgRaised, minHeight: "100vh", color: theme.text, padding: 16 }}>
      <div style={{ background: theme.card, borderRadius: 12, padding: 20, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
          Glam Studio
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Welcome back</div>
        <div style={{ fontSize: 13, color: theme.textMuted }}>Log in to view your bookings</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          style={inputStyle}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleLogin()}
        />

        {error && <div style={{ color: theme.danger, fontSize: 13 }}>{error}</div>}

        <button
          onClick={handleLogin}
          disabled={loading || !email || !password}
          style={{
            background: theme.accent,
            border: "none",
            borderRadius: 10,
            padding: "12px 0",
            color: theme.accentInk,
            fontSize: 14,
            fontWeight: 700,
            cursor: loading ? "default" : "pointer",
            fontFamily: theme.font,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? "Logging in…" : "Log In"}
        </button>

        <div style={{ textAlign: "center", fontSize: 13, color: theme.textMuted }}>
          Don't have an account?{" "}
          <span
            onClick={onGoRegister}
            style={{ color: theme.accent, cursor: "pointer", fontWeight: 600 }}
          >
            Register
          </span>
        </div>
      </div>
    </div>
  );
}