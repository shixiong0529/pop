// 泡泡互动：SQLite 持久化（Node 内置 node:sqlite，无需编译原生依赖）
import fs from 'node:fs';
import path from 'node:path';

// node:sqlite 仍标记为实验特性，屏蔽它的启动警告
const emitWarning = process.emitWarning;
process.emitWarning = (warning, ...args) => {
  if (String(warning?.message ?? warning).includes('SQLite')) return;
  return emitWarning.call(process, warning, ...args);
};
const { DatabaseSync } = await import('node:sqlite');

const SCHEMA = `
CREATE TABLE IF NOT EXISTS users (
  id            INTEGER PRIMARY KEY AUTOINCREMENT,
  username      TEXT    NOT NULL,
  username_key  TEXT    NOT NULL UNIQUE,
  password_hash TEXT    NOT NULL,
  avatar        TEXT    NOT NULL,
  role          TEXT    NOT NULL DEFAULT 'user',
  muted         INTEGER NOT NULL DEFAULT 0,
  created_at    INTEGER NOT NULL
);
CREATE TABLE IF NOT EXISTS sessions (
  token_hash TEXT    PRIMARY KEY,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_sessions_user ON sessions(user_id);
CREATE TABLE IF NOT EXISTS messages (
  id         INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id    INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  body       TEXT    NOT NULL,
  created_at INTEGER NOT NULL,
  deleted_at INTEGER,
  deleted_by INTEGER
);
CREATE INDEX IF NOT EXISTS idx_messages_visible ON messages(deleted_at, id);
`;

/** 打开（或创建）数据库，返回封装好的查询方法 */
export function openDatabase(file) {
  fs.mkdirSync(path.dirname(path.resolve(file)), { recursive: true });
  const db = new DatabaseSync(file);
  db.exec('PRAGMA journal_mode = WAL; PRAGMA foreign_keys = ON; PRAGMA busy_timeout = 3000;');
  db.exec(SCHEMA);

  const q = {
    userByKey: db.prepare('SELECT * FROM users WHERE username_key = ?'),
    userById: db.prepare('SELECT * FROM users WHERE id = ?'),
    insertUser: db.prepare(
      'INSERT INTO users (username, username_key, password_hash, avatar, role, created_at) VALUES (?, ?, ?, ?, ?, ?)',
    ),
    countUsers: db.prepare('SELECT COUNT(*) AS n FROM users'),
    setRole: db.prepare('UPDATE users SET role = ? WHERE id = ?'),
    setMuted: db.prepare('UPDATE users SET muted = ? WHERE id = ?'),
    listUsers: db.prepare('SELECT id, username, role, muted, created_at FROM users ORDER BY id'),

    insertSession: db.prepare('INSERT INTO sessions (token_hash, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)'),
    sessionUser: db.prepare(
      `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
       WHERE s.token_hash = ? AND s.expires_at > ?`,
    ),
    deleteSession: db.prepare('DELETE FROM sessions WHERE token_hash = ?'),
    purgeSessions: db.prepare('DELETE FROM sessions WHERE expires_at <= ?'),

    insertMessage: db.prepare('INSERT INTO messages (user_id, body, created_at) VALUES (?, ?, ?)'),
    messageById: db.prepare('SELECT * FROM messages WHERE id = ?'),
    deleteMessage: db.prepare('UPDATE messages SET deleted_at = ?, deleted_by = ? WHERE id = ? AND deleted_at IS NULL'),
    latestMessages: db.prepare(
      `SELECT m.id, m.body, m.created_at, u.id AS user_id, u.username, u.avatar, u.role, u.muted
       FROM messages m JOIN users u ON u.id = m.user_id
       WHERE m.deleted_at IS NULL ORDER BY m.id DESC LIMIT ?`,
    ),
    messagesBefore: db.prepare(
      `SELECT m.id, m.body, m.created_at, u.id AS user_id, u.username, u.avatar, u.role, u.muted
       FROM messages m JOIN users u ON u.id = m.user_id
       WHERE m.deleted_at IS NULL AND m.id < ? ORDER BY m.id DESC LIMIT ?`,
    ),
    deleteUserMessages: db.prepare('UPDATE messages SET deleted_at = ?, deleted_by = ? WHERE user_id = ? AND deleted_at IS NULL'),
  };

  return { db, q };
}

/** 数据库行 → 前端使用的消息对象 */
export function toMessage(row) {
  return {
    id: Number(row.id),
    text: row.body,
    createdAt: Number(row.created_at),
    user: { id: Number(row.user_id), name: row.username, avatar: row.avatar, role: row.role, muted: Boolean(row.muted) },
  };
}

/** 数据库行 → 公开的用户信息（不含密码等字段） */
export function toPublicUser(row) {
  return { id: Number(row.id), name: row.username, avatar: row.avatar, role: row.role, muted: Boolean(row.muted) };
}
