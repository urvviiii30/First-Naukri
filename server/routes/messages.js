import express from 'express'
import Message from '../models/Message.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)

// GET /api/messages
router.get('/', async (req, res) => {
  try {
    const messages = await Message.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    return res.json(messages)
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch messages' })
  }
})

// PUT /api/messages/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params
    const msg = await Message.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { read: true },
      { new: true }
    )
    if (!msg) {
      return res.status(404).json({ message: 'Message not found' })
    }
    return res.json(msg)
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to update message' })
  }
})

// PUT /api/messages/read-all
router.put('/read-all', async (req, res) => {
  try {
    await Message.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    )
    return res.json({ message: 'All messages marked as read' })
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to mark all as read' })
  }
})

export default router
