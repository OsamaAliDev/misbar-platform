import { useState } from 'react';
import { ControlChoice, ControlSlider, ControlToggle } from '../components/SimulationControls.jsx';
import SimulationWorkspace from '../components/SimulationWorkspace.jsx';
import { formatDecimal, formatNumber } from '../lib/arabic.js';
import { useI18n } from '../i18n/index.jsx';
import { useChallengeReport, useSimulation } from './SimulationContext.js';
import { SvgArrow } from './SvgArrow.jsx';
import { clamp, paint, seededRandom, useAnimationFrame } from './simulationUtils.js';

/**
 * مسار الكواكب والجاذبية — a planet on a circular orbit.
 * ---------------------------------------------------------------------------
 * Units: star mass M in solar masses, orbital radius r in astronomical units
 * (و.ف = Earth–Sun distance). With those units Newton + Kepler become:
 *
 *   period         T = √(r³ / M)          years   (Kepler's third law)
 *   orbital speed  v = 29.78 · √(M / r)   km/s    (Earth: 29.78 km/s)
 *   gravity        g = M / r²             × the Sun's pull on Earth
 *
 * One simulated year lasts SECONDS_PER_YEAR seconds on screen. The drawing
 * radius is an affine scale (so tiny orbits never touch the star); the ring
 * labels use the same scale.
 */

const CENTER_X = 320;
const CENTER_Y = 200;
const SECONDS_PER_YEAR = 4;
const EARTH_ORBITAL_SPEED = 29.78; // km/s
const DAYS_PER_YEAR = 365.25;
const TWO_PI = Math.PI * 2;

/** Orbital radius (AU) → drawing radius (px). */
const orbitPx = (au) => 30 + au * 50;
/** Star drawing radius (px) grows with its mass. */
const starPx = (mass) => 12 + mass * 6;

const DEFAULTS = { mass: 1, radius: 1.5, vectors: true };

/** Real planets of our Solar System (M = 1 solar mass). */
const PLANET_PRESETS = [
  { value: '0.7', labelKey: 'planets.venus', radius: 0.7 },
  { value: '1', labelKey: 'planets.earth', radius: 1 },
  { value: '1.5', labelKey: 'planets.mars', radius: 1.5 },
];

/** Fixed background star field (same on every visit). */
const BACKGROUND_STARS = (() => {
  const random = seededRandom(7);
  return Array.from({ length: 70 }, (_, i) => ({
    id: i,
    x: -320 + random() * 1280,
    y: random() * 400,
    r: 1 + random() * 1.4,
  }));
})();

/** Star family by mass (a simplified main-sequence picture). */
function starType(mass) {
  if (mass < 0.8) return { nameKey: 'starTypes.redDwarf', tone: 'help', fill: 'accent-help', halo: 'accent-help-soft', edge: 'accent-help-text' };
  if (mass <= 1.6) return { nameKey: 'starTypes.sunLike', tone: 'reward', fill: 'accent-reward', halo: 'accent-reward-soft', edge: 'accent-reward-text' };
  return { nameKey: 'starTypes.blueGiant', tone: 'info', fill: 'accent-info', halo: 'accent-info-soft', edge: 'accent-info-text' };
}

export default function OrbitSimulation() {
  const { t, lang } = useI18n();
  const s = (key, vars) => t(`lab.sims.planet-orbits.${key}`, vars);
  const { running } = useSimulation();
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [radius, setRadius] = useState(DEFAULTS.radius);
  const [vectors, setVectors] = useState(DEFAULTS.vectors);
  // phi: planet angle (rad); travelled: angle covered since the last change.
  const [orbit, setOrbit] = useState({ phi: 0.6, travelled: 0 });

  const periodYears = Math.sqrt(radius ** 3 / mass);
  const periodDays = periodYears * DAYS_PER_YEAR;
  const speed = EARTH_ORBITAL_SPEED * Math.sqrt(mass / radius);
  const gravity = mass / radius ** 2;
  const completedOrbits = Math.floor(orbit.travelled / TWO_PI);

  useAnimationFrame((dt) => {
    const dPhi = (TWO_PI / (periodYears * SECONDS_PER_YEAR)) * dt;
    setOrbit((current) => ({ phi: (current.phi + dPhi) % TWO_PI, travelled: current.travelled + dPhi }));
  }, running);

  /** Changing the system restarts the orbit counter. */
  const restartCount = () => setOrbit((current) => ({ ...current, travelled: 0 }));
  const changeMass = (value) => {
    setMass(value);
    restartCount();
  };
  const changeRadius = (value) => {
    setRadius(value);
    restartCount();
  };

  // Challenge: a ~365-day year (±2%) around a star that is not Sun-like in mass,
  // after at least one full orbit with those settings.
  useChallengeReport(
    Math.abs(periodDays - DAYS_PER_YEAR) / DAYS_PER_YEAR <= 0.02 && Math.abs(mass - 1) > 1e-9 && completedOrbits >= 1,
  );

  // -- Stage ---------------------------------------------------------------
  const type = starType(mass);
  const typeName = s(type.nameKey);
  const starR = starPx(mass);
  const orbitR = orbitPx(radius);
  const planetX = CENTER_X + orbitR * Math.cos(orbit.phi);
  const planetY = CENTER_Y - orbitR * Math.sin(orbit.phi);

  // Trail: the last ~60° of the path (counter-clockwise motion).
  const trailStart = orbit.phi - 1.05;
  const trailPath = `M ${CENTER_X + orbitR * Math.cos(trailStart)} ${CENTER_Y - orbitR * Math.sin(trailStart)} A ${orbitR} ${orbitR} 0 0 0 ${planetX} ${planetY}`;

  // Vectors: gravity points to the star, velocity is tangent to the orbit.
  const gravityLength = clamp(14 + 26 * Math.sqrt(gravity), 0, orbitR - starR - 16);
  const velocityLength = 24 + 26 * Math.sqrt(mass / radius);
  const toStar = { x: (CENTER_X - planetX) / orbitR, y: (CENTER_Y - planetY) / orbitR };
  const tangent = { x: -Math.sin(orbit.phi), y: -Math.cos(orbit.phi) };

  const stage = (
    <svg
      className="sim-svg"
      viewBox="0 0 640 400"
      role="img"
      aria-label={s('stage.ariaLabel', { star: typeName, radius: formatDecimal(radius) })}
    >
      {BACKGROUND_STARS.map((star) => (
        <circle key={star.id} cx={star.x} cy={star.y} r={star.r} style={paint('outline')} />
      ))}

      {/* Distance rings (1, 2, 3 AU) */}
      {[1, 2, 3].map((au) => {
        const r = orbitPx(au);
        return (
          <g key={au}>
            <circle cx={CENTER_X} cy={CENTER_Y} r={r} style={paint(null, 'outline', 1.5)} />
            <text
              x={CENTER_X + r * 0.71}
              y={CENTER_Y + r * 0.71 + 6}
              textAnchor="middle"
              fontSize="14"
              style={{ ...paint('text-secondary'), stroke: 'var(--surface-card)', strokeWidth: 5, paintOrder: 'stroke' }}
            >
              {`${formatNumber(au)} ${s('stage.distanceUnit')}`}
            </text>
          </g>
        );
      })}

      {/* Orbit path + trail */}
      <circle cx={CENTER_X} cy={CENTER_Y} r={orbitR} strokeDasharray="8 8" style={paint(null, 'accent-primary', 2.5)} />
      <path d={trailPath} strokeLinecap="round" style={paint(null, 'accent-primary-soft', 9)} />

      {/* Star: flat halo, core and slowly turning rays */}
      <circle cx={CENTER_X} cy={CENTER_Y} r={starR + 12} style={paint(type.halo)} />
      <g transform={`rotate(${(orbit.phi * 180) / Math.PI / 3} ${CENTER_X} ${CENTER_Y})`}>
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i * Math.PI) / 4;
          return (
            <line
              key={i}
              x1={CENTER_X + (starR + 4) * Math.cos(a)}
              y1={CENTER_Y + (starR + 4) * Math.sin(a)}
              x2={CENTER_X + (starR + 10) * Math.cos(a)}
              y2={CENTER_Y + (starR + 10) * Math.sin(a)}
              strokeLinecap="round"
              style={paint(null, type.fill, 3)}
            />
          );
        })}
      </g>
      <circle cx={CENTER_X} cy={CENTER_Y} r={starR} style={paint(type.fill, type.edge, 2.5)} />

      {/* Vectors */}
      {vectors ? (
        <>
          {gravityLength >= 12 ? (
            <SvgArrow
              x1={planetX + toStar.x * 14}
              y1={planetY + toStar.y * 14}
              x2={planetX + toStar.x * (14 + gravityLength)}
              y2={planetY + toStar.y * (14 + gravityLength)}
              color="var(--accent-help)"
              width={5}
            />
          ) : null}
          <SvgArrow
            x1={planetX + tangent.x * 14}
            y1={planetY + tangent.y * 14}
            x2={planetX + tangent.x * (14 + velocityLength)}
            y2={planetY + tangent.y * (14 + velocityLength)}
            color="var(--accent-info)"
            width={5}
          />
          {[
            { x: 590, color: 'accent-help', key: 'gravity' },
            { x: 500, color: 'accent-info', key: 'speed' },
          ].map((item) => (
            <g key={item.key}>
              <SvgArrow x1={item.x + 24} y1={26} x2={item.x - 24} y2={26} color={`var(--${item.color})`} width={4} />
              <text x={item.x} y={54} textAnchor="middle" fontSize="15" style={paint('text-secondary')}>
                {s(`stage.vector.${item.key}`)}
              </text>
            </g>
          ))}
        </>
      ) : null}

      {/* Planet */}
      <circle cx={planetX} cy={planetY} r={12} style={paint('accent-primary', 'text-primary', 2.5)} />
      <circle cx={planetX - 3} cy={planetY - 3} r={3.5} style={paint('accent-primary-soft')} />
    </svg>
  );

  const status = { tone: type.tone, icon: 'flare', text: s('status.starMass', { name: typeName, value: formatDecimal(mass) }) };
  const planetOptions = PLANET_PRESETS.map((option) => ({ ...option, label: s(option.labelKey) }));

  const controls = (
    <>
      <ControlSlider
        label={s('controls.starMass')}
        swatch={type.fill}
        value={mass}
        min={0.5}
        max={3}
        step={0.1}
        unit={s('controls.starMassUnit')}
        format={(value) => formatDecimal(value, 1, 1)}
        onChange={changeMass}
      />
      <ControlSlider
        label={s('controls.orbitRadius')}
        swatch="accent-primary"
        value={radius}
        min={0.5}
        max={3}
        step={0.1}
        unit={s('controls.orbitRadiusUnit')}
        format={(value) => formatDecimal(value, 1, 1)}
        onChange={changeRadius}
      />
      <ControlChoice
        label={s('controls.planetPreset')}
        options={planetOptions}
        isSelected={(option) => mass === 1 && radius === option.radius}
        onChange={(_, option) => {
          setMass(1);
          setRadius(option.radius);
          restartCount();
        }}
      />
      <ControlToggle
        label={s('controls.vectors')}
        description={s('controls.vectorsDescription')}
        checked={vectors}
        onChange={setVectors}
      />
    </>
  );

  const readings = [
    { id: 'speed', label: s('readings.speed'), value: formatDecimal(speed), unit: s('readings.speedUnit') },
    { id: 'period', label: s('readings.period'), value: formatNumber(Math.round(periodDays)), unit: s('readings.periodUnit') },
    { id: 'gravity', label: s('readings.gravity'), value: formatDecimal(gravity, 2), unit: s('readings.gravityUnit') },
    { id: 'orbits', label: s('readings.orbits'), value: formatNumber(completedOrbits), unit: s('readings.orbitsUnit') },
  ];

  return <SimulationWorkspace controls={controls} stage={stage} status={status} readings={readings} />;
}
