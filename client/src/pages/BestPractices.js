import React from 'react';
import { ShieldCheckIcon, ExclamationTriangleIcon, UserGroupIcon, DocumentCheckIcon, NewspaperIcon } from '@heroicons/react/24/outline';

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

export default function BestPractices() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-2">Bonnes pratiques</h1>
      <p className="text-gray-700 mb-6">Conseils et actualités pour une gestion conforme des données personnelles au Maroc.</p>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
        {PRACTICES.map((p, i) => (
          <div key={i} className="bg-white rounded-xl shadow hover:shadow-lg transition p-6 flex flex-col items-start gap-3 border-t-4 border-blue-100">
            {p.icon}
            <div className="font-semibold text-blue-900 text-lg">{p.title}</div>
            <div className="text-gray-700 text-sm">{p.desc}</div>
          </div>
        ))}
      </div>
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded shadow mb-4">
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
    </section>
  );
} 