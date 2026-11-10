/* Work: My work, Approvals, Workflows and the cross-functional Schedule. */
import { useState, type ReactNode } from "react";
import { useDemo, go, openRecord } from "../store";
import { act } from "../actions";
import { FLORIN_DAY, HIRE, PLT02_SERVICE, VARIATION, DEFECT, type Ref } from "../fixtures";
import {
  tasks, pendingApprovals, personName, readiness, jobById, invoiceById, pipeline, pos, today, month, scenario,
} from "../selectors";
import { dayOf, eur, fmtDate, fmtDT, fmtTime, rel, relDT } from "../format";
import { Page, Panel, Grid, Badge, StateBadge, Btn, RecLink, Table, Seg, Note, Avatar, Eyebrow, type Tone } from "../ui";
import { PEOPLE } from "../fixtures";

type Props = { tab: string; params: Record<string, string> };

export default function WorkPage({ tab }: Props) {
  if (tab === "approvals") return <Approvals />;
  if (tab === "workflows") return <Workflows />;
  if (tab === "schedule") return <Schedule />;
  return <MyWork />;
}

const PRI_TONE: Record<string, Tone> = { Critical: "bad", High: "warn", Medium: "neutral" };

function MyWork() {
  const s = useDemo();
  const def = s.viewAs === "crew" ? "all" : s.viewAs;
  const [owner, setOwner] = useState<string>(def);
  const all = tasks(s);
  const list = owner === "all" ? all : all.filter((t) => t.owner === owner);
  const owners = ["P01", "P02", "P03"].filter((o) => owner === "all" || o === owner);
  const open = list.filter((t) => t.open);
  const late = open.filter((t) => t.late);
  return (
    <Page title="My work" sub="Every task has one named owner, a due time and the record it belongs to. Florin no longer has to hold all of it."
      actions={<Seg value={owner} onChange={setOwner} options={[{ id: "P01", label: "Florin" }, { id: "P02", label: "Joe" }, { id: "P03", label: "Aoife" }, { id: "all", label: "All" }]} />}>
      <Grid cols="repeat(4, minmax(0,1fr))" style={{ marginBottom: 14 }}>
        <Mini label="Open" value={String(open.length)} />
        <Mini label="Past due" value={String(late.length)} tone={late.length ? "warn" : undefined} />
        <Mini label="Waiting on a decision" value={String(open.filter((t) => t.approval).length)} />
        <Mini label="Done" value={String(list.length - open.length)} tone="ok" />
      </Grid>
      <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
        {owners.map((o) => {
          const p = PEOPLE.find((x) => x.id === o)!;
          const rows = list.filter((t) => t.owner === o).sort((a, b) => Number(!a.open) - Number(!b.open) || a.due.localeCompare(b.due));
          return (
            <Panel key={o} pad={false}
              title={<span style={{ display: "inline-flex", alignItems: "center", gap: 10 }}><Avatar initials={p.initials} tint={p.tint} size={26} />{p.name}</span>}
              sub={p.role + " · " + rows.filter((t) => t.open).length + " open"}>
              <Table keyOf={(t) => t.id} rows={rows} onRow={(t) => openRecord("task", t.id)} empty="No tasks for this owner."
                cols={[
                  { k: "t", label: "Task", w: "2.2fr", render: (t) => (
                    <div>
                      <div style={{ color: t.open ? "var(--ink)" : "var(--faint)", textDecoration: t.open ? "none" : "line-through" }}>{t.title}</div>
                      <div className="r-faint" style={{ fontSize: 11.5, marginTop: 2 }}>{t.id} · {t.area}</div>
                    </div>) },
                  { k: "p", label: "Priority", w: ".8fr", render: (t) => <Badge tone={PRI_TONE[t.priority]}>{t.priority}</Badge> },
                  { k: "d", label: "Due", w: "1fr", render: (t) => (
                    <span className="r-num" style={{ color: t.late ? "var(--warn)" : "var(--body)" }}>{relDT(t.due, s.clock)}{t.late ? " · late" : ""}</span>) },
                  { k: "s", label: "Status", w: "1fr", render: (t) => <StateBadge state={t.status} /> },
                  { k: "r", label: "Record", w: ".9fr", render: (t) => <RecLink r={t.ref} /> },
                ]} />
            </Panel>
          );
        })}
      </div>
    </Page>
  );
}

function Mini({ label, value, tone }: { label: string; value: string; tone?: Tone }) {
  return (
    <div className="r-stat">
      <div className="r-stat-label">{label}</div>
      <div className="r-stat-value" style={{ fontSize: 22, color: tone === "warn" ? "var(--warn)" : tone === "ok" ? "var(--ok)" : undefined }}>{value}</div>
    </div>
  );
}

/* ── Approvals ─────────────────────────────────────────────────────────── */
function Approvals() {
  const s = useDemo();
  const all = tasks(s).filter((t) => t.approval);
  const pend = pendingApprovals(s);
  const decided = all.filter((t) => !t.open);
  const sc = scenario(s);
  const spec: Record<string, { does: string; not: string; action: ReactNode; extra?: ReactNode }> = {
    W002: { does: "Records Joe's yes to the " + eur(DEFECT.quote) + " repair at Naas Commercial Repairs. Already allowed for in the €2,200 maintenance line, so the forecast does not move.",
      not: "It does not make TRK-02 roadworthy. The truck stays unavailable until repair completion and a return-to-service check are recorded.",
      action: <Btn kind="primary" onClick={act.approveRepair}>Approve repair as Joe</Btn> },
    W003: { does: "Creates HIR-01, a one-day tipper for Mihai on 11 Nov, and adds " + eur(HIRE.cost) + " to modelled overhead and planned cash.",
      not: "It does not confirm the 18 t asphalt on PO-204 and does not clear the broken truck.",
      action: <Btn kind="primary" onClick={act.approveHire}>Approve hire as Joe</Btn> },
    W006: { does: "Joe records the VAT treatment and RCT applicability for J105 as two separate fields, with reviewer and time.",
      not: "There is no automatic rule. Private does not mean no VAT, and nothing is filed with Revenue.",
      action: <Btn kind="primary" onClick={() => go("Finance", "tax")}>Open tax review</Btn> },
    W007: { does: "Florin approves the " + eur(VARIATION.price) + " variation draft so it can be put to Naas Logistics Park.",
      not: "Internal approval is not customer acceptance. J104 stays at €24,000 until the customer accepts.",
      action: <Btn kind="primary" onClick={act.approveVariationInternally}>Approve draft as Florin</Btn>,
      extra: !sc.varIn ? <span className="r-faint" style={{ fontSize: 12 }}>Goal scenario with the variation: {eur(month(s).op + VARIATION.price)}</span> : undefined },
  };
  return (
    <Page title="Approvals" sub="Four decisions that move money or contract value. Each one says what a yes does and what it does not do.">
      <Eyebrow style={{ margin: "0 0 10px" }}>Waiting · {pend.length}</Eyebrow>
      {pend.length === 0 && <Note tone="ok">Nothing waiting. Every decision has been recorded.</Note>}
      <Grid cols="repeat(2, minmax(0,1fr))">
        {pend.map((t) => {
          const sp = spec[t.id];
          return (
            <Panel key={t.id} tone={t.priority === "Critical" ? "bad" : "warn"} title={t.title}
              sub={<>Owner {t.ownerName} · due {relDT(t.due, s.clock)}{t.late ? " · late" : ""} · <RecLink r={t.ref} /></>}
              right={<Badge tone={PRI_TONE[t.priority]}>{t.priority}</Badge>}>
              <div style={{ display: "flex", flexDirection: "column", gap: 10, fontSize: 13, lineHeight: 1.55 }}>
                <div><span className="r-eyebrow" style={{ display: "block", marginBottom: 3 }}>Approving does</span>{sp?.does}</div>
                <div><span className="r-eyebrow" style={{ display: "block", marginBottom: 3 }}>It does not</span><span className="r-dim">{sp?.not}</span></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, alignItems: "center", marginTop: 4 }}>
                  {sp?.action}<Btn onClick={() => openRecord(t.ref.kind, t.ref.id)}>Open record</Btn>{sp?.extra}
                </div>
              </div>
            </Panel>
          );
        })}
      </Grid>
      <Eyebrow style={{ margin: "24px 0 10px" }}>Decided · {decided.length}</Eyebrow>
      <Panel pad={false}>
        <Table keyOf={(t) => t.id} rows={decided} onRow={(t) => openRecord("task", t.id)} empty="No decisions recorded yet."
          cols={[
            { k: "t", label: "Decision", w: "2fr", render: (t) => t.title },
            { k: "o", label: "Owner", w: "1fr", render: (t) => t.ownerName },
            { k: "s", label: "Outcome", w: "1fr", render: (t) => <StateBadge state="Approved" /> },
            { k: "r", label: "Record", w: "1fr", render: (t) => <RecLink r={t.ref} /> },
          ]} />
      </Panel>
    </Page>
  );
}

/* ── Workflows ─────────────────────────────────────────────────────────── */
type Step = { label: string; state: "done" | "current" | "todo" | "blocked"; owner?: string; ref?: Ref; note?: string };
function Workflows() {
  const s = useDemo();
  const r105 = readiness(s, "J105", "2026-11-11");
  const po204 = pos(s).find((p) => p.id === "PO-204")!;
  const transport = r105.items.find((i) => i.label === "Transport");
  const flows: { name: string; trigger: string; record: Ref; owner: string; steps: Step[] }[] = [];

  const transportOk = transport?.state === "Ready";
  const matOk = po204.status === "Confirmed" || po204.status === "Delivered";
  flows.push({ name: "Accepted job → ready for site", trigger: "Job accepted", record: { kind: "job", id: "J105" }, owner: "P01",
    steps: [
      { label: "Job accepted and scoped", state: "done", owner: "P01" },
      { label: "Crew planned", state: "done", owner: "P01", note: "Crew B, 9 to 11 Nov" },
      { label: "Stone delivered", state: "done", owner: "P03", ref: { kind: "po", id: "PO-203" } },
      { label: "Transport for surfacing", state: transportOk ? "done" : "blocked", owner: "P02", ref: transport?.ref, note: transport?.detail },
      { label: "Asphalt confirmed", state: matOk ? "done" : "blocked", owner: "P03", ref: { kind: "po", id: "PO-204" }, note: "PO-204 " + po204.status.toLowerCase() },
      { label: "Ready for site", state: r105.overall === "Ready" ? "done" : "todo", owner: "P01" },
    ] });

  const order = ["Awaiting approval", "Approved", "Repair complete", "Returned to service"];
  const ri = order.indexOf(s.repair);
  const st = (i: number): Step["state"] => (ri > i ? "done" : ri === i ? "current" : "todo");
  flows.push({ name: "Breakdown → repair and return check", trigger: "Failed check", record: { kind: "asset", id: "TRK-02" }, owner: "P02",
    steps: [
      { label: "Defect reported", state: "done", owner: "P05", note: fmtDT(DEFECT.reported) },
      { label: "Repair quote attached", state: "done", owner: "P01", ref: { kind: "document", id: DEFECT.doc } },
      { label: "Repair approved", state: ri >= 1 ? "done" : "current", owner: "P02", ref: { kind: "task", id: "W002" } },
      { label: "Repair complete recorded", state: st(1), owner: "P01" },
      { label: "Return-to-service check", state: st(2), owner: "P05", note: "Proposed return " + fmtDT(DEFECT.proposedReturn) + ", unconfirmed" },
      { label: "Released for work", state: ri === 3 ? "done" : "todo", owner: "P01" },
    ] });

  const tax = s.tax.J105;
  const j103 = invoiceById(s, "INV-103")!;
  flows.push({ name: "Completed job → invoice preparation → tax review", trigger: "Job completed", record: { kind: "job", id: "J105" }, owner: "P03",
    steps: [
      { label: "J103 completed, invoiced as INV-103", state: "done", owner: "P03", ref: { kind: "invoice", id: j103.id }, note: "Reviewed contractor record" },
      { label: "J105 draft invoice prepared", state: "done", owner: "P03", note: eur(jobById(s, "J105")!.value) + " net" },
      { label: "Tax review (VAT and RCT, separately)", state: tax.status === "Reviewed" ? "done" : "blocked", owner: "P02", ref: { kind: "task", id: "W006" }, note: tax.status },
      { label: "Local invoice preview", state: s.invoicePreview.J105 ? "done" : tax.status === "Reviewed" ? "current" : "todo", owner: "P03" },
      { label: "Issue in the existing accounting system", state: "todo", owner: "P03", note: "Outside Pulse" },
    ] });

  const inv = invoiceById(s, "INV-099")!;
  flows.push({ name: "Overdue invoice → reviewed follow-up → receipt", trigger: "Invoice past due", record: { kind: "invoice", id: "INV-099" }, owner: "P03",
    steps: [
      { label: "Overdue detected", state: "done", owner: "P03", note: inv.open ? inv.daysOverdue + " days overdue" : "Was 14 days overdue" },
      { label: "Reminder drafted by Finance Agent", state: "done", owner: "P03" },
      { label: "Draft reviewed", state: inv.reminderReviewed || !inv.open ? "done" : "current", owner: "P03" },
      { label: "Customer response recorded", state: inv.promise || !inv.open ? "done" : inv.reminderReviewed ? "current" : "todo", owner: "P03", note: inv.promise ? "Promised " + fmtDate(inv.promise.date, "dow") : undefined },
      { label: "Receipt recorded", state: inv.open ? "todo" : "done", owner: "P03", note: inv.open ? eur(inv.open) + " still open" : "Paid" },
    ] });

  return (
    <Page title="Workflows" sub="Four templates with the run that is live right now. Each shows its steps, where it is stuck and who owns the next move. Nothing runs outside the demo.">
      <Grid cols="repeat(2, minmax(0,1fr))">
        {flows.map((f) => {
          const blocker = f.steps.find((x) => x.state === "blocked") || f.steps.find((x) => x.state === "current");
          const doneN = f.steps.filter((x) => x.state === "done").length;
          return (
            <Panel key={f.name} title={f.name} sub={<>Trigger: {f.trigger} · current run <RecLink r={f.record} /> · {doneN} of {f.steps.length} steps</>}
              right={<StateBadge state={doneN === f.steps.length ? "Completed" : f.steps.some((x) => x.state === "blocked") ? "Blocked" : "In progress"} />}>
              <ol style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {f.steps.map((x, i) => (
                  <li key={i} style={{ display: "flex", gap: 11, padding: "8px 0", borderTop: i ? "1px solid var(--border)" : 0 }}>
                    <StepDot state={x.state} />
                    <div style={{ flex: 1, minWidth: 0, fontSize: 13 }}>
                      <div style={{ color: x.state === "todo" ? "var(--dim)" : "var(--ink)" }}>{x.label}{x.ref && <> · <RecLink r={x.ref} /></>}</div>
                      <div className="r-faint" style={{ fontSize: 11.5, marginTop: 2 }}>{x.owner ? personName(x.owner) : ""}{x.note ? " · " + x.note : ""}</div>
                    </div>
                  </li>
                ))}
              </ol>
              {blocker && <Note tone={blocker.state === "blocked" ? "warn" : "neutral"}>{blocker.state === "blocked" ? "Blocked at" : "Next"}: {blocker.label}, owner {blocker.owner ? personName(blocker.owner) : "unassigned"}.</Note>}
            </Panel>
          );
        })}
      </Grid>
    </Page>
  );
}
function StepDot({ state }: { state: Step["state"] }) {
  const map = { done: ["✓", "var(--ok)", "var(--ok-soft)"], current: ["›", "var(--accent)", "var(--accent-soft)"], blocked: ["!", "var(--bad)", "var(--bad-soft)"], todo: ["", "var(--faint)", "var(--surface-2)"] }[state];
  return <span aria-label={state} style={{ flex: "none", width: 22, height: 22, borderRadius: 999, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 700, color: map[1], background: map[2], border: "1px solid var(--border)" }}>{map[0]}</span>;
}

/* ── Schedule ──────────────────────────────────────────────────────────── */
type Ev = { at: string; kind: string; title: string; who?: string; ref?: Ref; tone: Tone };
function Schedule() {
  const s = useDemo();
  const evs: Ev[] = [];
  tasks(s).filter((t) => t.open).forEach((t) => evs.push({ at: t.due, kind: "Deadline", title: t.title, who: t.owner, ref: { kind: "task", id: t.id }, tone: t.priority === "Critical" ? "bad" : "warn" }));
  FLORIN_DAY.forEach((v) => evs.push({ at: "2026-11-10T" + v.at, kind: "Visit", title: v.what, who: "P01", ref: v.ref, tone: "accent" }));
  pos(s).filter((p) => p.status !== "Delivered").forEach((p) => evs.push({ at: p.window, kind: "Delivery", title: p.qty + " t " + p.material.toLowerCase() + " for " + p.job + " (" + p.status.toLowerCase() + ")", who: p.owner, ref: { kind: "po", id: p.id }, tone: p.status === "Confirmed" ? "ok" : "warn" }));
  evs.push({ at: PLT02_SERVICE.date + "T08:00", kind: "Service", title: "PLT-02 compact roller: planned service", who: "P01", ref: { kind: "asset", id: "PLT-02" }, tone: "info" });
  pipeline(s).open.forEach((q) => evs.push({ at: q.followUp + "T10:00", kind: "Quote follow-up", title: q.id + " " + q.customerName + ", " + eur(q.value), who: q.owner, ref: { kind: "quote", id: q.id }, tone: "neutral" }));
  if (s.repair !== "Returned to service") evs.push({ at: DEFECT.proposedReturn, kind: "Proposed return", title: "TRK-02 proposed return (unconfirmed)", who: "P01", ref: { kind: "asset", id: "TRK-02" }, tone: "neutral" });
  const from = today(s);
  const list = evs.filter((e) => dayOf(e.at) >= from).sort((a, b) => a.at.localeCompare(b.at));
  const past = evs.filter((e) => dayOf(e.at) < from).length;
  const days = Array.from(new Set(list.map((e) => dayOf(e.at))));
  return (
    <Page title="Schedule" sub="Decisions, deadlines, deliveries, service and follow-ups in one agenda. Crew and truck planning lives in Planning.">
      {past > 0 && <Note>{past} earlier item{past > 1 ? "s" : ""} before today are not shown.</Note>}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginTop: past ? 14 : 0 }}>
        {days.map((d) => (
          <Panel key={d} title={fmtDate(d, "long")} sub={rel(d, s.clock)} pad={false}>
            <div className="r-list" style={{ padding: "0 20px 6px" }}>
              {list.filter((e) => dayOf(e.at) === d).map((e, i) => (
                <div key={i} className="r-li">
                  <span className="r-num" style={{ flex: "none", width: 46, fontSize: 13, color: "var(--dim)", paddingTop: 1 }}>{fmtTime(e.at) || "All day"}</span>
                  <div style={{ flex: 1, minWidth: 0, fontSize: 13 }}>
                    <div style={{ color: "var(--ink)" }}>{e.title}</div>
                    <div className="r-faint" style={{ fontSize: 11.5, marginTop: 3, display: "flex", flexWrap: "wrap", gap: 6, alignItems: "center" }}>
                      <Badge tone={e.tone}>{e.kind}</Badge>{e.who ? personName(e.who) : ""}{e.ref && <> · <RecLink r={e.ref} /></>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Panel>
        ))}
        {!days.length && <Note>Nothing scheduled from today.</Note>}
      </div>
    </Page>
  );
}
