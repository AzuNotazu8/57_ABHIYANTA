import {
  ComposedChart, Line, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ReferenceLine, ResponsiveContainer
} from 'recharts'
import styles from './TimelineChart.module.css'

const METRICS = [
  { key: 'flood_risk', label: 'Flood Risk', color: '#1F6F78' },
  { key: 'zoonotic_risk_index', label: 'Zoonotic Risk', color: '#C8862A' },
  { key: 'tiger_migration_probability', label: 'Tiger Migration', color: '#4a7c5e' },
  { key: 'prey_migration_probability', label: 'Prey Migration', color: '#6a8faf' },
]

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const isProjection = payload[0]?.payload?.is_projection
  return (
    <div className={styles.tooltip}>
      <div className={styles.tooltipHeader}>
        <span className={styles.tooltipYear}>{label}</span>
        {isProjection && <span className={styles.tooltipBadge}>Projection</span>}
      </div>
      {payload.map(p => (
        <div key={p.dataKey} className={styles.tooltipRow}>
          <span className={styles.tooltipDot} style={{ background: p.color }} />
          <span className={styles.tooltipLabel}>{p.name}</span>
          <span className={styles.tooltipVal}>{p.value?.toFixed(1)}</span>
        </div>
      ))}
    </div>
  )
}

export default function TimelineChart({ data, activeMetrics, title }) {
  const displayed = METRICS.filter(m => activeMetrics.includes(m.key))

  return (
    <div className={styles.wrapper}>
      <div className={styles.chartHeader}>
        <h2 className={styles.chartTitle}>{title}</h2>
        <span className={styles.chartNote}>2014 – 2033 · Historical + Projection</span>
      </div>
      <ResponsiveContainer width="100%" height={320}>
        <ComposedChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
          <defs>
            {displayed.map(m => (
              <linearGradient key={m.key} id={`grad_${m.key}`} x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={m.color} stopOpacity={0.15} />
                <stop offset="95%" stopColor={m.color} stopOpacity={0} />
              </linearGradient>
            ))}
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#1e3a52" vertical={false} />
          <XAxis
            dataKey="year"
            stroke="#4a6b84"
            tick={{ fill: '#4a6b84', fontSize: 11, fontFamily: 'DM Mono' }}
            tickLine={false}
            axisLine={{ stroke: '#1e3a52' }}
          />
          <YAxis
            stroke="#4a6b84"
            tick={{ fill: '#4a6b84', fontSize: 11, fontFamily: 'DM Mono' }}
            tickLine={false}
            axisLine={false}
            domain={[0, 100]}
            tickFormatter={v => `${v}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend
            wrapperStyle={{ paddingTop: 16, fontSize: 11, fontFamily: 'DM Mono', color: '#7fa3be' }}
            formatter={(value) => value}
          />
          <ReferenceLine x={2023} stroke="#1e3a52" strokeDasharray="4 4" label={{ value: 'NOW', fill: '#4a6b84', fontSize: 9, fontFamily: 'DM Mono', position: 'top' }} />
          {displayed.map(m => (
            <Area
              key={`area_${m.key}`}
              type="monotone"
              dataKey={m.key}
              name={m.label}
              stroke={m.color}
              strokeWidth={2}
              dot={false}
              fill={`url(#grad_${m.key})`}
              activeDot={{ r: 4, strokeWidth: 0 }}
            />
          ))}
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  )
}
