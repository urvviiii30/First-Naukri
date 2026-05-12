import { Link } from 'react-router-dom'

function Card({ title, points, buttonLabel, to, accentClass }) {
  return (
    <article className="flex flex-1 flex-col justify-between rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-lg font-extrabold text-slate-900">{title}</h3>
        <ul className="mt-3 space-y-1 text-sm text-slate-600">
          {points.map((p) => (
            <li key={p} className="flex items-start gap-2">
              <span className={`mt-1 h-1.5 w-1.5 rounded-full ${accentClass}`} />
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </div>
      <div className="mt-4">
        <Link
          to={to}
          className="inline-flex h-10 items-center justify-center rounded-full bg-blue-600 px-5 text-xs font-extrabold text-white shadow-sm hover:bg-blue-700"
        >
          {buttonLabel}
        </Link>
      </div>
    </article>
  )
}

function StudentRecruiterSection() {
  return (
    <section className="bg-slate-50 py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-6 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">For Everyone</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Designed for students and recruiters</h2>
        </div>

        <div className="flex flex-col gap-4 md:flex-row">
          <Card
            title="For Students"
            points={['Find internships', 'Build your resume', 'Apply to jobs easily']}
            buttonLabel="Start Your Career"
            to="/student-auth"
            accentClass="bg-emerald-400"
          />
          <Card
            title="For Recruiters"
            points={['Post jobs', 'Discover fresh talent', 'Manage applicants']}
            buttonLabel="Hire Talent"
            to="/recruiter-auth"
            accentClass="bg-blue-500"
          />
        </div>
      </div>
    </section>
  )
}

export default StudentRecruiterSection

