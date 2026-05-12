import jwt from 'jsonwebtoken'
import User from '../models/User.js'

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development'

// Middleware to protect routes that require any logged-in user
export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: 'Authentication required' })
    }

    const token = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, JWT_SECRET)

    const user = await User.findById(decoded.id).select('-password')
    if (!user) {
      return res.status(401).json({ message: 'User not found' })
    }

    req.user = user // attach user object to the request
    next()
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ message: 'Session expired. Please login again.' })
    }
    return res.status(401).json({ message: 'Invalid token' })
  }
}

// Middleware specifically for recruiter features
export const requireRecruiter = (req, res, next) => {
  if (!req.user || req.user.role !== 'recruiter') {
    return res.status(403).json({ message: 'Access denied. Recruiter only.' })
  }
  next()
}

// Middleware specifically for student features
export const requireStudent = (req, res, next) => {
  if (!req.user || req.user.role !== 'student') {
    return res.status(403).json({ message: 'Access denied. Student only.' })
  }
  next()
}
