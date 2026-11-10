/* Every number the demo shows is derived here from fixtures + store state.
   Pages never hard-code totals. Selectors are memoised per state object. */
import {
  ASSETS, BILLS, CASH, COST_CATS, CREDENTIALS, CUSTOMERS, DEFECT, DOCUMENTS, HIRE, INVOICES, JOBS, LEAVE, OVERHEADS,
  PAYMENTS, PEOPLE, PLT02_SERVICE, POS, QUOTES, SEED_ACTIVITY, SEED_RUNS, SUPPLIERS, TASKS, VARIATION, WEEK,
  type CostCat, type Job, type JobStatus, type Po, type Ref, type Activity, type Run,
} from "./fixtures";
import type { DemoState, ShiftState } from "./store";
import { addDays, dayOf, daysBetween, eur, fmtTime, greeting, ms, rel } from "./format";

const memo = new WeakMap<object, Map<string, unknown>>();
function m<T>(s: DemoState, key: string, fn: () => T): T {
  let bag = memo.get(s);
  if (!bag) { bag = new Map(); memo.set(s, bag); }
  if (!bag.has(key)) bag.set(key, fn());
  return bag.get(key) as T;
}

export const today = (s: DemoState) => dayOf(s.clock);
export const person = (id: string) => PEOPLE.find((p) => p.id === id);
export const personName = (id: string) => person(id)?.name || id;
export const firstName = (id: string) => person(id)?.first || id;
export const customer = (id: string) => CUSTOMERS.find((c) => c.id === id);
export const supplier = (id: string) => SUPPLIERS.find((x) => x.id === id);
export const docById = (id: string) => DOCUMENTS.find((d) => d.id === id);

/* ── Purchase orders ───────────────────────────────────────────────────── */
export type PoView = Po & { status: Po["status"]; window: string; value: number; orderedValue: number; receivedQty?: number; variance: number; posted: boolean };
export function pos(s: DemoState): PoView[] {
  return m(s, "pos", () => POS.map((p) => {
    const st = s.pos[p.id];
    const recQty = st.receivedQty;
    const value = st.status === "Delivered" && recQty != null ? recQty * p.unit : p.qty * p.unit;
    return { ...p, status: st.status, window: st.window, receivedQty: recQty, value, orderedValue: p.qty * p.unit, variance: value - p.qty * p.unit, posted: st.status === "Delivered" };
  }));
}
export const poById = (s: DemoState, id: string) => pos(s).find((p) => p.id === id);

/* ── Jobs and cost lines ──────────────────────────────────────────────── */
export type CostLine = { cat: CostCat; budget: number; posted: number; remaining: number; forecast: number; variance: number; poCommitted: number; poPosted: number };
export type JobView = Job & {
  status: JobStatus; baseValue: number; value: number; variationAccepted: boolean; lines: CostLine[];
  budget: number; posted: number; remaining: number; forecast: number; overrun: number;
  profit: number; margin: number; originalProfit: number; originalMargin: number; customerName: string;
};
export function jobs(s: DemoState): JobView[] {
  return m(s, "jobs", () => {
    const pv = pos(s);
    return JOBS.concat(s.extraJobs).map((j) => {
      const lines: CostLine[] = COST_CATS.map((cat) => {
        const c = j.costs[cat];
        const jp = cat === "materials" ? pv.filter((p) => p.job === j.id) : [];
        const poPosted = jp.filter((p) => p.posted).reduce((a, p) => a + p.value, 0);
        const poCommitted = jp.filter((p) => !p.posted).reduce((a, p) => a + p.value, 0);
        const forecast = c.nonPoForecast + poPosted + poCommitted;
        const posted = c.nonPoPosted + poPosted;
        return { cat, budget: c.budget, posted, remaining: forecast - posted, forecast, variance: forecast - c.budget, poCommitted, poPosted };
      });
      const sum = (k: keyof CostLine) => lines.reduce((a, l) => a + (l[k] as number), 0);
      const variationAccepted = j.id === VARIATION.job && s.variation === "Customer accepted";
      const value = j.value + (variationAccepted ? VARIATION.price : 0);
      const forecast = sum("forecast"), budget = sum("budget");
      return {
        ...j, status: s.jobStatus[j.id] || j.status, baseValue: j.value, value, variationAccepted, lines,
        budget, posted: sum("posted"), remaining: sum("remaining"), forecast, overrun: forecast - budget,
        profit: value - forecast, margin: value ? ((value - forecast) / value) * 100 : 0,
        originalProfit: j.value - budget, originalMargin: j.value ? ((j.value - budget) / j.value) * 100 : 0,
        customerName: customer(j.customer)?.name || j.customer,
      };
    });
  });
}
export const jobById = (s: DemoState, id: string) => jobs(s).find((j) => j.id === id);
export const monthJobs = (s: DemoState, month = "2026-11") => jobs(s).filter((j) => j.month === month);

export function month(s: DemoState) {
  return m(s, "month", () => {
    const js = monthJobs(s);
    const by = (st: JobStatus) => js.filter((j) => j.status === st);
    const agg = (list: JobView[]) => ({
      count: list.length, value: list.reduce((a, j) => a + j.value, 0), cost: list.reduce((a, j) => a + j.forecast, 0),
      get profit() { return this.value - this.cost; },
    });
    const all = agg(js);
    const overheadLines = OVERHEADS.map((o) => ({ ...o })) as { id: string; label: string; amount: number; note?: string }[];
    if (s.hire === "Approved") overheadLines.push({ id: "OH-H", label: "Replacement transport HIR-01 (business-level contingency)", amount: HIRE.cost, note: "Approved hire. Not charged into J105." });
    const overhead = overheadLines.reduce((a, o) => a + o.amount, 0);
    const op = all.profit - overhead;
    return {
      jobs: js, completed: agg(by("Completed")), live: agg(by("Live")), scheduled: agg(by("Scheduled")),
      value: all.value, cost: all.cost, gp: all.profit, margin: all.value ? (all.profit / all.value) * 100 : 0,
      awaitingCompletion: js.filter((j) => j.status !== "Completed").reduce((a, j) => a + j.value, 0),
      overheadLines, overhead, op, target: s.target, gap: s.target - op, progress: s.target ? (op / s.target) * 100 : 0,
    };
  });
}

/** Goal scenarios stay separate from the baseline; a toggle whose change is already
    committed (variation accepted, hire approved) is shown as already in the baseline. */
export function scenario(s: DemoState) {
  return m(s, "scenario", () => {
    const b = month(s);
    const varIn = s.variation === "Customer accepted", hireIn = s.hire === "Approved";
    const addVar = s.scenario.variation && !varIn ? VARIATION.price : 0;
    const addHire = s.scenario.hire && !hireIn ? HIRE.cost : 0;
    const revenue = b.value + addVar, overhead = b.overhead + addHire;
    const op = revenue - b.cost - overhead;
    const both = b.value + (varIn ? 0 : VARIATION.price) - b.cost - (b.overhead + (hireIn ? 0 : HIRE.cost));
    return { revenue, overhead, cost: b.cost, op, progress: (op / s.target) * 100, delta: op - b.op, varIn, hireIn, addVar, addHire,
      active: (s.scenario.variation && !varIn) || (s.scenario.hire && !hireIn), bothOp: both };
  });
}

export function pipeline(s: DemoState) {
  return m(s, "pipeline", () => {
    const qs = QUOTES.map((q) => ({ ...q, ...s.quotes[q.id], customerName: customer(q.customer)?.name || q.customer }));
    const open = qs.filter((q) => q.stage !== "Accepted");
    return { quotes: qs, open, value: open.reduce((a, q) => a + q.value, 0) };
  });
}

/* ── Fleet ─────────────────────────────────────────────────────────────── */
export type AssetView = { id: string; kind: "Truck" | "Plant"; label: string; owned: boolean; driver?: string; available: boolean; status: string; note: string; hired?: boolean };
export function assetOn(s: DemoState, id: string, date: string): { available: boolean; status: string } {
  if (id === "TRK-02") {
    if (s.repair === "Returned to service") return { available: true, status: "Available, returned to service" };
    if (date < "2026-11-10") return { available: true, status: "In use until the brake fault, 9 Nov 16:40" };
    return { available: false, status: s.repair === "Awaiting approval" ? "Unavailable, repair awaiting approval" : s.repair === "Approved" ? "Unavailable, repair approved, not yet done" : "Unavailable, repair done, return check pending" };
  }
  if (id === PLT02_SERVICE.asset && date === PLT02_SERVICE.date) return { available: false, status: "Planned service" };
  if (id === HIRE.id) return s.hire === "Approved" && date === HIRE.date ? { available: true, status: "Hired for 11 Nov" } : { available: false, status: s.hire === "Approved" ? "Hire covers 11 Nov only" : "Not hired" };
  return { available: true, status: "Available" };
}
export function fleet(s: DemoState) {
  return m(s, "fleet", () => {
    const d = today(s);
    const owned: AssetView[] = ASSETS.map((a) => ({ ...a, ...assetOn(s, a.id, d) }));
    const hired: AssetView[] = s.hire === "Approved" ? [{ id: HIRE.id, kind: "Truck", label: HIRE.label + " (" + supplier(HIRE.supplier)?.name + ")", owned: false, hired: true, driver: HIRE.driver, note: "Linked to Mihai and J105, 11 Nov only.", ...assetOn(s, HIRE.id, d) }] : [];
    const trucks = owned.filter((a) => a.kind === "Truck"), plant = owned.filter((a) => a.kind === "Plant");
    return { owned, hired, trucks, plant, ownedAvailable: owned.filter((a) => a.available).length, trucksAvailable: trucks.filter((a) => a.available).length, plantAvailable: plant.filter((a) => a.available).length };
  });
}

/* ── Readiness, per job phase and date (never an undated global flag) ─── */
export type ReadyState = "Ready" | "Blocked" | "Needs confirmation";
export type ReadyItem = { label: string; state: ReadyState; detail: string; ref?: Ref };
export function readiness(s: DemoState, jobId: string, date: string) {
  const key = "ready:" + jobId + date;
  return m(s, key, () => {
    const items: ReadyItem[] = [];
    const plan = s.plan[date];
    const crew = plan ? (plan.A.job === jobId ? "A" : plan.B.job === jobId ? "B" : null) : null;
    const cd = crew && plan ? plan[crew as "A" | "B"] : null;
    const jobPos = pos(s).filter((p) => p.job === jobId && dayOf(p.window) === date && p.status !== "Draft");
    const drafts = pos(s).filter((p) => p.job === jobId && dayOf(p.window) === date && p.status === "Draft");
    const needsTruck = jobPos.some((p) => p.material === "Asphalt");
    if (cd) items.push({ label: "Crew", state: "Ready", detail: "Crew " + crew + " planned" });
    if (needsTruck) {
      if (cd && cd.truck) {
        const a = assetOn(s, cd.truck, date);
        const drv = person(cd.driver);
        if (!a.available) items.push({ label: "Transport", state: "Blocked", detail: cd.truck + ": " + a.status, ref: { kind: "asset", id: cd.truck } });
        else if (!drv || !drv.truckEligible) items.push({ label: "Transport", state: "Blocked", detail: "No truck-eligible driver on " + cd.truck });
        else items.push({ label: "Transport", state: "Ready", detail: cd.truck + " with " + drv.first, ref: { kind: "asset", id: cd.truck } });
      } else if (s.hire === "Approved" && jobId === HIRE.job && date === HIRE.date) {
        items.push({ label: "Transport", state: "Ready", detail: HIRE.id + " hired, driver " + firstName(HIRE.driver), ref: { kind: "hire", id: HIRE.id } });
      } else if (s.repair === "Returned to service" && cd && cd.driver === "P05") {
        items.push({ label: "Transport", state: "Ready", detail: "TRK-02 returned to service, driver Mihai", ref: { kind: "asset", id: "TRK-02" } });
      } else {
        const proposed = s.repair !== "Returned to service" && date > dayOf(DEFECT.proposedReturn);
        items.push({ label: "Transport", state: proposed ? "Needs confirmation" : "Blocked",
          detail: proposed ? "Relies on TRK-02 returning. Proposed return 11 Nov 15:00 is not confirmed." : "TRK-02 unavailable and no replacement approved",
          ref: jobId === HIRE.job ? { kind: "hire", id: HIRE.id } : { kind: "asset", id: "TRK-02" } });
      }
    }
    jobPos.forEach((p) => items.push({ label: p.material + " " + p.qty + " t", state: p.status === "Confirmed" || p.status === "Delivered" ? "Ready" : "Needs confirmation",
      detail: p.id + " · " + p.status + " · " + fmtTime(p.window), ref: { kind: "po", id: p.id } }));
    drafts.forEach((p) => items.push({ label: p.material + " " + p.qty + " t", state: "Needs confirmation", detail: p.id + " is still a draft", ref: { kind: "po", id: p.id } }));
    const blockers = items.filter((i) => i.state !== "Ready");
    const overall: ReadyState = blockers.some((b) => b.state === "Blocked") ? "Blocked" : blockers.length ? "Needs confirmation" : "Ready";
    return { jobId, date, crew, crewDay: cd, items, blockers, overall };
  });
}
/** The next phase date for a job that has a delivery needing readiness, on or after the clock. */
export function nextCriticalDate(s: DemoState, jobId: string): string | null {
  const d = today(s);
  const dates = pos(s).filter((p) => p.job === jobId && dayOf(p.window) >= d && p.status !== "Delivered").map((p) => dayOf(p.window)).sort();
  return dates[0] || null;
}

export function asphaltOn(s: DemoState, date: string) {
  const list = pos(s).filter((p) => p.material === "Asphalt" && dayOf(p.window) === date);
  const conf = list.filter((p) => p.status === "Confirmed" || p.status === "Delivered");
  return { list, required: list.reduce((a, p) => a + p.qty, 0), confirmed: conf.reduce((a, p) => a + p.qty, 0),
    unconfirmed: list.filter((p) => p.status === "Awaiting confirmation" || p.status === "Draft").reduce((a, p) => a + p.qty, 0) };
}
export function poTotals(s: DemoState) {
  const p = pos(s);
  const by = (st: string) => p.filter((x) => x.status === st).length;
  return { count: p.length, listed: p.reduce((a, x) => a + x.value, 0), nonDraft: p.filter((x) => x.status !== "Draft").reduce((a, x) => a + x.value, 0),
    delivered: by("Delivered"), confirmed: by("Confirmed"), awaiting: by("Awaiting confirmation"), draft: by("Draft") };
}

/* ── Invoices, receivables and cash ───────────────────────────────────── */
export function invoices(s: DemoState) {
  return m(s, "invoices", () => INVOICES.map((inv) => {
    const pays = PAYMENTS.concat(s.payments).filter((p) => p.invoice === inv.id);
    const settled = pays.reduce((a, p) => a + p.amount, 0);
    const open = inv.amount - settled;
    const late = daysBetween(inv.due, s.clock);
    return { ...inv, payments: pays, settled, open, overdue: open > 0 && late > 0, daysOverdue: open > 0 && late > 0 ? late : 0,
      promise: s.promises[inv.id], customerName: customer(inv.customer)?.name || inv.customer, reminderReviewed: s.reminderReviewed[inv.id] };
  }));
}
export const invoiceById = (s: DemoState, id: string) => invoices(s).find((i) => i.id === id);
export function receivables(s: DemoState) {
  return m(s, "recv", () => {
    const inv = invoices(s);
    const open = inv.filter((i) => i.open > 0);
    const overdue = open.filter((i) => i.overdue);
    const bucket = (lo: number, hi: number) => overdue.filter((i) => i.daysOverdue >= lo && i.daysOverdue <= hi).reduce((a, i) => a + i.open, 0);
    return { invoices: inv, open, overdue, openTotal: open.reduce((a, i) => a + i.open, 0), overdueTotal: overdue.reduce((a, i) => a + i.open, 0),
      notDue: open.filter((i) => !i.overdue).reduce((a, i) => a + i.open, 0), b1_30: bucket(1, 30), b31_60: bucket(31, 60), b60: bucket(61, 9999),
      face: inv.reduce((a, i) => a + i.amount, 0), settled: inv.reduce((a, i) => a + i.settled, 0) };
  });
}
export const customerBalance = (s: DemoState, cid: string) => invoices(s).filter((i) => i.customer === cid).reduce((a, i) => a + i.open, 0);

export type CashRow = { id: string; date: string; label: string; amount: number; kind: "opening" | "receipt" | "received" | "supplier" | "wages" | "fixed" | "hire" | "delayed"; ref?: Ref; note?: string; counted: boolean };
export function cash(s: DemoState) {
  return m(s, "cash", () => {
    const [from, to] = CASH.window;
    const rows: CashRow[] = [{ id: "open", date: dayOf(CASH.openingAt), label: "Opening bank snapshot (manual)", amount: CASH.opening, kind: "opening", counted: true }];
    const inv099 = invoiceById(s, "INV-099")!;
    s.payments.filter((p) => p.date >= from && p.date <= to).forEach((p) => rows.push({ id: p.id, date: p.date, label: "Received " + p.invoice + " (" + invoiceById(s, p.invoice)?.customerName + ")", amount: p.amount, kind: "received", ref: { kind: "invoice", id: p.invoice }, counted: true }));
    let receiptAt = "";
    if (inv099.open > 0) {
      receiptAt = inv099.promise?.date || CASH.receiptExpected;
      const inWindow = receiptAt >= from && receiptAt <= to;
      const delayed = s.cashDelay || !inWindow;
      rows.push({ id: "rcpt", date: receiptAt, label: "Expected receipt INV-099 (Kildare BuildCo)" + (inv099.promise ? ", promised" : ", assumption"), amount: inv099.open,
        kind: delayed ? "delayed" : "receipt", ref: { kind: "invoice", id: "INV-099" }, counted: !delayed, note: delayed ? (s.cashDelay ? "Delay scenario: excluded" : "Promised after this window") : undefined });
    }
    BILLS.forEach((b) => rows.push({ id: b.id, date: b.due, label: b.id + " " + supplier(b.supplier)?.name + " (" + b.note + ")", amount: -b.amount, kind: "supplier", ref: { kind: "bill", id: b.id }, counted: true }));
    if (s.hire === "Approved") rows.push({ id: "hire", date: HIRE.date, label: "HIR-01 replacement transport, Leinster Plant Hire", amount: -HIRE.cost, kind: "hire", ref: { kind: "hire", id: HIRE.id }, counted: true });
    rows.push({ id: "fixed", date: CASH.fixedDate, label: "Other fixed payments (allowance)", amount: -CASH.fixedPayments, kind: "fixed", counted: true });
    rows.push({ id: "wages", date: CASH.wagesDate, label: "Day wages, week 9 to 13 Nov (expected gross)", amount: -shifts(s).expectedWages, kind: "wages", counted: true });
    rows.sort((a, b) => (a.kind === "opening" ? -1 : b.kind === "opening" ? 1 : a.date.localeCompare(b.date)));
    const closing = rows.filter((r) => r.counted).reduce((a, r) => a + r.amount, 0);
    const pending = rows.find((r) => r.id === "rcpt" && r.counted);
    const delayedClosing = closing - (pending ? pending.amount : 0);
    const receivedIn = rows.filter((r) => r.kind === "received").reduce((a, r) => a + r.amount, 0);
    const supplierOut = BILLS.reduce((a, b) => a + b.amount, 0);
    let run = 0;
    const days = [] as { date: string; balance: number }[];
    for (let d = from; d <= to; d = addDays(d, 1)) {
      run = rows.filter((r) => r.counted && r.date <= d).reduce((a, r) => a + r.amount, 0);
      days.push({ date: d, balance: run });
    }
    return { rows, closing, delayedClosing, canDelay: !!pending || s.cashDelay, receiptAt, opening: CASH.opening, buffer: CASH.buffer, belowBuffer: closing < CASH.buffer,
      receivedIn, supplierOut, wages: shifts(s).expectedWages, fixed: CASH.fixedPayments, days, actualBank: CASH.opening + receivedIn };
  });
}

/* ── Crew shifts ───────────────────────────────────────────────────────── */
const FRACTION: Record<ShiftState, number> = { "Full day": 1, "Half day": 0.5, Absent: 0 };
export function shifts(s: DemoState) {
  return m(s, "shifts", () => {
    const crew = PEOPLE.filter((p) => p.paidCrew);
    const rows = crew.map((p) => {
      const days = WEEK.map((d) => {
        const sh = s.shifts[p.id + "|" + d];
        const pay = (p.wage || 0) * FRACTION[sh.state];
        return { date: d, ...sh, pay, approvedPay: sh.approved ? pay : 0, status: sh.approved ? "Approved" : d < today(s) ? "To approve" : d === today(s) ? "In progress" : "Planned" };
      });
      return { person: p, days, planned: days.filter((d) => d.state !== "Absent").length, expected: days.reduce((a, d) => a + d.pay, 0), approved: days.reduce((a, d) => a + d.approvedPay, 0), approvedCount: days.filter((d) => d.approved).length };
    });
    const daily = WEEK.map((d) => ({ date: d, expected: rows.reduce((a, r) => a + r.days.find((x) => x.date === d)!.pay, 0), approved: rows.reduce((a, r) => a + r.days.find((x) => x.date === d)!.approvedPay, 0) }));
    return { rows, daily, slots: crew.length * WEEK.length, plannedShifts: rows.reduce((a, r) => a + r.planned, 0), expectedWages: rows.reduce((a, r) => a + r.expected, 0),
      approvedWages: rows.reduce((a, r) => a + r.approved, 0), approvedShifts: rows.reduce((a, r) => a + r.approvedCount, 0), fullDayRate: crew.reduce((a, p) => a + (p.wage || 0), 0) };
  });
}

/* ── Credentials and leave ─────────────────────────────────────────────── */
export function credentials(s: DemoState) {
  return m(s, "creds", () => {
    const d = today(s);
    const list = CREDENTIALS.map((c) => {
      const left = daysBetween(d, c.expires);
      const expired = left < 0, soon = !expired && left <= 30;
      const after = expired || soon ? FUTURE_AFTER(c.person, c.expires) : [];
      return { ...c, personName: personName(c.person), left, expired, soon, valid: !expired, renewal: s.renewals[c.id], affected: after };
    });
    return { list, valid: list.filter((c) => c.valid).length, soon: list.filter((c) => c.soon).length, expired: list.filter((c) => c.expired).length };
  });
}
import { FUTURE_ASSIGNMENTS } from "./fixtures";
function FUTURE_AFTER(pid: string, exp: string) { return FUTURE_ASSIGNMENTS.filter((a) => a.person === pid && a.date > exp); }
export function leave(s: DemoState) {
  return LEAVE.map((l) => ({ ...l, status: s.leave[l.id], personName: personName(l.person) }));
}

/* ── Work ──────────────────────────────────────────────────────────────── */
export function tasks(s: DemoState) {
  return m(s, "tasks", () => TASKS.map((t) => ({ ...t, status: s.tasks[t.id], ownerName: personName(t.owner), open: s.tasks[t.id] !== "Done", late: s.tasks[t.id] !== "Done" && t.due < s.clock })));
}
export const openTasks = (s: DemoState) => tasks(s).filter((t) => t.open);
export const pendingApprovals = (s: DemoState) => tasks(s).filter((t) => t.approval && t.open);

/* ── Activity and agent runs ──────────────────────────────────────────── */
export function activity(s: DemoState): Activity[] {
  return m(s, "activity", () => SEED_ACTIVITY.concat(s.activity).slice().sort((a, b) => (a.at === b.at ? (a.id < b.id ? 1 : -1) : b.at.localeCompare(a.at))));
}
export function runs(s: DemoState): Run[] {
  return m(s, "runs", () => SEED_RUNS.concat(s.runs).slice().sort((a, b) => (a.at === b.at ? (a.id < b.id ? 1 : -1) : b.at.localeCompare(a.at))));
}
export function actorName(actor: string): string {
  if (/^P\d\d$/.test(actor)) return personName(actor);
  const a = ({ briefing: "Briefing", ops: "Ops Watchdog", margin: "Job Margin Agent", dispatch: "Dispatch Agent", materials: "Materials Agent", finance: "Finance Agent", crew: "Crew Admin Agent" } as Record<string, string>)[actor];
  return a || actor;
}

/* ── Briefing: generated from current selectors, with source links ───── */
export type Seg = { text: string; ref?: Ref };
export function briefing(s: DemoState): { section: string; owner?: string; segs: Seg[] }[] {
  return m(s, "brief", () => {
    const j104 = jobById(s, "J104")!, b = month(s), sc = scenario(s), inv = invoiceById(s, "INV-099")!;
    const po204 = poById(s, "PO-204")!;
    const surf = rel("2026-11-11", s.clock);
    const out: { section: string; owner?: string; segs: Seg[] }[] = [];
    out.push({ section: "Today", owner: "P01", segs: [
      { text: "Naas distribution yard", ref: { kind: "job", id: "J104" } },
      { text: j104.overrun > 0 ? " is forecast " + eur(j104.overrun) + " over budget, leaving " + eur(j104.profit) + " gross profit." : " is on budget, with " + eur(j104.profit) + " gross profit." }] });
    const t: Seg[] = [];
    if (s.repair === "Returned to service") t.push({ text: "TRK-02", ref: { kind: "asset", id: "TRK-02" } }, { text: " is back in service, so Mihai has a truck for Dunlavin." });
    else if (s.hire === "Approved") t.push({ text: "TRK-02", ref: { kind: "asset", id: "TRK-02" } }, { text: " is still unavailable; Joe approved the " + eur(HIRE.cost) + " replacement for Mihai on 11 Nov." });
    else t.push({ text: "TRK-02", ref: { kind: "asset", id: "TRK-02" } }, { text: " is unavailable, so Mihai's transport for " }, { text: "Dunlavin", ref: { kind: "job", id: "J105" } }, { text: " still needs a decision." });
    out.push({ section: "Today", owner: "P02", segs: t });
    const when = surf === "tomorrow" ? "tomorrow" : surf === "today" ? "today" : "11 Nov";
    out.push({ section: "Today", owner: "P03", segs: po204.status === "Awaiting confirmation"
      ? [{ text: "The 18 tonnes of asphalt for " + when + " at 08:00 also remain unconfirmed", ref: { kind: "po", id: "PO-204" } }, { text: "." }]
      : [{ text: "The 18 tonnes of asphalt for " + when + " at 08:00 are " + po204.status.toLowerCase(), ref: { kind: "po", id: "PO-204" } }, { text: "." }] });
    out.push({ section: "Money", owner: "P03", segs: inv.open === 0
      ? [{ text: "Kildare BuildCo", ref: { kind: "customer", id: "C01" } }, { text: " has paid the " }, { text: "INV-099", ref: { kind: "invoice", id: "INV-099" } }, { text: " balance." }]
      : inv.promise
        ? [{ text: "Kildare BuildCo", ref: { kind: "customer", id: "C01" } }, { text: " owes " + eur(inv.open) + ", " + inv.daysOverdue + " days overdue, and has promised payment for " + inv.promise.date.slice(8, 10).replace(/^0/, "") + " Nov. It is still unpaid." }]
        : [{ text: "Kildare BuildCo", ref: { kind: "customer", id: "C01" } }, { text: " owes " }, { text: eur(inv.open), ref: { kind: "invoice", id: "INV-099" } }, { text: ", now " + inv.daysOverdue + " days overdue." }] });
    out.push({ section: "Money", owner: "P01", segs: [{ text: "November operating profit is forecast at " }, { text: eur(b.op), ref: { kind: "job", id: "__goal" } }, { text: " against your example " + eur(b.target) + " target." }] });
    if (!sc.varIn || !sc.hireIn) {
      const parts = [!sc.varIn ? "the variation" : "", !sc.hireIn ? "replacement-transport" : ""].filter(Boolean);
      out.push({ section: "Money", owner: "P01", segs: [{ text: "The " + parts.join(" and ") + " scenario would bring it to " + eur(sc.bothOp) + "." }] });
    }
    return out;
  });
}
export function briefingText(s: DemoState): string {
  const first = greeting(s.clock) + ", Florin. ";
  return first + briefing(s).map((p) => p.segs.map((x) => x.text).join("")).join(" ");
}

export const ALL_DOCS = DOCUMENTS;
export const dayLabel = (d: string) => ms(d);
