import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_PATH = path.resolve('./data/assessments.json');
const USERS_PATH = path.resolve('./data/users.json');
const SECRET = process.env.JWT_SECRET || 'secret_cndp';
const REGISTERS_PATH = path.resolve('./data/registers.json');
const DPIAS_PATH = path.resolve('./data/dpias.json');
const AUDIT_PATH = path.resolve('./data/audit.json');
const PROGRESSION_PATH = path.resolve('./data/progression.json');
const ISO27001_PATH = path.resolve('./data/iso27001.json');
const ORGANIZATIONS_PATH = path.resolve('./data/organizations.json');
const INVITATIONS_PATH = path.resolve('./data/invitations.json');

// Default compliance roadmap
const DEFAULT_STEPS = [
  {
    step: 1,
    title: 'Identifier les activités de traitement',
    completed: false,
    completedAt: null,
    subTasks: [
      { label: 'Lister toutes les activités', completed: false },
      { label: 'Décrire chaque activité', completed: false }
    ]
  },
  {
    step: 2,
    title: 'Créer le registre',
    completed: false,
    completedAt: null,
    subTasks: [
      { label: 'Compléter le registre pour chaque activité', completed: false }
    ]
  },
  {
    step: 3,
    title: 'Déclarer à la CNDP',
    completed: false,
    completedAt: null,
    subTasks: [
      { label: 'Préparer la déclaration', completed: false },
      { label: 'Téléverser la preuve', completed: false }
    ],
    documents: [
      {
        label: 'Déclaration simplifiée (F214) préalable du traitement',
        url: 'https://www.cndp.ma/wp-content/uploads/2025/01/CNDP-Declaration-Normale-Conformement-Decision_F214_20210318_Fr.pdf'
      },
      {
        label: 'Déclaration normale (F211) préalable de traitement',
        url: 'https://www.cndp.ma/wp-content/uploads/2025/01/CNDP-Declaration-Normale-Conformement-Decision_F214_20210318_Fr.pdf'
      }
    ]
  },
  {
    step: 4,
    title: 'Réaliser la DPIA (si nécessaire)',
    completed: false,
    completedAt: null,
    subTasks: [
      { label: 'Identifier les activités à risque', completed: false },
      { label: 'Compléter la DPIA', completed: false },
      { label: 'Téléverser la DPIA', completed: false }
    ]
  },
  {
    step: 5,
    title: 'Mettre en place les mesures de sécurité',
    completed: false,
    completedAt: null,
    subTasks: [
      { label: 'Documenter les mesures techniques/organisationnelles', completed: false },
      { label: 'Plan de gestion des incidents', completed: false }
    ]
  },
  {
    step: 6,
    title: 'Informer et former le personnel',
    completed: false,
    completedAt: null,
    subTasks: [
      { label: 'Former le personnel', completed: false },
      { label: 'Partager la politique interne', completed: false }
    ]
  },
  {
    step: 7,
    title: 'Gestion des droits',
    completed: false,
    completedAt: null,
    subTasks: [
      { label: 'Procédures pour accès/rectification/opposition', completed: false },
      { label: 'Modèles de communication', completed: false }
    ]
  }
];

// Helper to read progression data
function readProgression() {
  if (!fs.existsSync(PROGRESSION_PATH)) return [];
  return JSON.parse(fs.readFileSync(PROGRESSION_PATH, 'utf-8'));
}
// Helper to write progression data
function writeProgression(data) {
  fs.writeFileSync(PROGRESSION_PATH, JSON.stringify(data, null, 2));
}

// Helper to read ISO27001 data
function readISO27001() {
  try {
    if (fs.existsSync(ISO27001_PATH)) {
      return JSON.parse(fs.readFileSync(ISO27001_PATH, 'utf-8'));
    }
    return [];
  } catch (error) {
    console.error('Error reading ISO27001:', error);
    return [];
  }
}

// Helper to write ISO27001 data
function writeISO27001(data) {
  try {
    fs.writeFileSync(ISO27001_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing ISO27001:', error);
  }
}

// Helper functions for Organizations data
function readOrganizations() {
  try {
    if (fs.existsSync(ORGANIZATIONS_PATH)) {
      return JSON.parse(fs.readFileSync(ORGANIZATIONS_PATH, 'utf-8'));
    }
    return [];
  } catch (error) {
    console.error('Error reading organizations:', error);
    return [];
  }
}

function writeOrganizations(data) {
  try {
    fs.writeFileSync(ORGANIZATIONS_PATH, JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Error writing organizations:', error);
  }
}

// Helper to read invitations data
function readInvitations() {
  if (!fs.existsSync(INVITATIONS_PATH)) {
    return [];
  }
  try {
    const content = fs.readFileSync(INVITATIONS_PATH, 'utf-8');
    const data = JSON.parse(content);
    return data;
  } catch (error) {
    console.error('Error reading invitations:', error);
    return [];
  }
}

function writeInvitations(data) {
  fs.writeFileSync(INVITATIONS_PATH, JSON.stringify(data, null, 2));
}

// Generate unique organization ID
function generateOrganizationId() {
  // Use timestamp for consistency with existing data
  return Date.now();
}

// Generate unique invitation code
function generateInvitationCode() {
  return crypto.randomBytes(6).toString('hex').toUpperCase();
}

// Validate organization data
function validateOrganization(org) {
  if (!org.name || org.name.trim().length < 2) {
    return { valid: false, error: 'Le nom de l\'organisation doit contenir au moins 2 caractères' };
  }
  if (!org.email || !org.email.includes('@')) {
    return { valid: false, error: 'Email invalide' };
  }
  return { valid: true };
}

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

// Helper: isAdminOrDPO middleware
function isAdminOrDPO(req, res, next) {
  if (req.user && (req.user.role === 'admin' || req.user.role === 'dpo')) return next();
  return res.status(403).json({ error: 'Accès réservé aux administrateurs et DPO' });
}

// Middleware for DPO
function isDPO(req, res, next) {
  if (req.user && req.user.role === 'dpo') return next();
  return res.status(403).json({ error: 'Accès réservé au DPO' });
}

// Middleware for Représentant légal
function isRepresentant(req, res, next) {
  if (req.user && req.user.role === 'representant') return next();
  return res.status(403).json({ error: 'Accès réservé au représentant légal' });
}

// Organization Management Endpoints

// Create new organization (public endpoint)
app.post('/api/organizations', (req, res) => {
  try {
    const { name, description, address, phone, email, website, sector, size, adminEmail, adminPassword, adminName } = req.body;
    
    // Validate required fields
    if (!name || !email || !adminEmail || !adminPassword) {
      return res.status(400).json({ error: 'Nom, email, email admin et mot de passe admin requis' });
    }
    
    // Validate organization data
    const validation = validateOrganization({ name, email });
    if (!validation.valid) {
      return res.status(400).json({ error: validation.error });
    }
    
    // Check if organization already exists
    const organizations = readOrganizations();
    const existingOrg = organizations.find(org => org.email === email || org.name.toLowerCase() === name.toLowerCase());
    if (existingOrg) {
      return res.status(400).json({ error: 'Une organisation avec ce nom ou email existe déjà' });
    }
    
    // Check if admin user already exists
    let users = [];
    if (fs.existsSync(USERS_PATH)) {
      users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    }
    if (users.find(u => u.email === adminEmail)) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }
    
    // Create organization
    const organizationId = generateOrganizationId();
    const organization = {
      id: organizationId,
      name: name.trim(),
      description: description || '',
      address: address || '',
      phone: phone || '',
      email: email.trim(),
      website: website || '',
      sector: sector || '',
      size: size || '',
      logo: '/logo.png',
      createdAt: new Date().toISOString(),
      isActive: true,
      adminEmail: adminEmail
    };
    
    // Create admin user
    const adminUser = {
      id: Date.now(),
      email: adminEmail,
      password: bcrypt.hashSync(adminPassword, 10),
      role: 'admin',
      name: adminName || 'Administrateur',
      department: 'Administration',
      organizationId: organizationId,
      createdAt: new Date().toISOString(),
      isActive: true,
      lastLogin: null
    };
    
    // Save organization and user
    organizations.push(organization);
    writeOrganizations(organizations);
    
    users.push(adminUser);
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    
    // Generate token for admin
    const token = jwt.sign({ 
      id: adminUser.id, 
      email: adminUser.email, 
      role: adminUser.role, 
      organizationId: adminUser.organizationId 
    }, SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true, 
      token, 
      organization: {
        id: organization.id,
        name: organization.name,
        email: organization.email
      },
      user: {
        id: adminUser.id,
        email: adminUser.email,
        role: adminUser.role,
        name: adminUser.name
      }
    });
    
  } catch (error) {
    console.error('Error creating organization:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'organisation' });
  }
});

// Register user with invitation code
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, invitationCode, name, department } = req.body;
    
    if (!email || !password || !invitationCode) {
      return res.status(400).json({ error: 'Email, mot de passe et code d\'invitation requis' });
    }
    
    // Validate invitation
    const invitations = readInvitations();
    const invitation = invitations.find(inv => 
      inv.email === email && 
      inv.code === invitationCode && 
      !inv.used && 
      new Date(inv.expiresAt) > new Date()
    );
    
    if (!invitation) {
      return res.status(400).json({ error: 'Code d\'invitation invalide, expiré ou déjà utilisé' });
    }
    
    // Check if user already exists
    let users = [];
    if (fs.existsSync(USERS_PATH)) {
      users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    }
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }
    
    // Create user
    const newUser = {
      id: Date.now(),
      email: email.trim(),
      password: bcrypt.hashSync(password, 10),
      role: invitation.role,
      name: name || '',
      department: department || '',
      organizationId: invitation.organizationId,
      createdAt: new Date().toISOString(),
      isActive: true,
      lastLogin: null
    };
    
    users.push(newUser);
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    
    // Mark invitation as used
    invitation.used = true;
    invitation.usedAt = new Date().toISOString();
    writeInvitations(invitations);
    
    // Generate token
    const token = jwt.sign({ 
      id: newUser.id, 
      email: newUser.email, 
      role: newUser.role, 
      organizationId: newUser.organizationId 
    }, SECRET, { expiresIn: '7d' });
    
    res.json({ 
      success: true, 
      token,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name
      }
    });
    
  } catch (error) {
    console.error('Error registering user:', error);
    res.status(500).json({ error: 'Erreur lors de l\'inscription' });
  }
});

// Admin registration (for existing organizations)
app.post('/api/auth/admin-register', auth, isAdmin, (req, res) => {
  try {
    const { email, password, role, name, department } = req.body;
    
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, mot de passe et rôle requis' });
    }
    
    // Check if user already exists
    let users = [];
    if (fs.existsSync(USERS_PATH)) {
      users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    }
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }
    
    // Create user in same organization
    const newUser = {
      id: Date.now(),
      email: email.trim(),
      password: bcrypt.hashSync(password, 10),
      role: role,
      name: name || '',
      department: department || '',
      organizationId: req.user.organizationId,
      createdAt: new Date().toISOString(),
      isActive: true,
      lastLogin: null
    };
    
    users.push(newUser);
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    
    logAudit({ 
      user: req.user, 
      action: 'create', 
      type: 'user', 
      itemId: newUser.id, 
      details: { email, role, name, department } 
    });
    
    res.json({ 
      success: true,
      user: {
        id: newUser.id,
        email: newUser.email,
        role: newUser.role,
        name: newUser.name,
        department: newUser.department,
        organizationId: newUser.organizationId,
        createdAt: newUser.createdAt,
        isActive: newUser.isActive
      }
    });
    
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
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
  
  // Check if user is active
  if (user.isActive === false) {
    return res.status(403).json({ error: 'Compte désactivé. Contactez l\'administrateur.' });
  }
  
  // Update last login
  user.lastLogin = Date.now();
  const userIndex = users.findIndex(u => u.id === user.id);
  users[userIndex] = user;
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  
  const token = jwt.sign({ id: user.id, email: user.email, role: user.role, organizationId: user.organizationId }, SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend opérationnel' });
});

// Load all assessments (protected, no folder)
app.get('/api/assessments', auth, (req, res) => {
  if (!fs.existsSync(DATA_PATH)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  res.json(data.filter(a => a.organizationId === req.user.organizationId));
});

// Save a new assessment (protected, no folderId)
app.post('/api/assessments', auth, (req, res) => {
  const assessment = req.body;
  let data = [];
  if (fs.existsSync(DATA_PATH)) {
    data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  }
  assessment.id = Date.now();
  assessment.userId = req.user.id;
  assessment.organizationId = req.user.organizationId; // Add organization isolation
  data.push(assessment);
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'create', type: 'assessment', itemId: assessment.id, details: assessment });
  res.json({ success: true, id: assessment.id });
});

// Get a single assessment by id (protected)
app.get('/api/assessments/:id', auth, (req, res) => {
  if (!fs.existsSync(DATA_PATH)) return res.status(404).json({ error: 'Not found' });
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const found = data.find(a => a.id === Number(req.params.id) && a.organizationId === req.user.organizationId);
  if (!found) return res.status(404).json({ error: 'Not found' });
  res.json(found);
});

// CRUD Registre des traitements (protected, no folder)
app.get('/api/registers', auth, (req, res) => {
  if (!fs.existsSync(REGISTERS_PATH)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(REGISTERS_PATH, 'utf-8'));
  res.json(data.filter(r => r.organizationId === req.user.organizationId));
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
    organizationId: user.organizationId, // Add organization isolation
    action, // 'create' | 'update' | 'delete'
    type,   // 'register' | 'dpia' | 'assessment'
    itemId,
    timestamp: new Date().toISOString(),
    details: details || null
  });
  fs.writeFileSync(AUDIT_PATH, JSON.stringify(logs, null, 2));
}

// --- Audit endpoints ---
// List all audit logs (admin only) - filtered by organization
app.get('/api/audit', auth, isAdmin, (req, res) => {
  if (!fs.existsSync(AUDIT_PATH)) return res.json([]);
  const logs = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf-8'));
  // Filter by organization - admin can only see audit logs from their organization
  const organizationLogs = logs.filter(log => log.organizationId === req.user.organizationId);
  res.json(organizationLogs);
});
// Get audit logs for a specific item (auth) - filtered by organization
app.get('/api/audit/:type/:itemId', auth, (req, res) => {
  if (!fs.existsSync(AUDIT_PATH)) return res.json([]);
  const logs = JSON.parse(fs.readFileSync(AUDIT_PATH, 'utf-8'));
  res.json(logs.filter(l => 
    l.type === req.params.type && 
    String(l.itemId) === String(req.params.itemId) &&
    l.organizationId === req.user.organizationId
  ));
});

// --- Register audit ---
app.post('/api/registers', auth, (req, res) => {
  const reg = req.body;
  let data = [];
  if (fs.existsSync(REGISTERS_PATH)) {
    data = JSON.parse(fs.readFileSync(REGISTERS_PATH, 'utf-8'));
  }
  reg.id = Date.now();
  reg.userId = req.user.id;
  reg.organizationId = req.user.organizationId; // Add organization isolation
  reg.date = new Date().toISOString();
  data.push(reg);
  fs.writeFileSync(REGISTERS_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'create', type: 'register', itemId: reg.id, details: reg });
  res.json({ success: true, id: reg.id });
});

app.put('/api/registers/:id', auth, (req, res) => {
  if (!fs.existsSync(REGISTERS_PATH)) return res.status(404).json({ error: 'Not found' });
  let data = JSON.parse(fs.readFileSync(REGISTERS_PATH, 'utf-8'));
  const idx = data.findIndex(r => r.id === Number(req.params.id) && r.organizationId === req.user.organizationId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data[idx] = { ...data[idx], ...req.body };
  fs.writeFileSync(REGISTERS_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'update', type: 'register', itemId: req.params.id, details: req.body });
  res.json({ success: true });
});

app.delete('/api/registers/:id', auth, (req, res) => {
  if (!fs.existsSync(REGISTERS_PATH)) return res.status(404).json({ error: 'Not found' });
  let data = JSON.parse(fs.readFileSync(REGISTERS_PATH, 'utf-8'));
  const idx = data.findIndex(r => r.id === Number(req.params.id) && r.organizationId === req.user.organizationId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = data[idx];
  data.splice(idx, 1);
  fs.writeFileSync(REGISTERS_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'delete', type: 'register', itemId: req.params.id, details: deleted });
  res.json({ success: true });
});

// CRUD DPIA (protected, no folder)
app.get('/api/dpias', auth, (req, res) => {
  if (!fs.existsSync(DPIAS_PATH)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(DPIAS_PATH, 'utf-8'));
  // Filter by organization, not just user
  res.json(data.filter(d => d.organizationId === req.user.organizationId));
});

app.post('/api/dpias', auth, (req, res) => {
  const dpia = req.body;
  let data = [];
  if (fs.existsSync(DPIAS_PATH)) {
    data = JSON.parse(fs.readFileSync(DPIAS_PATH, 'utf-8'));
  }
  dpia.id = Date.now();
  dpia.userId = req.user.id;
  dpia.organizationId = req.user.organizationId; // Add organization isolation
  dpia.date = new Date().toISOString();
  data.push(dpia);
  fs.writeFileSync(DPIAS_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'create', type: 'dpia', itemId: dpia.id, details: dpia });
  res.json({ success: true, id: dpia.id });
});

app.put('/api/dpias/:id', auth, (req, res) => {
  if (!fs.existsSync(DPIAS_PATH)) return res.status(404).json({ error: 'Not found' });
  let data = JSON.parse(fs.readFileSync(DPIAS_PATH, 'utf-8'));
  const idx = data.findIndex(d => d.id === Number(req.params.id) && d.organizationId === req.user.organizationId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  data[idx] = { ...data[idx], ...req.body };
  fs.writeFileSync(DPIAS_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'update', type: 'dpia', itemId: req.params.id, details: req.body });
  res.json({ success: true });
});

app.delete('/api/dpias/:id', auth, (req, res) => {
  if (!fs.existsSync(DPIAS_PATH)) return res.status(404).json({ error: 'Not found' });
  let data = JSON.parse(fs.readFileSync(DPIAS_PATH, 'utf-8'));
  const idx = data.findIndex(d => d.id === Number(req.params.id) && d.organizationId === req.user.organizationId);
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const deleted = data[idx];
  data.splice(idx, 1);
  fs.writeFileSync(DPIAS_PATH, JSON.stringify(data, null, 2));
  logAudit({ user: req.user, action: 'delete', type: 'dpia', itemId: req.params.id, details: deleted });
  res.json({ success: true });
});

// GET /api/progression - get current user's progression
app.get('/api/progression', auth, (req, res) => {
  const userId = req.user.id;
  const organizationId = req.user.organizationId;
  let progression = readProgression();
  let userProg = progression.find(p => p.userId === userId && p.organizationId === organizationId);
  if (!userProg) {
    userProg = { userId, organizationId, steps: JSON.parse(JSON.stringify(DEFAULT_STEPS)) };
    progression.push(userProg);
    writeProgression(progression);
  }
  res.json(userProg.steps);
});

// PUT /api/progression - update a sub-task
app.put('/api/progression', auth, (req, res) => {
  const userId = req.user.id;
  const organizationId = req.user.organizationId;
  const { step, subTask, completed } = req.body;
  if (typeof step !== 'number' || typeof subTask !== 'number' || typeof completed !== 'boolean') {
    return res.status(400).json({ error: 'step, subTask, completed requis' });
  }
  let progression = readProgression();
  let userProg = progression.find(p => p.userId === userId && p.organizationId === organizationId);
  if (!userProg) {
    userProg = { userId, organizationId, steps: JSON.parse(JSON.stringify(DEFAULT_STEPS)) };
    progression.push(userProg);
  }
  const stepObj = userProg.steps.find(s => s.step === step);
  if (!stepObj || !stepObj.subTasks[subTask]) {
    return res.status(404).json({ error: 'Étape ou sous-tâche introuvable' });
  }
  stepObj.subTasks[subTask].completed = completed;
  // Recalculate step completion
  stepObj.completed = stepObj.subTasks.every(st => st.completed);
  stepObj.completedAt = stepObj.completed ? new Date().toISOString() : null;
  writeProgression(progression);
  res.json(userProg.steps);
});

// User Management Endpoints

// Get all users (admin only) - filtered by organization
app.get('/api/users', auth, isAdmin, (req, res) => {
  try {
    let users = [];
    if (fs.existsSync(USERS_PATH)) {
      users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    }
    // Filter by organization - admin can only see users from their organization
    const organizationUsers = users.filter(user => user.organizationId === req.user.organizationId);
    
    // Remove password from response
    const usersWithoutPassword = organizationUsers.map(user => ({
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      name: user.name || '',
      department: user.department || '',
      createdAt: user.createdAt || user.id,
      lastLogin: user.lastLogin || null,
      isActive: user.isActive !== false
    }));
    res.json(usersWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des utilisateurs' });
  }
});

// Get current user profile
app.get('/api/users/profile', auth, (req, res) => {
  try {
    let users = [];
    if (fs.existsSync(USERS_PATH)) {
      users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    }
    const user = users.find(u => u.id === req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    // Remove password from response
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      role: user.role,
      organizationId: user.organizationId,
      name: user.name || '',
      department: user.department || '',
      createdAt: user.createdAt || user.id,
      lastLogin: user.lastLogin || null,
      isActive: user.isActive !== false
    };
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
});

// Update user profile
app.put('/api/users/profile', auth, (req, res) => {
  try {
    const { name, department, currentPassword, newPassword } = req.body;
    let users = [];
    if (fs.existsSync(USERS_PATH)) {
      users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    }
    const userIndex = users.findIndex(u => u.id === req.user.id);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const user = users[userIndex];
    
    // Update basic info
    if (name !== undefined) user.name = name;
    if (department !== undefined) user.department = department;
    
    // Update password if provided
    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Mot de passe actuel requis' });
      }
      if (!bcrypt.compareSync(currentPassword, user.password)) {
        return res.status(400).json({ error: 'Mot de passe actuel incorrect' });
      }
      user.password = bcrypt.hashSync(newPassword, 10);
    }
    
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    logAudit({ user: req.user, action: 'update', type: 'profile', itemId: user.id, details: { name, department, passwordChanged: !!newPassword } });
    
    res.json({ success: true, message: 'Profil mis à jour avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' });
  }
});

// Create new user (admin only)
app.post('/api/users', auth, isAdmin, (req, res) => {
  try {
    const { email, password, role, name, department } = req.body;
    if (!email || !password || !role) {
      return res.status(400).json({ error: 'Email, mot de passe et rôle requis' });
    }
    
    let users = [];
    if (fs.existsSync(USERS_PATH)) {
      users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    }
    
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Utilisateur déjà existant' });
    }
    
    const hash = bcrypt.hashSync(password, 10);
    const newUser = {
      id: Date.now(),
      email,
      password: hash,
      role,
      name: name || '',
      department: department || '',
      organizationId: req.user.organizationId,
      createdAt: Date.now(),
      isActive: true
    };
    
    users.push(newUser);
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    
    logAudit({ user: req.user, action: 'create', type: 'user', itemId: newUser.id, details: { email, role, name, department } });
    
    // Return user without password
    const userWithoutPassword = {
      id: newUser.id,
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      department: newUser.department,
      organizationId: newUser.organizationId,
      createdAt: newUser.createdAt,
      isActive: newUser.isActive
    };
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création de l\'utilisateur' });
  }
});

// Update user (admin only) - can only update users from same organization
app.put('/api/users/:id', auth, isAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    const { email, role, name, department, isActive, newPassword } = req.body;
    
    let users = [];
    if (fs.existsSync(USERS_PATH)) {
      users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    }
    
    const userIndex = users.findIndex(u => u.id === userId && u.organizationId === req.user.organizationId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const user = users[userIndex];
    
    // Update fields
    if (email !== undefined) user.email = email;
    if (role !== undefined) user.role = role;
    if (name !== undefined) user.name = name;
    if (department !== undefined) user.department = department;
    if (isActive !== undefined) user.isActive = isActive;
    
    // Update password if provided
    if (newPassword) {
      user.password = bcrypt.hashSync(newPassword, 10);
    }
    
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    
    logAudit({ user: req.user, action: 'update', type: 'user', itemId: userId, details: { email, role, name, department, isActive, passwordChanged: !!newPassword } });
    
    // Return user without password
    const userWithoutPassword = {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
      department: user.department,
      organizationId: user.organizationId,
      createdAt: user.createdAt,
      lastLogin: user.lastLogin,
      isActive: user.isActive
    };
    
    res.json(userWithoutPassword);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'utilisateur' });
  }
});

// Delete user (admin only) - can only delete users from same organization
app.delete('/api/users/:id', auth, isAdmin, (req, res) => {
  try {
    const userId = parseInt(req.params.id);
    
    // Prevent admin from deleting themselves
    if (userId === req.user.id) {
      return res.status(400).json({ error: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    
    let users = [];
    if (fs.existsSync(USERS_PATH)) {
      users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    }
    
    const userIndex = users.findIndex(u => u.id === userId && u.organizationId === req.user.organizationId);
    if (userIndex === -1) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }
    
    const deletedUser = users[userIndex];
    users.splice(userIndex, 1);
    fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
    
    logAudit({ user: req.user, action: 'delete', type: 'user', itemId: userId, details: { email: deletedUser.email, role: deletedUser.role } });
    
    res.json({ success: true, message: 'Utilisateur supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'utilisateur' });
  }
});

// Get user roles (for dropdowns)
app.get('/api/roles', auth, (req, res) => {
  const roles = [
    { value: 'admin', label: 'Administrateur', description: 'Accès complet à toutes les fonctionnalités' },
    { value: 'dpo', label: 'DPO (Délégué à la Protection des Données)', description: 'Gestion de la conformité et des DPIAs' },
    { value: 'representant', label: 'Représentant légal', description: 'Responsable légal de l\'organisation' },
    { value: 'responsable', label: 'Responsable de traitement', description: 'Gestion des traitements de données' },
    { value: 'auditeur', label: 'Auditeur', description: 'Accès en lecture seule pour les audits' },
    { value: 'user', label: 'Utilisateur standard', description: 'Accès limité aux fonctionnalités de base' }
  ];
  res.json(roles);
});

// ISO 27001 Assessment endpoints

// Get all ISO 27001 assessments for the user's organization
app.get('/api/iso27001', auth, (req, res) => {
  try {
    const assessments = readISO27001();
    // Filter by organization
    const userAssessments = assessments.filter(assessment => 
      assessment.organizationId === req.user.organizationId
    );
    res.json(userAssessments);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des évaluations ISO 27001' });
  }
});

// Get latest ISO 27001 assessment for the user's organization
app.get('/api/iso27001/latest', auth, (req, res) => {
  try {
    const assessments = readISO27001();
    // Filter by organization and get the latest
    const userAssessments = assessments.filter(assessment => 
      assessment.organizationId === req.user.organizationId
    );
    
    if (userAssessments.length === 0) {
      return res.json(null);
    }
    
    // Sort by date and get the latest
    const latestAssessment = userAssessments.sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    )[0];
    
    res.json(latestAssessment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération de la dernière évaluation ISO 27001' });
  }
});

// Save ISO 27001 assessment
app.post('/api/iso27001', auth, (req, res) => {
  try {
    const { controls, summary, totalScore, complianceLevel } = req.body;
    
    if (!controls || !summary) {
      return res.status(400).json({ error: 'Données d\'évaluation requises' });
    }
    
    const assessments = readISO27001();
    
    const newAssessment = {
      id: Date.now(),
      organizationId: req.user.organizationId,
      userId: req.user.id,
      userEmail: req.user.email,
      controls,
      summary,
      totalScore,
      complianceLevel,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    assessments.push(newAssessment);
    writeISO27001(assessments);
    
    logAudit({ 
      user: req.user, 
      action: 'create', 
      type: 'iso27001_assessment', 
      itemId: newAssessment.id, 
      details: { 
        totalScore, 
        complianceLevel,
        controlsCount: Object.keys(controls).length 
      } 
    });
    
    res.json(newAssessment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la sauvegarde de l\'évaluation ISO 27001' });
  }
});

// Update ISO 27001 assessment
app.put('/api/iso27001/:id', auth, (req, res) => {
  try {
    const assessmentId = parseInt(req.params.id);
    const { controls, summary, totalScore, complianceLevel } = req.body;
    
    const assessments = readISO27001();
    const assessmentIndex = assessments.findIndex(a => a.id === assessmentId);
    
    if (assessmentIndex === -1) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    
    const assessment = assessments[assessmentIndex];
    
    // Check if user has permission to update this assessment
    if (assessment.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    // Update fields
    assessment.controls = controls;
    assessment.summary = summary;
    assessment.totalScore = totalScore;
    assessment.complianceLevel = complianceLevel;
    assessment.updatedAt = new Date().toISOString();
    
    writeISO27001(assessments);
    
    logAudit({ 
      user: req.user, 
      action: 'update', 
      type: 'iso27001_assessment', 
      itemId: assessmentId, 
      details: { 
        totalScore, 
        complianceLevel,
        controlsCount: Object.keys(controls).length 
      } 
    });
    
    res.json(assessment);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'évaluation ISO 27001' });
  }
});

// Delete ISO 27001 assessment
app.delete('/api/iso27001/:id', auth, (req, res) => {
  try {
    const assessmentId = parseInt(req.params.id);
    
    const assessments = readISO27001();
    const assessmentIndex = assessments.findIndex(a => a.id === assessmentId);
    
    if (assessmentIndex === -1) {
      return res.status(404).json({ error: 'Évaluation non trouvée' });
    }
    
    const assessment = assessments[assessmentIndex];
    
    // Check if user has permission to delete this assessment
    if (assessment.organizationId !== req.user.organizationId) {
      return res.status(403).json({ error: 'Accès non autorisé' });
    }
    
    assessments.splice(assessmentIndex, 1);
    writeISO27001(assessments);
    
    logAudit({ 
      user: req.user, 
      action: 'delete', 
      type: 'iso27001_assessment', 
      itemId: assessmentId, 
      details: { 
        totalScore: assessment.totalScore, 
        complianceLevel: assessment.complianceLevel 
      } 
    });
    
    res.json({ success: true, message: 'Évaluation supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'évaluation ISO 27001' });
  }
});

// Organization Management Endpoints

// Get current user's organization details
app.get('/api/organization', auth, (req, res) => {
  try {
    const organizations = readOrganizations();
    const organization = organizations.find(org => org.id === req.user.organizationId);
    
    if (!organization) {
      return res.status(404).json({ error: 'Organisation non trouvée' });
    }
    
    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des détails de l\'organisation' });
  }
});

// Update organization details (admin only)
app.put('/api/organization', auth, isAdmin, (req, res) => {
  try {
    const { name, description, address, phone, email, website, sector, size, logo } = req.body;
    
    const organizations = readOrganizations();
    const organizationIndex = organizations.findIndex(org => org.id === req.user.organizationId);
    
    if (organizationIndex === -1) {
      return res.status(404).json({ error: 'Organisation non trouvée' });
    }
    
    const organization = organizations[organizationIndex];
    
    // Update fields
    if (name !== undefined) organization.name = name;
    if (description !== undefined) organization.description = description;
    if (address !== undefined) organization.address = address;
    if (phone !== undefined) organization.phone = phone;
    if (email !== undefined) organization.email = email;
    if (website !== undefined) organization.website = website;
    if (sector !== undefined) organization.sector = sector;
    if (size !== undefined) organization.size = size;
    if (logo !== undefined) organization.logo = logo;
    
    organization.updatedAt = new Date().toISOString();
    
    writeOrganizations(organizations);
    
    logAudit({ 
      user: req.user, 
      action: 'update', 
      type: 'organization', 
      itemId: organization.id, 
      details: { name, description, address, phone, email, website, sector, size } 
    });
    
    res.json(organization);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour de l\'organisation' });
  }
});

// Get organization statistics (admin only)
app.get('/api/organization/stats', auth, isAdmin, (req, res) => {
  try {
    const organizationId = req.user.organizationId;
    
    // Get counts from different data sources
    let users = [];
    if (fs.existsSync(USERS_PATH)) {
      users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    }
    const userCount = users.filter(u => u.organizationId === organizationId).length;
    
    let dpias = [];
    if (fs.existsSync(DPIAS_PATH)) {
      dpias = JSON.parse(fs.readFileSync(DPIAS_PATH, 'utf-8'));
    }
    const dpiaCount = dpias.filter(d => d.organizationId === organizationId).length;
    
    let assessments = [];
    if (fs.existsSync(DATA_PATH)) {
      assessments = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
    }
    const assessmentCount = assessments.filter(a => a.organizationId === organizationId).length;
    
    let isoAssessments = readISO27001();
    const isoCount = isoAssessments.filter(a => a.organizationId === organizationId).length;
    
    let registers = [];
    if (fs.existsSync(REGISTERS_PATH)) {
      registers = JSON.parse(fs.readFileSync(REGISTERS_PATH, 'utf-8'));
    }
    const registerCount = registers.filter(r => r.organizationId === organizationId).length;
    
    const stats = {
      users: userCount,
      dpias: dpiaCount,
      assessments: assessmentCount,
      isoAssessments: isoCount,
      registers: registerCount,
      total: userCount + dpiaCount + assessmentCount + isoCount + registerCount
    };
    
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération des statistiques' });
  }
});

// Invitation Management Endpoints

// Generate invitation code
app.post('/api/invitations/generate', auth, isAdmin, (req, res) => {
  try {
    const { email, role } = req.body;
    if (!email || !role) {
      return res.status(400).json({ error: 'Email et rôle requis pour générer un code d\'invitation' });
    }

    // Check if user already exists
    let users = [];
    if (fs.existsSync(USERS_PATH)) {
      users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
    }
    if (users.find(u => u.email === email)) {
      return res.status(400).json({ error: 'Un utilisateur avec cet email existe déjà' });
    }

    const invitations = readInvitations();
    const existingInvitation = invitations.find(inv => inv.email === email && !inv.used);
    if (existingInvitation) {
      return res.status(400).json({ error: 'Un code d\'invitation actif existe déjà pour cet email' });
    }

    const invitationCode = generateInvitationCode();
    const invitation = {
      id: Date.now(),
      email: email.trim(),
      role,
      code: invitationCode,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
      organizationId: req.user.organizationId,
      used: false,
      usedBy: null,
      usedAt: null
    };
    
    invitations.push(invitation);
    writeInvitations(invitations);

    logAudit({ 
      user: req.user, 
      action: 'create', 
      type: 'invitation', 
      itemId: invitation.id, 
      details: { email, role, code: invitationCode } 
    });

    res.json({ 
      success: true,
      invitationCode,
      expiresAt: invitation.expiresAt,
      message: `Code d'invitation généré pour ${email}`
    });
  } catch (error) {
    console.error('Error generating invitation:', error);
    res.status(500).json({ error: 'Erreur lors de la génération du code d\'invitation' });
  }
});

// List invitations (admin only)
app.get('/api/invitations', auth, isAdmin, (req, res) => {
  try {
    const invitations = readInvitations();
    const organizationInvitations = invitations.filter(inv => inv.organizationId === req.user.organizationId);
    
    // Add organization info to invitations
    const organizations = readOrganizations();
    const invitationsWithOrg = organizationInvitations.map(inv => {
      const org = organizations.find(o => o.id === inv.organizationId);
      return {
        ...inv,
        organizationName: org ? org.name : 'Organisation inconnue'
      };
    });
    
    res.json(invitationsWithOrg);
  } catch (error) {
    console.error('Error fetching invitations:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération des invitations' });
  }
});

// Validate invitation code
app.post('/api/invitations/validate', (req, res) => {
  try {
    const { email, invitationCode } = req.body;
    if (!email || !invitationCode) {
      return res.status(400).json({ error: 'Email et code d\'invitation requis' });
    }

    const invitations = readInvitations();
    const invitation = invitations.find(inv => inv.email === email && inv.code === invitationCode);

    if (!invitation) {
      return res.status(404).json({ error: 'Code d\'invitation invalide ou expiré' });
    }

    if (invitation.used) {
      return res.status(400).json({ error: 'Code d\'invitation déjà utilisé' });
    }

    if (new Date(invitation.expiresAt) < new Date()) {
      return res.status(400).json({ error: 'Code d\'invitation expiré' });
    }

    res.json({ 
      success: true,
      message: 'Code d\'invitation valide',
      role: invitation.role,
      expiresAt: invitation.expiresAt
    });
  } catch (error) {
    console.error('Error validating invitation:', error);
    res.status(500).json({ error: 'Erreur lors de la validation du code d\'invitation' });
  }
});

// Delete invitation (admin only)
app.delete('/api/invitations/:id', auth, isAdmin, (req, res) => {
  try {
    const invitationId = parseInt(req.params.id);
    const invitations = readInvitations();
    const invitationIndex = invitations.findIndex(inv => 
      inv.id === invitationId && inv.organizationId === req.user.organizationId
    );
    
    if (invitationIndex === -1) {
      return res.status(404).json({ error: 'Invitation non trouvée' });
    }
    
    const invitation = invitations[invitationIndex];
    invitations.splice(invitationIndex, 1);
    writeInvitations(invitations);
    
    logAudit({ 
      user: req.user, 
      action: 'delete', 
      type: 'invitation', 
      itemId: invitationId, 
      details: { email: invitation.email, role: invitation.role } 
    });
    
    res.json({ success: true, message: 'Invitation supprimée avec succès' });
  } catch (error) {
    console.error('Error deleting invitation:', error);
    res.status(500).json({ error: 'Erreur lors de la suppression de l\'invitation' });
  }
});

app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
}); 