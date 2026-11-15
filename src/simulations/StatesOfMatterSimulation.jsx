import { useState } from 'react';
import { ControlChoice, ControlQuickActions, ControlSlider } from '../components/SimulationControls.jsx';
import SimulationWorkspace from '../components/SimulationWorkspace.jsx';
import { formatNumber } from '../lib/arabic.js';
import { useChallengeReport, useSimulation } from './SimulationContext.js';
import { approach, clamp, paint, seededRandom, useAnimationFrame } from './simulationUtils.js';

/**
 * حالات المادة والحرارة — water molecules in a heated / cooled chamber.
 * ---------------------------------------------------------------------------
 * Heat model: the chamber holds an "energy" E (in °C-equivalents). The heater
 * moves E towards the slider's target at HEAT_RATE per second. E maps to
 * temperature with two plateaus — latent heat:
 *
 *   E ≤ 0                      solid,  T = E
 *   0 … MELT_HEAT              melting at 0 °C   (fraction melted grows)
 *   … + 100                    liquid, T rises 0 → 100 °C
 *   … + BOIL_HEAT              boiling at 100 °C (fraction boiled grows)
 *   beyond                     gas,    T > 100 °C
 *
 * Every particle is solid, liquid or gas according to those fractions (the
 * outer layer of the ice melts first). Per state:
 *   solid   spring to its lattice site + thermal jiggle
 *   liquid  gravity + collisions, sliding over each other at the bottom
 *   gas     free flight with elastic collisions, filling the chamber
 * A velocity thermostat keeps each particle near its state's thermal speed.
 */

const T_MIN = -20;
const T_MAX = 120;
const MELT_HEAT = 40;
const BOIL_HEAT = 60;
const HEAT_RATE = 30; // energy units per second

// Water molecule (kinetic theory): v_rms = √(3kT/m) ≈ 37.2 · √T(K) m/s
const RMS_SPEED_FACTOR = 37.21;

// Chamber (SVG units, viewBox 640×400)
const CHAMBER = { left: 150, right: 490, top: 58, bottom: 322 };
const PARTICLE_R = 9;
const LATTICE = { cols: 8, rows: 5, spacing: 21 };
const PARTICLE_COUNT = LATTICE.cols * LATTICE.rows;
const SPRING = 160;
const LIQUID_GRAVITY = 900;

const DEFAULT_TARGET = -10;

const STATE_LABELS = { solid: 'صلب', liquid: 'سائل', gas: 'غاز' };
const STATE_COLORS = {
  solid: ['accent-info-soft', 'accent-info-text'],
  liquid: ['accent-primary', 'accent-primary-soft-text'],
  gas: ['surface-subtle', 'text-secondary'],
};

/** Target temperature → chamber energy. */
function energyFor(temperature) {
  if (temperature <= 0) return temperature;
  if (temperature < 100) return temperature + MELT_HEAT;
  return temperature + MELT_HEAT + BOIL_HEAT;
}

/** Chamber energy → { temperature, melted 0…1, boiled 0…1 }. */
function phaseOf(energy) {
  if (energy <= 0) return { temperature: energy, melted: 0, boiled: 0 };
  if (energy < MELT_HEAT) return { temperature: 0, melted: energy / MELT_HEAT, boiled: 0 };
  if (energy <= MELT_HEAT + 100) return { temperature: energy - MELT_HEAT, melted: 1, boiled: 0 };
  if (energy < MELT_HEAT + 100 + BOIL_HEAT) {
    return { temperature: 100, melted: 1, boiled: (energy - MELT_HEAT - 100) / BOIL_HEAT };
  }
  return { temperature: energy - MELT_HEAT - BOIL_HEAT, melted: 1, boiled: 1 };
}

/** Thermal speed (px/s) of a particle in a given state. */
function thermalSpeed(state, temperature) {
  if (state === 'solid') return 30 + (temperature - T_MIN) * 0.8;
  if (state === 'liquid') return 70 + temperature * 0.7;
  return 190 + (temperature - 100) * 2.5;
}

/** Initial particles: an ice block on the chamber floor. */
function createParticles() {
  const random = seededRandom(42);
  const { cols, rows, spacing } = LATTICE;
  const centerX = (CHAMBER.left + CHAMBER.right) / 2;
  const particles = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      const homeX = centerX + (col - (cols - 1) / 2) * spacing;
      const homeY = CHAMBER.bottom - PARTICLE_R - 1 - row * spacing;
      // Outer molecules melt first: rank by distance to the block's edge.
      const edgeDistance = Math.min(col, cols - 1 - col, rows - 1 - row);
      particles.push({ homeX, homeY, x: homeX, y: homeY, vx: 0, vy: 0, edgeDistance, tie: random(), boilRank: random() });
    }
  }
  const meltOrder = [...particles].sort((a, b) => a.edgeDistance - b.edgeDistance || a.tie - b.tie);
  meltOrder.forEach((particle, index) => {
    particle.meltRank = index / PARTICLE_COUNT;
  });
  return particles;
}

const INITIAL_PARTICLES = createParticles();

/** Which state a particle is in for the current melted / boiled fractions. */
function particleState(particle, melted, boiled) {
  if (particle.boilRank < boiled - 1e-9) return 'gas';
  if (particle.meltRank < melted - 1e-9) return 'liquid';
  return 'solid';
}

/** Advance the chamber by `dt` seconds. */
function stepChamber(chamber, dt, target) {
  const energy = approach(chamber.energy, energyFor(target), HEAT_RATE * dt);
  const { temperature, melted, boiled } = phaseOf(energy);
  const substeps = dt > 0.025 ? 2 : 1;
  const h = dt / substeps;
  const particles = chamber.particles.map((p) => ({ ...p }));
  const states = particles.map((p) => particleState(p, melted, boiled));

  for (let s = 0; s < substeps; s += 1) {
    particles.forEach((p, i) => {
      const state = states[i];
      const speed = thermalSpeed(state, temperature);
      let ax = 0;
      let ay = 0;
      if (state === 'solid') {
        ax += SPRING * (p.homeX - p.x);
        ay += SPRING * (p.homeY - p.y);
      } else if (state === 'liquid') {
        ay += LIQUID_GRAVITY;
      }
      const kick = Math.random() * Math.PI * 2;
      ax += Math.cos(kick) * speed * 8;
      ay += Math.sin(kick) * speed * 8;
      p.vx += ax * h;
      p.vy += ay * h;

      // Thermostat: relax the speed towards the state's thermal speed.
      const current = Math.hypot(p.vx, p.vy) || 1;
      const factor = 1 + (speed / current - 1) * Math.min(1, h * (state === 'gas' ? 2 : 5));
      p.vx *= factor;
      p.vy *= factor;

      p.x += p.vx * h;
      p.y += p.vy * h;

      // Walls
      const minX = CHAMBER.left + PARTICLE_R;
      const maxX = CHAMBER.right - PARTICLE_R;
      const minY = CHAMBER.top + PARTICLE_R;
      const maxY = CHAMBER.bottom - PARTICLE_R;
      if (p.x < minX) { p.x = minX; p.vx = Math.abs(p.vx); }
      if (p.x > maxX) { p.x = maxX; p.vx = -Math.abs(p.vx); }
      if (p.y < minY) { p.y = minY; p.vy = Math.abs(p.vy); }
      if (p.y > maxY) { p.y = maxY; p.vy = -Math.abs(p.vy); }
    });

    // Collisions (equal masses): separate overlaps, exchange normal velocity.
    for (let i = 0; i < particles.length; i += 1) {
      for (let j = i + 1; j < particles.length; j += 1) {
        if (states[i] === 'solid' && states[j] === 'solid') continue;
        const a = particles[i];
        const b = particles[j];
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const distSq = dx * dx + dy * dy;
        const minDist = PARTICLE_R * 2;
        if (distSq >= minDist * minDist || distSq === 0) continue;
        const dist = Math.sqrt(distSq);
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = (minDist - dist) / 2;
        a.x -= nx * overlap;
        a.y -= ny * overlap;
        b.x += nx * overlap;
        b.y += ny * overlap;
        const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
        if (relative < 0) {
          a.vx += relative * nx;
          a.vy += relative * ny;
          b.vx -= relative * nx;
          b.vy -= relative * ny;
        }
      }
    }
  }

  // Challenge progress: full gas first, then fully solid again.
  const visitedGas = chamber.visitedGas || boiled >= 1;
  const cycleDone = chamber.cycleDone || (visitedGas && melted <= 0);
  return { energy, particles, visitedGas, cycleDone };
}

export default function StatesOfMatterSimulation() {
  const { running } = useSimulation();
  const [target, setTarget] = useState(DEFAULT_TARGET);
  const [chamber, setChamber] = useState(() => ({
    energy: energyFor(DEFAULT_TARGET),
    particles: INITIAL_PARTICLES,
    visitedGas: false,
    cycleDone: false,
  }));

  useAnimationFrame((dt) => setChamber((current) => stepChamber(current, dt, target)), running);

  useChallengeReport(chamber.cycleDone);

  const { temperature, melted, boiled } = phaseOf(chamber.energy);
  const targetEnergy = energyFor(target);
  const heating = running && targetEnergy > chamber.energy + 1e-6;
  const cooling = running && targetEnergy < chamber.energy - 1e-6;

  // Overall state
  let stateId;
  let stateLabel;
  if (melted <= 0) {
    stateId = 'solid';
    stateLabel = STATE_LABELS.solid;
  } else if (melted < 1) {
    stateId = 'melting';
    stateLabel = cooling ? 'بيتجمد' : 'بينصهر';
  } else if (boiled <= 0) {
    stateId = 'liquid';
    stateLabel = STATE_LABELS.liquid;
  } else if (boiled < 1) {
    stateId = 'boiling';
    stateLabel = cooling ? 'بيتكثف' : 'بيغلي';
  } else {
    stateId = 'gas';
    stateLabel = STATE_LABELS.gas;
  }
  const activeStates = {
    solid: melted < 1,
    liquid: melted > 0 && boiled < 1,
    gas: boiled > 0,
  };

  // -- Stage ---------------------------------------------------------------
  const thermoY = (t) => 316 - ((t - T_MIN) / (T_MAX - T_MIN)) * 246;
  const heaterColor = heating ? 'accent-help' : cooling ? 'accent-info' : 'outline';

  const stage = (
    <svg
      className="sim-svg"
      viewBox="0 0 640 400"
      role="img"
      aria-label={`حجرة فيها جزيئات مية في الحالة: ${stateLabel}، ودرجة الحرارة ${formatNumber(Math.round(temperature))} درجة مئوية`}
    >
      {/* State ladder */}
      {[
        { id: 'gas', y: 96 },
        { id: 'liquid', y: 176 },
        { id: 'solid', y: 256 },
      ].map((item) => {
        const active = activeStates[item.id];
        return (
          <g key={item.id}>
            <rect
              x={22}
              y={item.y}
              width={100}
              height={46}
              rx={20}
              style={paint(active ? 'accent-primary-soft' : 'surface-card', active ? 'accent-primary' : 'outline', 2)}
            />
            <text
              x={72}
              y={item.y + 30}
              textAnchor="middle"
              fontSize="18"
              fontWeight="800"
              style={paint(active ? 'accent-primary-soft-text' : 'text-secondary')}
            >
              {STATE_LABELS[item.id]}
            </text>
          </g>
        );
      })}
      <line x1={72} y1={144} x2={72} y2={174} style={paint(null, 'outline', 3)} />
      <line x1={72} y1={224} x2={72} y2={254} style={paint(null, 'outline', 3)} />

      {/* Chamber */}
      <rect
        x={CHAMBER.left - 8}
        y={CHAMBER.top - 8}
        width={CHAMBER.right - CHAMBER.left + 16}
        height={CHAMBER.bottom - CHAMBER.top + 16}
        rx={18}
        style={paint('surface-card', 'text-secondary', 4)}
      />
      {chamber.particles.map((p, index) => {
        const state = particleState(p, melted, boiled);
        const [fill, stroke] = STATE_COLORS[state];
        return <circle key={index} className="matter-particle" cx={p.x} cy={p.y} r={PARTICLE_R} style={paint(fill, stroke, 2)} />;
      })}

      {/* Heater / cooler plate */}
      <rect x={CHAMBER.left} y={CHAMBER.bottom + 16} width={CHAMBER.right - CHAMBER.left} height={16} rx={8} style={paint(heaterColor)} />
      <text x={(CHAMBER.left + CHAMBER.right) / 2} y={CHAMBER.bottom + 60} textAnchor="middle" fontSize="16" style={paint('text-secondary')}>
        {heating ? 'السخّان شغّال' : cooling ? 'التبريد شغّال' : 'درجة الحرارة ثابتة'}
      </text>

      {/* Thermometer */}
      <rect x={548} y={58} width={24} height={272} rx={12} style={paint('surface-card', 'text-secondary', 3)} />
      <rect x={554} y={thermoY(temperature)} width={12} height={338 - thermoY(temperature)} rx={6} style={paint('accent-help')} />
      <circle cx={560} cy={340} r={20} style={paint('accent-help', 'text-secondary', 3)} />
      {[-20, 0, 50, 100, 120].map((t) => (
        <g key={t}>
          <line x1={572} y1={thermoY(t)} x2={584} y2={thermoY(t)} style={paint(null, 'text-secondary', 2)} />
          <text x={608} y={thermoY(t) + 5} textAnchor="middle" fontSize="14" style={paint('text-secondary')}>
            {`${formatNumber(t)}°`}
          </text>
        </g>
      ))}
      {/* Heater target marker */}
      <polygon
        points={`${546},${thermoY(target)} ${532},${thermoY(target) - 8} ${532},${thermoY(target) + 8}`}
        style={paint('accent-tools', 'accent-tools-text', 1.5)}
      />
    </svg>
  );

  // -- Status chip -----------------------------------------------------------
  const statusByState = {
    solid: { tone: 'info', icon: 'ac_unit', text: 'صلب: الجزيئات بتتذبذب في أماكنها' },
    melting: { tone: 'primary', icon: 'thermostat', text: `${stateLabel}… الحرارة ثابتة عند ٠°م لحد ما التحوّل يخلص` },
    liquid: { tone: 'info', icon: 'water_drop', text: 'سائل: الجزيئات بتنزلق جنب بعض' },
    boiling: { tone: 'primary', icon: 'thermostat', text: `${stateLabel}… الحرارة ثابتة عند ١٠٠°م لحد ما التحوّل يخلص` },
    gas: { tone: 'info', icon: 'air', text: 'غاز: الجزيئات بتطير بحرية في الحجرة كلها' },
  };
  const status = statusByState[stateId];

  const celsius = (value) => `${formatNumber(value)}°م`;
  const changeTarget = (value) => setTarget(clamp(value, T_MIN, T_MAX));
  const controls = (
    <>
      <ControlSlider
        label="درجة حرارة السخّان"
        swatch="accent-help"
        value={target}
        min={T_MIN}
        max={T_MAX}
        format={celsius}
        onChange={changeTarget}
      />
      <ControlQuickActions
        label="تحكم سريع"
        actions={[
          { id: 'heat', label: 'سخّن ١٠°', icon: 'local_fire_department', disabled: target >= T_MAX, onClick: () => changeTarget(target + 10) },
          { id: 'cool', label: 'برّد ١٠°', icon: 'ac_unit', disabled: target <= T_MIN, onClick: () => changeTarget(target - 10) },
        ]}
      />
      <ControlChoice
        label="حضّر المادة بسرعة"
        options={[
          { value: '-10', label: 'ثلج' },
          { value: '25', label: 'مية' },
          { value: '110', label: 'بخار' },
        ]}
        value={String(target)}
        onChange={(value) => changeTarget(Number(value))}
      />
    </>
  );

  const shapeText = stateId === 'solid' ? 'شكل وحجم ثابتين' : stateId === 'gas' ? 'بيملا الحجرة كلها' : 'حجم ثابت وشكل متغيّر';
  const readings = [
    { id: 'temp', label: 'درجة حرارة المادة', value: celsius(Math.round(temperature)) },
    { id: 'state', label: 'الحالة', value: stateLabel, isText: true },
    {
      id: 'speed',
      label: 'سرعة الجزيئات',
      value: formatNumber(Math.round(RMS_SPEED_FACTOR * Math.sqrt(temperature + 273.15))),
      unit: 'م/ث',
    },
    { id: 'shape', label: 'الشكل والحجم', value: shapeText, isText: true },
  ];

  return <SimulationWorkspace controls={controls} stage={stage} status={status} readings={readings} />;
}
