const STEPS = [
  {
    title: 'Create Profile',
    description: 'Students add skills, education, and preferences. Recruiters set up company hiring profiles.',
    icon: '🧑‍💻',
  },
  {
    title: 'Explore Opportunities',
    description: 'Discover curated internships and fresher roles aligned with your interests.',
    icon: '🔍',
  },
  {
    title: 'Apply for Jobs',
    description: 'One-click applications with your resume and smart application tracking.',
    icon: '📤',
  },
  {
    title: 'Start Your Career',
    description: 'Interview, get selected, and step into your first corporate role.',
    icon: '🚀',
  },
]

function HowItWorks() {
  return (
    <section id="about" className="bg-white py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">How It Works</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">From campus profiles to offer letters</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {STEPS.map((step, index) => (
            <article
              key={step.title}
              className="relative flex flex-col gap-3 rounded-2xl border border-slate-200 bg-slate-50/60 p-4 text-center shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:bg-white hover:shadow-md"
            >
              <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-50 text-lg">
                <span aria-hidden="true">{step.icon}</span>
              </div>
              <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
                Step {index + 1}
              </p>
              <h3 className="text-sm font-extrabold text-slate-900">{step.title}</h3>
              <p className="text-xs text-slate-600">{step.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default HowItWorks

