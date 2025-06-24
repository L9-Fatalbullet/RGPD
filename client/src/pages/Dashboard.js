import React, { useEffect, useState } from 'react';
import { SparklesIcon, ChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon, DocumentCheckIcon, ShieldCheckIcon, ArrowRightCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
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

// Add a Moroccan geometric SVG pattern as a background accent
const MoroccanPattern = () => (
  <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex:0}} viewBox="0 0 600 400" fill="none" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <pattern id="moroccan" width="60" height="60" patternUnits="userSpaceOnUse">
        <path d="M30 0 L60 30 L30 60 L0 30 Z" fill="#2563eb" fillOpacity="0.04" />
        <circle cx="30" cy="30" r="8" fill="#facc15" fillOpacity="0.08" />
      </pattern>
    </defs>
    <rect width="600" height="400" fill="url(#moroccan)" />
  </svg>
);

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
    <div className="relative min-h-screen bg-gradient-to-br from-blue-100 via-white to-yellow-50 overflow-x-hidden">
      <MoroccanPattern />
      <div className="relative z-10 max-w-5xl mx-auto px-2 sm:px-6 py-8">
        {/* Hero Section */}
        <div className="mb-10 flex flex-col items-center text-center">
          <div className="backdrop-blur-md bg-white/60 border border-white/30 rounded-2xl shadow-xl p-8 w-full max-w-3xl mx-auto transition hover:scale-[1.01] hover:shadow-2xl">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-blue-900 mb-2 tracking-tight flex items-center justify-center gap-3">
              <SparklesIcon className="w-10 h-10 text-yellow-400 animate-pulse" />
              Tableau de bord conformité
            </h1>
            <p className="text-lg sm:text-xl text-blue-800 font-light mb-2">Votre conformité à la Loi 09-08, en toute élégance.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mt-4">
              <span className="inline-block bg-gradient-to-r from-yellow-300 via-blue-200 to-blue-400 text-blue-900 font-semibold px-6 py-2 rounded-full shadow">Score actuel : <span className="font-bold text-blue-900">{score}%</span></span>
              <span className="inline-block bg-gradient-to-r from-blue-200 via-yellow-200 to-yellow-400 text-blue-900 font-semibold px-6 py-2 rounded-full shadow">Mise à jour : <span className="font-bold">{(() => {
                const dates = [];
                if (assessment && assessment.date) dates.push(new Date(assessment.date));
                if (registers && registers.length > 0) dates.push(...registers.map(r => new Date(r.date)));
                if (dpias && dpias.length > 0) dates.push(...dpias.map(d => new Date(d.date)));
                if (dates.length === 0) return '--';
                const last = new Date(Math.max(...dates.map(d => d.getTime())));
                return last.toLocaleDateString('fr-FR');
              })()}</span></span>
            </div>
          </div>
        </div>
        {/* Glassmorphism Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          <div className="backdrop-blur-md bg-white/60 border border-white/30 rounded-2xl shadow-xl p-6 flex flex-col items-center transition hover:scale-105 hover:shadow-2xl">
            <ChartBarIcon className="w-10 h-10 text-blue-700 mb-2" />
            <div className="text-lg font-bold text-blue-900">Score de conformité</div>
            <div className="text-2xl font-extrabold text-green-600 mt-1">{score}%</div>
          </div>
          <div className="backdrop-blur-md bg-white/60 border border-white/30 rounded-2xl shadow-xl p-6 flex flex-col items-center transition hover:scale-105 hover:shadow-2xl">
            <DocumentCheckIcon className="w-10 h-10 text-amber-600 mb-2" />
            <div className="text-lg font-bold text-blue-900">Traitements</div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">{registers.length}</div>
          </div>
          <div className="backdrop-blur-md bg-white/60 border border-white/30 rounded-2xl shadow-xl p-6 flex flex-col items-center transition hover:scale-105 hover:shadow-2xl">
            <ShieldCheckIcon className="w-10 h-10 text-fuchsia-600 mb-2" />
            <div className="text-lg font-bold text-blue-900">DPIA</div>
            <div className="text-2xl font-extrabold text-fuchsia-700 mt-1">{dpias.length}</div>
          </div>
          <div className="backdrop-blur-md bg-white/60 border border-white/30 rounded-2xl shadow-xl p-6 flex flex-col items-center transition hover:scale-105 hover:shadow-2xl">
            <CheckCircleIcon className="w-10 h-10 text-emerald-600 mb-2" />
            <div className="text-lg font-bold text-blue-900">Dernière mise à jour</div>
            <div className="text-base font-semibold text-emerald-700 mt-1">{(() => {
              const dates = [];
              if (assessment && assessment.date) dates.push(new Date(assessment.date));
              if (registers && registers.length > 0) dates.push(...registers.map(r => new Date(r.date)));
              if (dpias && dpias.length > 0) dates.push(...dpias.map(d => new Date(d.date)));
              if (dates.length === 0) return '--';
              const last = new Date(Math.max(...dates.map(d => d.getTime())));
              return last.toLocaleDateString('fr-FR');
            })()}</div>
          </div>
        </div>
        {/* Actions & Progression */}
        <div className="bg-white/70 backdrop-blur-md border border-white/30 rounded-2xl shadow-lg p-8 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
          <div className="flex-1 w-full">
            <h2 className="text-xl font-bold text-blue-800 mb-2">Actions recommandées</h2>
            <ul className="list-disc pl-6 text-blue-900 space-y-2">
              {insights.length === 0 ? (
                <li>Toutes les exigences principales sont remplies. Continuez la veille réglementaire !</li>
              ) : (
                insights.map((i, idx) => <li key={idx}>{i.text}</li>)
              )}
            </ul>
          </div>
          <div className="flex-1 w-full flex flex-col items-center">
            <h2 className="text-xl font-bold text-blue-800 mb-2">Progression</h2>
            <div className="w-32 h-32 bg-gradient-to-tr from-blue-100 to-blue-300 rounded-full flex items-center justify-center shadow-inner">
              <span className="text-4xl font-extrabold text-blue-800">{score}%</span>
            </div>
            <div className="mt-2 text-blue-700 text-sm">de conformité atteinte</div>
          </div>
        </div>
        {/* Progress Bar / Checklist */}
        <div className="mb-10 animate-fade-in">
          <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><ArrowPathIcon className="w-7 h-7 text-blue-700" /> Progression</h2>
          <div className="w-full bg-blue-100 rounded-full h-4 mb-4">
            <div className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 h-4 rounded-full transition-all" style={{ width: `${(() => {
              let steps = 3;
              let done = 0;
              if (assessment) done++;
              if (registers && registers.length > 0) done++;
              if (assessment && assessment.answers && assessment.answers.dpia === 2) {
                if (dpias && dpias.length > 0) done++;
              } else {
                steps--;
              }
              return Math.round((done / steps) * 100);
            })()}%` }}></div>
          </div>
          <ul className="flex flex-col md:flex-row gap-4 md:gap-8">
            <li className="flex items-center gap-2">
              <ChartBarIcon className={`w-6 h-6 ${assessment ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={assessment ? 'text-green-700 font-semibold' : 'text-gray-500'}>Auto-évaluation</span>
            </li>
            <li className="flex items-center gap-2">
              <DocumentCheckIcon className={`w-6 h-6 ${registers && registers.length > 0 ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={registers && registers.length > 0 ? 'text-green-700 font-semibold' : 'text-gray-500'}>Registre</span>
            </li>
            <li className="flex items-center gap-2">
              <ShieldCheckIcon className={`w-6 h-6 ${(assessment && assessment.answers && assessment.answers.dpia === 2 && dpias && dpias.length > 0) ? 'text-green-500' : 'text-gray-400'}`} />
              <span className={(assessment && assessment.answers && assessment.answers.dpia === 2 && dpias && dpias.length > 0) ? 'text-green-700 font-semibold' : 'text-gray-500'}>DPIA</span>
            </li>
          </ul>
        </div>
        <style>{`
          @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
          .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
        `}</style>
      </div>
    </div>
  );
} 