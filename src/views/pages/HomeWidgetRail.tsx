import { Fragment, type ReactNode } from "react";
import { arr, cat, css, txt } from "../../runtime/template";
import { useDemo, go } from "../../reynolds/store";
import {
  month, scenario, fleet, monthJobs, asphaltOn, receivables, pendingApprovals, readiness, jobById, runs, actorName, personName, today, firstName, nextCriticalDate,
} from "../../reynolds/selectors";
import { FLORIN_DAY } from "../../reynolds/fixtures";
import { eur, fmtDT, fmtDate, rel } from "../../reynolds/format";
import { RecLink, StateBadge } from "../../reynolds/ui";

type Props = { v: any };

/* Home's right widget rail: briefings, decisions, today's crews and prepared agent
   work. Numbers here are the brief, not a dashboard; KPIs live on Dashboard. */
export default function HomeWidgetRail({ v }: Props) {
  const s = useDemo();
  const b = month(s), sc = scenario(s), f = fleet(s), r = receivables(s);
  const live = monthJobs(s).filter((j) => j.status === "Live").length;
  const a11 = asphaltOn(s, "2026-11-11");
  const j104 = jobById(s, "J104")!;
  const r105 = readiness(s, "J105", "2026-11-11");
  const d = today(s);
  const plan = s.plan[d];
  const nextVisit = FLORIN_DAY.find((x) => d + "T" + x.at >= s.clock) || null;
  const appr = pendingApprovals(s);
  const latestRuns = runs(s).slice(0, 4);
  return (
    <>
      <aside className="r-home-rail" style={{"position":"relative","zIndex":"1","width":"352px","flex":"none","minHeight":"0","overflowY":"auto","display":"flex","flexDirection":"column","gap":"14px","padding":"2px 0 6px 20px"}}>
        <div style={{"flex":"0 0 auto","minWidth":"0","overflow":"hidden","display":"flex","flexWrap":"nowrap","alignItems":"center","justifyContent":"space-between","gap":"4px","padding":"2px 0 4px","fontFamily":"var(--mono)"}}>
          {arr(v.flipUnits).map((u: any, i15: number) => (
            <Fragment key={i15}>
              <div style={{"display":"flex","flexWrap":"nowrap","alignItems":"center","gap":"3px"}}>
                {arr(u?.tiles).map((t: any, i16: number) => (
                  <Fragment key={i16}>
                    {t?.isColon && (
                      <div style={{"display":"flex","flexDirection":"column","gap":"3px","padding":"0 1px"}}>
                        <span style={{"width":"2.5px","height":"2.5px","borderRadius":"2px","background":"var(--accent)"}} />
                        <span style={{"width":"2.5px","height":"2.5px","borderRadius":"2px","background":"var(--accent)"}} />
                      </div>
                    )}
                    {t?.isTile && (
                      <span style={css(cat("position:relative;display:flex;align-items:center;justify-content:center;min-width:", t?.w, ";height:", t?.h, ";padding:0 3px;border-radius:var(--r-sm,9px);background:var(--flap);border:1px solid var(--border);box-shadow:0 3px 8px rgba(0,0,0,.4),inset 0 1px 0 rgba(255,255,255,.13);font-size:", t?.size, ";font-weight:500;letter-spacing:-0.3px;color:", t?.color, ";overflow:hidden;perspective:100px"))}>
                        <span style={{"position":"absolute","left":"0","right":"0","top":"50%","height":"1px","background":"var(--flap-hinge)","zIndex":"4"}} />
                        {txt(t?.v)}
                        <span style={css(cat("position:absolute;top:0;left:0;right:0;height:50%;overflow:hidden;background:var(--flap);transform-origin:bottom center;backface-visibility:hidden;z-index:3;display:", t?.flapShow, ";animation:", t?.topAnim))}>
                          <span style={{"position":"absolute","top":"0","left":"0","right":"0","height":"200%","display":"flex","alignItems":"center","justifyContent":"center"}}>{txt(t?.prev)}</span>
                        </span>
                        <span style={css(cat("position:absolute;bottom:0;left:0;right:0;height:50%;overflow:hidden;background:var(--flap);transform-origin:top center;backface-visibility:hidden;z-index:3;display:", t?.flapShow, ";animation:", t?.botAnim))}>
                          <span style={{"position":"absolute","bottom":"0","left":"0","right":"0","height":"200%","display":"flex","alignItems":"center","justifyContent":"center"}}>{txt(t?.v)}</span>
                        </span>
                      </span>
                    )}
                  </Fragment>
                ))}
              </div>
            </Fragment>
          ))}
        </div>
        <div style={{"display":"flex","alignItems":"center","gap":"8px","padding":"0 4px"}}>
          <span style={{"flex":"1","fontFamily":"var(--mono)","fontSize":"9.5px","letterSpacing":"0.12em","color":"var(--faint)"}}>
            {"DEMO CLOCK · " + fmtDT(s.clock).toUpperCase()}
          </span>
          <button className="ixm" onClick={v.toggleBgMenu} title="Change background" style={css(v.bgButtonStyle)}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" style={css(v.bgPlusStyle)}>
              <path d="M12 5v14 M5 12h14" />
            </svg>
          </button>
        </div>

        <Card title="Morning brief" badge={b.gap > 0 ? eur(b.gap) + " short" : "On target"} onOpen={() => go("Agents", "briefing")}>
          <Line k="Forecast operating profit" v={eur(b.op)} sub={"vs " + eur(b.target) + " example target · " + b.progress.toFixed(1) + "%"} onClick={() => go("Finance", "goals")} />
          <Line k="Variation + transport scenario" v={eur(sc.bothOp)} sub="not in the baseline until each step happens" onClick={() => go("Finance", "goals")} />
          <Line k="Live jobs" v={String(live)} sub={b.jobs.length + " November jobs"} onClick={() => go("Jobs", "overview")} />
          <Line k="Owned trucks available" v={f.trucksAvailable + " of 2"} sub={f.trucksAvailable < 2 ? "TRK-02 off the road" : "both available"} onClick={() => go("Fleet", "overview")} />
          <Line k="Asphalt unconfirmed for 11 Nov" v={a11.unconfirmed + " t"} sub={a11.confirmed + " t of " + a11.required + " t confirmed"} onClick={() => go("Materials", "requirements")} />
          <Line k="Overdue" v={eur(r.overdueTotal)} sub={eur(r.openTotal) + " open across " + r.open.length + " invoices"} onClick={() => go("Finance", "receivables")} />
        </Card>

        <Card title="Today on site" badge={fmtDate(d, "dow")} onOpen={() => go("Planning", "today")}>
          {plan ? (["A", "B"] as const).map((c) => {
            const cd = plan[c];
            const j = jobById(s, cd.job);
            const crit = cd.job ? nextCriticalDate(s, cd.job) : null;
            const rd = crit ? readiness(s, cd.job, crit) : null;
            return (
              <Row key={c} title={"Crew " + c + " · " + (j ? j.area + ", " + j.name : "No job")}
                sub={(cd.truck ? cd.truck + " with " + firstName(cd.driver) : "No truck today") + (cd.note ? " · " + cd.note : "")}
                right={rd ? <StateBadge state={rd.overall} /> : null} onClick={() => j && go("Jobs", "detail", { job: j.id })} />
            );
          }) : <div className="r-dim" style={{ fontSize: 12.5, padding: "10px 0" }}>No crew plan for this date.</div>}
          {nextVisit && <Row title={"Florin · " + nextVisit.at} sub={nextVisit.what} onClick={() => go("Planning", "today")} />}
        </Card>

        <Card title="Needs a decision" badge={String(appr.length)} onOpen={() => go("Work", "approvals")}>
          {appr.map((t) => (
            <Row key={t.id} title={t.title} sub={personName(t.owner) + " · due " + fmtDT(t.due)} right={<span className="r-faint" style={{ fontFamily: "var(--mono)", fontSize: 10.5 }}>{t.id}</span>} onClick={() => go("Work", "approvals")} />
          ))}
          {!appr.length && <div className="r-dim" style={{ fontSize: 12.5, padding: "10px 0" }}>Nothing waiting.</div>}
        </Card>

        <Card title="Watch list" onOpen={() => go("Jobs", "overview")}>
          {j104.overrun > 0 && <Row title={<>Margin: <RecLink r={{ kind: "job", id: "J104" }}>J104 Naas distribution yard</RecLink></>} sub={eur(j104.overrun) + " over budget, " + eur(j104.profit) + " gross profit"} right={<StateBadge state="At risk" />} />}
          {r105.blockers.map((x) => (
            <Row key={x.label} title={<>J105 surfacing {rel("2026-11-11", s.clock)}: {x.label.toLowerCase()}</>} sub={x.detail} right={<StateBadge state={x.state} />}
              onClick={() => go("Jobs", "detail", { job: "J105" })} />
          ))}
          {!r105.blockers.length && <Row title="J105 surfacing 11 Nov" sub="Transport and asphalt both in place" right={<StateBadge state="Ready" />} />}
        </Card>

        <Card title="Prepared by agents" onOpen={() => go("Agents", "runs")}>
          {latestRuns.map((x) => (
            <Row key={x.id} title={actorName(x.agent) + ": " + x.result} sub={x.outputs[0]} right={<span className="r-faint" style={{ fontFamily: "var(--mono)", fontSize: 10.5 }}>{x.at.slice(11, 16)}</span>}
              onClick={() => go("Agents", "runs", { run: x.id })} />
          ))}
        </Card>
      </aside>
    </>
  );
}

function Card({ title, badge, onOpen, children }: { title: string; badge?: string; onOpen?: () => void; children: ReactNode }) {
  return (
    <div style={{"background":"var(--surface)","border":"1px solid var(--border)","borderRadius":"var(--card-r,18px)","backdropFilter":"blur(20px) saturate(1.3)","boxShadow":"var(--card-shadow)","padding":"18px 20px 8px"}}>
      <div style={{"display":"flex","alignItems":"center","gap":"10px","marginBottom":"6px"}}>
        <div style={{"flex":"1","fontSize":"13.5px","fontWeight":"500"}}>{title}</div>
        {badge && <span style={{"height":"24px","display":"flex","alignItems":"center","padding":"0 10px","background":"var(--surface-2)","border":"1px solid var(--border)","borderRadius":"var(--r-sm,9px)","fontFamily":"var(--mono)","fontSize":"11px","color":"var(--dim)"}}>{badge}</span>}
        {onOpen && <button type="button" className="r-btn r-btn-quiet r-btn-sm" onClick={onOpen} aria-label={"Open " + title}>Open</button>}
      </div>
      {children}
    </div>
  );
}
function Row({ title, sub, right, onClick }: { title: ReactNode; sub?: ReactNode; right?: ReactNode; onClick?: () => void }) {
  return (
    <div onClick={onClick} className={onClick ? "r-rail-row r-click-row" : "r-rail-row"} role={onClick ? "button" : undefined} tabIndex={onClick ? 0 : undefined}
      onKeyDown={onClick ? (e) => { if (e.key === "Enter") onClick(); } : undefined}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, lineHeight: 1.4, color: "var(--ink)" }}>{title}</div>
        {sub && <div style={{ fontSize: 11.5, color: "var(--dim)", marginTop: 3, lineHeight: 1.4 }}>{sub}</div>}
      </div>
      {right && <div style={{ flex: "none" }}>{right}</div>}
    </div>
  );
}
function Line({ k, v, sub, onClick }: { k: string; v: string; sub?: string; onClick?: () => void }) {
  return (
    <Row title={<span style={{ display: "flex", gap: 10, alignItems: "baseline" }}><span style={{ flex: 1, minWidth: 0, color: "var(--body)" }}>{k}</span><span className="r-num" style={{ fontWeight: 600, color: "var(--ink)" }}>{v}</span></span>} sub={sub} onClick={onClick} />
  );
}
