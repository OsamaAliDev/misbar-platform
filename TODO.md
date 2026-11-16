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

# Phase 5A — saas-foundation

- [ ] Step 1: Add SQL migration based on supabase/schema.sql with schools, profiles(role,school_id), classes(teacher_id,school_id,join_code), students(class_id,nickname,pin_hash,hero_id,stars,unlocked_outfits,claimed_missions), experiment_progress(student_id,experiment_id,stars,completed_at), subscriptions(school_id,plan,status,student_limit,valid_until). NO email, real-name or phone student columns. RLS EVERY table: school staff tenant-only, teacher own classes only, student own row only, platform_admin aggregate stats only. Execute and include proof schoolA cannot read schoolB; identify remote vs local proof honestly.
- [ ] Step 2: Email teacher/admin Supabase Auth; student class code + nickname +4digitPIN; hash server-side, rate-limit attempts, no cleartext PIN in response/browser storage/logs. If Supabase env absent use local mock SAME interface and state exactly which settings needed. Supabase failures do not silently fallback. Session authorization and trusted role provisioning, no self-admin registration.
- [ ] Step 3: Small data access module with localStorage guest adapter and Supabase adapter behind same interface; guests retain existing stars/rank/hero/missions/outfits. Import local progress ONCE on first student login, never overwrite/import again or bleed account changes into guest storage.
- [ ] Step 4: Teacher login, create class with join code, class roster showing each student's stars/rank, student login; Arabic/English, light/night, fit-to-screen and mobile/tablet as before. Include minimal enrollment with nickname/PIN only so a created class is usable. Never claim controls work without checking them.
- [ ] Step 5: Expired/inactive subscription clear message; students can view but cannot earn new stars; enforce gate on server/RPC, not only CSS. Platform_admin page manually create school/set plan/student_limit/valid_until with manual invoicing, NO payments, parent accounts or analytics dashboard.
- [ ] Step 6: Commit PER step, update DECISIONS.md with judgment calls; no forcepush, only saas-foundation branch. Final report Verified/NOT verified, commit hashes, executable RLS result, real Supabase vs mock parts, screenshots one per section. No publication claim or main merge in this phase.
