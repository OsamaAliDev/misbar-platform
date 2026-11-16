# DECISIONS.md

Each line records one judgment call I made that the brief did not specify: what I chose and why. If a step was blocked, the safe default I used is logged here too.

## Phase 1: Character assets

- **Isolation method:** I cropped each hero from the source image, upscaled it 3× (Lanczos), then ran one AI image edit per hero with a transparent background. The prompts said to preserve face, hair, skin, outfit, colours and render style exactly. Plain background removal could not rebuild the legs hidden behind the name plates or the body hidden behind Nour's rifle.
- **One pass per hero, no re-rolls:** I accepted the first result for all five, after checking them on cream and dark navy. Re-generating risks drifting away from the original faces.
- **Lubna's strap:** the ammo bandolier became a plain olive fabric strap with no cartridges. Lubna's thigh holster also became a closed rectangular tool pouch, under the rule that weapon-like gear becomes a neutral tool.
- **Thigh holsters → closed pouches for Shihab, Suhail and Sharara:** their holster shapes could read as weapon gear, so each became a closed rectangular utility pouch.
- **Flames and energy streaks removed:** this covers Sharara's shoulder and hand flames, Shihab's wrist flames and the glow trail from Nour's rifle. They count as fire or scene effects, which the brief says to remove. Sharara's orange lava-crack *print* on her outfit stays, because it is part of her outfit design.
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
