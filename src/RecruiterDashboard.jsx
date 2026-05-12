import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import RecruiterHeader from './RecruiterHeader'
import StatsCards from './StatsCards'
import ApplicantsTable from './ApplicantsTable'
import JobCards from './JobCards'
import InterviewSchedule from './InterviewSchedule'
import QuickActions from './QuickActions'
import AnalyticsSection from './AnalyticsSection'
import { 
  getRecruiterJobs, 
  getNotifications, 
  markNotificationRead, 
  markAllNotificationsRead,
  getMessages,
  markMessageRead,
  markAllMessagesRead
} from './api/client'
import './RecruiterDashboard.css'

const INITIAL_JOBS = [
  { id: 'job-1', title: 'Frontend Developer (Fresher)', location: 'Bangalore · Hybrid', applicantsCount: 12, status: 'Open', level: 'Fresher', type: 'Full-time' },
  { id: 'job-2', title: 'UI/UX Designer Intern', location: 'Remote', applicantsCount: 8, status: 'Open', level: 'Intern', type: 'Internship' },
  { id: 'job-3', title: 'Backend Developer (Node.js)', location: 'Pune · On-site', applicantsCount: 6, status: 'Open', level: '0-2 yrs', type: 'Full-time' },
  { id: 'job-4', title: 'Data Analyst (Entry)', location: 'Mumbai · Hybrid', applicantsCount: 9, status: 'Open', level: 'Entry', type: 'Full-time' },
]

const LOCATIONS = ['Bangalore', 'Hyderabad', 'Pune', 'Mumbai', 'Delhi NCR', 'Remote']
const EXPERIENCE = ['Fresher', '0-1 yrs', '1-2 yrs', '2-3 yrs']
const MODES = ['Video', 'Phone', 'On-site']
const SKILL_TAGS = ['React', 'Node.js', 'Figma', 'SQL', 'Java', 'Python', 'TypeScript']

function pick(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function makeId(prefix = 'id') {
  return `${prefix}-${Math.random().toString(16).slice(2)}-${Date.now().toString(16)}`
}

function randomCandidate(jobsList) {
  const first = ['Aarav', 'Ananya', 'Rohan', 'Ishita', 'Vivek', 'Meera', 'Karan', 'Priya', 'Rahul', 'Sanya']
  const last = ['Sharma', 'Verma', 'Gupta', 'Singh', 'Iyer', 'Nair', 'Patel', 'Khan', 'Das', 'Jain']
  const name = `${pick(first)} ${pick(last)}`
  const email = `${name.toLowerCase().replace(/\s+/g, '.')}${Math.floor(Math.random() * 90 + 10)}@mail.com`
  const pool = Array.isArray(jobsList) && jobsList.length > 0 ? jobsList : INITIAL_JOBS
  const chosen = pick(pool)
  const skill = pick(SKILL_TAGS)

  return {
    id: makeId('app'),
    name,
    email,
    jobId: chosen.id,
    jobTitle: chosen.title,
    location: chosen.location || pick(LOCATIONS),
    experience: `${pick(EXPERIENCE)} · ${skill}`,
    appliedAt: Date.now(),
    status: 'New',
  }
}

function scheduleTimeLabel() {
  const minsAhead = [30, 60, 90, 120, 180][Math.floor(Math.random() * 5)]
  const d = new Date(Date.now() + minsAhead * 60000)
  const hh = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  return `Today, ${hh}`
}

function RecruiterDashboard() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchValue, setSearchValue] = useState('')
  const navigate = useNavigate()

  const [jobs, setJobs] = useState(INITIAL_JOBS)
  const jobsRef = useRef(INITIAL_JOBS)
  const [applicants, setApplicants] = useState(() => {
    const seeded = Array.from({ length: 10 }).map(() => randomCandidate(INITIAL_JOBS))
    return seeded.map((a, idx) => ({ ...a, appliedAt: Date.now() - (idx + 1) * 7 * 60000 }))
  })
  const [interviews, setInterviews] = useState(() => [])

  const [hiresCompleted, setHiresCompleted] = useState(2)

  const [notifications, setNotifications] = useState(() => [
    { id: makeId('n'), title: 'Hiring feed is live', body: 'New applicants will appear automatically.', read: true, createdAt: Date.now() - 60000 },
  ])
  // Real notifications and messages from API
  const [apiNotifications, setApiNotifications] = useState([])
  const [apiMessages, setApiMessages] = useState([])

  const toastTimeoutsRef = useRef(new Map())

  const totalApplicants = applicants.length
  const activeJobs = useMemo(() => jobs.filter((j) => j.status === 'Open').length, [jobs])
  const interviewsScheduled = interviews.length

  const analytics = useMemo(() => {
    const appsGoal = 40
    const interviewsGoal = 18
    const appsThisWeek = Math.min(appsGoal, totalApplicants + 6)
    const interviewsThisWeek = Math.min(interviewsGoal, interviewsScheduled + 4)
    const successRate = Math.max(10, Math.min(92, Math.round((hiresCompleted / Math.max(1, interviewsScheduled)) * 100)))
    return { appsGoal, interviewsGoal, appsThisWeek, interviewsThisWeek, successRate }
  }, [totalApplicants, interviewsScheduled, hiresCompleted])

  useEffect(() => {
    jobsRef.current = jobs
  }, [jobs])

  function pushNotification({ title, body }) {
    const n = { id: makeId('n'), title, body, createdAt: Date.now() }
    setNotifications((prev) => [n, ...prev].slice(0, 8))

    const timeoutId = window.setTimeout(() => {
      setNotifications((prev) => prev.filter((x) => x.id !== n.id))
      toastTimeoutsRef.current.delete(n.id)
    }, 6500)
    toastTimeoutsRef.current.set(n.id, timeoutId)
  }

  useEffect(() => {
    const recruiterId = localStorage.getItem('fn_recruiterId') || 'recruiter-1'
    getRecruiterJobs(recruiterId)
      .then((data) => {
        if (!Array.isArray(data) || data.length === 0) return
        const nextJobs = data.map((j) => ({
          id: j._id,
          title: j.title,
          location: `${j.location}`,
          applicantsCount: 0,
          status: 'Open',
          level: (j.skills || []).slice(0, 2).join(', ') || 'New',
          type: j.jobType || 'Role',
        }))
        jobsRef.current = nextJobs
        setJobs(nextJobs)
      })
      .catch(() => {
        // If backend isn't running, keep dashboard simulation data.
      })

    // Fetch real notifications and messages
    getNotifications()
      .then(data => { if (Array.isArray(data)) setApiNotifications(data) })
      .catch(() => {})
    getMessages()
      .then(data => { if (Array.isArray(data)) setApiMessages(data) })
      .catch(() => {})
  }, [])

  useEffect(() => {
    const timeouts = toastTimeoutsRef.current
    const id = window.setInterval(() => {
      const a = randomCandidate(jobsRef.current)
      setApplicants((prev) => [a, ...prev].slice(0, 18))
      setJobs((prev) =>
        prev.map((j) => (j.id === a.jobId ? { ...j, applicantsCount: j.applicantsCount + 1 } : j)),
      )
      pushNotification({
        title: 'New application received',
        body: `${a.name} applied for ${a.jobTitle}.`,
      })
    }, 10000)

    return () => {
      window.clearInterval(id)
      for (const timeoutId of timeouts.values()) window.clearTimeout(timeoutId)
      timeouts.clear()
    }
  }, [])

  function updateApplicant(id, updater) {
    setApplicants((prev) => prev.map((a) => (a.id === id ? updater(a) : a)))
  }

  function handleShortlist(applicantId) {
    const target = applicants.find((a) => a.id === applicantId)
    if (!target) return

    updateApplicant(applicantId, (a) => ({ ...a, status: 'Shortlisted' }))
    pushNotification({ title: 'Candidate shortlisted', body: `${target.name} moved to Shortlisted.` })
  }

  function handleReject(applicantId) {
    const target = applicants.find((a) => a.id === applicantId)
    if (!target) return

    updateApplicant(applicantId, (a) => ({ ...a, status: 'Rejected' }))
    pushNotification({ title: 'Candidate rejected', body: `${target.name} was rejected.` })
  }

  function handleScheduleInterview(applicantId) {
    const target = applicants.find((a) => a.id === applicantId)
    if (!target) return

    updateApplicant(applicantId, (a) => ({ ...a, status: 'Interview' }))

    setInterviews((prev) => {
      const exists = prev.some((i) => i.applicantId === applicantId)
      if (exists) return prev
      const interview = {
        id: makeId('int'),
        applicantId,
        candidateName: target.name,
        jobTitle: target.jobTitle,
        timeLabel: scheduleTimeLabel(),
        mode: pick(MODES),
      }
      return [interview, ...prev].slice(0, 8)
    })

    pushNotification({ title: 'Interview scheduled', body: `Interview set for ${target.name} (${target.jobTitle}).` })
  }

  function handleMarkHired(interviewId) {
    const target = interviews.find((i) => i.id === interviewId)
    if (!target) return

    setInterviews((prev) => prev.filter((i) => i.id !== interviewId))
    setHiresCompleted((h) => h + 1)
    pushNotification({ title: 'Hire completed', body: `${target.candidateName} marked as hired.` })
  }

  function handleViewApplicants(jobId) {
    const job = jobs.find((j) => j.id === jobId)
    if (!job) return
    pushNotification({ title: 'Viewing applicants', body: `Opening pipeline for ${job.title}.` })
    const el = document.getElementById('applicants')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  function handleEditJob(jobId) {
    const job = jobs.find((j) => j.id === jobId)
    if (!job) return
    pushNotification({ title: 'Edit job (demo)', body: `Editing ${job.title} (UI simulation).` })
  }

  function handleCloseJob(jobId) {
    const job = jobs.find((j) => j.id === jobId)
    if (!job) return
    setJobs((prev) => prev.map((j) => (j.id === jobId ? { ...j, status: 'Closed' } : j)))
    pushNotification({ title: 'Job closed', body: `${job.title} is now closed.` })
  }

  function qaPostJob() {
    pushNotification({ title: 'Post job (demo)', body: 'This is a UI demo action — connect it to your API later.' })
  }
  function qaViewApplicants() {
    const el = document.getElementById('applicants')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
  function qaSearchCandidates() {
    pushNotification({ title: 'Search ready', body: 'Use the header search to filter the live applicant table.' })
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
  function qaViewAnalytics() {
    const el = document.getElementById('analytics')
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }

  const toastItems = notifications.slice(0, 3)

  // Merge simulated + real notifications for display
  const mergedNotifications = useMemo(() => {
    const simulated = notifications.map(n => ({ ...n, _id: n.id, message: n.body, read: n.read ?? true }))
    return [...apiNotifications, ...simulated].sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0)).slice(0, 30)
  }, [notifications, apiNotifications])

  // Compute search result count for header feedback
  const searchResultCount = useMemo(() => {
    if (!searchValue.trim()) return null
    const q = searchValue.trim().toLowerCase()
    return applicants.filter(a => `${a.name} ${a.jobTitle} ${a.experience}`.toLowerCase().includes(q)).length
  }, [searchValue, applicants])

  async function handleMarkNotifRead(notif) {
    if (notif.read) return
    if (notif._id && !notif._id.startsWith('n-')) {
      try {
        await markNotificationRead(notif._id)
        setApiNotifications(prev => prev.map(n => n._id === notif._id ? { ...n, read: true } : n))
      } catch (e) { console.error(e) }
    }
  }

  async function handleMarkAllNotifsRead() {
    try {
      await markAllNotificationsRead()
      setApiNotifications(prev => prev.map(n => ({ ...n, read: true })))
    } catch (e) { console.error(e) }
  }

  async function handleMarkMsgRead(msg) {
    if (msg.read) return
    try {
      await markMessageRead(msg._id)
      setApiMessages(prev => prev.map(m => m._id === msg._id ? { ...m, read: true } : m))
    } catch (e) { console.error(e) }
  }

  async function handleMarkAllMsgsRead() {
    try {
      await markAllMessagesRead()
      setApiMessages(prev => prev.map(m => ({ ...m, read: true })))
    } catch (e) { console.error(e) }
  }

  const todaySummary = useMemo(() => {
    const newCount = applicants.filter((a) => a.status === 'New').length
    const shortCount = applicants.filter((a) => a.status === 'Shortlisted').length
    const intCount = interviewsScheduled
    return { newCount, shortCount, intCount }
  }, [applicants, interviewsScheduled])

  function handleLogout() {
    try {
      window.localStorage.clear()
    } catch {
      // ignore storage errors
    }
    navigate('/', { replace: true })
  }

  return (
    <div className="rd-theme-provider w-full relative bg-[var(--rd-bg)] flex flex-col">
      <div className="rd-main max-w-7xl mx-auto w-full flex-1">
        <RecruiterHeader
          searchValue={searchValue}
          onSearchChange={setSearchValue}
          searchResultCount={searchResultCount}
          notifications={mergedNotifications}
          onMarkNotifRead={handleMarkNotifRead}
          onMarkAllNotifsRead={handleMarkAllNotifsRead}
          messages={apiMessages}
          onMarkMsgRead={handleMarkMsgRead}
          onMarkAllMsgsRead={handleMarkAllMsgsRead}
          onLogout={handleLogout}
        />

        <div className="rd-content">
          <section className="rd-welcome" aria-label="Welcome">
            <div>
              <h1>Welcome back, Recruiter 👋</h1>
              <p>
                <span className="rd-live-dot" aria-hidden="true" />
                Today: <strong>{todaySummary.newCount}</strong> new, <strong>{todaySummary.shortCount}</strong> shortlisted,{' '}
                <strong>{todaySummary.intCount}</strong> interviews scheduled.
              </p>
            </div>
            <div className="rd-welcome-right">
              <span className="rd-chip">Pipeline Health: Strong</span>
              <span className="rd-chip">Avg response: 2h</span>
              <span className="rd-chip">Top source: Campus</span>
            </div>
          </section>

          <StatsCards
            activeJobs={activeJobs}
            totalApplicants={totalApplicants}
            interviewsScheduled={interviewsScheduled}
            hiresCompleted={hiresCompleted}
          />

          <div className="rd-grid-2">
            <ApplicantsTable
              applicants={applicants}
              onShortlist={handleShortlist}
              onScheduleInterview={handleScheduleInterview}
              onReject={handleReject}
              searchValue={searchValue}
            />
            <InterviewSchedule interviews={interviews} onMarkHired={handleMarkHired} />
          </div>

          <div className="rd-grid-3">
            <JobCards jobs={jobs} onViewApplicants={handleViewApplicants} onEditJob={handleEditJob} onCloseJob={handleCloseJob} />
            <QuickActions
              onPostJob={qaPostJob}
              onViewApplicants={qaViewApplicants}
              onSearchCandidates={qaSearchCandidates}
              onViewAnalytics={qaViewAnalytics}
            />
            <AnalyticsSection analytics={analytics} />
          </div>
        </div>
      </div>

      <div className="rd-toast" aria-live="polite" aria-label="Live notifications">
        {toastItems.map((n) => (
          <div key={n.id} className="rd-toast-item">
            <div>
              <strong>{n.title}</strong>
              <p>{n.body}</p>
            </div>
            <button
              type="button"
              className="rd-toast-close"
              aria-label="Dismiss notification"
              onClick={() => setNotifications((prev) => prev.filter((x) => x.id !== n.id))}
            >
              ×
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}

export default RecruiterDashboard

