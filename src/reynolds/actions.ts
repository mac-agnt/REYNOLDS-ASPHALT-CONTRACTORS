/* All supported state transitions. Each one checks its precondition, so a repeated
   click never creates a second hire, payment, variation, job or task. None of them
   reach anything outside the browser. */
import { commit, getState, resetDemo, toast, type DemoState, type ShiftState } from "./store";
import { HIRE, JOBS, QUOTES, VARIATION, type CostCat, type Job, type JobStatus, type Ref, type Run } from "./fixtures";
import {
  asphaltOn, cash, credentials, firstName, fleet, invoiceById, jobById, month, openTasks, pendingApprovals, poById,
  readiness, receivables, scenario, shifts, today, briefingText, pipeline,
} from "./selectors";
import { dayOf, eur, fmtDate, fmtDT } from "./format";

const S = () => getState();
const done = (s: DemoState, id: string) => ({ ...s.tasks, [id]: "Done" as const });

export const act = {
  reset() { resetDemo(); toast("Demo reset to the canonical baseline"); },
  setClock(clock: string) { commit({ clock }); toast("Demo clock set to " + fmtDT(clock)); },
  setTarget(target: number) {
    if (!Number.isFinite(target) || target <= 0) return;
    commit({ target: Math.round(target) }, { kind: "people", actor: "P01", title: "Monthly target set to " + eur(target), note: "Illustrative operating-profit target for November.", refs: [] });
  },
  setViewAs(viewAs: DemoState["viewAs"]) { commit({ viewAs }); },
  toggleAgent(id: string) { commit((s) => ({ agentsOn: { ...s.agentsOn, [id]: !s.agentsOn[id] } })); },
  setDraftOnly(v: boolean) { commit({ draftOnly: v }); },

  /* Fleet */
  approveRepair() {
    if (S().repair !== "Awaiting approval") return;
    commit((s) => ({ repair: "Approved", tasks: done(s, "W002"), repairLog: s.repairLog.concat([{ step: "Repair approved (€680)", at: s.clock, by: "P02" }]) }),
      { kind: "people", actor: "P02", title: "TRK-02 repair approved, €680", note: "Approval only. TRK-02 stays unavailable until repair completion and a return-to-service check.", refs: [{ kind: "asset", id: "TRK-02" }, { kind: "task", id: "W002" }] });
    toast("Repair approved. TRK-02 is still unavailable.");
  },
  recordRepairComplete() {
    if (S().repair !== "Approved") return;
    commit((s) => ({ repair: "Repair complete", repairLog: s.repairLog.concat([{ step: "Repair complete recorded", at: s.clock, by: "P01" }]) }),
      { kind: "people", actor: "P01", title: "TRK-02 repair recorded complete", note: "Return-to-service check still required before release.", refs: [{ kind: "asset", id: "TRK-02" }] });
  },
  recordReturnCheck() {
    if (S().repair !== "Repair complete") return;
    commit((s) => ({ repair: "Returned to service", repairLog: s.repairLog.concat([{ step: "Return-to-service check passed", at: s.clock, by: "P05" }]) }),
      { kind: "people", actor: "P05", title: "TRK-02 returned to service", note: "Check passed. TRK-02 available for assignment.", refs: [{ kind: "asset", id: "TRK-02" }] });
    toast("TRK-02 released after its return check");
  },
  approveHire() {
    if (S().hire !== "Proposed") return;
    commit((s) => ({ hire: "Approved", tasks: done(s, "W003") }),
      { kind: "people", actor: "P02", title: "HIR-01 replacement transport approved, €260", note: "One-day tipper for Mihai on 11 Nov, J105. Added to modelled overhead and planned cash. Asphalt confirmation is a separate blocker.", refs: [{ kind: "hire", id: "HIR-01" }, { kind: "job", id: "J105" }, { kind: "task", id: "W003" }] });
    toast("HIR-01 created for 11 Nov. PO-204 is still a separate blocker.");
  },

  /* Materials */
  confirmPo(id: string) {
    const p = poById(S(), id);
    if (!p || p.status !== "Awaiting confirmation") return;
    commit((s) => ({ pos: { ...s.pos, [id]: { ...s.pos[id], status: "Confirmed", confirmedAt: s.clock } }, tasks: id === "PO-204" ? done(s, "W004") : s.tasks }),
      { kind: "people", actor: "P03", title: id + " supplier confirmation recorded", note: p.qty + " t " + p.material.toLowerCase() + " confirmed for " + fmtDT(p.window) + ". Not delivered yet.", refs: [{ kind: "po", id }, { kind: "job", id: p.job }] });
    toast(id + " confirmed. Delivery is still to come.");
  },
  issueDraftPo(id: string) {
    const p = poById(S(), id);
    if (!p || p.status !== "Draft") return;
    commit((s) => ({ pos: { ...s.pos, [id]: { ...s.pos[id], status: "Awaiting confirmation" } } }),
      { kind: "people", actor: "P03", title: id + " marked as issued (simulated)", note: "Nothing sent to the supplier. Awaiting confirmation.", refs: [{ kind: "po", id }] });
  },
  reviseWindow(id: string, window: string) {
    const p = poById(S(), id);
    if (!p || p.status === "Delivered" || !window) return;
    commit((s) => ({ pos: { ...s.pos, [id]: { ...s.pos[id], window } } }),
      { kind: "people", actor: "P03", title: id + " arrival revised to " + fmtDT(window), note: "Revised by the office from the supplier's update.", refs: [{ kind: "po", id }] });
  },
  receivePo(id: string, qty: number) {
    const p = poById(S(), id);
    if (!p || p.status !== "Confirmed" || !(qty > 0)) return;
    const variance = qty - p.qty;
    commit((s) => ({ pos: { ...s.pos, [id]: { ...s.pos[id], status: "Delivered", receivedQty: qty, receivedAt: s.clock } } }),
      { kind: "people", actor: "P03", title: id + " received, " + qty + " t", note: variance ? "Variance " + (variance > 0 ? "+" : "") + variance + " t against " + p.qty + " t ordered. Cost moves from commitment to posted at the received quantity." : "Cost moved from commitment to posted. No change to forecast final cost.", refs: [{ kind: "po", id }, { kind: "job", id: p.job }] });
  },

  /* Receivables */
  reviewReminder(inv: string) {
    if (S().reminderReviewed[inv]) return;
    commit((s) => ({ reminderReviewed: { ...s.reminderReviewed, [inv]: s.clock }, tasks: { ...s.tasks, W005: s.tasks.W005 === "Done" ? "Done" : "In progress" } }),
      { kind: "people", actor: "P03", title: inv + " reminder reviewed", note: "Draft reviewed by Aoife. Not sent: no email provider is connected.", refs: [{ kind: "invoice", id: inv }] });
  },
  recordPromise(inv: string, date: string) {
    const i = invoiceById(S(), inv);
    if (!i || i.open <= 0 || !date) return;
    commit((s) => ({ promises: { ...s.promises, [inv]: { date, at: s.clock } }, tasks: inv === "INV-099" ? done(s, "W005") : s.tasks }),
      { kind: "people", actor: "P03", title: i.customerName + " promised " + eur(i.open) + " for " + fmtDate(date, "dow"), note: "Expected timing updated. The invoice stays unpaid until a receipt is recorded.", refs: [{ kind: "invoice", id: inv }, { kind: "customer", id: i.customer }] });
    toast("Promise recorded. " + inv + " is still unpaid.");
  },
  simulatePayment(inv: string) {
    const i = invoiceById(S(), inv);
    if (!i || i.open <= 0) return;
    commit((s) => ({ payments: s.payments.concat([{ id: "PAY-S" + (s.seq + 1), invoice: inv, amount: i.open, date: dayOf(s.clock), note: "Simulated receipt" }]),
      tasks: inv === "INV-099" ? done(s, "W005") : s.tasks, cashDelay: inv === "INV-099" ? false : s.cashDelay }),
      { kind: "people", actor: "P03", title: "Receipt recorded: " + inv + ", " + eur(i.open), note: "Simulated payment. Balance cleared and moved from expected receipts into actual cash.", refs: [{ kind: "invoice", id: inv }, { kind: "customer", id: i.customer }] });
  },
  setCashDelay(v: boolean) { commit({ cashDelay: v }); },
  setScenario(key: "variation" | "hire", v: boolean) { commit((s) => ({ scenario: { ...s.scenario, [key]: v } })); },

  /* Variation */
  approveVariationInternally() {
    if (S().variation !== "Draft") return;
    commit((s) => ({ variation: "Internally approved", tasks: done(s, "W007") }),
      { kind: "people", actor: "P01", title: "V104-01 approved internally, ready to put to the customer", note: "Prepared only. Agreed value stays €24,000 until the customer accepts.", refs: [{ kind: "variation", id: "V104-01" }, { kind: "job", id: "J104" }] });
    toast("Variation prepared. Agreed value unchanged until the customer accepts.");
  },
  recordCustomerAcceptance() {
    if (S().variation !== "Internally approved") return;
    commit((s) => ({ variation: "Customer accepted", scenario: { ...s.scenario, variation: false } }),
      { kind: "people", actor: "P01", title: "Naas Logistics Park accepted V104-01, +" + eur(VARIATION.price), note: "Simulated acceptance. J104 agreed value now " + eur(24000 + VARIATION.price) + "; baseline recalculated.", refs: [{ kind: "variation", id: "V104-01" }, { kind: "customer", id: "C03" }] });
  },

  /* Tax review */
  completeTaxReview(job: string, vat: string, rct: string) {
    const t = S().tax[job];
    if (!t || t.status === "Reviewed" || !vat || !rct) return;
    commit((s) => ({ tax: { ...s.tax, [job]: { ...t, status: "Reviewed", vat, rct, reviewer: "P02", at: s.clock, note: "Reviewed by Joe in the demo. Human decision recorded; nothing filed with Revenue." } }, tasks: job === "J105" ? done(s, "W006") : s.tasks }),
      { kind: "people", actor: "P02", title: job + " tax treatment reviewed", note: "VAT: " + vat + ". RCT: " + rct + ". Human review recorded in the demo; no Revenue connection.", refs: [{ kind: "job", id: job }, { kind: "review", id: job }] });
  },
  previewInvoice(job: string) {
    if (S().tax[job]?.status !== "Reviewed" || S().invoicePreview[job]) return;
    commit((s) => ({ invoicePreview: { ...s.invoicePreview, [job]: true } }),
      { kind: "people", actor: "P03", title: "Draft invoice preview prepared for " + job, note: "Local preview only. Final invoice is issued in the existing accounting system.", refs: [{ kind: "job", id: job }] });
  },

  /* Crew */
  setShift(pid: string, date: string, state: ShiftState) {
    const key = pid + "|" + date;
    const cur = S().shifts[key];
    if (!cur || cur.state === state) return;
    commit((s) => ({ shifts: { ...s.shifts, [key]: { ...cur, state } } }),
      { kind: "people", actor: "P01", title: firstName(pid) + ", " + fmtDate(date, "dow") + ": " + state, note: "Explicit day-fraction choice. Pay follows the choice, never the clock-out time.", refs: [{ kind: "person", id: pid }] });
  },
  approveShift(pid: string, date: string) {
    const key = pid + "|" + date;
    const cur = S().shifts[key];
    if (!cur || cur.approved || date > today(S())) return;
    commit((s) => ({ shifts: { ...s.shifts, [key]: { ...cur, approved: true } } }),
      { kind: "people", actor: "P01", title: firstName(pid) + "'s " + fmtDate(date, "dow") + " attendance approved", note: cur.state, refs: [{ kind: "person", id: pid }] });
  },
  approveDay(date: string) {
    const s0 = S();
    if (date > today(s0)) return;
    const keys = Object.keys(s0.shifts).filter((k) => k.endsWith("|" + date) && !s0.shifts[k].approved);
    if (!keys.length) return;
    commit((s) => { const sh = { ...s.shifts }; keys.forEach((k) => (sh[k] = { ...sh[k], approved: true })); return { shifts: sh }; },
      { kind: "people", actor: "P01", title: fmtDate(date, "dow") + " attendance approved", note: keys.length + " shifts", refs: [] });
  },
  decideLeave(id: string, status: "Approved" | "Declined") {
    if (S().leave[id] !== "Pending") return;
    commit((s) => ({ leave: { ...s.leave, [id]: status } }), { kind: "people", actor: "P01", title: "Leave " + id + " " + status.toLowerCase(), note: "Availability updated for that date only.", refs: [{ kind: "leave", id }] });
  },
  bookRenewal(credId: string) {
    if (S().renewals[credId]) return;
    commit((s) => ({ renewals: { ...s.renewals, [credId]: s.clock }, tasks: credId === "CR-SP-P08" ? done(s, "W008") : s.tasks }),
      { kind: "people", actor: "P03", title: "Renewal booked for " + credId, note: "Recorded as booked. The record stays on its current expiry until renewal evidence is added.", refs: [{ kind: "credential", id: credId }] });
  },
  setPlan(date: string, crew: "A" | "B", field: "job" | "truck" | "driver" | "plant", value: string) {
    commit((s) => ({ plan: { ...s.plan, [date]: { ...s.plan[date], [crew]: { ...s.plan[date][crew], [field]: value } } } }),
      { kind: "people", actor: "P01", title: "Crew " + crew + ", " + fmtDate(date, "dow") + ": " + field + " set to " + (value || "none"), note: "Planning change.", refs: [] });
  },

  /* Jobs and quotes */
  moveJob(id: string, status: JobStatus) {
    const j = jobById(S(), id);
    if (!j || j.status === status) return;
    commit((s) => ({ jobStatus: { ...s.jobStatus, [id]: status } }),
      { kind: "people", actor: "P01", title: id + " moved to " + status, note: j.name, refs: [{ kind: "job", id }] });
  },
  editQuote(id: string, title: string, value: number) {
    const q = S().quotes[id];
    if (!q || q.stage !== "Draft" || !title || !(value > 0)) return;
    commit((s) => ({ quotes: { ...s.quotes, [id]: { ...q, title, value: Math.round(value) } } }),
      { kind: "people", actor: "P01", title: id + " draft updated", note: title + ", " + eur(value), refs: [{ kind: "quote", id }] });
  },
  setFollowUp(id: string, date: string) {
    const q = S().quotes[id];
    if (!q || !date || q.stage === "Accepted") return;
    commit((s) => ({ quotes: { ...s.quotes, [id]: { ...q, followUp: date } } }),
      { kind: "people", actor: "P01", title: id + " follow-up set for " + fmtDate(date, "dow"), note: "", refs: [{ kind: "quote", id }] });
  },
  markQuoteSent(id: string) {
    const q = S().quotes[id];
    if (!q || q.stage !== "Draft") return;
    commit((s) => ({ quotes: { ...s.quotes, [id]: { ...q, stage: "Sent" } } }),
      { kind: "people", actor: "P01", title: id + " marked as sent", note: "Recorded only. Nothing emailed.", refs: [{ kind: "quote", id }] });
  },
  acceptQuote(id: string, monthKey: string) {
    const q = S().quotes[id];
    const base = QUOTES.find((x) => x.id === id);
    if (!q || !base || q.stage === "Accepted" || q.jobId) return;
    const all = JOBS.concat(S().extraJobs);
    const num = Math.max(...all.map((j) => Number(j.id.slice(1)))) + 1;
    const jid = "J" + num;
    const cost = Math.round(q.value * 0.76);
    const split: [CostCat, number][] = [["labour", 0.25], ["plant", 0.12], ["fuel", 0.04], ["transport", 0.06]];
    const costs = {} as Job["costs"];
    let rest = cost;
    split.forEach(([c, f]) => { const v = Math.round(cost * f); rest -= v; costs[c] = { budget: v, nonPoForecast: v, nonPoPosted: 0 }; });
    costs.materials = { budget: rest, nonPoForecast: rest, nonPoPosted: 0 };
    const start = monthKey === "2026-11" ? "2026-11-24" : "2026-12-02";
    const job: Job = { id: jid, name: q.title, customer: base.customer, status: "Scheduled", value: q.value, area: base.area, start, end: start, month: monthKey, owner: "P01",
      siteType: base.customer === "C08" ? "private" : base.customer === "C09" ? "contractor" : "commercial", scope: q.title + ". Converted from " + id + ". Cost estimate is a planning allowance (76% of price) until costed.",
      nextAction: "Cost the job and plan crew", nextOwner: "P01", phases: [{ label: "Works", from: start, to: start, note: "Dates to confirm" }], costs };
    commit((s) => ({ extraJobs: s.extraJobs.concat([job]), quotes: { ...s.quotes, [id]: { ...q, stage: "Accepted", jobId: jid, month: monthKey } } }),
      { kind: "people", actor: "P01", title: id + " accepted (simulated): job " + jid + " created", note: "Delivery month " + (monthKey === "2026-11" ? "November" : "December") + ". " + eur(q.value) + " added to that month's accepted value.", refs: [{ kind: "quote", id }, { kind: "job", id: jid }] });
    toast(jid + " created from " + id);
  },
  addSiteNote(job: string, text: string, attachment?: string) {
    if (!text.trim()) return;
    commit((s) => ({ siteNotes: s.siteNotes.concat([{ id: "SN" + (s.seq + 1), job, text: text.trim(), at: s.clock, by: "P01", attachment: attachment || undefined }]) }),
      { kind: "people", actor: "P01", title: "Site note added to " + job, note: text.trim() + (attachment ? " (attachment record: " + attachment + ")" : ""), refs: [{ kind: "job", id: job }] });
  },

  /* Agents: deterministic, fixture-driven. Re-running with nothing changed adds no run and never a task. */
  runAgent(agent: string) {
    const s = S();
    if (!s.agentsOn[agent]) { toast("That agent is switched off in AI controls"); return; }
    const out = agentOutputs(s, agent);
    const last = [...s.runs].reverse().find((r) => r.agent === agent);
    if (last && last.at === s.clock && JSON.stringify(last.outputs) === JSON.stringify(out.outputs)) { toast("No change since the last run"); return; }
    const id = "R" + String(8 + s.runs.length).padStart(2, "0");
    const run: Run = { id, agent, at: s.clock, trigger: "Manual run", refs: out.refs, result: out.result, inputs: out.inputs, outputs: out.outputs };
    commit((st) => ({ runs: st.runs.concat([run]) }), { kind: "agents", actor: agent, title: out.title, note: out.outputs[0], refs: ([{ kind: "run", id }] as Ref[]).concat(out.refs) });
    toast("Run " + id + " recorded. No tasks duplicated.");
  },
};

export function agentOutputs(s: DemoState, agent: string): { result: string; title: string; inputs: string[]; outputs: string[]; refs: Run["refs"] } {
  const j104 = jobById(s, "J104")!, b = month(s), r105 = readiness(s, "J105", "2026-11-11"), a = asphaltOn(s, "2026-11-11");
  const inv = invoiceById(s, "INV-099")!, c = cash(s), sh = shifts(s), cr = credentials(s), f = fleet(s);
  switch (agent) {
    case "margin": return { result: j104.overrun > 0 ? "Issue detected" : "No issue", title: "J104 margin recalculated", inputs: ["J104 cost lines (5)", "Budget " + eur(j104.budget), "Agreed value " + eur(j104.value)],
      outputs: ["Forecast final cost " + eur(j104.forecast) + ", " + (j104.overrun > 0 ? eur(j104.overrun) + " over budget" : "on budget"), "Gross profit " + eur(j104.profit) + " (" + j104.margin.toFixed(2) + "%)",
        s.variation === "Customer accepted" ? "V104-01 accepted and included" : "V104-01 " + eur(VARIATION.price) + " not counted: " + s.variation.toLowerCase()], refs: [{ kind: "job", id: "J104" }] };
    case "materials": return { result: a.unconfirmed ? "Issue detected" : "All confirmed", title: "Material confirmations checked", inputs: ["Requirements for 11 Nov", "6 purchase orders"],
      outputs: ["Asphalt 11 Nov: " + a.required + " t required, " + a.confirmed + " t confirmed, " + a.unconfirmed + " t unconfirmed", a.unconfirmed ? "PO-204 still awaiting supplier confirmation (W004, Aoife)" : "PO-204 confirmed; delivery still to record"], refs: [{ kind: "po", id: "PO-204" }] };
    case "dispatch": {
      const t = r105.items.find((i) => i.label === "Transport");
      return { result: t?.state === "Ready" ? "Feasible plan" : "Proposal waiting", title: "Crew and truck plan checked", inputs: ["Crew plan 9 to 13 Nov", f.trucksAvailable + " of 2 owned trucks available", "2 truck-eligible crew"],
        outputs: ["J105 transport 11 Nov: " + (t ? t.state + ", " + t.detail : "not needed"), s.hire === "Proposed" ? "€260 hire still waiting on Joe (W003)" : "No new proposal"], refs: [{ kind: "job", id: "J105" }, { kind: "asset", id: "TRK-02" }] };
    }
    case "finance": return { result: inv.open ? "Draft ready" : "Nothing overdue", title: "Receivables and cash checked", inputs: ["4 invoices", "Cash window 10 to 16 Nov"],
      outputs: [inv.open ? "INV-099 " + eur(inv.open) + ", " + inv.daysOverdue + " days overdue" + (inv.promise ? ", promised " + fmtDate(inv.promise.date) : "") : "INV-099 paid", "Projected closing cash " + eur(c.closing) + (c.canDelay ? ", or " + eur(c.delayedClosing) + " if the receipt slips" : ""), "Open receivables " + eur(receivables(s).openTotal)], refs: [{ kind: "invoice", id: "INV-099" }] };
    case "crew": return { result: "Summary ready", title: "Shift summary compiled", inputs: ["Shift plan 9 to 13 Nov", "9 credentials", "2 leave requests"],
      outputs: [sh.plannedShifts + " planned shifts, " + eur(sh.expectedWages) + " expected gross day wages", "Approved so far: " + sh.approvedShifts + " shifts, " + eur(sh.approvedWages), cr.soon ? cr.soon + " credential expiring within 30 days (Tomas, 18 Nov)" : "No credential expiring within 30 days"], refs: [{ kind: "person", id: "P08" }] };
    case "ops": return { result: r105.blockers.length ? "Issue detected" : "Ready", title: "Readiness and decisions checked", inputs: ["Tasks", "Crew and assets", "Supplier confirmations"],
      outputs: ["J105 surfacing 11 Nov: " + (r105.blockers.length ? r105.blockers.length + " blocker" + (r105.blockers.length > 1 ? "s" : "") + " (" + r105.blockers.map((x) => x.label.split(" ")[0].toLowerCase()).join(" and ") + ")" : "ready"), pendingApprovals(s).length + " decisions waiting, " + openTasks(s).length + " open tasks"], refs: [{ kind: "job", id: "J105" }] };
    default: return { result: "Briefing compiled", title: "Briefing recompiled", inputs: ["Jobs, readiness, costs, invoices, tasks, target"], outputs: [briefingText(s).slice(0, 140) + "…", "Forecast operating profit " + eur(b.op) + ", scenario " + eur(scenario(s).bothOp)], refs: [{ kind: "job", id: "J104" }] };
  }
}

/* Small helpers pages use for counts in tabs and badges. */
export const counts = (s: DemoState) => ({
  approvals: pendingApprovals(s).length, open: openTasks(s).length, quotes: pipeline(s).open.length,
  recvOpen: receivables(s).open.length, hire: HIRE.id,
});
