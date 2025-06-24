import React from 'react';
import { CheckCircleIcon, DocumentArrowDownIcon, BookOpenIcon } from '@heroicons/react/24/outline';

const STEPS = [
  {
    title: "Planification et gouvernance",
    description: "Désignez un responsable de traitement et élaborez une politique de protection des données.",
    template: null,
  },
  {
    title: "Cartographie des traitements",
    description: "Identifiez et documentez tous les traitements de données personnelles.",
    template: "Registre des traitements (modèle)",
    templateUrl: "#modele-registre",
  },
  {
    title: "Déclaration à la CNDP",
    description: "Déclarez vos traitements à la CNDP via le portail officiel.",
    template: null,
  },
  {
    title: "Information et consentement",
    description: "Informez les personnes concernées de leurs droits et recueillez leur consentement si nécessaire.",
    template: "Notice d'information (modèle)",
    templateUrl: "#modele-notice",
  },
  {
    title: "Sécurité et confidentialité",
    description: "Mettez en place des mesures techniques et organisationnelles pour protéger les données.",
    template: null,
  },
  {
    title: "Gestion des droits",
    description: "Permettez l'accès, la rectification, l'opposition et la suppression des données.",
    template: null,
  },
  {
    title: "Archivage et suppression",
    description: "Définissez des durées de conservation et procédez à la destruction sécurisée des données.",
    template: null,
  },
  {
    title: "Analyse d'impact (DPIA)",
    description: "Réalisez une DPIA pour les traitements à risque élevé.",
    template: "DPIA (modèle)",
    templateUrl: "#modele-dpia",
  },
];

const TEMPLATES = [
  { name: "Registre des traitements (modèle)", url: "/templates/registre-modele.docx" },
  { name: "Notice d'information (modèle)", url: "/templates/notice-modele.docx" },
  { name: "DPIA (modèle)", url: "/templates/dpia-modele.docx" },
];

export default function Guide() {
  return (
    <section>
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <BookOpenIcon className="w-10 h-10 text-yellow-300" /> Guide Loi 09-08
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Suivez ce guide étape par étape pour vous conformer à la Loi marocaine 09-08 sur la protection des données personnelles.</p>
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
      {/* Timeline/Checklist */}
      <ol className="relative border-l-4 border-blue-200 ml-4 mb-12 animate-fade-in">
        {STEPS.map((step, idx) => (
          <li key={idx} className="mb-10 ml-6">
            <span className="absolute -left-5 flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-full ring-4 ring-white animate-fade-in">
              <CheckCircleIcon className="w-7 h-7 text-blue-700" />
            </span>
            <h3 className="flex items-center text-lg font-semibold text-blue-900">{step.title}
              {step.template && (
                <a href={step.templateUrl || '#'} download className="ml-3 inline-flex items-center text-blue-700 hover:underline text-sm">
                  <DocumentArrowDownIcon className="w-5 h-5 mr-1" />
                  {step.template}
                </a>
              )}
            </h3>
            <p className="text-gray-700 text-sm mt-1">{step.description}</p>
          </li>
        ))}
      </ol>
      {/* Downloadable Templates */}
      <div className="grid md:grid-cols-3 gap-6 mb-8 animate-fade-in">
        {TEMPLATES.map((tpl, i) => (
          <a key={i} href={tpl.url} download className="group bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 flex flex-col items-center gap-3 border-t-4 border-blue-100 hover:border-yellow-400 hover:scale-105 transition-all">
            <DocumentArrowDownIcon className="w-10 h-10 text-blue-700 group-hover:text-yellow-500 transition-all" />
            <div className="font-semibold text-blue-900 text-lg group-hover:text-yellow-700 transition-all">{tpl.name}</div>
            <div className="text-xs text-gray-500">Télécharger</div>
          </a>
        ))}
      </div>
      <div className="text-xs text-gray-500 mt-6 animate-fade-in">
        Pour plus d'informations, consultez le site officiel de la <a href="https://www.cndp.ma/" className="text-blue-700 underline" target="_blank">CNDP</a>.
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 