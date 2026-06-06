import React, { useState, useEffect, useMemo } from "react";

import ServiceCard from "../components/ServiceCard";
import StylistPicker from "../components/StylistPicker";
import DateStrip from "../components/DateStrip";
import DatePicker from "../components/DatePicker";
import BookingSummary from "../components/BookingSummary";
import { theme } from "../theme";

const getAPI = () =>
  localStorage.getItem("apiUrl") || "http://localhost:8000";

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function buildDates(count = 14) {
  const out = [];
  const base = new Date();
  for (let i = 0; i < count; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    out.push({
      value: d.toISOString().split("T")[0],
      day: DAY_NAMES[d.getDay()],
      num: d.getDate(),
    });
  }
  return out;
}

const to12h = (hhmm) => {
  if (!hhmm) return "";
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

const sectionTitle = {
  fontSize: 11,
  letterSpacing: "1.5px",
  color: theme.textFaint,
  textTransform: "uppercase",
  marginBottom: 12,
};

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
};

export default function Booking() {
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [slots, setSlots] = useState([]);

  const [selectedService, setSelectedService] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");

  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const dates = useMemo(() => buildDates(14), []);

  useEffect(() => {
    fetch(`${getAPI()}/services/`)
      .then((r) => r.json())
      .then((d) => setServices(Array.isArray(d) ? d : []))
      .catch(console.error);
    fetch(`${getAPI()}/stylists/`)
      .then((r) => r.json())
      .then((d) => setStylists(Array.isArray(d) ? d : []))
      .catch(console.error);
  }, []);

  // Stylists that can perform the selected service (all stylists before a service is picked).
  const visibleStylists = useMemo(() => {
    const active = stylists.filter((s) => s.active !== false);
    if (!selectedService) return active;
    return active.filter((s) => s.service_ids?.includes(selectedService.id));
  }, [stylists, selectedService]);

  // Drop a selected stylist that no longer offers the chosen service.
  useEffect(() => {
    if (
      selectedStylist &&
      !visibleStylists.some((s) => s.id === selectedStylist.id)
    ) {
      setSelectedStylist(null);
    }
  }, [visibleStylists, selectedStylist]);

  const slotsReady = !!(selectedStylist && selectedDate && selectedService);

  useEffect(() => {
    if (!slotsReady) {
      setSlots([]);
      return;
    }
    fetch(
      `${getAPI()}/stylists/${selectedStylist.id}/availability?date=${selectedDate}&service_id=${selectedService.id}`
    )
      .then((r) => r.json())
      .then((d) => setSlots(Array.isArray(d) ? d : d.available_slots || []))
      .catch(console.error);
  }, [slotsReady, selectedStylist, selectedDate, selectedService]);

  const selectedDateObj = dates.find((d) => d.value === selectedDate);
  const dateTimeLabel =
    selectedDateObj && selectedTime
      ? `${selectedDateObj.day} ${selectedDateObj.num}, ${to12h(selectedTime)}`
      : "";

  const ready =
    selectedService &&
    selectedStylist &&
    selectedDate &&
    selectedTime &&
    form.name.trim() &&
    form.email.trim();

  async function submitBooking() {
    if (!ready || loading) return;
    setLoading(true);
    setError("");

    try {
      const res = await fetch(`${getAPI()}/bookings/`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          stylist_id: selectedStylist.id,
          service_id: selectedService.id,
          client_name: form.name,
          client_email: form.email,
          client_phone: form.phone,
          notes: form.notes,
          appointment_time: `${selectedDate}T${selectedTime}:00`,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail =
          typeof data.detail === "string"
            ? data.detail
            : "Could not complete booking. Please try again.";
        setError(detail);
        setLoading(false);
        return;
      }
      setBooking(data);
    } catch (err) {
      console.error(err);
      setError("Could not reach the server. Please try again.");
    }
    setLoading(false);
  }

  function reset() {
    setSelectedService(null);
    setSelectedStylist(null);
    setSelectedDate("");
    setSelectedTime("");
    setForm({ name: "", email: "", phone: "", notes: "" });
    setBooking(null);
    setError("");
  }

  if (booking) {
    return (
      <div style={{ background: theme.bgRaised, minHeight: "100vh", color: theme.text, padding: 24 }}>
        <div
          style={{
            maxWidth: 520,
            margin: "60px auto 0",
            background: theme.card,
            borderRadius: theme.radiusLg,
            padding: 32,
            textAlign: "center",
          }}
        >
          <div
            style={{
              width: 56,
              height: 56,
              borderRadius: "50%",
              background: theme.accent,
              color: theme.accentInk,
              fontSize: 28,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              margin: "0 auto 16px",
            }}
          >
            ✓
          </div>
          <h2 style={{ fontSize: 22, marginBottom: 8 }}>Booking confirmed</h2>
          <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 4 }}>
            {selectedService?.name} with {selectedStylist?.name}
          </p>
          <p style={{ color: theme.textMuted, fontSize: 14, marginBottom: 16 }}>
            {dateTimeLabel}
          </p>
          <p style={{ color: theme.textFaint, fontSize: 12, marginBottom: 24 }}>
            Reference: {String(booking.id)}
          </p>
          <button
            onClick={reset}
            style={{
              background: theme.accent,
              color: theme.accentInk,
              border: "none",
              borderRadius: 10,
              padding: "12px 28px",
              fontSize: 14,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: theme.font,
            }}
          >
            Book another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ background: theme.bgRaised, minHeight: "100vh", color: theme.text, paddingBottom: 24 }}>
      {/* HERO */}
      <div
        style={{
          background: theme.card,
          borderRadius: theme.radiusLg,
          margin: 12,
          padding: 20,
          position: "relative",
          overflow: "hidden",
        }}
      >
        <div
          style={{
            position: "absolute",
            right: 16,
            top: 16,
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: "#2a2a2a",
          }}
        />
        <div style={{ fontSize: 11, color: "#888", letterSpacing: 1, textTransform: "uppercase", marginBottom: 6 }}>
          Accra, East Legon
        </div>
        <div style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>Glam Studio</div>
        <div style={{ fontSize: 13, color: theme.textMuted, marginBottom: 16 }}>
          Premium beauty services, curated for you
        </div>
        <div style={{ display: "flex", gap: 20 }}>
          <Stat value={<>4.9 <span style={{ color: theme.accent, fontSize: 16 }}>★</span></>} label="Rating" />
          <Stat value="340+" label="Clients" />
          <Stat value={String(stylists.length || 0)} label="Stylists" />
        </div>
      </div>

      {/* SERVICES */}
      <div style={{ padding: "16px 12px 0" }}>
        <div style={sectionTitle}>Choose a Service</div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
          {services.map((s) => (
            <ServiceCard
              key={s.id}
              service={s}
              selected={selectedService?.id === s.id}
              onSelect={setSelectedService}
            />
          ))}
        </div>
      </div>

      {/* STYLISTS */}
      <div style={{ padding: "16px 12px 0" }}>
        <div style={sectionTitle}>Pick a Stylist</div>
        {visibleStylists.length === 0 ? (
          <p style={{ color: theme.textFaint, fontSize: 13 }}>
            {selectedService ? "No stylists offer this service yet." : "Loading stylists…"}
          </p>
        ) : (
          <div className="no-scrollbar" style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 4 }}>
            {visibleStylists.map((s) => (
              <StylistPicker
                key={s.id}
                stylist={s}
                selected={selectedStylist?.id === s.id}
                onSelect={setSelectedStylist}
              />
            ))}
          </div>
        )}
      </div>

      {/* DATE */}
      <div style={{ padding: "16px 12px 0" }}>
        <div style={sectionTitle}>Select a Date</div>
        <DateStrip
          dates={dates}
          selected={selectedDate}
          onSelect={(v) => {
            setSelectedDate(v);
            setSelectedTime("");
          }}
        />
      </div>

      {/* TIMES */}
      <div style={{ padding: "16px 12px 0" }}>
        <div style={sectionTitle}>Available Times</div>
        <DatePicker
          slots={slots}
          selected={selectedTime}
          onSelect={setSelectedTime}
          ready={slotsReady}
        />
      </div>

      {/* DETAILS */}
      <div style={{ padding: "16px 12px 0" }}>
        <div style={sectionTitle}>Your Details</div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          <input style={inputStyle} placeholder="Full name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input style={inputStyle} placeholder="Email" type="email" value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })} />
          <input style={inputStyle} placeholder="Phone (optional)" value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 64 }} placeholder="Notes (optional)" value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })} />
        </div>
      </div>

      {/* SUMMARY */}
      <div style={{ margin: "16px 12px 8px" }}>
        <BookingSummary
          service={selectedService}
          stylist={selectedStylist}
          dateTimeLabel={dateTimeLabel}
        />
      </div>

      {error && (
        <div style={{ margin: "0 12px 8px", color: theme.danger, fontSize: 13 }}>{error}</div>
      )}

      {/* CONFIRM */}
      <button
        onClick={submitBooking}
        disabled={!ready || loading}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          width: "calc(100% - 24px)",
          margin: "0 12px 20px",
          padding: 16,
          background: ready ? theme.accent : theme.cardAlt,
          border: `1.5px solid ${ready ? theme.accent : theme.border}`,
          borderRadius: theme.radius,
          color: ready ? theme.accentInk : "#888",
          fontSize: 15,
          fontWeight: 600,
          cursor: ready && !loading ? "pointer" : "default",
          fontFamily: theme.font,
          transition: "all 0.2s",
        }}
      >
        {loading ? "Booking…" : "Confirm Booking"}
      </button>
    </div>
  );
}

function Stat({ value, label }) {
  return (
    <div>
      <div style={{ fontSize: 18, fontWeight: 700, display: "flex", alignItems: "center", gap: 4 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: "#888", marginTop: 2 }}>{label}</div>
    </div>
  );
}
