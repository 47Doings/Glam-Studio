// Shared design tokens for the Glam Studio frontend.

export function applyTheme(mode) {
  const root = document.documentElement;
  if (mode === "light") {
    root.style.setProperty("--bg", "#f5f5f5");
    root.style.setProperty("--bg-raised", "#efefef");
    root.style.setProperty("--card", "#ffffff");
    root.style.setProperty("--card-alt", "#f0f0f0");
    root.style.setProperty("--border", "#ddd");
    root.style.setProperty("--border-subtle", "#e5e5e5");
    root.style.setProperty("--text", "#111");
    root.style.setProperty("--text-muted", "#555");
    root.style.setProperty("--text-faint", "#888");
  } else {
    root.style.setProperty("--bg", "#0a0a0a");
    root.style.setProperty("--bg-raised", "#111");
    root.style.setProperty("--card", "#1a1a1a");
    root.style.setProperty("--card-alt", "#1e1e1e");
    root.style.setProperty("--border", "#2a2a2a");
    root.style.setProperty("--border-subtle", "#1e1e1e");
    root.style.setProperty("--text", "#fff");
    root.style.setProperty("--text-muted", "#999");
    root.style.setProperty("--text-faint", "#666");
  }
}

export const theme = {
  get bg() { return getComputedStyle(document.documentElement).getPropertyValue("--bg").trim() || "#0a0a0a"; },
  get bgRaised() { return getComputedStyle(document.documentElement).getPropertyValue("--bg-raised").trim() || "#111"; },
  get card() { return getComputedStyle(document.documentElement).getPropertyValue("--card").trim() || "#1a1a1a"; },
  get cardAlt() { return getComputedStyle(document.documentElement).getPropertyValue("--card-alt").trim() || "#1e1e1e"; },
  get border() { return getComputedStyle(document.documentElement).getPropertyValue("--border").trim() || "#2a2a2a"; },
  get borderSubtle() { return getComputedStyle(document.documentElement).getPropertyValue("--border-subtle").trim() || "#1e1e1e"; },
  accent: "#22c97e",
  accentHover: "#1db86e",
  accentInk: "#111",
  get text() { return getComputedStyle(document.documentElement).getPropertyValue("--text").trim() || "#fff"; },
  get textMuted() { return getComputedStyle(document.documentElement).getPropertyValue("--text-muted").trim() || "#999"; },
  get textFaint() { return getComputedStyle(document.documentElement).getPropertyValue("--text-faint").trim() || "#666"; },
  danger: "#e84a4a",
  warning: "#e8c24a",
  font: "'DM Sans', sans-serif",
  radius: 12,
  radiusLg: 16,
};

// Deterministic avatar palette (background + foreground) keyed off a name.
const AVATAR_PALETTE = [
  { bg: "#1a3a2e", fg: "#22c97e" },
  { bg: "#3a2a1a", fg: "#e8a44a" },
  { bg: "#3a1a2a", fg: "#e84a9a" },
  { bg: "#1a2a3a", fg: "#4a9ae8" },
  { bg: "#2a1a3a", fg: "#b44ae8" },
  { bg: "#0f2a2a", fg: "#4ae8e8" },
];

export const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase();

export const avatarColors = (name = "") => {
  let h = 0;
  for (const c of name) h = (h * 31 + c.charCodeAt(0)) & 0xffff;
  return AVATAR_PALETTE[h % AVATAR_PALETTE.length];
};

export const formatGHS = (n) =>
  `GHS ${Number(n ?? 0).toLocaleString("en-GH", { maximumFractionDigits: 0 })}`;

export const formatDuration = (mins) => {
  if (!mins) return "";
  if (mins < 60) return `${mins} min`;
  const h = mins / 60;
  return Number.isInteger(h) ? `${h} hr${h > 1 ? "s" : ""}` : `${h} hrs`;
};
