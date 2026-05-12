const JOBS = [
  {
    title: 'Frontend Developer Intern',
    company: 'ABC Tech',
    location: 'Remote',
    stipend: '₹12,000/month',
  },
  {
    title: 'Data Analyst Intern',
    company: 'XYZ Analytics',
    location: 'Gurgaon',
    stipend: '₹15,000/month',
  },
  {
    title: 'Backend Developer (Fresher)',
    company: 'CloudStack Labs',
    location: 'Bangalore',
    stipend: '₹4–6 LPA',
  },
]

function FeaturedJobs() {
  return (
    <section id="jobs" className="bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Featured Opportunities</p>
            <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Handpicked roles for fresh talent</h2>
          </div>
          <p className="text-xs text-slate-500">
            Sample jobs shown for demo. Connect your backend to load real-time openings.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {JOBS.map((job) => (
            <article
              key={job.title}
              className="group flex flex-col justify-between rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-lg"
            >
              <div className="space-y-1">
                <h3 className="text-sm font-extrabold text-slate-900">{job.title}</h3>
                <p className="text-xs font-semibold text-slate-700">{job.company}</p>
                <p className="text-xs text-slate-500">{job.location}</p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
                  {job.stipend}
                </span>
                <button
                  type="button"
                  className="inline-flex h-9 items-center justify-center rounded-full bg-blue-600 px-4 text-xs font-extrabold text-white shadow-sm transition group-hover:bg-blue-700"
                >
                  Apply
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default FeaturedJobs

