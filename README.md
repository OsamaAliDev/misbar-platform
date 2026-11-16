# مِسبار (Misbar) — Arabic EdTech Platform

> "هنا مش بتتفرج — هنا بتجرب، وبتغلط، وبنقيس فهمك من طريقة تجربتك، مش من إجابتك."

مِسبار منصة تعليمية عربية (RTL) لطلاب المرحلة الإعدادية (١٠–١٤ سنة) تعتمد على التعلم بالتجربة: مكتبة تجارب علمية ورياضية تفاعلية، ومساحة لعب للمحاكاة، ولوحة متابعة للمعلم وولي الأمر.

Built with **Vite + React** (plain, well-commented JavaScript), the Cairo typeface and a strictly flat, locked design system (see [`DESIGN.md`](./DESIGN.md)). Product requirements live in [`PRD.md`](./PRD.md).

## Phase 5A foundation — current branch

Read [`STATUS.md`](./STATUS.md) for verified progress and [`docs/saas/SUPABASE-SETUP.md`](./docs/saas/SUPABASE-SETUP.md) before real Supabase setup. Guests keep local browser progress; school login, classes and rosters use a Node HTTP API with an explicitly labeled local mock or a Supabase transport. Real Supabase Auth/RLS has NOT run without credentials. No subscription gate, payments, parent accounts or analytics are added in this phase.

For local mock development, omit both Supabase variables and run `pnpm dev:api` alongside `pnpm dev`. For the combined production API/client, set the private real Supabase environment, run `pnpm build` then `pnpm start`. A demonstration production mock requires explicit `ALLOW_MOCK=true` and must not be used as a school production database.

## Tech stack (actual)

| Layer | What the code really uses |
| --- | --- |
| Build tool / dev server | **Vite 8** (`vite.config.js`) |
| UI library | **React 19** with plain JavaScript (`.jsx`) — no TypeScript |
| Styling | **Plain CSS** with CSS custom properties (`src/index.css` + one `.css` file per component). **No Tailwind**, no CSS-in-JS, no UI kit |
| Routing | Small hash router in `src/state/navigation.jsx` (`#/`, `#/playground/<id>`, `#/dashboard`) — no React Router |
| State & storage | React context; guest `localStorage` (`misbar:student:v1`), server-canonical child progress and once-only legacy import |
| Simulations | Animated inline SVG driven by `requestAnimationFrame` — no canvas/physics library |
| Fonts & icons | Google Fonts **Cairo** + **Material Symbols Outlined** (loaded in `index.html`) |
| Package manager | **pnpm 11** (pinned in `package.json` → `packageManager`) |
| Backend | Node22 HTTP/Auth/data-access server using built-ins only; local mock or private Supabase Auth/REST transport and forward SQL migration |
| Hosting | Guest-only client can remain static; school-account features require the combined Node API plus `dist/`, not a static-only deployment |

This is **not** a Next.js project, and it does not use Tailwind. Runtime dependencies are only `react` and `react-dom`; dev dependencies are only `vite` and `@vitejs/plugin-react`.

## Delivery batches

| Batch | Scope | Status |
| --- | --- | --- |
| 1 | App architecture (3 views + shared student state) and the complete **Interactive Experiments Catalog** with real-time Arabic search and category filters | Done |
| 2 | Unified interactive **Playground** with 6 real simulations, live Arabic result strip, Nour's challenge bar (+1 star once per experiment) and Nour's Help Modal | Done |
| 3 | Real **Teacher & Parent Dashboard** | Placeholder view |

## Getting started

```bash
pnpm install     # pnpm version is pinned in package.json → "packageManager"
pnpm dev         # http://localhost:3000
pnpm build       # static production build in dist/
pnpm preview     # serve the production build locally
```

Requirements: Node.js 20.19+ (or 22.12+). If pnpm is not installed, run `corepack enable` once, or prefix the commands with `npx pnpm@11.25.0`.

On Windows (PowerShell), for example in `D:\Projects\misbar-platform`:

```powershell
git clone https://github.com/OsamaAliDev/misbar-platform.git D:\Projects\misbar-platform
cd D:\Projects\misbar-platform
corepack enable
pnpm install
pnpm dev
```

### Environment variables

None are required today. [`.env.example`](./.env.example) is a secret-free template: copy it to `.env.local` (git-ignored) only if a future feature needs a setting. Anything prefixed `VITE_` is bundled into the public site, so never put secrets there.

## Project structure

```text
package.json                  scripts + the only 4 dependencies (react, react-dom, vite, plugin-react)
pnpm-lock.yaml                exact dependency lockfile
pnpm-workspace.yaml           pnpm settings (no dependency lifecycle scripts allowed)
vite.config.js                Vite + React plugin, dev server on port 3000
.env.example                  secret-free environment template (no variables required yet)
.gitignore                    node_modules, dist, .env / .env.* (except .env.example)
index.html                    dir="rtl" lang="ar", Cairo + Material Symbols Outlined
public/
  assets/nour.png             «نُور» mascot — transparent PNG extracted from the Stitch kit
  favicon.svg                 brand mark
src/
  index.css                   LOCKED design tokens + flat primitives (.btn, .card, .badge …)
  main.jsx                    entry: StudentProvider → NavigationProvider → App
  App.jsx                     shell: current view (+ shared header outside the Playground),
                              focus & title handling, viewport-fit mode for the Playground
  state/
    navigation.jsx            hash router for the 3 views: catalog | playground | dashboard
    student.jsx               shared student profile (stars, completed challenges) in localStorage
  data/
    experiments.js            the 6 experiments, categories, flat SVG illustrations, search
    guides.js                 Nour's lab titles, 3 help hints, quick fact and challenge per experiment
    avatars.js                geometric student avatars (flat SVG as data)
  lib/
    arabic.js                 Arabic search normalisation + Arabic-Indic number formatting
    storage.js                safe localStorage JSON helpers
    assets.js                 static asset paths
  components/
    PlaygroundView.jsx        unified Playground: header · workspace · challenge bar · help modal
    SimulationWorkspace.jsx   2-column lab layout: controls card | stage + live result strip
    SimulationControls.jsx    purple sliders, toggles, choice pills and quick-action buttons
    ResultStrip.jsx           cyan «النتيجة المباشرة» readings (+ polite screen-reader summary)
    ChallengeBar.jsx          Nour's challenge & tip bar, awards +1 star once per experiment
    HelpModal.jsx             «مساعدة نُور» native <dialog> with 3 tailored hints
    Fraction.jsx              stacked fraction (no RTL ambiguity)
    …                         AppHeader, SearchBar, CategoryFilters, ExperimentCard, Icon …
  simulations/
    index.js                  registry: experiment id → simulation component (+ auto-play)
    SimulationContext.js      contract between the Playground and each simulation
    simulationUtils.js        maths helpers, palette paint(), requestAnimationFrame hook
    MotionSimulation.jsx      F_net = F − μmg, a = F_net / m, cart on a 40 m track
    LeverSimulation.jsx       τ = m·g·d on both sides, damped beam dynamics, balance indicator
    OrbitSimulation.jsx       Kepler T = √(r³/M), v = 29.78·√(M/r) km/s, g = M/r²
    FractionsSimulation.jsx   circle + area grid, gcd simplification, decimal and %
    OpticsSimulation.jsx      reflection, Snell's law, critical angle, Fresnel brightness
    StatesOfMatterSimulation.jsx  particle chamber, latent-heat plateaus at 0 °C and 100 °C
  views/
    CatalogView.jsx           Interactive Experiments Catalog (Batch 1)
    DashboardView.jsx         placeholder → real dashboard in Batch 3
supabase/schema.sql           planned database schema (future batches)
```

## Architecture notes

**Navigation.** `src/state/navigation.jsx` keeps the current view in the URL hash (`#/`, `#/playground/<experimentId>`, `#/dashboard`). Back/forward buttons and refreshes work, and the static build needs no server rewrites. Call `navigate(VIEWS.PLAYGROUND, { experimentId })` from any component through `useNavigation()`.

**Shared student state.** `src/state/student.jsx` exposes `useStudent()` with `{ student, setNickname, setAvatar, addStars, completeChallenge, resetStudent }`. The profile has no personal data: a nickname (default **«بطل الفضاء»**), a geometric avatar, a star balance (default **12**) and the list of experiments whose challenge is done. `completeChallenge(id)` adds +1 star only the first time for each experiment. It is stored under the versioned key `misbar:student:v1` and synchronised across open tabs.

**Catalog.** `src/data/experiments.js` is the single source of the six experiments. Every illustration is flat SVG described as data, and its colours reference locked CSS variables by name, so the drawings can never drift from the palette. Search normalises Arabic text (diacritics, alef/yaa/taa-marbuta forms, Arabic digits), so «الضوء», «ضوء» and «الضَّوء» all match. Search and the category pills combine.

**Responsive.** Desktop (≥ 1024px) uses a 3-column grid inside a centred 1280px container, tablet uses 2 columns and phones (< 600px) use 1. On phones (≤ 480px) the filter pills form an even 2×2 grid, so no label is clipped at 320px or 390px. There is no horizontal scrolling at any width, and every control is at least 44px.

**Playground.** `PlaygroundView` is one layout for all six experiments. It owns the run state (Play/Pause, «إعادة ضبط» remounts the simulation with its defaults) and the challenge bar. Each simulation in `src/simulations/` owns its parameters and physics, draws a flat animated SVG stage in locked palette colours, and returns `<SimulationWorkspace controls stage status readings />`. It reports its challenge condition through `useChallengeReport(met)`. To add an experiment, add it to `experiments.js` and `guides.js`, write its simulation and register it in `simulations/index.js`.

**Playground layout.** On desktop (≥ 1024px wide and ≥ 600px tall) the Playground fits the viewport exactly: header, then controls card | stage + result strip, then the challenge bar, with no page scroll at 1366×768. Below 768px it stacks in one column: stage, results, controls, challenge. Role colours: controls purple (`--accent-tools`), readings cyan (`--accent-info`), help coral (`--accent-help`), stars and completion mustard (`--accent-reward`), primary actions blue.

## November 2026 continuation

The six labs now place the guide challenge above the simulation and allocate the remaining desktop viewport to the workspace; long control content scrolls internally. Game screens feature one selected hero and four compact alternatives. Theme and language controls exist in every header. Explicit theme is saved as JSON `misbar:theme:v1`; otherwise the library/lab/dashboard default to cream and game routes to night. Language uses `misbar:lang:v1`; root direction and locale-aware numbers follow it. Changing language remounts experiment parameters and filters, but not route, hero, stars, missions, outfits or a custom nickname.

Use the pinned installation/build commands above. Reproducible browser checks in `docs/qa_matrix.py` and `docs/qa_flow_current.py` use an external Python Playwright test environment (not an application dependency), with `QA_URL` optionally pointing to a production preview. Evidence is in `docs/qa-matrix.json`, `docs/qa-flow-current.json`, and `docs/screenshots/`. Read `docs/FINAL-REPORT.md` for current verified scope and publication limits; old HANDOFF and older sections are historical snapshots.
