import JobMatchAnalyzer from './JobMatchAnalyzer'

function JobCard({ job, onApply, onSave, saved, resumeSkills }) {
  return (
    <article className="rounded-2xl border border-slate-200 bg-white shadow-sm hover:shadow-md transition-shadow p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="text-base font-extrabold text-slate-900 truncate">{job.title}</h3>
          <p className="text-sm font-semibold text-slate-700">{job.company}</p>
          <p className="text-sm text-slate-500">{job.location} · {job.jobType}</p>
        </div>
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-blue-50 text-blue-700 border border-blue-100">
          {job.salary}
        </span>
      </div>

      <div className="flex flex-wrap gap-2">
        {(job.skills || []).slice(0, 8).map((s) => (
          <span key={s} className="px-2.5 py-1 rounded-full text-xs font-semibold bg-slate-100 text-slate-700">
            {s}
          </span>
        ))}
      </div>

      <p className="text-sm text-slate-600 line-clamp-3">
        {job.description}
      </p>

      <div className="flex items-center gap-2 pt-1">
        <button
          type="button"
          onClick={() => onApply(job)}
          className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-sm shadow-sm"
        >
          Apply
        </button>
        <button
          type="button"
          onClick={() => onSave(job)}
          className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm"
        >
          {saved ? 'Saved' : 'Save Job'}
        </button>
        <div className="ml-auto">
          <JobMatchAnalyzer job={job} resumeSkills={resumeSkills} />
        </div>
      </div>
    </article>
  )
}

export default JobCard

