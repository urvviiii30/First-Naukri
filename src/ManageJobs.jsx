import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { getRecruiterJobs, updateJob, updateJobStatus, deleteJob } from './api/client'
import BackButton from './components/BackButton'

function getRecruiterId() {
  return localStorage.getItem('fn_recruiterId') || 'recruiter-1'
}

function ManageJobs() {
  const recruiterId = useMemo(() => getRecruiterId(), [])
  const navigate = useNavigate()
  
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('All')

  // Inline edit state
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const [editCompany, setEditCompany] = useState('')
  const [editLocation, setEditLocation] = useState('')
  const [editSalary, setEditSalary] = useState('')

  useEffect(() => {
    fetchJobs()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recruiterId])

  function fetchJobs() {
    setLoading(true)
    setError('')
    getRecruiterJobs(recruiterId)
      .then((data) => setJobs(data || []))
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  async function handleToggleStatus(job) {
    try {
      setError('')
      setInfo('')
      const newStatus = job.status === 'Active' ? 'Closed' : 'Active'
      const updated = await updateJobStatus(job._id, newStatus, recruiterId)
      setJobs((prev) => prev.map((j) => (j._id === updated._id ? updated : j)))
      setInfo(`Job marked as ${newStatus}.`)
    } catch (e) {
      setError(e.message)
    }
  }

  async function handleDelete(id) {
    if (!window.confirm('Are you sure you want to delete this job permanently?')) return
    try {
      setError('')
      setInfo('')
      await deleteJob(id, recruiterId)
      setJobs((prev) => prev.filter((j) => j._id !== id))
      setInfo('Job deleted successfully.')
    } catch (e) {
      setError(e.message)
    }
  }

  function startEdit(job) {
    setEditingId(job._id)
    setEditTitle(job.title)
    setEditCompany(job.company)
    setEditLocation(job.location)
    setEditSalary(job.salary)
  }

  async function submitEdit(id) {
    try {
      setError('')
      setInfo('')
      const updated = await updateJob(id, {
        recruiterId,
        title: editTitle,
        company: editCompany,
        location: editLocation,
        salary: editSalary
      })
      setJobs((prev) => prev.map((j) => (j._id === updated._id ? updated : j)))
      setEditingId(null)
      setInfo('Job updated successfully.')
    } catch (e) {
      setError(e.message)
    }
  }

  function handleViewApplicants(jobId) {
    navigate('/recruiter-applicants')
  }

  const filteredJobs = jobs.filter((j) => {
    const matchesStatus = statusFilter === 'All' || j.status === statusFilter
    const matchesSearch =
      j.title.toLowerCase().includes(search.toLowerCase()) ||
      j.company.toLowerCase().includes(search.toLowerCase()) ||
      j.location.toLowerCase().includes(search.toLowerCase())
    return matchesStatus && matchesSearch
  })

  // Sort by newest first
  filteredJobs.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))

  return (
    <div className="w-full min-h-full bg-slate-50">
      <div className="max-w-7xl mx-auto px-4 pt-8 pb-10">
        <div className="mb-4"><BackButton /></div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Manage Jobs</h1>
            <p className="text-sm text-slate-600 mt-1">Review, edit, and track the status of all your posted jobs.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <a
              href="/post-job"
              className="h-10 inline-flex items-center px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm"
            >
              Post New Job
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
                placeholder="Search jobs by title, company, or location..."
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
                <option value="Active">Active</option>
                <option value="Closed">Closed</option>
              </select>
            </div>

            <button
              type="button"
              onClick={fetchJobs}
              className="h-11 px-4 rounded-2xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 font-bold text-sm transition-colors"
            >
              Refresh
            </button>
          </div>

          {error && <div className="mb-4 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-semibold">{error}</div>}
          {info && <div className="mb-4 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 font-semibold">{info}</div>}

          <div className="overflow-auto rounded-2xl border border-slate-200">
            <table className="w-full text-left border-collapse min-w-[1000px]">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200">
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Job Details</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Salary & Type</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Posted On</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Status</th>
                  <th className="px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">Loading jobs...</td>
                  </tr>
                ) : filteredJobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-slate-500">No jobs found matching your criteria.</td>
                  </tr>
                ) : (
                  filteredJobs.map((j) => {
                    const isActive = j.status === 'Active'
                    return (
                      <tr key={j._id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-5 py-4">
                          {editingId === j._id ? (
                            <div className="flex flex-col gap-2 max-w-[200px]">
                              <input 
                                type="text" value={editTitle} onChange={(e) => setEditTitle(e.target.value)}
                                className="h-8 px-2 text-xs border border-slate-200 rounded font-bold text-slate-900" placeholder="Title"
                              />
                              <input 
                                type="text" value={editCompany} onChange={(e) => setEditCompany(e.target.value)}
                                className="h-8 px-2 text-xs border border-slate-200 rounded text-slate-600" placeholder="Company"
                              />
                              <input 
                                type="text" value={editLocation} onChange={(e) => setEditLocation(e.target.value)}
                                className="h-8 px-2 text-xs border border-slate-200 rounded text-slate-500" placeholder="Location"
                              />
                            </div>
                          ) : (
                            <>
                              <div className="font-bold text-slate-900 text-sm md:text-base">{j.title}</div>
                              <div className="text-sm font-medium text-slate-700 mt-1">{j.company}</div>
                              <div className="text-xs text-slate-500 mt-0.5">{j.location}</div>
                            </>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          {editingId === j._id ? (
                            <input 
                              type="text" value={editSalary} onChange={(e) => setEditSalary(e.target.value)}
                              className="h-8 px-2 text-xs border border-slate-200 rounded text-slate-700" placeholder="Salary"
                            />
                          ) : (
                            <>
                              <div className="text-sm font-medium text-slate-800">{j.salary}</div>
                              <div className="text-xs text-slate-500 mt-1">{j.jobType}</div>
                            </>
                          )}
                        </td>
                        <td className="px-5 py-4">
                          <div className="text-sm text-slate-600 whitespace-nowrap">
                            {new Date(j.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-5 py-4">
                          <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${
                            isActive ? 'bg-emerald-50 text-emerald-700 border-emerald-100' : 'bg-red-50 text-red-700 border-red-100'
                          }`}>
                            {isActive ? 'Active' : 'Closed'}
                          </span>
                        </td>
                        <td className="px-5 py-4 text-right">
                          <div className="flex items-center justify-end gap-2 flex-wrap min-w-[300px]">
                            {editingId === j._id ? (
                              <>
                                <button onClick={() => submitEdit(j._id)} className="px-3 py-1.5 text-xs font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">Save</button>
                                <button onClick={() => setEditingId(null)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200">Cancel</button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => handleViewApplicants(j._id)} className="px-3 py-1.5 text-xs font-bold text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 shadow-sm">
                                  Applicants
                                </button>
                                <button onClick={() => startEdit(j)} className="px-3 py-1.5 text-xs font-bold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50">
                                  Edit
                                </button>
                                <button onClick={() => handleToggleStatus(j)} className={`px-3 py-1.5 text-xs font-bold rounded-lg border shadow-sm transition-colors ${
                                  isActive ? 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100'
                                }`}>
                                  {isActive ? 'Close Job' : 'Open Job'}
                                </button>
                                <button onClick={() => handleDelete(j._id)} className="px-3 py-1.5 text-xs font-bold text-red-700 bg-white border border-red-200 rounded-lg hover:bg-red-50">
                                  Delete
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ManageJobs
