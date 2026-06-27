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

export default function Register({ onLogin, onGoLogin }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleRegister() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${getAPI()}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, phone, email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Registration failed.");
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
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>Create account</div>
        <div style={{ fontSize: 13, color: theme.textMuted }}>Book appointments and track your visits</div>
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        <input
          style={inputStyle}
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Phone"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />
        <input
          style={inputStyle}
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          style={inputStyle}
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        {error && <div style={{ color: theme.danger, fontSize: 13 }}>{error}</div>}

        <button
          onClick={handleRegister}
          disabled={loading || !name || !phone || !email || !password}
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
          {loading ? "Creating account…" : "Create Account"}
        </button>

        <div style={{ textAlign: "center", fontSize: 13, color: theme.textMuted }}>
          Already have an account?{" "}
          <span
            onClick={onGoLogin}
            style={{ color: theme.accent, cursor: "pointer", fontWeight: 600 }}
          >
            Log in
          </span>
        </div>
      </div>
    </div>
  );
}