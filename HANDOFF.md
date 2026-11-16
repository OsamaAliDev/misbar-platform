# Misbar — Phase 3 WIP handoff

Prepared on 16 November 2026 after the owner explicitly stopped implementation because credits were nearly exhausted. **Do not mistake this snapshot for a completed Phase 3.** No Phase 3 fixes or Phase 4 work were performed while preparing this handoff. The one requested production build was run; its real result is below.

## Snapshot and recovery

- Project directory in the original sandbox: `/home/ubuntu/misbar`.
- GitHub repository: https://github.com/OsamaAliDev/misbar-platform
- Handoff branch: `wip-phase3-handoff`.
- Branch link: https://github.com/OsamaAliDev/misbar-platform/tree/wip-phase3-handoff
- Commit subject: `WIP: Phase 3 in progress (handoff)`.
- The handoff commit's full hash is supplied with the ZIP delivery. It is also recoverable from the included `.git` history with `git log -1 --format=%H wip-phase3-handoff`. A commit cannot contain its own hash, so no invented self-referential hash is placed in this file.
- Latest completed phase and `main` at handoff: `752693ffcb5e9da15053bddbab2fc496ae254dca`.
- This snapshot preserves the source exactly where it stopped, plus this handoff and copies of existing evidence. `node_modules` and `dist` are excluded from the ZIP. The five PNG originals, ten WebPs, existing docs, Git history, lockfile and unfinished translations are included. Do not regenerate the heroes.
- Existing external notes, original textual brief, QA scripts and screenshots have been copied into `handoff-evidence/` for recovery. These are preserved evidence, not newly run tests. The pre-existing `docs/screenshots/` contained only the five Phase 1 hero-background screenshots; Phase 2 and Phase 3 screenshots previously existed outside the project and are preserved under `handoff-evidence/screenshots/` instead of silently claiming they had been committed earlier.
- The original dev-server job is stopped. Do not assume Preview is running. Starting a dev server is work for the continuation session, not something done during this handoff.

## A. Status table per phase

| Phase | Status | Completed-phase commit | What was verified and how | What was NOT verified |
| --- | --- | --- | --- | --- |
| 0 — Secure the code and establish actual stack | Done | `6a070980494768a7cff484af2e1822b8f4c24057` | GitHub repository inspected; actual Vite/React/plain-CSS stack documented; `.env.example` present; `.env` ignored; fresh GitHub clone installed with pinned pnpm and built; that clone's production catalog and playground were opened and screens captured. Existing PRD/Supabase scaffolding distinguished from active app. | No backend, Supabase integration or external persistence was implemented or exercised. No exhaustive audit of historic commits' private data. |
| 1 — Character assets | Done | `a5a1b54b420378948ba7f993296e7125312f1303` | Five edited transparent figures inspected on cream and navy, including empty hands, tool straps/pouches and edges. PNGs normalized to 1536×2304; shipped WebPs 600×900 and 69,656–98,752 bytes, below 200 KB. Five full-size evidence images exist in `docs/screenshots/`. | Pixel-identical fidelity to the reference cannot be asserted: figures were AI-edited and reconstructed where obscured. No new outfit art or advanced skeletal animation. |
| 2 — Hero system and game screens | Done | `752693ffcb5e9da15053bddbab2fc496ae254dca` | Production build succeeded. Existing `qa_phase2.py` used running Vite app and Chromium at 1366, 768, 390 and 320 px: first-visit redirect, select/save hero, lobby/vault/ranks, catalog, lab guide bubble and help modal; recorded no page/console errors, missing requests or horizontal overflow. Separate functional checks exercised mission claim from 12 to 14 stars, rank Inventor, persistence, and vault unlock at 16 without spending stars. Screens saved outside repo and now copied to handoff evidence. Deployment overview at handoff reports successful deployment of this SHA. | Full bilingual UI was not completed; public toggle did not exist. No complete fresh-clone Phase 4 acceptance sequence. Mission/rank checks included prepared localStorage state rather than earning every prerequisite solely through UI. README/TODO were not fully brought up to date for new phases. Phase 2 screenshots were not previously in committed `docs/screenshots/`. |
| 3 — English support | In progress | No Phase 3 completion commit. Source was uncommitted on Phase 2 when stopped; preserved by the separate WIP handoff commit identified above. | Translation provider/number formatting existed from Phase 2. Six simulation files and twelve simulation locale files are on disk. Completed Orbit/Fractions subagent reported matching locale shapes, successful build, both-language desktop/mobile interactions and no simulation-owned Arabic in English. The handoff's current `pnpm build` genuinely succeeds (exit 0). | Whole-app runtime is NOT verified or ready. Catalog translation registration/consumers are unfinished. Shared lab controls, help/challenge copy, header labels and document titles remain Arabic. Public toggle, focus recovery, complete mirroring and final language/reload tests are not done. Motion/Lever and Optics/Matter subagents stopped for insufficient credits with saved edits but no final completion report. |
| 4 — Final QA and report | Not started | None | No Phase 4 work performed. Prior phase evidence is preserved only. | Fresh GitHub-main install/build after completed Phase 3; complete UI-earned challenge/star/rank/mission/vault flow; toggle both directions; reload; 404/console audit; wording/image audit; baseline comparison; final required report and final screenshot set. |

The phase hashes are rollback points; never rewrite or force-push their history.

## B. Phase 3 in detail

### B1. Locale files currently on disk

The following exact set exists for **each** of `ar` and `en` under `src/i18n/locales/<language>/`:

```text
catalog.js
common.js
game.js
heroes.js
index.js
lab.js
sims/fractions.js
sims/index.js
sims/lever.js
sims/matter.js
sims/motion.js
sims/optics.js
sims/orbit.js
```

- `common.js`: site name, star plural/count/balance and progress count; already used by game components and shared StarBalance/ProgressBar.
- `game.js`: nav, screen titles, hero select, lobby, missions, rank and outfit text; game components already use translation keys.
- `heroes.js`: bilingual hero names, title/bio and four lines in each of celebrate/encourage/hint/wrong; Nour title reads the constant.
- `lab.js`: shared workspace/results/fraction/header/not-found/challenge/help text; per-experiment guides; `sims` imported from `sims/index.js`. Arabic guides were copied from the old file. English scientific guides include `needs human review` comments.
- `sims/index.js`: maps experiment IDs to the six modules, not the filename itself.
- `catalog.js`: library UI, categories and all six experiment title/description/keywords/illustration text. English scientific copy is marked `needs human review`.
- **Important registration gap:** both language `index.js` files currently export only `{ common, game, heroes, lab }`. `catalog.js` exists but is NOT imported/exported. No `app.js` or dashboard locale module exists yet.

### B2. Per-simulation migration status

“Fully migrated” below means that simulation's own strings, not the shared header/workspace/challenge/help UI around it.

| Simulation / experiment ID | Source file | Classification at handoff | Exact limits |
| --- | --- | --- | --- |
| Motion / `motion-acceleration` | `src/simulations/MotionSimulation.jsx` | Partially migrated (source migration appears complete; final validation/completion unconfirmed) | `useI18n()` and `lab.sims.motion-acceleration.*` used; ar/en `sims/motion.js` populated. No Arabic-bearing executable lines found in this file in the handoff source scan (Arabic in comments remains). Desktop/mobile ar/en screenshots saved. Subagent reached status-branch tests but failed for credits before a final report. Do not redo migration blindly; check current code and existing evidence first. |
| Lever / `lever-balance` | `src/simulations/LeverSimulation.jsx` | Partially migrated (source migration appears complete; final validation/completion unconfirmed) | `lab.sims.lever-balance.*`, populated ar/en `sims/lever.js`; no Arabic-bearing executable lines in this file. Four screenshots saved; no final report because the same subagent ran out of credits. Physical left/right semantics must not mirror with page layout. |
| Orbit / `planet-orbits` | `src/simulations/OrbitSimulation.jsx` | Fully migrated for simulation-owned strings | ar/en `sims/orbit.js`; completed subagent reported successful Vite build, both languages at 1366×768/390×844, interactions, all star status branches, equal key shapes, no missing-key/console/page errors or English simulation-owned Arabic, and visual no-clipping checks. Shared surrounding UI remains unfinished. |
| Fractions / `fractions-area` | `src/simulations/FractionsSimulation.jsx` | Fully migrated for simulation-owned strings | ar/en `sims/fractions.js`; same completed report, including status/counting/empty branches and interactions. **Shared `Fraction.jsx` still gives Arabic aria-labels** in English, including stacked fraction results and presets. Shared ResultStrip/Workspace remain unfinished. |
| Optics / `light-refraction` | `src/simulations/OpticsSimulation.jsx` | Partially migrated | `lab.sims.light-refraction.*`; populated ar/en `sims/optics.js`; no Arabic-bearing executable lines in this file. Agent encountered an absent simulation DOM / English runtime error during tests, made a decimal-formatting correction, then began rerunning deterministic tests before credit failure. Only Arabic optics screenshot files are present; no final successful English verification report was delivered. Exact unresolved browser error is not retained in the job status card, so do not invent it. |
| Matter / `matter-states` | `src/simulations/StatesOfMatterSimulation.jsx` | Partially migrated | `lab.sims.matter-states.*`; populated ar/en `sims/matter.js`; no Arabic-bearing executable lines in this file. Agent stopped before full final verification/report. No matter screenshots are present in the saved Phase 3 screenshot directory. Code presence is not a verified end-to-end result. |

### B3. Remaining hardcoded Arabic / text dependencies

Counts are approximate **Arabic-bearing non-comment lines**, not a parser-perfect string count. They include repeated aria text. Counts do not count words obtained indirectly through stale fields. A read-only source scan was performed during handoff.

| Path | Approximate count | Remaining work |
| --- | ---: | --- |
| `src/App.jsx` | 3 | Browser titles for catalog, playground fallback and dashboard; playground title still reads removed `experiment.title`. |
| `src/components/AppHeader.jsx` | 3 | Lobby link title/aria label and teacher/parent button; nickname display also needs handling. |
| `src/components/BrandMark.jsx` | 1 | Arabic wordmark should use `common.siteName`. |
| `src/components/MascotGreeting.jsx` | 5 | Desktop greeting, hero/lobby accessible text, strip label/body/lobby link. |
| `src/components/SearchBar.jsx` | 3 | Search label, placeholder, clear aria label. |
| `src/components/CategoryFilters.jsx` | 1 direct + stale label dependency | Group label plus deleted `category.label` read. Translate category names and All count. |
| `src/components/ExperimentCard.jsx` | 2 direct + stale data dependencies | Difficulty aria text, start CTA; removed title/description/category label/illustration label still read. |
| `src/views/CatalogView.jsx` | 11 | Plural/result sentence, heading, grid label, empty title/body/reset. Search call also uses old signature. |
| `src/components/ChallengeBar.jsx` | 7 | Completed/met sentences, hero tip/title and three buttons. |
| `src/components/HelpModal.jsx` | 5 direct + old guide dependencies | Hero title, close aria, fact aria/title, confirm button; imports old `HINT_TITLES` and reads old guide props. |
| `src/components/PlaygroundView.jsx` | 7 direct + old guide/data dependencies | Not-found props, back label, star aria/unit, help button; title/category read deleted fields; guide still comes from `data/guides.js`. `PlaygroundHeader` is inside this same file, NOT a separate module. |
| `src/components/SimulationWorkspace.jsx` | 4 | Control title, play/pause line (two alternatives), reset and stage aria. |
| `src/components/ResultStrip.jsx` | 2 | Live results heading and Arabic summary separator. |
| `src/components/Fraction.jsx` | 1 | Spoken “numerator over denominator” aria label. |
| `src/components/PlaceholderPanel.jsx` | 2 | Coming-soon badge and back label. |
| `src/views/DashboardView.jsx` | 3 | Eyebrow, title and coming-soon message. |
| `src/data/guides.js` | 61 Arabic-bearing lines / approximately 63 scalar strings | HINT_TITLES plus six guides; duplicated in new ar/lab.js. Rewire consumers before removing this file. |
| `src/data/avatars.js` | 4 | Geometric avatar labels. Currently Avatar renders aria-hidden geometry, but remove unused UI-copy data or put labels in locales if retained. |
| `src/state/student.jsx` | 1 | Default nickname `بطل الفضاء`. Preserve existing stored nickname; translate only the default display, not a user-written nickname. |
| `src/lib/arabic.js` | 4 user-facing strings | Arabic-only `formatStarCount()`. Five extra Arabic-bearing lines are necessary normalization regex/replacements, NOT UI strings. Preserve those. |
| `src/data/heroes.js` | 1 intentional exception | `NOUR_TITLE.ar` is the explicit single-constant requirement, not an accidental missing migration. |

`src/data/experiments.js` has already had titles, descriptions, keywords and category labels removed. Its geometry now uses `textKey` for heavy/light/result/temperature labels. It exposes `getExperimentCopy(t,id)`, `getCategoryLabel(t,id)`, `buildSearchIndex(t)` (Map) and `filterExperiments(experiments, filters, searchIndex)`. **No consumers were rewired yet.** `FlatIllustration.jsx` still understands only `shape.text`, not `textKey`/localized `texts`. Formula symbols `m` and `F = m × a` are intentionally language-neutral.

Also review default Arabic HTML metadata in `index.html`, route titles in `public/manus-routes.json`, and any remaining Latin UI strings rather than treating an Arabic-only grep as a complete text audit. Comments and older documentation have not had the final content-rule audit. No simulation logic should be changed as part of text migration.

### B4. Subagents and their outputs

All three edited the shared sandbox directly. There was no merge branch to import; their on-disk files are already included. No agent commit/push occurred.

- `job_dxZM20s8`: Motion + Lever, restricted to the two simulation JSX files and their four locale files. **Failed: creditNotEnough**, 325 seconds, stopped at 00:26:54 UTC on 16 November. Source and locale edits survived; screenshot evidence survived. Final validation and final response did not. Status card says it reached bilingual screenshot inspection, English status branches, whitespace/scope checks and another fresh-load motion status check. Treat completed-looking code as unconfirmed, not lost.
- `job_kmfxMwbc`: Orbit + Fractions, same six-file scope. **Completed**, 298 seconds, at 00:26:27 UTC. Its report is preserved in `handoff-evidence/subagents/orbit-fractions-report.md`; it explicitly flags shared Fraction/Workspace/ResultStrip limitations. Source and evidence are included.
- `job_92T8OaeK`: Optics + Matter, same six-file scope. **Failed: creditNotEnough**, 325 seconds, at 00:26:54 UTC. Source and locales survived. Last activities: diagnose missing English optics DOM/error, fix decimal degrees, inspect run-state initialization, then rerun browser verification. No final success report and no English optics/matter screenshot evidence available.

The failed-job activity files only list tool steps, not full tool outputs; they are preserved with this limitation. Do not claim the lost final reports exist. The original sandbox's media jobs were already completed; no pending character generation should be restarted.

### B5. Language switch / header status

| Feature | Status | Evidence / exact gap |
| --- | --- | --- |
| Tiny helper / `t()` / dictionaries | Done in code | `src/i18n/index.jsx`; Arabic fallback, dot paths, `{name}` interpolation, function plural entries, arrays/objects returned unchanged. Catalog registration missing. |
| `dir` and `lang` on `<html>` | Done in code; full UI incomplete | `applyLanguage()` sets Arabic rtl/ar and English ltr/en and number locale synchronously; provider reads storage before first render. Game/Orbit/Fractions English test evidence exists, but no final whole-app switch-flow test. |
| Language persistence | Done in code; final toggle/reload sequence NOT verified | Key `misbar:lang:v1`, JSON `"ar"` or `"en"`, safe read/write helpers, storage-event tab synchronization. Public button cannot exercise it yet. |
| App remount on language change | Done | `src/main.jsx` renders `<App key={lang}/>` with student/navigation providers above it, so route and student state survive. Catalog filter state and simulation run/parameter state live inside App and reset on a language remount. |
| Public language-toggle button | Not started | No `LanguageToggle.jsx`, no `id="lang-toggle"`, no header toggle UI. Planned button displays other language and uses its own `lang` attribute. |
| Focus recovery after language remount | Not started | Planned module-level flag retained across keyed App remount, then refocus `#lang-toggle` in the newly mounted header. Must test keyboard access. |
| AppHeader Phase 3 updates | Not started | Phase 2 hero links/StarBalance are present; Arabic text and no toggle remain. |
| GameHeader Phase 3 updates | Partial | Existing game nav/library are translated; BrandMark remains Arabic; toggle absent. |
| PlaygroundHeader Phase 3 updates | Not started | Inner component in `components/PlaygroundView.jsx`; no toggle, Arabic labels, stale experiment title/category fields. |
| Layout/icon/progress/slider mirroring | Partial | Logical CSS and `.icon--dir` exist from Phase 2; shared back arrows and speech-bubble/search positions still need auditing. No final bilingual 390 px comparison. Simulation geometry must keep physical orientation. |

### B6. Current build — actual result

Executed `pnpm build` in `/home/ubuntu/misbar` on 16 November 2026 during handoff. **Exit code 0; no build errors.** Full preserved log: `handoff-evidence/handoff-build.log`.

```text
$ vite build
vite v8.3.8 building client environment for production...
transforming...
✓ 117 modules transformed.
rendering chunks...
computing gzip size...
dist/index.html                   1.95 kB │ gzip:   1.09 kB
dist/assets/index-CwlEqMij.css   54.81 kB │ gzip:   9.38 kB
dist/assets/index-BHt2g9qF.js   370.47 kB │ gzip: 114.18 kB
✓ built in 678ms
```

This is an existing-dependencies compilation check, NOT a fresh install, runtime acceptance, English certification or deployment. The catalog can still fail on non-empty search: its caller supplies no searchIndex, while `filterExperiments()` now uses `searchIndex.get()`. Empty search skips that callback but missing labels/titles/descriptions remain. This is a concrete source-level mismatch, not a browser test run during handoff. Do not “repair” the snapshot before recovering it.

## C. Remaining work — exact continuation order

1. [ ] Read this file and `handoff-evidence/original-brief.md`; inspect `git status`, branches/remotes and current SHA. Install locked dependencies only if needed, then run build. Preserve the WIP branch; do not reset to Phase 2 or overwrite saved agents' edits. Set up existing managed diagnostics before editing in a new Manus session.
2. [ ] Register `catalog` in `src/i18n/locales/ar/index.js` and `en/index.js`. Add the missing shell/dashboard strings in matching locale modules (planned `app.js`) or consistently in existing common modules; do not create a new dependency.
3. [ ] Complete the catalog rewiring as one coherent change: `components/FlatIllustration.jsx` receives a localized text map, consumes `textKey` without passing it as an SVG DOM attribute; `ExperimentCard.jsx` reads `getExperimentCopy(t,id)` and category label; `CategoryFilters.jsx` reads translated names/All count; `SearchBar.jsx` translates labels/placeholder; `views/CatalogView.jsx` builds a memoized per-language search Map with `buildSearchIndex(t)` and passes it to `filterExperiments()`, translates plural/empty state and grid text. Validate both Arabic-normalized and English searches. Do not restore hardcoded data fields as a shortcut.
4. [ ] Rewire shared lab data and copy: `components/PlaygroundView.jsx` reads localized experiment/category and `lab.guides.<id>`; `HelpModal.jsx` uses `lab.help.hintTitles` and all shared labels; `ChallengeBar.jsx`, `SimulationWorkspace.jsx`, `ResultStrip.jsx` and `Fraction.jsx` consume already-written shared lab strings. Retain throttled announcements, native dialog focus behavior and star-completion reducer semantics. Remove `src/data/guides.js` only after all references are removed; verify Arabic guide copy unchanged.
5. [ ] Finish shell/default-name text: `AppHeader.jsx`, `MascotGreeting.jsx`, `BrandMark.jsx`, `PlaceholderPanel.jsx`, `views/DashboardView.jsx`, `App.jsx` document titles and `views/game/LobbyView.jsx` nickname. Add `common.defaultNickname` and a display helper for the saved default only; never translate/rewrite a custom child nickname. Move/remove unused `data/avatars.js` labels appropriately; replace Arabic-only `formatStarCount()` consumers with locale plural helpers. Do not damage normalization regexes or the required `NOUR_TITLE` constant.
6. [ ] Inspect and finish only missing subagent work. Start with Optics/Matter English runtime and key shapes; then Motion/Lever unfinished status checks. Keep Orbit/Fractions migrated code and existing screenshots rather than recreating them. **Leftover note: after the subagents, check matter-simulation heat/cool English button labels against the English guide tip ("heat and cool buttons").** Current `en/sims/matter.js` uses `Heat {value}{degree}` / `Cool {value}{degree}`; confirm rendered text matches the guide. Also align Motion's `status.ready` “Run” with the planned shared English `workspace.play` “Play”. Keep `needs human review` comments on scientific copy.
7. [ ] Create `components/LanguageToggle.jsx` (+ plain CSS if needed), using provider's `toggleLang()`/`setLang()`, target-language text and `lang` attribute, 44 px touch target. Insert in `AppHeader.jsx`, `GameHeader.jsx`, and **the inner PlaygroundHeader in `components/PlaygroundView.jsx`**. **Implement the module-level flag to refocus after remount:** remember a toggle-initiated switch outside the keyed App, then focus the newly mounted `#lang-toggle`; consume/reset the flag so unrelated navigation does not steal focus. No library.
8. [ ] Finish direction handling at the actual source: `.icon--dir` on navigation/back arrows; `SearchBar.css` hard right offset that was originally fixed for RTL icons; speech-bubble tail; physical versus logical properties in header/cards; sliders and ProgressBar direction. Keep science SVG geometry unchanged and verify anchors/unit direction, especially Optics and Lever physical left/right labels. Keep cream/night scopes and accent roles exactly.
9. [ ] Run the missing Phase 3 checks on a running app at 390 px in BOTH languages, desktop regression where needed, all six deep links, help/challenge copy, switch both directions and reload, no missing keys or source strings. Preserve route/student state; document intentional remount state resets. Fix only verified gaps. Save required screenshots to `docs/screenshots/`, update DECISIONS/README/TODO for the actual new work.
10. [ ] Commit completed Phase 3 with a clear message. Fetch and integrate latest remote `main` preserving both sides; fast-forward push to GitHub `main` and (if still this same Manus-managed project) canonical `origin/main`. Never force-push. Keep `wip-phase3-handoff` as the rollback snapshot. Confirm checkpoint/publication according to the platform guidance and current auto-publish setting, not merely Git exit zero.
11. [ ] Only THEN start Phase 4: fresh clone of GitHub `main`, pinned clean install/build; run the entire first-visit → hero → lobby → experiment end-to-end → star earning → rank → mission claim → vault unlock flow, language switch both ways and reload. Check console/errors/404s, source text and imagery content rules, and cream catalog/lab against preserved pre-brief baseline. Separate seeded-state tests from genuinely UI-earned end-to-end evidence.
12. [ ] Produce the final requested report: phase hashes + links; Verified/NOT verified table; every DECISIONS judgment call; full-size screenshots (five hero background checks, hero select, lobby ar/en, vault, ranks, lab guide bubble, catalog ar/en at mobile width); known problems and decisions for the owner. Ensure screenshots really exist in committed `docs/screenshots/`.

## D. Architecture notes for a new session

### Actual stack and run commands

Static **Vite + React + JavaScript + plain CSS**, not Next.js, not TypeScript app code, not Tailwind. `app.config.ts` is a small platform branding metadata file only. `supabase/schema.sql` and `PRD.md` are preserved scaffold/docs, not an active backend. No database/server features are enabled. No required environment variables; `.env.example` documents this without secrets.

`package.json` pins the package manager to `pnpm@11.25.0`; dependencies are React/ReactDOM, development dependencies are Vite and its React plugin. Exact installed resolutions are in `pnpm-lock.yaml`. Existing Vite 8 requires a sufficiently recent Node (README gives Node 22.12+ / 24).

```sh
npx -y pnpm@11.25.0 install --frozen-lockfile
npx -y pnpm@11.25.0 run build
npx -y pnpm@11.25.0 run dev
```

Vite listens on `0.0.0.0:3000` with strictPort. In Manus, run commands with `cwd` set to the bound absolute project directory; start a dev server as a resident service and health-check it. Do not start this while merely reading the handoff.

### Folder responsibilities

```text
src/
  main.jsx                  providers; keyed App remount by language
  App.jsx                   view dispatch, first-visit redirect, theme, tab titles
  index.css                 locked cream palette + one scoped night block
  App.css                   app shell/layout
  i18n/index.jsx            I18nProvider, useI18n, translate
  i18n/locales/ar|en/        per-area locale modules + sims/*
  config/game.js            rank thresholds, missions, outfit slots
  data/experiments.js       six experiment identities, categories, flat geometry, search helpers
  data/heroes.js            hero IDs/images/tones; NOUR_TITLE
  data/avatars.js           geometric avatar shape data
  data/guides.js            OLD Arabic guide copy; pending consumer migration/removal
  state/navigation.jsx      URL hash parser/buildHash, NavigationProvider/useNavigation
  state/student.jsx         validated persisted profile, star/challenge/mission/outfit reducer
  state/guide.js            chosen hero and rotating translated guide-line hooks
  lib/storage.js            safe JSON localStorage wrappers
  lib/arabic.js             Arabic search normalization, locale-aware Intl numbers
  lib/assets.js             old decorative star-mascot file URL
  components/               shared cream/game UI, lab shell/modal/challenge
  simulations/              six numerical simulations + registry/context/helpers
  views/CatalogView.jsx     library search/filter/grid/empty state
  views/DashboardView.jsx   intentional teacher/parent coming-soon placeholder
  views/game/               HeroSelectView, LobbyView, VaultView, RanksView + plain CSS
public/
  heroes/                   five 600×900 full-body WebPs + five 160×160 face WebPs
  assets/nour.png           old star mascot, retained as decoration only
  manus-routes.json         complete website route declarations
  favicon.svg
assets-src/heroes/          five transparent 1536×2304 PNG originals; outside public, not shipped
docs/screenshots/          existing Phase 1 evidence
handoff-evidence/          copied historic notes/scripts/screens; build log; brief; agent status
```

### Routing, data and text APIs

- Hash routes: `#/catalog` (root also resolves to catalog), `#/playground/<experimentId>`, `#/dashboard`, `#/heroes`, `#/lobby`, `#/vault`, `#/ranks`. Use `buildHash`, `VIEWS`, `useNavigation`. Manifest is `public/manus-routes.json`.
- No chosen hero: catalog/lobby/vault/ranks redirect with URL replace to heroes. Direct lab/dashboard links are not interrupted; guide falls back to Nour.
- Student default: nickname `بطل الفضاء`, geometric rocket avatar, 12 stars, empty completedChallenges/claimedMissions/unlockedOutfits, heroId null.
- **Storage keys:** `misbar:student:v1` (JSON profile) and `misbar:lang:v1` (JSON string `"ar"`/`"en"`). Hash is route state, not another storage key. Student lists are validated, deduplicated and bounded; use existing reducer methods `chooseHero`, `completeChallenge`, `claimMission`, `unlockOutfit` rather than duplicate balances/progress.
- Each experiment challenge awards +1 once; missions read the same `completedChallenges` list. First discovery requires 1 challenge (+2); two-experiments requires 2 (+3); science-tour requires physics+math+astronomy (+5). Maximum total now 28 = 12 + 6 + 10.
- Ranks/config: `src/config/game.js`: Young Explorer 0, Inventor 14, Lab Captain 18, Discovery Commander 23, Master Scientist 28. Rank names/mission copy are in `game.js` locale entries keyed by their IDs.
- Outfits in same config: slot1 free/current image; slots2/3/4 thresholds 16/22/28. Unlocking does NOT spend stars. Unlock key `heroId:slot`; no new art, only placeholders.
- `src/data/heroes.js` exports `HEROES`, `getHero`, default guide ID, explicit image dimensions and `NOUR_TITLE = { ar: 'بطل مِسبار', en: 'Misbar Hero' }`. Both hero locale files read the title constant. Do not duplicate/change it elsewhere.
- Guide hook: `useGuide()` resolves stored hero to local name/title; `useHeroLine(heroId,situation,trigger)` rotates among locale hero lines on trigger changes.
- Translation key convention: `common.starCount`, `game.nav.lobby`, `game.titles.heroes`, `heroes.lubna.lines.celebrate`, `catalog.experiments.motion-acceleration.title`, `catalog.categories.physics`, `lab.guides.motion-acceleration.challenge.prompt`, `lab.sims.motion-acceleration.controls.pushForce`. Helpers return whole objects/arrays when addressed. Do NOT invent i18next APIs: custom `t(key,vars)` interpolates single-brace `{name}` placeholders and invokes dictionary functions for pluralization.
- `formatNumber`/`formatDecimal` use current module-level number locale, set before rendering by I18nProvider. Arabic numbers are Arabic-Indic, English Western. Do not manually concatenate RTL-sensitive fraction strings; the Fraction component stacks them and its spoken label needs migration.
- Simulations use `SimulationContext` for running/reset/challenge condition reports, `simulationUtils.js` for numerical helpers and animation frames. Keep their physics/math logic unchanged. Components remain unstyled by third-party UI libraries.

### Design/theming

Cream tokens are in `src/index.css`. Night tokens are one `[data-theme="night"]` block in that same file: base #141A2E, card #1D2540, subtle #252E4D, outline #34406A, text #F6F1E9/#B8BDD6. Only `App.jsx` game wrapper receives the night attribute; catalog, lab and dashboard remain cream. `body:has(...)` darkens page edges with a wrapper fallback. Accent main colors/roles remain unchanged.

Global CSS imports precede App/component imports intentionally. `.icon--dir` mirrors direction-dependent glyphs for LTR; it does not mirror simulation drawings. Icons are Material Symbols Outlined loaded as a subset in `index.html`; preserved `handoff-evidence/scripts/sync_icons.py` updates the subset if needed. Cairo is the only font.

## E. Judgment calls and known problems

### Complete copy of DECISIONS.md

The following is copied verbatim from the existing file. References to removed source gear are historic documentation, not permission to introduce such imagery or wording into the product. The original brief's content audit is still outstanding.

# DECISIONS.md

Each line records one judgment call I made that the brief did not specify: what I chose and why. If a step was blocked, the safe default I used is logged here too.

## Phase 1: Character assets

- **Isolation method:** I cropped each hero from the source image, upscaled it 3× (Lanczos), then ran one AI image edit per hero with a transparent background. The prompts said to preserve face, hair, skin, outfit, colours and render style exactly. Plain background removal could not rebuild the legs hidden behind the name plates or the body hidden behind the removed source prop.
- **One pass per hero, no re-rolls:** I accepted the first result for all five, after checking them on cream and dark navy. Re-generating risks drifting away from the original faces.
- **Lubna's strap:** the source chest strap became a plain olive fabric strap with no decorative inserts. Lubna's thigh accessory also became a closed rectangular tool pouch, under the rule that unsuitable gear becomes a neutral tool.
- **Thigh accessories → closed pouches for Shihab, Suhail and Sharara:** their accessory shapes could read as unsuitable gear, so each became a closed rectangular utility pouch.
- **Flames and energy streaks removed:** this covers Sharara's shoulder and hand flames, Shihab's wrist flames and the glow trail from the removed source prop. They count as fire or scene effects, which the brief says to remove. Sharara's orange lava-crack *print* on her outfit stays, because it is part of her outfit design.
- **Glowing parts kept:** Nour's glowing chest emblem and gauntlets, Shihab's glowing jacket lines, gloves and visor, and Suhail's chest light are all kept, because they are outfit design, not scene effects.
- **Common framing:** every figure is trimmed and placed on the same 1536×2304 (2:3) transparent canvas. They all share the same head-room (3%) and foot baseline (2%), so heroes can swap places in the UI without jumping.
- **Halo prevention:** the colour channels of fully transparent pixels are zeroed before resizing, so no light fringe appears on dark backgrounds.
- **Original size 1536×2304:** this meets the "at least 1024×1536" rule and is the edit tool's native 2:3 output, so it was never upscaled after editing.
- **WebP at 600×900, quality 86, alpha quality 90:** each file is 68–97 KB, well under 200 KB, with no visible alpha banding.
- **`/assets-src/heroes/` sits outside `/public`:** Vite never copies it into `dist/`, so the originals are versioned but not shipped.
- **Evidence images:** each `docs/screenshots/p1-*-hero-*.png` shows the *shipped WebP* twice, on cream and on dark navy, so edge quality can be checked against both.

## Phase 2: Hero system and game screens

- **Rank thresholds (all in `src/config/game.js`):** Young Explorer 0, Inventor 14, Lab Captain 18, Discovery Commander 23, Master Scientist 28. Today a student can earn at most 28 stars (12 starting + 6 challenges + 10 from missions), so the first rank-up comes after one or two challenges and the top rank needs everything.
- **Missions (same file):** "first discovery" (1 challenge, +2 stars), "busy scientist" (2 challenges, +3), "science tour" (one challenge each in physics, maths and astronomy, +5). They read the existing `completedChallenges` list that already awards the lab's +1 star, so progress is not stored twice. Each is one-time, with a claim button, and the reducer refuses a second claim.
- **Outfit costs:** slot 1 is free (the current outfit). Slots 2, 3 and 4 unlock at 16, 22 and 28 stars. **Unlocking does not spend stars.** Stars also drive the rank, so spending them would make a student drop a rank. An unlocked slot says the design is coming soon, because the brief forbids new outfit art.
- **Hero colours:** each hero takes one existing accent for their own badge, ring and stage only, never for actions: Lubna purple, Shihab blue, Suhail cyan, Sharara coral, and Nour mustard (the brief gave none for Nour; mustard matches his gold armour).
- **Nour's title** is the single constant `NOUR_TITLE` in `src/data/heroes.js` ("بطل مِسبار" / "Misbar Hero"). Both language files read it from there.
- **First visit:** with no hero chosen, the catalog, lobby, vault and ranks show hero select immediately and replace the URL with `#/heroes`, so the back button does not loop. A direct link into a lab experiment or the dashboard is not interrupted, and the guide there falls back to Nour.
- **Hero select uses native radio inputs** (visually hidden inside each card label), so arrow keys, focus and screen-reader roles come from the browser. A choice is saved the moment it is made, and the continue button opens the lobby.
- **Idle motion:** a slow CSS "breathing" scale anchored at the feet, staggered per hero, plus one gentle bounce when a hero is picked. The global reduced-motion rule turns both off.
- **Night palette (one block in `src/index.css`):** canvas #141A2E, card #1D2540, subtle #252E4D, outline #34406A, text #F6F1E9 / #B8BDD6. The five accent colours and their roles are unchanged. Only their soft tints and "-text" colours are re-mapped, so they stay readable on navy.
- **Theme scope:** `data-theme="night"` sits on the game-screen wrapper. `body:has([data-theme="night"])` darkens the page edges too, and the wrapper paints its own background for browsers without `:has()`.
- **Two new shared tokens:** `--accent-primary-hover` (the existing #1B5E99, previously borrowed from `--accent-primary-soft-text`) and `--text-on-reward` (#2B2824, text on a solid mustard button). They exist because the night theme re-maps those soft-text colours, which would otherwise change the cream buttons' hover and text. The cream values are identical to before.
- **Where the guide hero appears:** catalog greeting (header badge on desktop, strip on smaller screens), lab challenge bar (speech bubble: "hint" tip when idle, "wrong" on a failed check, "celebrate" when the goal is met or claimed, "encourage" once already done), help modal (header avatar and a "hint" line), and the lobby ("encourage"). A different line is picked each time, so feedback does not repeat.
- **Lobby links:** the student chip in the catalog header and the greeting badge or strip both open `#/lobby`. The game screens share one header with four tabs (lobby, heroes, vault, ranks), the star counter and a library link. On phones the tabs sit in a 4-column row with no scrolling.
- **Old star mascot:** `public/assets/nour.png` is kept and no longer used as the guide anywhere. It remains only as the decorative picture on the teacher-dashboard placeholder and the "experiment not found" panel, which are not guide roles.
- **Round face crops:** `public/heroes/<id>-face.webp` (160×160, 9–13 KB) are cut from the same shipped WebPs. Small avatars therefore never download the 600×900 body image, which keeps phones fast.
- **Mission status is a label, not a button:** "still working on it" is a small dashed pill. Only "claim the stars" is a real (mustard) button.

### Additional known problems / uncertainties

1. **Current compile success does not mean catalog works.** Locale modules are unregistered and consumers use deleted `experiment.title`, description, category.label and art.label. Search fails by source inspection when non-empty terms call `.get()` on undefined searchIndex. Card art textKey is unsupported by current FlatIllustration. These are intentionally preserved WIP issues.
2. Document/lab/help titles are stale or undefined where old experiment fields were removed. Shared Arabic labels remain in English.
3. Optics English tests encountered a runtime problem before agent failure; the exact underlying error is not available in saved status output. Do not report it fixed without rechecking. Matter verification is incomplete.
4. Public language-toggle UI and remount focus recovery do not exist. Default stored nickname remains Arabic in English. User-written nickname must not be translated.
5. Current English scientific wording requires human review. Shared Motion “Run” versus workspace “Play” and Matter Heat/Cool wording need consistency checks.
6. `DECISIONS.md` and some source comments retain historical prohibited-word references (e.g. the phrase “discovery-focused” or descriptions of source gear). Full policy wording audit was never completed; document/source inclusion here is lossless preservation, not certification.
7. Old star mascot remains only decorative in placeholders, not in the guide role. Teacher/parent dashboard is still deliberately a placeholder; do not build an unrequested dashboard in Phase 3/4.
8. Phase 2 test evidence was outside committed screenshots. This handoff preserves it under evidence; final-report images still must be placed in `docs/screenshots/` during completion.
9. Existing README batch table/TODO do not represent the entire Phase 1–4 status. Use this handoff and actual source instead. Preserved old PRD/Supabase documents must not trigger a stack migration.
10. Historic Git author/email settings contained a garbled email. Local future-commit identity was corrected to OsamaAliDev / `270765662+OsamaAliDev@users.noreply.github.com`; history was not rewritten.
11. The generated heroes were accepted after one edit each; reconstruction was necessary for hidden lower bodies. No guarantee of pixel-perfect equality to the source. Do not spend credits redoing approved assets.

## F. Deployment and exact redeployment steps

Published URL supplied by owner: **https://misbar-zrxurzxq.manus.space**.

At handoff, the read-only platform deployment overview returned:

```json
{"runtime":{"deployStatus":"success","deployRevision":"752693ffcb5e9da15053bddbab2fc496ae254dca"}}
```

GitHub `commits/main` returned exactly the same full SHA. Therefore the **published revision matches latest main (Phase 2)** at the time of inspection; it does **not** include the Phase 3 WIP. No new publication was requested during handoff. The URL was not browser-retested during handoff; version identity is platform evidence, not a new public acceptance check.

This original Manus project uses **Manus canonical Git**, not GitHub canonical. In the original working copy, `origin` is the platform remote; `github` is `https://github.com/OsamaAliDev/misbar-platform.git`. They were kept in sync on main by explicit pushes. A fresh GitHub clone will instead have GitHub as `origin`, so inspect remotes before any command and never replace a platform binding by guessing.

Read configuration at handoff:

```json
{
  "build": {
    "command": "npx -y pnpm@11.25.0 install --frozen-lockfile && npx -y pnpm@11.25.0 run build",
    "outputDirectory": "dist"
  },
  "features": {"database": false, "server": false},
  "runtime": {"port": 3000},
  "publishing": {"auto_publish": true}
}
```

Redeploy only after finished Phase 3/4 is genuinely ready and publication remains authorized:

1. Continue from the WIP branch and finish/check code; fetch latest GitHub main and integrate with normal merge/fast-forward preserving unrelated changes. Do not force/reset.
2. Commit completed Phase 3. Push to GitHub `main` using the session-authorized GitHub CLI/credential helper. In this same original sandbox the historical command was `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push github HEAD:main`; in a new session read its GitHub integration guidance instead of assuming these credentials exist.
3. If attached to the SAME Manus project, fetch canonical `origin/main`, integrate remote advances, rerun affected checks and push the intended completed commit to canonical `origin/main`. A GitHub branch push alone is not a Manus checkpoint. This handoff deliberately only pushes a WIP branch and does not create a new main checkpoint.
4. Confirm canonical checkpoint SHA in Version history/card. `auto_publish` was true at inspection, so an authorized canonical main advance automatically requests publication. Check Dashboard for its successful completion; do not enable auto-publish yourself and do not duplicate an in-flight publication.
5. If auto-publish is off, the owner can click Publish in that same project's Dashboard. A fresh session can use the documented `webdev.config` operation `POST publish` with an empty body only for a current explicit publishing request; inspect that session's full tool definition first. Await final publish success, not mere submission.
6. Confirm published deployRevision matches the intended completed checkpoint. Published builds use the checkpoint plus the stored self-contained install/build command, not the sandbox's `dist` directory. Preserve domain/project identity; do not initialize a replacement site and claim it redeployed the old URL.

The ZIP includes `.git` for local history recovery, but platform credential-helper paths in that config are sandbox-specific and are not portable credentials. Authenticate through the new session's connector/project mechanisms; do not copy keys. No active app secret files were present in the project root at handoff; `.env.example` is secret-free.

## G. Absolute rules to keep — copied from original brief

> The project uses PLAIN CSS with CSS variables (confirmed in Phase 0). It is not Tailwind. Add NO new dependencies. Build the language support and hash routes with the existing stack only.
>
> Do not change experiment logic, the catalog layout or the lab screens' look. Existing screens must keep working exactly as before. Re-test them at the end.
>
> Commit and push to `main` at the end of EACH phase with a clear message. These commits are my rollback points. Never force-push. Never rewrite history.
>
> Create `DECISIONS.md` in the repo. Whenever you make a judgment call (a choice I did not specify), add one line: what you chose and why. If a step is blocked, choose the safest default, log it, and continue.
>
> Never claim something works unless you verified it yourself in a running build. In the final report, separate "verified" from "NOT verified".
>
> Save full-size screenshots in `/docs/screenshots/` (committed) and also show them in the final report, one per section.
>
> NO unsuitable props, aggressive scenes or aggressive wording anywhere: UI text, rank names, hero titles, mission names, guide lines, images, animations, code comments.
>
> Children's privacy: nickname and avatar only. No real name, photo, email or phone. Progress stays in localStorage.
>
> Do not copy any existing game's characters, logos or UI.
>
> Cream background #FBF6EF, cards #FFFFFF, borders #E3D9CC at 2px, 20px corners, text #2B2824. No shadows, gradients or emoji. Accents, one role each: blue #2F8FE0 (main actions), mustard #F0B429 (stars and rewards), coral #EF6B5E (help), purple #9B5DE0 (tools), cyan #53BBD9 (info and live results). Cairo font only. Material Symbols Outlined icons. All colors as CSS variables, never hardcoded.
>
> Night mode: ONLY on `/lobby`, `/heroes`, `/vault`, `/ranks`, as a scoped theme via CSS variables (for example `[data-theme="night"]` on the game-screens wrapper). The catalog and lab stay cream. Choose a dark base that fits the existing 5 accents and keep the same accent roles (mustard for stars, blue for main actions, and so on). Do not invent a new color style. All night colors must be variables in one block so I can adjust them later.

The latest STOP instruction superseded the old all-phases command for this session: only a handoff branch was authorized now, not a main push, feature fix or new deployment.

## H. Ready-to-paste continue prompt

```text
Continue Misbar from the attached handoff ZIP or GitHub branch:
https://github.com/OsamaAliDev/misbar-platform/tree/wip-phase3-handoff

Read HANDOFF.md FIRST and then handoff-evidence/original-brief.md. Treat this as a
partially migrated existing Vite + React + JavaScript + plain-CSS project, NOT a
new build. Run git status, inspect branches/remotes and the actual SHA, install
only locked existing dependencies if needed, and run the production build before
editing. Preserve all WIP files and historical rollback commits. Do not reset to
Phase 2, regenerate hero assets, add dependencies, migrate frameworks or rewrite
history. The build previously succeeded but runtime wiring is unfinished.

Finish ONLY missing Phase 3 work, following HANDOFF section C in order. In
particular, register catalog locales, rewire old experiment/guide fields and
search index, support localized SVG textKey, finish shared lab/header/dashboard
strings, public language toggle in all three headers, root RTL/LTR switching,
localStorage persistence, icon/layout/slider/speech-tail handling, and a
module-level focus-recovery flag after the language-keyed App remount. Preserve
user nicknames and numerical simulation logic. Inspect saved Motion/Lever and
Optics/Matter edits rather than remigrating blindly; Orbit/Fractions already have
a completed simulation-owned-text report. Check Matter Heat/Cool button labels
against the English guide tip "heat and cool buttons" and align Motion Run/Play.
All English science wording needs human review. Verify both languages at 390px,
no missing keys/console errors/404s, both-way switches and reload; distinguish
compile-only, prior evidence and newly verified running-build results.

Commit and push completed Phase 3 to main normally after fetching/integrating
remote advances; keep wip-phase3-handoff unchanged as a recovery point. Check the
correct GitHub and Manus canonical remotes and publication authorization; a
GitHub branch push is not a Manus checkpoint. Never force-push. Do not claim the
existing public URL changed without confirmed deployment of the intended SHA.

Then do Phase 4: fresh GitHub-main clone install/build; first visit, hero select,
lobby, an experiment genuinely end to end, star earning, rank change, vault
unlock, mission completion, language both ways and reload. Audit text/images,
console/404s and compare cream catalog/lab against preserved baselines. No
unsuitable props or aggressive wording; nickname/avatar only; no new dependencies; Cairo,
plain CSS variables and existing accents; night mode on game screens only.

Update DECISIONS.md for new judgment calls. Commit the final QA changes and save
the required full-size screenshots in docs/screenshots. Deliver the original
final-report format: phase hashes/GitHub links, Verified versus NOT verified
status, all judgment calls, required full-size screenshots (five heroes, hero
select, lobby Arabic/English, vault, ranks, lab guide bubble, catalog Arabic and
English at mobile width), and known problems/decisions. Do not stop after a
summary of this handoff; complete the authorized missing work and report only
what you actually verified.
```
