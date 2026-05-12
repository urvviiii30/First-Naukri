import { Routes, Route, Navigate } from 'react-router-dom'
import StudentAuth from './StudentAuth'
import StudentDashboard from './StudentDashboard'
import RecruiterDashboard from './RecruiterDashboard'
import FindJobs from './FindJobs'
import MyApplications from './MyApplications'
import PostJob from './PostJob'
import Applicants from './Applicants'
import ManageJobs from './ManageJobs'
import RecruiterInterviews from './RecruiterInterviews'
import CompanyProfiles from './CompanyProfiles'
import Settings from './Settings'
import ResumeBuilder from './ResumeBuilder'
import LandingPage from './LandingPage'
import GlobalLayout from './components/GlobalLayout'
import './index.css'

function getStoredUser() {
  try {
    const raw = window.localStorage.getItem('user')
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

function HomeRoute() {
  const user = getStoredUser()

  if (user?.role === 'student') {
    return <Navigate to="/student-dashboard" replace />
  }

  if (user?.role === 'recruiter') {
    return <Navigate to="/recruiter-dashboard" replace />
  }

  return <LandingPage />
}

function LoginRoute() {
  const user = getStoredUser()

  if (user?.role === 'student') {
    return <Navigate to="/student-dashboard" replace />
  }

  if (user?.role === 'recruiter') {
    return <Navigate to="/recruiter-dashboard" replace />
  }

  return <StudentAuth />
}

function ProtectedRoute({ requiredRole, children }) {
  const user = getStoredUser()

  if (!user || (requiredRole && user.role !== requiredRole)) {
    return <Navigate to="/login" replace />
  }

  return children
}

function App() {
  return (
    <main>
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<LoginRoute />} />
        <Route element={<GlobalLayout />}>
          <Route
            path="/student-dashboard"
            element={
              <ProtectedRoute requiredRole="student">
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter-dashboard"
            element={
              <ProtectedRoute requiredRole="recruiter">
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/find-jobs" element={<FindJobs />} />
          <Route path="/applications" element={<MyApplications />} />
          <Route path="/post-job" element={<PostJob />} />
          <Route path="/recruiter-applicants" element={<Applicants />} />
          <Route path="/recruiter/manage-jobs" element={<ProtectedRoute requiredRole="recruiter"><ManageJobs /></ProtectedRoute>} />
          <Route path="/recruiter/company-profiles" element={<ProtectedRoute requiredRole="recruiter"><CompanyProfiles /></ProtectedRoute>} />
          <Route path="/recruiter-interviews" element={<ProtectedRoute requiredRole="recruiter"><RecruiterInterviews /></ProtectedRoute>} />
          <Route path="/resume-builder" element={<ProtectedRoute requiredRole="student"><ResumeBuilder /></ProtectedRoute>} />
          <Route path="/settings" element={<ProtectedRoute><Settings /></ProtectedRoute>} />
        </Route>
      </Routes>
    </main>
  )
}

export default App
