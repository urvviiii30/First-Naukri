import { useEffect, useState } from 'react'
import { getApiBase } from '../api/client'

function RecommendedJobs({ resumeSkills }) {
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!resumeSkills || resumeSkills.length === 0) {
      setJobs([])
      return
    }

    let cancelled = false
    async function load() {
      setLoading(true)
      setError('')
      try {
        const params = new URLSearchParams()
        params.set('skills', resumeSkills.join(','))

        const res = await fetch(`${getApiBase()}/api/resume/recommend-jobs?${params.toString()}`)
        const data = await res.json()
        if (!res.ok) {
          throw new Error(data?.message || 'Failed to load recommendations')
        }
        if (!cancelled) {
          setJobs(Array.isArray(data) ? data.slice(0, 5) : [])
        }
      } catch (e) {
        if (!cancelled) setError(e.message || 'Failed to load recommendations')
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    load()
    return () => {
      cancelled = true
    }
  }, [resumeSkills])

  if (!resumeSkills || resumeSkills.length === 0) {
    return null
  }

  return (
    <section className="sd-card sd-recommended-jobs">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="sd-card-title">Recommended Jobs For You</h2>
          <p className="mt-1 text-xs text-slate-600">
            Based on the skills detected in your resume.
          </p>
        </div>
      </div>

      {loading && (
        <p className="mt-3 text-xs text-slate-600">
          Loading job recommendations…
        </p>
      )}

      {error && (
        <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}

      {!loading && !error && jobs.length === 0 && (
        <p className="mt-3 text-xs text-slate-500">
          No matching jobs yet. Try updating your skills or check back later as recruiters post new roles.
        </p>
      )}

      <div className="mt-4 space-y-3">
        {jobs.map((job) => (
          <article
            key={job.jobId}
            className="flex items-start justify-between gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2.5"
          >
            <div className="min-w-0">
              <p className="text-xs font-extrabold text-slate-900 truncate">
                {job.title}
              </p>
              <p className="text-[11px] font-semibold text-slate-700 truncate">
                {job.company}
              </p>
              <p className="text-[11px] text-slate-500">
                {job.location} · {job.jobType}
              </p>
            </div>
            <div className="flex flex-col items-end gap-1">
              <span className="inline-flex items-baseline rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-semibold text-indigo-700">
                Match Score:&nbsp;
                <span className="font-extrabold">{job.matchScore}%</span>
              </span>
              {job.salary && (
                <span className="text-[10px] font-semibold text-slate-500">
                  {job.salary}
                </span>
              )}
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

export default RecommendedJobs

