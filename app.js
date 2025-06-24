const express = require('express');
const fs = require('fs');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const registrePath = path.join(__dirname, 'data', 'registre.json');
const dpiaPath = path.join(__dirname, 'data', 'dpias.json');

// --- Registre des traitements ---
app.get('/api/registre', (req, res) => {
  fs.readFile(registrePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur de lecture du registre.' });
    res.json(JSON.parse(data));
  });
});

app.post('/api/registre', (req, res) => {
  const newEntry = req.body;
  fs.readFile(registrePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur de lecture du registre.' });
    const registre = JSON.parse(data);
    newEntry.id = Date.now();
    registre.push(newEntry);
    fs.writeFile(registrePath, JSON.stringify(registre, null, 2), err2 => {
      if (err2) return res.status(500).json({ error: 'Erreur d\'écriture.' });
      res.json(newEntry);
    });
  });
});

app.put('/api/registre/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const updated = req.body;
  fs.readFile(registrePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur de lecture du registre.' });
    let registre = JSON.parse(data);
    registre = registre.map(item => item.id === id ? { ...item, ...updated } : item);
    fs.writeFile(registrePath, JSON.stringify(registre, null, 2), err2 => {
      if (err2) return res.status(500).json({ error: 'Erreur d\'écriture.' });
      res.json({ success: true });
    });
  });
});

app.delete('/api/registre/:id', (req, res) => {
  const id = parseInt(req.params.id);
  fs.readFile(registrePath, 'utf8', (err, data) => {
    if (err) return res.status(500).json({ error: 'Erreur de lecture du registre.' });
    let registre = JSON.parse(data);
    registre = registre.filter(item => item.id !== id);
    fs.writeFile(registrePath, JSON.stringify(registre, null, 2), err2 => {
      if (err2) return res.status(500).json({ error: 'Erreur d\'écriture.' });
      res.json({ success: true });
    });
  });
});

// --- DPIA (Analyse d'impact) ---
app.post('/api/dpia', (req, res) => {
  const { scenario, details } = req.body;
  // Simple risk calculation based on keywords (for demo)
  let risk = 'Faible';
  let notify = false;
  if (/sensible|santé|biométrique|mineur|profilage/i.test(scenario + ' ' + details)) {
    risk = 'Élevé';
    notify = true;
  } else if (/client|employé|localisation|vidéo/i.test(scenario + ' ' + details)) {
    risk = 'Moyen';
  }
  res.json({ risk, notify });
});

// --- Legal references ---
app.get('/api/legal', (req, res) => {
  res.json({
    loi: 'Loi 09-08 relative à la protection des personnes physiques à l\'égard du traitement des données à caractère personnel.',
    cndp: 'La CNDP veille à la protection des données personnelles et à l\'application de la loi 09-08.',
    droits: [
      'Droit d\'accès',
      'Droit de rectification',
      'Droit d\'opposition',
      'Droit à l\'information',
      'Droit à l\'oubli'
    ],
    declaration: 'Toute collecte ou traitement de données doit être déclaré à la CNDP.'
  });
});

app.listen(PORT, () => {
  console.log(`Serveur lancé sur http://localhost:${PORT}`);
}); 