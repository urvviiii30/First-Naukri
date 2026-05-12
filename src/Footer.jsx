function Footer() {
  return (
    <footer id="contact" className="border-t border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-6 px-4 py-8 text-sm text-slate-500 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-xs font-semibold tracking-[0.28em] text-slate-700">
            FIRST NAUKRI
          </p>
          <p className="mt-1 text-xs text-slate-500">From Campus To Corporate</p>
        </div>
        <nav className="flex flex-wrap items-center gap-4 text-xs">
          <a href="#about" className="hover:text-slate-800">
            About
          </a>
          <a href="#contact" className="hover:text-slate-800">
            Contact
          </a>
          <button type="button" className="cursor-default text-slate-400" aria-label="Privacy Policy">
            Privacy Policy
          </button>
          <button type="button" className="cursor-default text-slate-400" aria-label="Terms of Use">
            Terms
          </button>
        </nav>
      </div>
    </footer>
  )
}

export default Footer

