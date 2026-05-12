import fs from 'fs'
import path from 'path'
import multer from 'multer'

const uploadDir = path.join(process.cwd(), 'uploads', 'avatars')

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
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp']
  const isImage = allowedTypes.includes(file.mimetype)
  if (!isImage) {
    return cb(new Error('Only JPEG, PNG, or WEBP images are allowed for avatars'))
  }
  cb(null, true)
}

export const uploadAvatar = multer({
  storage,
  fileFilter,
  limits: { fileSize: 2 * 1024 * 1024 }, // 2MB
}).single('profilePicture')
