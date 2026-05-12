import express from 'express'
import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { requireAuth } from '../middleware/auth.js'

console.log("Auth routes loaded");

const router = express.Router()
const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_for_development'

// REGISTER
router.post('/register', async (req, res) => {
  console.log("REGISTER HIT");
  console.log("BODY:", req.body);

  try {
    const { name, email, password, role } = req.body

    if (!name || !email || !password || !role) {
      return res.status(400).json({ message: 'All fields are required' })
    }

    if (!['student', 'recruiter'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' })
    }

    const existingUser = await User.findOne({ email: email.toLowerCase() })
    if (existingUser) {
      return res.status(400).json({ message: 'Email is already registered' })
    }

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password,
      role
    })

    const token = jwt.sign(
      { id: user._id, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    )

    const userResponse = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    }

    return res.status(201).json({ token, user: userResponse })

  } catch (err) {
    console.log("====== REGISTER ERROR START ======");
    console.log(err);
    console.log(err.message);
    console.log(err.code);
    console.log("====== REGISTER ERROR END ======");

    return res.status(500).json({ message: 'Failed to register user' })
  }
})

// LOGIN
router.post('/login', async (req, res) => {
    try {
      const { email, password, role } = req.body

      if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' })
      }

      const user = await User.findOne({ email: email.toLowerCase() })
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      if (role && user.role !== role) {
        return res.status(403).json({
          message: `Account exists, but it is registered as a ${user.role}.`
        })
      }

      const isMatch = await user.comparePassword(password)
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' })
      }

      const token = jwt.sign(
        { id: user._id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' }
      )

      const userResponse = {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role
      }

      return res.json({ token, user: userResponse })

    } catch (err) {
      console.error("LOGIN ERROR:", err)
      return res.status(500).json({ message: 'Login failed' })
    }
  })

  // PROTECTED ROUTE
  router.get('/me', requireAuth, (req, res) => {
    return res.json({ user: req.user })
  })

export default router