import { Link, NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-6 px-4 py-3">
        <Link to="/" className="flex items-center gap-2 text-lg font-extrabold tracking-[0.18em] text-slate-900">
          <span className="rounded-md bg-blue-600 px-2 py-1 text-xs font-black text-white">FN</span>
          <span>
            FIRST <span className="text-blue-600">NAUKRI</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
          <NavLink
            to="/"
            className={({ isActive }) =>
              `transition-colors hover:text-blue-600 ${isActive ? 'text-blue-600' : ''}`
            }
          >
            Home
          </NavLink>
          <a href="#jobs" className="transition-colors hover:text-blue-600">
            Jobs
          </a>
          <a href="#about" className="transition-colors hover:text-blue-600">
            About
          </a>
          <a href="#contact" className="transition-colors hover:text-blue-600">
            Contact
          </a>
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/login"
            className="hidden h-9 items-center rounded-full border border-slate-200 bg-white px-4 text-xs font-semibold text-slate-800 shadow-sm hover:bg-slate-50 md:inline-flex"
          >
            Login
          </Link>
          <Link
            to="/login"
            className="inline-flex h-9 items-center rounded-full bg-blue-600 px-4 text-xs font-extrabold text-white shadow-sm hover:bg-blue-700"
          >
            Sign Up
          </Link>
        </div>
      </div>
    </header>
  )
}

export default Navbar

