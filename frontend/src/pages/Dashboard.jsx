import { useState, useEffect, useRef, useCallback } from 'react'
import { MapContainer, TileLayer, CircleMarker, Popup, Circle, useMap } from 'react-leaflet'
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Legend,
} from 'recharts'
import { getMitigations, SEVERITY_META } from '../utils/mitigationEngine'
import 'leaflet/dist/leaflet.css'
import styles from './Dashboard.module.css'

/* ── Tiger base positions (lat/lon near Sundarbans core) ── */
const TIGER_BASE = [
  { id: 't1', lat: 21.95, lon: 89.15 },
  { id: 't2', lat: 21.80, lon: 89.40 },
  { id: 't3', lat: 22.05, lon: 88.90 },
  { id: 't4', lat: 21.70, lon: 89.60 },
  { id: 't5', lat: 22.10, lon: 89.25 },
]

const DEER_BASE = [
  { id: 'd1', lat: 22.00, lon: 89.10 },
  { id: 'd2', lat: 21.85, lon: 89.30 },
  { id: 'd3', lat: 21.75, lon: 89.50 },
  { id: 'd4', lat: 22.05, lon: 89.00 },
  { id: 'd5', lat: 21.90, lon: 89.55 },
  { id: 'd6', lat: 22.12, lon: 89.35 },
  { id: 'd7', lat: 21.65, lon: 89.20 },
]

/* Animals shift north (lat increases) as migration pressure rises */
function shiftedPos(base, migrationPct, latShift, lonShift) {
  const t = Math.min(1, migrationPct / 100)
  return { lat: base.lat + latShift * t, lon: base.lon + lonShift * t }
}

const TIGER_SHIFTS = [
  { dlat: 0.55, dlon: -0.18 }, { dlat: 0.48, dlon: -0.22 },
  { dlat: 0.60, dlon: -0.15 }, { dlat: 0.52, dlon: -0.25 },
  { dlat: 0.44, dlon: -0.20 },
]
const DEER_SHIFTS = [
  { dlat: 0.50, dlon: -0.15 }, { dlat: 0.45, dlon: -0.18 },
  { dlat: 0.40, dlon: -0.22 }, { dlat: 0.55, dlon: -0.12 },
  { dlat: 0.48, dlon: -0.20 }, { dlat: 0.42, dlon: -0.16 },
  { dlat: 0.38, dlon: -0.24 },
]

/* Sundarbans flood zone center */
const FLOOD_CENTER = [21.9, 89.1]

/* Recharts custom tooltip */
function ChartTooltip({ active, payload, label, currentYear }) {
  if (!active || !payload?.length) return null
  return (
    <div className={styles.chartTooltip}>
      <div className={styles.tooltipYear}>{label}{label == currentYear ? ' ◀ NOW' : ''}</div>
      {payload.map(p => (
        <div key={p.dataKey} className={styles.tooltipRow}>
          <span className={styles.tooltipDot} style={{ background: p.color }} />
          <span>{p.name}</span>
          <b>{Number(p.value).toFixed(1)}</b>
        </div>
      ))}
    </div>
  )
}

/* Force map to invalidate size when panel opens */
function MapResizer() {
  const map = useMap()
  useEffect(() => { setTimeout(() => map.invalidateSize(), 100) }, [map])
  return null
}

export default function Dashboard() {
  const [timeline, setTimeline] = useState([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [playing, setPlaying] = useState(false)
  const [speed, setSpeed] = useState(1)
  const [loadError, setLoadError] = useState(null)
  const intervalRef = useRef(null)

  /* ── Load timeline from API ── */
  useEffect(() => {
    fetch('/api/analysis/timeline')
      .then(r => r.json())
      .then(data => { setTimeline(data); setCurrentIndex(0) })
      .catch(() => setLoadError('Could not connect to backend. Is it running on port 8000?'))
  }, [])

  const years = timeline.map(r => r.year)
  const currentData = timeline[currentIndex] ?? null

  /* ── Playback ── */
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
    }, Math.round(1400 / speed))
  }, [timeline.length, speed])

  useEffect(() => {
    if (playing) { clearInterval(intervalRef.current); startPlay() }
    return () => clearInterval(intervalRef.current)
  }, [speed, playing, startPlay])

  const handlePlay = () => {
    if (currentIndex >= timeline.length - 1) setCurrentIndex(0)
    startPlay()
  }

  /* ── Compute animal positions ── */
  const tigerPos = TIGER_BASE.map((b, i) =>
    shiftedPos(b, currentData?.tiger_migration_probability ?? 0,
      TIGER_SHIFTS[i].dlat, TIGER_SHIFTS[i].dlon)
  )
  const deerPos = DEER_BASE.map((b, i) =>
    shiftedPos(b, currentData?.prey_migration_probability ?? 0,
      DEER_SHIFTS[i].dlat, DEER_SHIFTS[i].dlon)
  )

  const floodRisk = currentData?.flood_risk ?? 0
  const floodRadius = 8000 + (floodRisk / 100) * 60000
  const floodOpacity = 0.08 + (floodRisk / 100) * 0.35

  const mitigations = getMitigations(currentData)

  const isProjection = currentData?.is_projection ?? false

  if (loadError) {
    return (
      <div className={styles.errorScreen}>
        <span>⚠</span>
        <p>{loadError}</p>
      </div>
    )
  }

  if (timeline.length === 0) {
    return (
      <div className={styles.loadScreen}>
        <div className={styles.spinner} />
        <p>Loading simulation data…</p>
      </div>
    )
  }

  return (
    <div className={styles.dashboard}>

      {/* ══════════════════════════════════════════════ */}
      {/*  TOP ROW: Map + Graphs                        */}
      {/* ══════════════════════════════════════════════ */}
      <div className={styles.topRow}>

        {/* ── MAP ── */}
        <div className={styles.mapPanel}>
          <div className={styles.panelLabel}>
            <span className={styles.labelDot} style={{ background: '#2d8faa' }} />
            Live Ecosystem Map — Sundarbans
            {isProjection && <span className={styles.projBadge}>PROJECTION</span>}
          </div>

          <div className={styles.mapWrap}>
            <MapContainer
              center={[22.0, 89.2]}
              zoom={9}
              className={styles.leaflet}
              zoomControl={true}
              scrollWheelZoom={false}
            >
              <MapResizer />
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                className={styles.mapTile}
              />

              {/* Flood overlay */}
              <Circle
                center={FLOOD_CENTER}
                radius={floodRadius}
                pathOptions={{
                  color: '#2d6b8a',
                  fillColor: '#2d6b8a',
                  fillOpacity: floodOpacity,
                  weight: 1,
                  opacity: 0.4,
                }}
              />

              {/* Secondary flood ring */}
              {floodRisk > 40 && (
                <Circle
                  center={[21.7, 89.4]}
                  radius={floodRadius * 0.6}
                  pathOptions={{
                    color: '#2d6b8a',
                    fillColor: '#2d6b8a',
                    fillOpacity: floodOpacity * 0.6,
                    weight: 1,
                    opacity: 0.3,
                  }}
                />
              )}

              {/* Deer markers */}
              {deerPos.map((pos, i) => (
                <CircleMarker
                  key={`deer_${i}`}
                  center={[pos.lat, pos.lon]}
                  radius={7}
                  pathOptions={{
                    color: '#5a8f3a',
                    fillColor: '#7aac54',
                    fillOpacity: 0.9,
                    weight: 1.5,
                  }}
                >
                  <Popup className={styles.popup}>
                    <b>🦌 Prey Species</b><br />
                    Migration: {currentData?.prey_migration_probability?.toFixed(1)}%<br />
                    Stress Index: {currentData?.prey_stress_index?.toFixed(1)}
                  </Popup>
                </CircleMarker>
              ))}

              {/* Tiger markers */}
              {tigerPos.map((pos, i) => (
                <CircleMarker
                  key={`tiger_${i}`}
                  center={[pos.lat, pos.lon]}
                  radius={10}
                  pathOptions={{
                    color: '#a04010',
                    fillColor: '#d4682a',
                    fillOpacity: 0.92,
                    weight: 2,
                  }}
                >
                  <Popup className={styles.popup}>
                    <b>🐅 Bengal Tiger</b><br />
                    Migration: {currentData?.tiger_migration_probability?.toFixed(1)}%<br />
                    Year: {currentData?.year}
                  </Popup>
                </CircleMarker>
              ))}
            </MapContainer>

            {/* Map legend overlay */}
            <div className={styles.mapLegend}>
              <div className={styles.legendRow}>
                <span className={styles.legendDot} style={{ background: '#d4682a' }} />
                Bengal Tiger
              </div>
              <div className={styles.legendRow}>
                <span className={styles.legendDot} style={{ background: '#7aac54' }} />
                Prey Species
              </div>
              <div className={styles.legendRow}>
                <span className={styles.legendDot} style={{ background: '#2d6b8a', opacity: 0.7 }} />
                Flood Zone
              </div>
            </div>

            {/* Flood intensity badge */}
            <div className={styles.floodBadge}>
              <span className={styles.floodBadgeLabel}>Flood Risk</span>
              <span className={styles.floodBadgeVal}>{floodRisk.toFixed(0)}<small>/100</small></span>
            </div>
          </div>
        </div>

        {/* ── GRAPHS ── */}
        <div className={styles.graphsPanel}>
          <div className={styles.panelLabel}>
            <span className={styles.labelDot} style={{ background: '#c47a2a' }} />
            20-Year Cascade Metrics
          </div>

          <div className={styles.graphStack}>

            {/* Graph 1: Flood + Zoonotic */}
            <div className={styles.graphBox}>
              <span className={styles.graphTitle}>Risk Indices</span>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={timeline} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#2a2318" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#5a5040', fontSize: 9, fontFamily: 'Courier Prime' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#5a5040', fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip currentYear={currentData?.year} />} />
                  <ReferenceLine x={currentData?.year} stroke="#4a3e28" strokeWidth={1.5} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="flood_risk" name="Flood Risk" stroke="#2d8faa" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="zoonotic_risk_index" name="Zoonotic Risk" stroke="#a84030" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Graph 2: Migration */}
            <div className={styles.graphBox}>
              <span className={styles.graphTitle}>Animal Migration</span>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={timeline} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#2a2318" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#5a5040', fontSize: 9, fontFamily: 'Courier Prime' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#5a5040', fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip currentYear={currentData?.year} />} />
                  <ReferenceLine x={currentData?.year} stroke="#4a3e28" strokeWidth={1.5} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="tiger_migration_probability" name="Tiger" stroke="#d4682a" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="prey_migration_probability" name="Prey" stroke="#7aac54" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Graph 3: Glacier + Prey Stress */}
            <div className={styles.graphBox}>
              <span className={styles.graphTitle}>Habitat Stress</span>
              <ResponsiveContainer width="100%" height={110}>
                <LineChart data={timeline} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="2 4" stroke="#2a2318" vertical={false} />
                  <XAxis dataKey="year" tick={{ fill: '#5a5040', fontSize: 9, fontFamily: 'Courier Prime' }} tickLine={false} axisLine={false} />
                  <YAxis tick={{ fill: '#5a5040', fontSize: 9 }} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip content={<ChartTooltip currentYear={currentData?.year} />} />
                  <ReferenceLine x={currentData?.year} stroke="#4a3e28" strokeWidth={1.5} strokeDasharray="3 3" />
                  <Line type="monotone" dataKey="glacier_amplification" name="Glacier Melt" stroke="#8bbcce" strokeWidth={2} dot={false} />
                  <Line type="monotone" dataKey="prey_stress_index" name="Prey Stress" stroke="#c47a2a" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Current year stat pills */}
            {currentData && (
              <div className={styles.statRow}>
                {[
                  { k: 'flood_risk', label: 'Flood', color: '#2d8faa' },
                  { k: 'tiger_migration_probability', label: 'Tiger', color: '#d4682a' },
                  { k: 'prey_migration_probability', label: 'Prey', color: '#7aac54' },
                  { k: 'zoonotic_risk_index', label: 'Zoonotic', color: '#a84030' },
                  { k: 'glacier_amplification', label: 'Glacier', color: '#8bbcce' },
                ].map(({ k, label, color }) => (
                  <div key={k} className={styles.statPill}>
                    <span className={styles.statPillDot} style={{ background: color }} />
                    <span className={styles.statPillLabel}>{label}</span>
                    <span className={styles.statPillVal} style={{ color }}>{currentData[k]?.toFixed(0)}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/*  TIMELINE CONTROLS                            */}
      {/* ══════════════════════════════════════════════ */}
      <div className={styles.controlsRow}>
        <div className={styles.yearDisplay}>
          <span className={styles.yearNum}>{currentData?.year ?? '—'}</span>
          {isProjection && <span className={styles.projTag}>PROJ</span>}
        </div>

        <div className={styles.controlsCentre}>
          <div className={styles.ctrlBtns}>
            <button className={styles.ctrlBtn}
              onClick={() => { stopPlay(); setCurrentIndex(0) }} title="Rewind">
              ⏮
            </button>
            <button className={`${styles.ctrlBtn} ${styles.playBtn}`}
              onClick={playing ? stopPlay : handlePlay}>
              {playing ? '⏸' : '▶'}
            </button>
            <button className={styles.ctrlBtn}
              onClick={() => { stopPlay(); setCurrentIndex(timeline.length - 1) }} title="End">
              ⏭
            </button>
          </div>

          <div className={styles.sliderWrap}>
            <div className={styles.sliderTrack}>
              <div className={styles.sliderFill}
                style={{ width: `${years.length > 1 ? (currentIndex / (years.length - 1)) * 100 : 0}%` }} />
            </div>
            <input type="range" min={0} max={Math.max(0, timeline.length - 1)}
              value={currentIndex}
              onChange={e => { stopPlay(); setCurrentIndex(Number(e.target.value)) }}
              className={styles.rangeInput}
            />
            <div className={styles.yearTicks}>
              {years.filter((y, i) => i === 0 || i === years.length - 1 || y % 5 === 0).map(y => (
                <span key={y} className={styles.tick}>{y}</span>
              ))}
            </div>
          </div>
        </div>

        <div className={styles.speedBlock}>
          <span className={styles.speedLabel}>SPEED</span>
          {[0.5, 1, 2].map(s => (
            <button key={s}
              className={`${styles.speedBtn} ${speed === s ? styles.speedActive : ''}`}
              onClick={() => setSpeed(s)}>
              {s}×
            </button>
          ))}
          {playing && <span className={styles.liveDot}>● LIVE</span>}
        </div>
      </div>

      {/* ══════════════════════════════════════════════ */}
      {/*  AI MITIGATION SUGGESTIONS                    */}
      {/* ══════════════════════════════════════════════ */}
      <div className={styles.suggestionsRow}>
        <div className={styles.suggestionsHead}>
          <span className={styles.suggestionsTitle}>
            🌿 Mitigation Recommendations — {currentData?.year}
          </span>
          <span className={styles.suggestionsNote}>
            Rule-based engine · {mitigations.length} active recommendation{mitigations.length !== 1 ? 's' : ''}
          </span>
        </div>

        <div className={styles.suggestionsList}>
          {mitigations.map((m, i) => {
            const meta = SEVERITY_META[m.severity]
            return (
              <div key={i} className={styles.suggCard}
                style={{ borderColor: meta.border, background: meta.bg }}>
                <div className={styles.suggCardHead}>
                  <span className={styles.suggIcon}>{m.icon}</span>
                  <div>
                    <span className={styles.suggBadge} style={{ color: meta.color, borderColor: meta.border }}>
                      {meta.label} · {m.category}
                    </span>
                    <p className={styles.suggTitle} style={{ color: meta.color }}>{m.title}</p>
                  </div>
                </div>
                <ul className={styles.suggActions}>
                  {m.actions.map((a, j) => (
                    <li key={j} className={styles.suggAction}>
                      <span style={{ color: meta.color }}>→</span> {a}
                    </li>
                  ))}
                </ul>
              </div>
            )
          })}
        </div>
      </div>

    </div>
  )
}
