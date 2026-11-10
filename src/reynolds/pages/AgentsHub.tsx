/* Agents hub: the seven agents, the morning briefing and the run history.
   All agents are deterministic and fixture-driven; a run never contacts anything. */
import { useState } from "react";
import AgentFace from "../../components/AgentFace";
import { useDemo, go } from "../store";
import { act } from "../actions";
import { AGENTS, CREDENTIALS, type Ref } from "../fixtures";
import { briefing, briefingText, runs, pendingApprovals, personName, jobs, pos, actorName, today, type Seg } from "../selectors";
import { dayOf, fmtDate, fmtDT, greeting, rel, relDT } from "../format";
import { Page, Panel, Grid, Badge, StateBadge, Btn, RecLink, Table, Note, SideSheet, KV, Eyebrow, type Tone } from "../ui";

type Props = { tab: string; params: Record<string, string> };

export default function AgentsHub({ tab, params }: Props) {
  if (tab === "briefing") return <Briefing />;
  if (tab === "runs") return <Runs initial={params?.run} key={params?.run || "runs"} />;
  return <Cards />;
}

const resultTone = (r: string): Tone => (/Issue|waiting|Proposal/i.test(r) ? "warn" : /Draft|Summary|compiled/i.test(r) ? "accent" : "ok");
const faceState = (r: string, on: boolean) => (!on ? "idle" : /Issue/i.test(r) ? "attention" : /Proposal|Draft/i.test(r) ? "waiting" : "complete");

function Cards() {
  const s = useDemo();
  const all = runs(s);
  return (
    <Page title="Agents" sub="Seven agents read the shared records and prepare work. They draft and flag; people decide. Runs are simulated from the demo data and never contact a supplier, customer or bank.">
      <Grid cols="repeat(auto-fill, minmax(300px, 1fr))">
        {AGENTS.map((a) => {
          const last = all.find((r) => r.agent === a.id);
          const on = !!s.agentsOn[a.id];
          return (
            <Panel key={a.id}>
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <AgentFace shape={a.shape} state={faceState(last?.result || "", on)} tint={a.tint} size={44} />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
                    <span className="r-panel-title">{a.name}</span>
                    {on ? <Badge tone={resultTone(last?.result || "")}>{last?.result || "No run yet"}</Badge> : <Badge>Switched off</Badge>}
                  </div>
                  <div className="r-panel-sub">{a.purpose}</div>
                </div>
              </div>
              <div style={{ marginTop: 14, fontSize: 13, lineHeight: 1.55 }}>
                <div className="r-eyebrow" style={{ marginBottom: 4 }}>Latest output{last ? " · " + relDT(last.at, s.clock) : ""}</div>
                {last ? <ul style={{ margin: 0, paddingLeft: 18, color: "var(--body)" }}>{last.outputs.slice(0, 2).map((o, i) => <li key={i}>{o}</li>)}</ul> : <span className="r-dim">No run recorded.</span>}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <Btn kind="primary" small onClick={() => act.runAgent(a.id)} disabled={on ? undefined : "Switched off in Settings, AI controls"}>Run</Btn>
                <Btn small onClick={() => go("Agents", "threads", { agent: a.id })}>Open thread</Btn>
                {last && <Btn small kind="quiet" onClick={() => go("Agents", "runs", { run: last.id })}>Run {last.id}</Btn>}
                <span className="r-faint" style={{ fontSize: 11.5, marginLeft: "auto" }}>Owner {personName(a.owner)}</span>
              </div>
            </Panel>
          );
        })}
      </Grid>
      <Note>Re-running an agent with nothing changed records nothing new. Alerts and tasks are keyed by agent, rule and record, so repeats never duplicate work.</Note>
    </Page>
  );
}

function Segs({ segs }: { segs: Seg[] }) {
  return <>{segs.map((x, i) => !x.ref ? <span key={i}>{x.text}</span>
    : x.ref.id === "__goal" ? <button key={i} type="button" className="r-link" onClick={() => go("Finance", "goals")}>{x.text}</button>
    : <RecLink key={i} r={x.ref}>{x.text}</RecLink>)}</>;
}

function Briefing() {
  const s = useDemo();
  const b = briefing(s);
  const decisions = pendingApprovals(s);
  const d0 = today(s);
  type Up = { at: string; text: string; ref: Ref };
  const up: Up[] = [];
  jobs(s).filter((j) => j.status === "Scheduled" && j.start > d0).forEach((j) => up.push({ at: j.start, text: j.name + " starts (" + j.customerName + ")", ref: { kind: "job", id: j.id } }));
  pos(s).filter((p) => p.status !== "Delivered" && dayOf(p.window) >= d0).forEach((p) => up.push({ at: p.window, text: p.qty + " t " + p.material.toLowerCase() + " for " + p.job + ", " + p.status.toLowerCase(), ref: { kind: "po", id: p.id } }));
  CREDENTIALS.filter((c) => c.expires >= d0 && c.expires <= "2026-12-10").forEach((c) => up.push({ at: c.expires, text: personName(c.person) + "'s " + c.type + " expires" + (s.renewals[c.id] ? " (renewal booked)" : ""), ref: { kind: "credential", id: c.id } }));
  up.sort((a, b2) => a.at.localeCompare(b2.at));
  const sections = ["Today", "Money"];
  return (
    <Page title="Morning briefing" sub={"Compiled from the current records at " + fmtDT(s.clock) + ". It rewrites itself when anything changes."}
      actions={<Btn onClick={() => act.runAgent("briefing")}>Recompile</Btn>}>
      <Panel title={greeting(s.clock) + ", Florin."} sub="Message form, as it would be sent to you">
        <p style={{ margin: 0, fontSize: 15, lineHeight: 1.7, color: "var(--body)", maxWidth: "78ch" }}>{briefingText(s)}</p>
      </Panel>
      <Grid cols="minmax(0,1.4fr) minmax(0,1fr)" style={{ marginTop: 14 }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {sections.map((sec) => (
            <Panel key={sec} title={sec}>
              <div className="r-list">
                {b.filter((x) => x.section === sec).map((x, i) => (
                  <div key={i} className="r-li" style={{ fontSize: 14, lineHeight: 1.6 }}>
                    <div style={{ flex: 1, minWidth: 0 }}><Segs segs={x.segs} /></div>
                    {x.owner && <span className="r-faint" style={{ flex: "none", fontSize: 11.5 }}>{personName(x.owner)}</span>}
                  </div>
                ))}
              </div>
            </Panel>
          ))}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <Panel title="Decisions" sub={decisions.length + " waiting"} right={<Btn small onClick={() => go("Work", "approvals")}>Approvals</Btn>}>
            <div className="r-list">
              {decisions.map((t) => (
                <div key={t.id} className="r-li" style={{ fontSize: 13 }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div>{t.title}</div>
                    <div className="r-faint" style={{ fontSize: 11.5, marginTop: 2 }}>{t.ownerName} · due {relDT(t.due, s.clock)} · <RecLink r={t.ref} /></div>
                  </div>
                  <StateBadge state={t.status} />
                </div>
              ))}
              {!decisions.length && <div className="r-dim" style={{ fontSize: 13 }}>No decisions waiting.</div>}
            </div>
          </Panel>
          <Panel title="Coming next">
            <div className="r-list">
              {up.slice(0, 8).map((u, i) => (
                <div key={i} className="r-li" style={{ fontSize: 13 }}>
                  <span className="r-num r-dim" style={{ flex: "none", width: 74 }}>{fmtDate(u.at, "dow")}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>{u.text} · <RecLink r={u.ref} /><span className="r-faint"> · {rel(u.at, s.clock)}</span></div>
                </div>
              ))}
            </div>
          </Panel>
        </div>
      </Grid>
    </Page>
  );
}

function Runs({ initial }: { initial?: string }) {
  const s = useDemo();
  const list = runs(s);
  const [open, setOpen] = useState<string | null>(initial || null);
  const r = list.find((x) => x.id === open);
  return (
    <Page title="Runs" sub="Every agent run in order, newest first. Runs are simulated from the demo data: inputs and outputs are shown so you can check the working.">
      <Panel pad={false}>
        <Table keyOf={(x) => x.id} rows={list} onRow={(x) => setOpen(x.id)}
          cols={[
            { k: "t", label: "Time", w: "1fr", render: (x) => <span className="r-num">{relDT(x.at, s.clock)}</span> },
            { k: "a", label: "Agent", w: "1.1fr", render: (x) => <span style={{ color: "var(--ink)" }}>{actorName(x.agent)}</span> },
            { k: "g", label: "Trigger", w: "1.2fr", hideSm: true, render: (x) => <span className="r-dim">{x.trigger}</span> },
            { k: "r", label: "Records", w: "1.2fr", render: (x) => <span className="r-pill-row">{x.refs.map((rf) => <RecLink key={rf.kind + rf.id} r={rf} />)}</span> },
            { k: "o", label: "Result", w: "1fr", render: (x) => <Badge tone={resultTone(x.result)}>{x.result}</Badge> },
          ]}
          foot={list.length + " runs · " + (list.length - 7) + " added in this demo session"} />
      </Panel>
      {r && (
        <SideSheet title={actorName(r.agent) + " · " + r.id} sub={fmtDT(r.at) + " · " + r.trigger} onClose={() => setOpen(null)}
          footer={<><Btn kind="primary" onClick={() => act.runAgent(r.agent)}>Run again</Btn><span className="r-faint" style={{ fontSize: 12 }}>Deterministic. No tasks are duplicated.</span></>}>
          <KV rows={[["Agent", actorName(r.agent)], ["Result", <Badge tone={resultTone(r.result)}>{r.result}</Badge>], ["Records", <span className="r-pill-row">{r.refs.map((rf) => <RecLink key={rf.kind + rf.id} r={rf} />)}</span>]]} />
          <div><Eyebrow style={{ marginBottom: 8 }}>Inputs</Eyebrow><ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>{r.inputs.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
          <div><Eyebrow style={{ marginBottom: 8 }}>Outputs</Eyebrow><ul style={{ margin: 0, paddingLeft: 18, fontSize: 13, lineHeight: 1.6 }}>{r.outputs.map((x, i) => <li key={i}>{x}</li>)}</ul></div>
          <Note>Simulated run. Proposed actions wait for a named person. Nothing was sent or posted.</Note>
        </SideSheet>
      )}
    </Page>
  );
}

