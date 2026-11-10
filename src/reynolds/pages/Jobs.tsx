/* Jobs: the small sales-to-delivery pipeline. Every figure comes from selectors. */
import { useState, type ReactNode } from "react";
import { useDemo, go, type DemoState } from "../store";
import { act } from "../actions";
import {
  activity, actorName, assetOn, customer, invoices, jobById, jobs, month, monthJobs, nextCriticalDate, personName, pipeline, pos, readiness, today,
  type JobView,
} from "../selectors";
import { COST_LABEL, DOCUMENTS, HIRE, PEOPLE, QUOTES, VARIATION, type JobStatus, type Ref } from "../fixtures";
import { dayOf, eur, fmtDate, fmtDT, fmtTime, pct, rel } from "../format";
import { Badge, Btn, Field, Grid, KV, Note, Page, Panel, RecLink, Seg, StateBadge, Stat, Table, type Tone } from "../ui";

type Props = { tab: string; params: Record<string, string> };

export default function JobsPage({ tab, params }: Props) {
  const s = useDemo();
  if (tab === "quotes") return <Quotes s={s} />;
  if (tab === "board") return <Board s={s} />;
  if (tab === "completed") return <Completed s={s} />;
  if (tab === "detail") return <Detail key={(params.job || "J104") + (params.sub || "")} s={s} jobId={params.job || "J104"} initialSub={params.sub as Sub | undefined} />;
  return <Overview s={s} />;
}

/* ── shared bits ───────────────────────────────────────────────────────── */
const marginTone = (j: JobView): Tone => (j.overrun > 0 ? "warn" : j.margin < 18 ? "warn" : "ok");
function OpenJob({ id, children }: { id: string; children?: ReactNode }) {
  return <button type="button" className="r-link" onClick={() => go("Jobs", "detail", { job: id })}>{children ?? id}</button>;
}
function jobReady(s: DemoState, j: JobView) {
  const d = j.id === "J105" ? "2026-11-11" : nextCriticalDate(s, j.id);
  return d ? { date: d, r: readiness(s, j.id, d) } : null;
}
function ReadyLine({ s, j }: { s: DemoState; j: JobView }) {
  if (j.status === "Completed") return <span className="r-dim">Completed {j.completedOn ? fmtDate(j.completedOn) : ""}</span>;
  const x = jobReady(s, j);
  if (!x) return <span className="r-dim">No delivery pending</span>;
  return (
    <span style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
      <StateBadge state={x.r.overall} />
      <span className="r-dim" style={{ fontSize: 12 }}>{fmtDate(x.date, "dow")}{x.r.blockers.length ? ", " + x.r.blockers.length + " open item" + (x.r.blockers.length > 1 ? "s" : "") : ""}</span>
    </span>
  );
}

/* ── Overview ──────────────────────────────────────────────────────────── */
function Overview({ s }: { s: DemoState }) {
  const m = month(s);
  const live = m.jobs.filter((j) => j.status === "Live");
  const d = today(s);
  const upcoming = jobs(s).filter((j) => j.status === "Scheduled" && j.start >= d).sort((a, b) => a.start.localeCompare(b.start));
  const risks = m.jobs.filter((j) => j.overrun > 0 || (j.status !== "Completed" && j.margin < 18));
  return (
    <Page title="Jobs" sub="November work from accepted job to completion. Values are net of VAT; quotes are kept out until accepted.">
      <Grid cols="repeat(4, minmax(0,1fr))" style={{ marginBottom: 14 }}>
        <Stat label="November accepted value" value={eur(m.value)} sub={m.jobs.length + " jobs, not cash received"} />
        <Stat label="Live / scheduled / completed" value={m.live.count + " / " + m.scheduled.count + " / " + m.completed.count} sub={eur(m.awaitingCompletion) + " awaiting completion"} onClick={() => go("Jobs", "board")} />
        <Stat label="Forecast gross profit" value={eur(m.gp)} sub={pct(m.margin, 2) + " forecast margin"} />
        <Stat label="Open quotes (not booked)" value={eur(pipeline(s).value)} sub={pipeline(s).open.length + " quotes"} onClick={() => go("Jobs", "quotes")} />
      </Grid>

      <Panel title="Live now" sub="Next action and who owns it. Readiness is for each job's next delivery date." style={{ marginBottom: 14 }} pad={false}>
        <div className="r-list" style={{ padding: "0 20px 8px" }}>
          {live.map((j) => (
            <div key={j.id} className="r-li" style={{ flexWrap: "wrap" }}>
              <div style={{ flex: "1 1 260px", minWidth: 0 }}>
                <div style={{ fontSize: 14.5, fontWeight: 600 }}><OpenJob id={j.id}>{j.id} {j.name}</OpenJob></div>
                <div className="r-dim" style={{ fontSize: 12.5, marginTop: 3 }}>{j.customerName} · {j.area} · {fmtDate(j.start)} to {fmtDate(j.end)}</div>
                <div style={{ fontSize: 13, marginTop: 8 }}>{j.nextAction} <span className="r-faint">· {personName(j.nextOwner)}</span></div>
              </div>
              <div style={{ flex: "0 1 220px", display: "flex", flexDirection: "column", gap: 6, alignItems: "flex-start" }}>
                <ReadyLine s={s} j={j} />
                <span style={{ fontSize: 12.5 }}>GP <span className="r-num">{eur(j.profit)}</span> <span className="r-dim">({pct(j.margin)})</span>{j.overrun > 0 && <> <Badge tone="warn">{eur(j.overrun)} over budget</Badge></>}</span>
              </div>
            </div>
          ))}
        </div>
      </Panel>

      <Grid cols="1.25fr 1fr" style={{ marginBottom: 14 }}>
        <Panel title="Margin risks" sub="Jobs forecast over budget or below an 18% margin.">
          {risks.length === 0 && <div className="r-dim" style={{ fontSize: 13 }}>No job is over budget.</div>}
          {risks.map((j) => {
            const worst = j.lines.filter((l) => l.variance > 0);
            return (
              <div key={j.id} className="r-li">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <OpenJob id={j.id}>{j.id} {j.name}</OpenJob>
                  <div style={{ fontSize: 12.5, marginTop: 4 }} className="r-dim">
                    Budget {eur(j.budget)}, forecast {eur(j.forecast)}. Profit {eur(j.originalProfit)} → {eur(j.profit)}.
                  </div>
                  {worst.length > 0 && <div style={{ fontSize: 12.5, marginTop: 4 }}>{worst.map((l) => COST_LABEL[l.cat] + " " + eur(l.variance, { sign: true })).join(", ")}</div>}
                </div>
                <Badge tone="warn">{pct(j.margin)}</Badge>
              </div>
            );
          })}
        </Panel>
        <Panel title="Upcoming starts">
          {upcoming.length === 0 && <div className="r-dim" style={{ fontSize: 13 }}>Nothing scheduled ahead.</div>}
          {upcoming.map((j) => (
            <div key={j.id} className="r-li">
              <div style={{ flex: "none", width: 64 }}>
                <div className="r-eyebrow">{fmtDate(j.start, "dow").slice(0, 3)}</div>
                <div style={{ fontSize: 17, fontWeight: 600 }}>{fmtDate(j.start)}</div>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <OpenJob id={j.id}>{j.id} {j.name}</OpenJob>
                <div className="r-dim" style={{ fontSize: 12.5, marginTop: 3 }}>{j.customerName}, {rel(j.start, s.clock)}</div>
                <div style={{ fontSize: 12.5, marginTop: 4 }}>{j.nextAction}</div>
              </div>
            </div>
          ))}
        </Panel>
      </Grid>

      <Panel title="November jobs" sub={m.jobs.length + " accepted jobs"} pad={false}>
        <Table<JobView>
          keyOf={(j) => j.id} rows={m.jobs} onRow={(j) => go("Jobs", "detail", { job: j.id })}
          cols={[
            { k: "id", label: "Job", w: "2fr", render: (j) => <span><strong>{j.id}</strong> {j.name}</span> },
            { k: "c", label: "Customer", w: "1.4fr", hideSm: true, render: (j) => j.customerName },
            { k: "st", label: "Status", w: "1fr", render: (j) => <StateBadge state={j.status} /> },
            { k: "v", label: "Value", w: "1fr", align: "right", render: (j) => <span className="r-num">{eur(j.value)}</span> },
            { k: "f", label: "Forecast cost", w: "1fr", align: "right", hideSm: true, render: (j) => <span className="r-num">{eur(j.forecast)}</span> },
            { k: "p", label: "Gross profit", w: "1fr", align: "right", render: (j) => <span className="r-num" style={{ color: j.overrun > 0 ? "var(--warn)" : undefined }}>{eur(j.profit)}</span> },
          ]}
          foot={<span>Total {eur(m.value)} value, {eur(m.cost)} forecast direct cost, {eur(m.gp)} gross profit ({pct(m.margin, 2)}).</span>}
        />
      </Panel>
    </Page>
  );
}

/* ── Quotes ────────────────────────────────────────────────────────────── */
function Quotes({ s }: { s: DemoState }) {
  const p = pipeline(s);
  const [sel, setSel] = useState<string>("Q203");
  const q = p.quotes.find((x) => x.id === sel) || p.quotes[0];
  const base = QUOTES.find((x) => x.id === q.id)!;
  const queue = p.open.slice().sort((a, b) => a.followUp.localeCompare(b.followUp));
  return (
    <Page title="Quotes" sub={"Unaccepted pipeline " + eur(p.value) + ". It is not in November's accepted value or the profit forecast."}>
      <Grid cols="1.5fr 1fr" style={{ marginBottom: 14 }}>
        <Panel title="Quotes" pad={false}>
          <Table
            keyOf={(x) => x.id} rows={p.quotes} onRow={(x) => setSel(x.id)}
            cols={[
              { k: "id", label: "Quote", w: "1.9fr", render: (x) => <span><strong>{x.id}</strong> {x.title}{x.id === q.id && <> <Badge tone="accent">Open</Badge></>}</span> },
              { k: "c", label: "Customer", w: "1.3fr", hideSm: true, render: (x) => x.customerName },
              { k: "v", label: "Net value", w: "1fr", align: "right", render: (x) => <span className="r-num">{eur(x.value)}</span> },
              { k: "st", label: "Stage", w: "1fr", render: (x) => <StateBadge state={x.stage} /> },
              { k: "f", label: "Follow-up", w: "1fr", hideSm: true, render: (x) => (x.stage === "Accepted" ? <span className="r-dim">Converted</span> : fmtDate(x.followUp, "dow")) },
            ]}
            foot={<span>Open pipeline {eur(p.value)} across {p.open.length} quotes. Owner: {personName("P01")}.</span>}
          />
        </Panel>
        <Panel title="Follow-up queue" sub="Dated follow-ups, earliest first.">
          {queue.length === 0 && <div className="r-dim" style={{ fontSize: 13 }}>No open quotes.</div>}
          {queue.map((x) => {
            const d = rel(x.followUp, s.clock);
            const late = x.followUp < dayOf(s.clock);
            return (
              <div key={x.id} className="r-li">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <button type="button" className="r-link" onClick={() => setSel(x.id)}>{x.id} {x.customerName}</button>
                  <div className="r-dim" style={{ fontSize: 12.5, marginTop: 3 }}>{x.stage === "Draft" ? "Scope review" : "Follow-up call"} · {fmtDate(x.followUp, "dow")}</div>
                </div>
                <Badge tone={late ? "bad" : d === "tomorrow" || d === "today" ? "warn" : "neutral"}>{late ? "Overdue" : d}</Badge>
              </div>
            );
          })}
        </Panel>
      </Grid>
      <QuoteDetail s={s} id={q.id} base={base} />
    </Page>
  );
}

function QuoteDetail({ s, id, base }: { s: DemoState; id: string; base: (typeof QUOTES)[number] }) {
  const q = s.quotes[id];
  const [title, setTitle] = useState(q.title);
  const [value, setValue] = useState(String(q.value));
  const [follow, setFollow] = useState(q.followUp);
  const [mon, setMon] = useState("2026-12");
  const [key, setKey] = useState(id);
  if (key !== id) { setKey(id); setTitle(q.title); setValue(String(q.value)); setFollow(q.followUp); }
  const c = customer(base.customer);
  return (
    <Panel title={id + " · " + q.title} sub={c?.name + ", " + base.area} right={<StateBadge state={q.stage} />}>
      <Grid cols="1fr 1fr" gap={20}>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          <KV rows={[["Customer", <RecLink r={{ kind: "customer", id: base.customer }}>{c?.name}</RecLink>], ["Net value", eur(q.value)], ["Stage", q.stage], ["Owner", personName(base.owner)], ["Follow-up", fmtDate(q.followUp, "long")],
            ["Booked value", q.stage === "Accepted" ? "Converted to " + q.jobId + " (" + (q.month === "2026-11" ? "November" : "December") + ")" : "Excluded until accepted"]]} />
          <div>
            <div className="r-eyebrow" style={{ marginBottom: 6 }}>Site-visit note</div>
            <Note>{base.visitNote}</Note>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {q.stage === "Draft" && (
            <form onSubmit={(e) => { e.preventDefault(); act.editQuote(id, title.trim(), Number(value)); }} style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Field label="Scope title"><input className="r-input" value={title} onChange={(e) => setTitle(e.target.value)} /></Field>
              <Field label="Net value (€)" help="Draft only. Not added to any total."><input className="r-input" inputMode="numeric" value={value} onChange={(e) => setValue(e.target.value.replace(/[^0-9]/g, ""))} /></Field>
              <div className="r-pill-row">
                <Btn type="submit" disabled={!title.trim() || !(Number(value) > 0) ? "Enter a title and value" : false}>Save draft</Btn>
                <Btn kind="quiet" onClick={() => act.markQuoteSent(id)}>Mark as sent</Btn>
              </div>
            </form>
          )}
          {q.stage !== "Accepted" && (
            <>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                <Field label="Follow-up date"><input type="date" className="r-input" value={follow} onChange={(e) => setFollow(e.target.value)} /></Field>
                <Btn onClick={() => act.setFollowUp(id, follow)} disabled={follow === q.followUp ? "Pick a new date" : false}>Schedule</Btn>
              </div>
              <div style={{ display: "flex", gap: 8, alignItems: "flex-end", flexWrap: "wrap" }}>
                <Field label="Delivery month if accepted">
                  <select className="r-select" value={mon} onChange={(e) => setMon(e.target.value)}>
                    <option value="2026-11">November 2026</option>
                    <option value="2026-12">December 2026</option>
                  </select>
                </Field>
                <Btn kind="primary" onClick={() => act.acceptQuote(id, mon)}>Record acceptance (simulated)</Btn>
              </div>
              <Note>Acceptance creates one scheduled job in the month you pick. {mon === "2026-11" ? "November's accepted value and profit forecast will change." : "November's figures do not change."}</Note>
            </>
          )}
          {q.stage === "Accepted" && q.jobId && (
            <Note tone="ok">Accepted and converted. <button type="button" className="r-link" onClick={() => go("Jobs", "detail", { job: q.jobId! })}>Open {q.jobId}</button>. It cannot be converted twice.</Note>
          )}
        </div>
      </Grid>
    </Panel>
  );
}

/* ── Job board ─────────────────────────────────────────────────────────── */
const NEXT: Record<JobStatus, JobStatus | null> = { Scheduled: "Live", Live: "Completed", Completed: null };
const PREV: Record<JobStatus, JobStatus | null> = { Scheduled: null, Live: "Scheduled", Completed: "Live" };
function Board({ s }: { s: DemoState }) {
  const js = monthJobs(s);
  const cols: JobStatus[] = ["Scheduled", "Live", "Completed"];
  return (
    <Page title="Job board" sub="November jobs by state. Moving a card updates counts, dashboards and the month forecast everywhere.">
      <Grid cols="repeat(3, minmax(0,1fr))" gap={14}>
        {cols.map((c) => {
          const list = js.filter((j) => j.status === c);
          return (
            <section key={c} className="r-panel" style={{ background: "var(--surface-faint)" }}>
              <div className="r-panel-head" style={{ alignItems: "center" }}>
                <div className="r-panel-title" style={{ flex: 1 }}>{c}</div>
                <Badge tone={c === "Live" ? "accent" : c === "Completed" ? "ok" : "neutral"}>{list.length}</Badge>
              </div>
              <div style={{ padding: "4px 12px 14px", display: "flex", flexDirection: "column", gap: 10 }}>
                {list.length === 0 && <div className="r-empty">No jobs</div>}
                {list.map((j) => (
                  <article key={j.id} className="r-stat" style={{ padding: 14 }}>
                    <div style={{ display: "flex", gap: 8, alignItems: "baseline" }}>
                      <OpenJob id={j.id}>{j.id}</OpenJob>
                      <span style={{ fontSize: 13.5, fontWeight: 600, minWidth: 0 }}>{j.name}</span>
                    </div>
                    <div className="r-dim" style={{ fontSize: 12.5, marginTop: 4 }}>{j.customerName} · {j.area}</div>
                    <div style={{ fontSize: 12.5, marginTop: 6 }}>{fmtDate(j.start, "dow")} to {fmtDate(j.end, "dow")}</div>
                    <div style={{ marginTop: 8 }}><ReadyLine s={s} j={j} /></div>
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 10, fontSize: 12.5 }}>
                      <span className="r-dim">GP forecast</span>
                      <span className="r-num" style={{ color: j.overrun > 0 ? "var(--warn)" : "var(--ink)" }}>{eur(j.profit)} ({pct(j.margin)})</span>
                    </div>
                    <div className="r-pill-row" style={{ marginTop: 10 }}>
                      {PREV[j.status] && <Btn small kind="quiet" onClick={() => act.moveJob(j.id, PREV[j.status]!)}>← {PREV[j.status]}</Btn>}
                      {NEXT[j.status] && <Btn small onClick={() => act.moveJob(j.id, NEXT[j.status]!)}>Move to {NEXT[j.status]}</Btn>}
                    </div>
                  </article>
                ))}
              </div>
            </section>
          );
        })}
      </Grid>
    </Page>
  );
}

/* ── Completed ─────────────────────────────────────────────────────────── */
function evidenceFor(jobId: string) {
  return DOCUMENTS.filter((d) => d.refs.some((r) => r.kind === "job" && r.id === jobId));
}
function Completed({ s }: { s: DemoState }) {
  const [hist, setHist] = useState(false);
  const inv = invoices(s);
  const list = jobs(s).filter((j) => j.status === "Completed" && (hist || j.month === "2026-11")).sort((a, b) => (b.completedOn || b.end).localeCompare(a.completedOn || a.end));
  return (
    <Page title="Completed work" sub="Completed and paid are separate states. A finished job can still be waiting on payment."
      actions={<Btn onClick={() => setHist(!hist)}>{hist ? "Hide historical work" : "Show historical work"}</Btn>}>
      <Panel pad={false} title={hist ? "All completed jobs" : "Completed in November"} sub={list.length + " jobs"}>
        <Table<JobView>
          keyOf={(j) => j.id} rows={list} onRow={(j) => go("Jobs", "detail", { job: j.id })}
          cols={[
            { k: "j", label: "Job", w: "2fr", render: (j) => <span><strong>{j.id}</strong> {j.name}{j.month !== "2026-11" && <> <Badge>Historical</Badge></>}</span> },
            { k: "d", label: "Completed", w: "1fr", render: (j) => fmtDate(j.completedOn || j.end, "dow") },
            { k: "e", label: "Evidence", w: "1.4fr", hideSm: true, render: (j) => {
              const ev = evidenceFor(j.id);
              return ev.length ? ev.map((d) => <RecLink key={d.id} r={{ kind: "document", id: d.id }}>{d.title}</RecLink>) : <span className="r-dim">Completion recorded {fmtDate(j.completedOn || j.end)}</span>;
            } },
            { k: "i", label: "Invoice", w: "1.5fr", render: (j) => {
              const i = inv.find((x) => x.job === j.id);
              if (!i) return <span className="r-dim">Not invoiced</span>;
              return (
                <span style={{ display: "inline-flex", gap: 6, alignItems: "center", flexWrap: "wrap" }}>
                  <RecLink r={{ kind: "invoice", id: i.id }} />
                  <StateBadge state={i.open === 0 ? "Paid" : i.overdue ? "Overdue " + i.daysOverdue + "d" : "Not yet due"} />
                  {i.open > 0 && <span className="r-num r-dim" style={{ fontSize: 12 }}>{eur(i.open)} open</span>}
                </span>
              );
            } },
            { k: "p", label: "Gross profit", w: "1fr", align: "right", render: (j) => <span className="r-num">{eur(j.profit)}</span> },
          ]}
        />
      </Panel>
    </Page>
  );
}

/* ── Job detail ────────────────────────────────────────────────────────── */
type Sub = "overview" | "costs" | "programme" | "materials" | "people" | "finance" | "activity";
function Detail({ s, jobId, initialSub }: { s: DemoState; jobId: string; initialSub?: Sub }) {
  const j = jobById(s, jobId) || jobById(s, "J104")!;
  const [sub, setSub] = useState<Sub>(initialSub || "overview");
  const all = jobs(s);
  return (
    <Page title={<>{j.id} <span style={{ fontWeight: 500 }}>{j.name}</span></>}
      sub={<>{j.customerName} · {j.area} · {fmtDate(j.start, "dow")} to {fmtDate(j.end, "dow")} · <StateBadge state={j.status} /></>}
      actions={
        <select className="r-select" aria-label="Switch job" value={j.id} onChange={(e) => go("Jobs", "detail", { job: e.target.value })}>
          {all.map((x) => <option key={x.id} value={x.id}>{x.id} {x.name}</option>)}
        </select>
      }>
      <div className="r-scroll-x" style={{ marginBottom: 14 }}>
        <Seg<Sub> value={sub} onChange={setSub} options={[
          { id: "overview", label: "Overview" }, { id: "costs", label: "Scope & costs" }, { id: "programme", label: "Programme" }, { id: "materials", label: "Materials" },
          { id: "people", label: "People & plant" }, { id: "finance", label: "Finance & files" }, { id: "activity", label: "Activity" }]} />
      </div>
      {sub === "overview" && <DetailOverview s={s} j={j} />}
      {sub === "costs" && <DetailCosts s={s} j={j} />}
      {sub === "programme" && <DetailProgramme s={s} j={j} />}
      {sub === "materials" && <DetailMaterials s={s} j={j} />}
      {sub === "people" && <DetailPeople s={s} j={j} />}
      {sub === "finance" && <DetailFinance s={s} j={j} />}
      {sub === "activity" && <DetailActivity s={s} j={j} />}
    </Page>
  );
}

function readinessDates(s: DemoState, j: JobView): string[] {
  const set = new Set<string>();
  pos(s).filter((p) => p.job === j.id && p.status !== "Delivered").forEach((p) => set.add(dayOf(p.window)));
  if (j.id === "J105") set.add("2026-11-11");
  return Array.from(set).filter((d) => d >= dayOf(s.clock) || j.id === "J105").sort();
}

function DetailOverview({ s, j }: { s: DemoState; j: JobView }) {
  const dates = readinessDates(s, j);
  return (
    <>
      <Grid cols="1.2fr 1fr" style={{ marginBottom: 14 }}>
        <Panel title="Scope">
          <p style={{ margin: "0 0 14px", fontSize: 13.5, lineHeight: 1.6 }}>{j.scope}</p>
          <KV rows={[
            ["Customer", <RecLink r={{ kind: "customer", id: j.customer }}>{j.customerName}</RecLink>],
            ["Site type", j.siteType[0].toUpperCase() + j.siteType.slice(1)],
            ["Dates", fmtDate(j.start, "dow") + " to " + fmtDate(j.end, "dow")],
            ["Owner", personName(j.owner)],
            ["Next action", <>{j.nextAction} <span className="r-faint">({personName(j.nextOwner)})</span></>],
          ]} />
        </Panel>
        <Panel title="Money" sub="Net of VAT. Forecast cost includes posted cost and all expected remaining cost.">
          <Grid cols="1fr 1fr" gap={10}>
            <Stat label="Agreed value" value={eur(j.value)} sub={j.variationAccepted ? "Includes accepted V104-01" : undefined} />
            <Stat label="Forecast final cost" value={eur(j.forecast)} sub={"Budget " + eur(j.budget)} />
            <Stat label="Forecast gross profit" value={eur(j.profit)} tone={marginTone(j)} sub={pct(j.margin, 2) + " margin"} />
            <Stat label="Against budget" value={j.overrun > 0 ? eur(j.overrun) + " over" : j.overrun < 0 ? eur(-j.overrun) + " under" : "On budget"} tone={j.overrun > 0 ? "warn" : "ok"} sub={"Original profit " + eur(j.originalProfit)} />
          </Grid>
        </Panel>
      </Grid>

      {dates.length > 0 && (
        <Panel title="Readiness" sub="Each blocker is tracked separately. Clearing one does not clear the other." style={{ marginBottom: 14 }}>
          {dates.map((d) => {
            const r = readiness(s, j.id, d);
            const phase = j.phases.find((p) => d >= p.from && d <= p.to);
            return (
              <div key={d} style={{ marginBottom: 12 }}>
                <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
                  <strong style={{ fontSize: 13.5 }}>{fmtDate(d, "dow")}{phase ? ", " + phase.label : ""}</strong>
                  <StateBadge state={r.overall} />
                  {r.blockers.length > 0 && <span className="r-dim" style={{ fontSize: 12.5 }}>{r.blockers.length} independent blocker{r.blockers.length > 1 ? "s" : ""}</span>}
                </div>
                <Grid cols="repeat(auto-fit, minmax(200px, 1fr))" gap={8}>
                  {r.items.map((it) => (
                    <div key={it.label} className="r-stat" style={{ padding: "10px 12px" }}>
                      <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "center" }}>
                        <strong style={{ fontSize: 13 }}>{it.label}</strong><StateBadge state={it.state} />
                      </div>
                      <div className="r-dim" style={{ fontSize: 12, marginTop: 6 }}>{it.ref ? <RecLink r={it.ref}>{it.detail}</RecLink> : it.detail}</div>
                    </div>
                  ))}
                </Grid>
              </div>
            );
          })}
          {j.id === "J105" && dayOf(s.clock) <= "2026-11-10" && <Note>Today's preparation (dig-out, stone base, kerbs) needs no truck. The blockers apply to surfacing on 11 Nov.</Note>}
        </Panel>
      )}
      <SiteNotes s={s} j={j} />
    </>
  );
}

function SiteNotes({ s, j }: { s: DemoState; j: JobView }) {
  const [text, setText] = useState("");
  const [att, setAtt] = useState("");
  const seeded = DOCUMENTS.filter((d) => d.type === "Site note" && d.refs.some((r) => r.id === j.id));
  const notes = s.siteNotes.filter((n) => n.job === j.id).slice().reverse();
  return (
    <Panel title="Site notes" sub="Typed on site. The attachment is a simulated record name; no photo is uploaded and nothing syncs offline.">
      <form onSubmit={(e) => { e.preventDefault(); act.addSiteNote(j.id, text, att.trim()); setText(""); setAtt(""); }} style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 14 }}>
        <Field label="Note"><textarea className="r-textarea" rows={3} value={text} onChange={(e) => setText(e.target.value)} placeholder="What happened on site" /></Field>
        <Field label="Attachment name (optional)" help="Recorded as text, for example edge-photo-1.jpg"><input className="r-input" value={att} onChange={(e) => setAtt(e.target.value)} /></Field>
        <div><Btn kind="primary" type="submit" disabled={!text.trim() ? "Write a note first" : false}>Add site note</Btn></div>
      </form>
      <div className="r-list">
        {notes.map((n) => (
          <div key={n.id} className="r-li">
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13.5 }}>{n.text}</div>
              <div className="r-dim" style={{ fontSize: 12, marginTop: 4 }}>{personName(n.by)} · {fmtDT(n.at)}{n.attachment ? " · attachment record: " + n.attachment : ""}</div>
            </div>
          </div>
        ))}
        {seeded.map((d) => (
          <div key={d.id} className="r-li">
            <div style={{ flex: 1, minWidth: 0 }}>
              <RecLink r={{ kind: "document", id: d.id }}>{d.title}</RecLink>
              <div className="r-dim" style={{ fontSize: 12.5, marginTop: 4 }}>{d.body[0]}</div>
            </div>
          </div>
        ))}
        {!notes.length && !seeded.length && <div className="r-dim" style={{ fontSize: 13 }}>No site notes yet.</div>}
      </div>
    </Panel>
  );
}

function DetailCosts({ s, j }: { s: DemoState; j: JobView }) {
  const max = Math.max(...j.lines.map((l) => Math.max(l.budget, l.forecast)), 1);
  type L = (typeof j.lines)[number];
  return (
    <>
      <Panel title="Cost breakdown" sub="Original budget against posted cost, remaining forecast and forecast final cost. Receiving an order moves its cost from remaining to posted." pad={false} style={{ marginBottom: 14 }}>
        <Table<L>
          keyOf={(l) => l.cat} rows={j.lines}
          cols={[
            { k: "c", label: "Category", w: "1.4fr", render: (l) => <span>{COST_LABEL[l.cat]}{l.poCommitted + l.poPosted > 0 && <span className="r-faint" style={{ fontSize: 11.5 }}> · incl. orders</span>}</span> },
            { k: "b", label: "Budget", w: "1fr", align: "right", render: (l) => <span className="r-num">{eur(l.budget)}</span> },
            { k: "p", label: "Posted", w: "1fr", align: "right", render: (l) => <span className="r-num">{eur(l.posted)}</span> },
            { k: "r", label: "Remaining", w: "1fr", align: "right", render: (l) => <span className="r-num">{eur(l.remaining)}</span> },
            { k: "f", label: "Forecast final", w: "1fr", align: "right", render: (l) => <span className="r-num">{eur(l.forecast)}</span> },
            { k: "v", label: "Variance", w: "1fr", align: "right", render: (l) => <span className="r-num" style={{ color: l.variance > 0 ? "var(--warn)" : l.variance < 0 ? "var(--ok)" : "var(--dim)" }}>{l.variance ? eur(l.variance, { sign: true }) : "0"}</span> },
            { k: "bar", label: "Budget vs forecast", w: "1.3fr", hideSm: true, render: (l) => (
              <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <div className="r-bar"><span style={{ width: (l.budget / max) * 100 + "%", background: "var(--neutral)" }} /></div>
                <div className="r-bar"><span style={{ width: (l.forecast / max) * 100 + "%", background: l.variance > 0 ? "var(--warn)" : "var(--accent)" }} /></div>
              </div>) },
          ]}
          foot={<div style={{ display: "flex", flexWrap: "wrap", gap: "6px 18px" }}>
            <span>Total budget <strong className="r-num">{eur(j.budget)}</strong></span>
            <span>Posted <strong className="r-num">{eur(j.posted)}</strong></span>
            <span>Remaining <strong className="r-num">{eur(j.remaining)}</strong></span>
            <span>Forecast final <strong className="r-num">{eur(j.forecast)}</strong></span>
            <span>Variance <strong className="r-num">{eur(j.overrun, { sign: true })}</strong></span>
          </div>}
        />
      </Panel>
      <Grid cols="1fr 1fr" style={{ marginBottom: 14 }}>
        <Panel title="Profit">
          <KV rows={[
            ["Agreed value", eur(j.value) + (j.variationAccepted ? " (incl. V104-01)" : "")],
            ["Original expected profit", eur(j.originalProfit) + " (" + pct(j.originalMargin, 2) + ")"],
            ["Current forecast profit", eur(j.profit) + " (" + pct(j.margin, 2) + ")"],
            ["Change", eur(j.profit - j.originalProfit, { sign: true })],
          ]} />
        </Panel>
        {j.id === VARIATION.job ? <VariationPanel s={s} j={j} /> : (
          <Panel title="Variations"><div className="r-dim" style={{ fontSize: 13 }}>No variations recorded for this job.</div></Panel>
        )}
      </Grid>
    </>
  );
}

function VariationPanel({ s, j }: { s: DemoState; j: JobView }) {
  const st = s.variation;
  const steps: [string, boolean][] = [["Draft prepared", true], ["Internally approved", st !== "Draft"], ["Customer accepted", st === "Customer accepted"]];
  return (
    <Panel title={<><RecLink r={{ kind: "variation", id: VARIATION.id }}>{VARIATION.id}</RecLink> {VARIATION.title}</>} right={<StateBadge state={st} />}>
      <p style={{ margin: "0 0 12px", fontSize: 13, lineHeight: 1.6 }} className="r-dim">{VARIATION.detail}</p>
      <ol style={{ listStyle: "none", padding: 0, margin: "0 0 12px", display: "flex", flexDirection: "column", gap: 6 }}>
        {steps.map(([l, ok], i) => (
          <li key={l} style={{ display: "flex", gap: 8, alignItems: "center", fontSize: 13 }}>
            <Badge tone={ok ? "ok" : "neutral"}>{ok ? "✓" : i + 1}</Badge> {l}
          </li>
        ))}
      </ol>
      <KV rows={[["Price", eur(VARIATION.price) + " net"], ["In agreed value", st === "Customer accepted" ? "Yes, " + eur(j.value) : "No. Agreed value stays " + eur(j.baseValue)],
        ["If accepted", "Value " + eur(j.baseValue + VARIATION.price) + ", profit " + eur(j.baseValue + VARIATION.price - j.forecast) + " (" + pct(((j.baseValue + VARIATION.price - j.forecast) / (j.baseValue + VARIATION.price)) * 100, 2) + ")"]]} />
      <div className="r-pill-row" style={{ marginTop: 14 }}>
        <Btn kind={st === "Draft" ? "primary" : "ghost"} onClick={() => act.approveVariationInternally()} disabled={st !== "Draft" ? "Already approved internally" : false}>Approve internally (Florin)</Btn>
        <Btn kind={st === "Internally approved" ? "primary" : "ghost"} onClick={() => act.recordCustomerAcceptance()}
          disabled={st === "Draft" ? "Approve internally first" : st === "Customer accepted" ? "Already accepted" : false}>Record customer acceptance (simulated)</Btn>
      </div>
      <div style={{ marginTop: 10 }}><Note>Internal approval only prepares the variation. Only customer acceptance changes the agreed value. The extra work cost is already in the forecast.</Note></div>
    </Panel>
  );
}

function DetailProgramme({ s, j }: { s: DemoState; j: JobView }) {
  const days = Object.keys(s.plan).sort().flatMap((d) => (["A", "B"] as const).filter((c) => s.plan[d][c].job === j.id).map((c) => ({ d, c, cd: s.plan[d][c] })));
  return (
    <Grid cols="1fr 1.2fr">
      <Panel title="Phases">
        {j.phases.map((p) => {
          const st = p.to < dayOf(s.clock) ? "Done" : p.from <= dayOf(s.clock) ? "In progress" : "Planned";
          return (
            <div key={p.label} className="r-li">
              <div style={{ flex: 1, minWidth: 0 }}>
                <strong style={{ fontSize: 13.5 }}>{p.label}</strong>
                <div className="r-dim" style={{ fontSize: 12.5, marginTop: 3 }}>{fmtDate(p.from, "dow")}{p.to !== p.from ? " to " + fmtDate(p.to, "dow") : ""}{p.note ? " · " + p.note : ""}</div>
              </div>
              <StateBadge state={j.status === "Completed" ? "Done" : st} />
            </div>
          );
        })}
      </Panel>
      <Panel title="Crew days this week" sub="From Planning. Constraints show where a truck or confirmation is missing.">
        {days.length === 0 && <div className="r-dim" style={{ fontSize: 13 }}>No crew planned for this job between 9 and 13 Nov.</div>}
        {days.map(({ d, c, cd }) => {
          const r = readiness(s, j.id, d);
          return (
            <div key={d + c} className="r-li" style={{ flexWrap: "wrap" }}>
              <div style={{ flex: "none", width: 82 }}><strong style={{ fontSize: 13 }}>{fmtDate(d, "dow")}</strong></div>
              <div style={{ flex: "1 1 200px", minWidth: 0, fontSize: 13 }}>
                Crew {c} · {cd.note}
                <div className="r-dim" style={{ fontSize: 12, marginTop: 3 }}>Truck {cd.truck || "none"} · Driver {cd.driver ? personName(cd.driver) : "none"} · Plant {cd.plant || "none"}</div>
              </div>
              {r.blockers.length > 0 ? <StateBadge state={r.overall} /> : <StateBadge state="Ready" />}
            </div>
          );
        })}
      </Panel>
    </Grid>
  );
}

function DetailMaterials({ s, j }: { s: DemoState; j: JobView }) {
  const list = pos(s).filter((p) => p.job === j.id);
  type P = (typeof list)[number];
  return (
    <Panel title="Purchase orders" sub="Job-specific orders. Delivered orders are posted cost; confirmed and awaiting orders are commitments." pad={false}>
      <Table<P>
        keyOf={(p) => p.id} rows={list} empty="No purchase orders linked to this job."
        cols={[
          { k: "id", label: "Order", w: "1fr", render: (p) => <RecLink r={{ kind: "po", id: p.id }} /> },
          { k: "m", label: "Material", w: "1.3fr", render: (p) => p.material + ", " + (p.receivedQty ?? p.qty) + " t × " + eur(p.unit) },
          { k: "v", label: "Value", w: "1fr", align: "right", render: (p) => <span className="r-num">{eur(p.value)}</span> },
          { k: "s", label: "Status", w: "1.3fr", render: (p) => <StateBadge state={p.status} /> },
          { k: "t", label: "Treatment", w: "1fr", hideSm: true, render: (p) => (p.posted ? "Posted" : p.status === "Draft" ? "Draft" : "Committed") },
          { k: "w", label: "Window", w: "1.1fr", render: (p) => fmtDT(p.window) },
          { k: "d", label: "Ticket", w: "1fr", hideSm: true, render: (p) => (p.ticket ? <RecLink r={{ kind: "document", id: p.ticket }}>Delivery ticket</RecLink> : <span className="r-dim">None yet</span>) },
        ]}
      />
    </Panel>
  );
}

function DetailPeople({ s, j }: { s: DemoState; j: JobView }) {
  const days = Object.keys(s.plan).sort().flatMap((d) => (["A", "B"] as const).filter((c) => s.plan[d][c].job === j.id).map((c) => ({ d, c, cd: s.plan[d][c] })));
  const crews = Array.from(new Set(days.map((x) => x.c)));
  const assets = Array.from(new Set(days.flatMap((x) => [x.cd.truck, x.cd.plant]).filter(Boolean)));
  const d0 = dayOf(s.clock);
  return (
    <Grid cols="1fr 1fr">
      <Panel title="People" sub={crews.length ? "Crew " + crews.join(" and ") + " this week" : "No crew planned 9 to 13 Nov"}>
        <div className="r-li"><div style={{ flex: 1 }}><RecLink r={{ kind: "person", id: j.owner }}>{personName(j.owner)}</RecLink><div className="r-dim" style={{ fontSize: 12 }}>Job owner, supervision</div></div></div>
        {PEOPLE.filter((p) => p.crew && crews.includes(p.crew)).map((p) => (
          <div key={p.id} className="r-li">
            <div style={{ flex: 1, minWidth: 0 }}>
              <RecLink r={{ kind: "person", id: p.id }}>{p.name}</RecLink>
              <div className="r-dim" style={{ fontSize: 12 }}>{p.role} · Crew {p.crew}</div>
            </div>
            {p.truckEligible && <Badge tone="info">Truck eligible (demo)</Badge>}
          </div>
        ))}
      </Panel>
      <Panel title="Trucks and plant" sub={"Availability on " + fmtDate(d0, "dow")}>
        {assets.length === 0 && j.id !== HIRE.job && <div className="r-dim" style={{ fontSize: 13 }}>No assets planned this week.</div>}
        {assets.map((a) => {
          const av = assetOn(s, a, d0);
          return (
            <div key={a} className="r-li">
              <div style={{ flex: 1, minWidth: 0 }}><RecLink r={{ kind: "asset", id: a }} /><div className="r-dim" style={{ fontSize: 12 }}>{av.status}</div></div>
              <StateBadge state={av.available ? "Available" : "Unavailable"} />
            </div>
          );
        })}
        {j.id === HIRE.job && (
          <div className="r-li">
            <div style={{ flex: 1, minWidth: 0 }}><RecLink r={{ kind: "hire", id: HIRE.id }}>{HIRE.id} replacement tipper</RecLink>
              <div className="r-dim" style={{ fontSize: 12 }}>{s.hire === "Approved" ? "Hired for 11 Nov only, driver " + personName(HIRE.driver) : "Proposal, " + eur(HIRE.cost) + ", waiting on Joe"}</div></div>
            <StateBadge state={s.hire} />
          </div>
        )}
        {j.id === HIRE.job && <div className="r-li"><div style={{ flex: 1 }}><RecLink r={{ kind: "asset", id: "TRK-02" }} /><div className="r-dim" style={{ fontSize: 12 }}>Mihai's usual truck. {assetOn(s, "TRK-02", "2026-11-11").status}</div></div></div>}
      </Panel>
    </Grid>
  );
}

function DetailFinance({ s, j }: { s: DemoState; j: JobView }) {
  const inv = invoices(s).filter((i) => i.job === j.id);
  const tax = s.tax[j.id];
  const relatedIds = new Set<string>([j.id, ...pos(s).filter((p) => p.job === j.id).map((p) => p.id), ...inv.map((i) => i.id), ...(j.id === VARIATION.job ? [VARIATION.id] : [])]);
  const docs = DOCUMENTS.filter((d) => d.refs.some((r) => relatedIds.has(r.id)));
  return (
    <Grid cols="1fr 1fr">
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        <Panel title="Invoices">
          {inv.length === 0 && (
            <Note>No invoice issued yet for {j.id}.{j.id === "J105" && <> A draft invoice is held until the tax review is complete (<RecLink r={{ kind: "review", id: "J105" }}>tax review</RecLink>).</>}</Note>
          )}
          {inv.map((i) => (
            <div key={i.id} className="r-li">
              <div style={{ flex: 1, minWidth: 0 }}>
                <RecLink r={{ kind: "invoice", id: i.id }} /> <span className="r-dim" style={{ fontSize: 12.5 }}>issued {fmtDate(i.issued)}, due {fmtDate(i.due)}</span>
                <div style={{ fontSize: 12.5, marginTop: 3 }}>{eur(i.amount)} net · settled {eur(i.settled)} · open {eur(i.open)}</div>
              </div>
              <StateBadge state={i.open === 0 ? "Paid" : i.overdue ? "Overdue" : "Not yet due"} />
            </div>
          ))}
        </Panel>
        <Panel title="Classification" sub="VAT and RCT are separate fields. Unknown treatment stays under review.">
          <KV rows={[
            ["Customer type", (customer(j.customer)?.type || "").replace(/^./, (c) => c.toUpperCase())],
            ["Review status", tax ? <StateBadge state={tax.status} /> : inv.length ? "Simulated reviewed contractor record" : <StateBadge state="Needs review" />],
            ["VAT treatment", tax?.vat || inv[0]?.vat || "Needs review"],
            ["RCT", tax?.rct || inv[0]?.rct || "Needs review"],
            ["Reviewer", tax?.reviewer ? personName(tax.reviewer) + (tax.at ? ", " + fmtDT(tax.at) : "") : j.id === "J105" ? "Joe (pending)" : "Not recorded"],
          ]} />
          {tax?.note && <div style={{ marginTop: 12 }}><Note>{tax.note}</Note></div>}
          {tax && <div style={{ marginTop: 10 }}><RecLink r={{ kind: "review", id: j.id }}>Open tax review</RecLink></div>}
        </Panel>
      </div>
      <Panel title="Files" sub={docs.length + " documents linked"}>
        {docs.length === 0 && <div className="r-dim" style={{ fontSize: 13 }}>No documents linked.</div>}
        {docs.map((d) => (
          <div key={d.id} className="r-li">
            <div style={{ flex: 1, minWidth: 0 }}>
              <RecLink r={{ kind: "document", id: d.id }}>{d.title}</RecLink>
              <div className="r-dim" style={{ fontSize: 12 }}>{d.type} · added {fmtDate(d.added)}</div>
            </div>
          </div>
        ))}
        {s.siteNotes.filter((n) => n.job === j.id).map((n) => (
          <div key={n.id} className="r-li"><div style={{ flex: 1, minWidth: 0, fontSize: 13 }}>Site note: {n.text}<div className="r-dim" style={{ fontSize: 12 }}>{fmtDT(n.at)}</div></div></div>
        ))}
      </Panel>
    </Grid>
  );
}

function DetailActivity({ s, j }: { s: DemoState; j: JobView }) {
  const ids = new Set<string>([j.id, ...pos(s).filter((p) => p.job === j.id).map((p) => p.id), ...invoices(s).filter((i) => i.job === j.id).map((i) => i.id)]);
  if (j.id === VARIATION.job) ids.add(VARIATION.id);
  if (j.id === HIRE.job) { ids.add(HIRE.id); ids.add("TRK-02"); }
  const list = activity(s).filter((e) => e.refs.some((r: Ref) => ids.has(r.id)));
  return (
    <Panel title="Activity" sub={list.length + " events linked to this job, its orders and invoices"}>
      {list.length === 0 && <div className="r-dim" style={{ fontSize: 13 }}>No activity yet.</div>}
      {list.map((e) => (
        <div key={e.id} className="r-li">
          <div style={{ flex: "none", width: 90 }} className="r-dim"><div style={{ fontSize: 12 }}>{fmtDate(e.at, "dow")}</div><div style={{ fontSize: 12 }}>{fmtTime(e.at)}</div></div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 13.5 }}>{e.title}</div>
            <div className="r-dim" style={{ fontSize: 12.5, marginTop: 3 }}>{e.note}</div>
            <div className="r-faint" style={{ fontSize: 11.5, marginTop: 3 }}>{actorName(e.actor)} · {e.provenance}</div>
          </div>
        </div>
      ))}
    </Panel>
  );
}
