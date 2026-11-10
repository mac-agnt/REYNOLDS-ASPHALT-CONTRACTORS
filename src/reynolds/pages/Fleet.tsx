/* Fleet: trucks and plant, the TRK-02 defect pipeline, checks and fleet costs. */
import { useState } from "react";
import { useDemo, type DemoState } from "../store";
import { act } from "../actions";
import { CHECKS, DEFECT, HIRE, PLT02_SERVICE, WEEK } from "../fixtures";
import { assetOn, fleet, jobById, month, personName, readiness, supplier, today, type AssetView } from "../selectors";
import { eur, fmtDate, fmtDT, rel } from "../format";
import {
  Badge, Btn, Grid, KV, Note, Page, PageLink, Panel, RecLink, Seg, SideSheet, StateBadge, Stat, Table, type Col,
} from "../ui";

type Props = { tab: string; params: Record<string, string> };

export default function FleetPage({ tab, params }: Props) {
  const t = tab || "overview";
  if (t === "assets") return <Assets initial={params?.asset} />;
  if (t === "maintenance") return <Maintenance />;
  if (t === "checks") return <Checks />;
  if (t === "costs") return <Costs />;
  return <Overview />;
}

/* ── Overview ──────────────────────────────────────────────────────────── */
function Overview() {
  const s = useDemo();
  const f = fleet(s);
  const r105 = readiness(s, "J105", HIRE.date);
  const transport = r105.items.find((i) => i.label === "Transport");
  const asphalt = r105.items.filter((i) => i.label.startsWith("Asphalt"));
  return (
    <Page title="Fleet" sub="Two owned trucks, three pieces of plant. Truck availability is what limits how many jobs can run at once.">
      <Grid cols="repeat(4, 1fr)">
        <Stat label="Owned trucks available" value={f.trucksAvailable + " of " + f.trucks.length} tone={f.trucksAvailable < f.trucks.length ? "warn" : "ok"} sub="Today" />
        <Stat label="Plant available" value={f.plantAvailable + " of " + f.plant.length} sub="PLT-02 service due 12 Nov" />
        <Stat label="Owned assets available" value={f.ownedAvailable + " of " + f.owned.length} />
        <Stat label="Hired capacity" value={f.hired.length ? HIRE.id : "None"} sub={f.hired.length ? "11 Nov only, kept apart from owned count" : "€260 hire proposed, not approved"} />
      </Grid>

      <Grid cols="1.25fr 1fr" style={{ marginTop: 14 }}>
        <Panel tone={s.repair === "Returned to service" ? "ok" : "bad"} title={"TRK-02 " + DEFECT.summary.toLowerCase()}
          sub={"Reported by " + personName(DEFECT.by) + ", " + fmtDT(DEFECT.reported) + ". " + assetOn(s, "TRK-02", today(s)).status + "."}
          right={<StateBadge state={s.repair} />}>
          <KV rows={[
            ["Repair quote", <><span className="r-num">{eur(DEFECT.quote)}</span> from <RecLink r={{ kind: "supplier", id: DEFECT.supplier }}>{supplier(DEFECT.supplier)?.name}</RecLink>, <RecLink r={{ kind: "document", id: DEFECT.doc }} /></>],
            ["Approval owner", <RecLink r={{ kind: "person", id: DEFECT.approver }}>{personName(DEFECT.approver)}</RecLink>],
            ["Proposed return", <>{fmtDT(DEFECT.proposedReturn)} <Badge tone="warn">! Not confirmed</Badge></>],
            ["Release rule", "Approval is not roadworthiness. Release needs a repair-complete record and a return-to-service check."],
          ]} />
          <div className="r-pill-row" style={{ marginTop: 14 }}>
            {s.repair === "Awaiting approval"
              ? <Btn kind="primary" onClick={() => act.approveRepair()}>Approve €680 repair (as Joe)</Btn>
              : <Badge tone="ok">✓ Repair approved</Badge>}
            <PageLink page="Fleet" tab="maintenance">Open maintenance record</PageLink>
          </div>
        </Panel>
        <Panel title="Mihai's transport for J105, 11 Nov" sub="Surfacing at Dunlavin needs a truck and an eligible driver."
          right={transport ? <StateBadge state={transport.state} /> : undefined}>
          <KV rows={[
            ["Option", <>{HIRE.label}, <RecLink r={{ kind: "supplier", id: HIRE.supplier }}>{supplier(HIRE.supplier)?.name}</RecLink></>],
            ["Cost", <><span className="r-num">{eur(HIRE.cost)}</span> for {fmtDate(HIRE.date, "dow")} only, <RecLink r={{ kind: "document", id: HIRE.doc }} /></>],
            ["Driver and job", <><RecLink r={{ kind: "person", id: HIRE.driver }}>{personName(HIRE.driver)}</RecLink>, <RecLink r={{ kind: "job", id: HIRE.job }} /></>],
            ["Status", s.hire === "Approved" ? <>Approved. <RecLink r={{ kind: "hire", id: HIRE.id }} /> created.</> : "Proposed. Needs Joe's approval."],
          ]} />
          <div className="r-pill-row" style={{ marginTop: 14 }}>
            {s.hire === "Proposed"
              ? <Btn kind="primary" onClick={() => act.approveHire()}>Approve €260 hire (as Joe)</Btn>
              : <Badge tone="ok">✓ Hire approved</Badge>}
          </div>
          {asphalt.map((a) => (
            <div key={a.label} style={{ marginTop: 12 }}>
              <Note tone={a.state === "Ready" ? "ok" : "warn"}>
                Separate blocker: {a.label} for J105 is {a.state.toLowerCase()} (<RecLink r={a.ref!}>{a.detail}</RecLink>). Hiring transport does not confirm the asphalt.
              </Note>
            </div>
          ))}
        </Panel>
      </Grid>

      <Grid cols="1fr 1.6fr" style={{ marginTop: 14 }}>
        <Panel title="PLT-02 planned service" sub="Compact roller. Working normally.">
          <KV rows={[["Service date", fmtDate(PLT02_SERVICE.date, "dow") + " (" + rel(PLT02_SERVICE.date, s.clock) + ")"], ["Condition", "Not broken. Unavailable on the service day only."]]} />
        </Panel>
        <Availability s={s} />
      </Grid>
    </Page>
  );
}

function Availability({ s }: { s: DemoState }) {
  const f = fleet(s);
  const ids = f.owned.map((a) => a.id).concat(f.hired.map((a) => a.id));
  const d = today(s);
  const tpl = "90px repeat(5, minmax(84px,1fr))";
  return (
    <Panel title="Availability this week" sub="By date. A proposed return is not counted as capacity." pad={false}>
      <div className="r-scroll-x">
        <div style={{ minWidth: 560 }}>
          <div className="r-tr r-th" style={{ gridTemplateColumns: tpl }}>
            <div>Asset</div>{WEEK.map((w) => <div key={w} style={{ color: w === d ? "var(--accent)" : undefined }}>{fmtDate(w, "dow")}</div>)}
          </div>
          {ids.map((id) => (
            <div key={id} className="r-tr r-dense" style={{ gridTemplateColumns: tpl }}>
              <div><RecLink r={{ kind: id === HIRE.id ? "hire" : "asset", id }} /></div>
              {WEEK.map((w) => {
                const a = assetOn(s, id, w);
                return <div key={w} title={a.status} style={{ fontSize: 12 }}>
                  {a.available ? <span style={{ color: "var(--ok)" }}>✓ Available</span>
                    : <span style={{ color: /service/i.test(a.status) ? "var(--warn)" : id === HIRE.id ? "var(--faint)" : "var(--bad)" }}>{/service/i.test(a.status) ? "! Service" : id === HIRE.id ? "· Not hired" : "■ Unavailable"}</span>}
                </div>;
              })}
            </div>
          ))}
        </div>
      </div>
    </Panel>
  );
}

/* ── Assets ────────────────────────────────────────────────────────────── */
type Filter = "all" | "trucks" | "plant" | "hired";
function Assets({ initial }: { initial?: string }) {
  const s = useDemo();
  const f = fleet(s);
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<Filter>("all");
  const [open, setOpen] = useState<string | null>(initial || null);
  const all: AssetView[] = f.owned.concat(f.hired);
  const rows = all.filter((a) => (filter === "all" || (filter === "trucks" && a.kind === "Truck" && a.owned) || (filter === "plant" && a.kind === "Plant") || (filter === "hired" && a.hired))
    && (a.id + " " + a.label + " " + (a.driver ? personName(a.driver) : "")).toLowerCase().includes(q.trim().toLowerCase()));
  const cols: Col<AssetView>[] = [
    { k: "id", label: "Asset", w: ".8fr", render: (a) => <span style={{ fontWeight: 600 }}>{a.id}</span> },
    { k: "l", label: "Description", w: "1.6fr", render: (a) => a.label },
    { k: "k", label: "Type", w: ".6fr", hideSm: true, render: (a) => a.kind },
    { k: "o", label: "Ownership", w: ".7fr", render: (a) => a.hired ? <Badge tone="info">Hired</Badge> : <span className="r-dim">Owned</span> },
    { k: "d", label: "Driver", w: "1fr", hideSm: true, render: (a) => a.driver ? personName(a.driver) : <span className="r-faint">None</span> },
    { k: "s", label: "Today", w: "1.4fr", render: (a) => <StateBadge state={a.available ? "Available" : "Unavailable"} /> },
  ];
  const sel = open ? all.find((a) => a.id === open) : undefined;
  return (
    <Page title="Assets" sub="Owned trucks and plant, with hired capacity kept in its own category.">
      <div style={{ display: "flex", flexWrap: "wrap", gap: 10, alignItems: "center", marginBottom: 14 }}>
        <input className="r-input" placeholder="Search assets or drivers" value={q} onChange={(e) => setQ(e.target.value)} style={{ flex: "1 1 220px", maxWidth: 360 }} aria-label="Search assets" />
        <Seg value={filter} onChange={setFilter} options={[{ id: "all", label: "All" }, { id: "trucks", label: "Trucks" }, { id: "plant", label: "Plant" }, { id: "hired", label: "Hired (" + f.hired.length + ")" }]} />
      </div>
      <Panel pad={false}>
        <Table cols={cols} rows={rows} keyOf={(a) => a.id} onRow={(a) => setOpen(a.id)}
          empty={filter === "hired" ? "No hired assets. HIR-01 is created only when Joe approves the €260 hire." : "No assets match."} />
      </Panel>
      {sel && <AssetSheet s={s} a={sel} onClose={() => setOpen(null)} />}
    </Page>
  );
}

function AssetSheet({ s, a, onClose }: { s: DemoState; a: AssetView; onClose: () => void }) {
  const d = today(s);
  const next = WEEK.filter((w) => w >= d).flatMap((w) => (["A", "B"] as const).map((c) => ({ w, c, cd: s.plan[w]?.[c] })))
    .find((x) => x.cd && (x.cd.truck === a.id || x.cd.plant === a.id));
  const checks = CHECKS.filter((c) => c.asset === a.id);
  const linkedJob = a.hired ? HIRE.job : next?.cd?.job;
  return (
    <SideSheet title={a.id + ", " + a.label} sub={(a.hired ? "Hired" : "Owned") + " " + a.kind.toLowerCase() + ". " + a.note} onClose={onClose}
      footer={a.id === "TRK-02" ? <PageLink page="Fleet" tab="maintenance">Open TRK-02 maintenance record</PageLink> : undefined}>
      <KV rows={[
        ["Today", <StateBadge state={a.available ? "Available" : "Unavailable"} />],
        ["Status", a.status],
        ["Primary driver", a.driver ? <RecLink r={{ kind: "person", id: a.driver }}>{personName(a.driver)}</RecLink> : "None"],
        ["Next job", linkedJob ? <><RecLink r={{ kind: "job", id: linkedJob }}>{linkedJob} {jobById(s, linkedJob)?.name}</RecLink>{next ? ", " + fmtDate(next.w, "dow") + ", Crew " + next.c : ""}</> : "Not planned this week"],
      ]} />
      <div>
        <div className="r-eyebrow" style={{ marginBottom: 8 }}>Availability by date</div>
        <div className="r-list">
          {WEEK.map((w) => {
            const x = assetOn(s, a.id, w);
            return <div key={w} className="r-li" style={{ padding: "7px 0", alignItems: "center" }}>
              <span style={{ width: 90, flex: "none", fontSize: 13 }}>{fmtDate(w, "dow")}</span>
              <span className="r-dim" style={{ flex: 1, fontSize: 12.5 }}>{x.status}</span>
              <StateBadge state={x.available ? "Available" : "Unavailable"} />
            </div>;
          })}
        </div>
      </div>
      <div>
        <div className="r-eyebrow" style={{ marginBottom: 8 }}>Checks</div>
        {checks.length ? checks.map((c) => (
          <div key={c.id} className="r-li" style={{ padding: "7px 0", alignItems: "center" }}>
            <span style={{ width: 90, flex: "none", fontSize: 13 }}>{fmtDate(c.date, "dow")}</span>
            <span className="r-dim" style={{ flex: 1, fontSize: 12.5 }}>{personName(c.operator)}: {c.note}</span>
            <StateBadge state={c.result} />
          </div>
        )) : <div className="r-dim" style={{ fontSize: 13 }}>No checks recorded this week.</div>}
      </div>
      {a.id === "TRK-02" && (
        <Note tone="bad">Defect {DEFECT.id}: {DEFECT.summary.toLowerCase()}, reported {fmtDT(DEFECT.reported)}. Repair quote {eur(DEFECT.quote)} ({s.repair.toLowerCase()}).</Note>
      )}
      <div>
        <div className="r-eyebrow" style={{ marginBottom: 8 }}>Cost notes</div>
        <div className="r-dim" style={{ fontSize: 13, lineHeight: 1.55 }}>
          {a.id === "TRK-02" ? "The €680 repair sits inside the €2,200 repair and maintenance allowance. Approving it adds nothing to the monthly forecast."
            : a.hired ? "€260 for one day, added to modelled overhead and planned cash once approved. Not charged into J105."
              : "Running costs reach jobs through their plant, fuel and transport cost lines. See Fleet costs."}
        </div>
      </div>
    </SideSheet>
  );
}

/* ── Maintenance ───────────────────────────────────────────────────────── */
const STEPS = ["Reported", "Reviewed", "Approved", "Repair complete", "Return checked"];
const STEP_INDEX: Record<DemoState["repair"], number> = { "Awaiting approval": 2, Approved: 3, "Repair complete": 4, "Returned to service": 5 };

function Maintenance() {
  const s = useDemo();
  const doneN = STEP_INDEX[s.repair];
  const log = s.repairLog;
  const logFor = (i: number) => log[i];
  const status = assetOn(s, "TRK-02", today(s));
  return (
    <Page title="Maintenance" sub="Each step is recorded separately. Approval and an invoice never release an asset on their own.">
      <Panel title={"TRK-02, " + DEFECT.summary.toLowerCase()} sub={status.status} right={<StateBadge state={status.available ? "Available" : "Unavailable"} />}>
        <Grid cols="repeat(5, 1fr)" gap={10}>
          {STEPS.map((step, i) => {
            const done = i < doneN, current = i === doneN;
            const e = done ? logFor(i) : undefined;
            return (
              <div key={step} className="r-stat" style={current ? { borderColor: "var(--accent-line)" } : undefined}>
                <div className="r-stat-label">Step {i + 1}</div>
                <div style={{ fontSize: 14, fontWeight: 600, marginTop: 6, color: done ? "var(--ink)" : "var(--dim)" }}>{step}</div>
                <div style={{ marginTop: 8 }}>{done ? <Badge tone="ok">✓ Done</Badge> : current ? <Badge tone="warn">! Next</Badge> : <Badge>· Waiting</Badge>}</div>
                {e && <div className="r-stat-sub">{e.step}. {personName(e.by)}, {fmtDT(e.at)}</div>}
              </div>
            );
          })}
        </Grid>
        <div className="r-pill-row" style={{ marginTop: 16 }}>
          <Btn kind={s.repair === "Awaiting approval" ? "primary" : "ghost"} disabled={s.repair !== "Awaiting approval" && "Already approved"} onClick={() => act.approveRepair()}>Approve €680 repair (as Joe)</Btn>
          <Btn kind={s.repair === "Approved" ? "primary" : "ghost"} disabled={s.repair !== "Approved" && (s.repair === "Awaiting approval" ? "Needs approval first" : "Already recorded")} onClick={() => act.recordRepairComplete()}>Record repair complete</Btn>
          <Btn kind={s.repair === "Repair complete" ? "primary" : "ghost"} disabled={s.repair !== "Repair complete" && (s.repair === "Returned to service" ? "Already returned" : "Needs repair completion first")} onClick={() => act.recordReturnCheck()}>Record return-to-service check</Btn>
        </div>
        <div style={{ marginTop: 14 }}>
          <KV rows={[
            ["Quote", <>{eur(DEFECT.quote)}, <RecLink r={{ kind: "supplier", id: DEFECT.supplier }}>{supplier(DEFECT.supplier)?.name}</RecLink>, <RecLink r={{ kind: "document", id: DEFECT.doc }} /></>],
            ["Approver", <>{personName(DEFECT.approver)}, task <RecLink r={{ kind: "task", id: "W002" }} /></>],
            ["Proposed return", fmtDT(DEFECT.proposedReturn) + ", not confirmed and not counted as capacity"],
            ["Origin", <>Failed check on {fmtDate("2026-11-09", "dow")}, <PageLink page="Fleet" tab="checks">see checks</PageLink></>],
          ]} />
        </div>
      </Panel>
      <Grid cols="1fr 1fr" style={{ marginTop: 14 }}>
        <Panel title="PLT-02 planned service" sub="Compact roller" right={<StateBadge state="Planned" />}>
          <KV rows={[["Date", fmtDate(PLT02_SERVICE.date, "dow") + " (" + rel(PLT02_SERVICE.date, s.clock) + ")"], ["Condition", PLT02_SERVICE.note], ["Plan impact", "Unavailable that day only. The week plan uses PLT-03 for Crew B on 12 Nov."]]} />
        </Panel>
        <Panel title="Activity" sub="What has been recorded against TRK-02">
          <div className="r-list">
            {log.slice().reverse().map((e, i) => (
              <div key={i} className="r-li" style={{ alignItems: "center" }}>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13 }}>{e.step}</span>
                <span className="r-dim" style={{ fontSize: 12 }}>{personName(e.by)}, {fmtDT(e.at)}</span>
              </div>
            ))}
          </div>
        </Panel>
      </Grid>
    </Page>
  );
}

/* ── Checks ────────────────────────────────────────────────────────────── */
function Checks() {
  type Row = (typeof CHECKS)[number];
  const cols: Col<Row>[] = [
    { k: "d", label: "Date", w: ".8fr", render: (c) => fmtDate(c.date, "dow") },
    { k: "a", label: "Asset", w: ".7fr", render: (c) => <RecLink r={{ kind: "asset", id: c.asset }} /> },
    { k: "o", label: "Operator", w: "1fr", render: (c) => personName(c.operator) },
    { k: "r", label: "Result", w: ".7fr", render: (c) => <StateBadge state={c.result} /> },
    { k: "n", label: "Note", w: "1.8fr", render: (c) => <span className="r-dim">{c.note}</span> },
    { k: "x", label: "Defect", w: "1.2fr", render: (c) => "defect" in c && c.defect ? <PageLink page="Fleet" tab="maintenance">{c.defect}: open TRK-02 maintenance</PageLink> : <span className="r-faint">None</span> },
  ];
  return (
    <Page title="Checks" sub="Simple equipment check records. A failed check opens the same maintenance record as the defect.">
      <Panel pad={false} title={CHECKS.length + " checks this week"} sub={CHECKS.filter((c) => c.result === "Fail").length + " failed"}>
        <Table cols={cols} rows={CHECKS} keyOf={(c) => c.id} />
      </Panel>
      <div style={{ marginTop: 12 }}><Note>Demo check records only. They are not presented as a verified legal inspection regime.</Note></div>
    </Page>
  );
}

/* ── Costs ─────────────────────────────────────────────────────────────── */
function Costs() {
  const s = useDemo();
  const b = month(s);
  const maint = b.overheadLines.find((o) => o.id === "OH-4");
  const rows = b.jobs.map((j) => {
    const get = (c: string) => j.lines.find((l) => l.cat === c)!;
    const p = get("plant"), f = get("fuel"), t = get("transport");
    return { j, plant: p.forecast, fuel: f.forecast, transport: t.forecast, posted: p.posted + f.posted + t.posted, total: p.forecast + f.forecast + t.forecast };
  });
  type Row = (typeof rows)[number];
  const sum = (k: "plant" | "fuel" | "transport" | "total" | "posted") => rows.reduce((a, r) => a + r[k], 0);
  const cols: Col<Row>[] = [
    { k: "j", label: "Job", w: "1.7fr", render: (r) => <RecLink r={{ kind: "job", id: r.j.id }}>{r.j.id} {r.j.name}</RecLink> },
    { k: "p", label: "Plant", w: ".7fr", align: "right", render: (r) => <span className="r-num">{eur(r.plant)}</span> },
    { k: "f", label: "Fuel", w: ".7fr", align: "right", render: (r) => <span className="r-num">{eur(r.fuel)}</span> },
    { k: "t", label: "Transport", w: ".7fr", align: "right", render: (r) => <span className="r-num">{eur(r.transport)}</span> },
    { k: "x", label: "Forecast", w: ".8fr", align: "right", render: (r) => <span className="r-num" style={{ fontWeight: 600 }}>{eur(r.total)}</span> },
    { k: "s", label: "Basis", w: "1fr", hideSm: true, render: () => <Badge tone="ok">✓ Included in forecast</Badge> },
  ];
  const hireIn = s.hire === "Approved";
  return (
    <Page title="Fleet costs" sub="Job-linked allocations sit in each job's direct costs. Repair and hire are business-level. Nothing is counted twice.">
      <Grid cols="repeat(3, 1fr)">
        <Stat label="November job fleet allocations" value={eur(sum("total"))} sub={"Plant, fuel and transport. " + eur(sum("posted")) + " posted so far"} />
        <Stat label="Repair and maintenance allowance" value={eur(maint?.amount || 0)} sub="Overhead line. Already allows for the €680 repair" />
        <Stat label="Replacement transport" value={eur(HIRE.cost)} sub={hireIn ? "Approved, included in overhead" : "Proposed addition, not in forecast"} tone={hireIn ? undefined : "warn"} />
      </Grid>
      <Panel title="Job-linked allocations" sub="From each November job's plant, fuel and transport cost lines" style={{ marginTop: 14 }} pad={false}>
        <Table cols={cols} rows={rows} keyOf={(r) => r.j.id}
          foot={<span>Total {eur(sum("total"))}: plant {eur(sum("plant"))}, fuel {eur(sum("fuel"))}, transport {eur(sum("transport"))}. Part of the {eur(b.cost)} forecast direct costs.</span>} />
      </Panel>
      <Panel title="Business-level fleet items" style={{ marginTop: 14 }}>
        <div className="r-list">
          <div className="r-li" style={{ alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 260px", minWidth: 0 }}>
              <div style={{ fontSize: 13.5 }}>TRK-02 brake repair, <RecLink r={{ kind: "document", id: DEFECT.doc }} /></div>
              <div className="r-dim" style={{ fontSize: 12.5, marginTop: 3 }}>Inside the {eur(maint?.amount || 0)} repair contingency. Approving it does not add {eur(DEFECT.quote)} to the forecast. Payable outside the 10 to 16 Nov cash window.</div>
            </div>
            <span className="r-num" style={{ fontWeight: 600 }}>{eur(DEFECT.quote)}</span>
            <Badge tone="ok">✓ Included in forecast</Badge>
          </div>
          <div className="r-li" style={{ alignItems: "center", flexWrap: "wrap" }}>
            <div style={{ flex: "1 1 260px", minWidth: 0 }}>
              <div style={{ fontSize: 13.5 }}>{HIRE.id} replacement transport, <RecLink r={{ kind: "document", id: HIRE.doc }} /></div>
              <div className="r-dim" style={{ fontSize: 12.5, marginTop: 3 }}>
                {hireIn ? "Approved. Added once to modelled overhead (now " + eur(b.overhead) + ") and to planned cash on 11 Nov. Not charged into J105."
                  : "Not in the baseline. If Joe approves, it is added once to overhead and planned cash, not to J105's direct costs."}
              </div>
            </div>
            <span className="r-num" style={{ fontWeight: 600 }}>{eur(HIRE.cost)}</span>
            {hireIn ? <Badge tone="ok">✓ Included in forecast</Badge> : <Badge tone="warn">! Proposed addition</Badge>}
            {!hireIn && <Btn small kind="primary" onClick={() => act.approveHire()}>Approve (as Joe)</Btn>}
          </div>
        </div>
      </Panel>
      <div style={{ marginTop: 10 }} className="r-faint"><span style={{ fontSize: 12 }}>See how these feed the month: </span><PageLink page="Finance" tab="goals">Finance goals</PageLink></div>
    </Page>
  );
}
