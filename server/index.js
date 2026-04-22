import bcrypt from 'bcryptjs'
import cookieParser from 'cookie-parser'
import 'dotenv/config'
import express from 'express'
import rateLimit from 'express-rate-limit'
import helmet from 'helmet'
import multer from 'multer'
import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeContent } from './contentValidation.js'
import { clearExpiredSessions, db, getSiteContent, initializeDatabase, updateSiteContent } from './db.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const rootDir = path.resolve(__dirname, '..')
const distDir = path.join(rootDir, 'dist')
const uploadDir = path.join(__dirname, 'uploads')
const app = express()
const port = Number(process.env.PORT || 4000)
const isProduction = process.env.NODE_ENV === 'production'
const sessionCookieName = 'igu_admin_session'
const sessionTtlMs = 1000 * 60 * 60 * 8

const uploadLimits = {
  image: 10 * 1024 * 1024,
  document: 25 * 1024 * 1024,
  video: 50 * 1024 * 1024,
}

const mimeGroups = {
  image: ['image/jpeg', 'image/png', 'image/webp', 'image/gif'],
  video: ['video/mp4', 'video/webm', 'video/quicktime'],
  document: [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  ],
}

fs.mkdirSync(uploadDir, { recursive: true })
initializeDatabase()

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
)
app.use(express.json({ limit: '2mb' }))
app.use(cookieParser())
app.use('/uploads', express.static(uploadDir))

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 10,
  standardHeaders: true,
  legacyHeaders: false,
})

const storage = multer.diskStorage({
  destination: (_request, file, callback) => {
    const type = inferType(file.mimetype)
    const destination = path.join(uploadDir, `${type}s`)
    fs.mkdirSync(destination, { recursive: true })
    callback(null, destination)
  },
  filename: (_request, file, callback) => {
    const ext = path.extname(file.originalname).toLowerCase()
    const safeExt = ext.replace(/[^a-z0-9.]/g, '') || '.bin'
    callback(null, `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${safeExt}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: uploadLimits.video },
  fileFilter: (_request, file, callback) => {
    const type = inferType(file.mimetype)

    if (!type) {
      return callback(new Error('Недопустимый тип файла.'))
    }

    return callback(null, true)
  },
})

app.get('/api/content', (_request, response) => {
  response.json(getSiteContent())
})

app.post('/api/applications', (request, response) => {
  const name = typeof request.body?.name === 'string' ? request.body.name.trim() : ''
  const phone = typeof request.body?.phone === 'string' ? request.body.phone.trim() : ''
  const email = typeof request.body?.email === 'string' ? request.body.email.trim() : ''
  const program = typeof request.body?.program === 'string' ? request.body.program.trim() : ''

  if (!name || !phone || !email || !program) {
    return response.status(400).json({ message: 'Заполните обязательные поля.' })
  }

  return response.status(201).json({ ok: true })
})

app.post('/api/auth/login', authLimiter, (request, response) => {
  const login = typeof request.body?.login === 'string' ? request.body.login.trim() : ''
  const password = typeof request.body?.password === 'string' ? request.body.password : ''

  if (!login || !password) {
    return response.status(400).json({ message: 'Введите логин и пароль.' })
  }

  const user = db
    .prepare('SELECT id, login, password_hash, role FROM users WHERE login = ?')
    .get(login)

  if (!user || !bcrypt.compareSync(password, user.password_hash)) {
    return response.status(401).json({ message: 'Неверный логин или пароль.' })
  }

  clearExpiredSessions()

  const sessionId = crypto.randomBytes(32).toString('hex')
  const expiresAt = Date.now() + sessionTtlMs

  db.prepare('INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)').run(
    sessionId,
    user.id,
    expiresAt,
  )

  response.cookie(sessionCookieName, sessionId, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    maxAge: sessionTtlMs,
    path: '/',
  })

  return response.json({ user: { login: user.login, role: user.role } })
})

app.post('/api/auth/logout', (request, response) => {
  const sessionId = request.cookies?.[sessionCookieName]

  if (sessionId) {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
  }

  response.clearCookie(sessionCookieName, {
    httpOnly: true,
    sameSite: 'lax',
    secure: isProduction,
    path: '/',
  })
  response.json({ ok: true })
})

app.get('/api/auth/me', requireAdmin, (request, response) => {
  response.json({ user: request.user })
})

app.post('/api/admin/uploads', requireAdmin, upload.single('file'), (request, response) => {
  if (!request.file) {
    return response.status(400).json({ message: 'Приложите файл.' })
  }

  const inferredType = inferType(request.file.mimetype)
  const requestedType = typeof request.body?.type === 'string' ? request.body.type : inferredType

  if (!inferredType || requestedType !== inferredType) {
    removeUploadedFile(request.file.path)
    return response.status(400).json({ message: 'Тип файла не совпадает с выбранной категорией.' })
  }

  if (request.file.size > uploadLimits[inferredType]) {
    removeUploadedFile(request.file.path)
    return response.status(413).json({ message: limitMessage(inferredType) })
  }

  const relativeUrl = `/uploads/${inferredType}s/${request.file.filename}`

  return response.status(201).json({
    url: relativeUrl,
    name: request.file.originalname,
    type: inferredType,
    mimeType: request.file.mimetype,
    size: request.file.size,
  })
})

app.put('/api/admin/content', requireAdmin, (request, response) => {
  const normalized = normalizeContent(request.body)
  response.json(updateSiteContent(normalized))
})

if (isProduction) {
  app.use(express.static(distDir))
  app.get(/.*/, (_request, response) => {
    response.sendFile(path.join(distDir, 'index.html'))
  })
}

app.use((error, _request, response, _next) => {
  if (error instanceof multer.MulterError && error.code === 'LIMIT_FILE_SIZE') {
    return response.status(413).json({ message: 'Файл слишком большой. Максимум для видео: 50 МБ.' })
  }

  console.error(error)
  return response.status(500).json({ message: error.message || 'Внутренняя ошибка сервера.' })
})

app.listen(port, () => {
  console.log(`API server is running on http://127.0.0.1:${port}`)

  if (!process.env.ADMIN_LOGIN || !process.env.ADMIN_PASSWORD) {
    console.log('Using development admin credentials: admin / admin123')
  }
})

function requireAdmin(request, response, next) {
  const sessionId = request.cookies?.[sessionCookieName]

  if (!sessionId) {
    return response.status(401).json({ message: 'Требуется вход администратора.' })
  }

  const session = db
    .prepare(
      `SELECT sessions.id, sessions.expires_at, users.id AS user_id, users.login, users.role
       FROM sessions
       JOIN users ON users.id = sessions.user_id
       WHERE sessions.id = ?`,
    )
    .get(sessionId)

  if (!session || session.expires_at <= Date.now() || session.role !== 'admin') {
    db.prepare('DELETE FROM sessions WHERE id = ?').run(sessionId)
    return response.status(401).json({ message: 'Сессия истекла.' })
  }

  request.user = {
    id: session.user_id,
    login: session.login,
    role: session.role,
  }

  return next()
}

function inferType(mimeType) {
  return Object.entries(mimeGroups).find(([, mimes]) => mimes.includes(mimeType))?.[0] || null
}

function removeUploadedFile(filePath) {
  fs.rm(filePath, { force: true }, () => {})
}

function limitMessage(type) {
  if (type === 'image') {
    return 'Фото слишком большое. Максимум: 10 МБ.'
  }

  if (type === 'document') {
    return 'Документ слишком большой. Максимум: 25 МБ.'
  }

  return 'Видео слишком большое. Максимум: 50 МБ.'
}
