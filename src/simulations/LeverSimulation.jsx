import { useState } from 'react';
import { ControlSlider } from '../components/SimulationControls.jsx';
import SimulationWorkspace from '../components/SimulationWorkspace.jsx';
import { formatDecimal, formatNumber } from '../lib/arabic.js';
import { useChallengeReport, useSimulation } from './SimulationContext.js';
import { DEG, clamp, paint, useAnimationFrame } from './simulationUtils.js';

/**
 * توازن القوى والرافعة — torques on a beam balance.
 * ---------------------------------------------------------------------------
 *   τ = weight × distance = (m · g) · d          (N·m)
 *
 * The beam turns under the net torque (τ_right − τ_left). Like a real school
 * beam balance, its pivot sits slightly above the beam's centre of mass, so a
 * small restoring torque (K·sin θ) brings a balanced beam back to level and a
 * small imbalance gives a small, steady tilt. A big imbalance tilts it until
 * the end rests on the ground. Integration: semi-implicit Euler with damping.
 *
 * Angle convention: θ > 0 means the right side goes down (clockwise in SVG).
 */

const GRAVITY = 10; // m/s²

// Drawing (SVG units, viewBox 640×400)
const PIVOT_X = 320;
const PIVOT_Y = 268;
const GROUND_Y = 340;
const PX_PER_METRE = 64;
const HALF_BEAM = 272; // px (4.25 m)
const BEAM_THICKNESS = 16;
/** The beam end touches the ground at this angle (radians). */
const MAX_TILT = Math.asin((GROUND_Y - PIVOT_Y - BEAM_THICKNESS / 2) / HALF_BEAM);

// Dynamics
const RESTORING_STIFFNESS = 190; // N·m per unit sin θ (≈3° tilt for a 10 N·m imbalance)
const BEAM_INERTIA = 36; // kg·m² of the empty beam
const DAMPING_RATIO = 0.32;
const TIME_SCALE = 1.8; // a real 8.5 m seesaw is slow; speed it up for the screen

const DEFAULTS = { rightMass: 2, rightDistance: 2, leftMass: 4, leftDistance: 2 };

/** Weight-block size grows with the mass. */
const blockSize = (mass) => 30 + mass * 3;

/** Advance the beam by `dt` seconds (pure). */
function stepBeam(beam, dt, { netTorque, inertia }) {
  const naturalFrequency = Math.sqrt(RESTORING_STIFFNESS / inertia);
  const steps = 3;
  const h = (dt * TIME_SCALE) / steps;
  let { angle, omega } = beam;

  for (let i = 0; i < steps; i += 1) {
    const torque = netTorque * Math.cos(angle) - RESTORING_STIFFNESS * Math.sin(angle);
    const alpha = torque / inertia - 2 * DAMPING_RATIO * naturalFrequency * omega;
    omega += alpha * h;
    angle += omega * h;
    // The beam end rests on the ground: an inelastic stop.
    if (Math.abs(angle) >= MAX_TILT) {
      angle = Math.sign(angle) * MAX_TILT;
      if (Math.sign(omega) === Math.sign(angle)) omega = 0;
    }
  }
  return { angle, omega };
}

/** Weight block standing on the beam (drawn inside the rotated beam group). */
function WeightBlock({ centerX, mass, fill, stroke }) {
  const size = blockSize(mass);
  const top = PIVOT_Y - BEAM_THICKNESS / 2 - size;
  return (
    <g>
      <rect x={centerX - size / 2} y={top} width={size} height={size} rx={8} style={paint(fill, stroke, 3)} />
      <line x1={centerX - size / 4} y1={top + 9} x2={centerX + size / 4} y2={top + 9} style={paint(null, stroke, 3)} />
      <text x={centerX} y={top - 10} textAnchor="middle" fontSize="17" fontWeight="800" style={paint('text-primary')}>
        {`${formatNumber(mass)} كجم`}
      </text>
    </g>
  );
}

export default function LeverSimulation() {
  const { running } = useSimulation();
  const [rightMass, setRightMass] = useState(DEFAULTS.rightMass);
  const [rightDistance, setRightDistance] = useState(DEFAULTS.rightDistance);
  const [leftMass, setLeftMass] = useState(DEFAULTS.leftMass);
  const [leftDistance, setLeftDistance] = useState(DEFAULTS.leftDistance);
  const [beam, setBeam] = useState({ angle: 0, omega: 0 });

  const rightTorque = rightMass * GRAVITY * rightDistance;
  const leftTorque = leftMass * GRAVITY * leftDistance;
  const netTorque = rightTorque - leftTorque;
  const balanced = Math.abs(netTorque) < 1e-9;
  const inertia = BEAM_INERTIA + rightMass * rightDistance ** 2 + leftMass * leftDistance ** 2;

  useAnimationFrame((dt) => {
    setBeam((current) => stepBeam(current, dt, { netTorque, inertia }));
  }, running);

  const angleDeg = beam.angle / DEG;
  const settled = Math.abs(angleDeg) < 0.3 && Math.abs(beam.omega) < 0.02;

  // Challenge: two different masses, equal torques, beam level and at rest.
  useChallengeReport(balanced && rightMass !== leftMass && settled);

  // -- Stage ---------------------------------------------------------------
  const ticks = [];
  for (let d = 0.5; d <= 4; d += 0.5) ticks.push(d);
  const barScale = 210 / (10 * GRAVITY * 4); // longest possible torque → 210 px
  const rightBar = clamp(rightTorque * barScale, 0, 210);
  const leftBar = clamp(leftTorque * barScale, 0, 210);

  const stage = (
    <svg
      className="sim-svg"
      viewBox="0 0 640 400"
      role="img"
      aria-label={`رافعة: ثقل ${formatNumber(rightMass)} كجم على اليمين وثقل ${formatNumber(leftMass)} كجم على اليسار، زاوية الميل ${formatDecimal(Math.abs(angleDeg))} درجة`}
    >
      {/* Ground */}
      <rect x={-640} y={GROUND_Y} width={1920} height={200} style={paint('surface-subtle')} />
      <line x1={-640} y1={GROUND_Y} x2={1280} y2={GROUND_Y} style={paint(null, 'outline', 3)} />

      {/* Torque comparison bars */}
      <text x={490} y={30} textAnchor="middle" fontSize="15" style={paint('text-secondary')}>
        {`العزم الأيمن ${formatNumber(rightTorque)} نيوتن·متر`}
      </text>
      <rect x={390} y={42} width={210} height={16} rx={8} style={paint('surface-subtle')} />
      {rightBar > 0 ? <rect x={600 - rightBar} y={42} width={rightBar} height={16} rx={8} style={paint('accent-reward')} /> : null}
      <text x={150} y={30} textAnchor="middle" fontSize="15" style={paint('text-secondary')}>
        {`العزم الأيسر ${formatNumber(leftTorque)} نيوتن·متر`}
      </text>
      <rect x={40} y={42} width={210} height={16} rx={8} style={paint('surface-subtle')} />
      {leftBar > 0 ? <rect x={40} y={42} width={leftBar} height={16} rx={8} style={paint('accent-tools')} /> : null}

      {/* Perfect balance indicator */}
      {balanced ? (
        <g>
          <rect x={200} y={78} width={240} height={44} rx={20} style={paint('accent-reward-soft', 'accent-reward', 2)} />
          <text x={320} y={107} textAnchor="middle" fontSize="20" fontWeight="800" style={paint('accent-reward-text')}>
            حالة توازن مثالية!
          </text>
        </g>
      ) : null}

      {/* Level reference */}
      <line x1={30} y1={PIVOT_Y} x2={610} y2={PIVOT_Y} strokeDasharray="6 8" style={paint(null, 'outline', 2)} />

      {/* Fulcrum */}
      <polygon
        points={`${PIVOT_X},${PIVOT_Y + 4} ${PIVOT_X - 38},${GROUND_Y} ${PIVOT_X + 38},${GROUND_Y}`}
        strokeLinejoin="round"
        style={paint('accent-help', 'accent-help-text', 3)}
      />

      {/* Beam + weights rotate together around the pivot */}
      <g transform={`rotate(${angleDeg} ${PIVOT_X} ${PIVOT_Y})`}>
        <rect
          x={PIVOT_X - HALF_BEAM}
          y={PIVOT_Y - BEAM_THICKNESS / 2}
          width={HALF_BEAM * 2}
          height={BEAM_THICKNESS}
          rx={8}
          style={paint('text-secondary')}
        />
        {ticks.map((d) => (
          <g key={d}>
            {[-1, 1].map((side) => (
              <line
                key={side}
                x1={PIVOT_X + side * d * PX_PER_METRE}
                y1={PIVOT_Y - 5}
                x2={PIVOT_X + side * d * PX_PER_METRE}
                y2={PIVOT_Y + 5}
                style={paint(null, 'surface-card', Number.isInteger(d) ? 3 : 1.5)}
              />
            ))}
            {Number.isInteger(d)
              ? [-1, 1].map((side) => (
                  <text
                    key={`label${side}`}
                    x={PIVOT_X + side * d * PX_PER_METRE}
                    y={PIVOT_Y + 32}
                    textAnchor="middle"
                    fontSize="15"
                    style={paint('text-secondary')}
                  >
                    {`${formatNumber(d)} م`}
                  </text>
                ))
              : null}
          </g>
        ))}
        <WeightBlock
          centerX={PIVOT_X + rightDistance * PX_PER_METRE}
          mass={rightMass}
          fill="accent-reward-soft"
          stroke="accent-reward-text"
        />
        <WeightBlock
          centerX={PIVOT_X - leftDistance * PX_PER_METRE}
          mass={leftMass}
          fill="accent-tools-soft"
          stroke="accent-tools-text"
        />
        <circle cx={PIVOT_X} cy={PIVOT_Y} r={7} style={paint('surface-card', 'text-primary', 3)} />
      </g>
    </svg>
  );

  // -- Status chip -----------------------------------------------------------
  let status;
  if (balanced) {
    status = { tone: 'reward', icon: 'check_circle', text: 'حالة توازن مثالية! العزم الأيمن = العزم الأيسر' };
  } else if (netTorque > 0) {
    status = { tone: 'info', icon: 'balance', text: 'العزم الأيمن أكبر، فالرافعة بتميل ناحية اليمين' };
  } else {
    status = { tone: 'info', icon: 'balance', text: 'العزم الأيسر أكبر، فالرافعة بتميل ناحية اليسار' };
  }

  const distanceFormat = (value) => formatDecimal(value, 1);
  const controls = (
    <>
      <ControlSlider label="كتلة الثقل الأيمن" swatch="accent-reward" value={rightMass} min={1} max={10} unit="كجم" onChange={setRightMass} />
      <ControlSlider
        label="بُعد الثقل الأيمن عن الارتكاز"
        value={rightDistance}
        min={0.5}
        max={4}
        step={0.5}
        unit="متر"
        format={distanceFormat}
        onChange={setRightDistance}
      />
      <ControlSlider label="كتلة الثقل الأيسر" swatch="accent-tools" value={leftMass} min={1} max={10} unit="كجم" onChange={setLeftMass} />
      <ControlSlider
        label="بُعد الثقل الأيسر عن الارتكاز"
        value={leftDistance}
        min={0.5}
        max={4}
        step={0.5}
        unit="متر"
        format={distanceFormat}
        onChange={setLeftDistance}
      />
    </>
  );

  const tiltSide = angleDeg > 0.05 ? 'يمين' : angleDeg < -0.05 ? 'يسار' : '';
  const readings = [
    { id: 'right', label: 'العزم الأيمن', value: formatNumber(rightTorque), unit: 'نيوتن·متر' },
    { id: 'left', label: 'العزم الأيسر', value: formatNumber(leftTorque), unit: 'نيوتن·متر' },
    { id: 'diff', label: 'فرق العزم', value: formatNumber(Math.abs(netTorque)), unit: 'نيوتن·متر' },
    { id: 'tilt', label: 'زاوية الميل', value: `${formatDecimal(Math.abs(angleDeg))}°`, unit: tiltSide },
  ];

  return <SimulationWorkspace controls={controls} stage={stage} status={status} readings={readings} />;
}
