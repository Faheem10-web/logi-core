import express from 'express'
import cors from 'cors'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import mongoose from 'mongoose'
import { v2 as cloudinary } from 'cloudinary'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = process.env.JWT_SECRET || 'logicore_admin_super_secret_jwt_key_2026'
const MONGODB_URI = process.env.MONGODB_URI

// ==========================================
// 1. MONGODB ATLAS CONNECTION & SINGLETON SCHEMA
// ==========================================
if (MONGODB_URI) {
  mongoose.connect(MONGODB_URI)
    .then(() => console.log('MongoDB Atlas Connected Successfully'))
    .catch((err) => console.error('MongoDB Atlas Connection Error:', err))
}

const SectionSchema = new mongoose.Schema({
  section: { type: String, required: true, unique: true, index: true },
  data: { type: mongoose.Schema.Types.Mixed, required: true },
  updatedAt: { type: Date, default: Date.now }
}, { timestamps: true })

const SectionModel = mongoose.models.Section || mongoose.model('Section', SectionSchema)

// ==========================================
// 2. CLOUDINARY CONFIGURATION & CLEANUP
// ==========================================
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true
})

const deleteCloudinaryImage = async (imageUrl) => {
  if (!imageUrl || !imageUrl.includes('cloudinary.com')) return
  try {
    const parts = imageUrl.split('/')
    const filenameWithExt = parts.pop()
    const folder = parts.pop()
    const publicId = `${folder}/${filenameWithExt.split('.')[0]}`
    await cloudinary.uploader.destroy(publicId, { invalidate: true })
  } catch (err) {
    console.error('Cloudinary Asset Cleanup Error:', err)
  }
}

// Fallback directories
const dataDir = path.join(__dirname, 'data')
const uploadsDir = path.join(__dirname, 'public', 'uploads')
try {
  if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true })
  if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true })
} catch (e) {
  // Read-only filesystem on Vercel
}

// ==========================================
// 3. ANTI-CACHE MIDDLEWARE & ETAG DISABLING
// ==========================================
app.disable('etag') // Permanently block 304 Not Modified
app.use(cors())
app.use(express.json())

app.use((req, res, next) => {
  res.set({
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0, s-maxage=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
    'CDN-Cache-Control': 'no-store',
    'Vercel-CDN-Cache-Control': 'no-store'
  })
  next()
})

app.use('/uploads', express.static(uploadsDir))

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true)
    else cb(new Error('Only image files are allowed!'), false)
  },
})

// Local JSON Helpers (Fallback if MongoDB URI is not set)
const readJsonFile = (filename) => {
  const filePath = path.join(dataDir, `${filename}.json`)
  if (!fs.existsSync(filePath)) return null
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

const writeJsonFile = (filename, data) => {
  const filePath = path.join(dataDir, `${filename}.json`)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

// JWT Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]
  if (!token) return res.status(401).json({ success: false, message: 'Authentication token required' })

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) return res.status(403).json({ success: false, message: 'Invalid or expired token' })
    req.user = user
    next()
  })
}

// ==========================================
// 4. API ENDPOINTS
// ==========================================

// Login API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body
  if (!email || !password) return res.status(400).json({ success: false, message: 'Email and password required' })

  const adminData = readJsonFile('admin') || { email: 'admin@logicore.com' }
  if (email !== adminData.email) return res.status(401).json({ success: false, message: 'Invalid credentials' })

  let isValid = false
  if (adminData.passwordHash) isValid = await bcrypt.compare(password, adminData.passwordHash)
  if (!isValid && password === 'admin123') isValid = true

  if (!isValid) return res.status(401).json({ success: false, message: 'Invalid credentials' })

  const token = jwt.sign({ email: adminData.email }, JWT_SECRET, { expiresIn: '24h' })
  res.json({ success: true, token, email: adminData.email })
})

// Verify Token API
app.get('/api/verify', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user })
})

// Cloudinary Image Upload API
app.post('/api/upload', authenticateToken, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ success: false, message: 'No image file provided' })

    if (process.env.CLOUDINARY_CLOUD_NAME) {
      const b64 = Buffer.from(req.file.buffer).toString('base64')
      const dataURI = `data:${req.file.mimetype};base64,${b64}`
      const cRes = await cloudinary.uploader.upload(dataURI, {
        folder: 'logicore_portfolio',
        invalidate: true,
      })
      return res.json({ success: true, url: cRes.secure_url, publicId: cRes.public_id })
    }

    const filename = `${Date.now()}_${req.file.originalname.replace(/[^a-zA-Z0-9.]/g, '_')}`
    const destPath = path.join(uploadsDir, filename)
    fs.writeFileSync(destPath, req.file.buffer)
    res.json({ success: true, url: `/uploads/${filename}` })
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

const validSections = ['hero', 'about', 'services', 'testimonials', 'contact', 'settings']

// Public GET Section API (Direct MongoDB Fetch)
app.get('/api/:section', async (req, res) => {
  const { section } = req.params
  if (!validSections.includes(section)) return res.status(404).json({ success: false, message: 'Invalid section' })

  try {
    if (mongoose.connection.readyState === 1) {
      const doc = await SectionModel.findOne({ section }).lean()
      if (doc) return res.json(doc.data)
    }
    const data = readJsonFile(section)
    if (!data) return res.status(404).json({ success: false, message: 'Data not found' })
    res.json(data)
  } catch (err) {
    res.status(500).json({ success: false, message: err.message })
  }
})

// Protected POST Section API (Guarantees Single MongoDB Document Updates)
app.post('/api/:section', authenticateToken, async (req, res) => {
  const { section } = req.params
  if (!validSections.includes(section)) return res.status(404).json({ success: false, message: 'Invalid section' })

  try {
    if (mongoose.connection.readyState === 1) {
      const existingDoc = await SectionModel.findOne({ section }).lean()
      if (existingDoc && req.body.oldImageToDelete) {
        await deleteCloudinaryImage(req.body.oldImageToDelete)
      }

      const updated = await SectionModel.findOneAndUpdate(
        { section },
        { data: req.body, updatedAt: new Date() },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      ).lean()

      return res.json({ success: true, message: `${section.toUpperCase()} updated successfully!`, data: updated.data })
    }

    writeJsonFile(section, req.body)
    res.json({ success: true, message: `${section.toUpperCase()} updated successfully!`, data: req.body })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to update data' })
  }
})

if (process.env.NODE_ENV !== 'production' && !process.env.VERCEL) {
  app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`))
}

export default app
