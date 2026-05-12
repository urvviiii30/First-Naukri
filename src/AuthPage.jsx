import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { loginAPI, registerAPI } from './api/client'
import './AuthPage.css'

function AuthPage({ initialRole = 'student' }) {
  const [isSignup, setIsSignup] = useState(false)
  const [role, setRole] = useState(initialRole)
  const [loginEmail, setLoginEmail] = useState('')
  const [signupName, setSignupName] = useState('')
  const [signupEmail, setSignupEmail] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  function handleAuthSuccess(user, token) {
    try {
      window.localStorage.setItem('user', JSON.stringify(user))
      window.localStorage.setItem('token', token)
    } catch {
      // ignore storage errors
    }

    if (user.role === 'student') {
      navigate('/student-dashboard', { replace: true })
    } else if (user.role === 'recruiter') {
      navigate('/recruiter-dashboard', { replace: true })
    }
  }

  async function handleLoginSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const password = document.getElementById('login-password').value
      const res = await loginAPI({ email: loginEmail, password, role })
      handleAuthSuccess(res.user, res.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  async function handleSignupSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const password = document.getElementById('signup-password').value
      const confirm = document.getElementById('signup-confirm').value
      
      if (password !== confirm) {
        setError('Passwords do not match')
        setLoading(false)
        return
      }

      const res = await registerAPI({ name: signupName, email: signupEmail, password, role })
      handleAuthSuccess(res.user, res.token)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const isStudent = role === 'student'

  return (
    <div className="auth-page">
      <div className={`auth-card${isSignup ? ' right-panel-active' : ''}`}>
        {/* Form section – left by default, slides right when signup */}
        <section className="auth-form-section" aria-label="Authentication form">
          <div className="auth-role-toggle" role="group" aria-label="Select role">
            <label>
              <input
                type="radio"
                name="role"
                value="student"
                checked={role === 'student'}
                onChange={() => setRole('student')}
              />
              <span>Student</span>
            </label>
            <label>
              <input
                type="radio"
                name="role"
                value="recruiter"
                checked={role === 'recruiter'}
                onChange={() => setRole('recruiter')}
              />
              <span>Recruiter</span>
            </label>
          </div>

          {!isSignup ? (
            <>
              <h1>Sign in to First Naukri</h1>
              <p className="subtitle">
                {isStudent
                  ? 'Access your dashboard and explore fresher opportunities.'
                  : 'Post jobs and connect with the best student talent.'}
              </p>
              <form
                className="auth-form"
                onSubmit={handleLoginSubmit}
              >
                <div className="field">
                  <label htmlFor="login-email">
                    {isStudent ? 'Email' : 'Work Email'}
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    placeholder={isStudent ? 'you@example.com' : 'you@company.com'}
                    autoComplete="email"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="login-password">Password</label>
                  <input
                    id="login-password"
                    type="password"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                </div>
                <a href="#" className="forgot-link">
                  Forgot Password?
                </a>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Signing In...' : 'Sign In'}
                </button>
                {error && <p style={{ color: 'red', marginTop: '10px', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
              </form>
              <p className="form-footer">
                New to First Naukri?{' '}
                <button type="button" onClick={() => setIsSignup(true)}>
                  Create your account
                </button>
              </p>
            </>
          ) : (
            <>
              <h1>Create your account</h1>
              <p className="subtitle">
                {isStudent
                  ? 'Join First Naukri and find internships and fresher jobs.'
                  : 'Register your company and start hiring.'}
              </p>
              <form
                className="auth-form"
                onSubmit={handleSignupSubmit}
              >
                <div className="field">
                  <label htmlFor="signup-name">
                    {isStudent ? 'Full Name' : 'Recruiter Name'}
                  </label>
                  <input
                    id="signup-name"
                    type="text"
                    placeholder="Enter your name"
                    autoComplete="name"
                    value={signupName}
                    onChange={(e) => setSignupName(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="signup-email">
                    {isStudent ? 'Email' : 'Work Email'}
                  </label>
                  <input
                    id="signup-email"
                    type="email"
                    placeholder={isStudent ? 'you@example.com' : 'you@company.com'}
                    autoComplete="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                  />
                </div>
                <div className="field">
                  <label htmlFor="signup-password">Password</label>
                  <input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    autoComplete="new-password"
                  />
                </div>
                <div className="field">
                  <label htmlFor="signup-confirm">Confirm Password</label>
                  <input
                    id="signup-confirm"
                    type="password"
                    placeholder="Confirm password"
                    autoComplete="new-password"
                  />
                </div>
                <button type="submit" className="btn-primary" disabled={loading}>
                  {loading ? 'Registering...' : 'Register'}
                </button>
                {error && <p style={{ color: 'red', marginTop: '10px', fontSize: '14px', textAlign: 'center' }}>{error}</p>}
              </form>
              <p className="form-footer">
                Already have an account?{' '}
                <button type="button" onClick={() => setIsSignup(false)}>
                  Sign in
                </button>
              </p>
            </>
          )}
        </section>

        {/* Overlay section – right by default, slides left when signup */}
        <section className="auth-overlay-section" aria-label="Welcome panel">
          {!isSignup ? (
            <>
              <h2>Start Your Career Journey</h2>
              <p>
                Join First Naukri and discover internships, fresher jobs, and career
                opportunities tailored for you.
              </p>
              <button
                type="button"
                className="auth-overlay-btn primary"
                onClick={() => setIsSignup(true)}
              >
                Sign Up
              </button>
            </>
          ) : (
            <>
              <h2>Welcome Back!</h2>
              <p>
                Already have an account? Sign in to continue exploring job opportunities.
              </p>
              <button
                type="button"
                className="auth-overlay-btn"
                onClick={() => setIsSignup(false)}
              >
                Sign In
              </button>
            </>
          )}
        </section>
      </div>
    </div>
  )
}

export default AuthPage
