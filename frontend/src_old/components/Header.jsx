import styles from './Header.module.css'

export default function Header({ onRunAll, running }) {
  return (
    <header className={styles.header}>
      <div className={styles.brand}>
        <div className={styles.logoMark}>
          <span className={styles.logoA}>Æ</span>
        </div>
        <div className={styles.brandText}>
          <h1 className={styles.title}>AETHERA</h1>
          <p className={styles.subtitle}>Climate Cascade Simulation — Sundarbans Ecosystem</p>
        </div>
      </div>
      <div className={styles.actions}>
        <div className={styles.statusDot} />
        <span className={styles.statusLabel}>Live Engine</span>
        <button
          className={styles.runBtn}
          onClick={() => onRunAll('baseline')}
          disabled={running}
        >
          {running ? (
            <><span className={styles.spinner} /> Running…</>
          ) : (
            '▶ Run Full Simulation'
          )}
        </button>
      </div>
    </header>
  )
}
