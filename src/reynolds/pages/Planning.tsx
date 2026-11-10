/* Planning: today's crews, the week's resource grid, day-rate shifts, leave and credentials. */
import { Fragment, type ReactNode } from "react";
import { useDemo, type ShiftState } from "../store";
import { act } from "../actions";
import { ASSETS, CREDENTIALS, FLORIN_DAY, FUTURE_ASSIGNMENTS, PEOPLE, WEEK } from "../fixtures";
import {
  assetOn, credentials, firstName, jobById, leave, nextCriticalDate, person, personName, readiness, shifts, today,
} from "../selectors";
import { eur, fmtDate, rel } from "../format";
import {
  Avatar, Badge, Btn, Grid, Note, Page, PageLink, Panel, RecLink, StateBadge, Stat, Table, type Col,
} from "../ui";
import type { DemoState } from "../store";

type Props = { tab: string; params: Record<string, string> };

export default function PlanningPage({ tab }: Props) {
  const t = tab || "today";
  if (t === "week") return <Week />;
  if (t === "shifts") return <Shifts />;
  if (t === "leave") return <Leave />;
  if (t === "certificates") return <Certificates />;
  return <Today />;
}

const CREWS: ("A" | "B")[] = ["A", "B"];
const crewMembers = (c: "A" | "B") => PEOPLE.filter((p) => p.crew === c);

/* ── Today ─────────────────────────────────────────────────────────────── */
function Today() {
  const s = useDemo();
  const d = today(s);
  const plan = s.plan[d];
  const nextJ106 = WEEK.find((x) => x > d && s.plan[x] && (s.plan[x].A.job === "J106" || s.plan[x].B.job === "J106"));
  return (
    <Page title={"Today, " + fmtDate(d, "long")} sub="Where each crew is going, what they have with them, and whether the job can actually go ahead.">
      {!plan && <Note>No crew plan is recorded for {fmtDate(d, "dow")}. The demo plan covers Monday 9 to Friday 13 November.</Note>}
      {plan && (
        <Grid cols="1fr 1fr">
          {CREWS.map((c) => <CrewCard key={c} s={s} crew={c} date={d} />)}
        </Grid>
      )}
      <Grid cols="1.2fr 1fr" style={{ marginTop: 14 }}>
        <Panel title="Florin's day" sub="Supervision and customer visits. Shown apart from the crews.">
          <div className="r-list">
            {FLORIN_DAY.map((f) => (
              <div key={f.at} className="r-li">
                <span className="r-num" style={{ flex: "none", width: 48, fontWeight: 600, color: "var(--ink)" }}>{f.at}</span>
                <span style={{ flex: 1, minWidth: 0, fontSize: 13.5, color: "var(--body)" }}>{f.what}</span>
                <RecLink r={f.ref} />
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Coming up" sub="Open work that is not a crew on site today.">
          <div className="r-list">
            <div className="r-li">
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, color: "var(--ink)" }}><RecLink r={{ kind: "job", id: "J106" }}>Rathcoole footpath repairs</RecLink></div>
                <div className="r-dim" style={{ fontSize: 12.5, marginTop: 3 }}>
                  Work package open. {nextJ106 ? "Next crew visit " + fmtDate(nextJ106, "dow") + " (" + rel(nextJ106, s.clock) + "), Crew " + (s.plan[nextJ106].A.job === "J106" ? "A" : "B") + "." : "No crew visit planned this week."} No third crew today.
                </div>
              </div>
              {nextJ106 && <StateBadge state={readiness(s, "J106", nextJ106).overall} />}
            </div>
            {["J107", "J108"].map((id) => {
              const j = jobById(s, id)!;
              return (
                <div key={id} className="r-li">
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5 }}><RecLink r={{ kind: "job", id }}>{j.name}</RecLink></div>
                    <div className="r-dim" style={{ fontSize: 12.5, marginTop: 3 }}>{j.area}, starts {fmtDate(j.start, "dow")}. {j.nextAction}.</div>
                  </div>
                  <StateBadge state={j.status} />
                </div>
              );
            })}
          </div>
        </Panel>
      </Grid>
    </Page>
  );
}

function CrewCard({ s, crew, date }: { s: DemoState; crew: "A" | "B"; date: string }) {
  const cd = s.plan[date][crew];
  const j = cd.job ? jobById(s, cd.job) : undefined;
  const r = cd.job ? readiness(s, cd.job, date) : null;
  const next = cd.job ? nextCriticalDate(s, cd.job) : null;
  const later = next && next !== date ? readiness(s, cd.job, next) : null;
  const truck = cd.truck ? assetOn(s, cd.truck, date) : null;
  const plant = cd.plant ? assetOn(s, cd.plant, date) : null;
  return (
    <Panel title={"Crew " + crew + (j ? ", " + j.area : "")} sub={j ? j.name : "No job planned"}
      right={r ? <StateBadge state={r.overall} /> : undefined}>
      <div className="r-pill-row" style={{ marginBottom: 12 }}>
        {crewMembers(crew).map((p) => (
          <span key={p.id} style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 12.5, color: "var(--body)", marginRight: 6 }}>
            <Avatar initials={p.initials} tint={p.tint} size={22} />{p.first}
          </span>
        ))}
      </div>
      <dl className="r-kv">
        <dt>Today's work</dt><dd>{cd.note || "Not set"}</dd>
        <dt>Job</dt><dd>{j ? <RecLink r={{ kind: "job", id: j.id }}>{j.id} {j.name}</RecLink> : "None"}</dd>
        <dt>Truck</dt><dd>{cd.truck ? <><RecLink r={{ kind: "asset", id: cd.truck }} /> <span className="r-dim">{truck?.status}</span></> : <span className="r-dim">No truck assigned today</span>}</dd>
        <dt>Driver</dt><dd>{cd.driver ? <RecLink r={{ kind: "person", id: cd.driver }}>{personName(cd.driver)}</RecLink> : <span className="r-dim">None needed today</span>}</dd>
        <dt>Plant</dt><dd>{cd.plant ? <><RecLink r={{ kind: "asset", id: cd.plant }} /> <span className="r-dim">{plant?.status}</span></> : <span className="r-dim">None</span>}</dd>
      </dl>
      {r && r.items.length > 0 && (
        <div style={{ marginTop: 14 }}>
          <div className="r-eyebrow" style={{ marginBottom: 6 }}>Readiness today</div>
          <ReadyList items={r.items} />
        </div>
      )}
      {later && (
        <div style={{ marginTop: 14, paddingTop: 12, borderTop: "1px solid var(--border)" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap", marginBottom: 6 }}>
            <span className="r-eyebrow">{(later.items.some((i) => i.label.startsWith("Asphalt")) ? "Surfacing" : "Next phase") + ", " + fmtDate(later.date, "dow") + " (" + rel(later.date, s.clock) + ")"}</span>
            <StateBadge state={later.overall} />
            {later.blockers.length > 0 && <span className="r-dim" style={{ fontSize: 12 }}>{later.blockers.length} {later.blockers.length === 1 ? "blocker" : "blockers"}</span>}
          </div>
          <ReadyList items={later.items} />
        </div>
      )}
    </Panel>
  );
}

function ReadyList({ items }: { items: { label: string; state: string; detail: string; ref?: { kind: any; id: string } }[] }) {
  return (
    <div className="r-list">
      {items.map((i, k) => (
        <div key={k} className="r-li" style={{ padding: "8px 0", alignItems: "center" }}>
          <span style={{ flex: "none", width: 120, fontSize: 13, color: "var(--ink)" }}>{i.label}</span>
          <span className="r-dim" style={{ flex: 1, minWidth: 0, fontSize: 12.5 }}>{i.ref ? <RecLink r={i.ref}>{i.detail}</RecLink> : i.detail}</span>
          <StateBadge state={i.state} />
        </div>
      ))}
    </div>
  );
}

/* ── Week ──────────────────────────────────────────────────────────────── */
const PLAN_JOBS = ["J104", "J105", "J106", "J107", "J108"];
const TRUCKS = ASSETS.filter((a) => a.kind === "Truck").map((a) => a.id);
const PLANT = ASSETS.filter((a) => a.kind === "Plant").map((a) => a.id);
const PAID = PEOPLE.filter((p) => p.paidCrew);

function conflicts(s: DemoState, date: string): string[] {
  const plan = s.plan[date];
  if (!plan) return [];
  const out: string[] = [];
  const { A, B } = plan;
  if (A.truck && A.truck === B.truck) out.push(A.truck + " is planned with both crews.");
  if (A.driver && A.driver === B.driver) out.push(firstName(A.driver) + " is planned to drive for both crews.");
  if (A.plant && A.plant === B.plant) out.push(A.plant + " is planned with both crews.");
  CREWS.forEach((c) => {
    const cd = plan[c];
    const drv = cd.driver ? person(cd.driver) : undefined;
    if (cd.truck && drv && !drv.truckEligible) out.push("Crew " + c + ": " + drv.first + " is not eligible to drive " + cd.truck + ".");
    if (cd.truck && !cd.driver) out.push("Crew " + c + ": " + cd.truck + " has no driver.");
    if (drv && drv.crew && drv.crew !== c) out.push("Crew " + c + ": " + drv.first + " is a Crew " + drv.crew + " member and is planned there too.");
    if (cd.truck) {
      const a = assetOn(s, cd.truck, date);
      if (!a.available) {
        out.push("Crew " + c + ": " + cd.truck + " unavailable (" + a.status + ").");
        if (cd.truck === "TRK-02" && date >= "2026-11-11") out.push("The proposed TRK-02 return on 11 Nov 15:00 is not confirmed, so it is not capacity.");
      }
    }
    if (cd.plant) {
      const a = assetOn(s, cd.plant, date);
      if (!a.available) out.push("Crew " + c + ": " + cd.plant + " unavailable (" + a.status + ").");
    }
    const people = crewMembers(c).map((p) => p.id).concat(drv && drv.crew !== c ? [drv.id] : []);
    CREDENTIALS.filter((cr) => people.includes(cr.person) && (cr.type === "Safe Pass" || cr.person === cd.driver) && cr.expires < date)
      .forEach((cr) => out.push("Crew " + c + ": " + firstName(cr.person) + "'s " + cr.type + " expired " + fmtDate(cr.expires) + "."));
    if (cd.job) {
      readiness(s, cd.job, date).items.filter((i) => i.label === "Transport" && i.state !== "Ready")
        .forEach((i) => out.push("Crew " + c + " (" + cd.job + "): transport " + i.state.toLowerCase() + ". " + i.detail + "."));
    }
  });
  return Array.from(new Set(out));
}

function Week() {
  const s = useDemo();
  const d = today(s);
  const total = WEEK.reduce((a, x) => a + conflicts(s, x).length, 0);
  const sel = (date: string, crew: "A" | "B", field: "job" | "truck" | "driver" | "plant", options: string[], label: (v: string) => string) => (
    <select className="r-select" aria-label={"Crew " + crew + " " + field + " " + date} value={s.plan[date][crew][field]}
      onChange={(e) => act.setPlan(date, crew, field, e.target.value)} style={{ width: "100%", height: 32, fontSize: 12.5 }}>
      <option value="">{field === "job" ? "No job" : field === "driver" ? "No driver" : "None"}</option>
      {options.map((o) => <option key={o} value={o}>{label(o)}</option>)}
    </select>
  );
  return (
    <Page title="Week, 9 to 13 November" sub="Jobs, people, trucks and plant by day. Changing a selection re-checks the day for conflicts.">
      <div className="r-pill-row" style={{ marginBottom: 14 }}>
        {total ? <Badge tone="warn">! {total} {total === 1 ? "conflict" : "conflicts"} this week</Badge> : <Badge tone="ok">✓ No conflicts</Badge>}
        <span className="r-dim" style={{ fontSize: 12.5 }}>Two trucks, two eligible drivers. A full crew with no truck is not deployable capacity.</span>
      </div>
      <div className="r-scroll-x">
        <Grid cols="repeat(5, minmax(210px, 1fr))" gap={10} style={{ minWidth: 0 }}>
          {WEEK.map((date) => {
            const cs = conflicts(s, date);
            return (
              <Panel key={date} title={fmtDate(date, "dow")} sub={date === d ? "Today" : date < d ? "Done" : rel(date, s.clock)}
                right={cs.length ? <Badge tone="warn">! {cs.length}</Badge> : <Badge tone="ok">✓</Badge>}
                style={date === d ? { borderColor: "var(--accent-line)" } : undefined}>
                {CREWS.map((c) => (
                  <div key={c} style={{ display: "flex", flexDirection: "column", gap: 6, padding: "10px 0", borderTop: "1px solid var(--border)" }}>
                    <div style={{ fontSize: 12, fontWeight: 600, color: "var(--body)" }}>Crew {c} <span className="r-faint" style={{ fontWeight: 400 }}>{crewMembers(c).map((p) => p.first).join(", ")}</span></div>
                    {sel(date, c, "job", PLAN_JOBS, (o) => o + " " + (jobById(s, o)?.area || ""))}
                    {sel(date, c, "truck", TRUCKS, (o) => o + (assetOn(s, o, date).available ? "" : " (unavailable)"))}
                    {sel(date, c, "driver", PAID.map((p) => p.id), (o) => personName(o) + (person(o)?.truckEligible ? "" : " (not eligible)"))}
                    {sel(date, c, "plant", PLANT, (o) => o + (assetOn(s, o, date).available ? "" : " (" + assetOn(s, o, date).status.toLowerCase() + ")"))}
                    {s.plan[date][c].note && <div className="r-faint" style={{ fontSize: 11.5 }}>{s.plan[date][c].note}</div>}
                  </div>
                ))}
                {cs.length > 0 && (
                  <div style={{ display: "flex", flexDirection: "column", gap: 6, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
                    {cs.map((x, i) => <div key={i} style={{ fontSize: 12, lineHeight: 1.45, color: "var(--warn)" }}><span aria-hidden="true">! </span>{x}</div>)}
                  </div>
                )}
              </Panel>
            );
          })}
        </Grid>
      </div>
    </Page>
  );
}

/* ── Crew & shifts ─────────────────────────────────────────────────────── */
const STATES: ShiftState[] = ["Full day", "Half day", "Absent"];

function Shifts() {
  const s = useDemo();
  const sh = shifts(s);
  const d = today(s);
  const mon = sh.daily[0];
  const tpl = "minmax(150px,1.3fr) 70px repeat(5, minmax(118px,1fr)) 90px 90px";
  return (
    <Page title="Crew & shifts" sub="Seven paid crew on day wages. Pay follows an explicit full, half or absent choice, never start or finish times.">
      <Grid cols="repeat(4, 1fr)">
        <Stat label="Planned shifts" value={sh.plannedShifts + " of " + sh.slots} sub="7 crew × 5 days, absences removed" />
        <Stat label="Expected gross day wages" value={eur(sh.expectedWages)} sub={"Week 9 to 13 Nov. Full-day rate " + eur(sh.fullDayRate) + " per day"} />
        <Stat label="Approved so far" value={eur(sh.approvedWages)} sub={sh.approvedShifts + " shifts approved"} tone="ok" />
        <Stat label={"Approved " + fmtDate(mon.date, "dow")} value={eur(mon.approved)} sub={"Expected " + eur(mon.expected)} />
      </Grid>
      <Panel title="Week grid" sub="Approve attendance only for today or earlier. Future days stay planned." style={{ marginTop: 14 }} pad={false}>
        <div className="r-scroll-x">
          <div style={{ minWidth: 1020 }}>
            <div className="r-tr r-th" style={{ gridTemplateColumns: tpl }}>
              <div>Crew member</div><div className="r-num">Day rate</div>
              {WEEK.map((w) => {
                const open = PAID.some((p) => !s.shifts[p.id + "|" + w].approved);
                return (
                  <div key={w} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                    <span>{fmtDate(w, "dow")}</span>
                    {w <= d && open && <Btn small kind="quiet" onClick={() => act.approveDay(w)} title={"Approve all of " + fmtDate(w, "dow")}>Approve day</Btn>}
                  </div>
                );
              })}
              <div style={{ textAlign: "right" }}>Expected</div><div style={{ textAlign: "right" }}>Approved</div>
            </div>
            {sh.rows.map((r) => (
              <div key={r.person.id} className="r-tr" style={{ gridTemplateColumns: tpl }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Avatar initials={r.person.initials} tint={r.person.tint} size={24} />
                  <span style={{ minWidth: 0 }}>
                    <RecLink r={{ kind: "person", id: r.person.id }}>{r.person.name}</RecLink>
                    <span className="r-faint" style={{ display: "block", fontSize: 11 }}>Crew {r.person.crew}{r.person.truckEligible ? ", driver" : ""}</span>
                  </span>
                </div>
                <div className="r-num">{eur(r.person.wage || 0)}</div>
                {r.days.map((x) => (
                  <div key={x.date} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <select className="r-select" value={x.state} aria-label={r.person.first + " " + fmtDate(x.date, "dow")}
                      onChange={(e) => act.setShift(r.person.id, x.date, e.target.value as ShiftState)} style={{ height: 30, fontSize: 12, padding: "0 6px" }}>
                      {STATES.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
                      {x.approved ? <Badge tone="ok">✓ Approved</Badge>
                        : x.date <= d ? <Btn small kind="ghost" onClick={() => act.approveShift(r.person.id, x.date)}>Approve</Btn>
                          : <span className="r-faint">{x.status}</span>}
                      <span className="r-num r-faint">{eur(x.pay)}</span>
                    </div>
                  </div>
                ))}
                <div className="r-num" style={{ textAlign: "right" }}>{eur(r.expected)}</div>
                <div className="r-num" style={{ textAlign: "right", color: "var(--ok)" }}>{eur(r.approved)}</div>
              </div>
            ))}
            <div className="r-tr r-tfoot" style={{ gridTemplateColumns: tpl }}>
              <div>Daily total</div><div />
              {sh.daily.map((x) => <div key={x.date} className="r-num">{eur(x.expected)} <span className="r-faint">/ {eur(x.approved)} approved</span></div>)}
              <div className="r-num" style={{ textAlign: "right" }}>{eur(sh.expectedWages)}</div>
              <div className="r-num" style={{ textAlign: "right" }}>{eur(sh.approvedWages)}</div>
            </div>
          </div>
        </div>
      </Panel>
      <Grid cols="1fr 1fr" style={{ marginTop: 14 }}>
        <Panel title="Florin Pricope" sub="On site most days for supervision and customer visits.">
          <div className="r-dim" style={{ fontSize: 13, lineHeight: 1.55 }}>Shown here for visibility only. No wage is recorded for Florin in the demo and he is not part of the seven-person day-wage model.</div>
        </Panel>
        <Panel title="How the numbers reconcile">
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Note>Start and finish times are operational context only. A 15:30 or 18:00 finish does not change the day wage, and half-day pay applies only when Half day is chosen.</Note>
            <Note>Planned crew days are already inside each job's labour forecast. Approving attendance confirms that cost; it is not added a second time. {eur(sh.expectedWages)} is expected gross day wages, not total employer cost.</Note>
          </div>
        </Panel>
      </Grid>
    </Page>
  );
}

/* ── Leave ─────────────────────────────────────────────────────────────── */
function Leave() {
  const s = useDemo();
  const rows = leave(s);
  const sh = shifts(s);
  const impact = (pid: string, date: string): ReactNode => {
    const a = FUTURE_ASSIGNMENTS.filter((x) => x.person === pid && x.date === date);
    if (!a.length) return <span className="r-dim">No assignment that day. No cover needed.</span>;
    return <span>Planned on {a.map((x, i) => <Fragment key={i}>{i ? ", " : ""}<RecLink r={{ kind: "job", id: x.job }} /></Fragment>)} that day. Needs cover for that date only.</span>;
  };
  const cols: Col<(typeof rows)[number]>[] = [
    { k: "p", label: "Person", w: "1.2fr", render: (r) => <RecLink r={{ kind: "person", id: r.person }}>{r.personName}</RecLink> },
    { k: "d", label: "Date", w: ".8fr", render: (r) => fmtDate(r.date, "dow") },
    { k: "why", label: "Reason", w: ".9fr", hideSm: true, render: (r) => <span className="r-dim">{r.reason}</span> },
    { k: "st", label: "Status", w: ".8fr", render: (r) => <StateBadge state={r.status} /> },
    { k: "imp", label: "Coverage impact", w: "1.8fr", render: (r) => impact(r.person, r.date) },
    { k: "a", label: "", w: "1.1fr", align: "right", render: (r) => r.status === "Pending"
      ? <span style={{ display: "inline-flex", gap: 6 }}><Btn small kind="primary" onClick={() => act.decideLeave(r.id, "Approved")}>Approve</Btn><Btn small onClick={() => act.decideLeave(r.id, "Declined")}>Decline</Btn></span>
      : <span className="r-faint" style={{ fontSize: 12 }}>Decided</span> },
  ];
  return (
    <Page title="Leave" sub="Requests change availability for their own date only.">
      <Panel title="Requests" sub={rows.filter((r) => r.status === "Pending").length + " waiting for a decision"} pad={false}>
        <Table cols={cols} rows={rows} keyOf={(r) => r.id} />
      </Panel>
      <div style={{ marginTop: 14 }}>
        <Note>Both requests fall after this week, so the 9 to 13 November wage forecast stays at {eur(sh.expectedWages)} whatever is decided.</Note>
      </div>
    </Page>
  );
}

/* ── Certificates ──────────────────────────────────────────────────────── */
function Certificates() {
  const s = useDemo();
  const cr = credentials(s);
  const tomas = cr.list.find((c) => c.id === "CR-SP-P08")!;
  const tomasAll = FUTURE_ASSIGNMENTS.filter((a) => a.person === "P08");
  type Row = (typeof cr.list)[number];
  const cols: Col<Row>[] = [
    { k: "p", label: "Person", w: "1.2fr", render: (c) => <RecLink r={{ kind: "person", id: c.person }}>{c.personName}</RecLink> },
    { k: "t", label: "Record", w: "1fr", render: (c) => c.type },
    { k: "e", label: "Expires", w: ".8fr", render: (c) => <span className="r-num">{fmtDate(c.expires)} {c.expires.slice(0, 4)}</span> },
    { k: "l", label: "Days left", w: ".6fr", align: "right", render: (c) => <span className="r-num">{c.left}</span> },
    { k: "s", label: "Status", w: "1fr", render: (c) => <StateBadge state={c.expired ? "Expired" : c.soon ? "Expiring soon" : "Valid"} /> },
    { k: "ev", label: "Evidence", w: "1.5fr", hideSm: true, render: (c) => <span className="r-dim" style={{ fontSize: 12.5 }}>{c.evidence} <RecLink r={{ kind: "document", id: c.doc }} /></span> },
    { k: "a", label: "", w: "1fr", align: "right", render: (c) => c.renewal ? <Badge tone="ok">✓ Renewal booked</Badge>
      : c.soon || c.expired ? <Btn small onClick={() => act.bookRenewal(c.id)}>Book renewal</Btn> : <span className="r-faint">None needed</span> },
  ];
  return (
    <Page title="Certificates" sub="Seven Safe Pass records and two truck-eligibility records. Simulated records, not real compliance checks.">
      <Grid cols="repeat(3, 1fr)">
        <Stat label="Currently valid" value={cr.valid + " of " + cr.list.length} tone="ok" />
        <Stat label="Expiring within 30 days" value={cr.soon} tone={cr.soon ? "warn" : undefined} sub="Included in the valid count. The two figures overlap." />
        <Stat label="Expired" value={cr.expired} tone={cr.expired ? "bad" : undefined} />
      </Grid>
      <Panel tone="warn" style={{ marginTop: 14 }} title={"Tomas Nowak's Safe Pass expires " + fmtDate(tomas.expires, "dow")}
        sub={tomas.left >= 0 ? tomas.left + " days from now. A warning, not a block: work before the expiry date goes ahead." : "Expired."}
        right={tomas.renewal ? <Badge tone="ok">✓ Renewal booked</Badge> : <Btn kind="primary" onClick={() => act.bookRenewal(tomas.id)}>Book renewal</Btn>}>
        <div className="r-list">
          {tomasAll.map((a, i) => {
            const after = a.date > tomas.expires;
            return (
              <div key={i} className="r-li" style={{ alignItems: "center" }}>
                <span className="r-num" style={{ width: 90, flex: "none" }}>{fmtDate(a.date, "dow")}</span>
                <span style={{ flex: 1, minWidth: 0 }}><RecLink r={{ kind: "job", id: a.job }}>{a.job} {jobById(s, a.job)?.name}</RecLink></span>
                {after ? <Badge tone="warn">! After expiry unless renewed</Badge> : <Badge tone="ok">✓ Before expiry</Badge>}
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 10, fontSize: 12.5 }} className="r-dim">Renewal is tracked as task <RecLink r={{ kind: "task", id: "W008" }} />, owner Aoife. Booking a renewal does not change the recorded expiry until new evidence is added.</div>
      </Panel>
      <Panel title="All records" style={{ marginTop: 14 }} pad={false}>
        <Table cols={cols} rows={cr.list} keyOf={(c) => c.id} />
      </Panel>
      <div style={{ marginTop: 10 }} className="r-faint">
        <span style={{ fontSize: 12 }}>Days counted from the demo clock, {fmtDate(s.clock, "long")}. Truck eligibility is demo data; the real crew's licence categories were not established. </span>
        <PageLink page="Planning" tab="week">Check the week plan</PageLink>
      </div>
    </Page>
  );
}

