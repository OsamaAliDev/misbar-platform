# مِسبار (Misbar) — Batch 1 TODO

Source: user request + confirmed Blueprint. Batch 1 builds ONLY the items below; the real
Playground is Batch 2 and the real Dashboard is Batch 3.

## 1. Project foundation (Vite + React, locked design system)
- [x] Vite + React project written in clean, well-commented JavaScript (no TypeScript).
- [x] Document uses `dir="rtl" lang="ar"`; Google Font **Cairo** (weights 400, 600, 700, 800) is the only typeface.
- [x] `src/index.css` contains the exact locked CSS variables:
      `--bg-canvas: #FBF6EF; --surface-card: #FFFFFF; --surface-subtle: #F5EDE2; --outline: #E3D9CC;
      --text-primary: #2B2824; --text-secondary: #5C5650; --accent-primary: #2F8FE0; --accent-primary-text: #FFFFFF;
      --accent-primary-soft: #D6E9FA; --accent-primary-soft-text: #1B5E99; --accent-reward: #F0B429;
      --accent-reward-soft: #FCEBC0; --accent-reward-text: #6E4F00; --accent-help: #EF6B5E; --accent-help-soft: #FDE0DC;
      --accent-help-text: #8A2A21; --accent-tools: #9B5DE0; --accent-tools-soft: #EBDDFA; --accent-tools-text: #5B2E99;
      --accent-info: #53BBD9; --accent-info-soft: #D9F0F7; --accent-info-text: #1B6279;`
- [x] Stitch's drifted colors are overridden — `#005f9e`, `#2B2B33` (and other off-palette Stitch values) are NOT used anywhere.
- [x] Strictly flat: ZERO `box-shadow`, ZERO CSS gradients, ZERO `backdrop-filter`/glass effects, ZERO Unicode emojis (crisp inline SVGs and Material Symbols Outlined icons only).
- [x] Borders & radius: `2px solid var(--outline)` (`#E3D9CC`) and `20px` border-radius on cards, header, search bar, and buttons.
- [x] `.gitignore` includes `node_modules`, `dist`, `.env*`.

## 2. Navigation & shared student state architecture
- [x] Clean client-side navigation/state architecture ready for 3 views: `catalog`, `playground`, `dashboard`.
- [x] Shared student state: default nickname "بطل الفضاء", a geometric avatar, and star balance "12", persisted in `localStorage`.

## 3. Mascot asset
- [x] Mascot "نُور" extracted from the zip assets and saved cleanly at `public/assets/nour.png` with transparent/clean rendering — no rectangular border box and no external `lh3.googleusercontent.com` links.

## 4. Interactive Experiments Catalog (`catalog`)
- [x] Header reuses the exact Stitch Catalog copy and proportions: brand "مِسبار", Nour greeting ("أهلاً يا بطل! جاهز نكتشف؟" / mobile "أهلاً يا بطل! اختار تجربة ونبدأ سوا!"), star balance, and "لوحة المعلم وولي الأمر".
- [x] `src/data/experiments.js` contains all 6 experiments with their custom flat SVG illustrations and exact card copy:
  - "قانون الحركة والسرعة والتسارع" (الفيزياء - 3 stars)
  - "توازن القوى والرافعة" (الفيزياء - 2 stars)
  - "مسار الكواكب والجاذبية" (الفلك - 1 star)
  - "الكسور والنسب بالمساحة" (الرياضيات - 1 star)
  - "انعكاس وانكسار الضوء" (الفيزياء - 2 stars)
  - "حالات المادة والحرارة" (الفيزياء - 3 stars)
- [x] Cards reuse the Stitch Catalog card proportions (category badge + stars row, illustration box, title, description, full-width "ابدأ التجربة" button).
- [x] Working real-time Arabic search bar ("ابحث عن تجربة...").
- [x] Working category filter pills ("الكل (6)", "الفيزياء", "الرياضيات", "الفلك"), combinable with search; clear empty state when nothing matches.

## 5. Placeholder views
- [x] Clicking "ابدأ التجربة" on any card switches to a clean Playground placeholder view with a "العودة للمكتبة" button.
- [x] Clicking "لوحة المعلم وولي الأمر" in the header switches to a clean Dashboard placeholder view with a "العودة للمكتبة" button.

## 6. Responsive breakpoints
- [x] Desktop (`1366px`): max-width `1280px` centered, 3-column card grid.
- [x] Tablet (`768px`): 2-column card grid.
- [x] Mobile (`320px` to `480px`): true 1-column layout; filter pills wrapped or padded cleanly so NO text like "الفلك" is clipped at `320px` or `390px`; zero horizontal scroll; minimum `44px` touch targets.

## 7. Delivery
- [x] Ignore the zip's mobile Teacher Dashboard screen (bottom navigation bar) — not reproduced.
- [x] Manus checkpoint saved.
- [x] Batch 1 pushed to GitHub repository `OsamaAliDev/misbar-platform` (existing history preserved, no force-push).

---

# Batch 2 TODO — Unified Interactive Playground, Nour's Help Modal, 6 real simulations

Source: user Batch 2 request. Keep everything from Batch 1 intact (Catalog view, locked CSS
variables in `src/index.css`, `public/assets/nour.png`, `src/data/experiments.js`, `localStorage`
student state). Match the layout and proportions of the Playground (`_2` mobile, `_3` desktop) and
Help Modal (`_7`) screens in the Stitch zip.

## B1. Strict design rules (inherited from `src/index.css`)
- [x] `dir="rtl" lang="ar"`, `Cairo` font exclusively.
- [x] Strictly flat: ZERO `box-shadow`, ZERO CSS gradients, ZERO `backdrop-filter`/glass, ZERO Unicode emojis (inline SVG + Material Symbols Outlined only).
- [x] `2px solid var(--outline)` (`#E3D9CC`) and `20px` border-radius on all cards, panels, modals and buttons.
- [x] Role colours: controls/sliders/toggles purple `--accent-tools` / `--accent-tools-soft`; live results strip & scientific readings cyan `--accent-info` / `--accent-info-soft`; help button & modal header coral `--accent-help` / `--accent-help-soft`; stars & challenge completion mustard `--accent-reward` / `--accent-reward-soft`; primary actions blue `--accent-primary`.

## B2. Unified Playground view (`src/components/PlaygroundView.jsx`)
- [x] Header bar — right side: back button (`arrow_forward` in RTL) returning to `catalog`, active experiment title, subject category pill.
- [x] Header bar — left side: dynamic star counter pill (`١٢ نجمة`, updated live when stars are earned) + coral button "محتاج مساعدة؟" (`#EF6B5E` fill, `#FFFFFF` text).
- [x] Main 2-column workspace: Desktop `1366x768` fits cleanly with zero vertical clipping; Mobile `< 768px` stacks cleanly in 1 column.
- [x] Right panel (Controls card): title "أدوات التحكم في التجربة", purple sliders/toggles/presets specific to the selected experiment, plus Play/Pause and Reset ("إعادة ضبط") buttons.
- [x] Left panel: interactive `<canvas>` / animated SVG simulation stage (`#FFFFFF` surface, `2px solid #E3D9CC`, `20px` radius).
- [x] Live Result Strip directly below the stage (`#D9F0F7` fill, `2px solid #53BBD9`, `20px` radius) showing real-time Arabic values and units.
- [x] Bottom Mascot Challenge & Tip Bar: transparent `public/assets/nour.png` mascot + experiment-specific interactive challenge prompt + "تحقق من التحدي" / "أتممت التجربة (+١ نجمة)" button that awards +1 star once per experiment, saved in `localStorage`.

## B3. Nour's Help Modal (`src/components/HelpModal.jsx`)
- [x] Opens when clicking "محتاج مساعدة؟".
- [x] Flat modal card (`#FFFFFF`, `2px solid #E3D9CC`, `20px` radius) with coral header "مساعدة نُور" and transparent `nour.png` avatar.
- [x] 3 tailored step-by-step hints for the active experiment: 1. الفكرة الأساسية, 2. جرّب تغيّر إيه؟, 3. القاعدة العلمية.
- [x] Blue "فهمت، يلا نجرب!" close button.

## B4. All 6 real interactive simulations (`src/simulations/`)
- [x] `MotionSimulation.jsx` (قانون الحركة والسرعة والتسارع): moving cart on a measured track; controls for Pushing Force (`N`), Mass (`kg`) and Friction toggle; live acceleration (a = F_net / m) and velocity (v).
- [x] `LeverSimulation.jsx` (توازن القوى والرافعة): balanced beam on a fulcrum; controls for Left/Right Weights (`كجم`) and Distances (`متر`); real-time torque tilt physics and "حالة توازن مثالية!" indicator when τ1 = τ2.
- [x] `OrbitSimulation.jsx` (مسار الكواكب والجاذبية): central star and orbiting planet; controls for Star Mass and Orbital Radius; live orbital velocity, period and gravitational pull readout.
- [x] `FractionsSimulation.jsx` (الكسور والنسب بالمساحة): visual fraction grid & circle pie; controls for Numerator and Denominator; live simplified fraction, decimal and percentage (`%`).
- [x] `OpticsSimulation.jsx` (انعكاس وانكسار الضوء): light beam crossing between two optical media (الهواء، الماء، الزجاج); controls for Incidence Angle (`°`) and Medium; real-time reflected and refracted rays obeying Snell's Law.
- [x] `StatesOfMatterSimulation.jsx` (حالات المادة والحرارة): particle chamber with animated molecules; Temperature slider (`-20°C` to `120°C`) and Heat/Cool quick buttons; smooth transition between صلب, سائل and غاز with live state readout.

## B5. Responsive & delivery
- [x] Responsive from `320px` to `1366px`: zero horizontal scroll, all controls accessible on mobile.
- [x] Batch 1 behaviour unchanged (catalog, search, filters, dashboard placeholder, student state).
- [x] Manus checkpoint saved and Batch 2 pushed to `OsamaAliDev/misbar-platform` (no force-push).

# November 2026 continuation — latest request
- [x] Step 1: challenge bar above all six simulations; 1366×768, 1536×864, 1920×1080 zero page scroll; 100dvh/min-height:0 and viewBox scaling; only controls may scroll. 390×844 full simulation, zero horizontal scroll.
- [x] Step 2: heroes/lobby/vault/ranks key content visible without desktop scroll; selected hero 45–55vh, four thumbnails together, name/title/select action; mobile image ≤40vh.
- [x] Step 3: persisted light/night toggle in all three headers, all screens; cream library/lab/dashboard and night game defaults until explicit choice; existing accents/night variables, six SVG contrast, modal/bubble/control contrast, theme-color and no flash.
- [x] Step 4: all HANDOFF C English migration, catalog search/art, shared lab/help/shell/dashboard/default nickname, six sims, Heat/Cool and Play copy, 44px language toggle, module-level refocus, root RTL/LTR, persistence, 390px both languages; science geometry and child progress preserved.
- [x] Step 5: fresh clone install/build, full UI-earned flow, no console errors/404s, wording audit, theme/language every screen, reload, full-size required screenshots in docs/screenshots, per-step commits and Verified/NOT verified report plus decisions. Stay on wip branch until final merge/push; no force, no new app dependencies, plain CSS and localStorage nickname/avatar privacy.

- [x] Latest phone/tablet request: same hero greeting button (avatar + greeting + direction-aware chevron) remains visible and clickable in AppHeader at phone/tablet widths; no duplicate alternative greeting; test390/768 and both languages/themes.

# Full task —18 November2026

- [x] PhaseA: one persisted theme; exhaustive screen/component AR/EN light/night audit, WCAGbodycontrast4.5:1, complete BEFORE/AFTER screenshots.
- [ ] PhaseB: radiusinventory→consistent~1/3reduction; heroimageslargerand1366x768/390phonefitwithoutpagescroll; Shararaidentity-preservingclosed-chestedit/separatecommit(orhonestunchangedblocker); usability44pxfocus16pxback≤3tapsreducedmotionhorizontalfit.
- [ ] PhaseC: verifiedEgyptian6gradeMOEstructure, no copiedcontent, existing6experimentsonly, confidentmappingorneeds teacher review, honestcomingsoon,AR/EN RTL/LTR,preserveprogressandPlayground.
- [ ] PhaseD: frozeninstallbuildQA, normalmainpush,diff/hashes, Pagesactualonly, exactsourceManuspublish and publicfirstvisit/largerheroes/globaltheme/gradeflow/labfit/noerrors/no404 evidence.

## Exact acceptance source

FULL TASK, in this exact order, phase by phase. Do NOT merge saas-foundation, do NOT touch other branches, do NOT force-push, do NOT add dependencies, do NOT change GitHub Pages settings, do NOT add new experiments or invent educational content. Keep STATUS.md updated after every phase. Push to main normally (never force) after each phase that passes its checks, so verified work is never lost. If credits are about to run out, commit only what is verified and say so. Never claim something is fixed without a full-size screenshot or real command output. List anything NOT done or NOT verified clearly.

START: fresh clone of main (fetch first, report the starting hash). Set git user OsamaAliDev, email 270765662+OsamaAliDev@users.noreply.github.com. Run existing QA scripts unchanged before and after each phase.

PHASE A: Theme consistency (night mode)
Problem: night mode applies to part of the app and not the rest, so screens look mismatched.
1. Audit EVERY screen and shared component (hero select, catalog, all 6 labs, Ranks, Vault, missions, teacher/parent page, school/login screens, header, modals, speech bubbles) in light and night, Arabic and English. Report a table: screen / theme result / problem. A likely cause: src/state/theme.jsx picks a night default on game routes but not elsewhere. Verify this yourself; do not assume.
2. Fix so ONE theme applies to the whole app at once: either everything is night or everything is light, controlled by the single toggle, persisted, and identical in Arabic and English. Replace any hardcoded light-only or dark-only colors with theme variables. Check text contrast (WCAG AA, 4.5:1 body text) in both themes.
3. Screenshots: before and after, full size, light and night, AR and EN, for every screen in the audit table.

PHASE B: Visual polish
4. Reduce corner roundness by roughly one third through the existing CSS variables where possible. List all radius values BEFORE changing. Keep fully round only for avatars and circular icon buttons. Pill buttons, badges and header chips become softly rounded rectangles. Do not change colors, fonts or text.
5. Hero select screen: make the hero icons/cards clearly larger so the hero is the focus. It must still fit 1366x768 and a 390px-wide phone without page scroll. No new art style.
6. Sharara image: edit her so she wears a closed-chest outfit (high neckline, chest fully covered), keeping the same face, hair, colors, pose, style, proportions and coral palette, and the existing no-weapons rule. Update all three assets consistently (assets-src PNG, public/heroes outfit1 WebP, face crop WebP). Commit the image change SEPARATELY so it can be reverted alone. Show BEFORE and AFTER full-size. If your tools cannot edit it while keeping the character identical, do NOT fake it and do NOT regenerate a different character: leave the original untouched and tell me clearly so I can do the edit elsewhere.
7. Apply general usability standards across the app and report each as pass/fail: touch targets at least 44x44px; visible keyboard focus; body text at least 16px; one consistent navigation pattern with a clear way back from every screen; any lab reachable in at most 3 taps from the home screen; prefers-reduced-motion respected; no horizontal scroll at 390px. Fix only simple failures; list the rest.

PHASE C: Egyptian curriculum structure
8. Research the structure of the Egyptian Ministry of Education student-books site https://studentbooks.moe.gov.eg/Books/ (stages, grades, semesters, subjects) for Primary 4 through Preparatory 3 (six grades). Report EXACTLY what you found and where. If you cannot access it, say so and use only structure you can confirm elsewhere; never guess. Do NOT copy any textbook text, images or exercises.
9. Reorganize the catalog around that structure: choose grade (Primary 4 to Prep 3), then subject (Science, Math), then semester if the site uses it. Map each of the 6 existing experiments to the grade(s) where it genuinely belongs in the Egyptian curriculum, using only mappings you can justify. Mark any uncertain mapping clearly in STATUS.md as "needs teacher review". Grades or subjects with no experiment yet show an honest, calm "coming soon" state, not fake content. All labels in Arabic and English with correct RTL/LTR. Keep existing localStorage data working (no loss of stars, hero, outfits) and keep the Playground reachable.
10. Do not change the science content of the experiments themselves.

PHASE D: Final checks and publish
11. `pnpm install --frozen-lockfile`, `pnpm build`, and all existing QA scripts unchanged. Report real results. If anything fails, stop and report before publishing.
12. Push final state to main (normal push). Report the final hash and `git diff --stat`. Report what GitHub Pages actually serves; do not change it.
13. Publish the built dist of that exact commit as a live Manus website. If you cannot attach the old site misbar-zrxurzxq.manus.space, create a NEW Manus site and tell me clearly the URL is new.
14. Verify the LIVE public URL (not localhost): hero select appears on first visit and hero icons are larger; one theme toggle changes the WHOLE app consistently in AR and EN; grade -> subject -> experiment navigation works; one lab fits 1366x768 without page scroll; no console errors, no 404s.

FINAL MESSAGE: anything NOT done or NOT verified at the very top. Then: live URL, deployed commit hash, the Phase A audit table, the radius before/after table, the usability pass/fail table, the curriculum mapping table (experiment / grade / confidence), and a Verified / NOT verified table for step 14 with one full-size screenshot of the live site per check. Do not say "done" without the tables and the live URL.
