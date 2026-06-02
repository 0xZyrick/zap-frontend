// ─── colors.js ────────────────────────────────────────────────────────────────
// Colour manipulation utilities. Pure JS, no dependencies.

/** Parse "#rrggbb" → { r, g, b } */
export const hexToRgb = (hex) => {
  const r = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return r ? { r: parseInt(r[1], 16), g: parseInt(r[2], 16), b: parseInt(r[3], 16) } : null;
};

/** Return a hex colour lightened by `amt` (0–255). */
export const lightenHex = (hex, amt = 30) => {
  const c = hexToRgb(hex);
  if (!c) return hex;
  const f = (v) => Math.min(255, v + amt).toString(16).padStart(2, "0");
  return `#${f(c.r)}${f(c.g)}${f(c.b)}`;
};

/** Return a hex colour darkened by `amt` (0–255). */
export const darkenHex = (hex, amt = 25) => {
  const c = hexToRgb(hex);
  if (!c) return hex;
  const f = (v) => Math.max(0, v - amt).toString(16).padStart(2, "0");
  return `#${f(c.r)}${f(c.g)}${f(c.b)}`;
};