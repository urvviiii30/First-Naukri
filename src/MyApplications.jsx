import { useEffect, useMemo, useState } from 'react'
import { getStudentApplications, getUserProfile } from './api/client'
import BackButton from './components/BackButton'

function statusBadge(status) {
  const map = {
    Applied: 'bg-blue-50 text-blue-700 border-blue-100',
    Shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-100',
    'Interview Scheduled': 'bg-amber-50 text-amber-800 border-amber-100',
    Rejected: 'bg-red-50 text-red-700 border-red-100',
    Hired: 'bg-violet-50 text-violet-700 border-violet-100',
  }
  const cls = map[status] || 'bg-slate-100 text-slate-700 border-slate-200'
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${cls}`}>{status}</span>
}

function MyApplications() {
  const [user, setUser] = useState(null)
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    async function init() {
      try {
        const profile = await getUserProfile()
        if (!alive) return
        setUser(profile)
        const apps = await getStudentApplications(profile._id)
        if (!alive) return
        setRows(apps)
      } catch (e) {
        if (!alive) return
        setError(e.message)
      } finally {
        if (alive) setLoading(false)
      }
    }
    init()
    return () => { alive = false }
  }, [])

  function refresh() {
    if (!user) return
    setLoading(true)
    setError('')
    getStudentApplications(user._id)
      .then((data) => setRows(data))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  return (
    <div className="w-full min-h-full bg-slate-50">
      <div className="max-w-5xl mx-auto px-4 pt-8 pb-10">
        <div className="mb-4"><BackButton /></div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">My Applications</h1>
            <p className="text-sm text-slate-600 mt-1">Applicant: <span className="font-bold">{user?.name || '—'}</span></p>
          </div>
          <a
            href="/find-jobs"
            className="h-10 inline-flex items-center px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm"
          >
            Find Jobs
          </a>
        </div>

        <div className="mt-4 flex items-center justify-end">
          <button
            type="button"
            onClick={refresh}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-sm"
            disabled={loading}
          >
            Refresh
          </button>
        </div>

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm">
          {loading && (
            <div className="p-5 text-sm text-slate-700">Loading your applications…</div>
          )}
          {error && (
            <div className="m-5 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-semibold">
              {error}
            </div>
          )}
          {!loading && !error && rows.length === 0 && (
            <div className="p-5 text-sm text-slate-700">No applications yet. Apply to a job to see it here.</div>
          )}

          {!loading && !error && rows.length > 0 && (
            <div className="overflow-auto rounded-3xl">
              <table className="min-w-[760px] w-full border-collapse">
                <thead className="bg-slate-50">
                  <tr className="text-left">
                    <th className="px-4 py-3 text-xs font-extrabold text-slate-600">Job Title</th>
                    <th className="px-4 py-3 text-xs font-extrabold text-slate-600">Company</th>
                    <th className="px-4 py-3 text-xs font-extrabold text-slate-600">Date Applied</th>
                    <th className="px-4 py-3 text-xs font-extrabold text-slate-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => (
                    <tr key={r._id} className="border-t border-slate-100 hover:bg-slate-50/60">
                      <td className="px-4 py-3 font-extrabold text-slate-900">{r.jobId?.title || 'Job'}</td>
                      <td className="px-4 py-3 text-slate-700 font-semibold">{r.jobId?.company || '—'}</td>
                      <td className="px-4 py-3 text-slate-600 text-sm">
                        {r.createdAt ? new Date(r.createdAt).toLocaleString() : '—'}
                      </td>
                      <td className="px-4 py-3">
                        {statusBadge(r.status)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default MyApplications

