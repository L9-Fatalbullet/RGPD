import React, { useEffect, useState } from 'react';
import { SparklesIcon, ChartBarIcon, ExclamationTriangleIcon, CheckCircleIcon, DocumentCheckIcon, ShieldCheckIcon, ArrowRightCircleIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { FaShieldAlt, FaFileAlt, FaUserShield, FaClipboardList, FaRegCalendarCheck } from "react-icons/fa";

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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white py-8 px-2 sm:px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-blue-900 mb-6 text-center tracking-tight">Tableau de bord conformité</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
            <FaShieldAlt className="text-3xl text-blue-700 mb-2" />
            <div className="text-lg font-bold text-blue-900">Score de conformité</div>
            <div className="text-2xl font-extrabold text-green-600 mt-1">{score}%</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
            <FaFileAlt className="text-3xl text-amber-600 mb-2" />
            <div className="text-lg font-bold text-blue-900">Traitements</div>
            <div className="text-2xl font-extrabold text-amber-700 mt-1">{registers.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
            <FaClipboardList className="text-3xl text-fuchsia-600 mb-2" />
            <div className="text-lg font-bold text-blue-900">DPIA</div>
            <div className="text-2xl font-extrabold text-fuchsia-700 mt-1">{dpias.length}</div>
          </div>
          <div className="bg-white rounded-xl shadow-md p-6 flex flex-col items-center hover:shadow-lg transition-shadow">
            <FaUserShield className="text-3xl text-emerald-600 mb-2" />
            <div className="text-lg font-bold text-blue-900">Dernière mise à jour</div>
            <div className="text-base font-semibold text-emerald-700 mt-1 flex items-center gap-1">
              <FaRegCalendarCheck className="inline-block mr-1" />
              {(() => {
                const dates = [];
                if (assessment && assessment.date) dates.push(new Date(assessment.date));
                if (registers && registers.length > 0) dates.push(...registers.map(r => new Date(r.date)));
                if (dpias && dpias.length > 0) dates.push(...dpias.map(d => new Date(d.date)));
                if (dates.length === 0) return '--';
                const last = new Date(Math.max(...dates.map(d => d.getTime())));
                return last.toLocaleDateString('fr-FR');
              })()}
            </div>
          </div>
        </div>
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 flex flex-col md:flex-row gap-8 items-center md:items-start">
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
        {/* Add more beautiful sections/cards as needed */}
      </div>
    </div>
  );
} 