import React from 'react';
import { CheckCircleIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

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
      <h1 className="text-2xl font-bold mb-2">Guide Loi 09-08 : étapes de conformité</h1>
      <p className="text-gray-700 mb-6">Suivez ce guide étape par étape pour vous conformer à la Loi marocaine 09-08 sur la protection des données personnelles.</p>
      <ol className="relative border-l-4 border-blue-200 ml-4 mb-8">
        {STEPS.map((step, idx) => (
          <li key={idx} className="mb-10 ml-6">
            <span className="absolute -left-5 flex items-center justify-center w-10 h-10 bg-blue-100 rounded-full ring-4 ring-white">
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
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow mb-4">
        <div className="font-semibold text-blue-900 mb-1">Modèles à télécharger :</div>
        <ul className="list-disc ml-6 text-blue-800">
          {TEMPLATES.map((tpl, i) => (
            <li key={i}>
              <a href={tpl.url} download className="inline-flex items-center hover:underline">
                <DocumentArrowDownIcon className="w-5 h-5 mr-1" />
                {tpl.name}
              </a>
            </li>
          ))}
        </ul>
      </div>
      <div className="text-xs text-gray-500 mt-6">
        Pour plus d'informations, consultez le site officiel de la <a href="https://www.cndp.ma/" className="text-blue-700 underline" target="_blank">CNDP</a>.
      </div>
    </section>
  );
} 