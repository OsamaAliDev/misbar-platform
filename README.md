# مِسبار (Misbar) — Arabic EdTech Platform

> "هنا مش بتتفرج — هنا بتجرب، وبتغلط، وبنقيس فهمك من طريقة تجربتك، مش من إجابتك."

مِسبار منصة تعليمية عربية (RTL) لطلاب المرحلة الإعدادية (١٠–١٤ سنة) تعتمد على التعلم بالتجربة: مكتبة تجارب علمية ورياضية تفاعلية، ومساحة لعب للمحاكاة، ولوحة متابعة للمعلم وولي الأمر.

Built with **Vite + React** (plain, well-commented JavaScript), the Cairo typeface and a strictly flat, locked design system (see [`DESIGN.md`](./DESIGN.md)). Product requirements live in [`PRD.md`](./PRD.md).

## Delivery batches

| Batch | Scope | Status |
| --- | --- | --- |
| 1 | App architecture (3 views + shared student state) and the complete **Interactive Experiments Catalog** with real-time Arabic search and category filters | Done |
| 2 | Real **Playground** (interactive simulation lab with Nour hints) | Placeholder view |
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
  App.jsx                     shell: shared header + current view, focus & title handling
  state/
    navigation.jsx            hash router for the 3 views: catalog | playground | dashboard
    student.jsx               shared student profile persisted in localStorage
  data/
    experiments.js            the 6 experiments, categories, flat SVG illustrations, search
    avatars.js                geometric student avatars (flat SVG as data)
  lib/
    arabic.js                 Arabic search normalisation + Arabic-Indic number formatting
    storage.js                safe localStorage JSON helpers
    assets.js                 static asset paths
  components/                 AppHeader, SearchBar, CategoryFilters, ExperimentCard,
                              FlatIllustration, MascotGreeting, PlaceholderPanel, Icon …
  views/
    CatalogView.jsx           Interactive Experiments Catalog (Batch 1)
    PlaygroundView.jsx        placeholder → real lab in Batch 2
    DashboardView.jsx         placeholder → real dashboard in Batch 3
supabase/schema.sql           planned database schema (future batches)
```

## Architecture notes

**Navigation.** `src/state/navigation.jsx` keeps the current view in the URL hash (`#/`, `#/playground/<experimentId>`, `#/dashboard`). Back/forward buttons and refreshes work, and the static build needs no server rewrites. Call `navigate(VIEWS.PLAYGROUND, { experimentId })` from any component through `useNavigation()`.

**Shared student state.** `src/state/student.jsx` exposes `useStudent()` with `{ student, setNickname, setAvatar, addStars, resetStudent }`. The profile has no personal data: a nickname (default **«بطل الفضاء»**), a geometric avatar and a star balance (default **12**). It is stored under the versioned key `misbar:student:v1` and synchronised across open tabs.

**Catalog.** `src/data/experiments.js` is the single source of the six experiments. Every illustration is flat SVG described as data, and its colours reference locked CSS variables by name, so the drawings can never drift from the palette. Search normalises Arabic text (diacritics, alef/yaa/taa-marbuta forms, Arabic digits), so «الضوء», «ضوء» and «الضَّوء» all match. Search and the category pills combine.

**Responsive.** Desktop (≥ 1024px) uses a 3-column grid inside a centred 1280px container, tablet uses 2 columns and phones (< 600px) use 1. On phones (≤ 480px) the filter pills form an even 2×2 grid, so no label is clipped at 320px or 390px. There is no horizontal scrolling at any width, and every control is at least 44px.
