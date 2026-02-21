import styles from './YearPanel.module.css'

function Ring({ value, color, label }) {
  const r = 28
  const circ = 2 * Math.PI * r
  const dash = (value / 100) * circ
  return (
    <div className={styles.ring}>
      <svg width="70" height="70" viewBox="0 0 70 70">
        <circle cx="35" cy="35" r={r} fill="none" stroke="#2a2318" strokeWidth="6" />
        <circle
          cx="35" cy="35" r={r}
          fill="none"
          stroke={color}
          strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          transform="rotate(-90 35 35)"
          style={{ transition: 'stroke-dasharray 0.8s ease' }}
        />
        <text x="35" y="39" textAnchor="middle"
          fill="#d4c9b0" fontSize="13" fontFamily="Courier Prime" fontWeight="700">
          {value.toFixed(0)}
        </text>
      </svg>
      <span className={styles.ringLabel}>{label}</span>
    </div>
  )
}

function Bar({ label, value, color, icon }) {
  return (
    <div className={styles.bar}>
      <div className={styles.barTop}>
        <span className={styles.barIcon}>{icon}</span>
        <span className={styles.barLabel}>{label}</span>
        <span className={styles.barVal} style={{ color }}>{value.toFixed(1)}</span>
      </div>
      <div className={styles.barTrack}>
        <div className={styles.barFill}
          style={{ width: `${Math.min(100, value)}%`, background: color }} />
      </div>
    </div>
  )
}

export default function YearPanel({ data, isProjection }) {
  if (!data) return (
    <div className={styles.panel}>
      <div className={styles.empty}>
        <p>Run simulation to see data</p>
      </div>
    </div>
  )

  return (
    <div className={styles.panel}>
      <div className={styles.panelHead}>
        <div className={styles.yearStamp}>
          <span className={styles.yearNum}>{data.year}</span>
          {isProjection && <span className={styles.projBadge}>PROJECTION</span>}
        </div>
        <p className={styles.panelSub}>Sundarbans Cascade Index</p>
      </div>

      <div className={styles.rings}>
        <Ring value={data.flood_risk} color="#2d8faa" label="Flood" />
        <Ring value={data.zoonotic_risk_index} color="#a84030" label="Zoonotic" />
        <Ring value={data.tiger_migration_probability} color="#d4682a" label="Tiger" />
      </div>

      <div className={styles.divider} />

      <div className={styles.bars}>
        <Bar label="Prey Migration" value={data.prey_migration_probability}
          color="#7aac54" icon="🦌" />
        <Bar label="Prey Stress" value={data.prey_stress_index}
          color="#c47a2a" icon="🌿" />
        <Bar label="Glacier Melt" value={data.glacier_amplification}
          color="#8bbcce" icon="🧊" />
        <Bar label="Tiger Migration" value={data.tiger_migration_probability}
          color="#d4682a" icon="🐅" />
        <Bar label="Zoonotic Risk" value={data.zoonotic_risk_index}
          color="#a84030" icon="⚠" />
      </div>

      <div className={styles.divider} />

      <div className={styles.meta}>
        <div className={styles.metaRow}>
          <span>Flood Risk</span>
          <span style={{ color: '#2d8faa' }}>{data.flood_risk.toFixed(1)} / 100</span>
        </div>
        <div className={styles.metaRow}>
          <span>Scenario</span>
          <span>{data.scenario}</span>
        </div>
        <div className={styles.metaRow}>
          <span>Data Type</span>
          <span>{isProjection ? 'Synthetic projection' : 'Synthetic historical'}</span>
        </div>
      </div>
    </div>
  )
}
