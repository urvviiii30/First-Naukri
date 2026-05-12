import mongoose from 'mongoose'

const interviewSchema = new mongoose.Schema(
  {
    recruiterId: { type: String, required: true, index: true },
    applicationId: { type: mongoose.Schema.Types.ObjectId, ref: 'Application', required: true, index: true },
    jobId: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    
    // Denormalized fields to avoid needing deep populations on large table loads
    candidateName: { type: String, required: true },
    jobTitle: { type: String, required: true },
    
    date: { type: String, required: true }, // e.g., "YYYY-MM-DD"
    time: { type: String, required: true }, // e.g., "14:30"
    mode: { type: String, enum: ['Video', 'Phone', 'On-site'], required: true },
    
    status: { 
      type: String, 
      enum: ['Scheduled', 'Completed', 'Cancelled'], 
      default: 'Scheduled',
      index: true 
    },
  },
  { timestamps: true }
)

export default mongoose.model('Interview', interviewSchema)
