const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(process.env.RAILWAY_VOLUME_MOUNT_PATH || '/tmp', 'game.db');
console.log('DB path:', DB_PATH);
const db = new Database(DB_PATH);

// WAL mode for better concurrent read performance
db.pragma('journal_mode = WAL');

// Auto-create tables on startup — exact schema from DESIGN.md
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    username   TEXT UNIQUE NOT NULL,
    password   TEXT NOT NULL,
    created_at TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS saves (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER UNIQUE NOT NULL REFERENCES users(id),
    game_state TEXT NOT NULL,
    saved_at   TEXT DEFAULT (datetime('now'))
  );

  CREATE TABLE IF NOT EXISTS scores (
    id             INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id        INTEGER REFERENCES users(id),
    username       TEXT NOT NULL,
    character      TEXT NOT NULL,
    floors_reached INTEGER NOT NULL,
    days_remaining REAL NOT NULL,
    good_ending    INTEGER NOT NULL,
    created_at     TEXT DEFAULT (datetime('now'))
  );
`);

module.exports = {
  getUserByUsername(username) {
    return db.prepare('SELECT * FROM users WHERE username = ?').get(username);
  },

  createUser(username, passwordHash) {
    const result = db.prepare(
      'INSERT INTO users (username, password) VALUES (?, ?)'
    ).run(username, passwordHash);
    return result.lastInsertRowid;
  },

  getSave(userId) {
    return db.prepare('SELECT * FROM saves WHERE user_id = ?').get(userId);
  },

  upsertSave(userId, gameStateJson) {
    const now = new Date().toISOString();
    db.prepare(`
      INSERT INTO saves (user_id, game_state, saved_at)
      VALUES (?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        game_state = excluded.game_state,
        saved_at   = excluded.saved_at
    `).run(userId, gameStateJson, now);
    return now;
  },

  deleteSave(userId) {
    db.prepare('DELETE FROM saves WHERE user_id = ?').run(userId);
  },

  getTopScores() {
    return db.prepare(`
      SELECT id, username, character, floors_reached, days_remaining, good_ending, created_at
      FROM scores
      ORDER BY good_ending DESC, days_remaining DESC
      LIMIT 20
    `).all();
  },

  insertScore(userId, username, character, floorsReached, daysRemaining, goodEnding) {
    db.prepare(`
      INSERT INTO scores (user_id, username, character, floors_reached, days_remaining, good_ending)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(userId, username, character, floorsReached, daysRemaining, goodEnding);
  }
};
