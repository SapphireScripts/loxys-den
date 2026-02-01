/**
 * LOXY'S DEN - Backend Server
 * Uses SQLite (local) or PostgreSQL (Render)
 * Also serves frontend files when running locally
 */
const express = require('express');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('./db');

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'loxys-den-secret-change-in-production';
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || 'P@rkerD3visser2011';

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

function adminAuth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, msg: 'Admin login required' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    if (!decoded.admin) return res.status(403).json({ ok: false, msg: 'Admin only' });
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, msg: 'Invalid or expired admin session' });
  }
}

async function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ ok: false, msg: 'Not logged in' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await db.getUserById(decoded.userId);
    if (!user) return res.status(401).json({ ok: false, msg: 'User not found' });
    req.user = user;
    next();
  } catch (e) {
    return res.status(401).json({ ok: false, msg: 'Invalid token' });
  }
}

app.post('/api/register', async (req, res) => {
  try {
    let { username, password } = req.body || {};
    username = (username || '').trim().toLowerCase();
    
    if (!username || username.length < 3) {
      return res.json({ ok: false, msg: 'Username must be 3+ characters' });
    }
    if (!password || password.length < 4) {
      return res.json({ ok: false, msg: 'Password must be 4+ characters' });
    }

    const existing = await db.getUserByUsername(username);
    if (existing) {
      return res.json({ ok: false, msg: 'Username already taken' });
    }

    const passwordHash = bcrypt.hashSync(password, 10);
    const userId = await db.createUser(username, passwordHash);

    const token = jwt.sign({ userId }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ ok: true, user: username, token });
  } catch (e) {
    console.error('Register error:', e);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

app.post('/api/login', async (req, res) => {
  try {
    let { username, password } = req.body || {};
    username = (username || '').trim().toLowerCase();

    const user = await db.getUserByUsername(username);
    if (!user) {
      return res.json({ ok: false, msg: 'User not found' });
    }

    const match = bcrypt.compareSync(password, user.password_hash);
    if (!match) {
      return res.json({ ok: false, msg: 'Wrong password' });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ ok: true, user: user.username, token });
  } catch (e) {
    console.error('Login error:', e);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

app.get('/api/me', authMiddleware, (req, res) => {
  const banned = !!req.user.banned;
  res.json({ ok: true, user: req.user.username, balance: req.user.balance, banned });
});

app.get('/api/balance', authMiddleware, (req, res) => {
  res.json({ ok: true, balance: req.user.balance });
});

app.post('/api/balance', authMiddleware, async (req, res) => {
  try {
    if (!!req.user.banned) {
      return res.status(403).json({ ok: false, msg: 'You are banned and cannot play' });
    }
    const { delta } = req.body || {};
    const newBalance = Math.max(0, Math.floor((req.user.balance || 0) + (Number(delta) || 0)));
    await db.updateBalance(req.user.id, newBalance);
    res.json({ ok: true, balance: newBalance });
  } catch (e) {
    console.error('Balance error:', e);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

app.get('/api/leaderboard', async (req, res) => {
  try {
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const rows = await db.getLeaderboard(limit);
    res.json({ ok: true, entries: rows });
  } catch (e) {
    console.error('Leaderboard error:', e);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

app.post('/api/admin/login', (req, res) => {
  const { password } = req.body || {};
  if (password === ADMIN_PASSWORD) {
    const token = jwt.sign({ admin: true }, JWT_SECRET, { expiresIn: '8h' });
    return res.json({ ok: true, token });
  }
  res.json({ ok: false, msg: 'Wrong password' });
});

app.get('/api/admin/users', adminAuth, async (req, res) => {
  try {
    const users = await db.getAllUsers();
    res.json({ ok: true, users });
  } catch (e) {
    console.error('Get users error:', e);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

app.post('/api/admin/ban', adminAuth, async (req, res) => {
  try {
    const userId = parseInt(req.body.userId, 10);
    if (!userId) return res.json({ ok: false, msg: 'Invalid user ID' });
    await db.setBanned(userId, true);
    res.json({ ok: true, msg: 'User banned' });
  } catch (e) {
    console.error('Ban error:', e);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

app.post('/api/admin/unban', adminAuth, async (req, res) => {
  try {
    const userId = parseInt(req.body.userId, 10);
    if (!userId) return res.json({ ok: false, msg: 'Invalid user ID' });
    await db.setBanned(userId, false);
    res.json({ ok: true, msg: 'User unbanned' });
  } catch (e) {
    console.error('Unban error:', e);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

app.post('/api/admin/give-balance', adminAuth, async (req, res) => {
  try {
    const { targetUsername, amount } = req.body || {};
    const target = String(targetUsername || '').trim().toLowerCase();
    const amt = Math.floor(Number(amount) || 0);

    if (!target) return res.json({ ok: false, msg: 'Target username required' });
    if (amt <= 0) return res.json({ ok: false, msg: 'Amount must be positive' });

    const targetUser = await db.getUserByUsername(target);
    if (!targetUser) return res.json({ ok: false, msg: 'User not found' });

    const newBalance = Math.max(0, (targetUser.balance || 0) + amt);
    await db.updateBalance(targetUser.id, newBalance);
    res.json({ ok: true, msg: 'Balance updated', balance: newBalance });
  } catch (e) {
    console.error('Give balance error:', e);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

app.post('/api/admin/remove-balance', adminAuth, async (req, res) => {
  try {
    const { targetUsername, amount } = req.body || {};
    const target = String(targetUsername || '').trim().toLowerCase();
    const amt = Math.floor(Number(amount) || 0);

    if (!target) return res.json({ ok: false, msg: 'Target username required' });
    if (amt <= 0) return res.json({ ok: false, msg: 'Amount must be positive' });

    const targetUser = await db.getUserByUsername(target);
    if (!targetUser) return res.json({ ok: false, msg: 'User not found' });

    const newBalance = Math.max(0, (targetUser.balance || 0) - amt);
    await db.updateBalance(targetUser.id, newBalance);
    res.json({ ok: true, msg: 'Balance updated', balance: newBalance });
  } catch (e) {
    console.error('Remove balance error:', e);
    res.status(500).json({ ok: false, msg: 'Server error' });
  }
});

// Serve frontend files last (so http://localhost:3000 works instead of file://)
app.use(express.static(path.join(__dirname, '..')));

(async () => {
  await db.init();
  app.listen(PORT, () => {
    console.log('');
    console.log('============================================');
    console.log('  LOXY\'S DEN - Backend API');
    console.log('============================================');
    console.log('  Database:', process.env.DATABASE_URL ? 'PostgreSQL (Render)' : 'SQLite (sql.js)');
    console.log('  API:     http://localhost:' + PORT);
    console.log('  Website: http://localhost:' + PORT);
    console.log('============================================');
    console.log('');
  });
})();
