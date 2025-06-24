import React, { useState, useEffect } from 'react';
import { SparklesIcon, ChartBarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../App';

const API_URL = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev/api/assessments';

const DOMAINS = [
  { key: 'gouvernance', label: 'Gouvernance' },
  { key: 'juridique', label: 'Juridique' },
  { key: 'securite', label: 'Sécurité' },
  { key: 'droits', label: 'Droits des personnes' },
];

const QUESTIONS = [
  // Gouvernance
  { domain: 'gouvernance', label: "Avez-vous désigné un responsable de traitement ?", key: 'resp_traitement', help: "Obligation de nommer un responsable pour la gestion des données." },
  { domain: 'gouvernance', label: "Tenez-vous un registre des traitements à jour ?", key: 'registre', help: "Le registre est obligatoire pour documenter tous les traitements de données." },
  { domain: 'gouvernance', label: "Avez-vous défini une politique interne de protection des données ?", key: 'politique', help: "Une politique écrite formalise vos engagements et procédures." },
  // Juridique
  { domain: 'juridique', label: "Avez-vous déclaré vos traitements à la CNDP ?", key: 'declaration', help: "Tout traitement doit être déclaré à la CNDP avant sa mise en œuvre." },
  { domain: 'juridique', label: "Vos contrats avec les sous-traitants intègrent-ils des clauses CNDP ?", key: 'contrats', help: "Les contrats doivent prévoir la conformité à la Loi 09-08." },
  { domain: 'juridique', label: "Avez-vous réalisé une DPIA pour les traitements à risque ?", key: 'dpia', help: "Une analyse d'impact est requise pour les traitements à risque élevé." },
  // Sécurité
  { domain: 'securite', label: "Les accès aux données sont-ils restreints et tracés ?", key: 'acces', help: "Limiter et tracer les accès réduit les risques de fuite." },
  { domain: 'securite', label: "Utilisez-vous le chiffrement pour les données sensibles ?", key: 'chiffrement', help: "Le chiffrement protège les données en cas d'incident." },
  { domain: 'securite', label: "Avez-vous un plan de gestion des incidents ?", key: 'incidents', help: "Prévoir la gestion des violations de données est obligatoire." },
  // Droits des personnes
  { domain: 'droits', label: "Informez-vous les personnes concernées de leurs droits ?", key: 'information', help: "L'information des personnes est un droit fondamental." },
  { domain: 'droits', label: "Permettez-vous l'accès, la rectification et l'opposition ?", key: 'droits', help: "Les personnes doivent pouvoir exercer leurs droits facilement." },
  { domain: 'droits', label: "Avez-vous une procédure pour traiter les demandes d'exercice des droits ?", key: 'procedure_droits', help: "Une procédure claire accélère le traitement des demandes." },
];

const RECOMMENDATIONS = {
  resp_traitement: "Désignez un responsable de traitement et formalisez sa mission.",
  registre: "Mettez en place et tenez à jour un registre des traitements.",
  politique: "Rédigez une politique interne de protection des données.",
  declaration: "Déclarez tous vos traitements à la CNDP via le portail officiel.",
  contrats: "Ajoutez des clauses CNDP à vos contrats de sous-traitance.",
  dpia: "Réalisez une DPIA pour chaque traitement à risque élevé.",
  acces: "Restreignez et tracez les accès aux données personnelles.",
  chiffrement: "Chiffrez les données sensibles (santé, bancaires, etc.).",
  incidents: "Élaborez un plan de gestion des incidents et des violations.",
  information: "Informez systématiquement les personnes concernées de leurs droits.",
  droits: "Permettez l'accès, la rectification et l'opposition facilement.",
  procedure_droits: "Mettez en place une procédure pour traiter les demandes d'exercice des droits.",
};

export default function Assessment() {
  const { token } = useAuth();
  // answers: { [key]: 0|1|2 } 0=Non, 1=Partiel, 2=Oui
  const [answers, setAnswers] = useState(() => Object.fromEntries(QUESTIONS.map(q => [q.key, 0])));
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');

  // Load latest assessment on mount
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(API_URL, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data) && data.length > 0) {
          const latest = data[data.length - 1];
          if (latest.answers) setAnswers(latest.answers);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [token]);

  const handleChange = (key, value) => {
    setAnswers(a => ({ ...a, [key]: Number(value) }));
  };

  // Save assessment
  const handleSave = async () => {
    if (!token) return;
    setSaveStatus('Enregistrement...');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ answers, date: new Date().toISOString() })
      });
      const data = await res.json();
      if (data.success) setSaveStatus('Enregistré !');
      else setSaveStatus("Erreur lors de l'enregistrement.");
    } catch {
      setSaveStatus("Erreur réseau ou serveur.");
    }
  };

  // Radar chart data by domain
  const domainScores = DOMAINS.map(domain => {
    const domainQuestions = QUESTIONS.filter(q => q.domain === domain.key);
    const total = domainQuestions.reduce((sum, q) => sum + (answers[q.key] || 0), 0);
    return {
      domain: domain.label,
      score: domainQuestions.length ? Math.round((total / (domainQuestions.length * 2)) * 100) : 0,
    };
  });
  const max = 100;
  const points = domainScores.map((d, i, arr) => {
    const angle = (Math.PI * 2 * i) / arr.length - Math.PI / 2;
    const r = 60 * (d.score / max);
    return [70 + r * Math.cos(angle), 70 + r * Math.sin(angle)];
  });
  const polygon = points.map(([x, y]) => `${x},${y}`).join(' ');

  // Recommendations for unmet obligations
  const missing = QUESTIONS.filter(q => (answers[q.key] || 0) < 2);

  return (
    <section>
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <SparklesIcon className="w-10 h-10 text-yellow-300" /> Auto-évaluation Loi 09-08
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Vérifiez votre conformité réelle à la Loi marocaine sur la protection des données.</p>
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
      {/* Assessment Form */}
      <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-8 mb-10 border-t-4 border-blue-100 animate-fade-in">
        {loading ? (
          <div className="text-blue-700">Chargement...</div>
        ) : (
          <form className="space-y-8">
            {DOMAINS.map(domain => (
              <div key={domain.key} className="mb-6">
                <h2 className="text-lg font-bold text-blue-900 mb-2">{domain.label}</h2>
                <div className="grid md:grid-cols-2 gap-6">
                  {QUESTIONS.filter(q => q.domain === domain.key).map((q, i) => (
                    <div key={q.key} className="flex flex-col gap-2 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                      <label className="font-semibold text-blue-900 flex items-center gap-1">
                        {q.label}
                        <span title={q.help}><InformationCircleIcon className="w-4 h-4 text-blue-400 cursor-pointer" /></span>
                      </label>
                      <select className="rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400" value={answers[q.key]} onChange={e => handleChange(q.key, e.target.value)}>
                        <option value={0}>Non</option>
                        <option value={1}>Partiellement</option>
                        <option value={2}>Oui</option>
                      </select>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </form>
        )}
        <div className="flex flex-col md:flex-row gap-4 mt-6">
          <button className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded flex items-center text-lg font-semibold shadow transition-all animate-fade-in" onClick={() => setShow(true)} disabled={loading}>
            <ChartBarIcon className="w-5 h-5 mr-2" /> Voir le résultat
          </button>
          {token && (
            <button className="bg-blue-700 hover:bg-blue-900 text-white px-6 py-2 rounded font-semibold animate-fade-in" onClick={handleSave} type="button" disabled={loading}>
              Enregistrer mon évaluation
            </button>
          )}
        </div>
        {saveStatus && <div className="text-xs text-blue-700 mt-2 animate-fade-in">{saveStatus}</div>}
      </div>
      {/* Radar Chart Result & Recommendations */}
      {show && (
        <div className="flex flex-col items-center mb-10 animate-fade-in w-full">
          <div className="font-bold text-blue-900 mb-2">Radar de conformité par domaine</div>
          <svg width="140" height="140" viewBox="0 0 140 140" className="mb-2">
            <circle cx="70" cy="70" r="60" fill="#f1f5f9" />
            <polygon points="70,10 134,70 70,130 6,70" fill="#2563eb" fillOpacity="0.08" />
            <polygon points={polygon} fill="#facc15" fillOpacity="0.5" stroke="#2563eb" strokeWidth="2" />
            {domainScores.map((d, i) => {
              const angle = (Math.PI * 2 * i) / domainScores.length - Math.PI / 2;
              const r = 60 * (d.score / max);
              const x = 70 + r * Math.cos(angle);
              const y = 70 + r * Math.sin(angle);
              return <circle key={i} cx={x} cy={y} r="4" fill="#2563eb" stroke="#fff" strokeWidth="2" />;
            })}
          </svg>
          <div className="text-gray-700 text-sm mb-4">Score global : <span className="font-bold text-blue-900">{Math.round(domainScores.reduce((a, b) => a + b.score, 0) / domainScores.length)}%</span></div>
          {missing.length > 0 ? (
            <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded shadow w-full max-w-2xl mb-4">
              <div className="font-semibold text-yellow-800 mb-2">Obligations à traiter :</div>
              <ul className="list-disc pl-6 text-yellow-900">
                {missing.map(q => (
                  <li key={q.key} className="mb-1">{RECOMMENDATIONS[q.key]}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="text-green-700 font-semibold mb-4">Bravo ! Toutes les obligations principales sont remplies.</div>
          )}
        </div>
      )}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 