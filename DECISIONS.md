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
