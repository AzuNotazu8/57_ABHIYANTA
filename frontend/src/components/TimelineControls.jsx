import styles from './TimelineControls.module.css'

export default function TimelineControls({
  years, currentIndex, playing, speed,
  onIndexChange, onPlay, onPause, onRewind, onSpeedChange,
}) {
  const year = years[currentIndex]
  const pct = years.length > 1 ? (currentIndex / (years.length - 1)) * 100 : 0

  return (
    <div className={styles.wrapper}>
      {/* Left – year display */}
      <div className={styles.yearBlock}>
        <span className={styles.yearLabel}>YEAR</span>
        <span className={styles.yearValue}>{year ?? '—'}</span>
        <span className={styles.yearRange}>2014 – 2033</span>
      </div>

      {/* Centre – controls + slider */}
      <div className={styles.centre}>
        <div className={styles.buttons}>
          <button
            className={styles.btn}
            onClick={onRewind}
            title="Rewind to start"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M1 2h2v12H1zM4 8L14 2v12z" />
            </svg>
          </button>

          <button
            className={`${styles.btn} ${styles.playBtn}`}
            onClick={playing ? onPause : onPlay}
            title={playing ? 'Pause' : 'Play'}
          >
            {playing ? (
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 2h3v12H3zM10 2h3v12h-3z" />
              </svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 16 16" fill="currentColor">
                <path d="M3 2l11 6-11 6z" />
              </svg>
            )}
          </button>

          <button
            className={styles.btn}
            onClick={() => onIndexChange(years.length - 1)}
            title="Skip to end"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
              <path d="M13 2h2v12h-2zM2 2l10 6-10 6z" />
            </svg>
          </button>
        </div>

        <div className={styles.sliderWrap}>
          <div className={styles.sliderTrack}>
            <div className={styles.sliderFill} style={{ width: `${pct}%` }} />
            <div className={styles.sliderThumb} style={{ left: `${pct}%` }} />
          </div>
          <input
            type="range"
            min={0}
            max={years.length - 1}
            value={currentIndex}
            onChange={e => onIndexChange(Number(e.target.value))}
            className={styles.sliderInput}
          />
          <div className={styles.tickRow}>
            {years.map((y, i) => (
              <button
                key={y}
                className={`${styles.tick} ${i === currentIndex ? styles.tickActive : ''}`}
                onClick={() => onIndexChange(i)}
              >
                {y % 5 === 0 || i === 0 || i === years.length - 1 ? y : ''}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right – speed */}
      <div className={styles.speedBlock}>
        <span className={styles.speedLabel}>SPEED</span>
        <div className={styles.speedBtns}>
          {[0.5, 1, 2].map(s => (
            <button
              key={s}
              className={`${styles.speedBtn} ${speed === s ? styles.speedActive : ''}`}
              onClick={() => onSpeedChange(s)}
            >
              {s}×
            </button>
          ))}
        </div>
        {playing && (
          <span className={styles.playingPulse}>● LIVE</span>
        )}
      </div>
    </div>
  )
}
