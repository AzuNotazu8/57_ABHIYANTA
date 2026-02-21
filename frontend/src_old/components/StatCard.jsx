import styles from './StatCard.module.css'

function getRiskLevel(value) {
  if (value >= 75) return { label: 'Critical', cls: 'critical' }
  if (value >= 50) return { label: 'High', cls: 'high' }
  if (value >= 25) return { label: 'Moderate', cls: 'moderate' }
  return { label: 'Low', cls: 'low' }
}

export default function StatCard({ label, value, unit = '', description, accentColor }) {
  const risk = getRiskLevel(value)
  const pct = Math.min(100, Math.max(0, value))

  return (
    <div className={styles.card}>
      <div className={styles.top}>
        <span className={styles.label}>{label}</span>
        <span className={`${styles.badge} ${styles[risk.cls]}`}>{risk.label}</span>
      </div>
      <div className={styles.valueRow}>
        <span className={styles.value}>{value.toFixed(1)}</span>
        <span className={styles.unit}>{unit}</span>
      </div>
      <div className={styles.bar}>
        <div
          className={styles.fill}
          style={{ width: `${pct}%`, background: accentColor || 'var(--teal)' }}
        />
      </div>
      {description && <p className={styles.desc}>{description}</p>}
    </div>
  )
}
