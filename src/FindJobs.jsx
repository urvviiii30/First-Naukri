import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { getJobs } from './api/client'
import JobCard from './components/JobCard'
import ApplyJobModal from './components/ApplyJobModal'
import BackButton from './components/BackButton'

function FindJobs() {
  const [searchParams] = useSearchParams()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [savedIds, setSavedIds] = useState(() => new Set())
  const [applyOpen, setApplyOpen] = useState(false)
  const [selectedJob, setSelectedJob] = useState(null)
  const [searchRole, setSearchRole] = useState(() => searchParams.get('role') || '')
  const [searchLocation, setSearchLocation] = useState(() => searchParams.get('location') || '')
  const [searchType, setSearchType] = useState('')
  const [resumeSkills, setResumeSkills] = useState(() => {
    try {
      const raw = window.localStorage.getItem('lastResumeAnalysis')
      if (!raw) return []
      const parsed = JSON.parse(raw)
      return parsed.detectedSkills || []
    } catch {
      return []
    }
  })

  useEffect(() => {
    let alive = true
    getJobs()
      .then((data) => {
        if (!alive) return
        setJobs(data)
      })
      .catch((e) => {
        if (!alive) return
        setError(e.message)
      })
      .finally(() => {
        if (!alive) return
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [])

  const filtered = useMemo(() => {
    let result = jobs
    if (searchRole) {
      const q = searchRole.toLowerCase()
      result = result.filter((j) => (j.title || '').toLowerCase().includes(q) || (j.skills || []).join(' ').toLowerCase().includes(q))
    }
    if (searchLocation) {
      const q = searchLocation.toLowerCase()
      result = result.filter((j) => (j.location || '').toLowerCase().includes(q))
    }
    if (searchType) {
      const q = searchType.toLowerCase()
      result = result.filter((j) => (j.jobType || '').toLowerCase() === q || q === 'all')
    }
    return result
  }, [jobs, searchRole, searchLocation, searchType])

  function onApply(job) {
    setSelectedJob(job)
    setApplyOpen(true)
  }

  function onSave(job) {
    setSavedIds((prev) => {
      const next = new Set(prev)
      if (next.has(job._id)) next.delete(job._id)
      else next.add(job._id)
      return next
    })
  }

  return (
    <div className="w-full min-h-full bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-10">
        <div className="mb-4"><BackButton /></div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Find Jobs</h1>
            <p className="text-sm text-slate-600 mt-1">Browse recruiter-posted roles and apply with your resume.</p>
          </div>
          <div className="flex flex-col sm:flex-row w-full sm:w-auto gap-2">
            <input
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              placeholder="Role or Skills"
              className="flex-1 min-w-[200px] h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
            />
            <input
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              placeholder="Location"
              className="w-full sm:w-[150px] h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
            />
            <select
              value={searchType}
              onChange={(e) => setSearchType(e.target.value)}
              className="w-full sm:w-[150px] h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
            >
              <option value="">Any Type</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        <div className="mt-5">
          {loading && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
              Loading jobs…
            </div>
          )}
          {error && (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-700 font-semibold">
              {error}
            </div>
          )}
          {!loading && !error && filtered.length === 0 && (
            <div className="rounded-2xl border border-slate-200 bg-white p-5 text-sm text-slate-700">
              No jobs found yet. Ask a recruiter to post one.
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filtered.map((job) => (
              <JobCard
                key={job._id}
                job={job}
                onApply={onApply}
                onSave={onSave}
                saved={savedIds.has(job._id)}
                resumeSkills={resumeSkills}
              />
            ))}
          </div>
        </div>
      </div>

      <ApplyJobModal
        open={applyOpen}
        job={selectedJob}
        onClose={() => setApplyOpen(false)}
        onApplied={() => {
          setApplyOpen(false)
        }}
      />
    </div>
  )
}

export default FindJobs

