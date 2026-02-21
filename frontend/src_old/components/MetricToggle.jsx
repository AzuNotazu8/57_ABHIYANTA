import styles from './MetricToggle.module.css'

const METRICS = [
  { key: 'flood_risk', label: 'Flood Risk', color: '#1F6F78' },
  { key: 'zoonotic_risk_index', label: 'Zoonotic Risk', color: '#C8862A' },
  { key: 'tiger_migration_probability', label: 'Tiger Migration', color: '#4a7c5e' },
  { key: 'prey_migration_probability', label: 'Prey Migration', color: '#6a8faf' },
  { key: 'glacier_amplification', label: 'Glacier Amp.', color: '#7a6fa0' },
]

export default function MetricToggle({ active, onChange }) {
  const toggle = (key) => {
    if (active.includes(key)) {
      if (active.length === 1) return
      onChange(active.filter(k => k !== key))
    } else {
      onChange([...active, key])
    }
  }

  return (
    <div className={styles.wrapper}>
      <span className={styles.label}>Chart Metrics</span>
      <div className={styles.pills}>
        {METRICS.map(m => (
          <button
            key={m.key}
            className={`${styles.pill} ${active.includes(m.key) ? styles.active : ''}`}
            style={{ '--mc': m.color }}
            onClick={() => toggle(m.key)}
          >
            <span className={styles.dot} style={{ background: m.color }} />
            {m.label}
          </button>
        ))}
      </div>
    </div>
  )
}
