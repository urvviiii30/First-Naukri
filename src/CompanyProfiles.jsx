import { useEffect, useState, useMemo } from 'react'
import { getApiBase, getCompanyProfile, saveCompanyProfile, deleteCompanyProfile } from './api/client'
import BackButton from './components/BackButton'

function getRecruiterId() {
  return localStorage.getItem('fn_recruiterId') || 'recruiter-1'
}

function CompanyProfiles() {
  const recruiterId = useMemo(() => getRecruiterId(), [])
  
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  
  const [isEditing, setIsEditing] = useState(false)

  // Form State
  const [form, setForm] = useState({
    companyName: '',
    industry: '',
    location: '',
    companySize: '',
    website: '',
    description: '',
    foundedYear: ''
  })
  const [logoFile, setLogoFile] = useState(null)
  const [previewUrl, setPreviewUrl] = useState('')

  useEffect(() => {
    fetchProfile()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [recruiterId])

  function fetchProfile() {
    setLoading(true)
    setError('')
    getCompanyProfile(recruiterId)
      .then((data) => {
        setProfile(data)
        initForm(data)
      })
      .catch((e) => {
        // If not found, that's fine, they just haven't created one.
        if (e.message.includes('not found')) {
          setProfile(null)
          setIsEditing(true) // force them to create
        } else {
          setError(e.message)
        }
      })
      .finally(() => setLoading(false))
  }

  function initForm(data) {
    if (!data) return
    setForm({
      companyName: data.companyName || '',
      industry: data.industry || '',
      location: data.location || '',
      companySize: data.companySize || '',
      website: data.website || '',
      description: data.description || '',
      foundedYear: data.foundedYear || ''
    })
    setPreviewUrl(data.logo ? `${getApiBase()}${data.logo}` : '')
  }

  function handleFileChange(e) {
    const file = e.target.files[0]
    if (file) {
      setLogoFile(file)
      setPreviewUrl(URL.createObjectURL(file))
    }
  }

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('Saving profile...')

    const formData = new FormData()
    formData.append('recruiterId', recruiterId)
    formData.append('companyName', form.companyName)
    formData.append('industry', form.industry)
    formData.append('location', form.location)
    formData.append('companySize', form.companySize)
    formData.append('website', form.website)
    formData.append('description', form.description)
    formData.append('foundedYear', form.foundedYear)
    if (logoFile) {
      formData.append('logo', logoFile)
    }

    try {
      const updated = await saveCompanyProfile(formData)
      setProfile(updated)
      initForm(updated)
      setIsEditing(false)
      setInfo('Profile saved successfully!')
    } catch (err) {
      setError(err.message)
      setInfo('')
    }
  }

  async function handleDelete() {
    if (!profile) return
    if (!window.confirm('Are you sure you want to delete your company profile?')) return

    try {
      setError('')
      setInfo('Deleting...')
      await deleteCompanyProfile(profile._id, recruiterId)
      setProfile(null)
      setForm({ companyName: '', industry: '', location: '', companySize: '', website: '', description: '', foundedYear: '' })
      setLogoFile(null)
      setPreviewUrl('')
      setIsEditing(true)
      setInfo('Profile deleted locally.')
    } catch (e) {
      setError(e.message)
      setInfo('')
    }
  }

  if (loading) {
    return (
      <div className="w-full min-h-full bg-slate-50 flex items-center justify-center">
        <p className="text-slate-500 font-bold">Loading profile...</p>
      </div>
    )
  }

  return (
    <div className="w-full min-h-full bg-slate-50">
      <div className="max-w-4xl mx-auto px-4 pt-8 pb-10">
        <div className="mb-4"><BackButton /></div>
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-extrabold text-slate-900">Company Profile</h1>
            <p className="text-sm text-slate-600 mt-1">Manage your public company branding.</p>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            {profile && !isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="h-10 inline-flex items-center px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm shadow-sm"
              >
                Edit Profile
              </button>
            )}
            <a
              href="/recruiter-dashboard"
              className="h-10 inline-flex items-center px-4 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm"
            >
              Dashboard
            </a>
          </div>
        </div>

        {error && <div className="mt-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 font-semibold">{error}</div>}
        {info && <div className="mt-6 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-700 font-semibold">{info}</div>}

        <div className="mt-6 rounded-3xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          {(!profile || isEditing) ? (
            <form onSubmit={handleSubmit} className="p-6 md:p-8">
              <h2 className="text-lg font-bold text-slate-900 mb-6">{profile ? 'Edit Company Details' : 'Create Company Profile'}</h2>
              
              <div className="flex flex-col md:flex-row gap-8 mb-6">
                <div className="w-full md:w-1/3 flex flex-col gap-3">
                  <label className="text-sm font-bold text-slate-900 text-center">Company Logo</label>
                  <div className="w-full aspect-square rounded-2xl border-2 border-dashed border-slate-300 bg-slate-50 flex flex-col items-center justify-center relative overflow-hidden group">
                    {previewUrl ? (
                      <img src={previewUrl} alt="Logo Preview" className="w-full h-full object-contain p-2" />
                    ) : (
                      <span className="text-slate-400 font-bold text-sm p-4 text-center">Click to upload logo</span>
                    )}
                    <input 
                      type="file" 
                      accept="image/jpeg, image/png, image/webp" 
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-slate-900/60 p-2 text-center text-white text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                      Change Logo
                    </div>
                  </div>
                </div>

                <div className="w-full md:w-2/3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">Company Name *</label>
                    <input 
                      type="text" required
                      value={form.companyName} onChange={(e) => setForm({...form, companyName: e.target.value})}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 focus:bg-white"
                      placeholder="e.g. Acme Corp"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">Industry</label>
                    <input 
                      type="text" 
                      value={form.industry} onChange={(e) => setForm({...form, industry: e.target.value})}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 focus:bg-white"
                      placeholder="e.g. Technology"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">Headquarters Location</label>
                    <input 
                      type="text" 
                      value={form.location} onChange={(e) => setForm({...form, location: e.target.value})}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 focus:bg-white"
                      placeholder="e.g. San Francisco, CA"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">Company Size</label>
                    <select 
                      value={form.companySize} onChange={(e) => setForm({...form, companySize: e.target.value})}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 focus:bg-white"
                    >
                      <option value="">Select size...</option>
                      <option value="1-10">1-10 employees</option>
                      <option value="11-50">11-50 employees</option>
                      <option value="51-200">51-200 employees</option>
                      <option value="201-500">201-500 employees</option>
                      <option value="500+">500+ employees</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">Founded Year</label>
                    <input 
                      type="number" min="1800" max="2100"
                      value={form.foundedYear} onChange={(e) => setForm({...form, foundedYear: e.target.value})}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 focus:bg-white"
                      placeholder="e.g. 2012"
                    />
                  </div>

                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-bold text-slate-900 mb-1.5">Website</label>
                    <input 
                      type="url" 
                      value={form.website} onChange={(e) => setForm({...form, website: e.target.value})}
                      className="w-full h-11 rounded-xl border border-slate-200 bg-slate-50 px-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 focus:bg-white"
                      placeholder="https://acmecorp.com"
                    />
                  </div>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-sm font-bold text-slate-900 mb-1.5">Company Description</label>
                <textarea 
                  rows={4}
                  value={form.description} onChange={(e) => setForm({...form, description: e.target.value})}
                  className="w-full rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm font-medium text-slate-900 outline-none focus:ring-4 focus:ring-blue-100 focus:border-blue-300 focus:bg-white resize-none"
                  placeholder="Describe your company's mission, values, and what makes it a great place to work..."
                />
              </div>

              <div className="flex items-center justify-between border-t border-slate-100 pt-6 mt-2">
                {profile ? (
                  <button type="button" onClick={() => { setIsEditing(false); initForm(profile) }} className="h-11 px-6 rounded-xl font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors">
                    Cancel
                  </button>
                ) : <div/>}
                
                <button type="submit" className="h-11 px-8 rounded-xl font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-sm transition-colors cursor-pointer">
                  Save Profile
                </button>
              </div>
            </form>
          ) : (
            <div className="p-0">
              <div className="h-32 bg-slate-800 rounded-t-3xl relative">
                {/* Decorative header */}
              </div>
              <div className="px-6 md:px-10 pb-8 -mt-12 relative z-10">
                <div className="flex flex-col md:flex-row gap-6 md:items-end mb-6">
                  <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-white p-2 shadow-sm border border-slate-200 flex-shrink-0">
                    {profile.logo ? (
                      <img src={`${getApiBase()}${profile.logo}`} alt="Logo" className="w-full h-full object-contain rounded-xl" />
                    ) : (
                      <div className="w-full h-full bg-slate-100 rounded-xl flex items-center justify-center text-slate-400 font-bold text-xs text-center border border-dashed border-slate-300">No Logo</div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h2 className="text-3xl font-extrabold text-slate-900">{profile.companyName}</h2>
                    <p className="text-slate-600 font-medium mt-1">{profile.industry || 'Industry not specified'}</p>
                  </div>
                  <div className="flex gap-2 w-full md:w-auto">
                    {profile.website && (
                      <a href={profile.website} target="_blank" rel="noreferrer" className="h-10 px-4 inline-flex items-center justify-center rounded-xl font-bold text-blue-700 bg-blue-50 border border-blue-200 hover:bg-blue-100 transition-colors flex-1 md:flex-none">
                        Visit Website
                      </a>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Location</p>
                    <p className="font-bold text-slate-800">{profile.location || '—'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Company Size</p>
                    <p className="font-bold text-slate-800">{profile.companySize || '—'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Founded</p>
                    <p className="font-bold text-slate-800">{profile.foundedYear || '—'}</p>
                  </div>
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100">
                    <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Status</p>
                    <p className="font-bold text-emerald-600">Verified Profile</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-bold text-slate-900 mb-3">About the Company</h3>
                  <div className="prose prose-slate max-w-none prose-p:text-slate-600">
                    {profile.description ? (
                      <p className="whitespace-pre-wrap">{profile.description}</p>
                    ) : (
                      <p className="italic text-slate-400">No description provided.</p>
                    )}
                  </div>
                </div>

                <div className="mt-10 pt-6 border-t border-slate-100 flex justify-end">
                  <button onClick={handleDelete} className="text-xs font-bold text-red-600 hover:text-red-700 hover:underline">
                    Delete profile entirely
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default CompanyProfiles
