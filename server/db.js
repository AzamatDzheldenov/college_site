import bcrypt from 'bcryptjs'
import Database from 'better-sqlite3'
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeContent } from './contentValidation.js'
import { seedContent } from './seedContent.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const dataDir = path.join(__dirname, 'data')
const dbPath = process.env.DB_PATH || path.join(dataDir, 'igu.sqlite')

fs.mkdirSync(dataDir, { recursive: true })

export const db = new Database(dbPath)
db.pragma('journal_mode = WAL')

export function initializeDatabase() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      login TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'admin',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS site_content (
      id INTEGER PRIMARY KEY CHECK (id = 1),
      content_json TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS sessions (
      id TEXT PRIMARY KEY,
      user_id INTEGER NOT NULL,
      expires_at INTEGER NOT NULL,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `)

  upsertAdmin()
  seedSiteContent()
  migrateSiteContent()
  clearExpiredSessions()
}

function upsertAdmin() {
  const login = process.env.ADMIN_LOGIN || 'admin'
  const password = process.env.ADMIN_PASSWORD || 'admin123'
  const existing = db.prepare('SELECT id FROM users WHERE login = ?').get(login)

  if (existing) {
    if (process.env.ADMIN_PASSWORD) {
      const passwordHash = bcrypt.hashSync(password, 12)
      db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(passwordHash, existing.id)
    }

    return
  }

  const passwordHash = bcrypt.hashSync(password, 12)
  db.prepare('INSERT INTO users (login, password_hash, role) VALUES (?, ?, ?)').run(
    login,
    passwordHash,
    'admin',
  )
}

function seedSiteContent() {
  const existing = db.prepare('SELECT id FROM site_content WHERE id = 1').get()

  if (existing) {
    return
  }

  db.prepare('INSERT INTO site_content (id, content_json) VALUES (1, ?)').run(
    JSON.stringify(seedContent),
  )
}

export function getSiteContent() {
  const row = db.prepare('SELECT content_json FROM site_content WHERE id = 1').get()
  return row ? normalizeContent(JSON.parse(row.content_json)) : normalizeContent(seedContent)
}

export function updateSiteContent(content) {
  const normalized = normalizeContent(content)
  db.prepare(
    'UPDATE site_content SET content_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
  ).run(JSON.stringify(normalized))
  return getSiteContent()
}

export function clearExpiredSessions() {
  db.prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now())
}

function migrateSiteContent() {
  const normalized = getSiteContent()
  db.prepare(
    'UPDATE site_content SET content_json = ?, updated_at = CURRENT_TIMESTAMP WHERE id = 1',
  ).run(JSON.stringify(normalized))
}
