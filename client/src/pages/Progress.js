import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowPathIcon, ArrowRightCircleIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../App';
import { Link } from 'react-router-dom';
import confetti from 'canvas-confetti';

const API_BASE = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev';

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

// --- Redesigned Progression Milestones ---
const MILESTONES = [
  {
    key: 'register',
    label: 'Registre des traitements',
    desc: 'Votre registre des traitements est-il créé et à jour ?',
    link: '/register',
    getStatus: ({ registers }) => registers && registers.length > 0,
    getDate: ({ registers }) => registers && registers.length > 0 ? new Date(Math.max(...registers.map(r => new Date(r.date).getTime()))).toLocaleDateString('fr-FR') : null,
  },
  {
    key: 'dpia',
    label: 'DPIA (Analyse d\u2019impact)',
    desc: 'Avez-vous réalisé une DPIA pour les traitements à risque ?',
    link: '/dpia',
    getStatus: ({ dpias }) => dpias && dpias.length > 0,
    getDate: ({ dpias }) => dpias && dpias.length > 0 ? new Date(Math.max(...dpias.map(d => new Date(d.date).getTime()))).toLocaleDateString('fr-FR') : null,
  },
  {
    key: 'assessment',
    label: 'Auto-évaluation',
    desc: 'Avez-vous complété une auto-évaluation de conformité ?',
    link: '/assessment',
    getStatus: ({ assessment }) => !!assessment,
    getDate: ({ assessment }) => assessment && assessment.date ? new Date(assessment.date).toLocaleDateString('fr-FR') : null,
  },
  {
    key: 'security',
    label: 'Mesures de sécurité',
    desc: 'Des mesures techniques et organisationnelles sont-elles en place ?',
    link: '/assessment',
    getStatus: ({ assessment }) => assessment && assessment.answers && (assessment.answers.securite === 2 || assessment.answers.chiffrement === 2 || assessment.answers.incidents === 2),
    getDate: ({ assessment }) => assessment && assessment.date ? new Date(assessment.date).toLocaleDateString('fr-FR') : null,
  },
  {
    key: 'rights',
    label: 'Gestion des droits',
    desc: 'Les droits des personnes sont-ils respectés et gérés ?',
    link: '/assessment',
    getStatus: ({ assessment }) => assessment && assessment.answers && (assessment.answers.droits === 2 && assessment.answers.information === 2 && assessment.answers.procedure_droits === 2),
    getDate: ({ assessment }) => assessment && assessment.date ? new Date(assessment.date).toLocaleDateString('fr-FR') : null,
  },
  {
    key: 'training',
    label: 'Sensibilisation du personnel',
    desc: 'Le personnel a-t-il été formé à la protection des données ?',
    link: '/best-practices',
    getStatus: ({ assessment }) => assessment && assessment.answers && assessment.answers.politique === 2,
    getDate: ({ assessment }) => assessment && assessment.date ? new Date(assessment.date).toLocaleDateString('fr-FR') : null,
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

export default function Progress({ folderId }) {
  const { token, user, logout } = useAuth();
  const [assessment, setAssessment] = useState(null);
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [checklists, setChecklists] = useState({});
  const [dpias, setDpias] = useState([]);
  const [error, setError] = useState(null);

  // Load assessment and registers
  useEffect(() => {
    if (!folderId) return;
    setLoading(true);
    setError(null);
    Promise.all([
      fetch(`${API_BASE}/api/assessments?folderId=${folderId}`, { headers: { Authorization: `Bearer ${token}` } }).then(async r => { if (r.status === 401 || r.status === 403) { logout(); throw new Error('Session expirée, veuillez vous reconnecter.'); } if (!r.ok) throw new Error('Erreur serveur'); return r.json(); }),
      fetch(`${API_BASE}/api/registers?folderId=${folderId}`, { headers: { Authorization: `Bearer ${token}` } }).then(async r => { if (r.status === 401 || r.status === 403) { logout(); throw new Error('Session expirée, veuillez vous reconnecter.'); } if (!r.ok) throw new Error('Erreur serveur'); return r.json(); }),
      fetch(`${API_BASE}/api/dpias?folderId=${folderId}`, { headers: { Authorization: `Bearer ${token}` } }).then(async r => { if (r.status === 401 || r.status === 403) { logout(); throw new Error('Session expirée, veuillez vous reconnecter.'); } if (!r.ok) throw new Error('Erreur serveur'); return r.json(); }),
    ]).then(([assess, regs, dpias]) => {
      setAssessment(Array.isArray(assess) && assess.length > 0 ? assess[assess.length - 1] : null);
      setRegisters(regs || []);
      setDpias(dpias || []);
      setLoading(false);
    }).catch((e) => {
      setLoading(false);
      setError(e.message || 'Erreur de connexion au serveur. Vérifiez votre connexion ou réessayez plus tard.');
    });
  }, [token, folderId, logout]);

  // Load checklist state from localStorage
  useEffect(() => {
    if (user && user.id) {
      setChecklists(getChecklistState(user.id));
    }
  }, [user]);

  // Compute milestone status
  const milestoneData = MILESTONES.map(m => ({
    ...m,
    status: m.getStatus({ assessment, registers, dpias }),
    date: m.getDate({ assessment, registers, dpias }),
  }));
  const completed = milestoneData.filter(m => m.status).length;
  const percent = Math.round((completed / MILESTONES.length) * 100);
  const nextMilestone = milestoneData.find(m => !m.status);

  // Confetti animation effect
  useEffect(() => {
    if (percent === 100) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#facc15', '#2563eb', '#fff', '#22c55e'],
      });
    }
  }, [percent]);

  // Checklist handlers
  const handleCheck = (stepKey, idx) => {
    if (!user || !user.id) return;
    const state = getChecklistState(user.id);
    state[stepKey] = state[stepKey] || [];
    state[stepKey][idx] = !state[stepKey][idx];
    setChecklistState(user.id, state);
    setChecklists({ ...state });
  };

  if (error) return <div className="text-red-600 font-semibold p-8">{error}</div>;

  if (!folderId) return <div className="text-blue-700 font-semibold p-8">Veuillez sélectionner ou créer un dossier de conformité pour commencer.</div>;

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
      {nextMilestone ? (
        <div className="mb-6 animate-fade-in">
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-6 flex items-center gap-4 border-l-4 border-yellow-400">
            <ArrowRightCircleIcon className="w-8 h-8 text-yellow-400 animate-bounce" />
            <div className="flex-1">
              <div className="font-bold text-blue-900 text-lg mb-1">Prochaine étape recommandée</div>
              <div className="text-gray-700 text-sm mb-2">{nextMilestone.desc}</div>
              <Link to={nextMilestone.link} className="inline-flex items-center bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-4 py-2 rounded font-semibold shadow transition-all">Compléter cette étape <ArrowRightCircleIcon className="w-5 h-5 ml-2" /></Link>
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
      {percent === 100 && <div id="confetti-placeholder" className="fixed inset-0 pointer-events-none z-50"></div>}
      {/* Progress Bar with Milestones */}
      <div className="mb-8 animate-fade-in relative">
        <div className="flex items-center gap-4 mb-2">
          <div className="font-semibold text-blue-900">Progression : {percent}%</div>
          <div className="flex-1 h-4 bg-blue-100 rounded-full overflow-hidden relative">
            <div className="h-4 bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 rounded-full transition-all duration-700" style={{ width: percent + '%' }}></div>
            {/* Milestone markers */}
            {milestoneData.map((m, i) => (
              <div key={m.key} className="absolute top-1/2 -translate-y-1/2" style={{ left: `calc(${(i / (milestoneData.length - 1)) * 100}% - 12px)` }}>
                <div className={`rounded-full bg-white shadow-lg border-2 ${m.status ? 'border-green-400' : 'border-blue-200'} flex items-center justify-center w-7 h-7 transition-all duration-300`}>
                  {m.status ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <XCircleIcon className="w-5 h-5 text-yellow-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Timeline/Stepper */}
      <ol className="space-y-4 animate-fade-in">
        {milestoneData.map((m, i) => (
          <li key={m.key} className={`bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 border-t-4 ${m.status ? 'border-green-300' : 'border-blue-100'} hover:scale-[1.01] transition group flex items-center gap-4`}> 
            <span className="transition-transform group-hover:scale-110">
              {m.status ? <CheckCircleIcon className="w-8 h-8 text-green-600" /> : <XCircleIcon className="w-8 h-8 text-yellow-500" />}
            </span>
            <div className="flex-1">
              <div className="font-bold text-blue-900 text-lg mb-1 flex items-center gap-2">
                {m.label}
                {m.status && <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold animate-fade-in">Terminé</span>}
              </div>
              <div className="text-gray-700 text-sm mb-2">{m.desc}</div>
              {m.date && <div className="text-xs text-blue-700 mb-1">Dernière mise à jour : {m.date}</div>}
              <Link to={m.link} className="inline-flex items-center text-blue-700 hover:underline text-sm font-semibold group-hover:text-yellow-500 transition"><ArrowRightCircleIcon className="w-5 h-5 mr-1" /> Accéder</Link>
            </div>
          </li>
        ))}
      </ol>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 