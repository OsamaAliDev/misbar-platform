import { useState } from 'react';
import { ControlChoice, ControlSlider } from '../components/SimulationControls.jsx';
import SimulationWorkspace from '../components/SimulationWorkspace.jsx';
import { formatDecimal, formatNumber } from '../lib/arabic.js';
import { useChallengeReport, useSimulation } from './SimulationContext.js';
import { DEG, paint, useAnimationFrame } from './simulationUtils.js';

/**
 * انعكاس وانكسار الضوء — a light beam crossing the boundary of two media.
 * ---------------------------------------------------------------------------
 *   Reflection:  angle of reflection = angle of incidence
 *   Snell's law: n₁ · sin θ₁ = n₂ · sin θ₂
 *   Critical angle (only when n₁ > n₂): θc = asin(n₂ / n₁)
 *   Above θc there is no refracted ray: total internal reflection.
 *
 * Beam brightness follows the Fresnel equations (unpolarised light), so the
 * reflected ray is faint at small angles and gets brighter near grazing and
 * total internal reflection. Play/Pause runs light pulses along the rays.
 */

const MEDIA = {
  air: { label: 'الهواء', n: 1.0, fill: 'surface-card' },
  water: { label: 'الماء', n: 1.33, fill: 'accent-info-soft' },
  glass: { label: 'الزجاج', n: 1.5, fill: 'accent-primary-soft' },
};
const MEDIUM_OPTIONS = Object.entries(MEDIA).map(([value, medium]) => ({ value, label: medium.label }));

// Drawing (SVG units, viewBox 640×400)
const HIT_X = 320;
const HIT_Y = 200;
const SOURCE_DISTANCE = 150; // from the hit point to the laser's aperture
const RAY_LENGTH = 240;
const PULSE_PERIOD = 1.4; // seconds for a pulse to travel one ray

const DEFAULTS = { angle: 40, from: 'air', to: 'water' };

/** Unpolarised Fresnel reflectance (0…1). */
function reflectance(n1, n2, incidence, refraction) {
  if (n1 === n2) return 0;
  const ci = Math.cos(incidence);
  const ct = Math.cos(refraction);
  const rs = ((n1 * ci - n2 * ct) / (n1 * ci + n2 * ct)) ** 2;
  const rp = ((n1 * ct - n2 * ci) / (n1 * ct + n2 * ci)) ** 2;
  return (rs + rp) / 2;
}

/** A flat "outlined" light beam: dark edge underneath, yellow core on top. */
function Beam({ from, to, opacity = 1 }) {
  return (
    <g style={{ opacity }}>
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} strokeLinecap="round" style={paint(null, 'accent-reward-text', 10)} />
      <line x1={from.x} y1={from.y} x2={to.x} y2={to.y} strokeLinecap="round" style={paint(null, 'accent-reward', 5)} />
    </g>
  );
}

/** Angle arc around the hit point, from `startDeg` to `endDeg` (SVG angles). */
function AngleArc({ startDeg, endDeg, radius, color, label, labelRadius }) {
  if (Math.abs(endDeg - startDeg) < 2) return null;
  const point = (deg, r) => ({ x: HIT_X + r * Math.cos(deg * DEG), y: HIT_Y + r * Math.sin(deg * DEG) });
  const start = point(startDeg, radius);
  const end = point(endDeg, radius);
  const sweep = endDeg > startDeg ? 1 : 0;
  const mid = point((startDeg + endDeg) / 2, labelRadius);
  return (
    <g>
      <path d={`M ${start.x} ${start.y} A ${radius} ${radius} 0 0 ${sweep} ${end.x} ${end.y}`} style={paint(null, color, 3)} />
      <text
        x={mid.x}
        y={mid.y + 6}
        textAnchor="middle"
        fontSize="17"
        fontWeight="800"
        style={{ ...paint('text-primary'), stroke: 'var(--surface-card)', strokeWidth: 5, paintOrder: 'stroke' }}
      >
        {label}
      </text>
    </g>
  );
}

export default function OpticsSimulation() {
  const { running } = useSimulation();
  const [angle, setAngle] = useState(DEFAULTS.angle);
  const [fromId, setFromId] = useState(DEFAULTS.from);
  const [toId, setToId] = useState(DEFAULTS.to);
  const [phase, setPhase] = useState(0);

  useAnimationFrame((dt) => setPhase((p) => (p + dt / PULSE_PERIOD) % 1), running);

  const from = MEDIA[fromId];
  const to = MEDIA[toId];
  const incidence = angle * DEG;
  const sinRefraction = (from.n / to.n) * Math.sin(incidence);
  const totalReflection = sinRefraction > 1;
  const refraction = totalReflection ? null : Math.asin(sinRefraction);
  const critical = from.n > to.n ? Math.asin(to.n / from.n) : null;
  const reflected = totalReflection ? 1 : reflectance(from.n, to.n, incidence, refraction);

  // Challenge: total internal reflection.
  useChallengeReport(totalReflection);

  // -- Geometry -------------------------------------------------------------
  const hit = { x: HIT_X, y: HIT_Y };
  const source = { x: HIT_X + SOURCE_DISTANCE * Math.sin(incidence), y: HIT_Y - SOURCE_DISTANCE * Math.cos(incidence) };
  const reflectEnd = { x: HIT_X - RAY_LENGTH * Math.sin(incidence), y: HIT_Y - RAY_LENGTH * Math.cos(incidence) };
  const refractEnd = refraction === null
    ? null
    : { x: HIT_X - RAY_LENGTH * Math.sin(refraction), y: HIT_Y + RAY_LENGTH * Math.cos(refraction) };
  const laserRotation = Math.atan2(HIT_Y - source.y, HIT_X - source.x) / DEG;

  // Brightness (kept visible even when physically faint).
  const reflectedOpacity = Math.max(0.22, reflected);
  const refractedOpacity = Math.max(0.3, 1 - reflected);

  // Light pulses: three per ray, travelling source → boundary → onwards.
  const pulses = [0, 1 / 3, 2 / 3].map((offset) => (phase + offset) % 1);
  const along = (a, b, t) => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });

  const refractionDeg = refraction === null ? null : refraction / DEG;

  const stage = (
    <svg
      className="sim-svg"
      viewBox="0 0 640 400"
      role="img"
      aria-label={`شعاع ضوء خارج من ${from.label} إلى ${to.label} بزاوية سقوط ${formatNumber(angle)} درجة`}
    >
      {/* The two media */}
      <rect x={-640} y={-200} width={1920} height={400} style={paint(from.fill)} />
      <rect x={-640} y={HIT_Y} width={1920} height={400} style={paint(to.fill)} />
      <line x1={-640} y1={HIT_Y} x2={1280} y2={HIT_Y} style={paint(null, 'text-secondary', 3)} />

      {/* Medium labels */}
      <text x={560} y={40} textAnchor="middle" fontSize="20" fontWeight="800" style={paint('text-primary')}>
        {from.label}
      </text>
      <text x={560} y={64} textAnchor="middle" fontSize="14" style={paint('text-secondary')}>
        {`معامل الانكسار ${formatDecimal(from.n, 2, 2)}`}
      </text>
      <text x={560} y={352} textAnchor="middle" fontSize="20" fontWeight="800" style={paint('text-primary')}>
        {to.label}
      </text>
      <text x={560} y={376} textAnchor="middle" fontSize="14" style={paint('text-secondary')}>
        {`معامل الانكسار ${formatDecimal(to.n, 2, 2)}`}
      </text>

      {/* Normal */}
      <line x1={HIT_X} y1={24} x2={HIT_X} y2={376} strokeDasharray="8 7" style={paint(null, 'text-secondary', 2)} />

      {/* Rays */}
      <Beam from={hit} to={reflectEnd} opacity={reflectedOpacity} />
      {refractEnd ? <Beam from={hit} to={refractEnd} opacity={refractedOpacity} /> : null}
      <Beam from={source} to={hit} />

      {/* Light pulses */}
      {running
        ? pulses.map((t) => (
            <g key={t}>
              <circle {...toCircle(along(source, hit, t))} r={5} style={paint('surface-card', 'accent-reward-text', 2)} />
              <circle
                {...toCircle(along(hit, reflectEnd, t))}
                r={5}
                style={{ ...paint('surface-card', 'accent-reward-text', 2), opacity: reflectedOpacity }}
              />
              {refractEnd ? (
                <circle
                  {...toCircle(along(hit, refractEnd, t))}
                  r={5}
                  style={{ ...paint('surface-card', 'accent-reward-text', 2), opacity: refractedOpacity }}
                />
              ) : null}
            </g>
          ))
        : null}

      {/* Angle arcs (SVG angles: −90° is up, 90° is down) */}
      <AngleArc startDeg={-90} endDeg={-90 + angle} radius={58} labelRadius={88} color="accent-reward-text" label={`${formatNumber(angle)}°`} />
      <AngleArc startDeg={-90} endDeg={-90 - angle} radius={46} labelRadius={76} color="accent-tools" label={`${formatNumber(angle)}°`} />
      {refractionDeg !== null ? (
        <AngleArc
          startDeg={90}
          endDeg={90 + refractionDeg}
          radius={58}
          labelRadius={88}
          color="accent-info-text"
          label={`${formatDecimal(refractionDeg)}°`}
        />
      ) : null}

      {/* Laser source */}
      <g transform={`translate(${source.x} ${source.y}) rotate(${laserRotation})`}>
        <rect x={-54} y={-15} width={54} height={30} rx={8} style={paint('text-primary')} />
        <rect x={-6} y={-7} width={8} height={14} rx={2} style={paint('accent-reward')} />
        <circle cx={-40} cy={0} r={4} style={paint('accent-help')} />
      </g>

      {/* Boundary point */}
      <circle cx={HIT_X} cy={HIT_Y} r={6} style={paint('surface-card', 'text-primary', 3)} />
    </svg>
  );

  // -- Status chip -----------------------------------------------------------
  let status;
  if (totalReflection) {
    status = { tone: 'reward', icon: 'flare', text: 'انعكاس كلّي داخلي! الضوء كله ارتد ومعدّاش' };
  } else if (from.n === to.n) {
    status = { tone: 'info', icon: 'info', text: 'نفس الوسط: الضوء بيكمل في خط مستقيم من غير انكسار' };
  } else if (angle === 0) {
    status = { tone: 'info', icon: 'info', text: 'الضوء نازل عمودي على السطح، فمش بيغيّر اتجاهه' };
  } else if (to.n > from.n) {
    status = { tone: 'primary', icon: 'info', text: 'الضوء دخل وسط أكثف، فقرّب من العمود المقام' };
  } else {
    status = { tone: 'tools', icon: 'info', text: 'الضوء دخل وسط أقل كثافة، فبعد عن العمود المقام' };
  }

  const degrees = (value) => `${formatNumber(value)}°`;
  const controls = (
    <>
      <ControlSlider
        label="زاوية السقوط"
        swatch="accent-reward"
        value={angle}
        min={0}
        max={85}
        format={degrees}
        onChange={setAngle}
      />
      <ControlChoice label="الوسط الأول (اللي جاي منه الضوء)" options={MEDIUM_OPTIONS} value={fromId} onChange={setFromId} />
      <ControlChoice label="الوسط التاني" options={MEDIUM_OPTIONS} value={toId} onChange={setToId} />
    </>
  );

  const readings = [
    { id: 'incidence', label: 'زاوية السقوط', value: degrees(angle) },
    { id: 'reflection', label: 'زاوية الانعكاس', value: degrees(angle) },
    totalReflection
      ? { id: 'refraction', label: 'زاوية الانكسار', value: 'مفيش انكسار', isText: true }
      : { id: 'refraction', label: 'زاوية الانكسار', value: `${formatDecimal(refractionDeg)}°` },
    critical === null
      ? { id: 'critical', label: 'الزاوية الحرجة', value: 'مفيش', isText: true }
      : { id: 'critical', label: 'الزاوية الحرجة', value: `${formatDecimal(critical / DEG)}°` },
    { id: 'reflected', label: 'الضوء المنعكس', value: formatNumber(Math.round(reflected * 100)), unit: '٪' },
  ];

  return <SimulationWorkspace controls={controls} stage={stage} status={status} readings={readings} />;
}

/** {x, y} → circle centre props. */
function toCircle(point) {
  return { cx: point.x, cy: point.y };
}
