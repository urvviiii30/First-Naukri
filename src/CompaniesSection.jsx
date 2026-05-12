const COMPANIES = ['Google', 'Infosys', 'TCS', 'Wipro', 'Accenture']

function CompaniesSection() {
  return (
    <section className="bg-white py-10">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-4 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Top Hiring Companies</p>
          <p className="mt-1 text-xs text-slate-500">
            Aspirational logos shown for design. Integrate with your partners list.
          </p>
        </div>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {COMPANIES.map((name) => (
            <div
              key={name}
              className="flex h-16 min-w-[120px] items-center justify-center rounded-2xl border border-slate-200 bg-slate-50 px-4 text-sm font-semibold text-slate-700 shadow-sm"
            >
              {name}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}

export default CompaniesSection

