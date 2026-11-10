/* Shared building blocks for the Reynolds pages. They only use Pulse tokens
   (var(--surface), var(--border), var(--card-r) …) so every theme still applies. */
import { Fragment, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Ref } from "./fixtures";
import { openRecord, go } from "./store";

export type Tone = "ok" | "warn" | "bad" | "neutral" | "accent" | "info";
const TONE: Record<Tone, [string, string]> = {
  ok: ["var(--ok)", "var(--ok-soft)"], warn: ["var(--warn)", "var(--warn-soft)"], bad: ["var(--bad)", "var(--bad-soft)"],
  neutral: ["var(--dim)", "var(--surface-2)"], accent: ["var(--accent)", "var(--accent-soft)"], info: ["#8fb8e8", "rgba(143,184,232,.13)"],
};
export const toneColor = (t: Tone) => TONE[t][0];

export function Page({ title, sub, actions, children, wide }: { title: ReactNode; sub?: ReactNode; actions?: ReactNode; children: ReactNode; wide?: boolean }) {
  return (
    <div className="r-page" style={{ maxWidth: wide ? 1480 : 1320 }}>
      <div className="r-page-head">
        <div style={{ minWidth: 0, flex: "1 1 320px" }}>
          <h1 className="r-h1">{title}</h1>
          {sub && <div className="r-sub">{sub}</div>}
        </div>
        {actions && <div className="r-actions">{actions}</div>}
      </div>
      {children}
    </div>
  );
}

export function Panel({ title, sub, right, children, pad = true, style, id, tone }: { title?: ReactNode; sub?: ReactNode; right?: ReactNode; children?: ReactNode; pad?: boolean; style?: CSSProperties; id?: string; tone?: Tone }) {
  return (
    <section id={id} className="r-panel" style={{ ...(tone ? { borderColor: "color-mix(in srgb, " + TONE[tone][0] + " 38%, var(--border))" } : null), ...style }}>
      {(title || right) && (
        <div className="r-panel-head">
          <div style={{ minWidth: 0, flex: 1 }}>
            {title && <div className="r-panel-title">{title}</div>}
            {sub && <div className="r-panel-sub">{sub}</div>}
          </div>
          {right && <div style={{ flex: "none", display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap" }}>{right}</div>}
        </div>
      )}
      <div style={pad ? { padding: title || right ? "4px 20px 18px" : "18px 20px" } : undefined}>{children}</div>
    </section>
  );
}

/** Responsive grid: columns collapse to one below 760px. */
export function Grid({ cols = "1fr 1fr", gap = 14, children, style }: { cols?: string; gap?: number; children: ReactNode; style?: CSSProperties }) {
  return <div className="r-grid" style={{ gridTemplateColumns: cols, gap, ...style }}>{children}</div>;
}

export function Eyebrow({ children, style }: { children: ReactNode; style?: CSSProperties }) {
  return <div className="r-eyebrow" style={style}>{children}</div>;
}

export function Stat({ label, value, sub, tone, onClick, big }: { label: ReactNode; value: ReactNode; sub?: ReactNode; tone?: Tone; onClick?: () => void; big?: boolean }) {
  return (
    <div className={"r-stat" + (onClick ? " r-click" : "")} onClick={onClick} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}>
      <div className="r-stat-label">{label}</div>
      <div className="r-stat-value" style={{ fontSize: big ? 30 : 24, color: tone ? TONE[tone][0] : undefined }}>{value}</div>
      {sub && <div className="r-stat-sub">{sub}</div>}
    </div>
  );
}

export function Badge({ tone = "neutral", children, title }: { tone?: Tone; children: ReactNode; title?: string }) {
  return <span className="r-badge" title={title} style={{ color: TONE[tone][0], background: TONE[tone][1] }}>{children}</span>;
}

/** Readiness / status label: always text, colour only supports it. */
export function StateBadge({ state }: { state: string }) {
  const t: Tone = /^(Live|In progress)/.test(state) ? "info" : /^(Ready|Done|Delivered|Paid|Approved|Valid|Available|Reviewed|Completed|Confirmed|Pass|Accepted|Returned)/.test(state) ? "ok"
    : /^(Blocked|Unavailable|Overdue|Expired|Fail|Critical|Declined)/.test(state) ? "bad"
    : /^(Draft|Planned|Scheduled|Proposed|Not yet due|To do|Sent)/.test(state) ? "neutral" : "warn";
  const icon = t === "ok" ? "✓" : t === "bad" ? "■" : t === "warn" ? "!" : t === "info" ? "▸" : "·";
  return <Badge tone={t}><span aria-hidden="true" style={{ fontWeight: 700 }}>{icon}</span> {state}</Badge>;
}

export function Btn({ kind = "ghost", onClick, disabled, title, children, small, type }: { kind?: "primary" | "ghost" | "quiet" | "danger"; onClick?: () => void; disabled?: boolean | string; title?: string; children: ReactNode; small?: boolean; type?: "button" | "submit" }) {
  const why = typeof disabled === "string" ? disabled : undefined;
  return (
    <button type={type || "button"} className={"r-btn r-btn-" + kind + (small ? " r-btn-sm" : "")} onClick={disabled ? undefined : onClick}
      disabled={!!disabled} aria-disabled={!!disabled} title={why || title}>
      {children}
    </button>
  );
}

/** Link to any record: opens the shared record drawer. */
export function RecLink({ r, children, title }: { r: Ref; children?: ReactNode; title?: string }) {
  return (
    <button type="button" className="r-link" title={title} onClick={(e) => { e.stopPropagation(); if (r.id === "__goal") go("Finance", "goals"); else openRecord(r.kind, r.id); }}>
      {children ?? r.id}
    </button>
  );
}
export function PageLink({ page, tab, params, children }: { page: string; tab?: string; params?: Record<string, string>; children: ReactNode }) {
  return <button type="button" className="r-link" onClick={(e) => { e.stopPropagation(); go(page, tab, params); }}>{children}</button>;
}

export type Col<T> = { k: string; label: ReactNode; w?: string; align?: "left" | "right" | "center"; render: (row: T) => ReactNode; hideSm?: boolean };
export function Table<T>({ cols, rows, onRow, empty, keyOf, foot, dense }: { cols: Col<T>[]; rows: T[]; onRow?: (r: T) => void; empty?: ReactNode; keyOf: (r: T) => string; foot?: ReactNode; dense?: boolean }) {
  const tpl = cols.map((c) => c.w || "1fr").join(" ");
  return (
    <div className="r-table" role="table">
      <div className="r-tr r-th" role="row" style={{ gridTemplateColumns: tpl }}>
        {cols.map((c) => <div key={c.k} role="columnheader" className={c.hideSm ? "r-hide-sm" : undefined} style={{ textAlign: c.align || "left" }}>{c.label}</div>)}
      </div>
      {rows.map((r) => (
        <div key={keyOf(r)} role="row" className={"r-tr" + (onRow ? " r-click" : "") + (dense ? " r-dense" : "")} style={{ gridTemplateColumns: tpl }}
          onClick={onRow ? () => onRow(r) : undefined} tabIndex={onRow ? 0 : undefined} onKeyDown={onRow ? (e) => { if (e.key === "Enter") onRow(r); } : undefined}>
          {cols.map((c) => <div key={c.k} role="cell" className={c.hideSm ? "r-hide-sm" : undefined} style={{ textAlign: c.align || "left" }}><span className="r-cell-label">{c.label}</span>{c.render(r)}</div>)}
        </div>
      ))}
      {!rows.length && <div className="r-empty">{empty || "Nothing here."}</div>}
      {foot && <div className="r-tfoot">{foot}</div>}
    </div>
  );
}

export function Toggle({ on, onChange, label, sub, disabled }: { on: boolean; onChange: (v: boolean) => void; label: ReactNode; sub?: ReactNode; disabled?: boolean | string }) {
  return (
    <label className="r-toggle" title={typeof disabled === "string" ? disabled : undefined} style={{ opacity: disabled ? 0.55 : 1 }}>
      <input type="checkbox" checked={on} disabled={!!disabled} onChange={(e) => onChange(e.target.checked)} />
      <span className="r-toggle-track" aria-hidden="true"><span className="r-toggle-knob" /></span>
      <span style={{ minWidth: 0 }}>
        <span style={{ display: "block", fontSize: 13.5, color: "var(--ink)" }}>{label}</span>
        {sub && <span style={{ display: "block", fontSize: 12, color: "var(--dim)", marginTop: 2 }}>{sub}</span>}
      </span>
    </label>
  );
}

export function Field({ label, children, help }: { label: ReactNode; children: ReactNode; help?: ReactNode }) {
  return (
    <label className="r-field">
      <span className="r-field-label">{label}</span>
      {children}
      {help && <span className="r-field-help">{help}</span>}
    </label>
  );
}

export function Seg<T extends string>({ value, options, onChange }: { value: T; options: { id: T; label: ReactNode }[]; onChange: (v: T) => void }) {
  return (
    <div className="r-seg" role="tablist">
      {options.map((o) => (
        <button key={o.id} type="button" role="tab" aria-selected={o.id === value} className={"r-seg-btn" + (o.id === value ? " on" : "")} onClick={() => onChange(o.id)}>{o.label}</button>
      ))}
    </div>
  );
}

/** A horizontal bar for comparisons; `max` sets the scale shared by sibling bars. */
export function Bar({ value, max, tone = "accent", label }: { value: number; max: number; tone?: Tone; label?: string }) {
  const w = max > 0 ? Math.max(0, Math.min(100, (value / max) * 100)) : 0;
  return <div className="r-bar" aria-label={label} title={label}><span style={{ width: w + "%", background: TONE[tone][0] }} /></div>;
}

export function KV({ rows }: { rows: [ReactNode, ReactNode][] }) {
  return (
    <dl className="r-kv">
      {rows.map(([k, v], i) => <Fragment key={i}><dt>{k}</dt><dd>{v}</dd></Fragment>)}
    </dl>
  );
}

export function Note({ children, tone = "neutral" }: { children: ReactNode; tone?: Tone }) {
  return <div className="r-note" style={{ borderColor: "color-mix(in srgb, " + TONE[tone][0] + " 35%, var(--border))" }}>{children}</div>;
}

export function Avatar({ initials, tint, size = 28 }: { initials: string; tint: string; size?: number }) {
  return <span className="r-avatar" style={{ width: size, height: size, background: tint, fontSize: size * 0.36 }}>{initials}</span>;
}

/** Small overlay drawer used by pages for local detail (e.g. a run). */
export function SideSheet({ title, sub, onClose, children, footer }: { title: ReactNode; sub?: ReactNode; onClose: () => void; children: ReactNode; footer?: ReactNode }) {
  /* Portalled to the themed app root: glass panels use backdrop-filter, which would
     otherwise trap a position:fixed sheet inside the panel. */
  const host = typeof document !== "undefined" ? (document.querySelector("[data-theme]") as HTMLElement | null) : null;
  const sheet = (
    <div className="r-scrim" onClick={onClose} onKeyDown={(e) => { if (e.key === "Escape") onClose(); }}>
      <aside className="r-sheet" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="r-sheet-head">
          <div style={{ flex: 1, minWidth: 0 }}>
            <div className="r-sheet-title">{title}</div>
            {sub && <div className="r-sub" style={{ marginTop: 4 }}>{sub}</div>}
          </div>
          <button type="button" className="r-icon-btn" onClick={onClose} aria-label="Close">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round"><path d="M6 6l12 12 M18 6 6 18" /></svg>
          </button>
        </div>
        <div className="r-sheet-body">{children}</div>
        {footer && <div className="r-sheet-foot">{footer}</div>}
      </aside>
    </div>
  );
  return host ? createPortal(sheet, host) : sheet;
}

/** Save a small text file locally: the demo's mock "download". */
export function downloadText(name: string, text: string) {
  const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
