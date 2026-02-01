/**
 * Database - sql.js (local, no native deps) or PostgreSQL (Render)
 * Uses DATABASE_URL env var to decide (Render sets this automatically)
 */
const path = require('path');
const fs = require('fs');

const usePostgres = !!process.env.DATABASE_URL;

let db;

if (usePostgres) {
  const { Pool } = require('pg');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.DATABASE_URL.includes('localhost') ? false : { rejectUnauthorized: false }
  });

  pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      username VARCHAR(255) UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      balance INTEGER DEFAULT 10000,
      banned BOOLEAN DEFAULT FALSE,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    ALTER TABLE users ADD COLUMN IF NOT EXISTS banned BOOLEAN DEFAULT FALSE;
  `).catch(e => console.error('DB init:', e));

  db = {
    init: async () => {},
    getAllUsers: async () => {
      const r = await pool.query('SELECT id, username, balance, banned FROM users ORDER BY username');
      return r.rows;
    },
    getUserById: async (id) => {
      const r = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
      return r.rows[0];
    },
    getUserByUsername: async (username) => {
      const r = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
      return r.rows[0];
    },
    createUser: async (username, passwordHash) => {
      const r = await pool.query(
        'INSERT INTO users (username, password_hash) VALUES ($1, $2) RETURNING id',
        [username, passwordHash]
      );
      return r.rows[0].id;
    },
    updateBalance: async (userId, newBalance) => {
      await pool.query('UPDATE users SET balance = $1 WHERE id = $2', [newBalance, userId]);
    },
    setBanned: async (userId, banned) => {
      await pool.query('UPDATE users SET banned = $1 WHERE id = $2', [!!banned, userId]);
    },
    getLeaderboard: async (limit) => {
      const r = await pool.query(
        'SELECT username, balance FROM users WHERE COALESCE(banned, false) = false ORDER BY balance DESC LIMIT $1',
        [limit]
      );
      return r.rows;
    }
  };
} else {
  let sqlite;
  let saveDb = () => {};
  const dbPath = path.join(__dirname, 'loxys_den.db');

  function escape(str) {
    return String(str).replace(/'/g, "''");
  }

  function rowToUser(cols, vals) {
    if (!vals || vals.length === 0) return null;
    const row = vals[0];
    const o = {};
    cols.forEach((c, i) => { o[c] = row[i]; });
    return o;
  }

  function rowsToArray(cols, vals) {
    if (!vals || vals.length === 0) return [];
    return vals.map(row => {
      const o = {};
      cols.forEach((c, i) => { o[c] = row[i]; });
      return o;
    });
  }

  db = {
    init: async () => {
      const initSqlJs = require('sql.js');
      const SQL = await initSqlJs();
      if (fs.existsSync(dbPath)) {
        sqlite = new SQL.Database(fs.readFileSync(dbPath));
      } else {
        sqlite = new SQL.Database();
      }
      sqlite.exec(`
        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          username TEXT UNIQUE NOT NULL,
          password_hash TEXT NOT NULL,
          balance INTEGER DEFAULT 10000,
          banned INTEGER DEFAULT 0,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        );
        CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
      `);
      try { sqlite.exec('ALTER TABLE users ADD COLUMN banned INTEGER DEFAULT 0'); } catch (_) {}
      saveDb = () => {
        try {
          fs.writeFileSync(dbPath, Buffer.from(sqlite.export()));
        } catch (e) {
          console.error('DB save error:', e);
        }
      };
    },
    getUserById: async (id) => {
      const idSafe = parseInt(id, 10) || 0;
      const r = sqlite.exec(`SELECT * FROM users WHERE id = ${idSafe}`);
      if (!r.length) return null;
      return rowToUser(r[0].columns, r[0].values);
    },
    getUserByUsername: async (username) => {
      const u = escape(username);
      const r = sqlite.exec(`SELECT * FROM users WHERE username = '${u}'`);
      if (!r.length) return null;
      return rowToUser(r[0].columns, r[0].values);
    },
    createUser: async (username, passwordHash) => {
      sqlite.run('INSERT INTO users (username, password_hash) VALUES (?, ?)', [username, passwordHash]);
      const r = sqlite.exec('SELECT last_insert_rowid() as id');
      const id = r[0]?.values?.[0]?.[0] || 0;
      saveDb();
      return id;
    },
    updateBalance: async (userId, newBalance) => {
      const id = parseInt(userId, 10) || 0;
      const bal = parseInt(newBalance, 10) || 0;
      sqlite.run('UPDATE users SET balance = ? WHERE id = ?', [bal, id]);
      saveDb();
    },
    setBanned: async (userId, banned) => {
      const id = parseInt(userId, 10) || 0;
      sqlite.run('UPDATE users SET banned = ? WHERE id = ?', [banned ? 1 : 0, id]);
      saveDb();
    },
    getAllUsers: async () => {
      const r = sqlite.exec('SELECT id, username, balance, banned FROM users ORDER BY username');
      if (!r.length) return [];
      return rowsToArray(r[0].columns, r[0].values);
    },
    getLeaderboard: async (limit) => {
      const lim = Math.min(100, Math.max(1, parseInt(limit, 10) || 10));
      const r = sqlite.exec(`SELECT username, balance FROM users WHERE COALESCE(banned, 0) = 0 ORDER BY balance DESC LIMIT ${lim}`);
      if (!r.length) return [];
      return rowsToArray(r[0].columns, r[0].values);
    }
  };
}

module.exports = db;
