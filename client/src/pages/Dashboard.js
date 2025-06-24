import React from 'react';
import { ChartBarIcon, ClipboardDocumentListIcon, BookOpenIcon, SparklesIcon } from '@heroicons/react/24/outline';

const stats = [
  { label: "Score de maturité", value: "70%", color: "bg-blue-100 text-blue-800", icon: <ChartBarIcon className="w-7 h-7 text-blue-600" /> },
  { label: "Traitements enregistrés", value: "5", color: "bg-yellow-100 text-yellow-800", icon: <ClipboardDocumentListIcon className="w-7 h-7 text-yellow-600" /> },
  { label: "DPIA réalisées", value: "2", color: "bg-green-100 text-green-800", icon: <SparklesIcon className="w-7 h-7 text-green-600" /> },
];

const actions = [
  { label: "Auto-évaluation", desc: "Évaluez votre conformité", to: "/assessment", icon: <ChartBarIcon className="w-6 h-6" /> },
  { label: "Générer un document", desc: "Créez vos documents CNDP", to: "/documents", icon: <ClipboardDocumentListIcon className="w-6 h-6" /> },
  { label: "Guide Loi 09-08", desc: "Découvrez les étapes clés", to: "/guide", icon: <BookOpenIcon className="w-6 h-6" /> },
  { label: "Bonnes pratiques", desc: "Conseils et actualités", to: "/best-practices", icon: <SparklesIcon className="w-6 h-6" /> },
];

export default function Dashboard() {
  return (
    <section>
      {/* Hero Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow">Bienvenue sur la plateforme Conformité CNDP</h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Votre assistant moderne pour la conformité à la Loi marocaine 09-08 sur la protection des données personnelles.</p>
          <div className="flex gap-4 mt-4">
            <a href="/assessment" className="bg-white/90 hover:bg-yellow-400 hover:text-blue-900 text-blue-900 font-bold px-6 py-3 rounded-lg shadow transition-all text-lg">Commencer l'auto-évaluation</a>
            <a href="/guide" className="bg-blue-800/80 hover:bg-blue-900 text-white font-semibold px-6 py-3 rounded-lg shadow transition-all text-lg">Voir le guide</a>
          </div>
        </div>
        <div className="flex-1 flex justify-center items-center">
          {/* Moroccan/CNDP-inspired SVG illustration */}
          <svg width="180" height="180" viewBox="0 0 180 180" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="90" cy="90" r="80" fill="#fff" fillOpacity="0.15" />
            <circle cx="90" cy="90" r="60" fill="#fff" fillOpacity="0.10" />
            <path d="M90 40 L110 90 L70 90 Z" fill="#2563eb" fillOpacity="0.7" />
            <circle cx="90" cy="90" r="20" fill="#facc15" fillOpacity="0.8" />
            <text x="90" y="97" textAnchor="middle" fontSize="22" fontWeight="bold" fill="#1e293b">CNDP</text>
          </svg>
        </div>
      </div>
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {stats.map((s, i) => (
          <div key={i} className={`rounded-xl shadow-lg p-6 flex flex-col items-center gap-2 ${s.color} animate-fade-in`} style={{ animationDelay: `${i * 0.1}s` }}>
            {s.icon}
            <div className="text-3xl font-extrabold">{s.value}</div>
            <div className="text-sm font-semibold opacity-80">{s.label}</div>
          </div>
        ))}
      </div>
      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8">
        {actions.map((a, i) => (
          <a
            key={a.to}
            href={a.to}
            className="group bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 flex items-center gap-6 hover:scale-[1.03] hover:shadow-2xl transition-all border-t-4 border-blue-100 hover:border-yellow-400 animate-fade-in"
            style={{ animationDelay: `${i * 0.1 + 0.3}s` }}
          >
            <div className="bg-blue-100 rounded-full p-4 group-hover:bg-yellow-400 transition-all">
              {a.icon}
            </div>
            <div>
              <div className="text-xl font-bold text-blue-900 group-hover:text-yellow-700 transition-all">{a.label}</div>
              <div className="text-gray-700 text-sm mt-1">{a.desc}</div>
            </div>
          </a>
        ))}
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 