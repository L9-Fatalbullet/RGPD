import React, { useEffect, useState } from 'react';
import { SparklesIcon, ChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon, DocumentCheckIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const API_ASSESS = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev/api/assessments';
const API_REG = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev/api/registers';
const API_DPIA = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev/api/dpias';

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
  const [assessment, setAssessment] = useState(null);
  const [registers, setRegisters] = useState([]);
  const [dpias, setDpias] = useState([]);
  const [loading, setLoading] = useState(true);
  const [score, setScore] = useState(0);
  const [insights, setInsights] = useState([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch(API_ASSESS, { headers: { Authorization: `Bearer ${localStorage.getItem('cndp_token')}` } }).then(r => r.json()),
      fetch(API_REG, { headers: { Authorization: `Bearer ${localStorage.getItem('cndp_token')}` } }).then(r => r.json()),
      fetch(API_DPIA, { headers: { Authorization: `Bearer ${localStorage.getItem('cndp_token')}` } }).then(r => r.json()),
    ]).then(([assess, regs, dpias]) => {
      const latest = Array.isArray(assess) && assess.length > 0 ? assess[assess.length - 1] : null;
      setAssessment(latest);
      setRegisters(regs || []);
      setDpias(dpias || []);
      // Compute score
      let total = 0, max = 0;
      if (latest && latest.answers) {
        Object.values(latest.answers).forEach(v => { total += v; max += 2; });
      }
      let s = max > 0 ? Math.round((total / max) * 70) : 0; // 70% from assessment
      if (regs && regs.length > 0) s += 15; // 15% for register
      if (latest && latest.answers && latest.answers.dpia === 2 && dpias && dpias.length > 0) s += 15; // 15% for DPIA if needed
      setScore(s);
      // Insights
      const i = [];
      if (!latest) i.push({ icon: <ChartBarIcon className="w-5 h-5 text-yellow-600" />, text: "Aucune auto-évaluation trouvée.", link: "/assessment", action: "Faire l'auto-évaluation" });
      else {
        const missing = Object.entries(latest.answers).filter(([k, v]) => v < 2);
        if (missing.length > 0) i.push({ icon: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />, text: `${missing.length} obligation(s) non remplies dans l'auto-évaluation.`, link: "/assessment", action: "Compléter" });
        if (latest.answers.dpia === 2 && (!dpias || dpias.length === 0)) i.push({ icon: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600" />, text: "DPIA requise mais non réalisée.", link: "/dpia", action: "Faire une DPIA" });
      }
      if (!regs || regs.length === 0) i.push({ icon: <DocumentCheckIcon className="w-5 h-5 text-yellow-600" />, text: "Aucun registre des traitements trouvé.", link: "/register", action: "Créer un registre" });
      setInsights(i);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  return (
    <section>
      {/* Compliance Score Card */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <SparklesIcon className="w-10 h-10 text-yellow-300" /> Tableau de bord conformité
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Suivi visuel de votre conformité à la Loi 09-08 et recommandations personnalisées.</p>
          <div className="mt-6 flex items-center gap-4">
            <div className="bg-white/80 rounded-full shadow-lg flex items-center justify-center w-28 h-28 border-8 border-yellow-300">
              <span className="text-4xl font-extrabold text-blue-900 drop-shadow">{score}%</span>
            </div>
            <div className="flex flex-col gap-2">
              <div className="text-blue-900 font-bold text-lg">Score de conformité</div>
              <div className="text-gray-700 text-sm">Basé sur l'auto-évaluation, le registre et la DPIA.</div>
            </div>
          </div>
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
      {/* Actionable Insights */}
      <div className="mb-10 animate-fade-in">
        <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><CheckCircleIcon className="w-7 h-7 text-blue-700" /> Actions à mener</h2>
        {loading ? <div className="text-blue-700">Chargement...</div> : (
          insights.length === 0 ? <div className="text-green-700 font-semibold">Aucune action urgente. Bravo !</div> :
          <ul className="space-y-4">
            {insights.map((i, idx) => (
              <li key={idx} className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-4 flex items-center gap-4 border-l-4 border-yellow-400 animate-fade-in">
                {i.icon}
                <span className="flex-1 text-blue-900 font-semibold">{i.text}</span>
                <Link to={i.link} className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-4 py-2 rounded font-semibold shadow">{i.action}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      {/* Compliance Status Cards */}
      {/* REMOVE: <div className="grid md:grid-cols-2 gap-6 mb-10 animate-fade-in"> ... </div> */}
      {/* REMOVE: Recommendations section */}
      {/* REMOVE: Placeholder for future charts/visualizations */}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 