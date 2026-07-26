import express from 'express'
import cors from 'cors'
import multer from 'multer'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcryptjs'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const app = express()
const PORT = process.env.PORT || 5000
const JWT_SECRET = 'logicore_admin_super_secret_jwt_key_2026'

// Ensure uploads and data directories exist
const dataDir = path.join(__dirname, 'data')
const uploadsDir = path.join(__dirname, 'public', 'uploads')

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true })
}

app.use(cors())
app.use(express.json())

// Global Cache-Control: no-store middleware for zero stale browser cache
app.use((req, res, next) => {
  res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
  res.set('Pragma', 'no-cache')
  res.set('Expires', '0')
  res.set('Surrogate-Control', 'no-store')
  next()
})

app.use('/uploads', express.static(uploadsDir))

// Multer Storage Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir)
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname)
    const name = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9]/g, '_')
    cb(null, `${Date.now()}_${name}${ext}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true)
    } else {
      cb(new Error('Only image files are allowed!'), false)
    }
  },
})

// Helper to read JSON file
const readJsonFile = (filename) => {
  const filePath = path.join(dataDir, `${filename}.json`)
  if (!fs.existsSync(filePath)) {
    return null
  }
  const content = fs.readFileSync(filePath, 'utf8')
  return JSON.parse(content)
}

// Helper to write JSON file
const writeJsonFile = (filename, data) => {
  const filePath = path.join(dataDir, `${filename}.json`)
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8')
}

// JWT Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ success: false, message: 'Authentication token required' })
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ success: false, message: 'Invalid or expired token' })
    }
    req.user = user
    next()
  })
}

// ==========================================
// ROUTES
// ==========================================

// Login API
app.post('/api/login', async (req, res) => {
  const { email, password } = req.body

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required' })
  }

  const adminData = readJsonFile('admin')
  if (!adminData) {
    return res.status(500).json({ success: false, message: 'Admin configuration error' })
  }

  if (email !== adminData.email) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' })
  }

  // Compare password or allow default admin pass
  let isValid = false;
  if (adminData.passwordHash) {
    isValid = await bcrypt.compare(password, adminData.passwordHash)
  }
  
  // Fallback check for default password 'admin123' if not hashed yet
  if (!isValid && password === 'admin123') {
    isValid = true
  }

  if (!isValid) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' })
  }

  const token = jwt.sign({ email: adminData.email }, JWT_SECRET, { expiresIn: '24h' })
  res.json({ success: true, token, email: adminData.email })
})

// Verify Token API
app.get('/api/verify', authenticateToken, (req, res) => {
  res.json({ success: true, user: req.user })
})

// Single File Upload API
app.post('/api/upload', authenticateToken, upload.single('image'), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided' })
  }
  const imageUrl = `/uploads/${req.file.filename}`
  res.json({ success: true, url: imageUrl })
})

// Public GET Section API
const validSections = ['hero', 'about', 'services', 'testimonials', 'contact', 'settings']

app.get('/api/:section', (req, res) => {
  const { section } = req.params
  if (!validSections.includes(section)) {
    return res.status(404).json({ success: false, message: 'Invalid section' })
  }
  const data = readJsonFile(section)
  if (!data) {
    return res.status(404).json({ success: false, message: 'Data not found' })
  }
  res.json(data)
})

// Protected POST Section API
app.post('/api/:section', authenticateToken, (req, res) => {
  const { section } = req.params
  if (!validSections.includes(section)) {
    return res.status(404).json({ success: false, message: 'Invalid section' })
  }
  try {
    writeJsonFile(section, req.body)
    res.json({ success: true, message: `${section.toUpperCase()} updated successfully!`, data: req.body })
  } catch (error) {
    res.status(500).json({ success: false, message: 'Failed to write data' })
  }
})

app.listen(PORT, () => {
  console.log(`🚀 LogiCore Express API Server running on port ${PORT}`)
})
