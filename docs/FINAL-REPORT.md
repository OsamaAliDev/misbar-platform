# مسْبار — التقرير النهائي

## النتيجة

نُقل شريط التحدي والإرشاد إلى ما فوق المحاكاة في ترتيب الصفحة الفعلي. أصبح زر ترحيب البطل نفسه ظاهرًا وقابلًا للضغط على الهاتف والتابلت، مع التفافه إلى سطر مستقل عند الحاجة، ودون شريط ترحيب بديل مكرر. اكتملت إصلاحات المقاسات والثيم الموحد والإنجليزية، وحُفظت التغييرات على GitHub ثم نُقلت إلى `main` دون دفع قسري أو إعادة كتابة التاريخ. المراحل 0–2 والأصول المعتمدة لم تُنفّذ من جديد.

**مهم:** تحديث GitHub مؤكد؛ تحديث موقع Manus المنشور الأصلي غير مؤكد. تعذّر ربط المشروع الأصلي بهذه الجلسة بسبب هوية/صلاحية المشروع، لذلك لم أُنشئ موقعًا بديلًا ولم أدّعِ تسجيل نقطة حفظ أو نشر جديد على الرابط القديم.

## نقاط الرجوع لكل خطوة

| الخطوة | Commit |
|---|---|
| الخطوة 1 — مقاسات المختبرات ونقل شريط التحدي | [`6762c9a`](https://github.com/OsamaAliDev/misbar-platform/commit/6762c9ae0c8db968f768a1371bb3d953cc54baed) |
| الخطوة 2 — مقاسات الأبطال وشاشات اللعب | [`52f2971`](https://github.com/OsamaAliDev/misbar-platform/commit/52f29719110492314b87a1cbf6fe2214008b6052) |
| الخطوة 3 — تباين المحاكاة الليلي | [`ab3e03d`](https://github.com/OsamaAliDev/misbar-platform/commit/ab3e03d5642133b809dc880e4e246199e51ae9ee) |
| الخطوة 3 — ربط الثيم الموحد بكل الشاشات | [`cce00fe`](https://github.com/OsamaAliDev/misbar-platform/commit/cce00fe4c4cbb59702c9e02c0ed29c43a5508abe) |
| الخطوة 4 — اكتمال الإنجليزية وزر الترحيب على الهاتف والتابلت | [`93913ed`](https://github.com/OsamaAliDev/misbar-platform/commit/93913ed49b2e71ff9feac33b4bd9fb245fc7e3bd) |
| الخطوة 5 — فحص الإنتاج واللقطات والدمج | [`0690a9a`](https://github.com/OsamaAliDev/misbar-platform/commit/0690a9a49428cebb69bfa4af690e5789948d0693) |

اللقطات والاختبارات النهائية موجودة في `docs/screenshots/` و`docs/` داخل المستودع. الفرع `wip-phase3-handoff` محفوظ كمسار استكمال/رجوع، والتاريخ القديم محفوظ.

## Verified / NOT verified

| البند | الحالة | الدليل وحدود الاختبار |
|---|---|---|
| استنساخ فرع التسليم والتثبيت والبناء قبل أي تعديل | Verified | `f6557a1`، تثبيت مقفل بـ pnpm 11.25.0، بناء ناجح. |
| المختبرات الستة: 1366×768، 1536×864، 1920×1080 | Verified | لا تمرير للصفحة؛ إطار المحاكاة كامل، وشريط التحدي أعلى مساحة العمل. لوحة التحكم الطويلة وحدها تُمرّر داخليًا. |
| المختبرات الستة على 390×844 بالعربية والإنجليزية والثيمين | Verified | المحاكاة كاملة داخل العرض الأول، ولا تمرير أفقي. التحكم والقراءات تبقى قابلة للوصول بالتمرير العمودي الطبيعي على الهاتف. |
| heroes/lobby/vault/ranks على سطح المكتب | Verified | المحتوى الأساسي كامل داخل الشاشة، والأبطال غير مقصوصين. المختار كبير والأربعة الآخرون معًا في صور مصغرة. |
| حد صور الأبطال على الجوال | Verified | لا يتجاوز 40vh، مع مساحة لحركة التنفس. |
| الثيم واللغة على جميع الشاشات | Verified | 192/192 حالة، جذر RTL/LTR، لون المتصفح، عدم وجود مفاتيح ترجمة مفقودة، 0 أخطاء/تحذيرات/طلبات HTTP فاشلة. |
| زر ترحيب البطل على الهاتف والتابلت | Verified | 16/16 حالة: 390، 768، 1024، 1366 بكسل × اللغتين × الثيمين؛ ظاهر وصورة البطل محمّلة والضغط يفتح الردهة. |
| استعادة تركيز زر اللغة | Verified | تبديل الاتجاهين بلوحة المفاتيح وتحت React StrictMode، دون سرقة التركيز أثناء التنقل غير المرتبط بالتبديل. |
| تزامن اللغة والأرقام بين التبويبات | Verified | أصبحت أرقام النجوم 12 stars في التبويب الآخر بعد تغيير اللغة، بعد إصلاح ترتيب تحديث اللغة. |
| المساعدة وأزرار التحكم والنتائج | Verified | لكل المختبرات، فتح الحوار وإغلاقه وإرجاع التركيز، النصوص المشتركة، كسر مقروء لقارئ الشاشة. |
| حالة Heat/Cool وPlay | Verified | زرّا المادة يعرضان Heat/Cool ويحتفظان بتغيير ±10°C؛ حالة الحركة تشير إلى Play. |
| المسار الكامل وكسب النجوم من الواجهة | Verified | 12→13 من الكسور، ثم 15 من المهمة الأولى؛ 16 من الرافعة ثم 19 من المهمة الثانية، Inventor ثم Lab Captain، فتح زي دون خصم رصيد، حفظ بعد إعادة التحميل. لم تُزرع أرصدة أو قوائم إكمال في هذا الاختبار. |
| اختلافات المحاكاة والتباين | Verified | مراجعة مستقلة لكل محاكاة للغات والحالات والتباين، مع حفظ المعادلات واتجاهات الرسم الفيزيائية. |
| نصوص وتعليقات المحتوى والاعتماديات | Verified | أزيلت المصطلحات غير الملائمة من الشيفرة والتعليقات ووثائق السجل الحالية؛ package.json وlockfile بلا اعتماديات جديدة. |
| خصوصية الأطفال | Verified | بيانات التقدم والألقاب والأفاتار داخل localStorage؛ لا تسجيل بيانات اتصال أو صور أطفال، ولا استبدال لقب مخصص أثناء الترجمة. |
| بناء إنتاج مستقل من استنساخ جديد | Verified | `93913ed`، ثم استنساخ main عند `0690a9a`؛ تثبيت وبناء ناجحان، واختبارات التشغيل على حزمة الإنتاج لا على التحديث الساخن. |
| دمج ودفع GitHub main | Verified | انتقل main من 752693f إلى 0690a9a دون force-push؛ لم توجد تغييرات main متزامنة تستلزم دمج تعارضات. |
| نشر النسخة على موقع Manus الأصلي | NOT verified | ربط المشروع غير متاح؛ دفع GitHub ليس إثباتًا لتحديث الموقع المنشور. |
| تدقيق علمي بشري للإنجليزية | NOT verified | علامات needs human review محفوظة؛ يلزم مراجع تربوي/علمي. |
| مطابقة بصرية حرفية للتصميم القديم | NOT verified | المقاسات وموضع التحدي وزر الجوال تغيرت بطلبك؛ ألوان التصميم والأصول والأدوار بقيت. لا ادعاء بمطابقة بكسلية. |
| كل التحديات والجوائز الستة ضمن جلسة واحدة | NOT verified | المسار الحقيقي يشمل الكسور والرافعة؛ بقية المحاكاة اختُبرت حالاتها وتفاعلاتها بصورة مستقلة، وليس كل الجوائز في مسار واحد حتى أعلى رتبة. |

## كيف أُجري التحقق

مصفوفة التشغيل شملت 12 مسارًا × أربع مقاسات × لغتين × ثيمين = 192 حالة. الحالات المرئية تستعمل بطلًا مختارًا ورصيد البداية 12 فقط لتغطية الشاشات؛ اختبار الجوائز مستقل ويبدأ بمستخدم جديد ويكسب التقدم من الواجهة. نجح فحص البناء النظيف، ثم أُعيدت المصفوفة ومسار الجوائز واختبار الترحيب على حزمة الإنتاج المستقلة. لا تغييرات في منطق التجارب العددية.

## قرارات وحدود مهمة

الثيم الافتراضي كريمي للمكتبة والمختبر ولوحة المتابعة، وليلي لشاشات اللعب. عند اختيار المستخدم ثيمًا صراحةً يطبَّق على الجميع ويُحفظ. اللغة تعيد تركيب التطبيق وفق التصميم الموجود: المسار والبطل والنجوم والمهام والأزياء محفوظة، لكن معاملات المحاكاة ومرشحات المكتبة تعود للافتراضات بعد تبديل اللغة. لوحة المعلم وولي الأمر ما زالت واجهة «قريبًا»، وليست لوحة تحليلات جديدة.

سجل القرارات التالي من `DECISIONS.md` كاملًا، ويشمل القرارات التاريخية والقرارات الجديدة؛ لغة النص التاريخي محفوظة:

```text
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
```

## اللقطات كاملة الحجم

الصور التالية ملفات كاملة وليست صورًا مصغرة. كل صور المختبرات الستة وشاشات اللعب أدناه 1366×768. صور المكتبة كاملة الصفحة، لذلك قد يزيد ارتفاعها على 768 بكسل. صور المرحلة الأولى المحفوظة أصول تحقق سابقة أعيدت معاينتها، وليست توليدًا جديدًا.

### الحركة — ليلي

![الحركة — ليلي](screenshots/playground-motion-acceleration-ar-night-1366.png)

### الرافعة — ليلي

![الرافعة — ليلي](screenshots/playground-lever-balance-ar-night-1366.png)

### مدارات الكواكب — ليلي

![مدارات الكواكب — ليلي](screenshots/playground-planet-orbits-ar-night-1366.png)

### الكسور — ليلي

![الكسور — ليلي](screenshots/playground-fractions-area-ar-night-1366.png)

### الضوء — ليلي

![الضوء — ليلي](screenshots/playground-light-refraction-ar-night-1366.png)

### حالات المادة — ليلي

![حالات المادة — ليلي](screenshots/playground-matter-states-ar-night-1366.png)

### اختيار الأبطال

![اختيار الأبطال](screenshots/heroes-ar-night-1366.png)

### الردهة — عربي

![الردهة — عربي](screenshots/lobby-ar-night-1366.png)

### الردهة — إنجليزي

![الردهة — إنجليزي](screenshots/lobby-en-night-1366.png)

### خزانة الأزياء

![خزانة الأزياء](screenshots/vault-ar-night-1366.png)

### الرتب

![الرتب](screenshots/ranks-ar-night-1366.png)

### المكتبة — عربي فاتح

![المكتبة — عربي فاتح](screenshots/catalog-ar-light-1366.png)

### المكتبة — عربي ليلي

![المكتبة — عربي ليلي](screenshots/catalog-ar-night-1366.png)

### المكتبة — إنجليزي فاتح

![المكتبة — إنجليزي فاتح](screenshots/catalog-en-light-1366.png)

### المكتبة — إنجليزي ليلي

![المكتبة — إنجليزي ليلي](screenshots/catalog-en-night-1366.png)

### المكتبة — عربي على الهاتف

![المكتبة — عربي على الهاتف](screenshots/catalog-ar-light-390.png)

### المكتبة — إنجليزي على الهاتف

![المكتبة — إنجليزي على الهاتف](screenshots/catalog-en-light-390.png)

### زر الترحيب — الهاتف

![زر الترحيب — الهاتف](screenshots/greeting-ar-light-390.png)

### زر الترحيب — التابلت

![زر الترحيب — التابلت](screenshots/greeting-ar-light-768.png)

### لبنى — الأصل المعتمد

![لبنى — الأصل المعتمد](screenshots/p1-1-hero-lubna.png)

### شهاب — الأصل المعتمد

![شهاب — الأصل المعتمد](screenshots/p1-2-hero-shihab.png)

### نور — الأصل المعتمد

![نور — الأصل المعتمد](screenshots/p1-3-hero-nour.png)

### سهيل — الأصل المعتمد

![سهيل — الأصل المعتمد](screenshots/p1-4-hero-suhail.png)

### شرارة — الأصل المعتمد

![شرارة — الأصل المعتمد](screenshots/p1-5-hero-sharara.png)
