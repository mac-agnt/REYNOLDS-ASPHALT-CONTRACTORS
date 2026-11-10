/* The single Reynolds demo store. Seed fixtures live in fixtures.ts and never
   change; this holds only what the demo has changed since the seed. Every state
   transition goes through `commit`, which writes the change, appends at most one
   linked activity event and notifies subscribers. Persisted to localStorage under
   a versioned key purely so a page refresh keeps the demo state; it is not a backend. */
import { useSyncExternalStore } from "react";
import {
  CREW_PLAN, JOBS, LEAVE, POS, QUOTES, START_CLOCK, TARGET, TASKS, WEEK, AGENTS, PEOPLE,
  type Activity, type CrewDay, type Job, type JobStatus, type Payment, type PoStatus, type Ref, type Run, type TaskStatus, type ActKind,
} from "./fixtures";

export type ShiftState = "Full day" | "Half day" | "Absent";
export type DemoState = {
  v: number;
  clock: string;
  target: number;
  jobStatus: Record<string, JobStatus>;
  extraJobs: Job[];
  quotes: Record<string, { stage: "Draft" | "Sent" | "Accepted"; followUp: string; value: number; title: string; jobId?: string; month?: string }>;
  variation: "Draft" | "Internally approved" | "Customer accepted";
  scenario: { variation: boolean; hire: boolean };
  cashDelay: boolean;
  repair: "Awaiting approval" | "Approved" | "Repair complete" | "Returned to service";
  repairLog: { step: string; at: string; by: string }[];
  hire: "Proposed" | "Approved";
  pos: Record<string, { status: PoStatus; window: string; receivedQty?: number; receivedAt?: string; confirmedAt?: string }>;
  payments: Payment[];
  promises: Record<string, { date: string; at: string }>;
  reminderReviewed: Record<string, string>;
  tax: Record<string, { status: "Needs review" | "Evidence to inspect" | "Reviewed"; vat?: string; rct?: string; reviewer?: string; at?: string; note?: string }>;
  invoicePreview: Record<string, boolean>;
  tasks: Record<string, TaskStatus>;
  shifts: Record<string, { state: ShiftState; approved: boolean }>;
  leave: Record<string, "Pending" | "Approved" | "Declined">;
  renewals: Record<string, string>;
  plan: Record<string, { A: CrewDay; B: CrewDay }>;
  siteNotes: { id: string; job: string; text: string; at: string; by: string; attachment?: string }[];
  activity: Activity[];
  runs: Run[];
  agentsOn: Record<string, boolean>;
  draftOnly: boolean;
  viewAs: "P01" | "P02" | "P03" | "crew";
  seq: number;
};

const KEY = "reynolds-demo";
const VERSION = 3;

export function seedState(): DemoState {
  const shifts: DemoState["shifts"] = {};
  PEOPLE.filter((p) => p.paidCrew).forEach((p) => WEEK.forEach((d) => {
    shifts[p.id + "|" + d] = { state: "Full day", approved: d === "2026-11-09" };
  }));
  const pos: DemoState["pos"] = {};
  POS.forEach((p) => (pos[p.id] = { status: p.status, window: p.window }));
  const quotes: DemoState["quotes"] = {};
  QUOTES.forEach((q) => (quotes[q.id] = { stage: q.stage, followUp: q.followUp, value: q.value, title: q.title }));
  const tasks: DemoState["tasks"] = {};
  TASKS.forEach((t) => (tasks[t.id] = t.status));
  const leave: DemoState["leave"] = {};
  LEAVE.forEach((l) => (leave[l.id] = l.status));
  const agentsOn: DemoState["agentsOn"] = {};
  AGENTS.forEach((a) => (agentsOn[a.id] = true));
  return {
    v: VERSION, clock: START_CLOCK, target: TARGET, jobStatus: {}, extraJobs: [], quotes,
    variation: "Draft", scenario: { variation: false, hire: false }, cashDelay: false,
    repair: "Awaiting approval",
    repairLog: [{ step: "Reported", at: "2026-11-09T16:40", by: "P05" }, { step: "Quote attached, approval requested", at: "2026-11-09T17:20", by: "P01" }],
    hire: "Proposed", pos, payments: [], promises: {}, reminderReviewed: {},
    tax: {
      J105: { status: "Needs review", note: "Private driveway. VAT treatment not yet reviewed. Do not assume private means no VAT." },
      J104: { status: "Evidence to inspect", note: "Commercial job for Naas Logistics Park. Contract relationship and review evidence to inspect before invoicing." },
    },
    invoicePreview: {}, tasks, shifts, leave, renewals: {},
    plan: JSON.parse(JSON.stringify(CREW_PLAN)), siteNotes: [], activity: [], runs: [], agentsOn,
    draftOnly: true, viewAs: "P01", seq: 0,
  };
}

function load(): DemoState {
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem(KEY) : null;
    if (raw) {
      const s = JSON.parse(raw);
      if (s && s.v === VERSION) return s;
    }
  } catch { /* private window or blocked storage: start from the seed */ }
  return seedState();
}

let state: DemoState = load();
const listeners = new Set<() => void>();
function persist() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
}
function emit() { listeners.forEach((l) => l()); }

export function getState(): DemoState { return state; }
export function subscribe(l: () => void): () => void { listeners.add(l); return () => listeners.delete(l); }
export function useDemo(): DemoState { return useSyncExternalStore(subscribe, getState, getState); }

type EventIn = { kind: ActKind; actor: string; title: string; note: string; refs: Ref[] };
/** The one state-transition path: apply a patch, append one linked event, notify. */
export function commit(patch: Partial<DemoState> | ((s: DemoState) => Partial<DemoState> | null), ev?: EventIn) {
  const p = typeof patch === "function" ? patch(state) : patch;
  if (p === null) return;
  let next: DemoState = { ...state, ...p };
  if (ev) {
    const seq = next.seq + 1;
    next = { ...next, seq, activity: next.activity.concat([{ id: "E" + seq, at: next.clock, provenance: "Simulated", ...ev }]) };
  }
  state = next;
  persist();
  emit();
}
export function resetDemo() {
  state = seedState();
  try { localStorage.removeItem(KEY); } catch { /* ignore */ }
  ui = { drawer: null, toast: null };
  emit(); emitUi();
}

/* ── UI-only state (not persisted): the global record drawer and a toast ── */
type Ui = { drawer: Ref | null; toast: string | null };
let ui: Ui = { drawer: null, toast: null };
const uiListeners = new Set<() => void>();
function emitUi() { uiListeners.forEach((l) => l()); }
export function useUi(): Ui {
  return useSyncExternalStore((l) => { uiListeners.add(l); return () => uiListeners.delete(l); }, () => ui, () => ui);
}
export function openRecord(kind: Ref["kind"], id: string) { ui = { ...ui, drawer: { kind, id } }; emitUi(); }
export function closeRecord() { ui = { ...ui, drawer: null }; emitUi(); }
let toastTimer: ReturnType<typeof setTimeout> | undefined;
export function toast(msg: string) {
  ui = { ...ui, toast: msg }; emitUi();
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { ui = { ...ui, toast: null }; emitUi(); }, 3200);
}

/* ── Navigation bridge: PulseLogic owns page and tab state and registers here ── */
type Go = (page: string, tab?: string, params?: Record<string, string>) => void;
let goImpl: Go = () => {};
export function registerNavigator(fn: Go) { goImpl = fn; }
export function go(page: string, tab?: string, params?: Record<string, string>) { closeRecord(); goImpl(page, tab, params); }
