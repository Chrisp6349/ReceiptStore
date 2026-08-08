export function formatPence(pence) {
  return `£${(pence / 100).toFixed(2)}`;
}

export function formatDate(isoString) {
  // SQLite's datetime('now') returns "YYYY-MM-DD HH:MM:SS" (UTC, no
  // offset) — normalise to something Date() parses correctly everywhere.
  const date = new Date(`${isoString.replace(" ", "T")}Z`);
  return date.toLocaleDateString(undefined, { day: "numeric", month: "short", year: "numeric" });
}

export function formatDateTime(isoString) {
  const date = new Date(`${isoString.replace(" ", "T")}Z`);
  return date.toLocaleString(undefined, { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
}
