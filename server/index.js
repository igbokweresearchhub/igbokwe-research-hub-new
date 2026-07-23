import express from 'express';
import cors from 'cors';
import crypto from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.join(__dirname, '..');
const dataDir = path.join(__dirname, 'data');
const dbPath = path.join(dataDir, 'db.json');
const PORT = process.env.PORT || 4173;
const JWT_SECRET = process.env.JWT_SECRET || 'CHANGE_THIS_SECRET_BEFORE_DEPLOYMENT';

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: '1mb' }));

async function ensureDb() {
  await fs.mkdir(dataDir, { recursive: true });
  try {
    await fs.access(dbPath);
  } catch {
    const adminPassword = hashPassword('ChangeMe123!');
    const db = {
      users: [
        {
          id: crypto.randomUUID(),
          name: 'Igbokwe Admin',
          email: 'admin@igbokweresearchhub.com',
          passwordHash: adminPassword,
          role: 'admin',
          createdAt: new Date().toISOString()
        }
      ],
      requests: [],
      messages: []
    };
    await writeDb(db);
  }
}

async function readDb() {
  await ensureDb();
  return JSON.parse(await fs.readFile(dbPath, 'utf8'));
}

async function writeDb(db) {
  await fs.writeFile(dbPath, JSON.stringify(db, null, 2));
}

function hashPassword(password, salt = crypto.randomBytes(16).toString('hex')) {
  const hash = crypto.pbkdf2Sync(password, salt, 120000, 64, 'sha512').toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password, stored) {
  const [salt, hash] = stored.split(':');
  return hashPassword(password, salt) === stored;
}

function base64url(input) {
  return Buffer.from(JSON.stringify(input)).toString('base64url');
}

function signToken(payload) {
  const header = { alg: 'HS256', typ: 'JWT' };
  const now = Math.floor(Date.now() / 1000);
  const body = { ...payload, iat: now, exp: now + 60 * 60 * 24 * 7 };
  const unsigned = `${base64url(header)}.${base64url(body)}`;
  const signature = crypto.createHmac('sha256', JWT_SECRET).update(unsigned).digest('base64url');
  return `${unsigned}.${signature}`;
}

function verifyToken(token) {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;
  const [header, body, signature] = parts;
  const expected = crypto.createHmac('sha256', JWT_SECRET).update(`${header}.${body}`).digest('base64url');
  if (!crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expected))) return null;
  const payload = JSON.parse(Buffer.from(body, 'base64url').toString('utf8'));
  if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
  return payload;
}

async function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  const payload = verifyToken(token);
  if (!payload) return res.status(401).json({ error: 'Please log in.' });
  const db = await readDb();
  const user = db.users.find((u) => u.id === payload.id);
  if (!user) return res.status(401).json({ error: 'Account not found.' });
  req.user = { id: user.id, name: user.name, email: user.email, role: user.role };
  next();
}

function requireAdmin(req, res, next) {
  if (req.user?.role !== 'admin') return res.status(403).json({ error: 'Admin access required.' });
  next();
}

function sanitizeUser(user) {
  const { passwordHash, ...safe } = user;
  return safe;
}

app.get('/api/health', (req, res) => res.json({ ok: true, service: 'Igbokwe Research Hub API' }));

app.post('/api/auth/signup', async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'Name, email, and password are required.' });
  if (password.length < 8) return res.status(400).json({ error: 'Password must be at least 8 characters.' });
  const normalizedEmail = String(email).trim().toLowerCase();
  const db = await readDb();
  if (db.users.some((u) => u.email === normalizedEmail)) return res.status(409).json({ error: 'An account with this email already exists.' });
  const user = {
    id: crypto.randomUUID(),
    name: String(name).trim(),
    email: normalizedEmail,
    passwordHash: hashPassword(password),
    role: 'client',
    createdAt: new Date().toISOString()
  };
  db.users.push(user);
  await writeDb(db);
  res.status(201).json({ user: sanitizeUser(user), token: signToken({ id: user.id, role: user.role }) });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body;
  const db = await readDb();
  const user = db.users.find((u) => u.email === String(email || '').trim().toLowerCase());
  if (!user || !verifyPassword(password || '', user.passwordHash)) return res.status(401).json({ error: 'Invalid email or password.' });
  res.json({ user: sanitizeUser(user), token: signToken({ id: user.id, role: user.role }) });
});

app.get('/api/me', auth, async (req, res) => res.json({ user: req.user }));

app.post('/api/requests', auth, async (req, res) => {
  const { serviceType, academicLevel, topic, deadline, budget, details, phone } = req.body;
  if (!serviceType || !academicLevel || !topic || !deadline || !details) {
    return res.status(400).json({ error: 'Please complete service type, academic level, topic, deadline, and details.' });
  }
  const db = await readDb();
  const request = {
    id: crypto.randomUUID(),
    userId: req.user.id,
    clientName: req.user.name,
    clientEmail: req.user.email,
    phone: phone || '',
    serviceType,
    academicLevel,
    topic,
    deadline,
    budget: budget || '',
    details,
    status: 'New',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };
  db.requests.unshift(request);
  await writeDb(db);
  res.status(201).json({ request });
});

app.get('/api/requests', auth, async (req, res) => {
  const db = await readDb();
  const requests = db.requests.filter((r) => r.userId === req.user.id);
  res.json({ requests });
});

app.get('/api/admin/requests', auth, requireAdmin, async (req, res) => {
  const db = await readDb();
  res.json({ requests: db.requests });
});

app.patch('/api/admin/requests/:id', auth, requireAdmin, async (req, res) => {
  const db = await readDb();
  const request = db.requests.find((r) => r.id === req.params.id);
  if (!request) return res.status(404).json({ error: 'Request not found.' });
  request.status = req.body.status || request.status;
  request.updatedAt = new Date().toISOString();
  await writeDb(db);
  res.json({ request });
});

app.post('/api/contact', async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) return res.status(400).json({ error: 'Name, email, and message are required.' });
  const db = await readDb();
  db.messages.unshift({ id: crypto.randomUUID(), name, email, message, createdAt: new Date().toISOString() });
  await writeDb(db);
  res.status(201).json({ ok: true });
});

if (process.env.NODE_ENV === 'production') {
  const distDir = path.join(rootDir, 'dist');
  app.use(express.static(distDir));
  app.use((req, res) => res.sendFile(path.join(distDir, 'index.html')));
}

await ensureDb();
app.listen(PORT, () => {
  console.log(`Igbokwe Research Hub API running on http://localhost:${PORT}`);
  console.log('Default admin login: admin@igbokweresearchhub.com / ChangeMe123!');
});
