import express from 'express'
import Company from '../models/Company.js'
import { uploadImage } from '../middleware/imageUpload.js'

const router = express.Router()

// GET /api/companies/recruiter/:id -> get company profile
router.get('/recruiter/:id', async (req, res) => {
  try {
    const { id } = req.params
    const profile = await Company.findOne({ recruiterId: id })
    if (!profile) return res.status(404).json({ message: 'Profile not found' })
    return res.json(profile)
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch company profile' })
  }
})

// POST /api/companies -> create or completely overwrite a profile
router.post('/', (req, res) => {
  uploadImage(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ message: err.message || 'Logo upload failed' })

      const { recruiterId, companyName, industry, location, companySize, website, description, foundedYear } = req.body

      if (!recruiterId || !companyName) {
        return res.status(400).json({ message: 'recruiterId and companyName are required' })
      }

      // Check if one already exists for this recruiter
      let company = await Company.findOne({ recruiterId })

      const payload = {
        recruiterId,
        companyName,
        industry,
        location,
        companySize,
        website,
        description,
        foundedYear: foundedYear ? parseInt(foundedYear, 10) : undefined,
      }

      // If file uploaded, configure logo url
      if (req.file) {
        payload.logo = `/uploads/logos/${req.file.filename}`
      }

      if (company) {
        // Update existing instead of strictly throwing error
        company = await Company.findByIdAndUpdate(company._id, payload, { new: true })
      } else {
        company = await Company.create(payload)
      }

      return res.status(201).json(company)
    } catch (e) {
      return res.status(400).json({ message: e.message || 'Failed to save company profile' })
    }
  })
})

// PUT /api/companies/:id -> update profile
router.put('/:id', (req, res) => {
  uploadImage(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ message: err.message || 'Logo upload failed' })

      const { id } = req.params
      const { recruiterId, companyName, industry, location, companySize, website, description, foundedYear } = req.body

      let company = await Company.findById(id)
      if (!company) return res.status(404).json({ message: 'Company not found' })

      if (company.recruiterId !== recruiterId && recruiterId) {
        return res.status(403).json({ message: 'Unauthorized modification' })
      }

      const payload = {
        companyName,
        industry,
        location,
        companySize,
        website,
        description,
        foundedYear: foundedYear ? parseInt(foundedYear, 10) : undefined,
      }

      if (req.file) {
        payload.logo = `/uploads/logos/${req.file.filename}`
      }

      company = await Company.findByIdAndUpdate(id, payload, { new: true })
      return res.json(company)
    } catch (e) {
      return res.status(400).json({ message: e.message || 'Failed to update company profile' })
    }
  })
})

// DELETE /api/companies/:id -> delete profile
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { recruiterId } = req.body

    const company = await Company.findById(id)
    if (!company) return res.status(404).json({ message: 'Company not found' })

    if (company.recruiterId !== recruiterId && recruiterId) {
      return res.status(403).json({ message: 'Unauthorized deletion' })
    }

    await Company.findByIdAndDelete(id)
    return res.json({ message: 'Profile deleted successfully' })
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to delete company profile' })
  }
})

export default router
