import mongoose from 'mongoose'

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  company: { type: String, required: true, trim: true },
  location: { type: String, required: true, trim: true },
  salary: { type: String, required: true, trim: true },
  jobType: { type: String, required: true, trim: true },
  skills: { type: [String], default: [] },
  description: { type: String, required: true, trim: true },
  postedBy: { type: String, required: true, index: true }, // recruiterId
  status: { type: String, enum: ['Active', 'Closed'], default: 'Active', index: true },
  createdAt: { type: Date, default: Date.now },
})

export default mongoose.model('Job', jobSchema)

