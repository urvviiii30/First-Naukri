import { Link } from 'react-router-dom'

function CTASection() {
  return (
    <section className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 py-10">
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-4 px-4 text-center text-white">
        <h2 className="text-2xl font-black tracking-tight">
          Ready to launch your career journey?
        </h2>
        <p className="max-w-xl text-sm text-blue-100">
          Join First Naukri today and connect with internships, fresher roles, and recruiters looking for talent like
          you.
        </p>
        <Link
          to="/student-auth"
          className="inline-flex h-11 items-center justify-center rounded-full bg-white px-6 text-sm font-extrabold text-blue-700 shadow-md shadow-blue-950/30 hover:bg-blue-50"
        >
          Sign Up Now
        </Link>
      </div>
    </section>
  )
}

export default CTASection

