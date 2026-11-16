# DESIGN.md — دليل التصميم لمنصة مِسبار

This document describes the **locked** design system implemented in [`src/index.css`](./src/index.css). It replaces the earlier draft palette. The Stitch kit (`stitch_misbar_design_system`) is the structural blueprint for layouts, copy and illustrations, but its exported colours are overridden by the tokens below.

## 1. Principles

The UI is **strictly flat**. There are no shadows, no gradients and no frosted-glass or blur effects. Depth comes from 2px outlines and tinted "soft" surfaces. Pressed controls drop by 2px instead of casting a shadow.

There are **no Unicode emoji**. Pictograms are crisp inline SVG or Material Symbols Outlined icons.

The document is **RTL Arabic** (`dir="rtl" lang="ar"`). Numbers in the UI use Arabic-Indic digits (١٢، ٣/٤).

## 2. Colour tokens

| Token | Value | Use |
| --- | --- | --- |
| `--bg-canvas` | `#FBF6EF` | page background, illustration boxes |
| `--surface-card` | `#FFFFFF` | cards, header, inputs |
| `--surface-subtle` | `#F5EDE2` | subtle fills (mascot badge) |
| `--outline` | `#E3D9CC` | all 2px borders, empty stars |
| `--text-primary` | `#2B2824` | headings & body text |
| `--text-secondary` | `#5C5650` | descriptions, placeholders |
| `--accent-primary` / `-text` | `#2F8FE0` / `#FFFFFF` | primary actions ("ابدأ التجربة"), active filter |
| `--accent-primary-soft` / `-soft-text` | `#D6E9FA` / `#1B5E99` | soft primary tints |
| `--accent-reward` / `-soft` / `-text` | `#F0B429` / `#FCEBC0` / `#6E4F00` | stars, rewards, "قريباً" |
| `--accent-help` / `-soft` / `-text` | `#EF6B5E` / `#FDE0DC` / `#8A2A21` | help, teacher/parent portal |
| `--accent-tools` / `-soft` / `-text` | `#9B5DE0` / `#EBDDFA` / `#5B2E99` | physics badge, tools & sliders |
| `--accent-info` / `-soft` / `-text` | `#53BBD9` / `#D9F0F7` / `#1B6279` | math & astronomy badges, live info |

Do not add colours outside this table. Illustrations reference these tokens by name (for example `fill: 'accent-tools-soft'`) instead of hard-coded hex values.

## 3. Shape

Cards, the header, the search bar and buttons use a `2px solid var(--outline)` border and a `20px` radius. Boxes nested inside a card (such as illustration boxes) use `16px`. Non-interactive badges and avatars are fully rounded.

## 4. Typography

**Cairo** is the only typeface, in weights 400 (body), 600 (inputs), 700 (labels & buttons) and 800 (titles & wordmark). Card titles are 17px/800 and body text is at least 14px.

## 5. Layout & touch

The content sits in a centred container with a maximum width of 1280px. The experiment grid has 3 columns on desktop (≥ 1024px), 2 on tablets (600–1023px) and 1 on phones (< 600px). Filter pills wrap rather than scroll, and become an even 2×2 grid at ≤ 480px. Every interactive element is at least 44×44px, with no horizontal scrolling from 320px upwards.

## 6. Mascot — «نُور»

Nour is a friendly glowing star. The asset is `public/assets/nour.png`, a transparent PNG with no background box. Nour greets the student in the header on desktop and in a speech-bubble strip on smaller screens. In Batch 2 Nour will give hints inside the Playground.

## 7. Motion

Motion is short and physical: views and cards rise 8px while fading in over about 260ms, and buttons press down 2px. `prefers-reduced-motion` disables all animation.
