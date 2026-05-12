import mongoose from 'mongoose'

export const APPLICATION_STATUSES = [
  'Applied',
  'Shortlisted',
  'Interview Scheduled',
  'Rejected',
  'Hired',
]

const applicationSchema = new mongoose.Schema(
  {
    studentId: { type: String, required: true, index: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true, index: true },
    resumeUrl: { type: String, required: true },
    status: { type: String, enum: APPLICATION_STATUSES, default: 'Applied', index: true },
    // Optional denormalized fields to make UI useful without a full User model.
    studentName: { type: String, default: '' },
    studentEmail: { type: String, default: '' },
  },
  { timestamps: true },
)

export default mongoose.model('Application', applicationSchema)

