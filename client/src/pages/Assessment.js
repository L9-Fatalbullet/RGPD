import React, { useState } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { ChartBarIcon } from '@heroicons/react/24/outline';

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
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <ChartBarIcon className="w-10 h-10 text-yellow-300" /> Auto-évaluation de maturité
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Évaluez votre conformité à la Loi 09-08 grâce à un questionnaire dynamique et obtenez des recommandations personnalisées.</p>
        </div>
        <div className="flex-1 flex justify-center items-center">
          {/* Moroccan-inspired SVG */}
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="70" cy="70" r="60" fill="#fff" fillOpacity="0.12" />
            <circle cx="70" cy="70" r="40" fill="#fff" fillOpacity="0.10" />
            <path d="M70 30 L90 70 L50 70 Z" fill="#2563eb" fillOpacity="0.7" />
            <circle cx="70" cy="70" r="14" fill="#facc15" fillOpacity="0.8" />
            <text x="70" y="77" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e293b">CNDP</text>
          </svg>
        </div>
      </div>
      {/* Save/Load Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-4">
        <button onClick={() => setSaveStatus('Fonctionnalité à venir !')} className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded shadow text-sm transition-all">Sauvegarder mes réponses</button>
        <div className="flex items-center gap-2">
          <input
            type="text"
            placeholder="ID à charger"
            value={loadId}
            onChange={e => setLoadId(e.target.value)}
            className="border rounded px-2 py-1 text-sm"
            style={{ width: 120 }}
          />
          <button onClick={() => setLoadStatus('Fonctionnalité à venir !')} className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-3 py-2 rounded text-sm transition-all">Charger</button>
        </div>
      </div>
      {saveStatus && <div className="text-xs text-blue-700 mb-2 animate-fade-in">{saveStatus}</div>}
      {loadStatus && <div className="text-xs text-green-700 mb-2 animate-fade-in">{loadStatus}</div>}
      {/* Questionnaire */}
      {!submitted ? (
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="w-full bg-gray-200 rounded-full h-4 mb-4 overflow-hidden">
            <div
              className="bg-gradient-to-r from-yellow-400 via-blue-600 to-blue-900 h-4 rounded-full transition-all animate-fade-in"
              style={{ width: `${(answers.filter(a => a > 0).length / QUESTIONS.length) * 100}%` }}
            ></div>
          </div>
          <div className="grid md:grid-cols-2 gap-8">
            {QUESTIONS.map((q, idx) => (
              <div key={idx} className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 flex flex-col gap-2 border-t-4 border-blue-100 animate-fade-in" style={{ animationDelay: `${idx * 0.03}s` }}>
                <span className="font-medium text-blue-900 text-lg">{q.text}</span>
                <div className="flex gap-2 mt-2">
                  {[1, 2, 3, 4, 5].map(val => (
                    <label key={val} className={`cursor-pointer flex flex-col items-center text-xs ${answers[idx] === val ? 'text-yellow-600 font-bold scale-110' : 'text-gray-500'} transition-all`}>
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
            className="block mx-auto mt-6 bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white font-semibold px-10 py-3 rounded-xl shadow-lg text-lg transition-all animate-fade-in"
            disabled={answers.some(a => a === 0)}
          >
            Voir mes résultats
          </button>
        </form>
      ) : (
        <div className="space-y-8 animate-fade-in">
          <div className="flex flex-col md:flex-row gap-8 items-center">
            <div className="flex-1">
              <h2 className="text-2xl font-semibold mb-2 text-blue-900">Votre score global : <span className="text-yellow-500">{globalScore}%</span></h2>
              <div className="mb-2 text-lg">Niveau de maturité : <span className="font-bold">{maturity}</span></div>
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
            <div className="flex-1 bg-white/80 backdrop-blur rounded-xl shadow-lg p-8">
              <h3 className="font-semibold mb-2 text-blue-800 text-xl">Recommandations personnalisées</h3>
              {weakDomains.length === 0 ? (
                <div className="text-green-700 text-lg">Bravo ! Aucun domaine faible détecté.</div>
              ) : (
                <ul className="list-disc ml-6 text-gray-700 text-base">
                  {weakDomains.map(d => (
                    <li key={d.key}><b>{d.domain} :</b> {RECOMMENDATIONS[d.key]}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <button
            className="block mx-auto bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold px-8 py-3 rounded-xl text-lg transition-all"
            onClick={() => setSubmitted(false)}
          >
            Refaire l'évaluation
          </button>
        </div>
      )}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 