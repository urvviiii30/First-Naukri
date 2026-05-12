import { useEffect, useState } from 'react'

const STATS = [
  { label: 'Students Registered', value: 10000, suffix: '+', icon: '🎓' },
  { label: 'Companies Hiring', value: 500, suffix: '+', icon: '🏢' },
  { label: 'Jobs Posted', value: 2000, suffix: '+', icon: '💼' },
  { label: 'Successful Placements', value: 1200, suffix: '+', icon: '🚀' },
]

function StatsSection() {
  const [counts, setCounts] = useState(STATS.map(() => 0))

  useEffect(() => {
    const duration = 1200
    const fps = 30
    const steps = Math.round((duration / 1000) * fps)

    let frame = 0
    const id = window.setInterval(() => {
      frame += 1
      setCounts(
        STATS.map((stat, i) => {
          const progress = Math.min(1, frame / steps)
          return Math.round(stat.value * progress)
        }),
      )
      if (frame >= steps) window.clearInterval(id)
    }, 1000 / fps)

    return () => window.clearInterval(id)
  }, [])

  return (
    <section className="bg-slate-50 py-12" aria-label="Platform statistics">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-8 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.28em] text-blue-600">Platform Snapshot</p>
          <h2 className="mt-2 text-2xl font-extrabold text-slate-900">Built for India&apos;s next workforce</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {STATS.map((stat, index) => (
            <article
              key={stat.label}
              className="group rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition hover:-translate-y-1 hover:border-blue-200 hover:shadow-md"
            >
              <div className="flex items-center justify-between gap-3">
                <div className="rounded-xl bg-blue-50 p-2 text-lg">
                  <span role="img" aria-hidden="true">
                    {stat.icon}
                  </span>
                </div>
                <span className="rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-semibold uppercase tracking-wide text-emerald-600">
                  Live
                </span>
              </div>
              <p className="mt-4 text-2xl font-black text-slate-900">
                {counts[index].toLocaleString()}
                {stat.suffix}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">{stat.label}</p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}

export default StatsSection

