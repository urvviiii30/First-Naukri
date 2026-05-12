import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['student', 'recruiter'], required: true },
    phone: { type: String, trim: true, default: '' },
    location: { type: String, trim: true, default: '' },
    bio: { type: String, trim: true, default: '' },
    profilePicture: { type: String, default: '' },
    notifications: {
      email: { type: Boolean, default: true },
      jobAlerts: { type: Boolean, default: true },
      updates: { type: Boolean, default: true }
    },
    skills: { type: [String], default: [] },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    education: [{
      degree: { type: String },
      institution: { type: String },
      year: { type: String }
    }],
    projects: [{
      title: { type: String },
      link: { type: String },
      description: { type: String },
      techStack: { type: String }
    }],
    certifications: [{
      title: { type: String },
      issuer: { type: String },
      date: { type: String }
    }],
    socialLinks: {
      github: { type: String, default: '' },
      linkedin: { type: String, default: '' }
    },
    preferences: {
      role: { type: String, default: '' },
      jobType: { type: String, default: '' },
      location: { type: String, default: '' }
    },
    resumePath: { type: String, default: '' }
  },
  { timestamps: true }
)

// Pre-save hook to hash passenger using bcryptjs
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return
  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

// Helper method to compare passwords
userSchema.methods.comparePassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password)
}

export default mongoose.model('User', userSchema)
