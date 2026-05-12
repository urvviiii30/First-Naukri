import express from 'express'
import Interview from '../models/Interview.js'
import Application from '../models/Application.js'
import Notification from '../models/Notification.js'
import Message from '../models/Message.js'
import mongoose from 'mongoose'

const router = express.Router()

// GET /api/interviews/recruiter/:recruiterId
// Get all interviews scheduled by a specific recruiter
router.get('/recruiter/:recruiterId', async (req, res) => {
  try {
    const { recruiterId } = req.params
    const interviews = await Interview.find({ recruiterId })
      .sort({ date: 1, time: 1 })
      .lean()
    return res.json(interviews)
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch interviews' })
  }
})

// GET /api/interviews/student/:studentId
// Get all interviews for a specific student (by finding their applications first)
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params
    // Find all applications for this student
    const applications = await Application.find({ studentId }).select('_id')
    const applicationIds = applications.map(app => app._id)

    const interviews = await Interview.find({ applicationId: { $in: applicationIds } })
      .sort({ date: 1, time: 1 })
      .lean()
    return res.json(interviews)
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch student interviews' })
  }
})

// POST /api/interviews
// Schedule a new interview
router.post('/', async (req, res) => {
  try {
    const { recruiterId, applicationId, jobId, candidateName, jobTitle, date, time, mode } = req.body

    if (!applicationId || !jobId || !date || !time || !mode) {
      return res.status(400).json({ message: 'Missing required interview fields' })
    }

    const interview = await Interview.create({
      recruiterId: recruiterId || 'recruiter-1', // Fallback for simple prototype logic
      applicationId,
      jobId,
      candidateName,
      jobTitle,
      date,
      time,
      mode,
      status: 'Scheduled',
    })

    // Automatically update the application status to reflect it's scheduled
    await Application.findByIdAndUpdate(applicationId, { status: 'Interview Scheduled' })

    const app = await Application.findById(applicationId)
    if (app && mongoose.Types.ObjectId.isValid(app.studentId)) {
      try {
        await Notification.create({
          userId: app.studentId,
          title: 'Interview Scheduled',
          message: `An interview for "${jobTitle}" has been scheduled on ${date} at ${time} (${mode}).`,
          type: 'interview',
          relatedId: interview._id
        })
        await Message.create({
          userId: app.studentId,
          title: 'Interview Scheduled',
          body: `Great news! An interview for "${jobTitle}" has been scheduled on ${date} at ${time} via ${mode}. Please be prepared and on time. Good luck!`,
          type: 'interview',
          relatedId: interview._id
        })
      } catch (e) {
        console.error('Failed to create notification/message', e)
      }
    }

    return res.status(201).json(interview)
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to schedule interview' })
  }
})

// PUT /api/interviews/:id
// Update interview (e.g. status transition, reschedule)
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const updateData = req.body

    const updated = await Interview.findByIdAndUpdate(id, updateData, { new: true })
    if (!updated) {
      return res.status(404).json({ message: 'Interview not found' })
    }

    // If marked as completed, update application status maybe? 
    // Usually it stays 'Interview Scheduled' until 'Hired' or 'Rejected', but for completeness:
    if (updateData.status === 'Completed') {
       // Optional: We won't automatically hire/reject here automatically. 
       // The recruiter must explicitly hire from the dashboard.
    }

    return res.json(updated)
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to update interview' })
  }
})

// DELETE /api/interviews/:id
// Delete an interview completely
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Interview.findByIdAndDelete(id)
    if (!deleted) {
      return res.status(404).json({ message: 'Interview not found' })
    }
    return res.json({ message: 'Interview cancelled/removed' })
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to delete interview' })
  }
})

export default router
