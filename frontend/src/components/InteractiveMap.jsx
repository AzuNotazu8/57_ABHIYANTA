import { useMemo } from 'react'
import styles from './InteractiveMap.module.css'

/* ── Animal home positions (% of SVG 800×500) ── */
const TIGER_HOMES = [
  { id: 't1', bx: 220, by: 180 },
  { id: 't2', bx: 310, by: 220 },
  { id: 't3', bx: 160, by: 240 },
  { id: 't4', bx: 380, by: 170 },
  { id: 't5', bx: 270, by: 290 },
]
const DEER_HOMES = [
  { id: 'd1', bx: 240, by: 195 },
  { id: 'd2', bx: 195, by: 225 },
  { id: 'd3', bx: 340, by: 200 },
  { id: 'd4', bx: 290, by: 250 },
  { id: 'd5', bx: 170, by: 200 },
  { id: 'd6', bx: 420, by: 220 },
  { id: 'd7', bx: 360, by: 260 },
  { id: 'd8', bx: 210, by: 270 },
]

/* Migration destinations – animals flee NW toward higher ground */
function migratedPos(base, pct, offsetX, offsetY) {
  const t = Math.min(1, pct / 100)
  return {
    x: base.bx + offsetX * t,
    y: base.by + offsetY * t,
  }
}

const TIGER_OFFSETS = [
  { dx: -90, dy: -70 }, { dx: -70, dy: -80 }, { dx: -110, dy: -60 },
  { dx: -60, dy: -90 }, { dx: -80, dy: -75 },
]
const DEER_OFFSETS = [
  { dx: -100, dy: -80 }, { dx: -80, dy: -70 }, { dx: -90, dy: -85 },
  { dx: -70, dy: -75 }, { dx: -95, dy: -65 }, { dx: -60, dy: -80 },
  { dx: -85, dy: -90 }, { dx: -75, dy: -70 },
]

/* Flood fill paths – river channels that expand */
const RIVER_PATHS = [
  'M 350 320 Q 370 290 360 260 Q 350 230 340 200 Q 330 170 320 140',
  'M 280 350 Q 295 320 290 290 Q 285 260 280 230 Q 275 200 260 170',
  'M 420 340 Q 440 310 435 280 Q 430 250 415 220',
  'M 200 360 Q 215 330 210 300 Q 205 270 195 240 Q 185 210 175 180',
  'M 470 300 Q 490 270 480 240 Q 470 210 455 185',
]

function lerp(a, b, t) { return a + (b - a) * t }

export default function InteractiveMap({ data, year }) {
  const floodPct = data?.flood_risk ?? 0
  const tigerMig = data?.tiger_migration_probability ?? 0
  const preyMig = data?.prey_migration_probability ?? 0
  const glacierAmp = data?.glacier_amplification ?? 0
  const zoonoticRisk = data?.zoonotic_risk_index ?? 0

  const floodT = floodPct / 100
  const glacierT = glacierAmp / 100

  /* Water rise – flood fills from bottom of delta upward */
  const waterY = lerp(430, 300, floodT)
  const waterOpacity = lerp(0.3, 0.75, floodT)

  /* Glacier rect shrinks as melt increases */
  const glacierHeight = lerp(48, 8, glacierT)
  const glacierY = 20

  /* Zoonotic hotspot radii */
  const zRadius = lerp(12, 38, zoonoticRisk / 100)

  const tigers = useMemo(() => TIGER_HOMES.map((h, i) => {
    const pos = migratedPos(h, tigerMig, TIGER_OFFSETS[i].dx, TIGER_OFFSETS[i].dy)
    return { ...h, x: pos.x, y: pos.y }
  }), [tigerMig])

  const deer = useMemo(() => DEER_HOMES.map((h, i) => {
    const pos = migratedPos(h, preyMig, DEER_OFFSETS[i].dx, DEER_OFFSETS[i].dy)
    return { ...h, x: pos.x, y: pos.y }
  }), [preyMig])

  return (
    <div className={styles.wrapper}>
      <svg
        viewBox="0 0 800 500"
        className={styles.svg}
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          <radialGradient id="waterGrad" cx="50%" cy="100%" r="80%">
            <stop offset="0%" stopColor="#2d6b8a" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#152a3a" stopOpacity="0.4" />
          </radialGradient>
          <radialGradient id="glacierGrad" cx="50%" cy="0%" r="100%">
            <stop offset="0%" stopColor="#c8e4ef" stopOpacity="1" />
            <stop offset="100%" stopColor="#8bbcce" stopOpacity="0.7" />
          </radialGradient>
          <radialGradient id="zoonoticGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#a84030" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#a84030" stopOpacity="0" />
          </radialGradient>
          <filter id="glow">
            <feGaussianBlur stdDeviation="3" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <filter id="softGlow">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
          </filter>
          <clipPath id="mapClip">
            <rect x="0" y="0" width="800" height="500" />
          </clipPath>
        </defs>

        {/* ── Ocean / Bay of Bengal base ── */}
        <rect x="0" y="0" width="800" height="500" fill="#0f2233" />

        {/* ── Bangladesh landmass (top) ── */}
        <path
          d="M 0 0 L 800 0 L 800 120 Q 720 105 650 115 Q 580 125 510 110 Q 450 98 390 108 Q 330 118 270 105 Q 200 92 130 110 Q 70 125 0 115 Z"
          fill="#2e2518" stroke="#3d3020" strokeWidth="1"
        />

        {/* ── India landmass (left) ── */}
        <path
          d="M 0 115 Q 70 125 130 110 Q 200 92 270 105 L 240 200 Q 220 230 200 260 Q 180 300 160 340 Q 140 380 120 420 L 0 420 Z"
          fill="#2e2518" stroke="#3d3020" strokeWidth="1"
        />

        {/* ── Sundarbans forest core ── */}
        <ellipse cx="300" cy="230" rx="190" ry="120" fill="#233a1e" opacity="0.8" />
        <ellipse cx="290" cy="220" rx="140" ry="85" fill="#2a4525" opacity="0.6" />

        {/* Forest texture dots */}
        {[
          [200,190],[230,170],[260,165],[290,160],[320,165],[350,170],[370,185],
          [380,205],[370,225],[350,240],[320,250],[290,255],[260,250],[230,240],
          [210,220],[205,205],[240,195],[270,185],[310,188],[340,195],[355,215],
          [340,232],[310,240],[280,242],[255,235],[235,222],
        ].map(([cx,cy], i) => (
          <circle key={i} cx={cx} cy={cy} r={lerp(3,6,Math.sin(i)*0.5+0.5)}
            fill="#3a5e30" opacity="0.5" />
        ))}

        {/* ── River delta channels ── */}
        {RIVER_PATHS.map((d, i) => (
          <path key={i} d={d}
            stroke="#1e4060" strokeWidth={lerp(2, 6, floodT)}
            fill="none" strokeLinecap="round" opacity={0.7 + floodT * 0.2}
          />
        ))}

        {/* ── FLOOD WATER LAYER ── rising with flood risk */}
        {floodT > 0.05 && (
          <>
            <clipPath id="floodClip">
              <rect x="80" y={waterY} width="700" height={500 - waterY} />
            </clipPath>
            <ellipse
              cx="400" cy={waterY + 10}
              rx={lerp(0, 360, floodT)} ry={lerp(0, 40, floodT)}
              fill="url(#waterGrad)" opacity={waterOpacity}
              clipPath="url(#mapClip)"
              style={{ transition: 'all 0.8s ease' }}
            />
            {/* flood wave lines */}
            {[0, 1, 2].map(i => (
              <ellipse
                key={i}
                cx="400" cy={waterY + i * lerp(10, 30, floodT)}
                rx={lerp(0, 300 - i * 40, floodT)} ry={lerp(0, 15, floodT)}
                fill="none"
                stroke="#4a9dbc"
                strokeWidth="1"
                opacity={lerp(0, 0.35 - i * 0.1, floodT)}
                style={{ transition: 'all 0.8s ease' }}
              />
            ))}
            {/* flood fill rectangle */}
            <rect
              x="80" y={waterY + 30}
              width="640" height={Math.max(0, 450 - waterY)}
              fill="url(#waterGrad)"
              opacity={waterOpacity * 0.7}
              clipPath="url(#mapClip)"
              style={{ transition: 'all 0.8s ease' }}
            />
          </>
        )}

        {/* ── BAY OF BENGAL label and base water ── */}
        <rect x="80" y="400" width="640" height="100" fill="#152a3a" opacity="0.8" />
        <text x="400" y="460" textAnchor="middle"
          fill="#2d5a7a" fontSize="12" fontFamily="Courier Prime" letterSpacing="4" opacity="0.7">
          BAY OF BENGAL
        </text>

        {/* ── GLACIER (top-right) ── */}
        <g transform="translate(640, 15)">
          <rect x="0" y="0" width="140" height="55" rx="4"
            fill="#0f2233" stroke="#2a3a44" strokeWidth="1" />
          <text x="70" y="12" textAnchor="middle"
            fill="#6a8a9a" fontSize="7" fontFamily="Courier Prime" letterSpacing="2">
            HIMALAYAN GLACIER
          </text>
          {/* glacier body */}
          <rect x="10" y={glacierY} width="120" height={glacierHeight}
            rx="3" fill="url(#glacierGrad)"
            style={{ transition: 'all 0.8s ease' }}
          />
          {/* melt drip */}
          {glacierT > 0.2 && (
            <ellipse cx="70" cy={glacierY + glacierHeight + 4}
              rx={lerp(0, 30, glacierT)} ry={lerp(0, 6, glacierT)}
              fill="#8bbcce" opacity="0.35"
              style={{ transition: 'all 0.8s ease' }}
            />
          )}
          <text x="10" y="52" fill="#4a6a7a" fontSize="7" fontFamily="Courier Prime">
            MELT: {glacierAmp.toFixed(0)}%
          </text>
        </g>

        {/* ── ZOONOTIC HOTSPOTS ── */}
        {zoonoticRisk > 20 && [
          [175, 255], [295, 260], [430, 235],
        ].map(([cx, cy], i) => (
          <g key={i}>
            <circle cx={cx} cy={cy} r={zRadius * (0.8 + i * 0.15)}
              fill="url(#zoonoticGrad)"
              style={{ transition: 'all 0.8s ease' }}
            />
            <circle cx={cx} cy={cy} r={4}
              fill="#a84030" opacity="0.8"
            />
          </g>
        ))}

        {/* ── DEER / PREY ANIMALS ── */}
        {deer.map(d => (
          <g key={d.id} style={{ transition: 'all 0.9s cubic-bezier(0.4,0,0.2,1)' }}
            transform={`translate(${d.x}, ${d.y})`}>
            <circle r="9" fill="#1e3a14" opacity="0.5" />
            <circle r="6" fill="#7aac54" opacity="0.95" filter="url(#glow)" />
            <text x="0" y="4" textAnchor="middle" fontSize="8" style={{ userSelect: 'none' }}>🦌</text>
          </g>
        ))}

        {/* ── TIGER ANIMALS ── */}
        {tigers.map(t => (
          <g key={t.id} style={{ transition: 'all 1.1s cubic-bezier(0.4,0,0.2,1)' }}
            transform={`translate(${t.x}, ${t.y})`}>
            <circle r="11" fill="#3a1808" opacity="0.5" />
            <circle r="8" fill="#d4682a" opacity="0.95" filter="url(#glow)" />
            <text x="0" y="5" textAnchor="middle" fontSize="10" style={{ userSelect: 'none' }}>🐅</text>
          </g>
        ))}

        {/* ── REGION LABELS ── */}
        <text x="60" y="95" fill="#6b5e42" fontSize="9" fontFamily="Courier Prime" letterSpacing="2">BANGLADESH</text>
        <text x="14" y="280" fill="#6b5e42" fontSize="9" fontFamily="Courier Prime" letterSpacing="2"
          transform="rotate(-90, 14, 280)">INDIA</text>
        <text x="250" y="230" fill="#3d6438" fontSize="10" fontFamily="Courier Prime" opacity="0.6" letterSpacing="1">SUNDARBANS</text>

        {/* ── LEGEND ── */}
        <g transform="translate(14, 340)">
          <rect x="0" y="0" width="130" height="100" rx="3"
            fill="#12110e" stroke="#3a3020" strokeWidth="1" opacity="0.85" />
          <text x="8" y="14" fill="#6b5e42" fontSize="7" fontFamily="Courier Prime" letterSpacing="2">LEGEND</text>

          <circle cx="16" cy="28" r="5" fill="#d4682a" />
          <text x="26" y="32" fill="#9a8e78" fontSize="8" fontFamily="Courier Prime">Bengal Tiger</text>

          <circle cx="16" cy="44" r="5" fill="#7aac54" />
          <text x="26" y="48" fill="#9a8e78" fontSize="8" fontFamily="Courier Prime">Prey Species</text>

          <circle cx="16" cy="60" r="5" fill="#2d6b8a" opacity="0.8" />
          <text x="26" y="64" fill="#9a8e78" fontSize="8" fontFamily="Courier Prime">Flood Zone</text>

          <circle cx="16" cy="76" r="5" fill="#a84030" opacity="0.7" />
          <text x="26" y="80" fill="#9a8e78" fontSize="8" fontFamily="Courier Prime">Zoonotic Risk</text>

          <rect x="8" y="88" width="10" height="5" rx="1" fill="#8bbcce" />
          <text x="26" y="95" fill="#9a8e78" fontSize="8" fontFamily="Courier Prime">Glacier Ice</text>
        </g>

        {/* ── YEAR WATERMARK ── */}
        <text x="400" y="490" textAnchor="middle"
          fill="#2a2318" fontSize="60" fontFamily="Playfair Display" fontWeight="700"
          opacity="0.25" style={{ userSelect: 'none' }}>
          {year}
        </text>

        {/* ── SEA LEVEL INDICATOR ── */}
        <g transform="translate(760, 150)">
          <rect x="0" y="0" width="30" height="200" rx="3"
            fill="#0f2233" stroke="#2a3a44" strokeWidth="1" />
          <rect x="3" y={lerp(150, 3, floodT)} width="24" height={lerp(50, 197, floodT)}
            rx="2" fill="#2d6b8a" opacity="0.7"
            style={{ transition: 'all 0.8s ease' }}
          />
          <text x="15" y="-6" textAnchor="middle"
            fill="#4a6a7a" fontSize="6" fontFamily="Courier Prime" letterSpacing="1">SEA</text>
          <text x="15" y="210" textAnchor="middle"
            fill="#4a6a7a" fontSize="6" fontFamily="Courier Prime">{floodPct.toFixed(0)}%</text>
        </g>

      </svg>
    </div>
  )
}
