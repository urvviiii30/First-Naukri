import fs from 'fs'
import path from 'path'
import multer from 'multer'

const uploadDir = path.join(process.cwd(), 'uploads', 'resumes')

function ensureDir() {
  fs.mkdirSync(uploadDir, { recursive: true })
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    ensureDir()
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const safeOriginal = file.originalname.replace(/[^a-zA-Z0-9._-]/g, '_')
    const unique = `${Date.now()}-${Math.random().toString(16).slice(2)}`
    cb(null, `${unique}-${safeOriginal}`)
  },
})

function fileFilter(req, file, cb) {
  const isPdf = file.mimetype === 'application/pdf' || file.originalname.toLowerCase().endsWith('.pdf')
  if (!isPdf) return cb(new Error('Only PDF resumes are allowed'))
  cb(null, true)
}

export const uploadResume = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
}).single('resume')

