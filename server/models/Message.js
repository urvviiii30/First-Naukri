import mongoose from 'mongoose'

const messageSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    body: { type: String, required: true },
    type: { type: String, enum: ['application', 'interview', 'system'], default: 'system' },
    read: { type: Boolean, default: false },
    relatedId: { type: mongoose.Schema.Types.ObjectId }
  },
  { timestamps: true }
)

export default mongoose.model('Message', messageSchema)
