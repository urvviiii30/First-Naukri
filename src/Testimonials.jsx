const TESTIMONIALS = [
  {
    quote: 'First Naukri helped me get my first internship at a product company within just a few weeks.',
    name: 'Rahul Sharma',
    role: 'B.Tech Student',
  },
  {
    quote: 'The platform made it easy to shortlist student talent from multiple colleges in one place.',
    name: 'Pooja Verma',
    role: 'Campus Recruiter',
  },
  {
    quote: 'Simple interface, relevant roles, and transparent status updates throughout my applications.',
    name: 'Ananya Iyer',
    role: 'MBA Fresher',
  },
]

function Testimonials() {
  return (
    <section className="bg-white py-12">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Testimonials</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Stories from our early users</h2>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <article
              key={t.name}
              className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 bg-slate-50/70 p-4 text-sm shadow-sm"
            >
              <p className="text-slate-700">&ldquo;{t.quote}&rdquo;</p>
              <div className="mt-4">
                <p className="text-sm font-extrabold text-slate-900">{t.name}</p>
                <p className="text-xs text-slate-500">{t.role}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default Testimonials

