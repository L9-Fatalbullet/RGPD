import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';

// Example questions by domain
const DOMAINS = [
  { key: 'gouvernance', label: 'Gouvernance' },
  { key: 'juridique', label: 'Juridique' },
  { key: 'technique', label: 'Technique' },
  { key: 'sensibilisation', label: 'Sensibilisation' },
];

const QUESTIONS = [
  { domain: 'gouvernance', text: "Avez-vous désigné un responsable de traitement ?" },
  { domain: 'gouvernance', text: "Disposez-vous d'une politique de protection des données ?" },
  { domain: 'gouvernance', text: "Tenez-vous un registre des traitements ?" },
  { domain: 'gouvernance', text: "Avez-vous défini des procédures internes pour la gestion des données ?" },
  { domain: 'juridique', text: "Avez-vous informé les personnes concernées de leurs droits ?" },
  { domain: 'juridique', text: "Recueillez-vous le consentement lorsque nécessaire ?" },
  { domain: 'juridique', text: "Vos contrats intègrent-ils des clauses CNDP ?" },
  { domain: 'juridique', text: "Avez-vous déclaré vos traitements à la CNDP ?" },
  { domain: 'technique', text: "Les données sont-elles stockées de façon sécurisée ?" },
  { domain: 'technique', text: "Utilisez-vous le chiffrement pour les données sensibles ?" },
  { domain: 'technique', text: "Avez-vous mis en place des sauvegardes régulières ?" },
  { domain: 'technique', text: "Contrôlez-vous les accès aux données ?" },
  { domain: 'sensibilisation', text: "Formez-vous régulièrement le personnel à la protection des données ?" },
  { domain: 'sensibilisation', text: "Avez-vous affiché des consignes de sécurité ?" },
  { domain: 'sensibilisation', text: "Communiquez-vous sur les bonnes pratiques ?" },
  { domain: 'sensibilisation', text: "Avez-vous un point de contact pour les questions RGPD ?" },
  // 4 more for a total of 20
  { domain: 'gouvernance', text: "Avez-vous un plan de gestion des incidents ?" },
  { domain: 'juridique', text: "Respectez-vous les durées de conservation légales ?" },
  { domain: 'technique', text: "Avez-vous testé vos procédures de restauration ?" },
  { domain: 'sensibilisation', text: "Sensibilisez-vous les nouveaux arrivants ?" },
];

const RECOMMENDATIONS = {
  gouvernance: "Renforcez la gouvernance en désignant un responsable et en documentant vos procédures.",
  juridique: "Mettez à jour vos mentions légales et assurez-vous de la conformité des contrats.",
  technique: "Améliorez la sécurité technique : chiffrement, sauvegardes, contrôle d'accès.",
  sensibilisation: "Développez la formation et la sensibilisation de votre personnel.",
};

const API_URL = 'http://localhost:4000/api/assessments';

export default function Assessment() {
  const [answers, setAnswers] = useState(Array(QUESTIONS.length).fill(0));
  const [submitted, setSubmitted] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [loadId, setLoadId] = useState('');
  const [loadStatus, setLoadStatus] = useState('');

  // Calculate domain scores
  const domainScores = DOMAINS.map(domain => {
    const domainQuestions = QUESTIONS.map((q, i) => ({ ...q, idx: i })).filter(q => q.domain === domain.key);
    const total = domainQuestions.reduce((sum, q) => sum + (answers[q.idx] || 0), 0);
    return {
      domain: domain.label,
      score: domainQuestions.length ? Math.round((total / (domainQuestions.length * 5)) * 100) : 0,
      raw: total,
      max: domainQuestions.length * 5,
      key: domain.key,
    };
  });
  const globalScore = Math.round(domainScores.reduce((sum, d) => sum + d.score, 0) / DOMAINS.length);

  // Maturity level
  let maturity = 'Faible';
  if (globalScore >= 80) maturity = 'Élevé';
  else if (globalScore >= 50) maturity = 'Moyen';

  // Recommendations
  const weakDomains = domainScores.filter(d => d.score < 60);

  function handleChange(idx, value) {
    const newAnswers = [...answers];
    newAnswers[idx] = Number(value);
    setAnswers(newAnswers);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setSubmitted(true);
  }

  async function handleSave() {
    setSaveStatus('Enregistrement...');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers, date: new Date().toISOString() })
      });
      const data = await res.json();
      if (data.success) {
        setSaveStatus(`Enregistré ! ID : ${data.id}`);
      } else {
        setSaveStatus("Erreur lors de l'enregistrement.");
      }
    } catch (e) {
      setSaveStatus("Erreur réseau ou serveur.");
    }
  }

  async function handleLoad() {
    setLoadStatus('Chargement...');
    try {
      const res = await fetch(`${API_URL}/${loadId}`);
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();
      if (data.answers) {
        setAnswers(data.answers);
        setSubmitted(false);
        setLoadStatus('Chargé !');
      } else {
        setLoadStatus("Aucune donnée trouvée.");
      }
    } catch (e) {
      setLoadStatus("Erreur lors du chargement.");
    }
  }

  return (
    <section>
      <h1 className="text-2xl font-bold mb-2">Auto-évaluation de maturité</h1>
      <p className="text-gray-700 mb-4">Répondez au questionnaire pour évaluer votre conformité à la Loi 09-08.</p>
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <button onClick={handleSave} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow text-sm">Sauvegarder mes réponses</button>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="ID à charger"
            value={loadId}
            onChange={e => setLoadId(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            style={{ width: 120 }}
          />
          <button onClick={handleLoad} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm">Charger</button>
        </div>
      </div>
      {saveStatus && <div className="text-xs text-blue-700 mb-2">{saveStatus}</div>}
      {loadStatus && <div className="text-xs text-green-700 mb-2">{loadStatus}</div>}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="w-full bg-gray-200 rounded-full h-3 mb-4">
            <div
              className="bg-blue-600 h-3 rounded-full transition-all"
              style={{ width: `${(answers.filter(a => a > 0).length / QUESTIONS.length) * 100}%` }}
            ></div>
          </div>
          <div className="grid md:grid-cols-2 gap-6">
            {QUESTIONS.map((q, idx) => (
              <div key={idx} className="bg-white rounded shadow p-4 flex flex-col gap-2">
                <span className="font-medium text-gray-800">{q.text}</span>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <label key={val} className={`cursor-pointer flex flex-col items-center text-xs ${answers[idx] === val ? 'text-blue-700 font-bold' : 'text-gray-500'}`}>
                      <input
                        type="radio"
                        name={`q${idx}`}
                        value={val}
                        checked={answers[idx] === val}
                        onChange={() => handleChange(idx, val)}
                        className="accent-blue-700 mb-1"
                      />
                      {val}
                    </label>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <button
            type="submit"
            className="block mx-auto mt-6 bg-blue-700 hover:bg-blue-800 text-white font-semibold px-8 py-2 rounded shadow"
            disabled={answers.some(a => a === 0)}
          >
            Voir mes résultats
          </button>
        </form>
      ) : (
        <div className="space-y-8">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-xl font-semibold mb-2">Votre score global : <span className="text-blue-700">{globalScore}%</span></h2>
              <div className="mb-2">Niveau de maturité : <span className="font-bold">{maturity}</span></div>
              <div className="w-full h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart data={domainScores} outerRadius={90}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="domain" />
                    <PolarRadiusAxis angle={30} domain={[0, 100]} />
                    <Radar name="Score" dataKey="score" stroke="#2563eb" fill="#2563eb" fillOpacity={0.5} />
                  </RadarChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="flex-1 bg-white rounded shadow p-6">
              <h3 className="font-semibold mb-2 text-blue-800">Recommandations personnalisées</h3>
              {weakDomains.length === 0 ? (
                <div className="text-green-700">Bravo ! Aucun domaine faible détecté.</div>
              ) : (
                <ul className="list-disc ml-6 text-gray-700">
                  {weakDomains.map(d => (
                    <li key={d.key}><b>{d.domain} :</b> {RECOMMENDATIONS[d.key]}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button
            className="block mx-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-6 py-2 rounded"
            onClick={() => setSubmitted(false)}
          >
            Refaire l'évaluation
          </button>
        </div>
      )}
    </section>
  );
} 