import { useState, useEffect } from 'react'
import { Outlet, Navigate, useLocation } from 'react-router-dom'
import GlobalSidebar from './GlobalSidebar'

function getStoredUser() {
  try {
    const raw = window.localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export default function GlobalLayout() {
  const [collapsed, setCollapsed] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  
  const user = getStoredUser()

  // Ensure menu closes on mobile navigation automatically
  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden font-sans">
      
      {/* Universal Sidebar Instance */}
      <GlobalSidebar 
        collapsed={collapsed} 
        setCollapsed={setCollapsed} 
        mobileOpen={mobileOpen} 
        setMobileOpen={setMobileOpen}
        role={user.role} 
      />
      
      {/* Main Execution Flow Canvas */}
      <div className="flex-1 flex flex-col h-screen min-w-0 overflow-hidden relative">
        
        {/* Mobile Global Header */}
        <header className="md:hidden flex items-center justify-between h-16 bg-white border-b border-slate-200 px-4 shrink-0 z-10 shadow-sm sticky top-0">
           <button 
             onClick={() => setMobileOpen(true)}
             className="p-2 -ml-2 text-slate-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-slate-100 rounded-xl active:bg-slate-50 transition-colors"
           >
             <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
             </svg>
           </button>
           
           <div className="font-extrabold text-slate-800 tracking-tight text-lg flex items-center gap-1.5">
             First <span className="text-blue-600">Naukri</span>
           </div>
           
           <div className="w-8 h-8 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-blue-800 font-bold text-xs ring-2 ring-white">
              {user.name.charAt(0).toUpperCase()}
           </div>
        </header>

        {/* Scrollable Wrapper for Nested Page Roots */}
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-slate-50 relative custom-scrollbar">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
