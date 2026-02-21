import styles from './ValidationPanel.module.css'

function ScoreBar({ label, mae, errorPct, color }) {
  const accuracy = Math.max(0, 100 - errorPct)
  return (
    <div className={styles.scoreBlock}>
      <div className={styles.scoreHeader}>
        <span className={styles.scoreLabel}>{label}</span>
        <span className={styles.scoreAcc} style={{ color }}>{accuracy.toFixed(1)}% acc.</span>
      </div>
      <div className={styles.scoreBar}>
        <div className={styles.scoreFill} style={{ width: `${accuracy}%`, background: color }} />
      </div>
      <div className={styles.scoreMeta}>
        <span>MAE: <b>{mae}</b></span>
        <span>Avg Error: <b>{errorPct}%</b></span>
      </div>
    </div>
  )
}

export default function ValidationPanel({ validation }) {
  if (!validation?.summary) {
    return (
      <div className={styles.panel}>
        <h2 className={styles.title}>Historical Validation</h2>
        <p className={styles.empty}>Run simulation to generate validation scores.</p>
      </div>
    )
  }

  const { summary, per_year } = validation

  return (
    <div className={styles.panel}>
      <div className={styles.panelHeader}>
        <h2 className={styles.title}>Historical Validation</h2>
        <span className={styles.badge}>2014 – 2023</span>
      </div>

      <div className={styles.scores}>
        <ScoreBar
          label="Flood Risk"
          mae={summary.flood_risk_mae}
          errorPct={summary.flood_risk_mean_error_pct}
          color="var(--teal-light)"
        />
        <ScoreBar
          label="Zoonotic Risk"
          mae={summary.zoonotic_risk_mae}
          errorPct={summary.zoonotic_risk_mean_error_pct}
          color="var(--amber)"
        />
      </div>

      <p className={styles.note}>{summary.validation_note}</p>

      {per_year && (
        <div className={styles.table}>
          <div className={styles.tableHead}>
            <span>Year</span>
            <span>Flood Pred</span>
            <span>Flood Obs</span>
            <span>Err</span>
            <span>Zoonotic Pred</span>
            <span>Zoonotic Obs</span>
            <span>Err</span>
          </div>
          {per_year.map(r => (
            <div key={r.year} className={styles.tableRow}>
              <span className={styles.yearCell}>{r.year}</span>
              <span>{r.predicted_flood_risk.toFixed(1)}</span>
              <span>{r.observed_flood_risk.toFixed(1)}</span>
              <span className={styles.errCell}>{r.flood_abs_error.toFixed(1)}</span>
              <span>{r.predicted_zoonotic_risk.toFixed(1)}</span>
              <span>{r.observed_zoonotic_risk.toFixed(1)}</span>
              <span className={styles.errCell}>{r.zoonotic_abs_error.toFixed(1)}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
