import express from 'express'
import Notification from '../models/Notification.js'
import { requireAuth } from '../middleware/auth.js'

const router = express.Router()

router.use(requireAuth)

// GET /api/notifications
router.get('/', async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean()
    
    return res.json(notifications)
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to fetch notifications' })
  }
})

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req, res) => {
  try {
    const { id } = req.params
    const notification = await Notification.findOneAndUpdate(
      { _id: id, userId: req.user.id },
      { read: true },
      { new: true }
    )
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' })
    }
    return res.json(notification)
  } catch (err) {
    return res.status(400).json({ message: err.message || 'Failed to update notification' })
  }
})

// PUT /api/notifications/read-all
router.put('/read-all', async (req, res) => {
  try {
    await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    )
    return res.json({ message: 'All notifications marked as read' })
  } catch (err) {
    return res.status(500).json({ message: err.message || 'Failed to mark all as read' })
  }
})

export default router
