// Shared design tokens for the Glam Studio frontend.
export const theme = {
  bg: "#0a0a0a",
  bgRaised: "#111",
  card: "#1a1a1a",
  cardAlt: "#1e1e1e",
  border: "#2a2a2a",
  borderSubtle: "#1e1e1e",
  accent: "#22c97e",
  accentHover: "#1db86e",
  accentInk: "#111",
  text: "#fff",
  textMuted: "#999",
  textFaint: "#666",
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
