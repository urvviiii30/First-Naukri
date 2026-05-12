const STATUS_STYLES = {
  Applied: 'bg-blue-50 text-blue-700 border-blue-100',
  Shortlisted: 'bg-emerald-50 text-emerald-700 border-emerald-100',
  'Interview Scheduled': 'bg-amber-50 text-amber-800 border-amber-100',
  Rejected: 'bg-red-50 text-red-700 border-red-100',
  Hired: 'bg-violet-50 text-violet-700 border-violet-100',
}

function Badge({ status }) {
  const cls = STATUS_STYLES[status] || 'bg-slate-100 text-slate-700 border-slate-200'
  return <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-extrabold border ${cls}`}>{status}</span>
}

function ApplicantTable({ rows, onViewResume, onSetStatus, onScheduleInterview }) {
  return (
    <div className="overflow-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-[860px] w-full border-collapse">
        <thead className="bg-slate-50">
          <tr className="text-left">
            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">Candidate Name</th>
            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">Applied Job</th>
            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">Resume</th>
            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">Status</th>
            <th className="px-4 py-3 text-xs font-extrabold text-slate-600">Actions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r._id} className="border-t border-slate-100 hover:bg-slate-50/60">
              <td className="px-4 py-3">
                <div className="font-extrabold text-slate-900">{r.studentName || r.studentId}</div>
                <div className="text-xs text-slate-500">{r.studentEmail || '—'}</div>
              </td>
              <td className="px-4 py-3">
                <div className="font-bold text-slate-800">{r.jobId?.title || 'Job'}</div>
                <div className="text-xs text-slate-500">{r.jobId?.company || ''}</div>
              </td>
              <td className="px-4 py-3">
                <button
                  type="button"
                  onClick={() => onViewResume(r)}
                  className="h-9 px-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-extrabold text-xs"
                >
                  View Resume
                </button>
              </td>
              <td className="px-4 py-3">
                <Badge status={r.status} />
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => onSetStatus(r, 'Shortlisted')}
                    className="h-9 px-3 rounded-xl border border-emerald-200 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 font-extrabold text-xs"
                    disabled={r.status === 'Rejected'}
                  >
                    Shortlist
                  </button>
                  <button
                    type="button"
                    onClick={() => onScheduleInterview(r)}
                    className="h-9 px-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs shadow-sm disabled:opacity-60"
                    disabled={r.status === 'Rejected'}
                  >
                    Schedule Interview
                  </button>
                  <button
                    type="button"
                    onClick={() => onSetStatus(r, 'Rejected')}
                    className="h-9 px-3 rounded-xl border border-red-200 bg-red-50 hover:bg-red-100 text-red-800 font-extrabold text-xs"
                    disabled={r.status === 'Rejected'}
                  >
                    Reject
                  </button>
                </div>
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr>
              <td colSpan={5} className="px-4 py-6 text-sm text-slate-600">
                No applicants yet for this job.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

export default ApplicantTable

