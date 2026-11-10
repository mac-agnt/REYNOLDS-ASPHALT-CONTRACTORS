/* One drawer for every record kind, so every ID anywhere in the demo resolves. */
import type { ReactNode } from "react";
import { closeRecord, go, useDemo, useUi } from "./store";
import { act } from "./actions";
import {
  activity, actorName, assetOn, credentials, customer, customerBalance, docById, fleet, invoiceById, invoices, jobById, jobs, leave, person,
  pipeline, poById, pos, readiness, runs, supplier, tasks, today, personName, nextCriticalDate,
} from "./selectors";
import { BILLS, CHECKS, COST_LABEL, DEFECT, DOCUMENTS, HIRE, VARIATION, AGENTS, type Ref } from "./fixtures";
import { eur, fmtDate, fmtDT } from "./format";
import { Badge, Btn, downloadText, KV, Note, RecLink, SideSheet, StateBadge, Table } from "./ui";

export default function RecordDrawer() {
  const ui = useUi();
  const s = useDemo();
  if (!ui.drawer) return null;
  const { kind, id } = ui.drawer;
  const v = view(s, kind, id);
  if (!v) {
    return <SideSheet title={id} sub="Record not found in the demo data" onClose={closeRecord}><Note>This ID does not resolve to a record.</Note></SideSheet>;
  }
  const related = activity(s).filter((e) => e.refs.some((r) => r.kind === kind && r.id === id)).slice(0, 6);
  return (
    <SideSheet title={v.title} sub={v.sub} onClose={closeRecord}
      footer={<>{v.actions}<span style={{ flex: 1 }} />{v.open && <Btn onClick={() => go(v.open![0], v.open![1], v.open![2])}>{v.open[3] || "Open in module"}</Btn>}</>}>
      {v.badge && <div className="r-pill-row">{v.badge}</div>}
      {v.body}
      {v.links && v.links.length > 0 && (
        <div>
          <div className="r-eyebrow" style={{ marginBottom: 8 }}>Linked records</div>
          <div className="r-pill-row">{v.links.map((r) => <span key={r.kind + r.id} className="r-badge" style={{ background: "var(--surface-2)" }}><RecLink r={r}>{label(s, r)}</RecLink></span>)}</div>
        </div>
      )}
      {related.length > 0 && (
        <div>
          <div className="r-eyebrow" style={{ marginBottom: 6 }}>History</div>
          <div className="r-list">
            {related.map((e) => (
              <div key={e.id} className="r-li">
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, color: "var(--ink)" }}>{e.title}</div>
                  <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 2 }}>{actorName(e.actor)} · {fmtDT(e.at)} · {e.provenance}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </SideSheet>
  );
}

export function label(s: ReturnType<typeof useDemo>, r: Ref): string {
  switch (r.kind) {
    case "job": return r.id === "__goal" ? "November goal" : r.id + " " + (jobById(s, r.id)?.name || "");
    case "customer": return customer(r.id)?.name || r.id;
    case "supplier": return supplier(r.id)?.name || r.id;
    case "person": return person(r.id)?.name || r.id;
    case "document": return docById(r.id)?.title || r.id;
    case "task": return r.id + " " + (tasks(s).find((t) => t.id === r.id)?.title || "");
    case "run": return "Run " + r.id;
    default: return r.id;
  }
}

type V = { title: ReactNode; sub?: ReactNode; badge?: ReactNode; body: ReactNode; actions?: ReactNode; links?: Ref[]; open?: [string, string?, Record<string, string>?, string?] };

function view(s: ReturnType<typeof useDemo>, kind: Ref["kind"], id: string): V | null {
  switch (kind) {
    case "job": {
      const j = jobById(s, id); if (!j) return null;
      const nd = nextCriticalDate(s, id);
      const r = nd ? readiness(s, id, nd) : null;
      return {
        title: j.id + " " + j.name, sub: j.customerName + " · " + j.area + " · " + fmtDate(j.start) + " to " + fmtDate(j.end),
        badge: <><StateBadge state={j.status} /><Badge>{j.siteType}</Badge>{j.overrun > 0 && <Badge tone="warn">{eur(j.overrun)} over budget</Badge>}</>,
        body: <>
          <KV rows={[["Agreed value", eur(j.value) + (j.variationAccepted ? " (incl. V104-01)" : "")], ["Original budget", eur(j.budget)], ["Posted cost", eur(j.posted)], ["Remaining forecast", eur(j.remaining)],
            ["Forecast final cost", eur(j.forecast)], ["Gross profit", eur(j.profit) + " · " + j.margin.toFixed(2) + "%"], ["Next action", j.nextAction + " (" + personName(j.nextOwner) + ")"]]} />
          {r && <div><div className="r-eyebrow" style={{ marginBottom: 6 }}>Readiness for {fmtDate(r.date, "dow")}</div>
            {r.items.map((i) => <div key={i.label} style={{ display: "flex", gap: 10, alignItems: "center", padding: "5px 0" }}><StateBadge state={i.state} /><span style={{ fontSize: 13 }}>{i.label}: <span className="r-dim">{i.detail}</span></span></div>)}</div>}
        </>,
        links: [{ kind: "customer", id: j.customer } as Ref].concat(pos(s).filter((p) => p.job === id).map((p) => ({ kind: "po", id: p.id }) as Ref),
          invoices(s).filter((i) => i.job === id).map((i) => ({ kind: "invoice", id: i.id }) as Ref), id === "J104" ? [{ kind: "variation", id: "V104-01" }] : [],
          DOCUMENTS.filter((d) => d.refs.some((x) => x.kind === "job" && x.id === id)).map((d) => ({ kind: "document", id: d.id }) as Ref)),
        open: ["Jobs", "detail", { job: id }, "Open job"],
      };
    }
    case "variation": {
      return {
        title: VARIATION.id + " extra edge preparation", sub: "J104 Naas distribution yard · " + eur(VARIATION.price) + " additional price",
        badge: <StateBadge state={s.variation} />,
        body: <><Note>{VARIATION.detail}</Note>
          <KV rows={[["Status", s.variation], ["Effect on agreed value", s.variation === "Customer accepted" ? "Included: J104 now " + eur(24000 + VARIATION.price) : "None until the customer accepts"], ["Internal owner", "Florin (W007)"]]} /></>,
        actions: <>
          {s.variation === "Draft" && <Btn kind="primary" onClick={act.approveVariationInternally}>Approve internally</Btn>}
          {s.variation === "Internally approved" && <Btn kind="primary" onClick={act.recordCustomerAcceptance}>Record customer acceptance (simulated)</Btn>}
        </>,
        links: [{ kind: "job", id: "J104" }, { kind: "customer", id: "C03" }, { kind: "document", id: "D02" }, { kind: "task", id: "W007" }],
        open: ["Jobs", "detail", { job: "J104", sub: "costs" }, "Open J104 costs"],
      };
    }
    case "quote": {
      const q = pipeline(s).quotes.find((x) => x.id === id); if (!q) return null;
      return { title: q.id + " " + q.title, sub: q.customerName + " · " + q.area, badge: <StateBadge state={q.stage} />,
        body: <><KV rows={[["Net value", eur(q.value)], ["Stage", q.stage], ["Follow-up", fmtDate(q.followUp, "dow")], ["Owner", personName(q.owner)], ["Converted job", q.jobId || "Not converted"]]} /><Note>{q.visitNote}</Note>
          <Note>Unaccepted quotes are pipeline only. They are not in November accepted value or the profit forecast.</Note></>,
        links: [{ kind: "customer", id: q.customer } as Ref].concat(q.jobId ? [{ kind: "job", id: q.jobId }] : []), open: ["Jobs", "quotes", undefined, "Open quotes"] };
    }
    case "customer": {
      const c = customer(id); if (!c) return null;
      const js = jobs(s).filter((j) => j.customer === id), inv = invoices(s).filter((i) => i.customer === id), qs = pipeline(s).quotes.filter((q) => q.customer === id);
      return { title: c.name, sub: c.type + (c.prospect ? " prospect" : " customer") + " · " + c.area + " · fictional demo entity", badge: <Badge tone={customerBalance(s, id) ? "warn" : "neutral"}>Open balance {eur(customerBalance(s, id))}</Badge>,
        body: <><Note>{c.note}</Note><KV rows={[["Contact", c.contact], ["Jobs", js.map((j) => j.id).join(", ") || "None"], ["Quotes", qs.map((q) => q.id).join(", ") || "None"], ["Invoices", inv.map((i) => i.id).join(", ") || "None"]]} /></>,
        links: js.map((j) => ({ kind: "job", id: j.id }) as Ref).concat(qs.map((q) => ({ kind: "quote", id: q.id }) as Ref), inv.map((i) => ({ kind: "invoice", id: i.id }) as Ref), id === "C03" ? [{ kind: "variation", id: "V104-01" }] : []),
        open: ["Records", "customers", { customer: id }, "Open in Records"] };
    }
    case "supplier": {
      const x = supplier(id); if (!x) return null;
      const ps = pos(s).filter((p) => p.supplier === id), bs = BILLS.filter((b) => b.supplier === id);
      return { title: x.name, sub: x.category + " · fictional demo supplier",
        body: <KV rows={[["Open orders", ps.filter((p) => p.status !== "Delivered").map((p) => p.id + " (" + p.status + ")").join(", ") || "None"], ["Bills in cash window", bs.map((b) => b.id + " " + eur(b.amount)).join(", ") || "None"]]} />,
        links: ps.map((p) => ({ kind: "po", id: p.id }) as Ref).concat(bs.map((b) => ({ kind: "bill", id: b.id }) as Ref)), open: ["Materials", "suppliers", undefined, "Open suppliers"] };
    }
    case "person": {
      const p = person(id); if (!p) return null;
      const cr = credentials(s).list.filter((c) => c.person === id);
      return { title: p.name, sub: p.role + " · " + p.team + (p.source === "call" ? " · from the discovery call" : " · fictional demo profile"),
        body: <><KV rows={[["Responsibilities", p.duties], ["Day wage", p.wage ? eur(p.wage) + " per full day" : "Not modelled"], ["Truck assignment", p.truckEligible ? "Eligible (demo evidence recorded)" : p.paidCrew ? "Not eligible" : "Not applicable"], ["Display email", p.email + " (synthetic, never used to send)"]]} />
          {cr.map((c) => <div key={c.id} style={{ display: "flex", gap: 10, alignItems: "center" }}><StateBadge state={c.expired ? "Expired" : c.soon ? "Expires soon" : "Valid"} /><span style={{ fontSize: 13 }}>{c.type}, expires {fmtDate(c.expires, "long")}</span></div>)}</>,
        links: cr.map((c) => ({ kind: "credential", id: c.id }) as Ref), open: ["Planning", "shifts", undefined, "Open crew & shifts"] };
    }
    case "credential": {
      const c = credentials(s).list.find((x) => x.id === id); if (!c) return null;
      return { title: c.type + ", " + c.personName, sub: "Simulated record, not a compliance check", badge: <StateBadge state={c.expired ? "Expired" : c.soon ? "Expires soon" : "Valid"} />,
        body: <><KV rows={[["Expires", fmtDate(c.expires, "long")], ["Evidence", c.evidence], ["Renewal", c.renewal ? "Booked " + fmtDT(c.renewal) : "Not booked"]]} />
          {c.affected.length > 0 && <Note tone="warn">Assignments after expiry unless renewed: {c.affected.map((a) => a.job + " on " + fmtDate(a.date, "dow")).join(", ")}. Warning only; nothing before the expiry is blocked.</Note>}</>,
        actions: c.soon && !c.renewal ? <Btn kind="primary" onClick={() => act.bookRenewal(c.id)}>Record renewal booked</Btn> : undefined,
        links: [{ kind: "person", id: c.person }, { kind: "document", id: c.doc }], open: ["Planning", "certificates", undefined, "Open certificates"] };
    }
    case "asset": {
      const a = fleet(s).owned.find((x) => x.id === id) || fleet(s).hired.find((x) => x.id === id); if (!a) return null;
      const isT2 = id === "TRK-02";
      return { title: a.id + " " + a.label, sub: (a.owned ? "Owned" : "Hired") + " · " + a.kind + (a.driver ? " · primary driver " + personName(a.driver) : ""), badge: <StateBadge state={a.available ? "Available" : "Unavailable"} />,
        body: <><KV rows={[["Today", a.status], ["Tomorrow", assetOn(s, id, "2026-11-11").status], ["Note", a.note]].concat(isT2 ? [["Repair", s.repair], ["Quote", eur(DEFECT.quote) + " · " + supplier(DEFECT.supplier)?.name], ["Proposed return", fmtDT(DEFECT.proposedReturn) + " (unconfirmed)"]] : []) as [string, string][]} />
          {isT2 && <Note>Approval does not make TRK-02 roadworthy. Release needs a repair-complete record and a return-to-service check.</Note>}
          <Table dense keyOf={(c) => c.id} rows={CHECKS.filter((c) => c.asset === id)} cols={[{ k: "d", label: "Check", render: (c) => fmtDate(c.date, "dow") }, { k: "o", label: "Operator", render: (c) => personName(c.operator) }, { k: "r", label: "Result", render: (c) => <StateBadge state={c.result} /> }]} empty="No checks recorded." /></>,
        actions: isT2 ? <>
          {s.repair === "Awaiting approval" && <Btn kind="primary" onClick={act.approveRepair}>Approve €680 repair (Joe)</Btn>}
          {s.repair === "Approved" && <Btn kind="primary" onClick={act.recordRepairComplete}>Record repair complete</Btn>}
          {s.repair === "Repair complete" && <Btn kind="primary" onClick={act.recordReturnCheck}>Record return-to-service check</Btn>}
        </> : undefined,
        links: isT2 ? [{ kind: "document", id: "D04" }, { kind: "task", id: "W002" }, { kind: "hire", id: "HIR-01" }, { kind: "supplier", id: "S03" }] : [],
        open: ["Fleet", isT2 ? "maintenance" : "assets", undefined, "Open in Fleet"] };
    }
    case "hire": {
      return { title: HIRE.id + " " + HIRE.label, sub: supplier(HIRE.supplier)?.name + " · " + fmtDate(HIRE.date, "dow") + " only · " + eur(HIRE.cost), badge: <StateBadge state={s.hire} />,
        body: <><KV rows={[["Driver", personName(HIRE.driver)], ["Job", "J105 Dunlavin private driveway"], ["Cost treatment", "Business-level contingency in modelled overhead, not charged into J105"], ["Cash", s.hire === "Approved" ? "€260 in the 10 to 16 Nov outflows" : "Not in cash until approved"]]} />
          <Note>Solves transport only. It does not confirm the asphalt delivery or clear the broken truck.</Note></>,
        actions: s.hire === "Proposed" ? <Btn kind="primary" onClick={act.approveHire}>Approve €260 hire (Joe)</Btn> : undefined,
        links: [{ kind: "job", id: "J105" }, { kind: "document", id: "D05" }, { kind: "task", id: "W003" }, { kind: "asset", id: "TRK-02" }], open: ["Fleet", "overview", undefined, "Open Fleet"] };
    }
    case "po": {
      const p = poById(s, id); if (!p) return null;
      const r = readiness(s, p.job, p.window.slice(0, 10)).items.find((i) => i.label === "Transport");
      return { title: p.id + " " + p.qty + " t " + p.material.toLowerCase(), sub: supplier(p.supplier)?.name + " · " + p.job + " · " + fmtDT(p.window), badge: <><StateBadge state={p.status} />{r && <Badge tone={r.state === "Ready" ? "ok" : "warn"}>Transport: {r.state}</Badge>}</>,
        body: <><KV rows={[["Quantity", p.qty + " t × " + eur(p.unit) + "/t"], ["Value", eur(p.value) + (p.variance ? " (" + eur(p.variance, { sign: true }) + " variance)" : "")], ["Cost treatment", p.status === "Delivered" ? "Posted cost" : p.status === "Draft" ? "Draft, not authorised" : "Committed, in remaining forecast"], ["Owner", personName(p.owner)], ["Received", p.receivedQty != null ? p.receivedQty + " t" : "Not received"]]} />
          <Note>Supplier confirmation and transport are separate. Confirming does not mark the order delivered.</Note></>,
        actions: <>
          {p.status === "Awaiting confirmation" && <Btn kind="primary" onClick={() => act.confirmPo(p.id)}>Record supplier confirmation</Btn>}
          {p.status === "Draft" && <Btn onClick={() => act.issueDraftPo(p.id)}>Mark issued (simulated)</Btn>}
        </>,
        links: [{ kind: "job", id: p.job } as Ref, { kind: "supplier", id: p.supplier } as Ref].concat(p.ticket ? [{ kind: "document", id: p.ticket }] : [], p.id === "PO-204" ? [{ kind: "task", id: "W004" }] : []),
        open: ["Materials", "deliveries", undefined, "Open deliveries"] };
    }
    case "invoice": {
      const i = invoiceById(s, id); if (!i) return null;
      return { title: i.id + " · " + i.customerName, sub: "Job " + i.job + " · issued " + fmtDate(i.issued) + " · due " + fmtDate(i.due), badge: <StateBadge state={i.open === 0 ? "Paid" : i.overdue ? "Overdue " + i.daysOverdue + " days" : "Not yet due"} />,
        body: <><KV rows={[["Net service amount", eur(i.amount)], ["Settled", eur(i.settled)], ["Open", eur(i.open)], ["VAT treatment", i.vat], ["RCT", i.rct], ["Promise to pay", i.promise ? fmtDate(i.promise.date, "dow") + " (recorded " + fmtDT(i.promise.at) + ")" : "None"]]} />
          {i.payments.length > 0 && <Table dense keyOf={(p) => p.id} rows={i.payments} cols={[{ k: "d", label: "Payment", render: (p) => fmtDate(p.date, "dow") }, { k: "a", label: "Amount", align: "right", render: (p) => <span className="r-num">{eur(p.amount)}</span> }, { k: "n", label: "Note", render: (p) => p.note }]} />}
          <Note>Seed contractor case with a simulated, office-reviewed treatment. Not applied to new jobs.</Note></>,
        actions: i.open > 0 ? <Btn onClick={() => act.simulatePayment(i.id)}>Simulate payment received</Btn> : undefined,
        links: [{ kind: "job", id: i.job } as Ref, { kind: "customer", id: i.customer } as Ref, { kind: "document", id: i.evidence } as Ref].concat(i.id === "INV-099" ? [{ kind: "task", id: "W005" }] : []),
        open: ["Finance", "receivables", undefined, "Open receivables"] };
    }
    case "bill": {
      const b = BILLS.find((x) => x.id === id); if (!b) return null;
      return { title: b.id + " " + supplier(b.supplier)?.name, sub: "Mock bill ledger · due " + fmtDate(b.due, "dow"),
        body: <><KV rows={[["Amount", eur(b.amount)], ["Note", b.note]]} /><Note>Cash amount only. Not added to job forecasts, which already hold the related costs.</Note></>,
        links: [{ kind: "supplier", id: b.supplier }], open: ["Finance", "cash", undefined, "Open cash forecast"] };
    }
    case "task": {
      const t = tasks(s).find((x) => x.id === id); if (!t) return null;
      return { title: t.id + " " + t.title, sub: t.ownerName + " · " + t.area + " · due " + fmtDT(t.due), badge: <><StateBadge state={t.status} /><Badge tone={t.priority === "Critical" ? "bad" : t.priority === "High" ? "warn" : "neutral"}>{t.priority}</Badge></>,
        body: <Note>{t.approval ? "Decision task. It is completed by the matching action on the related record." : "Work task linked to the record below."}</Note>,
        links: [t.ref], open: ["Work", t.approval ? "approvals" : "mine", undefined, "Open in Work"] };
    }
    case "document": {
      const d = docById(id); if (!d) return null;
      return { title: d.title, sub: d.type + " · " + d.folder + " · added " + fmtDate(d.added, "long") + " · simulated document",
        body: <div className="r-note" style={{ display: "flex", flexDirection: "column", gap: 8 }}>{d.body.map((l, i) => <p key={i} style={{ margin: 0 }}>{l}</p>)}</div>,
        actions: <Btn onClick={() => downloadText(d.id + " " + d.title.replace(/[^\w ,.-]/g, "") + ".txt", d.title + "\n" + d.type + " · Reynolds Asphalt demo (simulated document)\n\n" + d.body.join("\n\n"))}>Download mock file</Btn>,
        links: d.refs, open: ["Records", "files", undefined, "Open in Files"] };
    }
    case "run": {
      const r = runs(s).find((x) => x.id === id); if (!r) return null;
      return { title: "Run " + r.id + " · " + (AGENTS.find((a) => a.id === r.agent)?.name || r.agent), sub: fmtDT(r.at) + " · " + r.trigger + " · simulated, fixture-driven", badge: <Badge tone="accent">{r.result}</Badge>,
        body: <><div><div className="r-eyebrow">Inputs</div><ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>{r.inputs.map((x) => <li key={x}>{x}</li>)}</ul></div>
          <div><div className="r-eyebrow">Outputs</div><ul style={{ margin: "6px 0 0", paddingLeft: 18, fontSize: 13, lineHeight: 1.7 }}>{r.outputs.map((x) => <li key={x}>{x}</li>)}</ul></div></>,
        links: r.refs, open: ["Agents", "runs", undefined, "Open runs"] };
    }
    case "leave": {
      const l = leave(s).find((x) => x.id === id); if (!l) return null;
      return { title: "Leave " + l.id + " · " + l.personName, sub: fmtDate(l.date, "long"), badge: <StateBadge state={l.status} />,
        body: <KV rows={[["Reason", l.reason], ["Impact", "Availability for " + fmtDate(l.date, "dow") + " only. The 9 to 13 Nov wage forecast is unchanged."]]} />,
        actions: l.status === "Pending" ? <><Btn kind="primary" onClick={() => act.decideLeave(l.id, "Approved")}>Approve</Btn><Btn onClick={() => act.decideLeave(l.id, "Declined")}>Decline</Btn></> : undefined,
        links: [{ kind: "person", id: l.person }], open: ["Planning", "leave", undefined, "Open leave"] };
    }
    case "review": {
      const t = s.tax[id]; if (!t) return null;
      return { title: "Tax review · " + id, sub: jobById(s, id)?.name, badge: <StateBadge state={t.status} />,
        body: <><KV rows={[["VAT treatment", t.vat || "Needs review"], ["RCT applicability", t.rct || "Needs review"], ["Reviewer", t.reviewer ? personName(t.reviewer) : "Joe (pending)"], ["Reviewed", t.at ? fmtDT(t.at) : "Not yet"]]} />{t.note && <Note>{t.note}</Note>}</>,
        links: [{ kind: "job", id }], open: ["Finance", "tax", undefined, "Open tax review"] };
    }
  }
  return null;
}
export { today, COST_LABEL };
