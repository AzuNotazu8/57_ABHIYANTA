import { useState } from 'react'
import Header from './components/Header'
import StatCard from './components/StatCard'
import TimelineChart from './components/TimelineChart'
import ValidationPanel from './components/ValidationPanel'
import MapZones from './components/MapZones'
import MetricToggle from './components/MetricToggle'
import { useSimulation } from './hooks/useSimulation'
import styles from './App.module.css'

export default function App() {
  const { timeline, historical, projections, validation, loading, running, error, runAll } = useSimulation()
  const [activeMetrics, setActiveMetrics] = useState(['flood_risk', 'zoonotic_risk_index', 'tiger_migration_probability'])

  const latest = historical.length ? historical[historical.length - 1] : null
  const latestProj = projections.length ? projections[projections.length - 1] : null

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.loadingInner}>
          <div className={styles.loadSpinner} />
          <p>Initializing AETHERA engine…</p>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.app}>
      <Header onRunAll={runAll} running={running} />

      {error && (
        <div className={styles.error}>
          <span className={styles.errorIcon}>⚠</span>
          {error} — Is the backend running on port 8000?
        </div>
      )}

      <main className={styles.main}>

        <section className={styles.sectionHeader}>
          <div>
            <h2 className={styles.sectionTitle}>Current Snapshot</h2>
            <p className={styles.sectionSub}>Latest historical year: {latest?.year ?? '—'}</p>
          </div>
          {timeline.length === 0 && (
            <div className={styles.emptyHint}>
              No data yet — click <b>Run Full Simulation</b> above to populate.
            </div>
          )}
        </section>

        {latest && (
          <div className={styles.cards}>
            <StatCard
              label="Flood Risk"
              value={latest.flood_risk}
              unit="/ 100"
              description="Temperature, rainfall, and glacier melt composite"
              accentColor="var(--teal)"
            />
            <StatCard
              label="Glacier Amplification"
              value={latest.glacier_amplification}
              unit="/ 100"
              description="Himalayan melt contribution to downstream flood risk"
              accentColor="#6a8fa8"
            />
            <StatCard
              label="Prey Migration"
              value={latest.prey_migration_probability}
              unit="/ 100"
              description="Displacement probability driven by habitat stress"
              accentColor="var(--sage)"
            />
            <StatCard
              label="Tiger Migration"
              value={latest.tiger_migration_probability}
              unit="/ 100"
              description="Secondary displacement following prey movement"
              accentColor="var(--amber)"
            />
            <StatCard
              label="Zoonotic Risk Index"
              value={latest.zoonotic_risk_index}
              unit="/ 100"
              description="Human-wildlife interface exposure risk composite"
              accentColor="var(--rose)"
            />
            <StatCard
              label="Prey Stress Index"
              value={latest.prey_stress_index}
              unit="/ 100"
              description="Vegetation loss, flood impact, and salinity proxy"
              accentColor="#8a7ab0"
            />
          </div>
        )}

        {latestProj && (
          <>
            <section className={styles.sectionHeader}>
              <div>
                <h2 className={styles.sectionTitle}>2033 Projection Snapshot</h2>
                <p className={styles.sectionSub}>Synthetic trend extrapolation · Baseline scenario</p>
              </div>
            </section>
            <div className={styles.cards}>
              <StatCard label="Flood Risk" value={latestProj.flood_risk} unit="/ 100" accentColor="var(--teal)" />
              <StatCard label="Glacier Amplification" value={latestProj.glacier_amplification} unit="/ 100" accentColor="#6a8fa8" />
              <StatCard label="Prey Migration" value={latestProj.prey_migration_probability} unit="/ 100" accentColor="var(--sage)" />
              <StatCard label="Tiger Migration" value={latestProj.tiger_migration_probability} unit="/ 100" accentColor="var(--amber)" />
              <StatCard label="Zoonotic Risk Index" value={latestProj.zoonotic_risk_index} unit="/ 100" accentColor="var(--rose)" />
              <StatCard label="Prey Stress Index" value={latestProj.prey_stress_index} unit="/ 100" accentColor="#8a7ab0" />
            </div>
          </>
        )}

        <section className={styles.sectionHeader}>
          <h2 className={styles.sectionTitle}>20-Year Timeline</h2>
          <MetricToggle active={activeMetrics} onChange={setActiveMetrics} />
        </section>

        <TimelineChart
          data={timeline}
          activeMetrics={activeMetrics}
          title="Cascade Metrics · 2014–2033"
        />

        <div className={styles.twoCol}>
          <MapZones latestResult={latest} />
          <ValidationPanel validation={validation} />
        </div>

      </main>

      <footer className={styles.footer}>
        <span>AETHERA v2.0 · Sundarbans Climate Cascade Engine</span>
        <span>All data labeled synthetic · Not for operational use</span>
      </footer>
    </div>
  )
}
