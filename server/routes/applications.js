import express from 'express'
import Application, { APPLICATION_STATUSES } from '../models/Application.js'
import Job from '../models/Job.js'
import { uploadResume } from '../middleware/resumeUpload.js'
import Notification from '../models/Notification.js'
import Message from '../models/Message.js'
import mongoose from 'mongoose'

const router = express.Router()

// POST /api/applications - Student applies to a job with resume (PDF)
router.post('/', (req, res) => {
  uploadResume(req, res, async (err) => {
    try {
      if (err) return res.status(400).json({ message: err.message || 'Resume upload failed' })

      const { studentId, jobId, studentName = '', studentEmail = '' } = req.body
      if (!req.file) return res.status(400).json({ message: 'Resume (PDF) is required' })

      const job = await Job.findById(jobId).lean()
      if (!job) return res.status(404).json({ message: 'Job not found' })

      const resumeUrl = `/uploads/resumes/${req.file.filename}`

      const application = await Application.create({
        studentId,
        jobId,
        resumeUrl,
        status: 'Applied',
        studentName,
        studentEmail,
      })

      // Notification + Message for the student
      try {
        if (mongoose.Types.ObjectId.isValid(studentId)) {
          await Notification.create({
            userId: studentId,
            title: 'Application Submitted',
            message: `You have successfully applied for "${job.title}" at ${job.company || 'a company'}.`,
            type: 'application',
            relatedId: application._id
          })
          await Message.create({
            userId: studentId,
            title: 'Application Submitted',
            body: `Your application for "${job.title}" at ${job.company || 'a company'} has been received. You will be notified when the recruiter reviews it.`,
            type: 'application',
            relatedId: application._id
          })
        }
      } catch (notifErr) {
        console.error('Failed to create student notification/message on apply:', notifErr)
      }

      // Notification + Message for the recruiter
      try {
        if (job.postedBy && mongoose.Types.ObjectId.isValid(job.postedBy)) {
          await Notification.create({
            userId: job.postedBy,
            title: 'New Application Received',
            message: `${studentName || 'A student'} applied for "${job.title}".`,
            type: 'application',
            relatedId: application._id
          })
          await Message.create({
            userId: job.postedBy,
            title: 'New Application Received',
            body: `${studentName || 'A student'} (${studentEmail || 'no email'}) has applied for your job "${job.title}". Review their application in the Applicants section.`,
            type: 'application',
            relatedId: application._id
          })
        }
      } catch (notifErr) {
        console.error('Failed to create recruiter notification/message on apply:', notifErr)
      }

      return res.status(201).json(application)
    } catch (e) {
      return res.status(400).json({ message: e.message || 'Failed to apply' })
    }
  })
})

// GET /api/applications/job/:jobId - Recruiter views applicants for a specific job
router.get('/job/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params
    const apps = await Application.find({ jobId })
      .sort({ createdAt: -1 })
      .populate('jobId')
      .lean()
    return res.json(apps)
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Failed to fetch applicants' })
  }
})

// GET /api/applications/student/:studentId - Student sees their applications
router.get('/student/:studentId', async (req, res) => {
  try {
    const { studentId } = req.params
    const apps = await Application.find({ studentId })
      .sort({ createdAt: -1 })
      .populate('jobId')
      .lean()
    return res.json(apps)
  } catch (e) {
    return res.status(500).json({ message: e.message || 'Failed to fetch student applications' })
  }
})

// PUT /api/applications/:id - Recruiter updates application status
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const { status } = req.body

    if (!APPLICATION_STATUSES.includes(status)) {
      return res.status(400).json({ message: `Invalid status. Use: ${APPLICATION_STATUSES.join(', ')}` })
    }

    const updated = await Application.findByIdAndUpdate(
      id,
      { status },
      { new: true },
    )
      .populate('jobId')

    if (!updated) return res.status(404).json({ message: 'Application not found' })

    const jobTitle = updated.jobId?.title || 'a job'

    // Notification + Message for the student
    try {
      if (mongoose.Types.ObjectId.isValid(updated.studentId)) {
        await Notification.create({
          userId: updated.studentId,
          title: 'Application Update',
          message: `Your application for "${jobTitle}" is now: ${status}.`,
          type: 'application',
          relatedId: updated._id
        })
        await Message.create({
          userId: updated.studentId,
          title: `Application ${status}`,
          body: `Your application for "${jobTitle}" has been updated to "${status}". ${status === 'Shortlisted' ? 'Congratulations! The recruiter is interested.' : status === 'Rejected' ? 'Don\'t worry, keep applying to other opportunities!' : 'Check your dashboard for details.'}`,
          type: 'application',
          relatedId: updated._id
        })
      }
    } catch (notifErr) {
      console.error('Failed to create notification/message on status update:', notifErr)
    }

    return res.json(updated)
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to update status' })
  }
})

export default router


