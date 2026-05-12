import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import './StudentDashboard.css'
import RecommendedJobs from './components/RecommendedJobs'
import { 
  getUserProfile, 
  getProfileCompletion, 
  getStudentApplications, 
  getSavedJobs, 
  getStudentInterviews,
  getNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  getMessages,
  markMessageRead,
  markAllMessagesRead
} from './api/client'

const TRENDING_INTERNSHIPS = [
  { id: 1, title: 'Product Design Intern', company: 'DesignStudio', location: 'Remote' },
  { id: 2, title: 'Marketing Intern', company: 'GrowthLabs', location: 'Delhi NCR' },
  { id: 3, title: 'DevOps Intern', company: 'ScaleUp', location: 'Bangalore' },
]

function StudentDashboard() {
  const navigate = useNavigate()
  
  // API State
  const [user, setUser] = useState(null)
  const [resumeSkills, setResumeSkills] = useState([])
  const [profileComp, setProfileComp] = useState({ percentage: 0, checks: {}, suggestions: [] })
  const [appsCount, setAppsCount] = useState(0)
  const [savedCount, setSavedCount] = useState(0)
  
  // Interviews
  const [interviews, setInterviews] = useState([])
  
  // Notifications
  const [notifications, setNotifications] = useState([])
  const [showNotif, setShowNotif] = useState(false)
  
  // Messages
  const [messages, setMessages] = useState([])
  const [showMessages, setShowMessages] = useState(false)
  
  // Search
  const [searchRole, setSearchRole] = useState('')
  const [searchLocation, setSearchLocation] = useState('')
  
  const [sidebarOpen, setSidebarOpen] = useState(false)
  
  // Refs for click-outside
  const notifRef = useRef(null)
  const msgRef = useRef(null)

  useEffect(() => {
    let alive = true
    
    async function loadData() {
      try {
        const u = await getUserProfile()
        if (!alive) return
        setUser(u)
        setResumeSkills(u.skills || [])
        
        const [comp, apps, saved, ints, notifs, msgs] = await Promise.all([
          getProfileCompletion(),
          getStudentApplications(u._id),
          getSavedJobs(),
          getStudentInterviews(u._id),
          getNotifications(),
          getMessages()
        ])
        
        if (!alive) return
        setProfileComp(comp)
        setAppsCount(apps.length)
        setSavedCount(saved.length)
        setInterviews(ints)
        setNotifications(notifs)
        setMessages(msgs)
      } catch (e) {
        console.error('Failed to load dashboard data', e)
      }
    }
    
    loadData()
    return () => { alive = false }
  }, [])

  // Click outside to close dropdowns
  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (msgRef.current && !msgRef.current.contains(e.target)) setShowMessages(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function handleLogout() {
    try {
      window.localStorage.clear()
    } catch {
      // ignore
    }
    navigate('/', { replace: true })
  }
  
  function handleSearch() {
    const params = new URLSearchParams()
    if (searchRole.trim()) params.set('role', searchRole.trim())
    if (searchLocation.trim()) params.set('location', searchLocation.trim())
    navigate(`/find-jobs?${params.toString()}`)
  }
  
  function handleSearchKeyDown(e) {
    if (e.key === 'Enter') handleSearch()
  }
  
  async function handleNotificationClick(notif) {
    if (!notif.read) {
      try {
        await markNotificationRead(notif._id)
        setNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n))
      } catch (e) {
        console.error('Failed marking read', e)
      }
    }
  }
  
  async function handleMarkAllNotifsRead() {
    try {
      await markAllNotificationsRead()
      setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (e) {
      console.error('Failed marking all read', e)
    }
  }
  
  async function handleMessageClick(msg) {
    if (!msg.read) {
      try {
        await markMessageRead(msg._id)
        setMessages(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m))
      } catch (e) {
        console.error('Failed marking message read', e)
      }
    }
  }
  
  async function handleMarkAllMsgsRead() {
    try {
      await markAllMessagesRead()
      setMessages(prev => prev.map(m => ({ ...m, read: true })))
    } catch (e) {
      console.error('Failed marking all messages read', e)
    }
  }

  const stats = [
    { label: 'Applications', value: appsCount, icon: '📤' },
    { label: 'Saved Jobs', value: savedCount, icon: '🔖' },
    { label: 'Interviews', value: interviews.length, icon: '📅' },
    { label: 'Profile Strength', value: `${profileComp.percentage}%`, icon: '💪' },
  ]

  const unreadNotifs = notifications.filter(n => !n.read).length
  const unreadMsgs = messages.filter(m => !m.read).length
  const studentName = user?.name ? user.name.split(' ')[0] : 'Student'

  // Circular progress math
  const radius = 28
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (profileComp.percentage / 100) * circumference

  function formatTimeAgo(dateStr) {
    const diff = Date.now() - new Date(dateStr).getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'Just now'
    if (mins < 60) return `${mins}m ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs}h ago`
    const days = Math.floor(hrs / 24)
    return `${days}d ago`
  }

  return (
    <div className="sd-theme-provider w-full relative bg-[var(--sd-bg)] flex flex-col">
      <div className="sd-main max-w-6xl mx-auto w-full flex-1">
        <header className="sd-header">
          <button
            type="button"
            className="sd-menu-btn"
            onClick={() => setSidebarOpen((o) => !o)}
            aria-label="Toggle menu"
          >
            <svg className="sd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          
          <div className="sd-search-row">
            <input 
              type="search" 
              className="sd-search-input" 
              placeholder="Search jobs…" 
              value={searchRole}
              onChange={(e) => setSearchRole(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <input 
              type="text" 
              className="sd-location-input" 
              placeholder="Location" 
              value={searchLocation}
              onChange={(e) => setSearchLocation(e.target.value)}
              onKeyDown={handleSearchKeyDown}
            />
            <button type="button" className="sd-search-btn" onClick={handleSearch}>Search</button>
          </div>
          
          <div className="sd-header-right relative">
            {/* Notifications */}
            <div ref={notifRef} className="sd-dropdown-wrap">
              <button 
                type="button" 
                className="sd-icon-btn" 
                aria-label="Notifications"
                onClick={() => { setShowNotif(!showNotif); setShowMessages(false) }}
              >
                <svg className="sd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadNotifs > 0 && <span className="sd-badge">{unreadNotifs}</span>}
              </button>
              
              {showNotif && (
                <div className="sd-dropdown-panel">
                  <div className="sd-dropdown-header">
                    <span>Notifications</span>
                    {unreadNotifs > 0 && (
                      <button type="button" className="sd-dropdown-action" onClick={handleMarkAllNotifsRead}>Mark all read</button>
                    )}
                  </div>
                  <div className="sd-dropdown-body">
                    {notifications.length === 0 ? (
                      <div className="sd-dropdown-empty">No notifications yet</div>
                    ) : (
                      notifications.map(n => (
                        <div 
                          key={n._id} 
                          onClick={() => handleNotificationClick(n)}
                          className={`sd-dropdown-item ${!n.read ? 'sd-dropdown-item--unread' : ''}`}
                        >
                          <div className="sd-dropdown-item-icon">
                            {n.type === 'application' ? '📋' : n.type === 'interview' ? '📅' : '🔔'}
                          </div>
                          <div className="sd-dropdown-item-content">
                            <p className="sd-dropdown-item-title">{n.title}</p>
                            <p className="sd-dropdown-item-text">{n.message}</p>
                            <p className="sd-dropdown-item-time">{formatTimeAgo(n.createdAt)}</p>
                          </div>
                          {!n.read && <div className="sd-dropdown-dot" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            {/* Messages */}
            <div ref={msgRef} className="sd-dropdown-wrap">
              <button 
                type="button" 
                className="sd-icon-btn" 
                aria-label="Messages"
                onClick={() => { setShowMessages(!showMessages); setShowNotif(false) }}
              >
                <svg className="sd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                </svg>
                {unreadMsgs > 0 && <span className="sd-badge">{unreadMsgs}</span>}
              </button>
              
              {showMessages && (
                <div className="sd-dropdown-panel">
                  <div className="sd-dropdown-header">
                    <span>Messages</span>
                    {unreadMsgs > 0 && (
                      <button type="button" className="sd-dropdown-action" onClick={handleMarkAllMsgsRead}>Mark all read</button>
                    )}
                  </div>
                  <div className="sd-dropdown-body">
                    {messages.length === 0 ? (
                      <div className="sd-dropdown-empty">No messages yet</div>
                    ) : (
                      messages.map(m => (
                        <div 
                          key={m._id} 
                          onClick={() => handleMessageClick(m)}
                          className={`sd-dropdown-item ${!m.read ? 'sd-dropdown-item--unread' : ''}`}
                        >
                          <div className="sd-dropdown-item-icon">
                            {m.type === 'application' ? '📤' : m.type === 'interview' ? '🗓️' : '💬'}
                          </div>
                          <div className="sd-dropdown-item-content">
                            <p className="sd-dropdown-item-title">{m.title}</p>
                            <p className="sd-dropdown-item-text">{m.body}</p>
                            <p className="sd-dropdown-item-time">{formatTimeAgo(m.createdAt)}</p>
                          </div>
                          {!m.read && <div className="sd-dropdown-dot" />}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
            
            <button type="button" className="sd-avatar" aria-label="Profile">
              <span>{studentName.charAt(0).toUpperCase()}</span>
            </button>
            <button type="button" className="sd-btn sd-btn--outline" onClick={handleLogout}>Logout</button>
          </div>
        </header>

        <div className="sd-content">
          <section className="sd-welcome">
            <div className="sd-welcome-text">
              <h1 className="sd-welcome-title">Welcome back, {studentName} 👋</h1>
              <p className="sd-welcome-sub">Complete your profile to get better job matches.</p>
            </div>
            <div className="sd-welcome-right">
              <div className="relative flex h-20 w-20 items-center justify-center bg-white rounded-full p-2 shadow-sm">
                <svg className="h-full w-full -rotate-90" viewBox="0 0 80 80">
                  <circle className="text-slate-100" stroke="currentColor" strokeWidth="6" fill="transparent" r={radius} cx="40" cy="40" />
                  <circle
                    className={profileComp.percentage === 100 ? 'text-emerald-500' : 'text-blue-600'}
                    stroke="currentColor" strokeWidth="6" strokeLinecap="round" fill="transparent"
                    r={radius} cx="40" cy="40"
                    style={{ strokeDasharray: circumference, strokeDashoffset }}
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <span className="text-sm font-extrabold text-slate-800">{profileComp.percentage}%</span>
                </div>
              </div>
              <Link to="/settings" className="sd-btn sd-btn--primary">Complete Profile</Link>
            </div>
          </section>

          <section className="sd-stats">
            {stats.map((card) => (
              <div key={card.label} className="sd-stat-card">
                <span className="sd-stat-icon" aria-hidden="true">{card.icon}</span>
                <span className="sd-stat-value">{card.value}</span>
                <span className="sd-stat-label">{card.label}</span>
              </div>
            ))}
          </section>

          <div className="sd-grid-2">
            <section className="sd-card sd-activity">
              <h2 className="sd-card-title flex justify-between items-center">
                <span>Profile Checklist</span>
                {profileComp.percentage === 100 && <span className="text-xs bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded-full font-bold">100% Complete</span>}
              </h2>
              <div className="mt-4 space-y-3">
                {profileComp.suggestions?.length === 0 ? (
                  <div className="p-4 bg-emerald-50 border border-emerald-100 text-emerald-800 rounded-xl text-sm font-bold flex gap-2 items-center">
                    <span>🎉</span> Amazing! Your profile is fully complete.
                  </div>
                ) : (
                  profileComp.suggestions?.map((sugg, i) => (
                    <div key={i} className="flex gap-3 p-3 bg-red-50 text-red-700 rounded-xl text-sm items-start border border-red-100 font-semibold shadow-sm">
                      <span className="mt-0.5" aria-hidden>❌</span>
                      <span>{sugg}</span>
                    </div>
                  ))
                )}
              </div>
            </section>

            <section className="sd-card sd-quick-actions flex flex-col justify-between">
              <div>
                <h2 className="sd-card-title w-full flex justify-between items-center">
                  <span>Upcoming Interviews</span>
                  {interviews.length > 0 && <span className="text-[10px] bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full">{interviews.length}</span>}
                </h2>
                <div className="mt-4 space-y-3">
                  {interviews.slice(0,3).map(int => (
                    <div key={int._id} className="flex justify-between items-center p-3 rounded-lg border border-slate-100 bg-slate-50">
                      <div>
                        <div className="font-bold text-slate-800 text-sm">{int.jobTitle}</div>
                        <div className="text-xs text-slate-500">{new Date(int.date).toLocaleDateString()} at {int.time} ({int.mode})</div>
                      </div>
                      <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded">Scheduled</span>
                    </div>
                  ))}
                  {interviews.length === 0 && (
                    <div className="text-sm text-slate-500 p-4 text-center">No upcoming interviews. Keep applying!</div>
                  )}
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-slate-100 flex gap-2">
                <Link to="/applications" className="sd-btn sd-btn--outline flex-1 text-center py-2 text-xs">View Applications</Link>
                <Link to="/saved-jobs" className="sd-btn sd-btn--outline flex-1 text-center py-2 text-xs">Saved Jobs</Link>
              </div>
            </section>
          </div>

          <RecommendedJobs resumeSkills={resumeSkills} />

          <section className="sd-card sd-internships mt-6">
            <h2 className="sd-card-title">Trending Internships</h2>
            <div className="sd-intern-grid">
              {TRENDING_INTERNSHIPS.map((intern) => (
                <article key={intern.id} className="sd-intern-card">
                  <h3 className="sd-intern-title">{intern.title}</h3>
                  <p className="sd-intern-company">{intern.company}</p>
                  <p className="sd-intern-location">{intern.location}</p>
                  <button type="button" className="sd-btn sd-btn--sm sd-btn--outline">Apply</button>
                </article>
              ))}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}

export default StudentDashboard
