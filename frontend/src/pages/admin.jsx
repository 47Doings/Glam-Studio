import React from "react";
import { useState, useEffect, useCallback } from "react";

// ── helpers ──────────────────────────────────────────────────────────────────
const API = (path) =>
  `${localStorage.getItem("apiUrl") || "http://localhost:8000"}${path}`;

const initials = (name = "") =>
  name
    .split(" ")
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

const avatarColor = (name = "") => {
  const palette = [
    "#b5a27a", "#8fb5a2", "#a27ab5", "#7ab5b0",
    "#b57a8f", "#a2b57a", "#7a8fb5", "#b5a27a",
  ];
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return palette[h % palette.length];
};

const fmt = (n) =>
  `GHS ${Number(n ?? 0).toLocaleString("en-GH", { minimumFractionDigits: 0 })}`;

const inputStyle = {
  background: "#0d0d0d",
  border: "1px solid #2a2a2a",
  borderRadius: 8,
  padding: "10px 14px",
  color: "#f0ebe0",
  fontFamily: "'DM Mono', monospace",
  fontSize: 13,
  outline: "none",
  width: "100%",
  boxSizing: "border-box",
};

const STATUS_STYLE = {
  confirmed: { bg: "#1a2e1a", color: "#6fcf97", dot: "#6fcf97" },
  pending: { bg: "#2e2a1a", color: "#f2c94c", dot: "#f2c94c" },
  completed: { bg: "#1a2328", color: "#56cfe1", dot: "#56cfe1" },
  cancelled: { bg: "#2e1a1a", color: "#eb5757", dot: "#eb5757" },
};

async function apiFetch(url, opts = {}) {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...(opts.headers || {}) },
    ...opts,
  });
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.status === 204 ? null : res.json();
}

function Avatar({ name, size = 40 }) {
  return (
    <div
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: avatarColor(name),
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'DM Mono', monospace",
        fontWeight: 600,
        fontSize: size * 0.35,
        color: "#0a0a0a",
      }}
    >
      {initials(name)}
    </div>
  );
}

function StatusBadge({ status }) {
  const s = STATUS_STYLE[status] || STATUS_STYLE.pending;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        background: s.bg,
        color: s.color,
        borderRadius: 20,
        padding: "3px 10px",
        fontSize: 11,
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: "50%", background: s.dot }} />
      {status}
    </span>
  );
}

// ── BOOKINGS TAB ─────────────────────────────────────────────────────────────
function BookingsTab() {
  const [bookings, setBookings] = useState([]);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await apiFetch(API("/bookings/"));
      setBookings(Array.isArray(data) ? data : data.results || []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const confirm = async (id) => {
    await apiFetch(API(`/bookings/${id}`), {
      method: "PATCH",
      body: JSON.stringify({ status: "confirmed" }),
    });
    load();
  };

  const cancel = async (id) => {
    await apiFetch(API(`/bookings/${id}/cancel`), { method: "PATCH" });
    load();
  };

  const remove = async (id) => {
    if (!window.confirm("Delete this booking?")) return;
    await apiFetch(API(`/bookings/${id}`), { method: "DELETE" });
    load();
  };

  const visible =
    filter === "all" ? bookings : bookings.filter((b) => b.status === filter);

  return (
    <div>
      <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
        {["all", "pending", "confirmed", "completed", "cancelled"].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            style={{
              padding: "6px 14px",
              borderRadius: 20,
              border: filter === f ? "1px solid #b5a27a" : "1px solid #2a2a2a",
              background: "transparent",
              color: filter === f ? "#b5a27a" : "#666",
              cursor: "pointer",
            }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <p>loading...</p>}

      {visible.map((b) => {
        const client = b.client_name || "Client";
        const service = b.service_name || "—";
        const stylist = b.stylist_name || "—";

        return (
          <div key={b.id} style={{ display: "flex", justifyContent: "space-between", padding: 12, borderBottom: "1px solid #1c1c1c" }}>
            <div>
              <div>{client}</div>
              <div style={{ fontSize: 12, color: "#666" }}>
                {service} · {stylist}
              </div>

              {b.status === "pending" && (
                <div style={{ marginTop: 8, display: "flex", gap: 8 }}>
                  <button onClick={() => confirm(b.id)}>Confirm</button>
                  <button onClick={() => cancel(b.id)}>Cancel</button>
                </div>
              )}
            </div>

            <div style={{ textAlign: "right" }}>
              <StatusBadge status={b.status} />
              <div style={{ marginTop: 6 }}>
                <button onClick={() => remove(b.id)}>✕</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── STYLISTS TAB ─────────────────────────────────────────────────────────────
function StylistsTab() {
  const [stylists, setStylists] = useState([]);
  const [form, setForm] = useState({ name: "", bio: "", specialties: "", service_ids: "" });
  const [showForm, setShowForm] = useState(false);

  const load = useCallback(async () => {
    const data = await apiFetch(API("/stylists/"));
    setStylists(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const save = async () => {
    await apiFetch(API("/stylists/"), {
      method: "POST",
      body: JSON.stringify({
        name: form.name,
        bio: form.bio,
        specialties: form.specialties.split(",").map((s) => s.trim()).filter(Boolean),
        service_ids: form.service_ids.split(",").map((s) => s.trim()).filter(Boolean),
      }),
    });
    setForm({ name: "", bio: "", specialties: "", service_ids: "" });
    setShowForm(false);
    load();
  };

  return (
    <div>
      <button onClick={() => setShowForm(!showForm)}>+ Add Stylist</button>

      {showForm && (
        <div style={{ marginTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
          <input style={inputStyle} placeholder="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <input style={inputStyle} placeholder="Bio" value={form.bio} onChange={(e) => setForm({ ...form, bio: e.target.value })} />
          <input style={inputStyle} placeholder="Specialties (comma separated, e.g. Haircut, Braiding)" value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} />
          <input style={inputStyle} placeholder="Service IDs (comma separated, e.g. svc-0001, svc-0002)" value={form.service_ids} onChange={(e) => setForm({ ...form, service_ids: e.target.value })} />
          <button onClick={save}>Save</button>
        </div>
      )}

      {stylists.map((s) => (
        <div key={s.id} style={{ display: "flex", gap: 10, padding: "10px 0", borderBottom: "1px solid #1c1c1c" }}>
          <Avatar name={s.name} />
          <div>
            <div>{s.name}</div>
            <div style={{ fontSize: 12, color: "#666" }}>
              {s.specialties?.join(", ") || "—"}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ── SERVICES TAB ─────────────────────────────────────────────────────────────
function ServicesTab() {
  const [services, setServices] = useState([]);

  const load = useCallback(async () => {
    const data = await apiFetch(API("/services/"));
    setServices(data);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return (
    <div>
      {services.map((s) => (
        <div key={s.id} style={{ padding: 10, borderBottom: "1px solid #1c1c1c" }}>
          <div>{s.name}</div>
          <div style={{ color: "#666", fontSize: 13 }}>{fmt(s.price)}</div>
        </div>
      ))}
    </div>
  );
}

// ── MAIN ADMIN ───────────────────────────────────────────────────────────────
export default function Admin() {
  const [tab, setTab] = useState("Bookings");

  return (
    <div style={{ padding: 20, color: "#f0ebe0" }}>
      <div style={{ display: "flex", gap: 10 }}>
        {["Bookings", "Stylists", "Services"].map((t) => (
          <button key={t} onClick={() => setTab(t)}>
            {t}
          </button>
        ))}
      </div>

      <div style={{ marginTop: 20 }}>
        {tab === "Bookings" && <BookingsTab />}
        {tab === "Stylists" && <StylistsTab />}
        {tab === "Services" && <ServicesTab />}
      </div>
    </div>
  );
}