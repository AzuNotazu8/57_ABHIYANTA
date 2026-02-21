import { useState, useEffect, useRef, useCallback } from 'react'
import InteractiveMap from './components/InteractiveMap'
import TimelineControls from './components/TimelineControls'
import YearPanel from './components/YearPanel'
import { useSimulation } from './hooks/useSimulation'
import { api } from './api/client'
import styles from './App.module.css'

export default function App() {
  const { timeline, loading, running, error, runAll } = useSimulation()
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const intervalRef = useRef(null)

  const years = timeline.map(r => r.year)
  const currentData = timeline[currentIndex] ?? null
  const isProjection = currentData?.is_projection ?? false

  /* ── Auto-play logic ── */
  const stopPlay = useCallback(() => {
    clearInterval(intervalRef.current)
    setPlaying(false)
  }, [])

  const startPlay = useCallback(() => {
    if (timeline.length === 0) return
    setPlaying(true)
    intervalRef.current = setInterval(() => {
      setCurrentIndex(prev => {
        if (prev >= timeline.length - 1) {
          clearInterval(intervalRef.current)
          setPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, Math.round(1200 / speed))
  }, [timeline.length, speed])

  useEffect(() => {
    if (playing) {
      clearInterval(intervalRef.current)
      startPlay()
    }
    return () => clearInterval(intervalRef.current)
  }, [speed, playing, startPlay])

  const handlePlay = () => {
    if (currentIndex >= timeline.length - 1) setCurrentIndex(0)
    startPlay()
  }

  const handleRewind = () => {
    stopPlay()
    setCurrentIndex(0)
  }

  /* ── Seed + run on first load if no data ── */
  const hasSeeded = useRef(false)
  useEffect(() => {
    if (!loading && timeline.length === 0 && !hasSeeded.current) {
      hasSeeded.current = true
      runAll('baseline')
    }
  }, [loading, timeline.length, runAll])

  if (loading) {
    return (
      <div className={styles.splash}>
        <div className={styles.splashInner}>
          <div className={styles.splashSpinner} />
          <span className={styles.splashTitle}>AETHERA</span>
          <span className={styles.splashSub}>Initialising Sundarbans cascade engine…</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.app}>

      {/* ── Top bar ── */}
      <header className={styles.topBar}>
        <div className={styles.brand}>
          <span className={styles.brandHex}>⬡</span>
          <div>
            <span className={styles.brandName}>AETHERA</span>
            <span className={styles.brandTagline}>Sundarbans Climate Cascade · 2014 – 2033</span>
          </div>
        </div>

        <div className={styles.topActions}>
          {error && <span className={styles.errorMsg}>⚠ {error}</span>}
          {timeline.length === 0 && !running && (
            <span className={styles.hintMsg}>No data — auto-running simulation…</span>
          )}
          <button
            className={`${styles.runBtn} ${running ? styles.runBtnActive : ''}`}
            onClick={() => runAll('baseline')}
            disabled={running}
          >
            {running ? (
              <><span className={styles.spinner} />Running…</>
            ) : '▶ Re-run Simulation'}
          </button>
        </div>
      </header>

      {/* ── Main layout: map + right panel ── */}
      <div className={styles.body}>
        <div className={styles.mapArea}>
          <InteractiveMap data={currentData} year={currentData?.year ?? ''} />
        </div>
        <div className={styles.sidePanel}>
          <YearPanel data={currentData} isProjection={isProjection} />
        </div>
      </div>

      {/* ── Timeline controls ── */}
      <div className={styles.controls}>
        <TimelineControls
          years={years}
          currentIndex={currentIndex}
          playing={playing}
          speed={speed}
          onIndexChange={i => { stopPlay(); setCurrentIndex(i) }}
          onPlay={handlePlay}
          onPause={stopPlay}
          onRewind={handleRewind}
          onSpeedChange={setSpeed}
        />
      </div>

    </div>
  )
}
