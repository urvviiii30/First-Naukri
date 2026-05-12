import { useRef, useEffect, useState } from 'react'

function formatTimeAgo(dateStr) {
  if (!dateStr) return ''
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  if (mins < 1) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  return `${Math.floor(hrs / 24)}d ago`
}

function RecruiterHeader({
  searchValue,
  onSearchChange,
  searchResultCount,
  notifications = [],
  onMarkNotifRead,
  onMarkAllNotifsRead,
  messages = [],
  onMarkMsgRead,
  onMarkAllMsgsRead,
  onLogout,
}) {
  const [showNotif, setShowNotif] = useState(false)
  const [showMessages, setShowMessages] = useState(false)
  const notifRef = useRef(null)
  const msgRef = useRef(null)

  const unreadNotifs = notifications.filter(n => !n.read).length
  const unreadMsgs = messages.filter(m => !m.read).length

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false)
      if (msgRef.current && !msgRef.current.contains(e.target)) setShowMessages(false)
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  return (
    <header className="rd-header" aria-label="Recruiter header">

      <div className="rd-header-search">
        <div className="rd-search-wrap">
          <svg className="rd-search-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="search"
            className="rd-search-input"
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search candidates, jobs, skills..."
            aria-label="Search candidates, jobs, skills"
          />
        </div>
        {searchValue.trim() && (
          <span className="rd-search-count">
            {searchResultCount != null ? `${searchResultCount} result${searchResultCount !== 1 ? 's' : ''}` : 'Filtering…'}
          </span>
        )}
      </div>

      <div className="rd-header-right">
        {/* Notifications */}
        <div ref={notifRef} className="rd-dropdown-wrap">
          <button 
            type="button" 
            className="rd-icon-btn" 
            aria-label="Notifications"
            onClick={() => { setShowNotif(!showNotif); setShowMessages(false) }}
          >
            <svg className="rd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
            {unreadNotifs > 0 && <span className="rd-badge">{Math.min(9, unreadNotifs)}</span>}
          </button>

          {showNotif && (
            <div className="rd-dropdown-panel">
              <div className="rd-dropdown-header">
                <span>Notifications</span>
                {unreadNotifs > 0 && (
                  <button type="button" className="rd-dropdown-action" onClick={onMarkAllNotifsRead}>Mark all read</button>
                )}
              </div>
              <div className="rd-dropdown-body">
                {notifications.length === 0 ? (
                  <div className="rd-dropdown-empty">No notifications</div>
                ) : (
                  notifications.slice(0, 20).map(n => (
                    <div 
                      key={n._id || n.id} 
                      onClick={() => onMarkNotifRead && onMarkNotifRead(n)}
                      className={`rd-dropdown-item ${!n.read ? 'rd-dropdown-item--unread' : ''}`}
                    >
                      <div className="rd-dropdown-item-icon">
                        {n.type === 'application' ? '📋' : n.type === 'interview' ? '📅' : '🔔'}
                      </div>
                      <div className="rd-dropdown-item-content">
                        <p className="rd-dropdown-item-title">{n.title}</p>
                        <p className="rd-dropdown-item-text">{n.message || n.body}</p>
                        <p className="rd-dropdown-item-time">{formatTimeAgo(n.createdAt)}</p>
                      </div>
                      {!n.read && <div className="rd-dropdown-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Messages */}
        <div ref={msgRef} className="rd-dropdown-wrap">
          <button 
            type="button" 
            className="rd-icon-btn" 
            aria-label="Messages"
            onClick={() => { setShowMessages(!showMessages); setShowNotif(false) }}
          >
            <svg className="rd-icon" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M7 8h10M7 12h6m-6 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
              />
            </svg>
            {unreadMsgs > 0 && <span className="rd-badge">{Math.min(9, unreadMsgs)}</span>}
          </button>

          {showMessages && (
            <div className="rd-dropdown-panel">
              <div className="rd-dropdown-header">
                <span>Messages</span>
                {unreadMsgs > 0 && (
                  <button type="button" className="rd-dropdown-action" onClick={onMarkAllMsgsRead}>Mark all read</button>
                )}
              </div>
              <div className="rd-dropdown-body">
                {messages.length === 0 ? (
                  <div className="rd-dropdown-empty">No messages</div>
                ) : (
                  messages.slice(0, 20).map(m => (
                    <div 
                      key={m._id || m.id} 
                      onClick={() => onMarkMsgRead && onMarkMsgRead(m)}
                      className={`rd-dropdown-item ${!m.read ? 'rd-dropdown-item--unread' : ''}`}
                    >
                      <div className="rd-dropdown-item-icon">
                        {m.type === 'application' ? '📤' : m.type === 'interview' ? '🗓️' : '💬'}
                      </div>
                      <div className="rd-dropdown-item-content">
                        <p className="rd-dropdown-item-title">{m.title}</p>
                        <p className="rd-dropdown-item-text">{m.body || m.message}</p>
                        <p className="rd-dropdown-item-time">{formatTimeAgo(m.createdAt)}</p>
                      </div>
                      {!m.read && <div className="rd-dropdown-dot" />}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="rd-avatar" aria-label="Recruiter profile avatar">
          R
        </div>
        <button
          type="button"
          className="rd-icon-btn"
          onClick={onLogout}
        >
          Logout
        </button>
      </div>
    </header>
  )
}

export default RecruiterHeader
