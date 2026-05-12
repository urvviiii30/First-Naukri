import express from 'express'
import Job from '../models/Job.js'

const router = express.Router()

// POST /api/jobs - Recruiter posts a job
router.post('/', async (req, res) => {
  try {
    const { title, company, location, salary, jobType, skills, description, postedBy } = req.body

    const job = await Job.create({
      title,
      company,
      location,
      salary,
      jobType,
      skills: Array.isArray(skills) ? skills : String(skills || '')
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      description,
      postedBy,
    })

    return res.status(201).json(job)
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to create job' })
  }
})

// GET /api/jobs - return all jobs (for students)
router.get('/', async (req, res) => {
  try {
    const jobs = await Job.find().sort({ createdAt: -1 }).lean()
    return res.json(jobs)
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Failed to fetch jobs' })
  }
})

// GET /api/jobs/:recruiterId - return jobs posted by a recruiter
router.get('/:recruiterId', async (req, res) => {
  try {
    const { recruiterId } = req.params
    const jobs = await Job.find({ postedBy: recruiterId }).sort({ createdAt: -1 }).lean()
    return res.json(jobs)
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Failed to fetch recruiter jobs' })
  }
})

// PATCH /api/jobs/:id - Update full job contents
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { recruiterId, ...updateData } = req.body

    const job = await Job.findById(id)
    if (!job) return res.status(404).json({ message: 'Job not found' })
    if (job.postedBy !== recruiterId && recruiterId) {
      return res.status(403).json({ message: 'Unauthorized to update this job' })
    }

    if (updateData.skills && typeof updateData.skills === 'string') {
      updateData.skills = updateData.skills.split(',').map((s) => s.trim()).filter(Boolean)
    }

    const updatedJob = await Job.findByIdAndUpdate(id, updateData, { new: true })
    return res.json(updatedJob)
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to update job' })
  }
})

// PATCH /api/jobs/:id/status - Toggle active/closed quickly
router.patch('/:id/status', async (req, res) => {
  try {
    const { id } = req.params
    const { recruiterId, status } = req.body
    
    if (!['Active', 'Closed'].includes(status)) {
       return res.status(400).json({ message: 'Invalid status' })
    }

    const job = await Job.findById(id)
    if (!job) return res.status(404).json({ message: 'Job not found' })
    if (job.postedBy !== recruiterId && recruiterId) {
      return res.status(403).json({ message: 'Unauthorized to update this job' })
    }

    job.status = status
    await job.save()
    return res.json(job)
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to update job status' })
  }
})

// DELETE /api/jobs/:id - Delete job
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { recruiterId } = req.body

    const job = await Job.findById(id)
    if (!job) return res.status(404).json({ message: 'Job not found' })
    if (job.postedBy !== recruiterId && recruiterId) {
      return res.status(403).json({ message: 'Unauthorized to delete this job' })
    }

    await Job.findByIdAndDelete(id)
    return res.json({ message: 'Job deleted successfully' })
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to delete job' })
  }
})

export default router

