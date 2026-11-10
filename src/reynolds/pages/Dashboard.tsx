/* Dashboard: analytical views. Editing lives in Jobs, Planning and Finance;
   everything here links through to the record behind the number. */
import { useState } from "react";
import { useDemo, go, openRecord } from "../store";
import { act } from "../actions";
import { COST_LABEL, FLORIN_DAY, PEOPLE, WEEK } from "../fixtures";
import { cash, jobById, month, pipeline, readiness, receivables, shifts, today, type JobView } from "../selectors";
import { eur, fmtDate, pct } from "../format";
import { Badge, Bar, Btn, Grid, Note, Page, Panel, RecLink, Stat, StateBadge, Table, Toggle } from "../ui";

type Props = { tab: string; params: Record<string, string> };

const TITLES: Record<string, [string, string]> = {
  business: ["Business", "November at a glance: what the accepted work is worth, what it costs, and what is left after overheads."],
  margins: ["Job margins", "Gross profit by job, and where J104's margin went."],
  crew: ["Crew capacity", "People available is not the same as jobs ready. A crew with no truck cannot deliver a surfacing load."],
  cash: ["Cash", "Analytical view of the next seven days. Edit invoices and payments in Finance."],
};

export default function DashboardPage({ tab }: Props) {
  const t = TITLES[tab] ? tab : "business";
  const [title, sub] = TITLES[t];
  return (
    <Page title={title} sub={sub}>
      {t === "business" && <Business />}
      {t === "margins" && <Margins />}
      {t === "crew" && <Crew />}
      {t === "cash" && <CashView />}
    </Page>
  );
}

/* ── Business ──────────────────────────────────────────────────────────── */
function Business() {
  const s = useDemo();
  const b = month(s), p = pipeline(s);
  const scale = Math.max(b.value, 1);
  const steps: { label: string; amount: number; from: number; to: number; tone: "accent" | "bad" | "ok" | "warn"; sub: string; tab?: [string, string] }[] = [
    { label: "Accepted job value", amount: b.value, from: 0, to: b.value, tone: "accent", sub: b.jobs.length + " November jobs, net of VAT", tab: ["Jobs", "overview"] },
    { label: "Forecast direct costs", amount: -b.cost, from: b.gp, to: b.value, tone: "bad", sub: "Materials, labour, plant, fuel, transport", tab: ["Finance", "costs"] },
    { label: "Gross profit", amount: b.gp, from: 0, to: b.gp, tone: "ok", sub: pct(b.margin, 2) + " gross margin", tab: ["Dashboard", "margins"] },
    { label: "Modelled overhead", amount: -b.overhead, from: Math.max(b.op, 0), to: b.gp, tone: "bad", sub: "Illustrative allowances", tab: ["Finance", "costs"] },
    { label: "Operating profit before tax", amount: b.op, from: 0, to: Math.max(b.op, 0), tone: b.op >= b.target ? "ok" : "warn", sub: pct(b.progress) + " of the " + eur(b.target) + " example target", tab: ["Finance", "goals"] },
  ];
  const split = [
    { label: "Completed", agg: b.completed, tone: "ok" as const },
    { label: "Live", agg: b.live, tone: "accent" as const },
    { label: "Scheduled", agg: b.scheduled, tone: "neutral" as const },
  ];
  return (
    <>
      <Panel title="From job value to operating profit" sub="Management forecast for 1 to 30 November. Not cash received and not statutory accounts.">
        <div style={{ display: "flex", flexDirection: "column", gap: 4, marginTop: 6 }}>
          {steps.map((x) => (
            <div key={x.label} className="r-click" role="button" tabIndex={0} onClick={() => x.tab && go(x.tab[0], x.tab[1])}
              onKeyDown={(e) => { if (e.key === "Enter" && x.tab) go(x.tab[0], x.tab[1]); }}
              style={{ display: "grid", gridTemplateColumns: "minmax(140px,1.1fr) 2.4fr minmax(90px,.6fr)", gap: 14, alignItems: "center", padding: "9px 8px", borderRadius: 10, border: "1px solid transparent" }}>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: "var(--ink)" }}>{x.label}</div>
                <div className="r-faint" style={{ fontSize: 11.5, marginTop: 2 }}>{x.sub}</div>
              </div>
              <div style={{ position: "relative", height: 22 }}>
                <div style={{ position: "absolute", inset: "9px 0", background: "var(--track)", borderRadius: 999, opacity: 0.5 }} />
                <div style={{ position: "absolute", top: 2, bottom: 2, left: (x.from / scale) * 100 + "%", width: Math.max(0.6, ((x.to - x.from) / scale) * 100) + "%",
                  borderRadius: 6, background: x.tone === "accent" ? "var(--accent)" : x.tone === "ok" ? "var(--ok)" : x.tone === "warn" ? "var(--warn)" : "var(--bad)", opacity: x.amount < 0 ? 0.55 : 0.95 }} />
                {x.label.startsWith("Operating") && <div title={"Target " + eur(b.target)} style={{ position: "absolute", top: -2, bottom: -2, left: Math.min(100, (b.target / scale) * 100) + "%", borderLeft: "2px dashed var(--ink)", opacity: 0.6 }} />}
              </div>
              <div className="r-num" style={{ textAlign: "right", fontWeight: 600, fontSize: 15 }}>{x.amount < 0 ? "−" + eur(-x.amount) : eur(x.amount)}</div>
            </div>
          ))}
        </div>
        <Note>Dashed line marks the example target. {b.gap > 0 ? eur(b.gap) + " short." : eur(-b.gap) + " ahead."} Accepted value still awaiting completion: {eur(b.awaitingCompletion)}.</Note>
      </Panel>
      <div style={{ height: 14 }} />
      <Grid cols="1.2fr 1fr">
        <Panel title="November jobs by status" sub={b.jobs.length + " accepted jobs. Counts and values derived from the job register."}>
          <div style={{ display: "flex", height: 14, borderRadius: 999, overflow: "hidden", margin: "6px 0 14px", background: "var(--track)" }}>
            {split.map((x) => <div key={x.label} title={x.label + " " + eur(x.agg.value)} style={{ width: (x.agg.value / Math.max(b.value, 1)) * 100 + "%", background: x.tone === "ok" ? "var(--ok)" : x.tone === "accent" ? "var(--accent)" : "var(--neutral)" }} />)}
          </div>
          <Grid cols="1fr 1fr 1fr" gap={10}>
            {split.map((x) => (
              <Stat key={x.label} label={x.label + " · " + x.agg.count} value={eur(x.agg.value)} onClick={() => go("Jobs", "board")}
                sub={"GP " + eur(x.agg.profit) + (x.label === "Completed" ? "" : " forecast")} />
            ))}
          </Grid>
        </Panel>
        <Panel title="Quotes not yet accepted" sub="Pipeline only. Excluded from booked value and from the profit forecast." right={<Badge tone="neutral">{eur(p.value)}</Badge>}>
          <div className="r-list">
            {p.open.map((q) => (
              <div className="r-li" key={q.id}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13.5 }}><RecLink r={{ kind: "quote", id: q.id }} /> {q.title}</div>
                  <div className="r-faint" style={{ fontSize: 12, marginTop: 3 }}>{q.customerName} · follow-up {fmtDate(q.followUp, "dow")}</div>
                </div>
                <span className="r-num">{eur(q.value)}</span>
                <StateBadge state={q.stage} />
              </div>
            ))}
            {!p.open.length && <div className="r-empty">No open quotes.</div>}
          </div>
        </Panel>
      </Grid>
    </>
  );
}

/* ── Job margins ───────────────────────────────────────────────────────── */
function Margins() {
  const s = useDemo();
  const b = month(s);
  const [sort, setSort] = useState<"profit" | "margin">("profit");
  const [desc, setDesc] = useState(true);
  const rows = b.jobs.slice().sort((a, c) => (desc ? -1 : 1) * (a[sort] - c[sort]));
  const maxP = Math.max(1, ...rows.map((r) => r.profit));
  const j = jobById(s, "J104")!;
  const maxC = Math.max(...j.lines.map((l) => Math.max(l.budget, l.forecast)));
  const head = (k: "profit" | "margin", label: string) => (
    <button type="button" className="r-link" style={{ color: sort === k ? "var(--ink)" : "var(--faint)", textDecoration: "none", fontSize: 11.5 }}
      onClick={() => { if (sort === k) setDesc(!desc); else { setSort(k); setDesc(true); } }}>
      {label} {sort === k ? (desc ? "↓" : "↑") : ""}
    </button>
  );
  return (
    <>
      <Panel title="November jobs" sub={"Gross profit after forecast direct costs. Total " + eur(b.gp) + " (" + pct(b.margin, 2) + "). Click a column to sort, a row to open the job."} pad={false}>
        <Table<JobView> keyOf={(x) => x.id} rows={rows} onRow={(x) => openRecord("job", x.id)}
          cols={[
            { k: "j", label: "Job", w: "1.8fr", render: (x) => <span><span style={{ fontWeight: 500 }}>{x.id}</span> {x.name}<span className="r-faint" style={{ display: "block", fontSize: 11.5 }}>{x.customerName}</span></span> },
            { k: "s", label: "Status", w: "0.8fr", hideSm: true, render: (x) => <StateBadge state={x.status} /> },
            { k: "v", label: "Value", w: "0.8fr", align: "right", render: (x) => <span className="r-num">{eur(x.value)}</span> },
            { k: "c", label: "Forecast cost", w: "0.8fr", align: "right", hideSm: true, render: (x) => <span className="r-num">{eur(x.forecast)}</span> },
            { k: "p", label: head("profit", "Gross profit"), w: "1.4fr", render: (x) => (
              <span style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span className="r-num" style={{ width: 62, textAlign: "right" }}>{eur(x.profit)}</span>
                <span style={{ flex: 1 }}><Bar value={x.profit} max={maxP} tone={x.overrun > 0 ? "warn" : "ok"} label={x.id + " gross profit " + eur(x.profit)} /></span>
              </span>) },
            { k: "m", label: head("margin", "Margin"), w: "0.7fr", align: "right", render: (x) => <span className="r-num" style={{ color: x.overrun > 0 ? "var(--warn)" : undefined }}>{pct(x.margin)}</span> },
          ]} />
      </Panel>
      <div style={{ height: 14 }} />
      <Grid cols="1.5fr 1fr">
        <Panel title={<>Where J104's margin went · <RecLink r={{ kind: "job", id: "J104" }}>Naas distribution yard</RecLink></>}
          sub={"Budget " + eur(j.budget) + " against forecast final " + eur(j.forecast) + ". Pale bar is budget, solid bar is forecast."}>
          {j.lines.map((l) => (
            <div key={l.cat} className="r-click" role="button" tabIndex={0} onClick={() => openRecord("job", "J104")}
              onKeyDown={(e) => { if (e.key === "Enter") openRecord("job", "J104"); }}
              style={{ display: "grid", gridTemplateColumns: "110px 1fr 86px", gap: 12, alignItems: "center", padding: "8px 6px", borderRadius: 8, border: "1px solid transparent" }}>
              <span style={{ fontSize: 13 }}>{COST_LABEL[l.cat]}</span>
              <span style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                <span style={{ height: 7, width: (l.budget / maxC) * 100 + "%", background: "var(--neutral)", borderRadius: 999 }} />
                <span style={{ height: 7, width: (l.forecast / maxC) * 100 + "%", background: l.variance > 0 ? "var(--bad)" : "var(--accent)", borderRadius: 999 }} />
              </span>
              <span className="r-num" style={{ textAlign: "right", fontSize: 12.5 }}>
                {eur(l.forecast)}<span style={{ display: "block", color: l.variance > 0 ? "var(--bad)" : "var(--faint)", fontSize: 11 }}>{l.variance ? eur(l.variance, { sign: true }) : "on budget"}</span>
              </span>
            </div>
          ))}
        </Panel>
        <Panel title="J104 profit" sub="Same numbers as the job record and the briefing.">
          <Grid cols="1fr 1fr" gap={10}>
            <Stat label="Original expected" value={eur(j.originalProfit)} sub={pct(j.originalMargin, 2) + " margin"} />
            <Stat label="Current forecast" value={eur(j.profit)} tone={j.overrun > 0 ? "warn" : undefined} sub={pct(j.margin, 2) + " margin"} />
          </Grid>
          <Note tone={j.variationAccepted ? "ok" : "warn"}>
            {j.variationAccepted
              ? <>V104-01 accepted: agreed value {eur(j.value)}, included above.</>
              : <><RecLink r={{ kind: "variation", id: "V104-01" }} /> would add €1,200 if the customer accepts. Status: {s.variation}. Not counted.</>}
          </Note>
        </Panel>
      </Grid>
    </>
  );
}

/* ── Crew capacity ─────────────────────────────────────────────────────── */
function Crew() {
  const s = useDemo();
  const sh = shifts(s);
  const d0 = today(s);
  const eligible = PEOPLE.filter((p) => p.paidCrew && p.truckEligible);
  const crewOf = (pid: string, date: string) => {
    const plan = s.plan[date];
    const p = PEOPLE.find((x) => x.id === pid);
    if (!plan || !p?.crew) return null;
    return plan[p.crew];
  };
  return (
    <>
      <Grid cols="1fr 1fr 1fr 1fr" gap={10}>
        <Stat label="Planned paid shifts, 9 to 13 Nov" value={sh.plannedShifts + " of " + sh.slots} sub="7 paid crew × 5 days" onClick={() => go("Planning", "crew")} />
        <Stat label="Expected gross day wages" value={eur(sh.expectedWages)} sub={eur(sh.fullDayRate) + " a full day. Not total employer cost."} />
        <Stat label="Approved so far" value={eur(sh.approvedWages)} sub={sh.approvedShifts + " shifts approved"} />
        <Stat label="Truck-eligible crew" value={eligible.length + " of 7"} sub={eligible.map((p) => p.first).join(" and ") + " (demo records)"} tone="warn" />
      </Grid>
      <div style={{ height: 14 }} />
      <Panel title="People this week" sub="Shift state per person per day. Florin is shown separately with no wage." pad={false}>
        <div className="r-scroll-x">
          <div style={{ minWidth: 640 }}>
            <div className="r-tr r-th" style={{ gridTemplateColumns: "1.5fr repeat(5,1fr) .8fr" }}>
              <div>Person</div>{WEEK.map((d) => <div key={d} style={{ fontWeight: d === d0 ? 700 : 500, color: d === d0 ? "var(--ink)" : undefined }}>{fmtDate(d, "dow")}</div>)}<div style={{ textAlign: "right" }}>Expected</div>
            </div>
            {sh.rows.map((r) => (
              <div key={r.person.id} className="r-tr r-dense" style={{ gridTemplateColumns: "1.5fr repeat(5,1fr) .8fr" }}>
                <div><RecLink r={{ kind: "person", id: r.person.id }}>{r.person.name}</RecLink>{r.person.truckEligible && <Badge tone="info">Driver</Badge>}<span className="r-faint" style={{ display: "block", fontSize: 11 }}>Crew {r.person.crew} · {eur(r.person.wage || 0)}/day</span></div>
                {r.days.map((d) => {
                  const cd = crewOf(r.person.id, d.date);
                  return (
                    <div key={d.date} style={{ fontSize: 12 }}>
                      <span style={{ color: d.state === "Absent" ? "var(--bad)" : "var(--ink)" }}>{d.state === "Full day" ? cd?.job || "Yard" : d.state === "Half day" ? "½ " + (cd?.job || "") : "Absent"}</span>
                      <span className="r-faint" style={{ display: "block", fontSize: 10.5 }}>{d.approved ? "Approved" : d.status}</span>
                    </div>
                  );
                })}
                <div className="r-num" style={{ textAlign: "right", fontSize: 12.5 }}>{eur(r.expected)}</div>
              </div>
            ))}
            <div className="r-tr r-dense" style={{ gridTemplateColumns: "1.5fr repeat(5,1fr) .8fr", background: "var(--surface-faint)" }}>
              <div><RecLink r={{ kind: "person", id: "P01" }}>Florin Pricope</RecLink><span className="r-faint" style={{ display: "block", fontSize: 11 }}>Supervision and customers, no day wage</span></div>
              {WEEK.map((d) => <div key={d} style={{ fontSize: 12 }}>{d === d0 ? FLORIN_DAY.length + " visits" : "Sites"}</div>)}
              <div className="r-faint" style={{ textAlign: "right", fontSize: 12 }}>n/a</div>
            </div>
          </div>
        </div>
      </Panel>
      <div style={{ height: 14 }} />
      <Panel title="Deployable crews by day" sub="People can be available while the job is not ready. Readiness checks the truck, a truck-eligible driver and confirmed materials for that phase and date.">
        <div className="r-scroll-x">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(5,minmax(150px,1fr))", gap: 10, minWidth: 780 }}>
            {WEEK.map((d) => (
              <div key={d} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                <div className="r-eyebrow" style={{ color: d === d0 ? "var(--accent)" : undefined }}>{fmtDate(d, "dow")}{d === d0 ? " · today" : ""}</div>
                {(["A", "B"] as const).map((c) => {
                  const cd = s.plan[d]?.[c];
                  if (!cd) return null;
                  const r = readiness(s, cd.job, d);
                  const people = PEOPLE.filter((p) => p.crew === c && s.shifts[p.id + "|" + d]?.state !== "Absent").length;
                  return (
                    <div key={c} className="r-stat r-click" role="button" tabIndex={0} onClick={() => openRecord("job", cd.job)}
                      onKeyDown={(e) => { if (e.key === "Enter") openRecord("job", cd.job); }} style={{ padding: "10px 12px" }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600 }}>Crew {c} · {cd.job}</div>
                      <div className="r-faint" style={{ fontSize: 11.5, margin: "3px 0 6px" }}>{people} people · {cd.truck || "no truck"}</div>
                      <StateBadge state={r.overall} />
                      {r.blockers.map((x) => <div key={x.label} className="r-dim" style={{ fontSize: 11, marginTop: 5 }}>{x.label}: {x.detail}</div>)}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
        <Note>Seven workers are two crews, not seven independent teams: only {eligible.length} people can take a truck, and TRK-02 is {s.repair === "Returned to service" ? "back in service" : "off the road"}. <button type="button" className="r-link" onClick={() => go("Planning", "week")}>Edit the plan in Planning</button></Note>
      </Panel>
    </>
  );
}

/* ── Cash ──────────────────────────────────────────────────────────────── */
function CashView() {
  const s = useDemo();
  const c = cash(s), r = receivables(s);
  const outs = c.rows.filter((x) => x.amount < 0);
  const ageing: [string, number][] = [["Overdue 1 to 30 days", r.b1_30], ["Overdue 31 to 60", r.b31_60], ["Overdue 60+", r.b60], ["Not yet due", r.notDue]];
  const maxA = Math.max(1, ...ageing.map((a) => a[1]));
  return (
    <>
      <Grid cols="1fr 1fr 1fr" gap={10}>
        <Stat label="Opening bank snapshot (manual)" value={eur(c.opening)} sub="No live bank feed" />
        <Stat label="Projected closing, 16 Nov" value={eur(c.closing)} tone={c.belowBuffer ? "bad" : undefined} sub={"Buffer " + eur(c.buffer)} onClick={() => go("Finance", "cash")} />
        <Stat label="Overdue receivables" value={eur(r.overdueTotal)} tone={r.overdueTotal ? "bad" : "ok"} sub={r.overdue.map((i) => i.id + ", " + i.daysOverdue + " days").join("; ") || "None"} onClick={() => go("Finance", "receivables")} />
      </Grid>
      <div style={{ height: 14 }} />
      <Grid cols="1fr 1.2fr">
        <Panel title="Receipt risk" sub="One assumption carries most of the week.">
          <Toggle on={s.cashDelay} onChange={(v) => act.setCashDelay(v)} disabled={!c.canDelay ? "INV-099 has been received" : false}
            label="INV-099 slips past 16 Nov" sub={c.canDelay ? "Closing " + eur(s.cashDelay ? c.closing : c.delayedClosing) + " if it slips" : "Already received"} />
          <div style={{ display: "flex", gap: 22, flexWrap: "wrap", marginTop: 12 }}>
            <div><div className="r-eyebrow">Receipt arrives</div><div className="r-num" style={{ fontSize: 22, fontWeight: 600, marginTop: 4 }}>{eur(s.cashDelay ? c.closing + (r.invoices.find((i) => i.id === "INV-099")?.open || 0) : c.closing)}</div></div>
            <div><div className="r-eyebrow">Receipt slips</div><div className="r-num" style={{ fontSize: 22, fontWeight: 600, marginTop: 4, color: "var(--warn)" }}>{eur(s.cashDelay ? c.closing : c.delayedClosing)}</div></div>
          </div>
          <div style={{ marginTop: 16 }}>
            <div className="r-eyebrow" style={{ marginBottom: 6 }}>Receivables ageing</div>
            {ageing.map(([label, v]) => (
              <div key={label} style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr 80px", gap: 10, alignItems: "center", margin: "7px 0" }}>
                <span style={{ fontSize: 12.5 }}>{label}</span>
                <Bar value={v} max={maxA} tone={label.startsWith("Not") ? "neutral" : "warn"} label={label + " " + eur(v)} />
                <span className="r-num" style={{ textAlign: "right", fontSize: 12.5 }}>{eur(v)}</span>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Upcoming payments, 10 to 16 Nov" sub="From the mock bill ledger, day wages and fixed allowances." right={<Btn small onClick={() => go("Finance", "cash")}>Edit in Finance</Btn>}>
          <div className="r-list">
            {outs.map((x) => (
              <div className="r-li" key={x.id}>
                <span className="r-faint" style={{ width: 74, fontSize: 12, flex: "none" }}>{fmtDate(x.date, "dow")}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13 }}>{x.ref ? <RecLink r={x.ref}>{x.label}</RecLink> : x.label}</span>
                <span className="r-num">{eur(-x.amount)}</span>
              </div>
            ))}
          </div>
          <Note>Total out {eur(-outs.reduce((a, x) => a + x.amount, 0))}. Tax, payroll taxes and loan repayments were not supplied and are not shown.</Note>
        </Panel>
      </Grid>
    </>
  );
}
