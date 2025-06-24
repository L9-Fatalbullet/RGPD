import React from 'react';
import { SparklesIcon, ChartBarIcon, ShieldCheckIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const STATUS = [
  {
    icon: <ShieldCheckIcon className="w-8 h-8 text-green-700" />, 
    label: "Conforme",
    value: 4,
    color: "bg-green-100 border-green-300",
    desc: "Nombre de traitements conformes à la Loi 09-08."
  },
  {
    icon: <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />, 
    label: "À corriger",
    value: 2,
    color: "bg-yellow-100 border-yellow-300",
    desc: "Traitements nécessitant une mise à jour ou une action."
  },
];

const RECOMMENDATIONS = [
  "Mettre à jour le registre des traitements avant fin mai.",
  "Former le personnel sur la nouvelle politique de confidentialité.",
  "Vérifier la conformité des contrats avec les sous-traitants.",
];

export default function Dashboard() {
  return (
    <section>
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <SparklesIcon className="w-10 h-10 text-yellow-300" /> Tableau de bord conformité
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Suivi visuel de votre conformité à la Loi 09-08 et recommandations personnalisées.</p>
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
      {/* Compliance Status Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-10 animate-fade-in">
        {STATUS.map((s, i) => (
          <div key={i} className={`group ${s.color} border-l-4 rounded-xl shadow-lg p-6 flex items-center gap-4 hover:scale-105 hover:shadow-2xl transition animate-fade-in`} style={{ animationDelay: `${i * 0.1}s` }}>
            {s.icon}
            <div>
              <div className="text-2xl font-bold text-blue-900 group-hover:text-yellow-700 transition">{s.value}</div>
              <div className="font-semibold text-blue-900">{s.label}</div>
              <div className="text-gray-700 text-xs">{s.desc}</div>
            </div>
          </div>
        ))}
      </div>
      {/* Recommendations */}
      <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 mb-10 border-t-4 border-blue-100 animate-fade-in">
        <div className="font-bold text-blue-900 mb-2 flex items-center gap-2"><ChartBarIcon className="w-6 h-6 text-blue-700" />Recommandations</div>
        <ul className="list-disc pl-6 text-gray-700">
          {RECOMMENDATIONS.map((rec, i) => (
            <li key={i} className="mb-1 hover:text-blue-700 transition animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>{rec}</li>
          ))}
        </ul>
      </div>
      {/* Placeholder for future charts/visualizations */}
      <div className="bg-gradient-to-r from-blue-100 via-yellow-50 to-blue-50 rounded-xl shadow-inner p-8 flex flex-col items-center animate-fade-in">
        <div className="font-semibold text-blue-900 mb-2">Visualisation de la conformité (à venir)</div>
        <div className="w-32 h-32 bg-white/60 rounded-full flex items-center justify-center text-blue-700 font-bold text-2xl shadow-inner">--%</div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 