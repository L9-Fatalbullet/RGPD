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
      {/* Real Compliance Status Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-10 animate-fade-in">
        <div className="group border-l-4 border-blue-700 rounded-xl shadow-lg p-6 flex items-center gap-4 hover:scale-105 hover:shadow-2xl transition">
          <DocumentCheckIcon className="w-10 h-10 text-blue-700 group-hover:text-yellow-500 transition" />
          <div>
            <div className="text-2xl font-bold text-blue-900 group-hover:text-yellow-700 transition">{registers.length}</div>
            <div className="font-semibold text-blue-900">Traitements enregistrés</div>
            <div className="text-gray-700 text-xs">Nombre total de traitements dans le registre</div>
          </div>
        </div>
        <div className="group border-l-4 border-yellow-400 rounded-xl shadow-lg p-6 flex items-center gap-4 hover:scale-105 hover:shadow-2xl transition">
          <ShieldCheckIcon className="w-10 h-10 text-yellow-400 group-hover:text-blue-700 transition" />
          <div>
            <div className="text-2xl font-bold text-blue-900 group-hover:text-yellow-700 transition">{dpias.length}</div>
            <div className="font-semibold text-blue-900">DPIA réalisées</div>
            <div className="text-gray-700 text-xs">Analyses d'impact effectuées</div>
          </div>
        </div>
        <div className="group border-l-4 border-green-500 rounded-xl shadow-lg p-6 flex items-center gap-4 hover:scale-105 hover:shadow-2xl transition">
          <ChartBarIcon className="w-10 h-10 text-green-500 group-hover:text-yellow-500 transition" />
          <div>
            <div className="text-2xl font-bold text-blue-900 group-hover:text-yellow-700 transition">{score}%</div>
            <div className="font-semibold text-blue-900">Score auto-évaluation</div>
            <div className="text-gray-700 text-xs">Basé sur vos réponses à l'auto-évaluation</div>
          </div>
        </div>
        <div className="group border-l-4 border-blue-300 rounded-xl shadow-lg p-6 flex items-center gap-4 hover:scale-105 hover:shadow-2xl transition">
          <CheckCircleIcon className="w-10 h-10 text-blue-300 group-hover:text-yellow-500 transition" />
          <div>
            <div className="text-2xl font-bold text-blue-900 group-hover:text-yellow-700 transition">{(() => {
              const dates = [];
              if (assessment && assessment.date) dates.push(new Date(assessment.date));
              if (registers && registers.length > 0) dates.push(...registers.map(r => new Date(r.date)));
              if (dpias && dpias.length > 0) dates.push(...dpias.map(d => new Date(d.date)));
              if (dates.length === 0) return '--';
              const last = new Date(Math.max(...dates.map(d => d.getTime())));
              return last.toLocaleDateString('fr-FR');
            })()}</div>
            <div className="font-semibold text-blue-900">Dernière mise à jour</div>
            <div className="text-gray-700 text-xs">Date de la dernière action</div>
          </div>
        </div>
      </div>
      {/* Prochaines étapes (Next Steps) */}
      <div className="mb-10 animate-fade-in">
        <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><ArrowRightCircleIcon className="w-7 h-7 text-blue-700" /> Prochaines étapes</h2>
        {loading ? <div className="text-blue-700">Chargement...</div> : (
          <ul className="space-y-4">
            {/* Assessment step */}
            {!assessment && (
              <li className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-4 flex items-center gap-4 border-l-4 border-blue-700 animate-fade-in">
                <ChartBarIcon className="w-6 h-6 text-blue-700" />
                <span className="flex-1 text-blue-900 font-semibold">Commencez par l'auto-évaluation pour connaître votre niveau de conformité.</span>
                <Link to="/assessment" className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-4 py-2 rounded font-semibold shadow">Faire l'auto-évaluation</Link>
              </li>
            )}
            {/* Complete assessment if not all answered 'Oui' */}
            {assessment && Object.values(assessment.answers || {}).some(v => v < 2) && (
              <li className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-4 flex items-center gap-4 border-l-4 border-yellow-400 animate-fade-in">
                <ExclamationTriangleIcon className="w-6 h-6 text-yellow-400" />
                <span className="flex-1 text-blue-900 font-semibold">Complétez votre auto-évaluation pour obtenir un score optimal.</span>
                <Link to="/assessment" className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-4 py-2 rounded font-semibold shadow">Compléter</Link>
              </li>
            )}
            {/* Register step */}
            {(!registers || registers.length === 0) && (
              <li className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-4 flex items-center gap-4 border-l-4 border-blue-700 animate-fade-in">
                <DocumentCheckIcon className="w-6 h-6 text-blue-700" />
                <span className="flex-1 text-blue-900 font-semibold">Créez votre registre des traitements pour documenter vos activités de données.</span>
                <Link to="/register" className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-4 py-2 rounded font-semibold shadow">Créer un registre</Link>
              </li>
            )}
            {/* DPIA step if needed */}
            {assessment && assessment.answers && assessment.answers.dpia === 2 && (!dpias || dpias.length === 0) && (
              <li className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-4 flex items-center gap-4 border-l-4 border-yellow-400 animate-fade-in">
                <ShieldCheckIcon className="w-6 h-6 text-yellow-400" />
                <span className="flex-1 text-blue-900 font-semibold">Réalisez une DPIA pour les traitements à risque élevé.</span>
                <Link to="/dpia" className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-4 py-2 rounded font-semibold shadow">Faire une DPIA</Link>
              </li>
            )}
            {/* All main steps done */}
            {assessment && Object.values(assessment.answers || {}).every(v => v === 2) && registers && registers.length > 0 && (assessment.answers.dpia !== 2 || (dpias && dpias.length > 0)) && (
              <li className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-4 flex items-center gap-4 border-l-4 border-green-500 animate-fade-in">
                <CheckCircleIcon className="w-6 h-6 text-green-500" />
                <span className="flex-1 text-blue-900 font-semibold">Bravo ! Vous avez complété les principales étapes de conformité. Pensez à mettre à jour régulièrement.</span>
              </li>
            )}
          </ul>
        )}
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
    </section>
  );
} 