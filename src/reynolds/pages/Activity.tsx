/* Activity: one shared chronological company feed, filtered by source. */
import { useState } from "react";
import { useDemo, openRecord } from "../store";
import { activity, actorName, person } from "../selectors";
import { AGENTS, type ActKind } from "../fixtures";
import { dayOf, fmtDate, fmtTime, rel } from "../format";
import { Page, Panel, Badge, RecLink, Note, Avatar, Grid } from "../ui";
import AgentFace from "../../components/AgentFace";

type Props = { tab: string; params: Record<string, string> };

const TITLES: Record<string, [string, string]> = {
  all: ["Activity", "Everything that changed, newest first. Each event links to its source record."],
  people: ["People", "Site notes, attendance approvals, delivery receipts and office reviews."],
  agents: ["Agents", "Margin warnings, missing-material alerts, briefing compilation and reminder drafts. Agents prepare; people decide."],
  systems: ["Systems", "Demo fixture imports, CSV previews and manual snapshots. No accounting system, bank or Revenue connection exists in this demo."],
};

export default function ActivityPage({ tab }: Props) {
  const s = useDemo();
  const [q, setQ] = useState("");
  const kind = (["people", "agents", "systems"].includes(tab) ? tab : "all") as ActKind | "all";
  const all = activity(s);
  const ql = q.trim().toLowerCase();
  const list = all.filter((e) => (kind === "all" || e.kind === kind)
    && (!ql || (e.title + " " + e.note + " " + actorName(e.actor) + " " + e.refs.map((r) => r.id).join(" ")).toLowerCase().includes(ql)));
  const days = Array.from(new Set(list.map((e) => dayOf(e.at))));
  const count = (k: ActKind) => all.filter((e) => e.kind === k).length;
  const [title, sub] = TITLES[kind];
  return (
    <Page title={title} sub={sub}
      actions={<input className="r-input" value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search events, people, records" aria-label="Search activity" style={{ width: "min(300px, 100%)" }} />}>
      {kind === "all" && (
        <Grid cols="repeat(3, minmax(0,1fr))" style={{ marginBottom: 14 }}>
          <div className="r-stat"><div className="r-stat-label">People</div><div className="r-stat-value" style={{ fontSize: 22 }}>{count("people")}</div></div>
          <div className="r-stat"><div className="r-stat-label">Agents</div><div className="r-stat-value" style={{ fontSize: 22 }}>{count("agents")}</div></div>
          <div className="r-stat"><div className="r-stat-label">Systems (demo imports)</div><div className="r-stat-value" style={{ fontSize: 22 }}>{count("systems")}</div></div>
        </Grid>
      )}
      {kind === "systems" && <div style={{ marginBottom: 14 }}><Note tone="warn">Every system event here is a demo or import event. Nothing has synced with Xero, Sage, a bank feed or Revenue.</Note></div>}
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {days.map((d) => (
          <Panel key={d} title={fmtDate(d, "long")} sub={rel(d, s.clock) + " · " + list.filter((e) => dayOf(e.at) === d).length + " events"} pad={false}>
            <div className="r-list" style={{ padding: "0 20px 6px" }}>
              {list.filter((e) => dayOf(e.at) === d).map((e) => {
                const p = person(e.actor);
                const ag = AGENTS.find((a) => a.id === e.actor);
                return (
                  <div key={e.id} className="r-li">
                    <span className="r-num r-dim" style={{ flex: "none", width: 42, fontSize: 12.5, paddingTop: 4 }}>{fmtTime(e.at)}</span>
                    <span style={{ flex: "none", paddingTop: 1 }}>
                      {p ? <Avatar initials={p.initials} tint={p.tint} size={26} /> : ag ? <AgentFace shape={ag.shape} state="complete" tint={ag.tint} size={26} /> : <SysMark />}
                    </span>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, color: "var(--ink)", lineHeight: 1.45 }}>{e.title}</div>
                      {e.note && <div style={{ fontSize: 12.5, color: "var(--dim)", marginTop: 3, lineHeight: 1.5 }}>{e.note}</div>}
                      <div className="r-pill-row" style={{ marginTop: 7, fontSize: 12 }}>
                        <span className="r-faint">{actorName(e.actor)}</span>
                        <Badge tone={e.provenance === "Demo import" ? "info" : "neutral"}>{e.kind === "systems" ? "Demo import event" : e.provenance}</Badge>
                        {e.refs.map((r) => <RecLink key={r.kind + r.id} r={r} />)}
                      </div>
                    </div>
                    {e.refs[0] && <button type="button" className="r-btn r-btn-quiet r-btn-sm r-hide-sm" onClick={() => openRecord(e.refs[0].kind, e.refs[0].id)}>Source</button>}
                  </div>
                );
              })}
            </div>
          </Panel>
        ))}
        {!days.length && <Note>No events match.</Note>}
      </div>
    </Page>
  );
}

function SysMark() {
  return (
    <span aria-hidden="true" style={{ width: 26, height: 26, borderRadius: 999, display: "inline-flex", alignItems: "center", justifyContent: "center", background: "var(--surface-2)", border: "1px solid var(--border)", color: "var(--dim)" }}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M4.5 7.5c0-1.7 3.4-3 7.5-3s7.5 1.3 7.5 3-3.4 3-7.5 3-7.5-1.3-7.5-3Z M4.5 7.5v9c0 1.7 3.4 3 7.5 3s7.5-1.3 7.5-3v-9" /></svg>
    </span>
  );
}
