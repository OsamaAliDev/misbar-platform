import { useState } from 'react';
import Fraction from '../components/Fraction.jsx';
import { ControlChoice, ControlSlider, ControlToggle } from '../components/SimulationControls.jsx';
import SimulationWorkspace from '../components/SimulationWorkspace.jsx';
import { formatDecimal, formatNumber } from '../lib/arabic.js';
import { useChallengeReport, useSimulation } from './SimulationContext.js';
import { gcd, paint, useAnimationFrame } from './simulationUtils.js';

/**
 * الكسور والنسب بالمساحة — one fraction, two area models.
 * ---------------------------------------------------------------------------
 * The same fraction n/d is shaded on a circle (pie) and on a rectangle split
 * into d equal cells. With "أبسط صورة" on, bold lines group the parts by
 * g = gcd(n, d), showing n/d = (n/g)/(d/g) without changing the area.
 *
 * Play/Pause runs a counting animation: Nour counts the shaded parts one by
 * one, so the numerator is literally "how many parts we took".
 */

// Drawing (SVG units, viewBox 640×400)
const PIE = { x: 470, y: 205, r: 118 };
const GRID = { x: 56, y: 105, w: 248, h: 200 };
const COUNT_STEP = 0.7; // seconds per counted part

const DEFAULTS = { numerator: 3, denominator: 4, simplify: true };

const PRESETS = [
  { n: 1, d: 2 },
  { n: 1, d: 3 },
  { n: 3, d: 4 },
  { n: 2, d: 5 },
].map((preset) => ({
  ...preset,
  value: `${preset.n}/${preset.d}`,
  label: <Fraction numerator={preset.n} denominator={preset.d} size="sm" />,
  ariaLabel: `${formatNumber(preset.n)} على ${formatNumber(preset.d)}`,
}));

/**
 * Rows × columns of the rectangle. Columns are a multiple of `groupSize` so
 * every group of the simplified fraction stays inside one row.
 */
function gridLayout(denominator, groupSize) {
  const groups = denominator / groupSize;
  let rows = 1;
  for (let candidate = 1; candidate * candidate <= denominator; candidate += 1) {
    if (groups % candidate === 0) rows = candidate;
  }
  return { rows, cols: denominator / rows };
}

/** Point on the pie at `angle` degrees (0 = top, clockwise). */
function piePoint(angle, radius = PIE.r) {
  const a = ((angle - 90) * Math.PI) / 180;
  return { x: PIE.x + radius * Math.cos(a), y: PIE.y + radius * Math.sin(a) };
}

export default function FractionsSimulation() {
  const { running } = useSimulation();
  const [numerator, setNumerator] = useState(DEFAULTS.numerator);
  const [denominator, setDenominator] = useState(DEFAULTS.denominator);
  const [simplify, setSimplify] = useState(DEFAULTS.simplify);
  const [elapsed, setElapsed] = useState(0);

  useAnimationFrame((dt) => setElapsed((t) => t + dt), running);

  const changeDenominator = (value) => {
    setDenominator(value);
    setNumerator((n) => Math.min(n, value));
  };

  const g = numerator === 0 ? denominator : gcd(numerator, denominator);
  const simpleN = numerator / g;
  const simpleD = denominator / g;
  const showGroups = simplify && g > 1 && numerator > 0;
  const groupSize = showGroups ? g : 1;
  const { rows, cols } = gridLayout(denominator, groupSize);

  // Counting animation: parts 0…n−1, then a short pause showing all of them.
  const cycle = numerator + 2;
  const countIndex = running && numerator > 0 ? Math.floor(elapsed / COUNT_STEP) % cycle : -1;
  const counted = countIndex < 0 ? 0 : Math.min(countIndex + 1, numerator);
  const isCurrent = (k) => countIndex >= 0 && countIndex < numerator && k === countIndex;

  // Challenge: exactly 75% with a denominator other than 4.
  useChallengeReport(numerator * 4 === denominator * 3 && denominator !== 4);

  const partFill = (k) => {
    if (isCurrent(k)) return 'accent-reward';
    return k < numerator ? 'accent-info' : 'surface-card';
  };

  // -- Pie slices ------------------------------------------------------------
  const sliceAngle = 360 / denominator;
  const slices = Array.from({ length: denominator }, (_, k) => {
    const start = piePoint(k * sliceAngle);
    const end = piePoint((k + 1) * sliceAngle);
    const largeArc = sliceAngle > 180 ? 1 : 0;
    const label = piePoint((k + 0.5) * sliceAngle, PIE.r * 0.62);
    return {
      k,
      d: `M ${PIE.x} ${PIE.y} L ${start.x} ${start.y} A ${PIE.r} ${PIE.r} 0 ${largeArc} 1 ${end.x} ${end.y} Z`,
      label,
    };
  });

  // -- Rectangle cells (filled in RTL reading order) --------------------------
  const cellW = GRID.w / cols;
  const cellH = GRID.h / rows;
  const cellBox = (k) => {
    const row = Math.floor(k / cols);
    const col = k % cols;
    return { x: GRID.x + GRID.w - (col + 1) * cellW, y: GRID.y + row * cellH };
  };

  const caption = running
    ? numerator > 0
      ? `بنعدّ الأجزاء الملوّنة: ${formatNumber(counted)} من ${formatNumber(denominator)}`
      : 'مفيش أجزاء ملوّنة نعدّها'
    : 'البسط = الأجزاء الملوّنة • المقام = كل الأجزاء';

  const labelSize = denominator > 8 ? 15 : 19;

  const stage = (
    <svg
      className="sim-svg"
      viewBox="0 0 640 400"
      role="img"
      aria-label={`دائرة ومستطيل مقسومين ${formatNumber(denominator)} أجزاء متساوية، ملوّن منهم ${formatNumber(numerator)}`}
    >
      <text x={320} y={44} textAnchor="middle" fontSize="18" style={paint('text-primary')}>
        {caption}
      </text>

      {/* Circle model */}
      {denominator === 1 ? (
        <circle cx={PIE.x} cy={PIE.y} r={PIE.r} style={paint(partFill(0), 'text-secondary', 2)} />
      ) : (
        slices.map((slice) => (
          <path key={slice.k} d={slice.d} strokeLinejoin="round" style={paint(partFill(slice.k), 'text-secondary', 2)} />
        ))
      )}
      {showGroups && denominator > 1
        ? Array.from({ length: simpleD }, (_, j) => {
            const edge = piePoint(j * g * sliceAngle);
            return <line key={j} x1={PIE.x} y1={PIE.y} x2={edge.x} y2={edge.y} style={paint(null, 'text-primary', 5)} />;
          })
        : null}
      <circle cx={PIE.x} cy={PIE.y} r={PIE.r} style={paint(null, 'text-primary', 3)} />
      {slices.map((slice) =>
        countIndex >= 0 && slice.k < counted ? (
          <text
            key={`n${slice.k}`}
            x={slice.label.x}
            y={slice.label.y + labelSize / 3}
            textAnchor="middle"
            fontSize={labelSize}
            fontWeight="800"
            style={paint(isCurrent(slice.k) ? 'accent-reward-text' : 'surface-card')}
          >
            {formatNumber(slice.k + 1)}
          </text>
        ) : null,
      )}
      <text x={PIE.x} y={PIE.y + PIE.r + 34} textAnchor="middle" fontSize="17" style={paint('text-secondary')}>
        الدائرة
      </text>

      {/* Rectangle model */}
      {Array.from({ length: denominator }, (_, k) => {
        const box = cellBox(k);
        return (
          <g key={k}>
            <rect x={box.x} y={box.y} width={cellW} height={cellH} style={paint(partFill(k), 'text-secondary', 2)} />
            {countIndex >= 0 && k < counted ? (
              <text
                x={box.x + cellW / 2}
                y={box.y + cellH / 2 + labelSize / 3}
                textAnchor="middle"
                fontSize={labelSize}
                fontWeight="800"
                style={paint(isCurrent(k) ? 'accent-reward-text' : 'surface-card')}
              >
                {formatNumber(k + 1)}
              </text>
            ) : null}
          </g>
        );
      })}
      {showGroups
        ? Array.from({ length: simpleD }, (_, j) => {
            const first = cellBox(j * g);
            return (
              <rect
                key={j}
                x={first.x - (g - 1) * cellW}
                y={first.y}
                width={g * cellW}
                height={cellH}
                style={paint(null, 'text-primary', 5)}
              />
            );
          })
        : null}
      <rect x={GRID.x} y={GRID.y} width={GRID.w} height={GRID.h} style={paint(null, 'text-primary', 3)} />
      <text x={GRID.x + GRID.w / 2} y={GRID.y + GRID.h + 34} textAnchor="middle" fontSize="17" style={paint('text-secondary')}>
        المستطيل
      </text>
    </svg>
  );

  // -- Status chip -----------------------------------------------------------
  let status;
  if (numerator === 0) {
    status = { tone: 'info', icon: 'info', text: 'مفيش ولا جزء ملوّن، يعني الكسر = صفر' };
  } else if (numerator === denominator) {
    status = { tone: 'reward', icon: 'check_circle', text: 'الشكل كله ملوّن، يعني الكسر = واحد صحيح' };
  } else if (g > 1) {
    status = { tone: 'primary', icon: 'calculate', text: `الكسر ده ينفع يتبسّط: نقسم البسط والمقام على ${formatNumber(g)}` };
  } else {
    status = { tone: 'info', icon: 'check_circle', text: 'الكسر ده في أبسط صورة' };
  }

  const controls = (
    <>
      <ControlSlider
        label="البسط (الأجزاء الملوّنة)"
        swatch="accent-info"
        value={numerator}
        min={0}
        max={denominator}
        onChange={setNumerator}
      />
      <ControlSlider
        label="المقام (عدد الأجزاء)"
        value={denominator}
        min={1}
        max={12}
        onChange={changeDenominator}
      />
      <ControlChoice
        label="كسور مشهورة"
        options={PRESETS}
        isSelected={(option) => option.n === numerator && option.d === denominator}
        onChange={(_, option) => {
          setDenominator(option.d);
          setNumerator(option.n);
        }}
      />
      <ControlToggle
        label="إظهار أبسط صورة"
        description="خطوط سميكة بتجمع الأجزاء حسب الكسر المبسّط"
        checked={simplify}
        onChange={setSimplify}
      />
    </>
  );

  const readings = [
    {
      id: 'fraction',
      label: 'الكسر',
      value: <Fraction numerator={numerator} denominator={denominator} />,
      spoken: `${formatNumber(numerator)} على ${formatNumber(denominator)}`,
    },
    {
      id: 'simple',
      label: 'أبسط صورة',
      value: numerator === 0 ? formatNumber(0) : simpleD === 1 ? formatNumber(simpleN) : <Fraction numerator={simpleN} denominator={simpleD} />,
      spoken: `${formatNumber(simpleN)} على ${formatNumber(simpleD)}`,
    },
    { id: 'decimal', label: 'الكسر العشري', value: formatDecimal(numerator / denominator, 3) },
    { id: 'percent', label: 'النسبة المئوية', value: formatDecimal((numerator / denominator) * 100, 1), unit: '٪' },
  ];

  return <SimulationWorkspace controls={controls} stage={stage} status={status} readings={readings} />;
}
