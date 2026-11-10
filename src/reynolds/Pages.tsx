/* Mounts the Reynolds module page for the current Pulse page + top-bar tab. */
import JobsPage from "./pages/Jobs";
import PlanningPage from "./pages/Planning";
import FleetPage from "./pages/Fleet";
import MaterialsPage from "./pages/Materials";
import FinancePage from "./pages/Finance";
import DashboardPage from "./pages/Dashboard";
import WorkPage from "./pages/Work";
import ActivityPage from "./pages/Activity";
import SettingsPage from "./pages/Settings";
import AgentsHub from "./pages/AgentsHub";
import RecordsExtra from "./pages/RecordsExtra";
import { resetDemo, toast, useDemo, useUi } from "./store";
import { fmtDT } from "./format";

export default function ReynoldsPages({ v }: { v: any }) {
  useDemo();
  const page: string = v.rPage, tab: string = v.rTab, params: Record<string, string> = v.rParams || {};
  const key = page + ":" + tab;
  switch (page) {
    case "Jobs": return <JobsPage key={key} tab={tab} params={params} />;
    case "Planning": return <PlanningPage key={key} tab={tab} params={params} />;
    case "Fleet": return <FleetPage key={key} tab={tab} params={params} />;
    case "Materials": return <MaterialsPage key={key} tab={tab} params={params} />;
    case "Finance": return <FinancePage key={key} tab={tab} params={params} />;
    case "Dashboard": return <DashboardPage key={key} tab={tab} params={params} />;
    case "Work": return <WorkPage key={key} tab={tab} params={params} />;
    case "Activity": return <ActivityPage key={key} tab={tab} params={params} />;
    case "Settings": return <SettingsPage key={key} tab={tab} params={params} theme={v.theme} setTheme={v.setTheme} />;
    case "Agents": return tab === "threads" ? null : <AgentsHub key={key} tab={tab} params={params} />;
    case "Records": return ["browse", "customers", "suppliers"].includes(tab) ? <RecordsExtra key={key} tab={tab} params={params} /> : null;
    default: return null;
  }
}

/** Discreet global indicator: everything is demo data, with the demo clock and a reset. */
export function DemoPill({ compact }: { compact?: boolean }) {
  const s = useDemo();
  const reset = () => { if (window.confirm("Reset the demo? All simulated changes are cleared and the canonical baseline is restored.")) { resetDemo(); toast("Demo reset to the canonical baseline"); } };
  if (compact) return (
    <span className="r-demo-pill" title={"Demo data · simulated · clock " + fmtDT(s.clock)}>DEMO<button type="button" onClick={reset}>RESET</button></span>
  );
  return (
    <div className="r-demo-card" title="All operational data, integrations and agent actions are simulated">
      <div style={{ minWidth: 0, flex: 1 }}>
        <div className="r-eyebrow" style={{ color: "var(--accent)" }}>Demo data</div>
        <div style={{ fontSize: 12, color: "var(--dim)", marginTop: 3, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{fmtDT(s.clock)} · simulated</div>
      </div>
      <button type="button" className="r-btn r-btn-sm" onClick={reset}>Reset</button>
    </div>
  );
}

export function Toast() {
  const ui = useUi();
  return ui.toast ? <div className="r-toast" role="status" aria-live="polite">{ui.toast}</div> : null;
}
