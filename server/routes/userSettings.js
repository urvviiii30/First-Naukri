import express from 'express'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'
import { uploadAvatar } from '../middleware/avatarUpload.js'

const router = express.Router()

// All routes require authentication
router.use(requireAuth)

// GET /api/user/profile -> Get current full logged-in user profile
router.get('/profile', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password')
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json(user)
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch user profile' })
  }
})

// PUT /api/user/profile -> Update personal info + optional avatar upload
router.put('/profile', (req, res) => {
  uploadAvatar(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ message: err.message || 'Avatar upload failed' })

      const { name, phone, bio } = req.body
      const payload = {}
      
      if (name) payload.name = name
      if (phone !== undefined) payload.phone = phone
      if (req.body.location !== undefined) payload.location = req.body.location
      if (bio !== undefined) payload.bio = bio
      
      if (req.body.skills) {
        try { payload.skills = JSON.parse(req.body.skills) } catch { payload.skills = req.body.skills }
      }
      if (req.body.education) {
        try { payload.education = JSON.parse(req.body.education) } catch { payload.education = req.body.education }
      }
      if (req.body.projects) {
        try { payload.projects = JSON.parse(req.body.projects) } catch { payload.projects = req.body.projects }
      }
      if (req.body.certifications) {
        try { payload.certifications = JSON.parse(req.body.certifications) } catch { payload.certifications = req.body.certifications }
      }
      if (req.body.socialLinks) {
        try { payload.socialLinks = JSON.parse(req.body.socialLinks) } catch { payload.socialLinks = req.body.socialLinks }
      }
      if (req.body.preferences) {
        try { payload.preferences = JSON.parse(req.body.preferences) } catch { payload.preferences = req.body.preferences }
      }
      if (req.body.resumePath !== undefined) {
        payload.resumePath = req.body.resumePath
      }
      
      if (req.file) {
        payload.profilePicture = `/uploads/avatars/${req.file.filename}`
      }

      const updatedUser = await User.findByIdAndUpdate(req.user.id, payload, { new: true }).select('-password')
      if (!updatedUser) return res.status(404).json({ message: 'User not found' })

      return res.json(updatedUser)
    } catch (e) {
      return res.status(500).json({ message: e.message || 'Failed to update profile' })
    }
  })
})

// GET /api/user/saved-jobs
router.get('/saved-jobs', async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate('savedJobs')
    if (!user) return res.status(404).json({ message: 'User not found' })
    return res.json(user.savedJobs)
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch saved jobs' })
  }
})

// POST /api/user/saved-jobs/:jobId
router.post('/saved-jobs/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const index = user.savedJobs.indexOf(jobId)
    if (index > -1) {
      user.savedJobs.splice(index, 1) // Unsave
    } else {
      user.savedJobs.push(jobId) // Save
    }
    await user.save()
    return res.json(user.savedJobs)
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to toggle saved job' })
  }
})

// GET /api/user/profile-completion
router.get('/profile-completion', async (req, res) => {
  try {
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const suggestions = []
    let score = 0
    const checks = {}

    // 1. Basic Info (10%)
    const basicFields = [user.name, user.email, user.phone, user.location, user.profilePicture]
    const basicCompleted = basicFields.filter(f => !!f && String(f).trim().length > 0).length
    score += (basicCompleted / 5) * 10
    checks.basicInfo = basicCompleted === 5
    if (basicCompleted < 5) suggestions.push('Complete your basic info (phone, location, profile photo)')

    // 2. Education (15%)
    const hasEdu = user.education && user.education.length > 0 && user.education[0].institution
    if (hasEdu) {
      score += 15
      checks.education = true
    } else {
      checks.education = false
      suggestions.push('Add your educational background')
    }

    // 3. Skills (15%) - minimum 5
    const skillsCount = user.skills?.length || 0
    if (skillsCount >= 5) {
      score += 15
      checks.skills = true
    } else {
      score += (skillsCount / 5) * 15
      checks.skills = false
      suggestions.push(`Add at least ${5 - skillsCount} more skills`)
    }

    // 4. Resume (15%)
    if (user.resumePath) {
      score += 15
      checks.resume = true
    } else {
      checks.resume = false
      suggestions.push('Upload your PDF resume')
    }

    // 5. Projects (20%) - minimum 1
    const projectsCount = user.projects?.length || 0
    if (projectsCount >= 1) {
      score += 20
      checks.projects = true
    } else {
      checks.projects = false
      suggestions.push('Add at least 1 project highlighting your work')
    }

    // 6. Certifications (10%)
    if (user.certifications && user.certifications.length > 0 && user.certifications[0].title) {
      score += 10
      checks.certifications = true
    } else {
      checks.certifications = false
      suggestions.push('Add certifications to validate your skills')
    }

    // 7. Social Links (5%)
    const hasSocial = user.socialLinks && (user.socialLinks.github || user.socialLinks.linkedin)
    if (hasSocial) {
      score += 5
      checks.socialLinks = true
    } else {
      checks.socialLinks = false
      suggestions.push('Link your GitHub or LinkedIn profile')
    }

    // 8. Career Preferences (5%)
    const hasPrefs = user.preferences && user.preferences.role
    if (hasPrefs) {
      score += 5
      checks.preferences = true
    } else {
      checks.preferences = false
      suggestions.push('Update your career preferences (role, job type)')
    }

    // 9. Bio/Summary (5%)
    if (user.bio && user.bio.trim().length > 0) {
      score += 5
      checks.bio = true
    } else {
      checks.bio = false
      suggestions.push('Write a short bio or professional summary')
    }

    return res.json({ 
      percentage: Math.round(score), 
      checks, 
      suggestions 
    })
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to calculate profile completion' })
  }
})

// PUT /api/user/change-password -> Requires proper current password
router.put('/change-password', async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ message: 'Both current and new passwords are required' })
    }

    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    const isMatch = await user.comparePassword(currentPassword)
    if (!isMatch) {
      return res.status(401).json({ message: 'Current password is incorrect' })
    }

    user.password = newPassword // Will trigger pre-save hook for bcrypt
    await user.save()

    return res.json({ message: 'Password updated successfully' })
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to change password' })
  }
})

// PUT /api/user/settings/notifications -> Quick toggle settings
router.put('/settings/notifications', async (req, res) => {
  try {
    const { email, jobAlerts, updates } = req.body
    
    const user = await User.findById(req.user.id)
    if (!user) return res.status(404).json({ message: 'User not found' })

    if (email !== undefined) user.notifications.email = email
    if (jobAlerts !== undefined) user.notifications.jobAlerts = jobAlerts
    if (updates !== undefined) user.notifications.updates = updates

    await user.save()
    return res.json(user.notifications)
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to update notifications' })
  }
})

// DELETE /api/user/delete-account -> Nukes account completely
router.delete('/delete-account', async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id)
    return res.json({ message: 'Account permanently deleted' })
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to delete account' })
  }
})

export default router
