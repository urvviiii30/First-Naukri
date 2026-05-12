import { Link } from 'react-router-dom'

function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-blue-500 to-indigo-700">
      <div className="pointer-events-none absolute inset-0 opacity-40 mix-blend-soft-light">
        <div className="absolute -left-10 top-10 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-72 w-72 rounded-full bg-cyan-400/20 blur-3xl" />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-10 px-4 pb-20 pt-28 md:flex-row md:items-center md:justify-between md:pb-24 md:pt-32">
        <div className="max-w-xl space-y-6 text-center md:text-left">
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-blue-100">
            FIRST NAUKRI
          </p>
          <h1 className="text-balance text-4xl font-black tracking-tight text-white sm:text-5xl lg:text-6xl">
            From <span className="text-blue-100">Campus</span> To{' '}
            <span className="underline decoration-blue-200/70 decoration-4 underline-offset-4">Corporate</span>
          </h1>
          <p className="max-w-md text-sm text-blue-100/90 md:text-base">
            Connecting students with their first career opportunities and helping recruiters discover fresh,
            job-ready talent.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 md:justify-start">
            <Link
              to="/student-auth"
              className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-extrabold text-blue-700 shadow-lg shadow-blue-900/20 transition hover:-translate-y-0.5 hover:bg-blue-50"
            >
              I&apos;m a Student
            </Link>
            <Link
              to="/recruiter-auth"
              className="inline-flex h-11 items-center justify-center rounded-full border border-blue-100/70 bg-blue-600/40 px-6 text-sm font-extrabold text-white shadow-sm shadow-blue-900/30 backdrop-blur transition hover:-translate-y-0.5 hover:bg-blue-600/55"
            >
              I&apos;m a Recruiter
            </Link>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-5 text-xs text-blue-100/90 md:justify-start">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-emerald-400/20 text-emerald-100">
                ✓
              </span>
              Trusted by early-career talent
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-cyan-400/20 text-cyan-100">
                ★
              </span>
              Built for campuses &amp; recruiters
            </div>
          </div>
        </div>

        <div className="relative w-full max-w-md">
          <div className="relative rounded-3xl border border-white/15 bg-white/5 p-4 shadow-xl shadow-blue-900/30 backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-blue-100">Live Snapshot</p>
                <p className="text-sm font-medium text-white/90">First Naukri Platform</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-400/15 px-2 py-1 text-[10px] font-semibold text-emerald-100">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-300" />
                LIVE
              </span>
            </div>
            <div className="grid gap-3 rounded-2xl bg-slate-950/20 p-3 text-xs text-blue-50">
              <div className="flex items-center justify-between rounded-2xl bg-slate-950/30 p-3">
                <div>
                  <p className="text-[11px] font-semibold text-blue-200/90">Students searching right now</p>
                  <p className="text-lg font-black text-white">1,248</p>
                </div>
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-blue-500/40 text-white">
                  🎓
                </span>
              </div>
              <div className="flex items-center justify-between gap-3">
                <div className="flex-1 rounded-2xl bg-slate-950/20 p-3">
                  <p className="text-[11px] font-semibold text-blue-200/90">Companies hiring</p>
                  <p className="text-base font-bold text-white">500+</p>
                </div>
                <div className="flex-1 rounded-2xl bg-slate-950/20 p-3">
                  <p className="text-[11px] font-semibold text-blue-200/90">Fresh openings</p>
                  <p className="text-base font-bold text-white">2,000+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}

export default HeroSection

