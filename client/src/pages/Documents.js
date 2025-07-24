import React from 'react';
import { DocumentArrowDownIcon, SparklesIcon, DocumentTextIcon } from '@heroicons/react/24/outline';

const TEMPLATES = [
  {
    name: "Registre des traitements (modèle)",
    url: "/templates/registre-modele.docx",
    desc: "Modèle conforme à la Loi 09-08 pour documenter vos traitements de données.",
  },
  {
    name: "Notice d'information (modèle)",
    url: "/templates/notice-modele.docx",
    desc: "Notice à remettre aux personnes concernées pour les informer de leurs droits.",
  },
  {
    name: "DPIA (modèle)",
    url: "/templates/dpia-modele.docx",
    desc: "Modèle d'analyse d'impact pour les traitements à risque élevé.",
  },
];

const GENERATED = [
  // Example of generated docs, could be dynamic in a real app
  {
    name: "Registre 2024",
    url: "/docs/registre-2024.pdf",
    desc: "Votre registre généré automatiquement (exemple).",
  },
];

const CNDP_DECLARATIONS = [
  {
    name: "Déclaration simplifiée (F214) préalable du traitement",
    url: "https://www.cndp.ma/wp-content/uploads/2025/01/CNDP-Declaration-Normale-Conformement-Decision_F214_20210318_Fr.pdf",
    desc: "Formulaire officiel CNDP pour les traitements éligibles à la procédure simplifiée.",
  },
  {
    name: "Déclaration normale (F211) préalable de traitement",
    url: "https://www.cndp.ma/wp-content/uploads/2025/01/CNDP-Declaration-Normale-Conformement-Decision_F214_20210318_Fr.pdf",
    desc: "Formulaire officiel CNDP pour la déclaration normale des traitements.",
  },
];

export default function Documents() {
  return (
    <section>
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <SparklesIcon className="w-10 h-10 text-yellow-300" /> Documents & Modèles
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Téléchargez des modèles conformes ou vos documents générés pour la conformité à la Loi 09-08.</p>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <img src="/logo.png" alt="RGPD Compliance Maroc Logo" className="w-36 h-36 object-contain drop-shadow-xl" />
        </div>
      </div>
      {/* Templates */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><DocumentTextIcon className="w-7 h-7 text-blue-700" /> Modèles à télécharger</h2>
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
          {TEMPLATES.map((tpl, i) => (
            <a key={i} href={tpl.url} download className="group bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 flex flex-col items-start gap-3 border-t-4 border-blue-100 hover:border-yellow-400 hover:scale-105 transition-all animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <DocumentArrowDownIcon className="w-10 h-10 text-blue-700 group-hover:text-yellow-500 transition-all" />
              <div className="font-semibold text-blue-900 text-lg group-hover:text-yellow-700 transition-all">{tpl.name}</div>
              <div className="text-gray-700 text-sm mb-2">{tpl.desc}</div>
              <div className="text-xs text-gray-500">Télécharger</div>
            </a>
          ))}
        </div>
      </div>
      {/* Generated Documents */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><DocumentTextIcon className="w-7 h-7 text-blue-700" /> Documents générés</h2>
        <div className="grid md:grid-cols-3 gap-6 animate-fade-in">
          {GENERATED.map((doc, i) => (
            <a key={i} href={doc.url} download className="group bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 flex flex-col items-start gap-3 border-t-4 border-green-100 hover:border-yellow-400 hover:scale-105 transition-all animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <DocumentTextIcon className="w-10 h-10 text-green-700 group-hover:text-yellow-500 transition-all" />
              <div className="font-semibold text-blue-900 text-lg group-hover:text-yellow-700 transition-all">{doc.name}</div>
              <div className="text-gray-700 text-sm mb-2">{doc.desc}</div>
              <div className="text-xs text-gray-500">Télécharger</div>
            </a>
          ))}
        </div>
      </div>
      {/* CNDP Official Declarations */}
      <div className="mb-10">
        <h2 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><DocumentTextIcon className="w-7 h-7 text-yellow-500" /> Déclarations officielles CNDP</h2>
        <div className="grid md:grid-cols-2 gap-6 animate-fade-in">
          {CNDP_DECLARATIONS.map((doc, i) => (
            <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="group bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 flex flex-col items-start gap-3 border-t-4 border-yellow-100 hover:border-yellow-400 hover:scale-105 transition-all animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
              <DocumentArrowDownIcon className="w-10 h-10 text-yellow-500 group-hover:text-blue-700 transition-all" />
              <div className="font-semibold text-blue-900 text-lg group-hover:text-yellow-700 transition-all">{doc.name}</div>
              <div className="text-gray-700 text-sm mb-2">{doc.desc}</div>
              <div className="text-xs text-gray-500">Voir le formulaire</div>
            </a>
          ))}
        </div>
      </div>
      <div className="text-xs text-gray-500 mt-6 animate-fade-in">
        Pour plus d'informations, consultez le site officiel de la <a href="https://www.cndp.ma/" className="text-blue-700 underline" target="_blank" rel="noopener noreferrer">CNDP</a>.
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 