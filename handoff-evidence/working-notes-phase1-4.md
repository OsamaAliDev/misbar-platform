# Misbar — Phases 1–4 working notes (autonomous run started 2026-11-16 01:40)

Brief: /home/ubuntu/upload/misbar_manus_full_prompt.md (re-read when needed). Hero source image:
/home/ubuntu/upload/pasted_file_MSEifF_image.png (1024x529; L→R Lubna, Shihab, Nour, Suhail, Sharara).
Phase 0 commit: 6a070980494768a7cff484af2e1822b8f4c24057 (GitHub + Manus origin).
Push: `git -c credential.helper= -c 'credential.helper=!gh auth git-credential' push github HEAD:main` and `git push origin HEAD:main` (use `set +H`). Local git email fixed to 270765662+OsamaAliDev@users.noreply.github.com.
Baseline (before-brief) screenshots: /home/ubuntu/work/baseline/*.png (catalog 1366/390, lab-motion 1366/390, lab-fractions 1366, dashboard 1366).
Chromium for playwright: executable_path="/usr/bin/chromium", args=["--no-sandbox"]. Dev server: port 3000 (service job_ddCCuzIG).

## Phase 1 status
- Crops: /home/ubuntu/work/heroes/crops/*.png (3x lanczos). Generated (gpt-image-2.5, transparent, 2:3, high):
  /home/ubuntu/work/heroes/gen/{lubna,shihab,nour,suhail,sharara}_v1.png (1536x2304). ACCEPTED all v1.
  Verified: Lubna source strap → olive fabric strap (no decorative inserts); Nour hands empty; thigh accessories → closed pouches; no halo on dark.
- Output: /assets-src/heroes/<id>-outfit1.png originals; /public/heroes/<id>-outfit1.webp ~600x900 <200KB.

## Key design decisions (log in DECISIONS.md)
- i18n helper built in Phase 2 (game screens use t()), toggle + full migration in Phase 3. App remount key={lang}; module-level number locale.
- Routes hash: #/lobby #/heroes #/vault #/ranks. Root stays catalog. First-time (no heroId) on catalog/lobby → replace to #/heroes. Lab deep link w/o hero → guide defaults to Nour.
- Ranks thresholds (config/game.js): Young Explorer 0, Inventor 14, Lab Captain 18, Discovery Commander 23, Master Scientist 28 (max reachable now 12 + 6 challenges + 10 missions = 28).
- Missions: first-discovery (1 challenge, +2), two-experiments (2 challenges, +3), science-tour (1 challenge in each of physics/math/astronomy, +5). One-time, claim button.
- Vault: 4 slots/hero; outfit1 free; outfit2..4 cost 16/22/28 stars; unlocking does NOT spend stars (threshold), stored as unlockedOutfits; unlocked slot = "design coming soon".
- Hero tones: Lubna tools(purple), Shihab primary(blue), Suhail info(cyan), Sharara help(coral), Nour reward(mustard). Nour title constant { ar:'بطل مِسبار', en:'Misbar Hero' } in src/data/heroes.js.
- Night palette (one block [data-theme="night"] in index.css): canvas #141A2E, card #1D2540, subtle #252E4D, outline #34406A, text #F6F1E9 / #B8BDD6; accents unchanged; soft variants dark tints.
- Lab: ChallengeBar + HelpModal use chosen hero avatar + hero lines (encourage default, wrong on retry, celebrate on met/success, hint in help modal). Catalog greeting badge/strip uses hero avatar + links to lobby.
- Simulation SVG stages keep their drawing orientation in English (physical left/right labels must not mirror).
- Avoid icon names with aggressive words (e.g. military_tech, shield). Material Symbols subset list in index.html must include every icon used.

## Progress log
- Phase 1 DONE: commit a5a1b54b420378948ba7f993296e7125312f1303 (pushed origin + github). WebP 68–97 KB. Faces: public/heroes/<id>-face.webp 160x160 (9–13 KB) generated in Phase 2 (not yet committed).
- Phase 2 files written so far: src/i18n/index.jsx (I18nProvider, useI18n {lang,dir,isRTL,t,setLang,toggleLang}, translate), locales ar|en/{common,game,heroes,index}.js,
  src/config/game.js (RANKS, MISSIONS, OUTFIT_SLOTS, getRankProgress, getMissionStatus, outfitKey), src/data/heroes.js (NOUR_TITLE, HEROES, getHero, DEFAULT_GUIDE_HERO_ID),
  src/state/student.jsx (+heroId, claimedMissions, unlockedOutfits; chooseHero/claimMission/unlockOutfit), src/state/navigation.jsx (+LOBBY/HEROES/VAULT/RANKS, GAME_VIEWS),
  src/state/guide.js (useGuide, useHeroLine), components HeroAvatar, StarBalance (moved .star-balance css from AppHeader.css → remove there), ProgressBar, MissionCard.
- lib/arabic.js: setNumberLocale added; formatStarCount still Arabic-only (replace with t('common.starCount') in Phase 3).
- TODO Phase 2 remaining: index.css night block + --text-on-reward (#2B2824 both themes) + --accent-primary-hover; GameLayout + 4 views; AppHeader (StarBalance, chip→lobby link); MascotGreeting → hero + lobby link; ChallengeBar/HelpModal hero wiring; App.jsx routes/redirect/titles; main.jsx I18nProvider + key={lang}; icons subset; manus-routes.json; DECISIONS; README.
- Old star mascot (public/assets/nour.png) still used by PlaceholderPanel (dashboard placeholder) — not a guide role; keep + log.

## Phase 2 progress (02:11)
- DONE files: index.css (night block [data-theme='night'], body:has(...); --accent-primary-hover, --text-on-reward; .icon--dir mirrors in [dir=ltr]); BrandMark.css (moved from AppHeader.css); StarBalance(.css); AppHeader.jsx (chip = <a href="#/lobby">, StarBalance); MascotGreeting (HeroAvatar, badge=link, strip + "ساحة الأبطال" btn); ChallengeBar (hero avatar, speech bubble, lines: hint idle tip/wrong/celebrate/encourage, `تحدي ${name}`); HelpModal (hero avatar, `مساعدة ${name}`, hint-line bubble .help-modal__guide); GameHeader(.css); views/game/{game.css, HeroSelectView, LobbyView, VaultView, RanksView}(+css).
- REMAINING Phase 2: App.jsx (data-theme night on .app-shell for GAME_VIEWS, GameHeader, routes, redirect no-hero → heroes for catalog+lobby+vault+ranks [not playground/dashboard], titles), main.jsx (I18nProvider + Root key={lang}), index.html icons subset (+home, groups, checkroom, stairs, menu_book, redeem, check, lock, lock_open, explore, workspace_premium, travel_explore, code, arrow_back, chevron_left, radio_button_unchecked), manus-routes.json (+lobby/heroes/vault/ranks), build, QA scripts must seed localStorage heroId (misbar:student:v1) for catalog tests, lab fit check 1366x768 with bubble, DECISIONS lines, commit+push.

## Phase 2 DONE (02:18) — commit 752693ffcb5e9da15053bddbab2fc496ae254dca (origin + github)
QA: /home/ubuntu/work/qa_phase2.py (first visit→#/heroes, pick, lobby, vault, ranks, catalog, lab bubble, help modal; 1366/768/390/320; no errors/404/overflow). Functional: mission claim 12→14 → Inventor, persists; vault unlock at 16 no spend. Screens in /home/ubuntu/work/phase2/.
Icon subset sync: python3 /home/ubuntu/work/sync_icons.py (run after adding icons).
QA scripts clicking hero cards: use '.hero-card:has(input[value="x"])' (radio is visually hidden).
## Phase 3 plan
Toggle in AppHeader, GameHeader, PlaygroundHeader (id lang-toggle; restore focus after remount). Locales: catalog, experiments (needs human review), lab (common + per-sim + guides), dashboard. Speech bubble tail [dir=ltr]. Back arrow icon--dir. SVG stages: keep geometry; check text-anchor. Search in current language.

## Phase 3 in progress (02:21)
- Locale scaffolding: src/i18n/locales/{ar,en}/lab.js ({ sims }) + sims/index.js mapping ids → sims/{motion,lever,orbit,fractions,optics,matter}.js; registered `lab` in both index.js.
- Subagents (background, shared sandbox, edit only their sim + its 2 locale files; screenshots /home/ubuntu/work/phase3/sims/):
  job_dxZM20s8 Motion+Lever, job_kmfxMwbc Orbit+Fractions, job_92T8OaeK Optics+Matter. Must `job wait` before Phase 3 commit.
- MY part: guides.js (→ lab.guides.<id>, HINT_TITLES), experiments.js (titles, descriptions, categories, illustration textKey), components (SimulationWorkspace, SimulationControls common, ResultStrip, ChallengeBar, HelpModal, PlaygroundView, AppHeader, MascotGreeting, BrandMark, SearchBar, CategoryFilters, ExperimentCard, PlaceholderPanel, Fraction, StarBalance ok, ProgressBar), views (CatalogView, DashboardView), data/avatars.js (nickname default), lib/arabic.js formatStarCount, App.jsx titles, state/*.jsx strings, SimulationContext.js. Language toggle in AppHeader/GameHeader/PlaygroundHeader (+ focus restore). Speech-bubble tail [dir=ltr]; playground back arrow icon--dir; index.html meta stays Arabic (default).

## Phase 3 progress (02:27) — MY part
DONE: locales ar|en/catalog.js (title, search, filters.allWithCount, categories, results(count), gridLabel, empty, card.start/level, experiments.<id>{title,description,keywords,art{label,+textKeys heavy/light/result/temperature}});
experiments.js stripped of copy (textKey in shapes; getExperimentCopy(t,id), getCategoryLabel(t,id), buildSearchIndex(t) Map, filterExperiments(exps, filters, searchIndex));
ar/lab.js generated (workspace, results.separator, fraction.spoken, header.back/help, notFound, challenge.{label,tipLead,completedDetail,metDetail,check,claim,done}, help.{title,close,hintTitles,fact,gotIt}, guides (verbatim from data/guides.js), sims); en/lab.js written (needs human review).
TODO next: delete data/guides.js after rewiring (PlaygroundView getGuide → t('lab.guides.'+id); HelpModal HINT_TITLES → t('lab.help.hintTitles')).
Then: app locale (header, greeting, dashboard, placeholder, titles, avatars) + common.defaultNickname ('بطل الفضاء'/'Space Hero'); displayNickname(nickname,t) when nickname===DEFAULT_STUDENT.nickname.
Components to rewire: FlatIllustration (texts prop/textKey), ExperimentCard, CategoryFilters, SearchBar, CatalogView (buildSearchIndex useMemo [t]), DashboardView, PlaceholderPanel (arrow icon--dir), PlaygroundView (+back arrow icon--dir, star counter t), ChallengeBar, HelpModal, SimulationWorkspace, ResultStrip (separator), Fraction (spoken), AppHeader (toggle), MascotGreeting, BrandMark (t common.siteName), Avatar? (aria-hidden — label unused), App.jsx titles, LobbyView nickname.
LanguageToggle component: id="lang-toggle", shows other language (lang attr), module-level flag to refocus after remount. In AppHeader, GameHeader, PlaygroundHeader.
After subagents: check matter sim heat/cool English button labels vs en guide tip ("heat and cool buttons").
