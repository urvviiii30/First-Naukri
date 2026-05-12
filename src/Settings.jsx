import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getApiBase, getUserProfile, updateUserProfile, changePassword, updateNotifications, deleteAccount } from './api/client'
import BackButton from './components/BackButton'

function Settings() {
  const navigate = useNavigate()
  
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('profile')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')

  // Profile Form
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [bio, setBio] = useState('')
  const [previewUrl, setPreviewUrl] = useState('')
  const [avatarFile, setAvatarFile] = useState(null)

  // Security Form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  // Completion Form
  const [skillsInput, setSkillsInput] = useState('')
  const [userLocation, setUserLocation] = useState('')
  const [github, setGithub] = useState('')
  const [linkedin, setLinkedin] = useState('')
  const [prefRole, setPrefRole] = useState('')
  const [prefType, setPrefType] = useState('')
  const [prefLocation, setPrefLocation] = useState('')

  const [eduInst, setEduInst] = useState('')
  const [eduDegree, setEduDegree] = useState('')
  const [projTitle, setProjTitle] = useState('')
  const [projDesc, setProjDesc] = useState('')
  const [certTitle, setCertTitle] = useState('')
  
  const [resumeUrl, setResumeUrl] = useState('')

  // Notifications
  const [emailsEnabled, setEmailsEnabled] = useState(true)
  const [jobAlertsEnabled, setJobAlertsEnabled] = useState(true)
  const [updatesEnabled, setUpdatesEnabled] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [])

  function fetchProfile() {
    setLoading(true)
    setError('')
    getUserProfile()
      .then((data) => {
        setUser(data)
        setName(data.name || '')
        setPhone(data.phone || '')
        setBio(data.bio || '')
        setPreviewUrl(data.profilePicture ? `${getApiBase()}${data.profilePicture}` : '')
        setUserLocation(data.location || '')
        if (data.skills) setSkillsInput(data.skills.join(', '))
        if (data.education && data.education.length > 0) {
           setEduInst(data.education[0].institution || '')
           setEduDegree(data.education[0].degree || '')
        }
        if (data.projects && data.projects.length > 0) {
           setProjTitle(data.projects[0].title || '')
           setProjDesc(data.projects[0].description || '')
        }
        if (data.certifications && data.certifications.length > 0) {
           setCertTitle(data.certifications[0].title || '')
        }
        setGithub(data.socialLinks?.github || '')
        setLinkedin(data.socialLinks?.linkedin || '')
        setPrefRole(data.preferences?.role || '')
        setPrefType(data.preferences?.jobType || '')
        setPrefLocation(data.preferences?.location || '')
        setResumeUrl(data.resumePath || '')
        if (data.notifications) {
          setEmailsEnabled(data.notifications.email !== false)
          setJobAlertsEnabled(data.notifications.jobAlerts !== false)
          setUpdatesEnabled(data.notifications.updates !== false)
        }
      })
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false))
  }

  function handleLogoutDisplay() {
    localStorage.removeItem('fn_token')
    localStorage.removeItem('fn_role')
    localStorage.removeItem('fn_studentId')
    localStorage.removeItem('fn_recruiterId')
    navigate('/login')
  }

  function handleAvatarChange(e) {
    const file = e.target.files[0]
    if (file) {
      setAvatarFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  async function handleProfileSave(e) {
    e.preventDefault()
    setError('')
    setInfo('Saving profile...')
    
    const formData = new FormData()
    formData.append('name', name)
    formData.append('phone', phone)
    formData.append('bio', bio)
    if (avatarFile) {
      formData.append('profilePicture', avatarFile)
    }

    try {
      const updated = await updateUserProfile(formData)
      setUser(updated)
      setInfo('Profile updated successfully.')
    } catch (err) {
      setError(err.message)
      setInfo('')
    }
  }

  async function handleCompletionSave(e) {
    e.preventDefault()
    setError('')
    setInfo('Saving profile facts...')
    try {
      const arr = skillsInput.split(',').map(s => s.trim()).filter(Boolean)
      const formData = new FormData()
      formData.append('location', userLocation)
      formData.append('skills', JSON.stringify(arr))
      formData.append('socialLinks', JSON.stringify({ github, linkedin }))
      formData.append('preferences', JSON.stringify({ role: prefRole, jobType: prefType, location: prefLocation }))
      
      if (eduInst) formData.append('education', JSON.stringify([{ institution: eduInst, degree: eduDegree }]))
      if (projTitle) formData.append('projects', JSON.stringify([{ title: projTitle, description: projDesc }]))
      if (certTitle) formData.append('certifications', JSON.stringify([{ title: certTitle }]))
      
      const updated = await updateUserProfile(formData)
      setUser(updated)
      setInfo('Profile completion saved successfully!')
    } catch (err) {
      setError(err.message)
      setInfo('')
    }
  }

  async function handlePasswordChange(e) {
    e.preventDefault()
    setError('')
    setInfo('')

    if (newPassword !== confirmPassword) {
      return setError('New passwords do not match.')
    }
    if (newPassword.length < 6) {
      return setError('New password must be at least 6 characters.')
    }

    try {
      setInfo('Updating password...')
      await changePassword({ currentPassword, newPassword })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
      setInfo('Password changed successfully!')
    } catch (err) {
      setError(err.message)
      setInfo('')
    }
  }

  async function handleNotificationSave() {
    setError('')
    setInfo('')
    try {
      await updateNotifications({ email: emailsEnabled, jobAlerts: jobAlertsEnabled, updates: updatesEnabled })
      setInfo('Notification preferences saved.')
    } catch (err) {
      setError(err.message)
    }
  }

  async function handleDeleteAccount() {
    if (!window.confirm('WARNING: Are you sure you want to permanently delete your account? This cannot be undone.')) return
    if (!window.confirm('Final confirmation: Delete Account?')) return

    try {
      await deleteAccount()
      handleLogoutDisplay()
    } catch (err) {
      setError(err.message)
    }
  }

  const tabs = [
    { id: 'profile', label: 'Profile' },
    ...(user?.role === 'student' ? [{ id: 'completion', label: 'Profile Completion' }] : []),
    { id: 'security', label: 'Security' },
    { id: 'notifications', label: 'Notifications' },
    { id: 'role', label: user?.role === 'recruiter' ? 'Recruiter Hub' : 'Student Tools' },
  ]

  if (loading) {
    return (
      <div className="w-full min-h-full bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold">Loading preferences...</p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-full bg-slate-50">
      <div className="max-w-6xl mx-auto px-4 pt-8 pb-10">
        <div className="mb-4"><BackButton /></div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Account Settings</h1>
            <p className="text-sm text-slate-600 mt-1">Manage your personal information and preferences.</p>
          </div>
          <button
            onClick={() => navigate(user?.role === 'recruiter' ? '/recruiter-dashboard' : '/student-dashboard')}
            className="h-10 px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm shadow-sm"
          >
            Back to Dashboard
          </button>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-semibold">{error}</div>}
        {info && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 font-semibold">{info}</div>}

        <div className="mt-6 flex flex-col md:flex-row gap-6">
          {/* Sidebar */}
          <div className="w-full md:w-64 flex-shrink-0 flex flex-col gap-2">
            {tabs.map(t => (
              <button
                key={t.id}
                onClick={() => setActiveTab(t.id)}
                className={`text-left px-4 py-3 rounded-xl font-bold text-sm transition-colors ${
                  activeTab === t.id ? 'bg-blue-600 text-white shadow-md' : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="flex-1 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden p-6 md:p-8">
            
            {/* PROFILE TAB */}
            {activeTab === 'profile' && (
              <form onSubmit={handleProfileSave}>
                <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Profile Information</h2>
                
                <div className="flex flex-col md:flex-row gap-8 mb-6">
                  <div className="w-full md:w-40 flex flex-col gap-3 shrink-0">
                    <label className="text-sm font-bold text-slate-900 text-center">Profile Avatar</label>
                    <div className="w-full aspect-square rounded-full border-4 border-slate-100 bg-slate-50 flex items-center justify-center relative overflow-hidden group cursor-pointer shadow-sm">
                      {previewUrl ? (
                         <img src={previewUrl} alt="Avatar" className="w-full h-full object-cover" />
                      ) : (
                         <svg className="w-12 h-12 text-slate-300" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                      )}
                      <input 
                        type="file" 
                        accept="image/jpeg, image/png, image/webp" 
                        onChange={handleAvatarChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <div className="absolute inset-x-0 bottom-0 bg-slate-900/60 p-2 text-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                        Change
                      </div>
                    </div>
                  </div>

                  <div className="flex-1 grid gap-5">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1.5">Full Name *</label>
                      <input 
                        type="text" required value={name} onChange={e => setName(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1.5">Email Address (Read-only)</label>
                      <input 
                        type="email" disabled value={user?.email || ''}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-100 px-4 text-sm font-medium text-slate-500 outline-none cursor-not-allowed"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1.5">Phone Number</label>
                      <input 
                        type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="(123) 456-7890"
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
                      />
                    </div>
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-900 mb-1.5">Short Bio</label>
                  <textarea 
                    rows={3} value={bio} onChange={e => setBio(e.target.value)} placeholder="A little bit about yourself..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 resize-none"
                  />
                </div>

                <div className="flex justify-end pt-4 border-t border-slate-100">
                  <button type="submit" className="h-11 px-8 rounded-xl font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer">
                    Save Profile
                  </button>
                </div>
              </form>
            )}

            {/* COMPLETION TAB */}
            {activeTab === 'completion' && user?.role === 'student' && (
              <form onSubmit={handleCompletionSave}>
                <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Profile Completion Dashboard</h2>
                <div className="text-sm text-slate-600 mb-6 bg-blue-50 p-3 rounded-lg border border-blue-100">
                  <span className="font-bold text-blue-800">Pro Tip: </span>All 6 sections below dynamically update your final match weighting. Target 100% to maximize recruiter views!
                </div>

                <div className="space-y-6">
                  {/* Basic Info Additions */}
                  <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                    <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><span className="text-xl">📍</span> Location & Bio</h3>
                    <div className="flex gap-4">
                       <input type="text" value={userLocation} onChange={e => setUserLocation(e.target.value)} placeholder="City, Country" className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:ring-4 focus:ring-blue-100 outline-none" />
                    </div>
                  </div>

                  {/* Skills */}
                  <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                    <h3 className="font-extrabold text-slate-900 mb-2 flex items-center gap-2"><span className="text-xl">⚡</span> Key Skills</h3>
                    <p className="text-xs text-slate-500 mb-3">Minimum 5 skills recommended for max weight (15%).</p>
                    <input type="text" value={skillsInput} onChange={e => setSkillsInput(e.target.value)} placeholder="React, Python, Figma, Leadership..." className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:ring-4 focus:ring-blue-100 outline-none" />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Education */}
                    <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                      <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><span className="text-xl">🎓</span> Education Highlight</h3>
                      <div className="space-y-3">
                        <input type="text" value={eduInst} onChange={e => setEduInst(e.target.value)} placeholder="University / College" className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:ring-4 focus:ring-blue-100 outline-none" />
                        <input type="text" value={eduDegree} onChange={e => setEduDegree(e.target.value)} placeholder="Degree / Course" className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:ring-4 focus:ring-blue-100 outline-none" />
                      </div>
                    </div>

                    {/* Project */}
                    <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                      <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><span className="text-xl">🚀</span> Primary Project</h3>
                      <div className="space-y-3">
                        <input type="text" value={projTitle} onChange={e => setProjTitle(e.target.value)} placeholder="Project Title" className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:ring-4 focus:ring-blue-100 outline-none" />
                        <input type="text" value={projDesc} onChange={e => setProjDesc(e.target.value)} placeholder="Short Description" className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:ring-4 focus:ring-blue-100 outline-none" />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Social */}
                    <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                      <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><span className="text-xl">🔗</span> Social Links</h3>
                      <div className="space-y-3">
                        <input type="url" value={github} onChange={e => setGithub(e.target.value)} placeholder="GitHub URL" className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:ring-4 focus:ring-blue-100 outline-none" />
                        <input type="url" value={linkedin} onChange={e => setLinkedin(e.target.value)} placeholder="LinkedIn URL" className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:ring-4 focus:ring-blue-100 outline-none" />
                      </div>
                    </div>

                    {/* Cert/Prefs */}
                    <div className="p-5 border border-slate-200 rounded-2xl bg-white shadow-[0_2px_10px_-3px_rgba(6,81,237,0.1)]">
                      <h3 className="font-extrabold text-slate-900 mb-4 flex items-center gap-2"><span className="text-xl">📜</span> Certs & Preferences</h3>
                      <div className="space-y-3">
                        <input type="text" value={certTitle} onChange={e => setCertTitle(e.target.value)} placeholder="Primary Certification Title" className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:ring-4 focus:ring-blue-100 outline-none" />
                        <input type="text" value={prefRole} onChange={e => setPrefRole(e.target.value)} placeholder="Desired Career Role" className="w-full h-11 rounded-xl border border-slate-200 px-4 text-sm focus:ring-4 focus:ring-blue-100 outline-none" />
                      </div>
                    </div>
                  </div>

                  {/* Resume Banner */}
                  <div className="p-5 border border-dashed border-blue-300 rounded-2xl bg-blue-50/50 flex items-center justify-between">
                    <div>
                      <h3 className="font-extrabold text-blue-900">PDF Resume Status (15%)</h3>
                      <p className="text-xs text-blue-700 mt-1">{resumeUrl ? '✓ Resume active matching enabled.' : 'Missing! Upload via internal parser.'}</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-4 border-t border-slate-100 flex justify-end">
                  <button type="submit" className="h-11 px-8 rounded-xl font-extrabold text-white bg-slate-900 hover:bg-black shadow-lg transition-all cursor-pointer">
                    Sync Algorithm
                  </button>
                </div>
              </form>
            )}

            {/* SECURITY TAB */}
            {activeTab === 'security' && (
              <div>
                <form onSubmit={handlePasswordChange}>
                  <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Change Password</h2>
                  <div className="grid gap-5 mb-6 max-w-md">
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1.5">Current Password</label>
                      <input 
                        type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1.5">New Password</label>
                      <input 
                        type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} minLength={6}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-bold text-slate-900 mb-1.5">Confirm New Password</label>
                      <input 
                        type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} minLength={6}
                        className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300"
                      />
                    </div>
                  </div>
                  <div className="flex justify-start">
                    <button type="submit" className="h-10 px-6 rounded-xl font-bold text-white bg-slate-800 hover:bg-slate-900 transition-colors shadow-sm">
                      Update Password
                    </button>
                  </div>
                </form>

                <div className="mt-12 pt-6 border-t border-slate-100">
                  <h2 className="text-lg font-bold text-red-600 mb-2">Danger Zone</h2>
                  <p className="text-sm text-slate-500 mb-4">Deleting your account permanently destroys all associated data, applications, and logs.</p>
                  <button onClick={handleDeleteAccount} className="h-10 px-6 rounded-xl font-bold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors cursor-pointer shadow-sm">
                    Delete Account Continuously
                  </button>
                </div>
              </div>
            )}

            {/* NOTIFICATIONS TAB */}
            {activeTab === 'notifications' && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-6 border-b border-slate-100 pb-2">Communication Preferences</h2>
                <div className="grid gap-6 max-w-lg mb-8">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="checkbox" checked={emailsEnabled} onChange={e => setEmailsEnabled(e.target.checked)} className="w-5 h-5 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">Email Notifications</div>
                      <div className="text-xs text-slate-500">Receive general platform updates directly in your inbox.</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="checkbox" checked={jobAlertsEnabled} onChange={e => setJobAlertsEnabled(e.target.checked)} className="w-5 h-5 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">Activity Alerts</div>
                      <div className="text-xs text-slate-500">Trigger immediate notifications for specific account interactions.</div>
                    </div>
                  </label>
                  
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="checkbox" checked={updatesEnabled} onChange={e => setUpdatesEnabled(e.target.checked)} className="w-5 h-5 mt-0.5 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">System Updates</div>
                      <div className="text-xs text-slate-500">Get notified when we release new platform features or UI enhancements.</div>
                    </div>
                  </label>
                </div>
                <div className="flex justify-start pt-4 border-t border-slate-100">
                  <button onClick={handleNotificationSave} className="h-10 px-8 rounded-xl font-bold text-slate-800 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition-colors shadow-sm">
                    Save Preferences
                  </button>
                </div>
              </div>
            )}

            {/* ROLE SPECIFIC TAB */}
            {activeTab === 'role' && user?.role === 'recruiter' && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Recruiter Capabilities</h2>
                <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex flex-col items-start gap-4 shadow-sm">
                  <div>
                    <h3 className="font-extrabold text-blue-900 text-lg">Company Profile Link</h3>
                    <p className="text-sm text-blue-800 mt-1">We've detached personal accounts from company brands to allow for modular scaling. To edit the company linked to your job listings, please manage your Company Profile securely.</p>
                  </div>
                  <button onClick={() => navigate('/recruiter/company-profiles')} className="h-10 px-6 rounded-xl font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-md">
                    Manage Company Profile
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'role' && user?.role === 'student' && (
              <div>
                <h2 className="text-lg font-bold text-slate-900 mb-4 border-b border-slate-100 pb-2">Candidate Tools</h2>
                <div className="grid gap-6 max-w-lg mb-8">
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">Make my Resume Public</div>
                      <div className="text-xs text-slate-500">Allow recruiters to discover your resume independently during active sourcing.</div>
                    </div>
                  </label>
                  <label className="flex items-start gap-4 cursor-pointer">
                    <input type="checkbox" defaultChecked className="w-5 h-5 mt-0.5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500" />
                    <div>
                      <div className="text-sm font-bold text-slate-900">Open to Work Banner</div>
                      <div className="text-xs text-slate-500">Display a green "Open to Work" ring around your new avatar when recruiters view applicants.</div>
                    </div>
                  </label>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Settings
