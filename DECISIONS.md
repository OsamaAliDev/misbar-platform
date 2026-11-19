# DECISIONS.md

Each line records one judgment call I made that the brief did not specify: what I chose and why. If a step was blocked, the safe default I used is logged here too.

## Phase 1: Character assets

- **Isolation method:** I cropped each hero from the source image, upscaled it 3× (Lanczos), then ran one AI image edit per hero with a transparent background. The prompts said to preserve face, hair, skin, outfit, colours and render style exactly. Plain background removal could not rebuild the legs hidden behind the name plates or the body hidden behind the removed source prop.
- **One pass per hero, no re-rolls:** I accepted the first result for all five, after checking them on cream and dark navy. Re-generating risks drifting away from the original faces.
- **Lubna's strap:** the source chest strap became a plain olive fabric strap with no decorative inserts. Lubna's thigh accessory also became a closed rectangular tool pouch, under the rule that unsuitable source gear becomes a neutral tool.
- **Thigh accessories → closed pouches for Shihab, Suhail and Sharara:** their source accessory shapes were unsuitable, so each became a closed rectangular utility pouch.
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

## November 2026 continuation
- Latest request supersedes the earlier game-only night scope: explicit persisted theme applies everywhere; cream lab/library/dashboard and night game defaults remain until user choice.
- Fresh GitHub clone on wip-phase3-handoff at f6557a1: pinned install and initial build succeeded. Preserve completed phases and assets.
- Manus attachment returned project identity/access error; diagnostics returned no active project. Continue authorized GitHub clone with build checks and local running-build tests; no replacement site or claimed publication/checkpoint.
- Challenge bar uses DOM order between header and simulation, matching screenshot and reading order.
- Step 1 browser evidence: all six labs passed three desktop viewport sizes with document height equal to viewport; 390×844 SVGs entirely visible, controls remain reachable by vertical page scrolling on mobile. No page exceptions.

- Theme lives on html so native top-layer dialogs inherit the same tokens; route defaults do not write storage until the visitor explicitly chooses. An early inline bootstrap sets stored theme and direction before CSS.
- Language uses the existing keyed-App remount. A module-level flag plus a cancellable animation frame restores toggle focus after heading effects and React StrictMode replay. Route/student/theme survive; experiment parameters and catalog filters intentionally reset on language remount, as in the handoff architecture.
- Default nickname is a display-only translation; the Arabic legacy default remains recognized, while custom stored nicknames are never rewritten. Removed unused avatar labels and the unused Arabic-only star formatter; locale-aware star plural helpers remain.
- Catalog uses the existing per-interface-language search Map and normalization; no new cross-language indexing or dependencies. SVG textKey is consumed as data, never a DOM attribute; science geometry is not mirrored.
- Individual simulation audits preserved formulas/coordinates. Fractions uses stable text-on-reward on solid cyan/mustard surfaces; optics reflected-angle arc uses the existing readable purple text token. Orbit gravity unit now accurately identifies the Sun's pull on Earth (M/r²), not Earth surface gravity. English mass/angle units are clearer. Matter quick actions say Heat/Cool and keep ±10°C behavior; Motion status says Play.
- Browser flow earned 12→13→15→16→19 through fractions, first mission, lever, second mission; rank changed to Inventor then Lab Captain; vault slot unlocked with no star deduction. No progress balance or completion list was seeded in this flow. Lever test waits for the original beam settling condition before claim.
- Scientific English keeps human-review markers; software checks are not a substitute for an educator's review.
- Rephrased historical source-accessory terminology in documentation and comments to neutral discovery-focused wording without rewriting Git history. Preserved original technical facts and prior evidence; previously dated HANDOFF status is historical, not the new completion report.
- Game viewport allocation uses min-height:0 and clamp(280px,48vh,560px); mobile retains readable vertical flow with full hero ≤40vh. Before choosing a hero, the first figure is preview-only; native radio selection still requires user action. Four alternatives stay together; mission/rank/vault content remains visible on desktop. Intrinsic image min-sizing was corrected so feet are not clipped.
- Read-only audit found an inherited storage-event ordering issue: applyLanguage now updates numeric locale synchronously before cross-tab App remount. This keeps static counters and root direction consistent across tabs. Early meta initialization was separately verified with the main module blocked.
- Latest mobile/tablet request: keep the same hero-greeting lobby link visible in AppHeader at all widths; wrap it into its own phone row when needed, keep44px target, and remove the duplicate alternate catalog strip. Desktop greeting placement stays unchanged.
- Final acceptance served a fresh GitHub clone of93913ed production build on port3000, not hot-reload development. Matrix192/192, greeting16/16 and genuine UI-earned flow passed with zero page/console errors, warnings or HTTP failures. Full-size screenshots were regenerated from that production build. Matrix screenshots use a chosen hero at12stars only for visual coverage; reward flow never seeds balances.
- Software accepted through GitHub; original Manus project attachment remains unavailable. Do not claim the old public site was updated or that a Manus checkpoint was recorded.

## Full task —18 November2026

- User request supersedes allroute-specifictheme defaults: DEFAULT_THEME=light globally; savednight/lightchoice is honored for everyroute,AR/EN,dialogs and reload. Route/studentstate no longerparticipates in theme selection.
- OriginalQA was rununchangedbeforephaseA and passed. User explicitlyapproved updating ONLYoutdatedthemeexpectations at12:40. Exactlyoneassertionin docs/qa_flow_current.py changesfirst-visitnight→light; allnavigation/reward/persistence/focusassertions andotherQA scriptsstayunchanged.
- School/login views are absentfrom main; listNOTpresent/NOTverified, noforbiddenSaaSmerge.

- Independent18-itemauditfoundexplicit-theme renderingcorrect, butwhite/blueactiontext3.428:1, white/coralhelp3.028:1, andlightlobbystars1.864:1. Preservefivegraphicaccentcolorsandsimulationfiles; addsemanticprimary-actionfillusingexistingdeepblue1B5E99, stablehelptext2B2824, existingdarkcoral/purplehoverfills,andreward-textforstarcount. Onlytext-bearingactionpairschange. Nativehelpbodyremainsinternallyscrollable; itsEnglishquickfactaccesswillbeverifiedinstead ofclaimingclippingfromfirstviewmeanslostcontent.

- OriginalgreetingQA caughta realintermittent390pxRTLnightoverflow408px despite matrixpassing. Fontfailureinjectionproved MaterialSymbols fallback supervisor_account spans139.97px within44pxbutton andextendsleft-17.98px. Fixshared.iconfootprintto1em×1em; hideonlyfallbackglyphwordoverflow, neverhidepageoverflow. Fontface/fontsize,touchbounds andpagegeometryarenotchanged. OriginalgreetingQAremainsbyte-identical.

## تعديل شرارة الموضعي —18نوفمبر2026

استخدم تعديل AI لمنطقة الصدر فقط، ثم دمجت لوحة القماش داخل قناع محدود للحفاظ على الشخصية الأصلية بدل إعادة توليدها. ثبت أن كل ما خارج القناع لم يتغير بكسلًا ببكسل، وأن alpha مطابق. أعيد تحويل الجسم إلىWebP600×900، وقص الوجه أُعيد ترميزه lossless ببكسلاته الأصلية؛ الياقة خارج حدود قص الوجه. الأصول الثلاثة متسقة، وبقية الأبطال دون تعديل.

- Cross-route B QA caught issues not found by isolated label-click checks: forced native radio hit at a rounded card corner did not select; hidden badge dimensions inherited padding/min-height and could overflow during layout/font changes. Keep native radio full-card/transparent (not a1px target); explicitly anchor and normalize only visually-hidden descriptions. No page-overflow clipping, no additional QA expectation change.

## تنظيم المنهج والحدود —18نوفمبر2026

نتائج البحث الخارجي للصفوف الستة حُفظت قبل طلب تحليل الكتب الجديد. أبقي المهمتين منفصلتين: تحليل المرفقات لا يقرأ كودًا أو مستودعًا ولا ينشر؛ استئناف الموقع مأذون برسالة «لا توقف العملية السابقة بل أكملها كلها أيضًا». لا أستخدم تنبؤات NotebookLM كمصادر مواءمة.

البوابة الحية أعادت403لقوائم المراحل؛ لا أدعي قراءتها. معلومات الفصول من الملفات المباشرة/البدائل موثقة مع حدودها. أرفض مواءمة الكسور للرابع أو الثاني الإعدادي اعتمادًا على المساحة أو الأعداد النسبية وحدهما. توجد5مواءمات فقط:واحدة موثقة وأربع تحتاج معلمًا. المصدر والسنة القديمة وحدود الامتدادات ظاهرة، لا مخفية خلف وسم عام. الست متاحة لعبًا حرًا ولا إسناد مختلق للرافعة أو الانكسار.

تفضيل المنهج بمفتاح مستقل misbar:curriculum:v1؛ لا تغيير لبيانات النجوم/البطل/المهام/الأزياء. مسار3نقرات يشمل اختيار البطل ثم رابط المكتبة بالهيدر ثم بدء أي مختبر، لا المرور الإلزامي بالساحة. الشيفرة العلمية والاعتماديات والاختبارات الأصلية بقيت كما كانت بعد إذن الثيم الوحيد.
- 19 Nov (E): Lesson catalog lives in data/lessons.js as audited citations, not content copies; playable state exists only where the audit matched an existing simulation (light 4-1 verified; wind/rubber candidates teacher-review). All other lessons display an honest coming-soon card pending the three new P4 books, per product owner instruction.
- 19 Nov (E): Standard site layer (info pages, 404 view for unknown hashes, error boundary, footer, skip link, OG/PWA metadata with self-owned manifest) added without touching simulation physics or design tokens. Manus workspace (client/ layout) is canonical for publishing; this repo mirrors identical app code at root layout.
