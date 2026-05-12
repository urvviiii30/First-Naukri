import { useState } from 'react'
import { getApiBase } from '../api/client'

function JobMatchAnalyzer({ job, resumeSkills }) {
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  async function handleOpen() {
    if (!resumeSkills || resumeSkills.length === 0) {
      setError('Run the Resume Analyzer first so we can use your detected skills.')
      setOpen(true)
      return
    }
    setError('')
    setOpen(true)
    if (result) return

    setLoading(true)
    try {
      const res = await fetch(`${getApiBase()}/api/resume/job-match`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeSkills,
          jobSkills: job.skills || [],
        }),
      })
      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to analyze match')
      }
      setResult({
        score: data.score ?? 0,
        matchedSkills: data.matchedSkills || [],
        missingSkills: data.missingSkills || [],
      })
    } catch (e) {
      setError(e.message || 'Failed to analyze match')
    } finally {
      setLoading(false)
    }
  }

  const score = result?.score ?? 0

  return (
    <>
      <button
        type="button"
        onClick={handleOpen}
        className="h-10 px-4 rounded-xl border border-indigo-200 bg-indigo-50 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
      >
        Analyze Resume for This Job
      </button>

      {open && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-5 shadow-xl">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h2 className="text-sm font-extrabold text-slate-900">
                  Job Match – {job.title}
                </h2>
                <p className="text-xs text-slate-600">
                  Compare your detected resume skills with this job&apos;s requirements.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            {error && (
              <p className="mt-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700">
                {error}
              </p>
            )}

            {loading && (
              <div className="mt-4 flex items-center gap-2 text-xs text-slate-600">
                <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-slate-400 border-t-transparent" />
                <span>Calculating match score…</span>
              </div>
            )}

            {result && !loading && (
              <div className="mt-4 space-y-3">
                <div className="flex items-baseline justify-between">
                  <p className="text-sm font-semibold text-slate-800">
                    Match Score
                  </p>
                  <p className="text-sm font-extrabold text-indigo-700">
                    {score}%
                  </p>
                </div>

                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-emerald-600">
                    Matched Skills
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {result.matchedSkills.length === 0 && (
                      <p className="text-[11px] text-slate-500">
                        No overlapping skills found yet.
                      </p>
                    )}
                    {result.matchedSkills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-700"
                      >
                        ✓ {s}
                      </span>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-[11px] font-semibold uppercase tracking-wide text-rose-600">
                    Missing Skills
                  </h3>
                  <div className="mt-1 flex flex-wrap gap-1.5">
                    {result.missingSkills.length === 0 && (
                      <p className="text-[11px] text-slate-500">
                        You match all listed skills for this role.
                      </p>
                    )}
                    {result.missingSkills.map((s) => (
                      <span
                        key={s}
                        className="inline-flex items-center rounded-full bg-rose-50 px-2.5 py-0.5 text-[11px] font-semibold text-rose-700"
                      >
                        ✕ {s}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default JobMatchAnalyzer

