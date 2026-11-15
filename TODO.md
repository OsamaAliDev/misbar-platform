# مِسبار (Misbar) — Batch 1 TODO

Source: user request + confirmed Blueprint. Batch 1 builds ONLY the items below; the real
Playground is Batch 2 and the real Dashboard is Batch 3.

## 1. Project foundation (Vite + React, locked design system)
- [ ] Vite + React project written in clean, well-commented JavaScript (no TypeScript).
- [ ] Document uses `dir="rtl" lang="ar"`; Google Font **Cairo** (weights 400, 600, 700, 800) is the only typeface.
- [ ] `src/index.css` contains the exact locked CSS variables:
      `--bg-canvas: #FBF6EF; --surface-card: #FFFFFF; --surface-subtle: #F5EDE2; --outline: #E3D9CC;
      --text-primary: #2B2824; --text-secondary: #5C5650; --accent-primary: #2F8FE0; --accent-primary-text: #FFFFFF;
      --accent-primary-soft: #D6E9FA; --accent-primary-soft-text: #1B5E99; --accent-reward: #F0B429;
      --accent-reward-soft: #FCEBC0; --accent-reward-text: #6E4F00; --accent-help: #EF6B5E; --accent-help-soft: #FDE0DC;
      --accent-help-text: #8A2A21; --accent-tools: #9B5DE0; --accent-tools-soft: #EBDDFA; --accent-tools-text: #5B2E99;
      --accent-info: #53BBD9; --accent-info-soft: #D9F0F7; --accent-info-text: #1B6279;`
- [ ] Stitch's drifted colors are overridden — `#005f9e`, `#2B2B33` (and other off-palette Stitch values) are NOT used anywhere.
- [ ] Strictly flat: ZERO `box-shadow`, ZERO CSS gradients, ZERO `backdrop-filter`/glass effects, ZERO Unicode emojis (crisp inline SVGs and Material Symbols Outlined icons only).
- [ ] Borders & radius: `2px solid var(--outline)` (`#E3D9CC`) and `20px` border-radius on cards, header, search bar, and buttons.
- [ ] `.gitignore` includes `node_modules`, `dist`, `.env*`.

## 2. Navigation & shared student state architecture
- [ ] Clean client-side navigation/state architecture ready for 3 views: `catalog`, `playground`, `dashboard`.
- [ ] Shared student state: default nickname "بطل الفضاء", a geometric avatar, and star balance "12", persisted in `localStorage`.

## 3. Mascot asset
- [ ] Mascot "نُور" extracted from the zip assets and saved cleanly at `public/assets/nour.png` with transparent/clean rendering — no rectangular border box and no external `lh3.googleusercontent.com` links.

## 4. Interactive Experiments Catalog (`catalog`)
- [ ] Header reuses the exact Stitch Catalog copy and proportions: brand "مِسبار", Nour greeting ("أهلاً يا بطل! جاهز نكتشف؟" / mobile "أهلاً يا بطل! اختار تجربة ونبدأ سوا!"), star balance, and "لوحة المعلم وولي الأمر".
- [ ] `src/data/experiments.js` contains all 6 experiments with their custom flat SVG illustrations and exact card copy:
  - "قانون الحركة والسرعة والتسارع" (الفيزياء - 3 stars)
  - "توازن القوى والرافعة" (الفيزياء - 2 stars)
  - "مسار الكواكب والجاذبية" (الفلك - 1 star)
  - "الكسور والنسب بالمساحة" (الرياضيات - 1 star)
  - "انعكاس وانكسار الضوء" (الفيزياء - 2 stars)
  - "حالات المادة والحرارة" (الفيزياء - 3 stars)
- [ ] Cards reuse the Stitch Catalog card proportions (category badge + stars row, illustration box, title, description, full-width "ابدأ التجربة" button).
- [ ] Working real-time Arabic search bar ("ابحث عن تجربة...").
- [ ] Working category filter pills ("الكل (6)", "الفيزياء", "الرياضيات", "الفلك"), combinable with search; clear empty state when nothing matches.

## 5. Placeholder views
- [ ] Clicking "ابدأ التجربة" on any card switches to a clean Playground placeholder view with a "العودة للمكتبة" button.
- [ ] Clicking "لوحة المعلم وولي الأمر" in the header switches to a clean Dashboard placeholder view with a "العودة للمكتبة" button.

## 6. Responsive breakpoints
- [ ] Desktop (`1366px`): max-width `1280px` centered, 3-column card grid.
- [ ] Tablet (`768px`): 2-column card grid.
- [ ] Mobile (`320px` to `480px`): true 1-column layout; filter pills wrapped or padded cleanly so NO text like "الفلك" is clipped at `320px` or `390px`; zero horizontal scroll; minimum `44px` touch targets.

## 7. Delivery
- [ ] Ignore the zip's mobile Teacher Dashboard screen (bottom navigation bar) — not reproduced.
- [ ] Manus checkpoint saved.
- [ ] Batch 1 pushed to GitHub repository `OsamaAliDev/misbar-platform` (existing history preserved, no force-push).
