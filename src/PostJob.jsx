import { useMemo, useState } from 'react'
import { postJob } from './api/client'
import BackButton from './components/BackButton'

function getRecruiterId() {
  return localStorage.getItem('fn_recruiterId') || 'recruiter-1'
}

function parseSkills(value) {
  return String(value || '')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
}

function PostJob() {
  const recruiterId = useMemo(() => getRecruiterId(), [])
  const [form, setForm] = useState({
    title: '',
    company: '',
    location: '',
    salary: '',
    jobType: 'Full-time',
    skills: '',
    description: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  function update(key, value) {
    setForm((p) => ({ ...p, [key]: value }))
  }

  async function submit(e) {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const payload = {
        ...form,
        skills: parseSkills(form.skills),
        postedBy: recruiterId,
      }
      await postJob(payload)
      setSuccess('Job posted successfully.')
      setForm({
        title: '',
        company: '',
        location: '',
        salary: '',
        jobType: 'Full-time',
        skills: '',
        description: '',
      })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full min-h-full bg-slate-50">
      <div className="max-w-3xl mx-auto px-4 pt-8 pb-10">
        <div className="mb-4"><BackButton /></div>
        <div className="rounded-3xl border border-slate-200 bg-white shadow-sm p-6">
          <div className="flex items-start justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-2xl font-extrabold text-slate-900">Post a Job</h1>
              <p className="text-sm text-slate-600 mt-1">Recruiter ID: <span className="font-bold">{recruiterId}</span></p>
            </div>
            <a
              href="/recruiter-dashboard"
              className="h-10 inline-flex items-center px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm"
            >
              Back to Dashboard
            </a>
          </div>

          <form onSubmit={submit} className="mt-6 grid gap-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Job Title">
                <input value={form.title} onChange={(e) => update('title', e.target.value)} className="input" placeholder="Frontend Developer" required />
              </Field>
              <Field label="Company Name">
                <input value={form.company} onChange={(e) => update('company', e.target.value)} className="input" placeholder="TechCorp India" required />
              </Field>
              <Field label="Location">
                <input value={form.location} onChange={(e) => update('location', e.target.value)} className="input" placeholder="Bangalore · Hybrid" required />
              </Field>
              <Field label="Salary">
                <input value={form.salary} onChange={(e) => update('salary', e.target.value)} className="input" placeholder="₹4-6 LPA" required />
              </Field>
              <Field label="Job Type">
                <select value={form.jobType} onChange={(e) => update('jobType', e.target.value)} className="input" required>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Internship</option>
                  <option>Contract</option>
                </select>
              </Field>
              <Field label="Required Skills (comma-separated)">
                <input value={form.skills} onChange={(e) => update('skills', e.target.value)} className="input" placeholder="React, JavaScript, Tailwind" />
              </Field>
            </div>

            <Field label="Job Description">
              <textarea value={form.description} onChange={(e) => update('description', e.target.value)} className="input min-h-[130px]" placeholder="Describe responsibilities, requirements, and process…" required />
            </Field>

            {error && <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-semibold">{error}</div>}
            {success && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 font-semibold">{success}</div>}

            <div className="flex items-center justify-end gap-2">
              <button
                type="submit"
                disabled={loading}
                className="h-11 px-5 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm disabled:opacity-60"
              >
                {loading ? 'Posting…' : 'Post Job'}
              </button>
            </div>
          </form>
        </div>
      </div>

      <style>{`
        .input{
          width:100%;
          height:44px;
          border-radius:16px;
          border:1px solid rgba(15,23,42,.12);
          background:white;
          padding:0 14px;
          font-size:14px;
          outline:none;
        }
        textarea.input{ padding:12px 14px; height:auto; }
        .input:focus{
          border-color:rgba(37,99,235,.45);
          box-shadow:0 0 0 4px rgba(37,99,235,.12);
        }
      `}</style>
    </div>
  )
}

function Field({ label, children }) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-bold text-slate-800">{label}</span>
      {children}
    </label>
  )
}

export default PostJob

