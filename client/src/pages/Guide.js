import React from 'react';
import { SparklesIcon, ArrowRightCircleIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

const STEPS = [
  {
    title: "Recensement des traitements",
    desc: "Identifiez tous les traitements de données personnelles réalisés dans votre organisation.",
  },
  {
    title: "Déclaration à la CNDP",
    desc: "Déclarez chaque traitement auprès de la CNDP avant leur mise en œuvre.",
  },
  {
    title: "Mise en conformité des contrats",
    desc: "Adaptez les contrats avec les sous-traitants et partenaires pour intégrer les exigences de la Loi 09-08.",
  },
  {
    title: "Information des personnes concernées",
    desc: "Assurez-vous que les personnes sont informées de leurs droits et de l'usage de leurs données.",
  },
  {
    title: "Sécurisation des données",
    desc: "Mettez en place des mesures techniques et organisationnelles pour protéger les données.",
  },
  {
    title: "Gestion des droits",
    desc: "Permettez l'accès, la rectification et l'opposition aux personnes concernées.",
  },
  {
    title: "Suivi et actualisation",
    desc: "Mettez à jour régulièrement vos procédures et registres pour rester conforme.",
  },
];

export default function Guide() {
  return (
    <section>
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <SparklesIcon className="w-10 h-10 text-yellow-300" /> Guide Loi 09-08
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Étapes clés pour la conformité à la loi marocaine sur la protection des données personnelles.</p>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <img src="/logo.png" alt="RGPD Compliance Maroc Logo" className="w-36 h-36 object-contain drop-shadow-xl" />
        </div>
      </div>
      {/* Stepper/Timeline */}
      <ol className="relative border-l-4 border-blue-200 ml-4 animate-fade-in">
        {STEPS.map((step, i) => (
          <li key={i} className="mb-10 ml-6 group">
            <span className="absolute -left-6 flex items-center justify-center w-10 h-10 bg-white/80 backdrop-blur border-4 border-blue-400 rounded-full shadow-lg group-hover:scale-110 transition">
              {i === STEPS.length - 1 ? (
                <CheckCircleIcon className="w-6 h-6 text-green-600" />
              ) : (
                <ArrowRightCircleIcon className="w-6 h-6 text-blue-700" />
              )}
            </span>
            <div className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 border-t-4 border-blue-100 hover:shadow-2xl hover:scale-[1.02] transition">
              <h3 className="font-bold text-blue-900 text-lg mb-1">{step.title}</h3>
              <p className="text-gray-700 text-sm">{step.desc}</p>
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