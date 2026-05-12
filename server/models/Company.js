import mongoose from 'mongoose'

const companySchema = new mongoose.Schema(
  {
    recruiterId: { type: String, required: true, index: true },
    companyName: { type: String, required: true, trim: true },
    industry: { type: String, trim: true },
    location: { type: String, trim: true },
    companySize: { type: String, trim: true },
    website: { type: String, trim: true },
    description: { type: String, trim: true },
    foundedYear: { type: Number },
    logo: { type: String }, // e.g. "/uploads/logos/..."
  },
  { timestamps: true }
)

export default mongoose.model('Company', companySchema)
