# Misbar (مِسبار): Full autonomous build brief for Manus

GO. Phase 0 is approved. Run ALL phases below back to back (Phase 1, 2, 3, 4) WITHOUT stopping and WITHOUT asking me for confirmation. Make reasonable decisions yourself. Stop only once, at the very end, with the final report. The only reason to stop earlier is a technical blocker you truly cannot work around (for example, no push access). In that case, do everything else you can, then report the blocker.

Attached: one image of 5 hero characters side by side (Lubna, Shihab, Nour, Suhail, Sharara, left to right).

## Working rules
- The project uses PLAIN CSS with CSS variables (confirmed in Phase 0). It is not Tailwind. Add NO new dependencies. Build the language support and hash routes with the existing stack only.
- Do not change experiment logic, the catalog layout or the lab screens' look. Existing screens must keep working exactly as before. Re-test them at the end.
- Commit and push to `main` at the end of EACH phase with a clear message. These commits are my rollback points. Never force-push. Never rewrite history.
- Create `DECISIONS.md` in the repo. Whenever you make a judgment call (a choice I did not specify), add one line: what you chose and why. If a step is blocked, choose the safest default, log it, and continue.
- Never claim something works unless you verified it yourself in a running build. In the final report, separate "verified" from "NOT verified".
- Save full-size screenshots in `/docs/screenshots/` (committed) and also show them in the final report, one per section.

## Absolute content rules
- NO unsuitable props, aggressive scenes or aggressive wording anywhere: UI text, rank names, hero titles, mission names, guide lines, images, animations, code comments.
- Children's privacy: nickname and avatar only. No real name, photo, email or phone. Progress stays in localStorage.
- Do not copy any existing game's characters, logos or UI.

## Existing design system (catalog and lab stay on it)
Cream background #FBF6EF, cards #FFFFFF, borders #E3D9CC at 2px, 20px corners, text #2B2824. No shadows, gradients or emoji. Accents, one role each: blue #2F8FE0 (main actions), mustard #F0B429 (stars and rewards), coral #EF6B5E (help), purple #9B5DE0 (tools), cyan #53BBD9 (info and live results). Cairo font only. Material Symbols Outlined icons. All colors as CSS variables, never hardcoded.

## PHASE 1: Character assets
Separate the attached image into 5 individual full-body transparent PNGs. Keep face, hair, skin tone, proportions, outfit design, colors and rendering style EXACTLY as in the image. Do not redraw or restyle. Remove name plates, numbers, scenery, smoke, fire, embers and the original scene's shadows.

Only allowed edits:
- Nour: remove the source prop completely. Hands empty and relaxed at the sides. Armor and glowing gauntlets unchanged.
- Lubna: replace the source chest strap across her chest with a plain fabric tool strap in the same purple and olive colors.
- Any other gear that looks like a unsuitable prop becomes a neutral tool or is removed.
- If a body part is hidden or overlapped in the source, reconstruct it consistently with the visible design.

Output: PNG originals (at least 1024x1536) kept in `/assets-src/heroes/` (not shipped in the build), plus optimized WebP (about 600x900, under 200 KB each) in `/public/heroes/` named `lubna-outfit1.webp`, `shihab-outfit1.webp`, `nour-outfit1.webp`, `suhail-outfit1.webp`, `sharara-outfit1.webp`. Edges must be clean on both light and dark backgrounds (no white halo). Commit and push.

## PHASE 2: Hero system and game screens
Concept: the student picks ONE of 5 heroes. The chosen hero becomes the student's guide. It appears in hint areas with a speech bubble and in feedback (celebrate, encourage, hint, gentle reaction to a wrong answer). The old glowing-star mascot is retired from the guide role (keep its file, just stop using it as the guide).

Heroes (bilingual names):
- Lubna / لبنى: laser and code engineer, purple.
- Shihab / شهاب: speed racer, blue.
- Suhail / سهيل: space explorer, cyan.
- Sharara / شرارة: energy and heat expert, coral.
- Nour / نُور: boy, title not decided yet. Use one neutral placeholder title ("Misbar Hero" / "بطل مِسبار") stored as a single constant so I can change it in one place.

Routes (reuse the existing hash router): `/lobby`, `/heroes`, `/vault`, `/ranks`, plus a link from the header and catalog to the lobby.
- Hero select: 5 hero cards. Selecting one saves the choice in localStorage. First-time students are sent here. Short idle animation with plain CSS only (breathing, gentle bounce, scale). No advanced body animation.
- Lobby: chosen hero large, nickname, star count, current rank with progress to the next rank, 2 to 3 mission cards, a primary button to enter the experiment library.
- Vault (outfits): outfit 1 exists for each hero. Show further slots as locked placeholders with a star cost. Unlock by star count, stored in localStorage. Do NOT generate new outfit art.
- Ranks: discovery-focused ladder driven by total stars: Young Explorer, Inventor, Lab Captain, Discovery Commander, Master Scientist (with Arabic equivalents). Star thresholds are yours to pick; log them in DECISIONS.md and keep them in one config file.
- Missions: simple tasks tied to the existing experiments (for example, "finish 2 experiments"), rewarded with stars. Stored in localStorage. Reuse the existing star/progress logic; do not duplicate it.
- Guide lines: each hero gets 4 short lines per situation (celebrate, encourage, hint, wrong answer) in simple Arabic (Egyptian-friendly, kid-level) and in English. Kind, short, discovery-focused. Wire the chosen hero's lines into the existing hint and feedback spots in the lab.
- Night mode: ONLY on `/lobby`, `/heroes`, `/vault`, `/ranks`, as a scoped theme via CSS variables (for example `[data-theme="night"]` on the game-screens wrapper). The catalog and lab stay cream. Choose a dark base that fits the existing 5 accents and keep the same accent roles (mustard for stars, blue for main actions, and so on). Do not invent a new color style. All night colors must be variables in one block so I can adjust them later.
- Performance: hero images lazy-loaded with explicit width and height. Pages must stay fast on a mid-range phone.

## PHASE 3: English language support
- Language toggle (Arabic / English) in the header. Arabic is the default. Persist the choice in localStorage.
- Move ALL UI text to translation files (catalog, lab, game screens, hero lines, ranks, missions, help). No hardcoded strings left. Build a tiny custom translation helper; no new library.
- Arabic = RTL, English = LTR. Switch `dir` and `lang` on the root element, and mirror layout, icons and arrows correctly (back arrows, progress direction, speech bubble tails, sliders).
- Cairo supports Latin text; keep it as the only font.
- Translate the 6 experiments' titles, descriptions and help text. Add a comment `needs human review` on the English science wording.
- Test mobile width (390px) in both languages. Long English words must not break cards or buttons.

## PHASE 4: Final QA and report
- Clean install and build from a fresh clone of GitHub `main`. No console errors. No missing assets (check 404s).
- Run through: first visit, hero select, lobby, one experiment end to end, star earning, rank change, vault unlock, mission completion, language switch in both directions, and reload (localStorage persists).
- Check that no unsuitable wording or imagery exists anywhere (search the code and the strings).
- Confirm the catalog and lab look is unchanged versus before this brief.

## Final report format (one message, at the end)
1. Commit hash for each phase and the GitHub link.
2. A table of what was done per phase: Verified / NOT verified.
3. `DECISIONS.md` contents (every judgment call).
4. Screenshots in `/docs/screenshots/` and shown here, one per section, full size: each of the 5 hero images on a plain background; hero select; lobby (Arabic and English); vault; ranks; one lab screen with the hero guide speech bubble; the catalog in Arabic and in English at mobile width.
5. Known problems and anything I should decide.
