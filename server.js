const fs = require("fs");
const path = require("path");
const express = require("express");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Database = require("better-sqlite3");
require("dotenv").config();

const PORT = Number(process.env.PORT || 3000);
const JWT_SECRET = process.env.JWT_SECRET || "please-change-me-in-env";
const ADMIN_USERNAME = process.env.ADMIN_USERNAME || "editor";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "change-me-now";
const NODE_ENV = process.env.NODE_ENV || "development";
const IS_PROD = NODE_ENV === "production";
const NEWS_PER_PAGE_LIMIT = 20;

const dbDir = path.join(__dirname, "data");
const dbPath = path.join(dbDir, "igu.db");
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");
db.exec(`
CREATE TABLE IF NOT EXISTS users (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  username TEXT NOT NULL UNIQUE,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'editor',
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  text TEXT NOT NULL,
  media TEXT,
  mediaType TEXT,
  date TEXT NOT NULL
);
`);

function seedDefaultEditor() {
  const user = db.prepare("SELECT id, username FROM users WHERE username = ?").get(ADMIN_USERNAME);
  if (user) return;

  const passwordHash = bcrypt.hashSync(ADMIN_PASSWORD, 12);
  db.prepare("INSERT INTO users (username, password_hash, role) VALUES (?, ?, 'editor')")
    .run(ADMIN_USERNAME, passwordHash);
  console.log(`[auth] Created default editor: ${ADMIN_USERNAME}`);
}

function seedSampleNews() {
  const row = db.prepare("SELECT COUNT(*) as total FROM news").get();
  if (row.total > 0) return;

  const insert = db.prepare(`
    INSERT INTO news (id, title, category, text, media, mediaType, date)
    VALUES (@id, @title, @category, @text, @media, @mediaType, @date)
  `);

  const initialNews = [
    {
      id: "sample-1",
      title: "Начало нового учебного года",
      category: "announcement",
      text: "Уважаемые студенты и преподаватели! Новый учебный год начинается 1 сентября.",
      media: null,
      mediaType: null,
      date: "2026-09-01",
    },
    {
      id: "sample-2",
      title: "Победа на олимпиаде",
      category: "achievement",
      text: "Наши студенты заняли первое место на республиканской IT-олимпиаде.",
      media: null,
      mediaType: null,
      date: "2026-08-15",
    },
  ];

  const tx = db.transaction((items) => items.forEach((item) => insert.run(item)));
  tx(initialNews);
}

seedDefaultEditor();
seedSampleNews();

const app = express();
app.use(express.json({ limit: "60mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(__dirname));

function signAuthToken(user) {
  return jwt.sign(
    { sub: user.id, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: "12h" }
  );
}

function authMiddleware(req, res, next) {
  const token = req.cookies.auth_token;
  if (!token) {
    req.user = null;
    return next();
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.user = payload;
  } catch {
    req.user = null;
  }
  next();
}

function requireEditor(req, res, next) {
  if (!req.user || req.user.role !== "editor") {
    return res.status(403).json({ error: "forbidden" });
  }
  return next();
}

app.use(authMiddleware);

app.get("/api/auth/me", (req, res) => {
  if (!req.user) {
    return res.json({ authenticated: false });
  }
  return res.json({
    authenticated: true,
    user: { username: req.user.username, role: req.user.role },
  });
});

app.post("/api/auth/login", (req, res) => {
  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: "missing_credentials" });
  }

  const user = db.prepare("SELECT * FROM users WHERE username = ?").get(String(username));
  if (!user) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const ok = bcrypt.compareSync(String(password), user.password_hash);
  if (!ok) {
    return res.status(401).json({ error: "invalid_credentials" });
  }

  const token = signAuthToken(user);
  res.cookie("auth_token", token, {
    httpOnly: true,
    secure: IS_PROD,
    sameSite: "strict",
    maxAge: 12 * 60 * 60 * 1000,
  });

  return res.json({
    ok: true,
    user: { username: user.username, role: user.role },
  });
});

app.post("/api/auth/logout", (_req, res) => {
  res.clearCookie("auth_token");
  return res.json({ ok: true });
});

app.get("/api/news", (req, res) => {
  const category = req.query.category ? String(req.query.category) : "all";
  const page = Math.max(1, Number(req.query.page) || 1);
  const limit = Math.min(NEWS_PER_PAGE_LIMIT, Math.max(1, Number(req.query.limit) || 5));

  const params = [];
  let whereSql = "";
  if (category !== "all") {
    whereSql = "WHERE category = ?";
    params.push(category);
  }

  const totalRow = db.prepare(`SELECT COUNT(*) as total FROM news ${whereSql}`).get(...params);
  const total = totalRow.total;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const safePage = Math.min(page, totalPages);
  const offset = (safePage - 1) * limit;

  const items = db
    .prepare(`
      SELECT id, title, category, text, media, mediaType, date
      FROM news
      ${whereSql}
      ORDER BY date DESC, rowid DESC
      LIMIT ? OFFSET ?
    `)
    .all(...params, limit, offset);

  return res.json({
    items,
    pagination: {
      total,
      totalPages,
      currentPage: safePage,
      limit,
    },
  });
});

app.post("/api/news", requireEditor, (req, res) => {
  const { title, category, text, media, mediaType, date } = req.body || {};
  if (!title || !category || !text) {
    return res.status(400).json({ error: "missing_fields" });
  }

  const id = `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 7)}`;
  const publishDate = date || new Date().toISOString().slice(0, 10);

  db.prepare(`
    INSERT INTO news (id, title, category, text, media, mediaType, date)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `).run(
    id,
    String(title).trim(),
    String(category),
    String(text).trim(),
    media || null,
    mediaType || null,
    String(publishDate)
  );

  return res.status(201).json({ ok: true, id });
});

app.put("/api/news/:id", requireEditor, (req, res) => {
  const id = String(req.params.id || "");
  const existing = db.prepare("SELECT * FROM news WHERE id = ?").get(id);
  if (!existing) {
    return res.status(404).json({ error: "not_found" });
  }

  const payload = req.body || {};
  const updated = {
    title: payload.title ? String(payload.title).trim() : existing.title,
    category: payload.category || existing.category,
    text: payload.text ? String(payload.text).trim() : existing.text,
    media: payload.media !== undefined ? payload.media : existing.media,
    mediaType: payload.mediaType !== undefined ? payload.mediaType : existing.mediaType,
    date: payload.date || existing.date,
  };

  db.prepare(`
    UPDATE news
    SET title = ?, category = ?, text = ?, media = ?, mediaType = ?, date = ?
    WHERE id = ?
  `).run(
    updated.title,
    updated.category,
    updated.text,
    updated.media,
    updated.mediaType,
    updated.date,
    id
  );

  return res.json({ ok: true });
});

app.delete("/api/news/:id", requireEditor, (req, res) => {
  const id = String(req.params.id || "");
  const result = db.prepare("DELETE FROM news WHERE id = ?").run(id);
  if (result.changes === 0) {
    return res.status(404).json({ error: "not_found" });
  }
  return res.json({ ok: true });
});

app.get(/^\/(?!api\/).*/, (req, res) => {
  if (req.path.startsWith("/api/")) {
    return res.status(404).json({ error: "not_found" });
  }
  return res.sendFile(path.join(__dirname, "index.html"));
});

app.listen(PORT, () => {
  console.log(`Server started: http://localhost:${PORT}`);
});
