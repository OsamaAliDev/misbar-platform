import { useEffect, useState } from 'react';
import { ControlSlider, ControlToggle } from '../components/SimulationControls.jsx';
import SimulationWorkspace from '../components/SimulationWorkspace.jsx';
import { formatDecimal, formatNumber } from '../lib/arabic.js';
import { useChallengeReport, useSimulation } from './SimulationContext.js';
import { SvgArrow } from './SvgArrow.jsx';
import { DEG, paint, useAnimationFrame } from './simulationUtils.js';

/**
 * قانون الحركة والسرعة والتسارع — Newton's second law on a measured track.
 * ---------------------------------------------------------------------------
 * A constant pushing force F acts on a cart of mass m. With friction on, the
 * floor opposes the motion with f = μ·m·g. Every frame:
 *
 *   F_net = F − f            a = F_net / m            v += a·dt,  x += v·dt
 *
 * Static friction: a push weaker than f cannot start the cart (F_net = 0).
 * Kinetic friction never makes the cart roll backwards; it only stops it.
 * In RTL the cart travels from the start (right) to the finish line (left).
 */

const GRAVITY = 10; // m/s² (school value)
const FRICTION_COEFFICIENT = 0.2; // μ — so f = 2 N for every kg
const TRACK_LENGTH = 40; // m

// Drawing (SVG units, viewBox 640×400)
const GROUND_Y = 300;
const START_X = 520; // cart front at 0 m
const PX_PER_METRE = 12; // 40 m → 480 px
const FINISH_X = START_X - TRACK_LENGTH * PX_PER_METRE;
const CART_W = 112;
const CART_H = 54;
const WHEEL_R = 14;
const WHEEL_Y = GROUND_Y - WHEEL_R;
const BODY_Y = WHEEL_Y - 4 - CART_H;

const DEFAULTS = { force: 20, mass: 5, friction: false };
const AT_START = Object.freeze({ x: 0, v: 0, t: 0, finished: false });

/** Maximum friction force (N). */
function frictionForce(mass, friction) {
  return friction ? FRICTION_COEFFICIENT * mass * GRAVITY : 0;
}

/** Net force on the cart (N). */
function netForce(force, friction, velocity) {
  if (velocity > 1e-9) return force - friction; // sliding: kinetic friction opposes motion
  return force > friction ? force - friction : 0; // at rest: static friction cancels a weak push
}

/** Advance the cart by `dt` seconds (pure). */
function stepMotion(state, dt, { force, mass, friction }) {
  if (state.finished) return state;
  const acceleration = netForce(force, friction, state.v) / mass;
  const v = Math.max(0, state.v + acceleration * dt);
  const x = state.x + ((state.v + v) / 2) * dt;

  if (x >= TRACK_LENGTH) {
    // Interpolate the exact moment the cart crosses the finish line.
    const fraction = (TRACK_LENGTH - state.x) / (x - state.x);
    return {
      x: TRACK_LENGTH,
      v: state.v + (v - state.v) * fraction,
      t: state.t + dt * fraction,
      finished: true,
    };
  }
  return { x, v, t: state.t + dt, finished: false };
}

export default function MotionSimulation() {
  const { running, setRunning } = useSimulation();
  const [force, setForce] = useState(DEFAULTS.force);
  const [mass, setMass] = useState(DEFAULTS.mass);
  const [friction, setFriction] = useState(DEFAULTS.friction);
  const [motion, setMotion] = useState(AT_START);

  const frictionN = frictionForce(mass, friction);

  useAnimationFrame((dt) => {
    setMotion((state) => stepMotion(state, dt, { force, mass, friction: frictionN }));
  }, running);

  // Auto-pause at the finish line …
  useEffect(() => {
    if (motion.finished) setRunning(false);
  }, [motion.finished, setRunning]);

  // … and pressing "تشغيل" again starts a new run with the same settings.
  useEffect(() => {
    if (running) setMotion((state) => (state.finished ? AT_START : state));
  }, [running]);

  // Live values
  const fNet = netForce(force, frictionN, motion.v);
  const acceleration = fNet / mass;
  const stuck = motion.v === 0 && fNet === 0;
  // Friction actually acting now (static friction only matches the push).
  const frictionNow = friction ? (motion.v > 0 ? frictionN : Math.min(force, frictionN)) : 0;

  // Challenge: friction on, a = 3 m/s² while moving, and the cart reached the finish.
  const plannedAcceleration = force > frictionN ? (force - frictionN) / mass : 0;
  useChallengeReport(friction && Math.abs(plannedAcceleration - 3) < 1e-9 && motion.finished);

  // -- Stage ---------------------------------------------------------------
  const front = START_X - motion.x * PX_PER_METRE;
  const centerX = front + CART_W / 2;
  const wheelAngle = -((motion.x * PX_PER_METRE) / WHEEL_R) / DEG; // rolling to the left
  const ticks = [];
  for (let metre = 0; metre <= TRACK_LENGTH; metre += 5) ticks.push(metre);

  const stage = (
    <svg
      className="sim-svg"
      viewBox="0 0 640 400"
      role="img"
      aria-label={`عربة كتلتها ${formatNumber(mass)} كجم على مسار طوله ${formatNumber(TRACK_LENGTH)} متر، قطعت ${formatDecimal(motion.x)} متر`}
    >
      {/* Ground (bleeds past the viewBox on wide stages) */}
      <rect x={-640} y={GROUND_Y} width={1920} height={200} style={paint('surface-subtle')} />
      <line x1={-640} y1={GROUND_Y} x2={1280} y2={GROUND_Y} style={paint(null, 'outline', 3)} />

      {/* Measured track */}
      {ticks.map((metre) => {
        const x = START_X - metre * PX_PER_METRE;
        const major = metre % 10 === 0;
        return (
          <g key={metre}>
            <line x1={x} y1={GROUND_Y} x2={x} y2={GROUND_Y + (major ? 16 : 10)} style={paint(null, 'text-secondary', 2)} />
            {major ? (
              <text x={x} y={GROUND_Y + 40} textAnchor="middle" fontSize="17" style={paint('text-secondary')}>
                {formatNumber(metre)}
              </text>
            ) : null}
          </g>
        );
      })}
      <text x={280} y={GROUND_Y + 76} textAnchor="middle" fontSize="16" style={paint('text-secondary')}>
        المسافة بالمتر
      </text>

      {/* Start line */}
      <line x1={START_X} y1={180} x2={START_X} y2={GROUND_Y} strokeDasharray="6 6" style={paint(null, 'accent-primary', 3)} />
      <text x={START_X} y={170} textAnchor="middle" fontSize="16" style={paint('accent-primary-soft-text')}>
        البداية
      </text>

      {/* Finish flag */}
      <line x1={FINISH_X} y1={168} x2={FINISH_X} y2={GROUND_Y} style={paint(null, 'text-primary', 4)} />
      {[0, 1, 2].map((col) =>
        [0, 1].map((row) => (
          <rect
            key={`${col}-${row}`}
            x={FINISH_X - 36 + col * 12}
            y={168 + row * 12}
            width={12}
            height={12}
            style={paint((col + row) % 2 === 0 ? 'text-primary' : 'surface-card')}
          />
        )),
      )}
      <rect x={FINISH_X - 36} y={168} width={36} height={24} style={paint(null, 'text-primary', 2)} />
      <text x={FINISH_X} y={156} textAnchor="middle" fontSize="16" style={paint('text-primary')}>
        النهاية
      </text>

      {/* Formula tag */}
      <rect x={300} y={18} width={320} height={44} rx={20} style={paint('accent-info-soft', 'accent-info', 2)} />
      <text x={460} y={47} textAnchor="middle" fontSize="17" style={paint('accent-info-text')}>
        التسارع = القوة المحصلة ÷ الكتلة
      </text>

      {/* Legend */}
      {[
        { x: 236, color: 'accent-primary', label: 'قوة الدفع' },
        { x: 140, color: 'accent-help', label: 'الاحتكاك' },
        { x: 50, color: 'accent-info', label: 'السرعة' },
      ].map((item) => (
        <g key={item.label}>
          <SvgArrow x1={item.x + 26} y1={28} x2={item.x - 26} y2={28} color={`var(--${item.color})`} width={4} />
          <text x={item.x} y={56} textAnchor="middle" fontSize="15" style={paint('text-secondary')}>
            {item.label}
          </text>
        </g>
      ))}

      {/* Cart */}
      <g transform={`translate(${front} 0)`}>
        <rect x={0} y={BODY_Y} width={CART_W} height={CART_H} rx={12} style={paint('accent-tools-soft', 'accent-tools-text', 3)} />
        <text x={CART_W / 2} y={BODY_Y + 35} textAnchor="middle" fontSize="20" fontWeight="800" style={paint('accent-tools-text')}>
          {`${formatNumber(mass)} كجم`}
        </text>
        {[26, CART_W - 26].map((wheelX) => (
          <g key={wheelX} transform={`rotate(${wheelAngle} ${wheelX} ${WHEEL_Y})`}>
            <circle cx={wheelX} cy={WHEEL_Y} r={WHEEL_R} style={paint('text-primary')} />
            <line x1={wheelX - 9} y1={WHEEL_Y} x2={wheelX + 9} y2={WHEEL_Y} style={paint(null, 'surface-card', 3)} />
            <line x1={wheelX} y1={WHEEL_Y - 9} x2={wheelX} y2={WHEEL_Y + 9} style={paint(null, 'surface-card', 3)} />
            <circle cx={wheelX} cy={WHEEL_Y} r={4} style={paint('surface-card')} />
          </g>
        ))}
      </g>

      {/* Free-body arrows — drawn from the cart's edges so they never cover
          the mass label or the wheels: push from the front (left) edge,
          friction from the rear (right) edge at road level, velocity above. */}
      <SvgArrow
        x1={front - 2}
        y1={BODY_Y + CART_H / 2}
        x2={front - 2 - force * 2.2}
        y2={BODY_Y + CART_H / 2}
        color="var(--accent-primary)"
        width={6}
      />
      <SvgArrow
        x1={front + CART_W + 2}
        y1={GROUND_Y - 4}
        x2={front + CART_W + 2 + frictionNow * 2.2}
        y2={GROUND_Y - 4}
        color="var(--accent-help)"
        width={6}
      />
      <SvgArrow
        x1={centerX}
        y1={BODY_Y - 22}
        x2={centerX - Math.min(motion.v * 3.2, 220)}
        y2={BODY_Y - 22}
        color="var(--accent-info)"
        width={6}
      />
    </svg>
  );

  // -- Status chip -----------------------------------------------------------
  let status;
  if (motion.finished) {
    status = { tone: 'reward', icon: 'sports_score', text: `وصلت العربة لخط النهاية في ${formatDecimal(motion.t)} ثانية` };
  } else if (running && stuck) {
    status = {
      tone: 'help',
      icon: 'block',
      text: force === 0 ? 'مفيش قوة دفع، العربة واقفة مكانها' : 'الاحتكاك أقوى من قوة الدفع، العربة مش قادرة تتحرك',
    };
  } else if (running) {
    if (acceleration > 1e-9) status = { tone: 'primary', icon: 'speed', text: 'العربة بتتسارع' };
    else if (acceleration < -1e-9) status = { tone: 'help', icon: 'speed', text: 'العربة بتتباطأ بسبب الاحتكاك' };
    else status = { tone: 'primary', icon: 'speed', text: 'العربة ماشية بسرعة ثابتة' };
  } else if (motion.x === 0) {
    status = { tone: 'info', icon: 'touch_app', text: 'اضغط «تشغيل» عشان تبدأ الدفع' };
  } else {
    status = { tone: 'info', icon: 'pause', text: 'التجربة متوقفة مؤقتاً' };
  }

  const controls = (
    <>
      <ControlSlider label="قوة الدفع" swatch="accent-primary" value={force} min={0} max={60} unit="نيوتن" onChange={setForce} />
      <ControlSlider label="كتلة العربة" swatch="accent-tools-soft" value={mass} min={1} max={20} unit="كجم" onChange={setMass} />
      <ControlToggle
        label="الاحتكاك مع الأرض"
        description={friction ? `قوة الاحتكاك القصوى ${formatNumber(frictionN)} نيوتن` : 'أرضية ناعمة جداً من غير احتكاك'}
        checked={friction}
        onChange={setFriction}
      />
    </>
  );

  const readings = [
    { id: 'net', label: 'القوة المحصلة', value: formatDecimal(fNet), unit: 'نيوتن' },
    { id: 'acc', label: 'التسارع', value: formatDecimal(acceleration, 2), unit: 'م/ث²' },
    { id: 'vel', label: 'السرعة', value: formatDecimal(motion.v), unit: 'م/ث' },
    { id: 'dist', label: 'المسافة', value: formatDecimal(motion.x), unit: 'متر' },
    { id: 'time', label: 'الزمن', value: formatDecimal(motion.t), unit: 'ثانية' },
  ];

  return <SimulationWorkspace controls={controls} stage={stage} status={status} readings={readings} />;
}
