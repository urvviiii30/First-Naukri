import { useEffect, useMemo, useState } from 'react'
import { getApiBase, getApplicantsByJob, getRecruiterJobs, updateApplicationStatus, scheduleInterview } from './api/client'
import ApplicantTable from './components/ApplicantTable'
import BackButton from './components/BackButton'

function getRecruiterId() {
  return localStorage.getItem('fn_recruiterId') || 'recruiter-1'
}

function Applicants() {
  const recruiterId = useMemo(() => getRecruiterId(), [])
  const [jobs, setJobs] = useState([])
  const [selectedJobId, setSelectedJobId] = useState('')
  const [rows, setRows] = useState([])
  const [loadingJobs, setLoadingJobs] = useState(true)
  const [loadingRows, setLoadingRows] = useState(false)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  useEffect(() => {
    let alive = true
    setLoadingJobs(true)
    setError('')
    getRecruiterJobs(recruiterId)
      .then((data) => {
        if (!alive) return
        setJobs(data)
        setSelectedJobId((prev) => prev || data?.[0]?._id || '')
      })
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoadingJobs(false))
    return () => { alive = false }
  }, [recruiterId])

  useEffect(() => {
    if (!selectedJobId) return
    refreshRows()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedJobId])

  function refreshRows() {
    if (!selectedJobId) return
    let alive = true
    setLoadingRows(true)
    setError('')
    getApplicantsByJob(selectedJobId)
      .then((data) => alive && setRows(data))
      .catch((e) => alive && setError(e.message))
      .finally(() => alive && setLoadingRows(false))
    return () => { alive = false }
  }

  async function onSetStatus(app, status) {
    setError('')
    setInfo('')
    try {
      const updated = await updateApplicationStatus(app._id, status)
      setRows((prev) => prev.map((r) => (r._id === updated._id ? updated : r)))
      setInfo(`Status updated to "${status}".`)
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleScheduleInterview(app) {
    const date = window.prompt("Enter Date (YYYY-MM-DD):", new Date().toISOString().split('T')[0])
    if (!date) return
    const time = window.prompt("Enter Time (HH:MM):", "14:00")
    if (!time) return
    const mode = window.prompt("Enter Mode (Video / Phone / On-site):", "Video")
    if (!mode) return

    try {
      setError('')
      setInfo('Scheduling interview...')
      await scheduleInterview({
        recruiterId,
        applicationId: app._id,
        jobId: app.jobId?._id || app.jobId,
        candidateName: app.studentName || app.studentId,
        jobTitle: app.jobId?.title || 'Unknown Job',
        date,
        time,
        mode
      })
      
      setRows((prev) => prev.map((r) => r._id === app._id ? { ...r, status: 'Interview Scheduled' } : r))
      setInfo(`Interview scheduled for ${app.studentName || 'Candidate'}.`)
    } catch (e) {
      setError(e.message)
    }
  }

  function onViewResume(app) {
    const base = getApiBase()
    const url = `${base}${app.resumeUrl}`
    window.open(url, '_blank', 'noopener,noreferrer')
  }

  return (
    <div className="w-full min-h-full bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-10">
        <div className="mb-4"><BackButton /></div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Applicants</h1>
            <p className="text-sm text-slate-600 mt-1">Recruiter ID: <span className="font-bold">{recruiterId}</span></p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/post-job"
              className="h-10 inline-flex items-center px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm"
            >
              Post Job
            </a>
            <a
              href="/recruiter-dashboard"
              className="h-10 inline-flex items-center px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm"
            >
              Dashboard
            </a>
          </div>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm p-5">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div className="grid gap-1">
              <div className="text-sm font-extrabold text-slate-900">Select a job</div>
              <div className="text-xs text-slate-500">View and manage applicants by job role.</div>
            </div>

            <div className="min-w-[260px]">
              <select
                value={selectedJobId}
                onChange={(e) => setSelectedJobId(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
                disabled={loadingJobs}
              >
                {loadingJobs && <option>Loading jobs…</option>}
                {!loadingJobs && jobs.length === 0 && <option value="">No jobs posted</option>}
                {jobs.map((j) => (
                  <option key={j._id} value={j._id}>
                    {j.title} · {j.location}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between gap-3 flex-wrap">
            <div className="text-xs text-slate-500">
              Tip: click refresh after students apply to see new entries.
            </div>
            <button
              type="button"
              onClick={refreshRows}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm"
              disabled={!selectedJobId || loadingRows}
            >
              Refresh
            </button>
          </div>

          {error && <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-semibold">{error}</div>}
          {info && <div className="mt-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 font-semibold">{info}</div>}

          <div className="mt-4">
            {loadingRows ? (
              <div className="rounded-2xl border border-slate-200 bg-slate-50 p-4 text-sm text-slate-700">
                Loading applicants…
              </div>
            ) : (
              <ApplicantTable rows={rows} onViewResume={onViewResume} onSetStatus={onSetStatus} onScheduleInterview={handleScheduleInterview} />
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Applicants

