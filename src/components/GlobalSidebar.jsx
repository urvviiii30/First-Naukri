import { Link, useLocation } from 'react-router-dom'

const RECRUITER_MENU = [
  { label: 'Dashboard', path: '/recruiter-dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Post Job', path: '/post-job', icon: 'M12 4v16m8-8H4' },
  { label: 'Manage Jobs', path: '/recruiter/manage-jobs', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Applicants', path: '/recruiter-applicants', icon: 'M17 20h5M17 16h5M4 6h16M4 12h16M4 18h8' },
  { label: 'Interviews', path: '/recruiter-interviews', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' },
  { label: 'Company Profile', path: '/recruiter/company-profiles', icon: 'M3 21h18M9 8h6m-6 4h6m-6 4h6M6 21V5a2 2 0 012-2h8a2 2 0 012 2v16' },
  { label: 'Settings', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

const STUDENT_MENU = [
  { label: 'Dashboard', path: '/student-dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { label: 'Find Jobs', path: '/find-jobs', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { label: 'Applications', path: '/applications', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { label: 'Create Resume', path: '/resume-builder', icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z' },
  { label: 'Settings', path: '/settings', icon: 'M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z' },
]

export default function GlobalSidebar({ collapsed, setCollapsed, mobileOpen, setMobileOpen, role }) {
  const location = useLocation()
  const menuList = role === 'recruiter' ? RECRUITER_MENU : STUDENT_MENU
  const homePath = role === 'recruiter' ? '/recruiter-dashboard' : '/student-dashboard'

  // If mobileOpen, force expansion essentially overriding collapsed
  const isExpanded = mobileOpen || !collapsed

  return (
    <>
      {/* Mobile Drawer Overlay */}
      <div 
        className={`fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-40 transition-opacity duration-300 md:hidden ${mobileOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
        onClick={() => setMobileOpen(false)}
      />

      {/* Sidebar Container */}
      <aside 
        className={`fixed md:relative top-0 left-0 h-screen z-50 flex flex-col justify-between transition-all duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)] bg-slate-900 border-r border-slate-800 shadow-2xl md:shadow-none
        ${isExpanded ? 'w-64 translate-x-0' : 'w-20 -translate-x-full md:translate-x-0'}
      `}
      >
        <div className="flex flex-col h-full overflow-y-auto overflow-x-hidden no-scrollbar">
          
          {/* Logo Header */}
          <div className={`flex items-center h-16 shrink-0 mt-4 px-4 ${isExpanded ? 'justify-between' : 'justify-center'}`}>
            <Link to={homePath} onClick={() => setMobileOpen(false)} className={`flex items-center gap-3 decoration-transparent group ${isExpanded ? '' : 'justify-center w-full'}`}>
              <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center shrink-0 shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform duration-300">
                <span className="text-white font-black text-xl">F</span>
              </div>
              <div className={`transition-all duration-300 whitespace-nowrap overflow-hidden flex flex-col ${isExpanded ? 'opacity-100 max-w-[150px]' : 'opacity-0 max-w-0 hidden'}`}>
                <span className="text-white font-extrabold text-lg leading-tight tracking-tight">First Naukri</span>
                <span className="text-blue-400 font-bold text-[10px] uppercase tracking-widest leading-tight">{role}</span>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="flex-1 mt-8 px-3 space-y-1.5 pb-6">
            {menuList.map((item) => {
              const active = location.pathname === item.path || (location.pathname.startsWith(item.path) && item.path !== '/' && item.path !== '/recruiter-dashboard' && item.path !== '/student-dashboard')
              
              return (
                <div key={item.path} className="relative group">
                  <Link
                    to={item.path}
                    onClick={() => setMobileOpen(false)}
                    className={`flex items-center rounded-2xl transition-all duration-200 overflow-hidden relative
                      ${isExpanded ? 'px-4 py-3' : 'justify-center h-12 w-12 mx-auto'}
                      ${active 
                        ? 'bg-blue-600/15 text-blue-500 font-bold shadow-[inset_2px_0_0_0_#3B82F6]' 
                        : 'text-slate-400 font-semibold hover:bg-slate-800/60 hover:text-slate-100'
                      }
                    `}
                  >
                    <svg className={`shrink-0 w-5 h-5 transition-colors duration-200 ${active ? 'text-blue-500' : 'group-hover:text-slate-200'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={active ? 2.5 : 2} d={item.icon} />
                    </svg>
                    <span className={`transition-all duration-300 whitespace-nowrap text-[13px] tracking-wide ml-3.5 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
                      {item.label}
                    </span>
                  </Link>
                  
                  {/* Tooltip for collapsed state */}
                  {!isExpanded && (
                    <div className="absolute left-14 top-1/2 -translate-y-1/2 ml-2 px-3 py-1.5 bg-slate-800 text-slate-100 text-xs font-bold rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 shadow-xl transition-opacity animate-in fade-in zoom-in duration-200 border border-slate-700/50">
                      {item.label}
                    </div>
                  )}
                </div>
              )
            })}
          </nav>
        </div>

        {/* Desktop Toggle Collapse Button */}
        <div className="hidden md:flex p-3 border-t border-slate-800">
          <button 
            onClick={() => setCollapsed(!collapsed)}
            className={`flex items-center bg-slate-800/40 hover:bg-slate-700/60 text-slate-400 hover:text-slate-200 rounded-xl transition-colors duration-200
              ${isExpanded ? 'w-full px-4 py-3 gap-3' : 'justify-center w-full h-12'}
            `}
          >
            <svg className={`w-5 h-5 shrink-0 transition-transform duration-300 ${isExpanded ? '' : 'rotate-180'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
            <span className={`text-[13px] font-bold whitespace-nowrap transition-all duration-300 ${isExpanded ? 'opacity-100 w-auto' : 'opacity-0 w-0 hidden'}`}>
              Collapse
            </span>
          </button>
        </div>
      </aside>
    </>
  )
}
