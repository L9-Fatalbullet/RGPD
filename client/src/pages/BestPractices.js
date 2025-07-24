import React, { useEffect, useState } from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, UserGroupIcon, DocumentCheckIcon, NewspaperIcon, SparklesIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

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

// ISO 27002: 14 domains, 93 controls (2022). We'll group by domain for clarity.
const ISO_DOMAINS = [
  {
    title: "Politiques de sécurité de l'information",
    controls: [
      "Une politique de sécurité de l'information est définie, approuvée et communiquée.",
      "Les politiques sont revues régulièrement."
    ]
  },
  {
    title: "Organisation de la sécurité de l'information",
    controls: [
      "Les responsabilités en matière de sécurité sont attribuées.",
      "Des contacts avec les autorités et groupes spécialisés sont établis.",
      "La sécurité est prise en compte dans les projets et relations externes."
    ]
  },
  {
    title: "Sécurité des ressources humaines",
    controls: [
      "Les employés sont sensibilisés à la sécurité avant, pendant et après leur emploi.",
      "Des sanctions sont prévues en cas de non-respect des politiques."
    ]
  },
  {
    title: "Gestion des actifs",
    controls: [
      "Les actifs (données, équipements, logiciels) sont inventoriés et classifiés.",
      "Les supports contenant des informations sont protégés."
    ]
  },
  {
    title: "Contrôle d'accès",
    controls: [
      "Les droits d'accès sont accordés selon le principe du moindre privilège.",
      "Les comptes utilisateurs sont gérés et révoqués en temps voulu.",
      "L'utilisation de mots de passe robustes est exigée."
    ]
  },
  {
    title: "Cryptographie",
    controls: [
      "Les données sensibles sont chiffrées en transit et au repos.",
      "Les clés cryptographiques sont gérées de façon sécurisée."
    ]
  },
  {
    title: "Sécurité physique et environnementale",
    controls: [
      "Les locaux et équipements sont protégés contre les accès non autorisés.",
      "Des mesures sont prises contre les risques environnementaux (incendie, inondation, etc.)."
    ]
  },
  {
    title: "Sécurité liée à l'exploitation",
    controls: [
      "Les procédures d'exploitation sont documentées et suivies.",
      "Les logiciels sont mis à jour et protégés contre les malwares.",
      "Les journaux d'activité sont conservés et surveillés."
    ]
  },
  {
    title: "Sécurité des communications",
    controls: [
      "Les réseaux sont protégés contre les accès non autorisés.",
      "Les informations échangées sont protégées contre l'interception et l'altération."
    ]
  },
  {
    title: "Acquisition, développement et maintenance des systèmes",
    controls: [
      "La sécurité est intégrée dans le cycle de vie des systèmes d'information.",
      "Les vulnérabilités sont corrigées rapidement."
    ]
  },
  {
    title: "Relations avec les fournisseurs",
    controls: [
      "Les exigences de sécurité sont intégrées dans les contrats avec les fournisseurs.",
      "Les fournisseurs sont évalués régulièrement sur la sécurité."
    ]
  },
  {
    title: "Gestion des incidents de sécurité",
    controls: [
      "Une procédure de gestion des incidents est en place et connue de tous.",
      "Les incidents sont enregistrés, analysés et des mesures correctives sont prises."
    ]
  },
  {
    title: "Gestion de la continuité d'activité",
    controls: [
      "Des plans de continuité et de reprise d'activité sont établis et testés.",
      "Les sauvegardes sont réalisées et testées régulièrement."
    ]
  },
  {
    title: "Conformité",
    controls: [
      "Le respect des exigences légales, réglementaires et contractuelles est assuré.",
      "Des audits de sécurité sont réalisés régulièrement."
    ]
  }
];

const ISO_LINK = "https://www.iso.org/fr/standard/75652.html";

function getChecklistState(userId) {
  try {
    return JSON.parse(localStorage.getItem('iso27002_checklist_' + userId)) || {};
  } catch {
    return {};
  }
}
function setChecklistState(userId, state) {
  localStorage.setItem('iso27002_checklist_' + userId, JSON.stringify(state));
}

export default function BestPractices() {
  const userId = (JSON.parse(localStorage.getItem('cndp_user')) || {}).id || 'default';
  const [checked, setChecked] = useState(() => getChecklistState(userId));

  useEffect(() => {
    setChecklistState(userId, checked);
  }, [checked, userId]);

  const handleCheck = (domainIdx, controlIdx) => {
    setChecked(prev => {
      const key = `${domainIdx}_${controlIdx}`;
      return { ...prev, [key]: !prev[key] };
    });
  };

  const total = ISO_DOMAINS.reduce((sum, d) => sum + d.controls.length, 0);
  const done = Object.values(checked).filter(Boolean).length;
  const percent = Math.round((done / total) * 100);

  return (
    <section>
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <SparklesIcon className="w-10 h-10 text-yellow-300" /> ISO 27002 : Checklist Sécurité
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">
            Appliquez les bonnes pratiques internationales pour la sécurité de l'information grâce à la norme ISO 27002. Cochez chaque contrôle pour suivre votre progression.
          </p>
          <a href={ISO_LINK} target="_blank" rel="noopener noreferrer" className="underline text-yellow-200 hover:text-white text-sm">En savoir plus sur ISO 27002</a>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-2">
            <CheckCircleIcon className="w-10 h-10 text-green-300" />
            <span className="text-3xl font-bold">{percent}%</span>
          </div>
          <div className="text-white text-sm">{done} / {total} contrôles réalisés</div>
        </div>
      </div>
      {/* ISO 27002 Checklist */}
      <div className="space-y-8 mb-10 animate-fade-in">
        {ISO_DOMAINS.map((domain, dIdx) => (
          <div key={dIdx} className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 border-t-4 border-blue-100">
            <div className="font-bold text-blue-900 text-lg mb-2 flex items-center gap-2">
              <ShieldCheckIcon className="w-6 h-6 text-blue-700" /> {domain.title}
            </div>
            <ul className="space-y-2">
              {domain.controls.map((ctrl, cIdx) => {
                const key = `${dIdx}_${cIdx}`;
                return (
                  <li key={key} className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      className="w-5 h-5 accent-blue-700"
                      checked={!!checked[key]}
                      onChange={() => handleCheck(dIdx, cIdx)}
                      id={key}
                    />
                    <label htmlFor={key} className={"text-gray-800 " + (checked[key] ? "line-through text-green-700" : "")}>{ctrl}</label>
                  </li>
                );
              })}
            </ul>
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