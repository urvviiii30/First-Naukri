import { useMemo, useState } from 'react'
import { applyToJob } from '../api/client'

function getStudentIdentity() {
  const studentId = localStorage.getItem('fn_studentId') || 'student-1'
  const studentName = localStorage.getItem('fn_studentName') || 'Student'
  const studentEmail = localStorage.getItem('fn_studentEmail') || 'student@mail.com'
  return { studentId, studentName, studentEmail }
}

function ApplyJobModal({ open, job, onClose, onApplied }) {
  const { studentId, studentName, studentEmail } = useMemo(() => getStudentIdentity(), [])
  const [resumeFile, setResumeFile] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  if (!open || !job) return null

  async function submit() {
    setError('')
    setSuccess('')
    if (!resumeFile) {
      setError('Please upload your resume (PDF).')
      return
    }
    setLoading(true)
    try {
      const fd = new FormData()
      fd.append('jobId', job._id)
      fd.append('studentId', studentId)
      fd.append('studentName', studentName)
      fd.append('studentEmail', studentEmail)
      fd.append('resume', resumeFile)

      const created = await applyToJob(fd)
      setSuccess('Applied successfully.')
      onApplied?.(created)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} aria-hidden="true" />
      <div className="relative w-[min(560px,calc(100vw-24px))] rounded-2xl bg-white shadow-xl border border-slate-200 p-5">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold text-slate-900">Apply to {job.title}</h3>
            <p className="text-sm text-slate-600">{job.company} · {job.location}</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="h-9 w-9 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 font-black"
            aria-label="Close"
          >
            ×
          </button>
        </div>

        <div className="mt-4 grid gap-3">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
            <label className="block text-sm font-bold text-slate-800">Upload Resume (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              className="mt-2 block w-full text-sm"
              onChange={(e) => setResumeFile(e.target.files?.[0] || null)}
            />
            <p className="mt-2 text-xs text-slate-500">Max size 5MB. Only PDF.</p>
          </div>

          {error && <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700 font-semibold">{error}</div>}
          {success && <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700 font-semibold">{success}</div>}

          <div className="flex items-center justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={submit}
              className="h-10 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm disabled:opacity-60"
              disabled={loading}
            >
              {loading ? 'Applying…' : 'Submit Application'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ApplyJobModal

