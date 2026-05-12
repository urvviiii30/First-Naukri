const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000'

async function request(path, options = {}) {
  const token = window.localStorage.getItem('token')
  const headers = { ...(options.headers || {}) }
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers,
  })
  const isJson = res.headers.get('content-type')?.includes('application/json')
  const data = isJson ? await res.json() : await res.text()
  if (!res.ok) {
    const msg = typeof data === 'object' && data?.message ? data.message : 'Request failed'
    throw new Error(msg)
  }
  return data
}

export function getJobs() {
  return request('/api/jobs')
}

export function getRecruiterJobs(recruiterId) {
  return request(`/api/jobs/${encodeURIComponent(recruiterId)}`)
}

export function postJob(payload) {
  return request('/api/jobs', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function applyToJob(formData) {
  return request('/api/applications', { method: 'POST', body: formData })
}

export function getApplicantsByJob(jobId) {
  return request(`/api/applications/job/${encodeURIComponent(jobId)}`)
}

export function getStudentApplications(studentId) {
  return request(`/api/applications/student/${encodeURIComponent(studentId)}`)
}

export function updateApplicationStatus(applicationId, status) {
  return request(`/api/applications/${encodeURIComponent(applicationId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status }),
  })
}

export function getApiBase() {
  return API_BASE
}

export function loginAPI(payload) {
  return request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function registerAPI(payload) {
  return request('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function getInterviews(recruiterId) {
  return request(`/api/interviews/recruiter/${encodeURIComponent(recruiterId)}`)
}

export function scheduleInterview(payload) {
  return request('/api/interviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function updateInterview(interviewId, payload) {
  return request(`/api/interviews/${encodeURIComponent(interviewId)}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function updateJob(jobId, payload) {
  return request(`/api/jobs/${encodeURIComponent(jobId)}`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function updateJobStatus(jobId, status, recruiterId) {
  return request(`/api/jobs/${encodeURIComponent(jobId)}/status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ status, recruiterId }),
  })
}

export function deleteJob(jobId, recruiterId) {
  return request(`/api/jobs/${encodeURIComponent(jobId)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recruiterId }),
  })
}

export function getCompanyProfile(recruiterId) {
  return request(`/api/companies/recruiter/${encodeURIComponent(recruiterId)}`)
}

export function saveCompanyProfile(formData) {
  return request('/api/companies', {
    method: 'POST',
    body: formData,
  })
}

export function deleteCompanyProfile(companyId, recruiterId) {
  return request(`/api/companies/${encodeURIComponent(companyId)}`, {
    method: 'DELETE',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ recruiterId }),
  })
}

export function getUserProfile() {
  return request('/api/user/profile')
}

export function updateUserProfile(formData) {
  return request('/api/user/profile', {
    method: 'PUT',
    body: formData,
  })
}

export function changePassword(payload) {
  return request('/api/user/change-password', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function updateNotifications(payload) {
  return request('/api/user/settings/notifications', {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
}

export function deleteAccount() {
  return request('/api/user/delete-account', {
    method: 'DELETE',
  })
}

// Student Dashboard specific:
export function getSavedJobs() {
  return request('/api/user/saved-jobs')
}

export function toggleSavedJob(jobId) {
  return request(`/api/user/saved-jobs/${encodeURIComponent(jobId)}`, {
    method: 'POST'
  })
}

export function getProfileCompletion() {
  return request('/api/user/profile-completion')
}

export function getNotifications() {
  return request('/api/notifications')
}

export function markNotificationRead(id) {
  return request(`/api/notifications/${encodeURIComponent(id)}/read`, {
    method: 'PUT'
  })
}

export function markAllNotificationsRead() {
  return request('/api/notifications/read-all', {
    method: 'PUT'
  })
}

export function getStudentInterviews(studentId) {
  return request(`/api/interviews/student/${encodeURIComponent(studentId)}`)
}

export function getMessages() {
  return request('/api/messages')
}

export function markMessageRead(id) {
  return request(`/api/messages/${encodeURIComponent(id)}/read`, {
    method: 'PUT'
  })
}

export function markAllMessagesRead() {
  return request('/api/messages/read-all', {
    method: 'PUT'
  })
}
