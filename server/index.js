import path from 'path'
import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'
import { connectDb } from './config/db.js'
import jobsRouter from './routes/jobs.js'
import applicationsRouter from './routes/applications.js'
import resumeRouter from './routes/resume.js'
import authRouter from './routes/auth.js'
import interviewsRouter from './routes/interviews.js'
import companiesRouter from './routes/companies.js'
import userSettingsRouter from './routes/userSettings.js'
import notificationsRouter from './routes/notifications.js'
import messagesRouter from './routes/messages.js'

dotenv.config()
const mongoUri = process.env.MONGO_URI
console.log("Mongo URI:", process.env.MONGO_URI);
const app = express()
const PORT = process.env.PORT || 5000

app.post('/test', (req, res) => {
  res.send('Test route working')
})

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps or curl requests)
    // and dynamically allow all frontend origins for local dev
    callback(null, true);
  },
  credentials: true,
}))
app.use(express.json({ limit: '1mb' }))

app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')))

app.get('/api/health', (req, res) => res.json({ ok: true }))
app.use('/api/auth', authRouter)
app.use('/api/jobs', jobsRouter)
app.use('/api/applications', applicationsRouter)
app.use('/api/resume', resumeRouter)
app.use('/api/interviews', interviewsRouter)
app.use('/api/companies', companiesRouter)
app.use('/api/user', userSettingsRouter)
app.use('/api/notifications', notificationsRouter)
app.use('/api/messages', messagesRouter)

app.use((err, req, res, _next) => {
  void _next
  console.error(err)
  res.status(500).json({ message: 'Server error' })
})

async function start() {
  const mongoUri = process.env.MONGO_URI
  try {
    await connectDb(mongoUri)
    console.log('Connected to MongoDB')
  } catch (e) {
    console.error('Failed to connect to MongoDB, continuing without DB:', e.message)
  }

  app.listen(PORT, () => {
    console.log(`API running on port ${PORT}`)
  })
}

start().catch((e) => {
  console.error('Unexpected error while starting server:', e.message)
})