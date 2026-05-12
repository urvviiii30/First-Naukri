const STATUS_CLASS = {
  New: 'rd-pill rd-pill--new',
  Shortlisted: 'rd-pill rd-pill--shortlisted',
  Rejected: 'rd-pill rd-pill--rejected',
  Interview: 'rd-pill rd-pill--interview',
}

function formatRelative(timeMs) {
  const diff = Date.now() - timeMs
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

function ApplicantsTable({ applicants, onShortlist, onScheduleInterview, onReject, searchValue }) {
  const q = searchValue.trim().toLowerCase()
  const filtered = q
    ? applicants.filter((a) => {
        const hay = `${a.name} ${a.jobTitle} ${a.experience}`.toLowerCase()
        return hay.includes(q)
      })
    : applicants

  return (
    <section className="rd-card" id="applicants" aria-label="Recent applicants">
      <h2 className="rd-card-title">Recent Applicants (Live)</h2>
      <div className="rd-table-wrap" role="region" aria-label="Applicants table">
        <table className="rd-table">
          <thead>
            <tr>
              <th>Candidate Name</th>
              <th>Applied Job</th>
              <th>Experience</th>
              <th>Application Time</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((a) => (
              <tr key={a.id}>
                <td>
                  <div className="rd-name">{a.name}</div>
                  <div className="rd-muted">{a.email}</div>
                </td>
                <td>
                  <div>{a.jobTitle}</div>
                  <div className="rd-muted">{a.location}</div>
                </td>
                <td>{a.experience}</td>
                <td>{formatRelative(a.appliedAt)}</td>
                <td>
                  <span className={STATUS_CLASS[a.status] || 'rd-pill'}>{a.status}</span>
                </td>
                <td>
                  <div className="rd-actions">
                    <button
                      type="button"
                      className="rd-btn rd-btn--outline"
                      onClick={() => onShortlist(a.id)}
                      disabled={a.status === 'Rejected'}
                    >
                      Shortlist
                    </button>
                    <button
                      type="button"
                      className="rd-btn rd-btn--primary"
                      onClick={() => onScheduleInterview(a.id)}
                      disabled={a.status === 'Rejected'}
                    >
                      Schedule Interview
                    </button>
                    <button
                      type="button"
                      className="rd-btn rd-btn--danger"
                      onClick={() => onReject(a.id)}
                      disabled={a.status === 'Rejected'}
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="rd-muted">
                  No applicants match your search.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

export default ApplicantsTable

