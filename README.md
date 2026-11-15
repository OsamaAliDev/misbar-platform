# مِسبار (Misbar) — Arabic EdTech Platform

> "هنا مش بتتفرج — هنا بتجرب، وبتغلط، وبنقيس فهمك من طريقة تجربتك، مش من إجابتك."

مِسبار منصة تعليمية عربية (RTL) لطلاب المرحلة الإعدادية (١٠–١٤ سنة) تعتمد على التعلم بالتجربة: مكتبة تجارب علمية ورياضية تفاعلية، ومساحة لعب للمحاكاة، ولوحة متابعة للمعلم وولي الأمر.

Built with **Vite + React** (plain, well-commented JavaScript), the Cairo typeface and a strictly flat, locked design system (see [`DESIGN.md`](./DESIGN.md)). Product requirements live in [`PRD.md`](./PRD.md).

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

## Project structure

```text
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
