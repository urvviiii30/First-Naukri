import { useState } from 'react'
import { getApiBase, updateUserProfile } from '../api/client'

const BASE_SKILLS = [
  'React',
  'JavaScript',
  'Node.js',
  'MongoDB',
  'Python',
  'SQL',
  'HTML',
  'CSS',
  'Git',
  'REST APIs',
  'Express',
  'Next.js',
]

function SkillPill({ label, type }) {
  const isDetected = type === 'detected'
  const color =
    type === 'detected'
      ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
      : 'bg-rose-50 text-rose-700 border-rose-100'

  const icon = isDetected ? '✓' : '✕'

  return (
    <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-xs font-semibold ${color}`}>
      <span className="text-[10px]">{icon}</span>
      <span>{label}</span>
    </span>
  )
}

function ScoreRing({ score }) {
  const clamped = Math.max(0, Math.min(100, Number.isFinite(score) ? score : 0))
  const radius = 40
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (clamped / 100) * circumference

  const color =
    clamped >= 75 ? '#16a34a'
      : clamped >= 50 ? '#ca8a04'
        : '#dc2626'

  return (
    <div className="relative flex h-28 w-28 items-center justify-center">
      <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100" aria-hidden="true">
        <circle
          className="text-slate-200"
          stroke="currentColor"
          strokeWidth="8"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
        />
        <circle
          stroke={color}
          strokeWidth="8"
          strokeLinecap="round"
          fill="transparent"
          r={radius}
          cx="50"
          cy="50"
          style={{
            strokeDasharray: `${circumference} ${circumference}`,
            strokeDashoffset: offset,
            transition: 'stroke-dashoffset 0.5s ease',
          }}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-xs font-semibold text-slate-500">ATS Score</span>
        <span className="text-xl font-extrabold text-slate-900">{clamped}%</span>
      </div>
    </div>
  )
}

function ResumeAnalyzer({ onAnalysisComplete }) {
  const [file, setFile] = useState(null)
  const [analyzing, setAnalyzing] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)

  const hasResult = !!result

  function handleFileChange(e) {
    setError('')
    const next = e.target.files?.[0]
    if (!next) {
      setFile(null)
      return
    }
    if (next.type !== 'application/pdf' && !next.name.toLowerCase().endsWith('.pdf')) {
      setError('Please upload a PDF resume.')
      setFile(null)
      return
    }
    setFile(next)
  }

  async function handleAnalyze() {
    if (!file) {
      setError('Please choose a PDF resume first.')
      return
    }
    setError('')
    setAnalyzing(true)

    try {
      const formData = new FormData()
      formData.append('resume', file)

      const res = await fetch(`${getApiBase()}/api/resume/analyze`, {
        method: 'POST',
        body: formData,
      })

      const data = await res.json()
      if (!res.ok) {
        throw new Error(data?.message || 'Failed to analyze resume')
      }

      const normalized = {
        ...data,
        score: data.score ?? 0,
        detectedSkills: data.detectedSkills || [],
        missingSkills: data.missingSkills || [],
        suggestions: data.suggestions || [],
      }

      setResult(normalized)
      try {
        window.localStorage.setItem('lastResumeAnalysis', JSON.stringify(normalized))
        
        // Auto-save skills to user profile
        const updateForm = new FormData()
        if (normalized.detectedSkills?.length > 0) {
          updateForm.append('skills', JSON.stringify(normalized.detectedSkills))
        }
        if (normalized.resumePath) {
          updateForm.append('resumePath', normalized.resumePath)
        }
        await updateUserProfile(updateForm)
      } catch (err) {
        console.warn('Failed to auto-save or persist skills:', err)
      }
      
      if (onAnalysisComplete) {
        onAnalysisComplete(normalized)
      }
    } catch (e) {
      setError(e.message || 'Failed to analyze resume')
    } finally {
      setAnalyzing(false)
    }
  }

  const detected = result?.detectedSkills || []
  const missing = result?.missingSkills || BASE_SKILLS.filter(
    (s) => !detected.some((d) => d.toLowerCase() === s.toLowerCase()),
  )

  return (
    <section className="sd-card sd-resume-analyzer">
      <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
        <div>
          <h2 className="sd-card-title">Resume Analyzer</h2>
          <p className="mt-1 text-sm text-slate-600 max-w-md">
            Upload your resume to check ATS compatibility and see how well it aligns with common job requirements.
          </p>
        </div>
        <div className="flex flex-col items-end gap-2">
          <label className="inline-flex cursor-pointer items-center justify-center rounded-xl border border-dashed border-slate-300 bg-slate-50 px-4 py-2 text-xs font-semibold text-slate-700 hover:border-blue-300 hover:bg-blue-50">
            <input
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handleFileChange}
            />
            <span>Choose PDF Resume</span>
          </label>
          {file && (
            <p className="max-w-[220px] truncate text-[11px] font-medium text-slate-500">
              Selected: {file.name}
            </p>
          )}
          <button
            type="button"
            onClick={handleAnalyze}
            disabled={analyzing}
            className="inline-flex h-9 items-center gap-2 rounded-xl bg-blue-600 px-4 text-xs font-bold text-white shadow-sm hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300"
          >
            {analyzing && (
              <span className="inline-block h-3 w-3 animate-spin rounded-full border-2 border-white border-t-transparent" />
            )}
            <span>{analyzing ? 'Analyzing…' : 'Analyze Resume'}</span>
          </button>
          {error && (
            <p className="mt-1 max-w-xs text-right text-[11px] font-semibold text-red-600">
              {error}
            </p>
          )}
        </div>
      </div>

      {hasResult && (
        <div className="mt-5 grid gap-5 md:grid-cols-[auto,1fr]">
          <div className="flex flex-col items-center gap-3">
            <ScoreRing score={result.score} />
            <p className="text-xs text-slate-500 text-center px-2">
              Higher scores indicate stronger alignment with common ATS keyword checks.
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Detected Skills
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {detected.length === 0 && (
                  <p className="text-xs text-slate-500">
                    No skills detected yet. Try adding a dedicated skills section to your resume.
                  </p>
                )}
                {detected.map((skill) => (
                  <SkillPill key={skill} label={skill} type="detected" />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Missing Skills
              </h3>
              <div className="mt-2 flex flex-wrap gap-1.5">
                {missing.length === 0 && (
                  <p className="text-xs text-slate-500">
                    Great job — we didn&apos;t find obvious gaps in the core skills list.
                  </p>
                )}
                {missing.map((skill) => (
                  <SkillPill key={skill} label={skill} type="missing" />
                ))}
              </div>
            </div>

            <div>
              <h3 className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                Suggestions
              </h3>
              <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                {result.suggestions.map((s, idx) => (
                  <li key={idx} className="flex gap-2">
                    <span className="mt-0.5 text-slate-400">•</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </section>
  )
}

export default ResumeAnalyzer

