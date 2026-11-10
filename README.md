# Pulse: Reynolds Asphalt Contractors demo

Frontend demo of Pulse (v5 Harbour glass design) re-skinned for **Reynolds Asphalt Contractors** (Naas, Co. Kildare). All operational data, integrations and agent actions are simulated; nothing leaves the browser.

Every page, theme and interaction from the design is here. Screens were checked against the original mockup and match pixel for pixel at 1440×900 and 1024×720.

## Run it

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # type-check + production build into dist/
```

## What's in it

| Area | Where |
| --- | --- |
| Pages: Home (Helios chat), Agents, Dashboard, Work, Records, Activity, Settings | `src/views/pages/` |
| Overlays: ⌘K palette, agent studio, Helios mini chat, work viewer, new record, background gallery | `src/views/overlays/` |
| App frame: sidebar, top bar, notifications | `src/views/AppShell.tsx` |
| State and behaviour | `src/logic/PulseLogic.js` |
| Reynolds fixtures, store, selectors, actions, chat | `src/reynolds/` |
| Reynolds module pages (Jobs, Planning, Fleet, Materials, Finance, Dashboard, Work, Activity, Settings, Agents, Records tabs) | `src/reynolds/pages/` |
| Template data adapted to Reynolds (contacts, files, ontology, agent threads) | `src/logic/data.js` |
| Agent avatar | `src/components/AgentFace.tsx` |
| Theme tokens (Harbour, light and 11 more), animations | `src/styles/pulse.css` |

## How it fits together

- **`PulseLogic`** holds all state. Its `renderVals()` returns one flat object `v`.
- **Views** are plain React components that render from `v`.
- **`LogicHost`** (`src/runtime/logic.tsx`) mounts the logic and re-renders on `setState`.
- **Backgrounds** live in `src/App.tsx`:
  - `dashboardBackdrop`: the colour of the Dashboard KPI background
  - `kpiBackdropOn`: whether that background shows
  - `recordsBackdrop`: the colour of the Records wash (`""` uses the theme gradient)
- **Customising for a client:** read `CLAUDE.md` first. It lists the layout rules every copy keeps.

## Updating from Claude Design

Export the new version, replace the file in `design/`, then run:

```bash
npm run import-design
```

This regenerates:

- `src/views/`
- `src/styles/pulse.css`
- `src/styles/interactions.css`
- `src/logic/`

`AgentFace` is hand-written and left alone. Commit before running, because it overwrites hand edits to those files.

## Fixed from the mockup

In the mockup, the work viewer's wrapper `<div>` was never closed. As a result, the ⌘K palette, agent studio, new record dialog and background gallery could only appear while the work viewer was open. They now open on their own. The fix is applied in `tools/import-design.mjs`.

## Reynolds demo notes

- One fixture set (`src/reynolds/fixtures.ts`) and one store (`src/reynolds/store.ts`). Every number on screen comes from `src/reynolds/selectors.ts`; every state change goes through `src/reynolds/actions.ts`, which appends one linked activity event.
- Demo clock starts at Tue 10 Nov 2026, 07:15 (Europe/Dublin). Change it in Settings → Experience.
- State persists in `localStorage` (key `reynolds-demo`, versioned) only so a refresh keeps the demo; **Reset** (side rail or Settings) restores the canonical baseline.
- Brand colours are a provisional demo palette (themes `reynolds` and `reynolds-light` in `src/styles/pulse.css`), not verified client assets.
