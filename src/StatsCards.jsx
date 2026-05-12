const ICONS = {
  jobs: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
  applicants: 'M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z',
  interviews: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z',
  hires: 'M5 13l4 4L19 7',
}

function StatCard({ label, value, sub, iconPath }) {
  return (
    <div className="rd-stat-card">
      <div className="rd-stat-top">
        <div>
          <div className="rd-stat-label">{label}</div>
          <div className="rd-stat-value">{value}</div>
          {sub && <div className="rd-stat-sub">{sub}</div>}
        </div>
        <div className="rd-stat-icon" aria-hidden="true">
          <svg className="rd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={iconPath} />
          </svg>
        </div>
      </div>
    </div>
  )
}

function StatsCards({ activeJobs, totalApplicants, interviewsScheduled, hiresCompleted }) {
  return (
    <section className="rd-stats" aria-label="Hiring stats">
      <StatCard label="Active Job Posts" value={activeJobs} sub="Open roles right now" iconPath={ICONS.jobs} />
      <StatCard label="Total Applicants" value={totalApplicants} sub="Live applications" iconPath={ICONS.applicants} />
      <StatCard label="Interviews Scheduled" value={interviewsScheduled} sub="Upcoming + planned" iconPath={ICONS.interviews} />
      <StatCard label="Hires Completed" value={hiresCompleted} sub="This month" iconPath={ICONS.hires} />
    </section>
  )
}

export default StatsCards

