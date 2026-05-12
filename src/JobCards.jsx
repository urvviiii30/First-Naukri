function JobCards({ jobs, onViewApplicants, onEditJob, onCloseJob }) {
  return (
    <section className="rd-card" id="manage-jobs" aria-label="Active job posts">
      <h2 className="rd-card-title">Active Job Posts</h2>
      <div className="rd-job-grid">
        {jobs.map((job) => (
          <article key={job.id} className="rd-job-card">
            <div className="rd-job-top">
              <div>
                <h3 className="rd-job-title">{job.title}</h3>
                <p className="rd-job-meta">{job.location}</p>
              </div>
              <span className={`rd-pill ${job.status === 'Open' ? 'rd-pill--shortlisted' : 'rd-pill--rejected'}`}>
                {job.status}
              </span>
            </div>

            <div className="rd-job-kpis" aria-label="Job metrics">
              <span className="rd-kpi">{job.applicantsCount} applicants</span>
              <span className="rd-kpi">{job.level}</span>
              <span className="rd-kpi">{job.type}</span>
            </div>

            <div className="rd-job-actions">
              <button type="button" className="rd-btn rd-btn--outline" onClick={() => onViewApplicants(job.id)}>
                View Applicants
              </button>
              <button type="button" className="rd-btn" onClick={() => onEditJob(job.id)}>
                Edit Job
              </button>
              <button
                type="button"
                className="rd-btn rd-btn--danger"
                onClick={() => onCloseJob(job.id)}
                disabled={job.status !== 'Open'}
              >
                Close Job
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default JobCards

