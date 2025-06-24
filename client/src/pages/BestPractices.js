import React from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, UserGroupIcon, DocumentCheckIcon, NewspaperIcon, SparklesIcon } from '@heroicons/react/24/outline';

const PRACTICES = [
  {
    icon: <ShieldCheckIcon className="w-8 h-8 text-blue-700" />, 
    title: "Sécurisez les accès",
    desc: "Limitez l'accès aux données personnelles aux seules personnes autorisées et utilisez des mots de passe forts.",
  },
  {
    icon: <UserGroupIcon className="w-8 h-8 text-green-700" />,
    title: "Formez le personnel",
    desc: "Organisez des sessions de sensibilisation régulières sur la protection des données et la Loi 09-08.",
  },
  {
    icon: <DocumentCheckIcon className="w-8 h-8 text-purple-700" />,
    title: "Tenez un registre",
    desc: "Documentez tous les traitements de données et mettez à jour le registre en cas de changement.",
  },
  {
    icon: <ExclamationTriangleIcon className="w-8 h-8 text-yellow-600" />,
    title: "Signalez les incidents",
    desc: "En cas de violation de données, informez la CNDP et les personnes concernées dans les meilleurs délais.",
  },
  {
    icon: <ShieldCheckIcon className="w-8 h-8 text-blue-700" />,
    title: "Chiffrez les données sensibles",
    desc: "Utilisez le chiffrement pour protéger les données de santé, bancaires ou toute information à risque.",
  },
  {
    icon: <UserGroupIcon className="w-8 h-8 text-green-700" />,
    title: "Respectez les droits",
    desc: "Permettez l'accès, la rectification et l'opposition aux personnes concernées, conformément à la Loi 09-08.",
  },
];

const NEWS = [
  {
    icon: <NewspaperIcon className="w-6 h-6 text-blue-600" />,
    title: "Nouvelle décision CNDP",
    date: "Avril 2024",
    desc: "La CNDP rappelle l'obligation de déclaration préalable pour tout traitement biométrique.",
    link: "https://www.cndp.ma/"
  },
  {
    icon: <NewspaperIcon className="w-6 h-6 text-blue-600" />,
    title: "Campagne de sensibilisation",
    date: "Mars 2024",
    desc: "Lancement d'une campagne nationale sur la protection des données dans le secteur public.",
    link: "https://www.cndp.ma/"
  },
];

export default function BestPractices() {
  return (
    <section>
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <SparklesIcon className="w-10 h-10 text-yellow-300" /> Bonnes pratiques
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Conseils et actualités pour une gestion conforme des données personnelles au Maroc.</p>
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
      {/* Best Practices Cards */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10 animate-fade-in">
        {PRACTICES.map((p, i) => (
          <div key={i} className="bg-white/80 backdrop-blur rounded-xl shadow-lg hover:shadow-2xl hover:scale-105 transition p-6 flex flex-col items-start gap-3 border-t-4 border-blue-100 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            {p.icon}
            <div className="font-semibold text-blue-900 text-lg">{p.title}</div>
            <div className="text-gray-700 text-sm">{p.desc}</div>
          </div>
        ))}
      </div>
      {/* News/Updates */}
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow mb-4 animate-fade-in">
        <div className="font-semibold text-blue-900 mb-2 flex items-center gap-2"><NewspaperIcon className="w-6 h-6" />Actualités CNDP</div>
        <ul className="divide-y divide-blue-100">
          {NEWS.map((n, i) => (
            <li key={i} className="py-2 flex items-start gap-3">
              {n.icon}
              <div>
                <div className="font-semibold text-blue-800">{n.title} <span className="text-xs text-gray-500">({n.date})</span></div>
                <div className="text-gray-700 text-sm">{n.desc}</div>
                <a href={n.link} target="_blank" rel="noopener noreferrer" className="text-blue-700 text-xs hover:underline">En savoir plus</a>
              </div>
            </li>
          ))}
        </ul>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 