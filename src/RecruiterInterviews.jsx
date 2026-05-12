import { useEffect, useMemo, useState } from 'react'
import { getInterviews, updateInterview } from './api/client'
import BackButton from './components/BackButton'

function getRecruiterId() {
  return localStorage.getItem('fn_recruiterId') || 'recruiter-1'
}

function RecruiterInterviews() {
  const recruiterId = useMemo(() => getRecruiterId(), [])
  const [interviews, setInterviews] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Edit State
  const [editingId, setEditingId] = useState(null)
  const [editDate, setEditDate] = useState('')
  const [editTime, setEditTime] = useState('')

  useEffect(() => {
    fetchInterviews()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recruiterId])

  function fetchInterviews() {
    setLoading(true)
    setError('')
    getInterviews(recruiterId)
      .then((data) => setInterviews(data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  async function handleStatusChange(id, newStatus) {
    try {
      setError('')
      setInfo('')
      const updated = await updateInterview(id, { status: newStatus })
      setInterviews((prev) => prev.map((i) => (i._id === updated._id ? updated : i)))
      setInfo(`Interview marked as ${newStatus}.`)
    } catch (e) {
      setError(e.message)
    }
  }

  function startReschedule(interview) {
    setEditingId(interview._id)
    setEditDate(interview.date)
    setEditTime(interview.time)
  }

  async function submitReschedule(id) {
    try {
      setError('')
      setInfo('')
      const updated = await updateInterview(id, { date: editDate, time: editTime })
      setInterviews((prev) => prev.map((i) => (i._id === updated._id ? updated : i)))
      setEditingId(null)
      setInfo('Interview rescheduled successfully.')
    } catch (e) {
      setError(e.message)
    }
  }

  const filteredInterviews = interviews.filter((i) => {
    const matchesStatus = statusFilter === 'All' || i.status === statusFilter
    const matchesSearch =
      i.candidateName.toLowerCase().includes(search.toLowerCase()) ||
      i.jobTitle.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  return (
    <div className="w-full min-h-full bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-10">
        <div className="mb-4"><BackButton /></div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Scheduled Interviews</h1>
            <p className="text-sm text-slate-600 mt-1">
              Manage your upcoming candidate interviews.
            </p>
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
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-4">
            <div className="flex-1 w-full relative">
              <input
                type="text"
                placeholder="Search candidate or job..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 pl-10 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
              />
              <svg className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            
            <div className="min-w-[180px] w-full md:w-auto">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full h-11 rounded-2xl border border-slate-200 bg-white px-4 text-sm font-bold text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
              >
                <option value="All">All Statuses</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Completed">Completed</option>
                <option value="Cancelled">Cancelled</option>
              </select>
            </div>

            <button
              type="button"
              onClick={fetchInterviews}
              className="h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm transition-colors"
            >
              Refresh
            </button>
          </div>

          {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-semibold">{error}</div>}
          {info && <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 font-semibold">{info}</div>}

          <div className="overflow-x-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Candidate</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Job Title</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Date & Time</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">Loading interviews...</td>
                  </tr>
                ) : filteredInterviews.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">No interviews found.</td>
                  </tr>
                ) : (
                  filteredInterviews.map((i) => (
                    <tr key={i._id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-bold text-slate-900">{i.candidateName}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{i.mode}</div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="text-sm font-medium text-slate-800">{i.jobTitle}</div>
                      </td>
                      <td className="px-5 py-4">
                        {editingId === i._id ? (
                          <div className="flex flex-col gap-2">
                            <input 
                              type="date" 
                              value={editDate} 
                              onChange={(e) => setEditDate(e.target.value)}
                              className="h-8 px-2 text-xs border border-slate-200 rounded"
                            />
                            <input 
                              type="time" 
                              value={editTime} 
                              onChange={(e) => setEditTime(e.target.value)}
                              className="h-8 px-2 text-xs border border-slate-200 rounded"
                            />
                          </div>
                        ) : (
                          <div className="text-sm text-slate-700">
                            <span className="font-medium whitespace-nowrap">{i.date}</span>
                            <span className="block text-slate-500 text-xs mt-0.5">{i.time}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-5 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold ${
                          i.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' :
                          i.status === 'Cancelled' ? 'bg-red-100 text-red-800' :
                          'bg-blue-100 text-blue-800'
                        }`}>
                          {i.status}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {editingId === i._id ? (
                            <>
                              <button onClick={() => submitReschedule(i._id)} className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save</button>
                              <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
                            </>
                          ) : (
                            <>
                              {i.status === 'Scheduled' && (
                                <>
                                  <button onClick={() => startReschedule(i)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">
                                    Reschedule
                                  </button>
                                  <button onClick={() => handleStatusChange(i._id, 'Completed')} className="px-3 py-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 rounded-lg hover:bg-emerald-200">
                                    Complete
                                  </button>
                                  <button onClick={() => handleStatusChange(i._id, 'Cancelled')} className="px-3 py-1.5 text-xs font-bold text-red-700 bg-red-100 rounded-lg hover:bg-red-200">
                                    Cancel
                                  </button>
                                </>
                              )}
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default RecruiterInterviews
