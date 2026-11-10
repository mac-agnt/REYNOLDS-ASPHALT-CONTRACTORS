/* Home chat: deterministic answers built from the shared selectors. No model API.
   Each answer has the shape the existing HomeThread renders, plus `nav` actions
   that open the record or page the answer is about. */
import type { DemoState } from "./store";
import {
  asphaltOn, cash, invoices, jobById, month, pendingApprovals, readiness, receivables, scenario, monthJobs, pipeline, fleet, personName, briefingText,
} from "./selectors";
import { HIRE, VARIATION } from "./fixtures";
import { eur, fmtDate, fmtDT, rel } from "./format";

export type Nav = { page: string; tab?: string; params?: Record<string, string>; record?: { kind: any; id: string } };
export type Answer = { tool: string; effect: "read" | "write"; text: string; cols?: string[]; rows?: string[][]; actions?: [string, boolean, Nav][] };

export const SUGGESTIONS: [string, string][] = [
  ["Tomorrow's risks", "What could stop tomorrow's jobs?"],
  ["Margin leaks", "Which job is losing margin?"],
  ["Hitting €5,000", "What do I need to hit €5,000 this month?"],
  ["Unpaid invoices", "Show the unpaid invoices."],
  ["Joe's approvals", "What is Joe waiting to approve?"],
];

export function answer(q: string, s: DemoState): Answer {
  const t = q.toLowerCase();
  if (/tomorrow|stop|block|risk|ready|readiness|truck|transport|asphalt|deliver/.test(t)) return tomorrow(s);
  if (/margin|losing|overrun|over budget|j104|naas/.test(t)) return margin(s);
  if (/target|5,?000|goal|hit|profit|month/.test(t)) return target(s);
  if (/unpaid|invoice|owe|overdue|receivable|debt|cash|paid/.test(t)) return unpaid(s);
  if (/joe|approv|decision|waiting|sign/.test(t)) return approvals(s);
  if (/brief|morning|summary|today/.test(t)) return { tool: "briefing_compile", effect: "read", text: briefingText(s), actions: [["Open the briefing", true, { page: "Agents", tab: "briefing" }]] };
  return {
    tool: "records_search", effect: "read",
    text: "I answer from the demo records only: jobs, crews, trucks, materials, invoices, cash and the November goal. Try one of the suggestions, or ask about a job by name.",
    actions: [["What could stop tomorrow's jobs?", false, { page: "Home" }], ["Open Jobs", false, { page: "Jobs", tab: "overview" }]],
  };
}

function tomorrow(s: DemoState): Answer {
  const date = "2026-11-11";
  const when = rel(date, s.clock);
  const r105 = readiness(s, "J105", date), r104 = readiness(s, "J104", date);
  const a = asphaltOn(s, date);
  const rows = [r104, r105].flatMap((r) => r.items.filter((i) => i.label !== "Crew").map((i) => [jobById(s, r.jobId)!.name, i.label, i.state, i.detail]));
  const blockers = r105.blockers.length;
  const text = blockers
    ? "For " + fmtDate(date, "dow") + " (" + when + "), Naas distribution yard is ready: TRK-01 with Cian and " + a.confirmed + " t of asphalt confirmed. Dunlavin driveway has " + blockers + " separate blocker" + (blockers > 1 ? "s" : "") + ": "
      + r105.blockers.map((b) => b.label.toLowerCase() + " (" + b.detail + ")").join("; ") + ". Fixing one does not clear the other."
    : "Both surfacing jobs for " + fmtDate(date, "dow") + " are ready. All " + a.required + " t of asphalt is confirmed and Mihai has transport.";
  return {
    tool: "readiness_check", effect: "read", text, cols: ["Job", "Check", "State", "Detail"], rows,
    actions: [["Open Dunlavin driveway", true, { page: "Jobs", tab: "detail", params: { job: "J105" } }], ["Open PO-204", false, { page: "Materials", tab: "deliveries", record: { kind: "po", id: "PO-204" } }], ["Planning: today", false, { page: "Planning", tab: "today" }]],
  };
}

function margin(s: DemoState): Answer {
  const js = monthJobs(s).filter((j) => j.status !== "Completed");
  const j = jobById(s, "J104")!;
  const lines = j.lines.filter((l) => l.variance !== 0);
  const text = "Naas distribution yard (J104) is the one losing margin. Agreed value " + eur(j.value) + ", original budget " + eur(j.budget) + ", forecast final cost " + eur(j.forecast)
    + ". That is " + eur(j.overrun) + " over, so profit drops from " + eur(j.originalProfit) + " to " + eur(j.profit) + " (" + j.margin.toFixed(2) + "%). "
    + lines.map((l) => (l.cat === "labour" ? "Labour" : "Materials") + " " + eur(l.variance, { sign: true })).join(", ") + ". "
    + (j.variationAccepted ? "Variation V104-01 is accepted and included." : "Variation V104-01 for " + eur(VARIATION.price) + " is " + s.variation.toLowerCase() + " and not counted as agreed value.");
  return {
    tool: "job_margin", effect: "read", text, cols: ["Job", "Value", "Forecast cost", "Profit"],
    rows: js.map((x) => [x.name, eur(x.value), eur(x.forecast), eur(x.profit) + " (" + x.margin.toFixed(1) + "%)"]),
    actions: [["Open J104 costs", true, { page: "Jobs", tab: "detail", params: { job: "J104", sub: "costs" } }], ["Job margins", false, { page: "Dashboard", tab: "margins" }]],
  };
}

function target(s: DemoState): Answer {
  const b = month(s), sc = scenario(s);
  const steps: string[] = [];
  if (!sc.varIn) steps.push("get customer acceptance for V104-01 (+" + eur(VARIATION.price) + ")");
  if (!sc.hireIn) steps.push("approve the one-day replacement transport (−" + eur(HIRE.cost) + ") so Dunlavin can be surfaced");
  const text = "November operating profit is forecast at " + eur(b.op) + " against your example " + eur(b.target) + " target, " + (b.gap > 0 ? eur(b.gap) + " short" : eur(-b.gap) + " ahead") + " (" + b.progress.toFixed(1) + "%). "
    + "That is " + eur(b.value) + " accepted value, less " + eur(b.cost) + " forecast direct cost and " + eur(b.overhead) + " modelled overhead. "
    + (steps.length ? "To close it: " + steps.join(" and ") + ". Together that gives " + eur(sc.bothOp) + "." : "Both scenario changes are already in the baseline.")
    + " This is a management forecast with illustrative allowances, not accounts.";
  return {
    tool: "goal_forecast", effect: "read", text, cols: ["Line", "Amount"],
    rows: [["Accepted November value", eur(b.value)], ["Forecast direct cost", eur(-b.cost)], ["Modelled overhead", eur(-b.overhead)], ["Operating profit (forecast)", eur(b.op)], ["Scenario: variation + hire", eur(sc.bothOp)]],
    actions: [["Open Goals", true, { page: "Finance", tab: "goals" }], ["Business dashboard", false, { page: "Dashboard", tab: "business" }]],
  };
}

function unpaid(s: DemoState): Answer {
  const r = receivables(s), c = cash(s);
  const text = r.open.length
    ? eur(r.openTotal) + " is outstanding across " + r.open.length + " invoices" + (r.overdueTotal ? ", " + eur(r.overdueTotal) + " of it overdue" : "") + ". "
      + r.overdue.map((i) => i.id + " for " + i.customerName + " is " + i.daysOverdue + " days overdue" + (i.promise ? ", promised for " + fmtDate(i.promise.date, "dow") : "")).join("; ")
      + (r.overdue.length ? ". " : "") + "Projected closing cash on 16 Nov is " + eur(c.closing) + (c.canDelay ? ", or " + eur(c.delayedClosing) + " if that receipt slips." : ".")
    : "Nothing is outstanding. Projected closing cash on 16 Nov is " + eur(c.closing) + ".";
  return {
    tool: "receivables_find", effect: "read", text, cols: ["Invoice", "Customer", "Open", "Status"],
    rows: invoices(s).filter((i) => i.open > 0).map((i) => [i.id, i.customerName, eur(i.open), i.overdue ? i.daysOverdue + " days overdue" : "due " + fmtDate(i.due)]),
    actions: [["Open INV-099", true, { page: "Finance", tab: "receivables", record: { kind: "invoice", id: "INV-099" } }], ["Cash forecast", false, { page: "Finance", tab: "cash" }]],
  };
}

function approvals(s: DemoState): Answer {
  const joe = pendingApprovals(s).filter((t) => t.owner === "P02");
  const text = joe.length
    ? "Joe has " + joe.length + " decision" + (joe.length > 1 ? "s" : "") + " waiting: " + joe.map((t) => t.title.toLowerCase() + " (due " + fmtDT(t.due) + ")").join("; ")
      + ". Approving the repair does not release TRK-02, and the hire does not confirm the asphalt."
    : "Nothing is waiting on Joe. " + (pendingApprovals(s).length ? pendingApprovals(s).length + " decision(s) sit with " + Array.from(new Set(pendingApprovals(s).map((t) => personName(t.owner)))).join(" and ") + "." : "");
  return {
    tool: "approvals_find", effect: "read", text, cols: ["Task", "Decision", "Owner", "Due"],
    rows: pendingApprovals(s).map((t) => [t.id, t.title, personName(t.owner), fmtDT(t.due)]),
    actions: [["Open approvals", true, { page: "Work", tab: "approvals" }], ["Fleet: TRK-02", false, { page: "Fleet", tab: "maintenance" }]],
  };
}

/** Status line for the Home pill. */
export function homePill(s: DemoState): string {
  const n = pendingApprovals(s).length;
  const r = readiness(s, "J105", "2026-11-11");
  return n + " DECISIONS WAITING" + (r.blockers.length ? " · J105 HAS " + r.blockers.length + " BLOCKER" + (r.blockers.length > 1 ? "S" : "") : " · TOMORROW READY");
}
export function homeSubline(s: DemoState): string {
  const b = month(s), f = fleet(s), live = monthJobs(s).filter((j) => j.status === "Live").length;
  return live + " live jobs, " + f.trucksAvailable + " of 2 trucks available, " + eur(b.op) + " forecast against your " + eur(b.target) + " example target.";
}
export const pipelineValue = (s: DemoState) => pipeline(s).value;
