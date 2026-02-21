process.on('uncaughtException', (err) => {
  console.error('UNCAUGHT EXCEPTION:', err.message, err.stack);
  process.exit(1);
});

console.log('Starting: loading modules...');
let express, bcrypt, jwt, path, db;
try { express = require('express'); console.log('OK: express'); } catch(e) { console.error('FAIL: express', e.message); process.exit(1); }
try { bcrypt = require('bcryptjs'); console.log('OK: bcryptjs'); } catch(e) { console.error('FAIL: bcryptjs', e.message); process.exit(1); }
try { jwt = require('jsonwebtoken'); console.log('OK: jsonwebtoken'); } catch(e) { console.error('FAIL: jsonwebtoken', e.message); process.exit(1); }
try { path = require('path'); console.log('OK: path'); } catch(e) { console.error('FAIL: path', e.message); process.exit(1); }
try { db = require('./database'); console.log('OK: database'); } catch(e) { console.error('FAIL: database', e.message); process.exit(1); }
console.log('All modules loaded. PORT=' + (process.env.PORT || 3000));

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production';
const SALT_ROUNDS = 10;
const TOKEN_EXPIRY = '30d';

// ── Middleware ────────────────────────────────────────────────────────────────

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// ── Rate limiter (simple in-memory: 10 login attempts per IP per minute) ─────

const loginAttempts = new Map();

function checkRateLimit(ip) {
  const now = Date.now();
  const WINDOW_MS = 60 * 1000;
  const MAX_ATTEMPTS = 10;
  const entry = loginAttempts.get(ip);

  if (!entry || now - entry.windowStart > WINDOW_MS) {
    loginAttempts.set(ip, { count: 1, windowStart: now });
    return false; // not rate-limited
  }

  if (entry.count >= MAX_ATTEMPTS) {
    return true; // rate-limited
  }

  entry.count++;
  return false;
}

// Clean up stale entries every 5 minutes
setInterval(() => {
  const cutoff = Date.now() - 60 * 1000;
  for (const [ip, entry] of loginAttempts) {
    if (entry.windowStart < cutoff) loginAttempts.delete(ip);
  }
}, 5 * 60 * 1000);

// ── Validation ────────────────────────────────────────────────────────────────

const USERNAME_RE = /^[a-zA-Z0-9_]{1,20}$/;

function validateUsername(u) {
  return typeof u === 'string' && USERNAME_RE.test(u);
}

function validatePassword(p) {
  return typeof p === 'string' && p.length >= 6;
}

// ── Auth middleware ───────────────────────────────────────────────────────────

function requireAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized.' });
  }
  try {
    const payload = jwt.verify(auth.slice(7), JWT_SECRET);
    req.userId = payload.userId;
    req.username = payload.username;
    next();
  } catch {
    return res.status(401).json({ error: 'Invalid or expired token.' });
  }
}

// ── Auth routes ───────────────────────────────────────────────────────────────

app.post('/api/register', async (req, res) => {
  const { username, password } = req.body || {};

  if (!validateUsername(username)) {
    return res.status(400).json({
      error: 'Username must be 1–20 alphanumeric characters or underscores.'
    });
  }
  if (!validatePassword(password)) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }
  if (db.getUserByUsername(username)) {
    return res.status(400).json({ error: 'That name is already claimed.' });
  }

  const hash = await bcrypt.hash(password, SALT_ROUNDS);
  const userId = db.createUser(username, hash);
  const token = jwt.sign({ userId, username }, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
  res.json({ token, username });
});

app.post('/api/login', async (req, res) => {
  const ip = req.ip;
  if (checkRateLimit(ip)) {
    return res.status(429).json({ error: 'Too many attempts. Wait a minute and try again.' });
  }

  const { username, password } = req.body || {};
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required.' });
  }

  const user = db.getUserByUsername(username);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ error: 'Invalid credentials.' });
  }

  const token = jwt.sign(
    { userId: user.id, username: user.username },
    JWT_SECRET,
    { expiresIn: TOKEN_EXPIRY }
  );
  res.json({ token, username: user.username });
});

// ── Save routes ───────────────────────────────────────────────────────────────

app.get('/api/save', requireAuth, (req, res) => {
  const save = db.getSave(req.userId);
  if (!save) {
    return res.status(404).json({ error: 'No save found.' });
  }
  res.json({ gameState: JSON.parse(save.game_state), saved_at: save.saved_at });
});

app.post('/api/save', requireAuth, (req, res) => {
  const { gameState } = req.body || {};
  if (!gameState || typeof gameState !== 'object') {
    return res.status(400).json({ error: 'gameState object is required.' });
  }
  const saved_at = db.upsertSave(req.userId, JSON.stringify(gameState));
  res.json({ saved_at });
});

app.delete('/api/save', requireAuth, (req, res) => {
  db.deleteSave(req.userId);
  res.json({ deleted: true });
});

// ── Score routes ──────────────────────────────────────────────────────────────

app.get('/api/scores', (req, res) => {
  res.json(db.getTopScores());
});

app.post('/api/scores', requireAuth, (req, res) => {
  const { character, floorsReached, daysRemaining, goodEnding } = req.body || {};
  if (!character || floorsReached == null || daysRemaining == null || goodEnding == null) {
    return res.status(400).json({ error: 'Missing required score fields.' });
  }
  db.insertScore(
    req.userId,
    req.username,
    character,
    floorsReached,
    daysRemaining,
    goodEnding ? 1 : 0
  );
  res.json(db.getTopScores());
});

// ── Global error handler (catches malformed JSON bodies etc.) ─────────────────

// eslint-disable-next-line no-unused-vars
app.use((err, req, res, next) => {
  if (err.type === 'entity.parse.failed') {
    return res.status(400).json({ error: 'Invalid JSON in request body.' });
  }
  console.error(err);
  res.status(500).json({ error: 'Internal server error.' });
});

// ── Start ─────────────────────────────────────────────────────────────────────

app.listen(PORT, () => {
  console.log(`Tomb of Infernadax running on port ${PORT}`);
});
