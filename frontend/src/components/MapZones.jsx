import { useState } from 'react'
import styles from './MapZones.module.css'

const ZONES = [
  {
    id: 'flood',
    label: 'Flood Zones',
    color: '#1F6F78',
    desc: 'High-risk inundation corridors along river deltas and tidal channels',
    regions: [
      { x: 30, y: 40, w: 140, h: 60, opacity: 0.55 },
      { x: 80, y: 90, w: 180, h: 45, opacity: 0.45 },
      { x: 220, y: 55, w: 80, h: 80, opacity: 0.35 },
    ],
  },
  {
    id: 'prey',
    label: 'Prey Migration',
    color: '#4a9e6a',
    desc: 'Spotted deer, wild boar, and macaque displacement corridors under salinity stress',
    regions: [
      { x: 50, y: 70, w: 90, h: 50, opacity: 0.5 },
      { x: 150, y: 40, w: 70, h: 90, opacity: 0.4 },
      { x: 230, y: 100, w: 60, h: 40, opacity: 0.45 },
    ],
  },
  {
    id: 'tiger',
    label: 'Tiger Zones',
    color: '#C8862A',
    desc: 'Bengal tiger secondary migration pressure areas driven by prey depletion',
    regions: [
      { x: 60, y: 50, w: 70, h: 70, opacity: 0.45 },
      { x: 170, y: 60, w: 80, h: 60, opacity: 0.4 },
      { x: 260, y: 80, w: 50, h: 50, opacity: 0.35 },
    ],
  },
  {
    id: 'zoonotic',
    label: 'Zoonotic Exposure',
    color: '#8B3A4A',
    desc: 'Human-wildlife interface zones with elevated exposure risk index',
    regions: [
      { x: 40, y: 80, w: 60, h: 50, opacity: 0.5 },
      { x: 130, y: 55, w: 50, h: 60, opacity: 0.45 },
      { x: 210, y: 90, w: 70, h: 45, opacity: 0.4 },
    ],
  },
]

export default function MapZones({ latestResult }) {
  const [active, setActive] = useState(['flood'])

  const toggle = (id) => {
    setActive(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    )
  }

  const activeZones = ZONES.filter(z => active.includes(z.id))

  return (
    <div className={styles.wrapper}>
      <div className={styles.header}>
        <h2 className={styles.title}>Zone Map — Sundarbans</h2>
        <span className={styles.note}>Schematic · Toggle layers</span>
      </div>

      <div className={styles.controls}>
        {ZONES.map(z => (
          <button
            key={z.id}
            className={`${styles.toggle} ${active.includes(z.id) ? styles.on : ''}`}
            style={{ '--zone-color': z.color }}
            onClick={() => toggle(z.id)}
          >
            <span className={styles.toggleDot} style={{ background: z.color }} />
            {z.label}
          </button>
        ))}
      </div>

      <div className={styles.mapArea}>
        <svg viewBox="0 0 380 200" className={styles.svg} xmlns="http://www.w3.org/2000/svg">
          <rect x="0" y="0" width="380" height="200" fill="#0a1929" rx="2" />

          <path d="M0,160 Q40,140 80,155 Q120,170 160,150 Q200,130 240,145 Q280,160 320,140 Q360,120 380,130 L380,200 L0,200 Z"
            fill="#0d2235" opacity="0.8" />

          <path d="M100,30 Q120,20 150,35 Q170,15 200,30 Q220,10 250,25 Q270,5 300,20 Q320,8 340,18 L340,50 Q310,45 290,55 Q260,40 240,60 Q210,45 185,65 Q160,50 140,68 Q120,55 100,65 Z"
            fill="#0f2640" stroke="#1e3a52" strokeWidth="0.5" opacity="0.7" />

          <text x="148" y="48" fill="#2a4a6a" fontSize="7" fontFamily="DM Mono" opacity="0.6">BANGLADESH</text>
          <text x="60" y="130" fill="#2a4a6a" fontSize="7" fontFamily="DM Mono" opacity="0.6">INDIA</text>
          <text x="200" y="115" fill="#1a3a5a" fontSize="6" fontFamily="DM Mono" opacity="0.5">BAY OF BENGAL</text>

          <line x1="180" y1="55" x2="180" y2="160" stroke="#1e3a52" strokeWidth="0.8" opacity="0.6" />
          <line x1="80" y1="70" x2="120" y2="155" stroke="#1e3a52" strokeWidth="0.8" opacity="0.5" />
          <line x1="240" y1="50" x2="210" y2="150" stroke="#1e3a52" strokeWidth="0.8" opacity="0.5" />

          {activeZones.map(zone =>
            zone.regions.map((r, i) => (
              <rect
                key={`${zone.id}_${i}`}
                x={r.x} y={r.y} width={r.w} height={r.h}
                rx="4"
                fill={zone.color}
                opacity={r.opacity}
                className={styles.zoneRect}
              />
            ))
          )}

          <text x="12" y="196" fill="#2a4a6a" fontSize="6" fontFamily="DM Mono">SCHEMATIC · NOT TO SCALE</text>
        </svg>
      </div>

      {activeZones.length > 0 && (
        <div className={styles.legend}>
          {activeZones.map(z => (
            <div key={z.id} className={styles.legendItem}>
              <span className={styles.legendDot} style={{ background: z.color }} />
              <div>
                <b className={styles.legendLabel} style={{ color: z.color }}>{z.label}</b>
                <p className={styles.legendDesc}>{z.desc}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {latestResult && (
        <div className={styles.liveReadout}>
          <span className={styles.readoutLabel}>Latest Year ({latestResult.year})</span>
          <div className={styles.readoutRow}>
            <span>Flood Risk</span><b>{latestResult.flood_risk?.toFixed(1)}</b>
            <span>Tiger Migration</span><b>{latestResult.tiger_migration_probability?.toFixed(1)}</b>
            <span>Zoonotic Index</span><b>{latestResult.zoonotic_risk_index?.toFixed(1)}</b>
          </div>
        </div>
      )}
    </div>
  )
}
