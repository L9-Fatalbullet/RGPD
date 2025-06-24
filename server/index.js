import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = process.env.PORT || 4000;
const DATA_PATH = path.resolve('./data/assessments.json');

app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Backend opérationnel' });
});

// Load all assessments (for demo, no auth)
app.get('/api/assessments', (req, res) => {
  if (!fs.existsSync(DATA_PATH)) return res.json([]);
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  res.json(data);
});

// Save a new assessment
app.post('/api/assessments', (req, res) => {
  const assessment = req.body;
  let data = [];
  if (fs.existsSync(DATA_PATH)) {
    data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  }
  assessment.id = Date.now();
  data.push(assessment);
  fs.writeFileSync(DATA_PATH, JSON.stringify(data, null, 2));
  res.json({ success: true, id: assessment.id });
});

// Get a single assessment by id
app.get('/api/assessments/:id', (req, res) => {
  if (!fs.existsSync(DATA_PATH)) return res.status(404).json({ error: 'Not found' });
  const data = JSON.parse(fs.readFileSync(DATA_PATH, 'utf-8'));
  const found = data.find(a => a.id === Number(req.params.id));
  if (!found) return res.status(404).json({ error: 'Not found' });
  res.json(found);
});

app.listen(PORT, () => {
  console.log(`Serveur backend lancé sur http://localhost:${PORT}`);
}); 