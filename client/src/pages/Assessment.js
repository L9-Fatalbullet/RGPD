import React, { useState } from 'react';
import { SparklesIcon, ChartBarIcon } from '@heroicons/react/24/outline';

const QUESTIONS = [
  { label: "Registre des traitements à jour", key: "registre" },
  { label: "Politique de confidentialité en place", key: "privacy" },
  { label: "Formation du personnel", key: "training" },
  { label: "Sécurité technique des données", key: "security" },
  { label: "Gestion des droits des personnes", key: "rights" },
];

export default function Assessment() {
  const [answers, setAnswers] = useState({ registre: 3, privacy: 2, training: 2, security: 3, rights: 2 });
  const [show, setShow] = useState(false);

  const handleChange = (key, value) => {
    setAnswers(a => ({ ...a, [key]: Number(value) }));
  };

  // Radar chart data
  const data = Object.values(answers);
  const max = 3;
  const points = data.map((v, i, arr) => {
    const angle = (Math.PI * 2 * i) / arr.length - Math.PI / 2;
    const r = 60 * (v / max);
    return [70 + r * Math.cos(angle), 70 + r * Math.sin(angle)];
  });
  const polygon = points.map(([x, y]) => `${x},${y}`).join(' ');

  return (
    <section>
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <SparklesIcon className="w-10 h-10 text-yellow-300" /> Auto-évaluation maturité
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Évaluez le niveau de maturité de votre conformité à la Loi 09-08.</p>
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
        <form className="grid md:grid-cols-2 gap-6">
          {QUESTIONS.map((q, i) => (
            <div key={q.key} className="flex flex-col gap-2 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <label className="font-semibold text-blue-900">{q.label}</label>
              <select className="rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400" value={answers[q.key]} onChange={e => handleChange(q.key, e.target.value)}>
                <option value={0}>Non commencé</option>
                <option value={1}>En cours</option>
                <option value={2}>Partiellement fait</option>
                <option value={3}>Totalement fait</option>
              </select>
            </div>
          ))}
        </form>
        <button className="mt-6 bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded flex items-center text-lg font-semibold shadow transition-all animate-fade-in" onClick={() => setShow(true)}>
          <ChartBarIcon className="w-5 h-5 mr-2" /> Voir le résultat
        </button>
      </div>
      {/* Radar Chart Result */}
      {show && (
        <div className="flex flex-col items-center mb-10 animate-fade-in">
          <div className="font-bold text-blue-900 mb-2">Radar de maturité</div>
          <svg width="140" height="140" viewBox="0 0 140 140" className="mb-2">
            <circle cx="70" cy="70" r="60" fill="#f1f5f9" />
            <polygon points="70,10 134,70 70,130 6,70" fill="#2563eb" fillOpacity="0.08" />
            <polygon points={polygon} fill="#facc15" fillOpacity="0.5" stroke="#2563eb" strokeWidth="2" />
            {data.map((v, i) => {
              const angle = (Math.PI * 2 * i) / data.length - Math.PI / 2;
              const r = 60 * (v / max);
              const x = 70 + r * Math.cos(angle);
              const y = 70 + r * Math.sin(angle);
              return <circle key={i} cx={x} cy={y} r="4" fill="#2563eb" stroke="#fff" strokeWidth="2" />;
            })}
          </svg>
          <div className="text-gray-700 text-sm">Niveau global : <span className="font-bold text-blue-900">{Math.round((data.reduce((a, b) => a + b, 0) / (data.length * max)) * 100)}%</span></div>
        </div>
      )}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 