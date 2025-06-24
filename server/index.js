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

app.use(cors());
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

// Enregistrement utilisateur
app.post('/api/auth/register', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email et mot de passe requis' });
  let users = [];
  if (fs.existsSync(USERS_PATH)) {
    users = JSON.parse(fs.readFileSync(USERS_PATH, 'utf-8'));
  }
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Utilisateur déjà existant' });
  const hash = bcrypt.hashSync(password, 10);
  const user = { id: Date.now(), email, password: hash };
  users.push(user);
  fs.writeFileSync(USERS_PATH, JSON.stringify(users, null, 2));
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
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
  const token = jwt.sign({ id: user.id, email: user.email }, SECRET, { expiresIn: '7d' });
  res.json({ token });
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend opérationnel' });
});

// Load all assessments (protected)
app.get('/api/assessments', auth, (req, res) => {
  if (!fs.existsSync(DATA_PATH)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  res.json(data.filter(a => a.userId === req.user.id));
});

// Save a new assessment (protected)
app.post('/api/assessments', auth, (req, res) => {
  const assessment = req.body;
  let data = [];
  if (fs.existsSync(DATA_PATH)) {
    data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  }
  assessment.id = Date.now();
  assessment.userId = req.user.id;
  data.push(assessment);
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
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

// (Optionnel) Endpoints pour documents à ajouter ici

app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
}); 