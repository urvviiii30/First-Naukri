function clampPercent(n) {
  if (Number.isNaN(n)) return 0
  return Math.max(0, Math.min(100, n))
}

function Metric({ label, valueLabel, percent }) {
  const p = clampPercent(percent)
  return (
    <div>
      <div className="rd-metric">
        <strong>{label}</strong>
        <div className="rd-metric-right">{valueLabel}</div>
      </div>
      <div className="rd-progress" aria-label={`${label} progress`}>
        <div style={{ width: `${p}%` }} />
      </div>
    </div>
  )
}

function AnalyticsSection({ analytics }) {
  return (
    <section className="rd-card" id="analytics" aria-label="Hiring analytics">
      <h2 className="rd-card-title">Hiring Analytics</h2>
      <div className="rd-analytics">
        <Metric
          label="Applications this week"
          valueLabel={`${analytics.appsThisWeek}/${analytics.appsGoal}`}
          percent={(analytics.appsThisWeek / Math.max(1, analytics.appsGoal)) * 100}
        />
        <Metric
          label="Interviews scheduled"
          valueLabel={`${analytics.interviewsThisWeek}/${analytics.interviewsGoal}`}
          percent={(analytics.interviewsThisWeek / Math.max(1, analytics.interviewsGoal)) * 100}
        />
        <Metric
          label="Hiring success rate"
          valueLabel={`${analytics.successRate}%`}
          percent={analytics.successRate}
        />
      </div>
    </section>
  )
}

export default AnalyticsSection

