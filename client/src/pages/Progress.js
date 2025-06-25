import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, ArrowRightCircleIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';

const API_ASSESS = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev/api/assessments';
const API_REG = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev/api/registers';

const CHECKLISTS = {
  registre: [
    "Identifier tous les traitements de données personnelles",
    "Compléter le registre (nom, finalité, données, base légale, responsable, sécurité, durée)",
    "Mettre à jour le registre en cas de changement",
  ],
  declaration: [
    "Préparer la déclaration CNDP pour chaque traitement",
    "Envoyer la déclaration à la CNDP",
    "Archiver l'accusé de réception de la CNDP",
  ],
  dpia: [
    "Identifier les traitements à risque élevé",
    "Réaliser une DPIA pour chaque traitement à risque",
    "Documenter les mesures pour réduire les risques",
  ],
  securite: [
    "Restreindre et tracer les accès aux données",
    "Mettre en place des mesures de sécurité techniques (chiffrement, sauvegardes)",
    "Élaborer un plan de gestion des incidents",
  ],
  droits: [
    "Informer les personnes concernées de leurs droits",
    "Permettre l'accès, la rectification et l'opposition",
    "Mettre en place une procédure pour traiter les demandes d'exercice des droits",
  ],
  sensibilisation: [
    "Former le personnel à la protection des données",
    "Communiquer sur la politique interne RGPD/Loi 09-08",
    "Mettre à disposition des ressources et consignes",
  ],
};

const STEPS = [
  {
    key: 'registre',
    label: "Recensement et registre des traitements",
    desc: "Identifiez et documentez tous vos traitements de données.",
    link: '/register',
  },
  {
    key: 'declaration',
    label: "Déclaration CNDP",
    desc: "Déclarez vos traitements à la CNDP.",
    link: '/guide',
  },
  {
    key: 'dpia',
    label: "Analyse d'impact (DPIA)",
    desc: "Réalisez une DPIA pour les traitements à risque.",
    link: '/documents',
  },
  {
    key: 'securite',
    label: "Sécurité des données",
    desc: "Mettez en place des mesures techniques et organisationnelles.",
    link: '/assessment',
  },
  {
    key: 'droits',
    label: "Droits des personnes",
    desc: "Permettez l'accès, la rectification et l'opposition.",
    link: '/assessment',
  },
  {
    key: 'sensibilisation',
    label: "Sensibilisation du personnel",
    desc: "Formez et informez vos collaborateurs.",
    link: '/best-practices',
  },
];

function getChecklistState(userId) {
  try {
    return JSON.parse(localStorage.getItem('cndp_checklists_' + userId)) || {};
  } catch {
    return {};
  }
}
function setChecklistState(userId, state) {
  localStorage.setItem('cndp_checklists_' + userId, JSON.stringify(state));
}

export default function Progress() {
  const { token, user } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [checklists, setChecklists] = useState({});

  // Load assessment and registers
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    Promise.all([
      fetch(API_ASSESS, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
      fetch(API_REG, { headers: { Authorization: `Bearer ${token}` } }).then(r => r.json()),
    ]).then(([assess, regs]) => {
      setAssessment(Array.isArray(assess) && assess.length > 0 ? assess[assess.length - 1] : null);
      setRegisters(regs || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [token]);

  // Load checklist state from localStorage
  useEffect(() => {
    if (user && user.id) {
      setChecklists(getChecklistState(user.id));
    }
  }, [user]);

  // Step completion logic
  const done = {
    registre: registers.length > 0,
    declaration: assessment && assessment.answers && (assessment.answers.declaration === 2),
    dpia: assessment && assessment.answers && (assessment.answers.dpia === 2),
    securite: assessment && assessment.answers && (assessment.answers.securite === 2 || assessment.answers.chiffrement === 2 || assessment.answers.incidents === 2),
    droits: assessment && assessment.answers && (assessment.answers.droits === 2 && assessment.answers.information === 2 && assessment.answers.procedure_droits === 2),
    sensibilisation: assessment && assessment.answers && (assessment.answers.politique === 2),
  };
  const total = STEPS.length;
  const completed = STEPS.filter(s => done[s.key]).length;
  const percent = Math.round((completed / total) * 100);

  // Find next recommended action
  const nextStep = STEPS.find(s => !done[s.key]);

  // Milestone positions (as % along the bar)
  const milestonePercents = STEPS.map((s, i) => Math.round((i / (STEPS.length - 1)) * 100));
  const milestoneIcons = [
    <CheckCircleIcon className="w-6 h-6 text-green-500" />, // Register
    <ArrowPathIcon className="w-6 h-6 text-blue-700" />,    // Declaration
    <SparklesIcon className="w-6 h-6 text-yellow-400" />,   // DPIA
    <ArrowRightCircleIcon className="w-6 h-6 text-blue-700" />, // Security
    <ArrowRightCircleIcon className="w-6 h-6 text-blue-700" />, // Rights
    <CheckCircleIcon className="w-6 h-6 text-green-500" />, // Sensibilisation
  ];
  // Confetti placeholder (will be replaced with animation)
  const showConfetti = percent === 100;

  // Checklist handlers
  const handleCheck = (stepKey, idx) => {
    if (!user || !user.id) return;
    const state = getChecklistState(user.id);
    state[stepKey] = state[stepKey] || [];
    state[stepKey][idx] = !state[stepKey][idx];
    setChecklistState(user.id, state);
    setChecklists({ ...state });
  };

  return (
    <section>
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <SparklesIcon className="w-10 h-10 text-yellow-300" /> Progression conformité
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Suivez votre avancement dans la mise en conformité Loi 09-08.</p>
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
      {/* Next Recommended Action Card */}
      {nextStep ? (
        <div className="mb-6 animate-fade-in">
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-6 flex items-center gap-4 border-l-4 border-yellow-400">
            <ArrowRightCircleIcon className="w-8 h-8 text-yellow-400 animate-bounce" />
            <div className="flex-1">
              <div className="font-bold text-blue-900 text-lg mb-1">Prochaine étape recommandée</div>
              <div className="text-gray-700 text-sm mb-2">{nextStep.desc}</div>
              <Link to={nextStep.link} className="inline-flex items-center bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-4 py-2 rounded font-semibold shadow transition-all">Compléter cette étape <ArrowRightCircleIcon className="w-5 h-5 ml-2" /></Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="mb-6 animate-fade-in">
          <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-xl shadow-lg flex items-center gap-4">
            <CheckCircleIcon className="w-8 h-8 text-green-500 animate-pulse" />
            <div className="flex-1 text-green-700 font-semibold">Félicitations ! Vous avez complété toutes les étapes de conformité.</div>
          </div>
        </div>
      )}
      {/* Confetti animation placeholder */}
      {showConfetti && <div id="confetti-placeholder" className="fixed inset-0 pointer-events-none z-50"></div>}
      {/* Progress Bar with Milestones */}
      <div className="mb-8 animate-fade-in relative">
        <div className="flex items-center gap-4 mb-2">
          <div className="font-semibold text-blue-900">Progression : {percent}%</div>
          <div className="flex-1 h-4 bg-blue-100 rounded-full overflow-hidden relative">
            <div className="h-4 bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 rounded-full transition-all duration-700" style={{ width: percent + '%' }}></div>
            {/* Milestone markers */}
            {milestonePercents.map((p, i) => (
              <div key={i} className="absolute top-1/2 -translate-y-1/2" style={{ left: `calc(${p}% - 12px)` }}>
                <div className={`rounded-full bg-white shadow-lg border-2 ${done[STEPS[i].key] ? 'border-green-400' : 'border-blue-200'} flex items-center justify-center w-7 h-7 transition-all duration-300`}>
                  {milestoneIcons[i]}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Checklist with expandable steps */}
      <ol className="space-y-4 animate-fade-in">
        {STEPS.map((step, i) => {
          const checklist = CHECKLISTS[step.key] || [];
          const checked = checklists[step.key] || [];
          const checkedCount = checked.filter(Boolean).length;
          return (
            <li key={step.key} className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 border-t-4 border-blue-100 hover:scale-[1.01] transition">
              <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(expanded === step.key ? null : step.key)}>
                <span>
                  {done[step.key] ? <CheckCircleIcon className="w-8 h-8 text-green-600" /> : <XCircleIcon className="w-8 h-8 text-yellow-500" />}
                </span>
                <div className="flex-1">
                  <div className="font-bold text-blue-900 text-lg mb-1 flex items-center gap-2">{step.label}</div>
                  <div className="text-gray-700 text-sm mb-2">{step.desc}</div>
                  <Link to={step.link} className="inline-flex items-center text-blue-700 hover:underline text-sm font-semibold"><ArrowRightCircleIcon className="w-5 h-5 mr-1" /> Accéder</Link>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-blue-900">{checkedCount}/{checklist.length}</span>
                  {expanded === step.key ? <ChevronUpIcon className="w-5 h-5 text-blue-700" /> : <ChevronDownIcon className="w-5 h-5 text-blue-700" />}
                </div>
              </div>
              {expanded === step.key && (
                <ul className="mt-4 space-y-2">
                  {checklist.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-2">
                      <input type="checkbox" checked={!!checked[idx]} onChange={() => handleCheck(step.key, idx)} className="accent-blue-700 w-5 h-5" />
                      <span className={checked[idx] ? 'line-through text-gray-400' : ''}>{item}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          );
        })}
      </ol>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 