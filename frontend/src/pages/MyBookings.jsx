import React, { useState, useEffect } from "react";
import { theme } from "../theme";

const getAPI = () => localStorage.getItem("apiUrl") || "http://localhost:8000";

const sectionTitle = {
  fontSize: 11,
  letterSpacing: "1.5px",
  color: theme.textFaint,
  textTransform: "uppercase",
  marginBottom: 12,
};

const STATUS_CONFIG = {
  pending:   { label: "Pending",   color: "#e8a020", bg: "#2a1f00" },
  confirmed: { label: "Confirmed", color: "#3db87a", bg: "#0a2018" },
  completed: { label: "Completed", color: "#888",    bg: "#1a1a1a" },
  cancelled: { label: "Cancelled", color: "#e84a4a", bg: "#2a0a0a" },
};

const ACTIVE = ["pending", "confirmed"];

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending;
  return (
    <span
      style={{
        fontSize: 11,
        fontWeight: 700,
        letterSpacing: "0.8px",
        textTransform: "uppercase",
        color: cfg.color,
        background: cfg.bg,
        borderRadius: 6,
        padding: "3px 8px",
      }}
    >
      {cfg.label}
    </span>
  );
}

function Detail({ label, value }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: theme.textFaint, letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 2 }}>
        {label}
      </div>
      <div style={{ fontSize: 13, fontWeight: 600 }}>{value}</div>
    </div>
  );
}

const to12h = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

function BookingCard({ booking, onCancel, cancelling }) {
  const isActive = ACTIVE.includes(booking.status);
  const isReadOnly = !isActive;

  return (
    <div
      style={{
        background: theme.card,
        borderRadius: 12,
        padding: 16,
        marginBottom: 10,
        border: `1.5px solid ${isReadOnly ? theme.borderSubtle : theme.border}`,
        opacity: isReadOnly ? 0.7 : 1,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 10 }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 3 }}>{booking.service}</div>
          <div style={{ fontSize: 13, color: theme.textMuted }}>with {booking.stylist}</div>
        </div>
        <StatusBadge status={booking.status} />
      </div>

      <div style={{ display: "flex", gap: 16, marginBottom: isActive ? 14 : 0 }}>
        <Detail label="Date" value={booking.booking_date} />
        <Detail label="Time" value={to12h(booking.booking_time)} />
        <Detail label="Price" value={`GH₵ ${Number(booking.price).toFixed(2)}`} />
      </div>

      {isActive && (
        <button
          onClick={() => onCancel(booking.id)}
          disabled={cancelling === booking.id}
          style={{
            width: "100%",
            padding: "10px 0",
            background: "none",
            border: `1.5px solid #e84a4a`,
            borderRadius: 8,
            color: "#e84a4a",
            fontSize: 13,
            fontWeight: 600,
            cursor: cancelling === booking.id ? "default" : "pointer",
            fontFamily: theme.font,
            opacity: cancelling === booking.id ? 0.5 : 1,
            transition: "opacity 0.2s",
          }}
        >
          {cancelling === booking.id ? "Cancelling…" : "Cancel Booking"}
        </button>
      )}

      {isReadOnly && (
        <div style={{ fontSize: 11, color: theme.textFaint, marginTop: 6 }}>
          {booking.status === "completed" ? "This appointment is complete." : "This booking was cancelled."}
        </div>
      )}
    </div>
  );
}

export default function MyBookings({ token }) {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancelling, setCancelling] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  async function fetchBookings() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`${getAPI()}/bookings/client`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.detail || "Could not load bookings.");
      } else {
        setBookings(Array.isArray(data) ? data : []);
      }
    } catch {
      setError("Could not reach the server.");
    }
    setLoading(false);
  }

  async function cancelBooking(bookingId) {
    setCancelling(bookingId);
    try {
      const res = await fetch(`${getAPI()}/bookings/${bookingId}/cancel`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => b.id === bookingId ? { ...b, status: "cancelled" } : b)
        );
      } else {
        const data = await res.json();
        setError(data.detail || "Could not cancel booking.");
      }
    } catch {
      setError("Could not reach the server.");
    }
    setCancelling(null);
  }

  const active = bookings.filter((b) => ACTIVE.includes(b.status));
  const history = bookings.filter((b) => !ACTIVE.includes(b.status));

  return (
    <div style={{ background: theme.bgRaised, minHeight: "100vh", color: theme.text, paddingBottom: 32 }}>
      <div style={{ background: theme.card, borderRadius: 12, margin: 12, padding: 20 }}>
        <div style={{ fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
          Glam Studio
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, marginBottom: 4 }}>My Bookings</div>
        <div style={{ fontSize: 13, color: theme.textMuted }}>Your upcoming and past appointments</div>
      </div>

      {loading && (
        <div style={{ padding: "24px 12px", textAlign: "center", color: theme.textFaint, fontSize: 13 }}>
          Loading your bookings…
        </div>
      )}

      {error && (
        <div style={{ margin: "12px 12px 0", color: theme.danger, fontSize: 13 }}>{error}</div>
      )}

      {!loading && bookings.length === 0 && !error && (
        <div style={{ padding: "24px 12px", textAlign: "center", color: theme.textFaint, fontSize: 13 }}>
          You have no bookings yet.
        </div>
      )}

      {bookings.length > 0 && (
        <>
          {active.length > 0 && (
            <div style={{ padding: "16px 12px 0" }}>
              <div style={sectionTitle}>Upcoming</div>
              {active.map((b) => (
                <BookingCard key={b.id} booking={b} onCancel={cancelBooking} cancelling={cancelling} />
              ))}
            </div>
          )}
          {history.length > 0 && (
            <div style={{ padding: "16px 12px 0" }}>
              <div style={sectionTitle}>History</div>
              {history.map((b) => (
                <BookingCard key={b.id} booking={b} onCancel={cancelBooking} cancelling={cancelling} />
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}