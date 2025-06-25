import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_PATH = path.resolve('./data/assessments.json');
const USERS_PATH = path.resolve('./data/users.json');
const SECRET = process.env.JWT_SECRET || 'secret_cndp';
const REGISTERS_PATH = path.resolve('./data/registers.json');
const DPIAS_PATH = path.resolve('./data/dpias.json');
const AUDIT_PATH = path.resolve('./data/audit.json');
const FOLDERS_PATH = path.resolve('./data/folders.json');

// Manual OPTIONS handler for CORS preflight (must be first)
app.use((req, res, next) => {
  if (req.method === 'OPTIONS') {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    return res.sendStatus(204);
  }
  next();
});

app.use(cors());
app.options('*', cors());
app.use(bodyParser.json());

// Middleware d'authentification
function auth(req, res, next) {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ error: 'Token manquant' });
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    return res.status(401).json({ error: 'Token invalide' });
  }
}

// Helper: isAdmin middleware
function isAdmin(req, res, next) {
  if (req.user && req.user.role === 'admin') return next();
  return res.status(403).json({ error: 'Accès réservé aux administrateurs' });
}

// Enregistrement utilisateur (first user is admin, else user)
app.post('/api/auth/register', (req, res) => {
  const { email, password, organizationId } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  let users = [];
  if (fs.existsSync(USERS_PATH)) {
    users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  }
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Utilisateur déjà existant' });
  const hash = bcrypt.hashSync(password, 10);
  let role = 'user';
  let orgId = organizationId;
  if (users.length === 0) { role = 'admin'; orgId = Date.now(); } // first user is admin/org creator
  if (!orgId) orgId = Date.now();
  const user = { id: Date.now(), email, password: hash, role, organizationId: orgId };
  users.push(user);
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, organizationId: user.organizationId }, SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Connexion utilisateur
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  let users = [];
  if (fs.existsSync(USERS_PATH)) {
    users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  }
  const user = users.find(u => u.email === email);
  if (!user) return res.status(400).json({ error: 'Utilisateur non trouvé' });
  if (!bcrypt.compareSync(password, user.password)) return res.status(400).json({ error: 'Mot de passe incorrect' });
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, organizationId: user.organizationId }, SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend opérationnel' });
});

// Load all assessments (protected, by folder)
app.get('/api/assessments', auth, (req, res) => {
  const folderId = req.query.folderId;
  if (!folderId) return res.status(400).json({ error: 'folderId requis' });
  if (!fs.existsSync(DATA_PATH)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  res.json(data.filter(a => a.userId === req.user.id && a.folderId === folderId));
});

// Save a new assessment (protected, with folderId)
app.post('/api/assessments', auth, (req, res) => {
  const assessment = req.body;
  if (!assessment.folderId) return res.status(400).json({ error: 'folderId requis' });
  let data = [];
  if (fs.existsSync(DATA_PATH)) {
    data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  }
  assessment.id = Date.now();
  assessment.userId = req.user.id;
  data.push(assessment);
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'create', type: 'assessment', itemId: assessment.id, details: assessment });
  res.json({ success: true, id: assessment.id });
});

// Get a single assessment by id (protected)
app.get('/api/assessments/:id', auth, (req, res) => {
  if (!fs.existsSync(DATA_PATH)) return res.status(404).json({ error: 'Not found' });
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const found = data.find(a => a.id === Number(req.params.id) && a.userId === req.user.id);
  if (!found) return res.status(404).json({ error: 'Not found' });
  res.json(found);
});

// CRUD Registre des traitements (protected, by folder)
app.get('/api/registers', auth, (req, res) => {
  const folderId = req.query.folderId;
  if (!folderId) return res.status(400).json({ error: 'folderId requis' });
  if (!fs.existsSync(REGISTERS_PATH)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(REGISTERS_PATH, 'utf-8'));
  res.json(data.filter(r => r.userId === req.user.id && r.folderId === folderId));
});

function logAudit({ user, action, type, itemId, details }) {
  let logs = [];
  if (fs.existsSync(AUDIT_PATH)) {
    logs = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf-8'));
  }
  logs.push({
    id: Date.now(),
    userId: user.id,
    email: user.email,
    action, // 'create' | 'update' | 'delete'
    type,   // 'register' | 'dpia' | 'assessment'
    itemId,
    timestamp: new Date().toISOString(),
    details: details || null
  });
  fs.writeFileSync(AUDIT_PATH, JSON.stringify(logs, null, 2));
}

// --- Audit endpoints ---
// List all audit logs (admin only)
app.get('/api/audit', auth, isAdmin, (req, res) => {
  if (!fs.existsSync(AUDIT_PATH)) return res.json([]);
  const logs = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf-8'));
  res.json(logs);
});
// Get audit logs for a specific item (auth)
app.get('/api/audit/:type/:itemId', auth, (req, res) => {
  if (!fs.existsSync(AUDIT_PATH)) return res.json([]);
  const logs = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf-8'));
  res.json(logs.filter(l => l.type === req.params.type && String(l.itemId) === String(req.params.itemId)));
});

// --- Register audit ---
app.post('/api/registers', auth, (req, res) => {
  const reg = req.body;
  if (!reg.folderId) return res.status(400).json({ error: 'folderId requis' });
  let data = [];
  if (fs.existsSync(REGISTERS_PATH)) {
    data = JSON.parse(fs.readFileSync(REGISTERS_PATH, 'utf-8'));
  }
  reg.id = Date.now();
  reg.userId = req.user.id;
  reg.date = new Date().toISOString();
  data.push(reg);
  fs.writeFileSync(REGISTERS_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'create', type: 'register', itemId: reg.id, details: reg });
  res.json({ success: true, id: reg.id });
});

app.put('/api/registers/:id', auth, (req, res) => {
  if (!fs.existsSync(REGISTERS_PATH)) return res.status(404).json({ error: 'Not found' });
  let data = JSON.parse(fs.readFileSync(REGISTERS_PATH, 'utf-8'));
  const idx = data.findIndex(r => r.id === Number(req.params.id) && r.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data[idx] = { ...data[idx], ...req.body };
  fs.writeFileSync(REGISTERS_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'update', type: 'register', itemId: req.params.id, details: req.body });
  res.json({ success: true });
});

app.delete('/api/registers/:id', auth, (req, res) => {
  if (!fs.existsSync(REGISTERS_PATH)) return res.status(404).json({ error: 'Not found' });
  let data = JSON.parse(fs.readFileSync(REGISTERS_PATH, 'utf-8'));
  const idx = data.findIndex(r => r.id === Number(req.params.id) && r.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = data[idx];
  data.splice(idx, 1);
  fs.writeFileSync(REGISTERS_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'delete', type: 'register', itemId: req.params.id, details: deleted });
  res.json({ success: true });
});

// CRUD DPIA (protected, by folder)
app.get('/api/dpias', auth, (req, res) => {
  const folderId = req.query.folderId;
  if (!folderId) return res.status(400).json({ error: 'folderId requis' });
  if (!fs.existsSync(DPIAS_PATH)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(DPIAS_PATH, 'utf-8'));
  res.json(data.filter(d => d.userId === req.user.id && d.folderId === folderId));
});

app.post('/api/dpias', auth, (req, res) => {
  const dpia = req.body;
  if (!dpia.folderId) return res.status(400).json({ error: 'folderId requis' });
  let data = [];
  if (fs.existsSync(DPIAS_PATH)) {
    data = JSON.parse(fs.readFileSync(DPIAS_PATH, 'utf-8'));
  }
  dpia.id = Date.now();
  dpia.userId = req.user.id;
  dpia.date = new Date().toISOString();
  data.push(dpia);
  fs.writeFileSync(DPIAS_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'create', type: 'dpia', itemId: dpia.id, details: dpia });
  res.json({ success: true, id: dpia.id });
});

app.put('/api/dpias/:id', auth, (req, res) => {
  if (!fs.existsSync(DPIAS_PATH)) return res.status(404).json({ error: 'Not found' });
  let data = JSON.parse(fs.readFileSync(DPIAS_PATH, 'utf-8'));
  const idx = data.findIndex(d => d.id === Number(req.params.id) && d.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data[idx] = { ...data[idx], ...req.body };
  fs.writeFileSync(DPIAS_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'update', type: 'dpia', itemId: req.params.id, details: req.body });
  res.json({ success: true });
});

app.delete('/api/dpias/:id', auth, (req, res) => {
  if (!fs.existsSync(DPIAS_PATH)) return res.status(404).json({ error: 'Not found' });
  let data = JSON.parse(fs.readFileSync(DPIAS_PATH, 'utf-8'));
  const idx = data.findIndex(d => d.id === Number(req.params.id) && d.userId === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = data[idx];
  data.splice(idx, 1);
  fs.writeFileSync(DPIAS_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'delete', type: 'dpia', itemId: req.params.id, details: deleted });
  res.json({ success: true });
});

// Get current user info
app.get('/api/users/me', auth, (req, res) => {
  let users = [];
  if (fs.existsSync(USERS_PATH)) {
    users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  }
  const user = users.find(u => u.id === req.user.id);
  if (!user) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  const { password, ...userInfo } = user;
  res.json(userInfo);
});

// List all users (admin only)
app.get('/api/users', auth, isAdmin, (req, res) => {
  let users = [];
  if (fs.existsSync(USERS_PATH)) {
    users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  }
  res.json(users.map(u => { const { password, ...info } = u; return info; }));
});

// Invite/add user to org (admin only)
app.post('/api/users/invite', auth, isAdmin, (req, res) => {
  const { email, password, role, organizationId } = req.body;
  if (!email || !password || !role || !organizationId) return res.status(400).json({ error: 'Champs requis manquants' });
  let users = [];
  if (fs.existsSync(USERS_PATH)) {
    users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  }
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Utilisateur déjà existant' });
  const hash = bcrypt.hashSync(password, 10);
  const user = { id: Date.now(), email, password: hash, role, organizationId };
  users.push(user);
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

// Change user role (admin only)
app.put('/api/users/:id/role', auth, isAdmin, (req, res) => {
  const { role } = req.body;
  if (!role) return res.status(400).json({ error: 'Role requis' });
  let users = [];
  if (fs.existsSync(USERS_PATH)) {
    users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  }
  const idx = users.findIndex(u => u.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Utilisateur non trouvé' });
  users[idx].role = role;
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  res.json({ success: true });
});

// --- Compliance Folders CRUD ---
// List folders for current user
app.get('/api/folders', auth, (req, res) => {
  if (!fs.existsSync(FOLDERS_PATH)) return res.json([]);
  const folders = JSON.parse(fs.readFileSync(FOLDERS_PATH, 'utf-8'));
  res.json(folders.filter(f => f.owner === req.user.id));
});
// Create a new folder
app.post('/api/folders', auth, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom du dossier requis' });
  let folders = [];
  if (fs.existsSync(FOLDERS_PATH)) {
    folders = JSON.parse(fs.readFileSync(FOLDERS_PATH, 'utf-8'));
  }
  const folder = {
    id: Date.now(),
    name,
    owner: req.user.id,
    createdAt: new Date().toISOString(),
  };
  folders.push(folder);
  fs.writeFileSync(FOLDERS_PATH, JSON.stringify(folders, null, 2));
  res.json(folder);
});
// Rename/update a folder
app.put('/api/folders/:id', auth, (req, res) => {
  const { name } = req.body;
  if (!name) return res.status(400).json({ error: 'Nom du dossier requis' });
  if (!fs.existsSync(FOLDERS_PATH)) return res.status(404).json({ error: 'Not found' });
  let folders = JSON.parse(fs.readFileSync(FOLDERS_PATH, 'utf-8'));
  const idx = folders.findIndex(f => f.id === Number(req.params.id) && f.owner === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  folders[idx].name = name;
  fs.writeFileSync(FOLDERS_PATH, JSON.stringify(folders, null, 2));
  res.json(folders[idx]);
});
// Delete a folder
app.delete('/api/folders/:id', auth, (req, res) => {
  if (!fs.existsSync(FOLDERS_PATH)) return res.status(404).json({ error: 'Not found' });
  let folders = JSON.parse(fs.readFileSync(FOLDERS_PATH, 'utf-8'));
  const idx = folders.findIndex(f => f.id === Number(req.params.id) && f.owner === req.user.id);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = folders[idx];
  folders.splice(idx, 1);
  fs.writeFileSync(FOLDERS_PATH, JSON.stringify(folders, null, 2));
  res.json({ success: true, deleted });
});

app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
}); 