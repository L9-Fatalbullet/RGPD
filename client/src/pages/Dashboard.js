import React from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { CheckCircleIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';

const DOMAINS = [
  { key: 'gouvernance', label: 'Gouvernance', color: 'bg-blue-100', icon: <CheckCircleIcon className="w-6 h-6 text-blue-700" /> },
  { key: 'juridique', label: 'Juridique', color: 'bg-green-100', icon: <CheckCircleIcon className="w-6 h-6 text-green-700" /> },
  { key: 'technique', label: 'Technique', color: 'bg-yellow-100', icon: <CheckCircleIcon className="w-6 h-6 text-yellow-700" /> },
  { key: 'sensibilisation', label: 'Sensibilisation', color: 'bg-purple-100', icon: <CheckCircleIcon className="w-6 h-6 text-purple-700" /> },
];

// Mock scores (replace with backend data later)
const domainScores = [
  { domain: 'Gouvernance', score: 70, key: 'gouvernance' },
  { domain: 'Juridique', score: 55, key: 'juridique' },
  { domain: 'Technique', score: 80, key: 'technique' },
  { domain: 'Sensibilisation', score: 40, key: 'sensibilisation' },
];
const globalScore = Math.round(domainScores.reduce((sum, d) => sum + d.score, 0) / domainScores.length);
let maturity = 'Faible';
if (globalScore >= 80) maturity = 'Élevé';
else if (globalScore >= 50) maturity = 'Moyen';

const RECOMMENDATIONS = {
  gouvernance: "Renforcez la gouvernance en désignant un responsable et en documentant vos procédures.",
  juridique: "Mettez à jour vos mentions légales et assurez-vous de la conformité des contrats.",
  technique: "Améliorez la sécurité technique : chiffrement, sauvegardes, contrôle d'accès.",
  sensibilisation: "Développez la formation et la sensibilisation de votre personnel.",
};

export default function Dashboard() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-2">Tableau de bord de conformité</h1>
      <p className="text-gray-700 mb-4">Visualisez votre niveau de maturité et suivez vos progrès vers la conformité à la Loi 09-08.</p>
      <div className="w-full bg-gray-200 rounded-full h-3 mb-6">
        <div
          className="bg-blue-600 h-3 rounded-full transition-all"
          style={{ width: `${globalScore}%` }}
        ></div>
      </div>
      <div className="flex flex-col md:flex-row gap-8 items-center mb-8">
        <div className="flex-1 bg-white rounded shadow p-6 flex flex-col items-center">
          <div className="text-4xl font-extrabold text-blue-700 mb-2">{globalScore}%</div>
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
        <div className="flex-1 grid grid-cols-1 gap-4">
          {domainScores.map((d, i) => (
            <div key={d.key} className={`flex items-center gap-3 rounded p-4 shadow ${DOMAINS[i].color}`}>
              {d.score >= 60 ? DOMAINS[i].icon : <ExclamationTriangleIcon className="w-6 h-6 text-red-500" />}
              <div>
                <div className="font-semibold text-gray-800">{DOMAINS[i].label} <span className="ml-2 text-sm font-normal text-gray-500">{d.score}%</span></div>
                <div className="text-xs text-gray-700 mt-1">
                  {d.score < 60 ? <span className="text-red-600 font-medium">{RECOMMENDATIONS[d.key]}</span> : <span className="text-green-700">Conforme</span>}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow mb-4">
        <div className="font-semibold text-blue-900 mb-1">Conseil général :</div>
        <div className="text-gray-700 text-sm">Pour atteindre un niveau de conformité élevé, améliorez les domaines faibles et maintenez les bonnes pratiques dans les domaines forts.</div>
      </div>
    </section>
  );
} 