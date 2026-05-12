import { useNavigate } from 'react-router-dom'

function BackButton({ className = '' }) {
  const navigate = useNavigate()

  return (
    <button
      onClick={() => navigate(-1)}
      title="Go back"
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 transition-colors shadow-sm font-bold text-sm ${className}`}
    >
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back
    </button>
  )
}

export default BackButton
