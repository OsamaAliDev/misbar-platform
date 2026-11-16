# Preserved Orbit / Fractions subagent completion report

Source: job_kmfxMwbc, completed 16 November 2026 at 00:26:27 UTC. This is preserved prior evidence, not a newly run handoff test.

Edited only:
- src/simulations/OrbitSimulation.jsx
- src/i18n/locales/ar/sims/orbit.js
- src/i18n/locales/en/sims/orbit.js
- src/simulations/FractionsSimulation.jsx
- src/i18n/locales/ar/sims/fractions.js
- src/i18n/locales/en/sims/fractions.js

Orbit translation keys: starTypes.redDwarf, starTypes.sunLike, starTypes.blueGiant; planets.venus, planets.earth, planets.mars; stage.ariaLabel, stage.distanceUnit, stage.vector.gravity, stage.vector.speed; status.starMass; controls.starMass, controls.starMassUnit, controls.orbitRadius, controls.orbitRadiusUnit, controls.planetPreset, controls.vectors, controls.vectorsDescription; readings.speed, readings.speedUnit, readings.period, readings.periodUnit, readings.gravity, readings.gravityUnit, readings.orbits, readings.orbitsUnit.

Fractions translation keys: presets.ariaLabel; stage.caption.counting, stage.caption.empty, stage.caption.idle, stage.ariaLabel, stage.circle, stage.rectangle; status.zero, status.whole, status.reducible, status.simplest; controls.numerator, controls.denominator, controls.presets, controls.simplify, controls.simplifyDescription; readings.fraction, readings.fractionSpoken, readings.simplest, readings.simplestSpoken, readings.decimal, readings.percent, readings.percentUnit.

Reported verification: Vite build succeeded using ./node_modules/.bin/vite build --outDir /tmp/build-orbit-fractions --emptyOutDir. Playwright covered both routes, both languages, 1366x768 and 390x844, and control interactions. No console/page errors or [i18n] missing-key warnings. Exercised all orbit star states, fraction status states, counting caption and empty-count caption. English simulation-owned visible text contained no Arabic letters. Arabic/English key shapes matched. Mobile DOM checks found no horizontal overflow or out-of-bounds simulation panels. Visual inspection found no translated-label overlap or clipping.

Screenshots are preserved under handoff-evidence/screenshots/phase3/sims/: orbit_ar_1366.png, orbit_ar_390.png, orbit_en_1366.png, orbit_en_390.png, fractions_ar_1366.png, fractions_ar_390.png, fractions_en_1366.png, fractions_en_390.png.

Shared-file limitation: Fraction.jsx still supplies Arabic aria-label text for stacked fractions, including result values and preset labels in English. SimulationWorkspace.jsx and ResultStrip.jsx still contain shared Arabic UI outside the agent's scope. No commit or push was performed by the agent.

Other agents: job_dxZM20s8 (Motion/Lever) and job_92T8OaeK (Optics/Matter) failed due to creditNotEnough at 00:26:54 UTC. Their shared-sandbox source/locale edits are preserved, but no final success reports were delivered. Preserved activity.txt files contain tool step names only, not full validation outputs. HANDOFF.md gives the exact limits; do not mistake failed-job source presence for complete QA.
