function InterviewSchedule({ interviews, onMarkHired }) {
  return (
    <section className="rd-card" id="interviews" aria-label="Upcoming interviews">
      <h2 className="rd-card-title">Upcoming Interviews</h2>
      <div className="rd-interview-list">
        {interviews.map((i) => (
          <div key={i.id} className="rd-interview-card">
            <div className="rd-interview-main">
              <p className="rd-interview-title">{i.candidateName}</p>
              <p className="rd-interview-sub">
                {i.jobTitle} · {i.timeLabel} · {i.mode}
              </p>
            </div>
            <div className="rd-interview-right">
              <span className="rd-pill rd-pill--interview">Scheduled</span>
              <button type="button" className="rd-btn rd-btn--primary" onClick={() => onMarkHired(i.id)}>
                Mark Hired
              </button>
            </div>
          </div>
        ))}
        {interviews.length === 0 && <div className="rd-muted">No interviews yet. Schedule one from the applicants list.</div>}
      </div>
    </section>
  )
}

export default InterviewSchedule

