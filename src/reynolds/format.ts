/* Formatting helpers. Dates are naive Europe/Dublin wall-clock strings; we do all
   arithmetic in UTC so the browser's own zone never leaks into the frozen scenario. */

export function eur(n: number, opts: { sign?: boolean } = {}): string {
  const r = Math.round(n);
  const s = "€" + Math.abs(r).toLocaleString("en-IE");
  if (r < 0) return "−" + s;
  return opts.sign && r > 0 ? "+" + s : s;
}
export function pct(n: number, dp = 1): string {
  return (Math.round(n * Math.pow(10, dp)) / Math.pow(10, dp)).toFixed(dp) + "%";
}
export function ms(s: string): number {
  const [d, t] = s.split("T");
  const [y, m, dd] = d.split("-").map(Number);
  const [hh, mm] = (t || "00:00").split(":").map(Number);
  return Date.UTC(y, m - 1, dd, hh || 0, mm || 0);
}
export function dayOf(s: string): string { return s.slice(0, 10); }
export function daysBetween(a: string, b: string): number {
  return Math.round((ms(dayOf(b)) - ms(dayOf(a))) / 86400000);
}
export function addDays(d: string, n: number): string {
  return new Date(ms(dayOf(d)) + n * 86400000).toISOString().slice(0, 10);
}
const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const MON = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export function fmtDate(s: string, style: "short" | "dow" | "long" | "dm" = "short"): string {
  if (!s) return "";
  const dt = new Date(ms(s));
  const dm = dt.getUTCDate() + " " + MON[dt.getUTCMonth()];
  if (style === "dm") return dm;
  if (style === "dow") return DOW[dt.getUTCDay()] + " " + dm;
  if (style === "long") return DOW[dt.getUTCDay()] + " " + dm + " " + dt.getUTCFullYear();
  return dm;
}
export function fmtTime(s: string): string { return s.includes("T") ? s.slice(11, 16) : ""; }
export function fmtDT(s: string): string { return fmtDate(s, "dow") + (s.includes("T") ? ", " + fmtTime(s) : ""); }
export function dow(s: string): string { return DOW[new Date(ms(s)).getUTCDay()]; }

/** "today", "tomorrow", "yesterday", "in 3 days", "4 days ago" relative to the demo clock. */
export function rel(s: string, clock: string): string {
  const d = daysBetween(clock, s);
  if (d === 0) return "today";
  if (d === 1) return "tomorrow";
  if (d === -1) return "yesterday";
  return d > 0 ? "in " + d + " days" : -d + " days ago";
}
export function relDT(s: string, clock: string): string {
  const r = rel(s, clock);
  const t = fmtTime(s);
  return (r === "today" || r === "tomorrow" || r === "yesterday" ? r[0].toUpperCase() + r.slice(1) : fmtDate(s, "dow")) + (t ? " " + t : "");
}
export function greeting(clock: string): string {
  const h = Number(clock.slice(11, 13));
  return h < 12 ? "Good morning" : h < 18 ? "Good afternoon" : "Good evening";
}
export function plural(n: number, one: string, many?: string): string {
  return n + " " + (n === 1 ? one : many || one + "s");
}
