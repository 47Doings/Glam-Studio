import React, { useState, useEffect, useCallback, useMemo } from "react";
import Avatar from "../components/Avatar";
import { theme, formatGHS } from "../theme";

const API = (path) =>
  `${localStorage.getItem("apiUrl") || "http://localhost:8000"}${path}`;

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.status === 204 ? null : res.json();
}

const todayStr = () => new Date().toISOString().split("T")[0];
const monthStr = () => new Date().toISOString().slice(0, 7);

const time12h = (t) => {
  if (!t) return "";
  const [h, m] = t.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour = h % 12 === 0 ? 12 : h % 12;
  return `${hour}:${String(m).padStart(2, "0")} ${period}`;
};

const longDate = () =>
  new Date().toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });

const BADGE_STYLE = {
  confirmed: { background: "#0f2e1e", color: "#22c97e" },
  pending: { background: "#2e2a0f", color: "#e8c24a" },
  completed: { background: "#2a1f0f", color: "#e8a44a" },
  cancelled: { background: "#2e0f0f", color: "#e84a4a" },
  active: { background: "#0f2e1e", color: "#22c97e" },
  inactive: { background: "#2e0f0f", color: "#e84a4a" },
};

const FILTERS = ["all", "pending", "confirmed", "completed", "cancelled"];
const TABS = ["Bookings", "Stylists", "Revenue", "Clients"];

function Badge({ status }) {
  const s = BADGE_STYLE[status] || BADGE_STYLE.pending;
  return (
    <span
      style={{
        display: "inline-block",
        padding: "3px 10px",
        borderRadius: 20,
        fontSize: 10,
        fontWeight: 600,
        ...s,
      }}
    >
      {status}
    </span>
  );
}

function StatCard({ label, value, sub, subColor }) {
  return (
    <div style={{ background: theme.card, borderRadius: theme.radius, padding: 14 }}>
      <div style={{ fontSize: 11, color: theme.textFaint, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
      {sub && (
        <div style={{ fontSize: 11, marginTop: 4, color: subColor || "#888" }}>{sub}</div>
      )}
    </div>
  );
}

function Pill({ active, onClick, children, round }) {
  return (
    <div
      onClick={onClick}
      style={{
        padding: round ? "6px 14px" : "8px 14px",
        borderRadius: round ? 20 : 8,
        fontSize: round ? 12 : 13,
        fontWeight: 600,
        cursor: "pointer",
        whiteSpace: "nowrap",
        flexShrink: 0,
        background: active ? (round ? "#fff" : theme.card) : theme.card,
        border: `1.5px solid ${active && !round ? theme.accent : "transparent"}`,
        color: active ? (round ? "#111" : "#fff") : "#888",
      }}
    >
      {children}
    </div>
  );
}

export default function Admin() {
  const [tab, setTab] = useState("Bookings");
  const [bookings, setBookings] = useState([]);
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const [b, s, st] = await Promise.all([
        apiFetch(API("/bookings/")),
        apiFetch(API("/services/")),
        apiFetch(API("/stylists/?active_only=false")),
      ]);
      setBookings(Array.isArray(b) ? b : []);
      setServices(Array.isArray(s) ? s : []);
      setStylists(Array.isArray(st) ? st : []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => {
    const today = todayStr();
    const month = monthStr();
    const earns = (b) => b.status === "confirmed" || b.status === "completed";
    const todays = bookings.filter((b) => (b.booking_date || "").startsWith(today));
    const todayRevenue = todays.filter(earns).reduce((a, b) => a + b.price, 0);
    const monthRevenue = bookings
      .filter((b) => (b.booking_date || "").startsWith(month) && earns(b))
      .reduce((a, b) => a + b.price, 0);
    const pendingToday = todays.filter((b) => b.status === "pending").length;
    const activeStylists = stylists.filter((s) => s.status === "active").length;
    return {
      todayRevenue,
      monthRevenue,
      bookingsToday: todays.length,
      pendingToday,
      activeStylists,
      totalStylists: stylists.length,
    };
  }, [bookings, stylists]);

  const confirm = async (id) => {
    await apiFetch(API(`/bookings/${id}/status?status=confirmed`), {
      method: "PATCH",
    });
    load();
  };

  const cancel = async (id) => {
    await apiFetch(API(`/bookings/${id}/cancel`), { method: "PATCH" });
    load();
  };

  const toggleStylist = async (id, currentStatus) => {
    const newStatus = currentStatus === "active" ? "inactive" : "active";
    await apiFetch(API(`/stylists/${id}?status=${newStatus}`), {
      method: "PATCH",
    });
    load();
  };

  return (
    <div style={{ background: theme.bg, minHeight: "100vh", color: theme.text, padding: 16 }}>
      {/* TOPBAR */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700 }}>Glam Studio</h1>
          <p style={{ fontSize: 12, color: theme.textFaint, marginTop: 2 }}>
            Admin dashboard · Today, {longDate()}
          </p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div
            style={{
              width: 36,
              height: 36,
              background: theme.card,
              borderRadius: 8,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 8a6 6 0 0 0-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" />
            </svg>
            {stats.pendingToday > 0 && (
              <div style={{ width: 8, height: 8, background: theme.danger, borderRadius: "50%", position: "absolute", top: 6, right: 6 }} />
            )}
          </div>
        </div>
      </div>

      {/* STATS */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10, marginBottom: 20 }}>
        <StatCard label="Today's revenue" value={formatGHS(stats.todayRevenue)} />
        <StatCard
          label="Bookings today"
          value={stats.bookingsToday}
          sub={`${stats.pendingToday} pending`}
        />
        <StatCard
          label="Active stylists"
          value={stats.activeStylists}
          sub={`of ${stats.totalStylists} total`}
        />
        <StatCard label="This month" value={formatGHS(stats.monthRevenue)} />
      </div>

      {/* TABS */}
      <div className="no-scrollbar" style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
        {TABS.map((t) => (
          <Pill key={t} active={tab === t} onClick={() => setTab(t)}>
            {t}
          </Pill>
        ))}
      </div>

      {loading && <p style={{ color: theme.textFaint }}>loading…</p>}

      {tab === "Bookings" && (
        <BookingsTab
          bookings={bookings}
          filter={filter}
          setFilter={setFilter}
          onConfirm={confirm}
          onCancel={cancel}
        />
      )}
      {tab === "Stylists" && (
        <StylistsTab stylists={stylists} onChange={load} onToggle={toggleStylist} />
      )}
      {tab === "Revenue" && <RevenueTab bookings={bookings} stylists={stylists} />}
      {tab === "Clients" && <ClientsTab bookings={bookings} />}
    </div>
  );
}

// ── BOOKINGS ──────────────────────────────────────────────────────────────────
function BookingsTab({ bookings, filter, setFilter, onConfirm, onCancel }) {
  const visible = filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <div className="no-scrollbar" style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto" }}>
        {FILTERS.map((f) => (
          <Pill key={f} round active={filter === f} onClick={() => setFilter(f)}>
            {f[0].toUpperCase() + f.slice(1)}
          </Pill>
        ))}
      </div>

      <div style={{ fontSize: 14, fontWeight: 600, color: "#ccc", marginBottom: 12 }}>
        {filter === "all" ? "All bookings" : `${filter[0].toUpperCase() + filter.slice(1)} bookings`}
      </div>

      {visible.length === 0 && (
        <p style={{ color: theme.textFaint, fontSize: 13 }}>No bookings here.</p>
      )}

      <div>
        {visible.map((b) => (
          <div
            key={b.id}
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 12,
              padding: "14px 0",
              borderBottom: `0.5px solid ${theme.borderSubtle}`,
            }}
          >
            <Avatar name={b.client} size={40} />
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 2 }}>{b.client}</div>
              <div style={{ fontSize: 12, color: theme.textFaint }}>
                {b.service} · {b.stylist}
              </div>
              {b.status === "pending" && (
                <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
                  <ActionBtn color={theme.accent} onClick={() => onConfirm(b.id)}>Confirm</ActionBtn>
                  <ActionBtn color={theme.danger} onClick={() => onCancel(b.id)}>Cancel</ActionBtn>
                </div>
              )}
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <div style={{ fontSize: 14, fontWeight: 700 }}>{formatGHS(b.price)}</div>
              <div style={{ fontSize: 11, color: theme.textFaint, marginBottom: 6 }}>
                {b.booking_date} {time12h(b.booking_time)}
              </div>
              <Badge status={b.status} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function ActionBtn({ color, onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{
        padding: "5px 12px",
        borderRadius: 6,
        fontSize: 11,
        fontWeight: 600,
        cursor: "pointer",
        background: theme.cardAlt,
        border: `1px solid ${color}`,
        color,
        fontFamily: theme.font,
      }}
    >
      {children}
    </button>
  );
}

// ── STYLISTS ──────────────────────────────────────────────────────────────────
const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

function StylistsTab({ stylists, onChange, onToggle }) {
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ name: "", specialty: "" });
  const [hours, setHours] = useState({
    monday: { enabled: true, start: "09:00", end: "17:00" },
    tuesday: { enabled: true, start: "09:00", end: "17:00" },
    wednesday: { enabled: true, start: "09:00", end: "17:00" },
    thursday: { enabled: true, start: "09:00", end: "17:00" },
    friday: { enabled: true, start: "09:00", end: "17:00" },
    saturday: { enabled: false, start: "09:00", end: "17:00" },
    sunday: { enabled: false, start: "09:00", end: "17:00" },
  });

  const inputStyle = {
    background: theme.cardAlt,
    border: `1.5px solid ${theme.border}`,
    borderRadius: 8,
    padding: "10px 14px",
    color: theme.text,
    fontFamily: theme.font,
    fontSize: 13,
    outline: "none",
    width: "100%",
  };

  const timeInput = {
    background: theme.cardAlt,
    border: `1.5px solid ${theme.border}`,
    borderRadius: 6,
    padding: "6px 8px",
    color: theme.text,
    fontFamily: theme.font,
    fontSize: 12,
    outline: "none",
    width: 80,
  };

  const save = async () => {
    const working_days = DAYS.filter((d) => hours[d].enabled);
    const working_hours_start = hours[working_days[0]]?.start || "09:00";
    const working_hours_end = hours[working_days[0]]?.end || "17:00";

    const params = new URLSearchParams({
      name: form.name,
      specialty: form.specialty,
      working_hours_start,
      working_hours_end,
      working_days: working_days,
    });

    await apiFetch(API(`/stylists/?${params}`), { method: "POST" });
    setForm({ name: "", specialty: "" });
    setShowForm(false);
    onChange();
  };

  return (
    <div>
      <button
        onClick={() => setShowForm(!showForm)}
        style={{
          padding: "8px 14px",
          borderRadius: 8,
          background: theme.card,
          border: `1.5px solid ${theme.accent}`,
          color: theme.accent,
          fontSize: 13,
          fontWeight: 600,
          cursor: "pointer",
          fontFamily: theme.font,
          marginBottom: 12,
        }}
      >
        {showForm ? "Close" : "+ Add Stylist"}
      </button>

      {showForm && (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 16 }}>
          <input style={inputStyle} placeholder="Name" value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input style={inputStyle} placeholder="Specialty e.g. Full Braids" value={form.specialty}
            onChange={(e) => setForm({ ...form, specialty: e.target.value })} />

          <div style={{ fontSize: 11, color: theme.textFaint, letterSpacing: "1px", textTransform: "uppercase", marginTop: 8 }}>
            Working Days & Hours
          </div>
          {DAYS.map((day) => (
            <div key={day} style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <input
                type="checkbox"
                checked={hours[day].enabled}
                onChange={(e) => setHours({ ...hours, [day]: { ...hours[day], enabled: e.target.checked } })}
              />
              <span style={{ fontSize: 12, color: theme.text, width: 90, textTransform: "capitalize" }}>{day}</span>
              {hours[day].enabled && (
                <>
                  <input type="time" style={timeInput} value={hours[day].start}
                    onChange={(e) => setHours({ ...hours, [day]: { ...hours[day], start: e.target.value } })} />
                  <span style={{ fontSize: 12, color: theme.textFaint }}>to</span>
                  <input type="time" style={timeInput} value={hours[day].end}
                    onChange={(e) => setHours({ ...hours, [day]: { ...hours[day], end: e.target.value } })} />
                </>
              )}
              {!hours[day].enabled && <span style={{ fontSize: 12, color: theme.textFaint }}>Day off</span>}
            </div>
          ))}

          <button
            onClick={save}
            style={{
              padding: "10px 14px",
              borderRadius: 8,
              background: theme.accent,
              border: "none",
              color: theme.accentInk,
              fontSize: 13,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: theme.font,
              marginTop: 8,
            }}
          >
            Save Stylist
          </button>
        </div>
      )}

      {stylists.map((s) => (
        <div
          key={s.id}
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            padding: "12px 0",
            borderBottom: `0.5px solid ${theme.borderSubtle}`,
          }}
        >
          <Avatar name={s.name} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{s.name}</div>
            <div style={{ fontSize: 12, color: theme.textFaint }}>{s.specialty || "—"}</div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Badge status={s.status} />
            <button
              onClick={() => onToggle(s.id, s.status)}
              style={{
                padding: "4px 10px",
                borderRadius: 6,
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                background: theme.cardAlt,
                border: `1px solid ${theme.border}`,
                color: theme.textMuted,
                fontFamily: theme.font,
              }}
            >
              {s.status === "active" ? "Deactivate" : "Activate"}
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── REVENUE ───────────────────────────────────────────────────────────────────
function RevenueTab({ bookings, stylists }) {
  const earns = (b) => b.status === "confirmed" || b.status === "completed";
  const rows = stylists
    .map((s) => {
      const theirs = bookings.filter((b) => b.stylist === s.name && earns(b));
      return {
        id: s.id,
        name: s.name,
        count: theirs.length,
        total: theirs.reduce((a, b) => a + b.price, 0),
      };
    })
    .sort((a, b) => b.total - a.total);
  const grand = rows.reduce((a, r) => a + r.total, 0);

  return (
    <div>
      <div style={{ background: theme.card, borderRadius: theme.radius, padding: 16, marginBottom: 16 }}>
        <div style={{ fontSize: 11, color: theme.textFaint, marginBottom: 6 }}>Total earned (confirmed + completed)</div>
        <div style={{ fontSize: 26, fontWeight: 700, color: theme.accent }}>{formatGHS(grand)}</div>
      </div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#ccc", marginBottom: 12 }}>Revenue by stylist</div>
      {rows.map((r) => (
        <div key={r.id} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `0.5px solid ${theme.borderSubtle}` }}>
          <Avatar name={r.name} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{r.name}</div>
            <div style={{ fontSize: 12, color: theme.textFaint }}>{r.count} booking{r.count === 1 ? "" : "s"}</div>
          </div>
          <div style={{ fontSize: 14, fontWeight: 700 }}>{formatGHS(r.total)}</div>
        </div>
      ))}
    </div>
  );
}

// ── CLIENTS ───────────────────────────────────────────────────────────────────
function ClientsTab({ bookings }) {
  const byClient = {};
  for (const b of bookings) {
    const key = b.client;
    if (!byClient[key]) {
      byClient[key] = { name: b.client, count: 0, total: 0 };
    }
    byClient[key].count += 1;
    if (b.status === "confirmed" || b.status === "completed") {
      byClient[key].total += b.price;
    }
  }
  const rows = Object.values(byClient).sort((a, b) => b.total - a.total);

  return (
    <div>
      <div style={{ fontSize: 14, fontWeight: 600, color: "#ccc", marginBottom: 12 }}>
        Top clients ({rows.length})
      </div>
      {rows.length === 0 && <p style={{ color: theme.textFaint, fontSize: 13 }}>No clients yet.</p>}
      {rows.map((c) => (
        <div key={c.name} style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 0", borderBottom: `0.5px solid ${theme.borderSubtle}` }}>
          <Avatar name={c.name} size={40} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 600 }}>{c.name}</div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>{formatGHS(c.total)}</div>
            <div style={{ fontSize: 11, color: theme.textFaint }}>{c.count} visit{c.count === 1 ? "" : "s"}</div>
          </div>
        </div>
      ))}
    </div>
  );
}