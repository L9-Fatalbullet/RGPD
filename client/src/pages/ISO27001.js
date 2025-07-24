import React, { useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, EyeIcon, ChevronDownIcon, ChevronUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';

// Example Annexe A controls (add more as needed)
const ANNEXE_A = [
  {
    domain: 'A.5 Politiques de sécurité de l’information',
    controls: [
      {
        number: 'A.5.1.1',
        title: 'Politiques pour la sécurité de l’information',
        description: 'Des politiques pour la sécurité de l’information doivent être définies, approuvées par la direction, publiées et communiquées aux employés et aux parties concernées.',
      },
      {
        number: 'A.5.1.2',
        title: 'Revue des politiques pour la sécurité de l’information',
        description: 'Les politiques pour la sécurité de l’information doivent être revues à intervalles planifiés ou si des changements significatifs surviennent.',
      },
    ],
  },
  {
    domain: 'A.6 Organisation de la sécurité de l’information',
    controls: [
      {
        number: 'A.6.1.1',
        title: 'Rôles et responsabilités en matière de sécurité de l’information',
        description: 'Tous les rôles et responsabilités en matière de sécurité de l’information doivent être définis et attribués.',
      },
    ],
  },
  // ... add all domains and controls as needed ...
];

const STATUS_OPTIONS = [
  { value: 'yes', label: 'Oui', icon: <CheckCircleIcon className="w-5 h-5 text-green-600 inline" /> },
  { value: 'partial', label: 'En cours', icon: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 inline" /> },
  { value: 'no', label: 'Non', icon: <ExclamationTriangleIcon className="w-5 h-5 text-red-600 inline" /> },
];

export default function ISO27001() {
  // State: compliance status and comments for each control
  const [answers, setAnswers] = useState({});
  const [expanded, setExpanded] = useState({});

  // Progress calculation
  const total = ANNEXE_A.reduce((sum, d) => sum + d.controls.length, 0);
  const completed = Object.values(answers).filter(a => a && a.status === 'yes').length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  const handleStatus = (key, status) => {
    setAnswers(a => ({ ...a, [key]: { ...a[key], status } }));
  };
  const handleComment = (key, comment) => {
    setAnswers(a => ({ ...a, [key]: { ...a[key], comment } }));
  };
  const toggleExpand = key => {
    setExpanded(e => ({ ...e, [key]: !e[key] }));
  };

  return (
    <section className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-2"><EyeIcon className="w-8 h-8 text-blue-700" /> ISO 27001 - Annexe A Contrôles</h1>
      <p className="mb-6 text-blue-800">Auto-évaluez votre conformité avec les contrôles de l’annexe A de la norme ISO 27001:2022. Utilisez cette checklist pour préparer un audit, identifier les écarts, et documenter vos progrès.</p>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="font-semibold text-blue-900">Progression :</span>
          <div className="flex-1 h-4 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-4 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400" style={{ width: percent + '%' }}></div>
          </div>
          <span className="font-semibold text-blue-900">{percent}%</span>
        </div>
      </div>
      <div className="space-y-6">
        {ANNEXE_A.map(domain => (
          <div key={domain.domain} className="bg-blue-50 rounded-xl shadow p-4">
            <h2 className="text-xl font-bold text-blue-800 mb-2">{domain.domain}</h2>
            <table className="min-w-full text-xs bg-white rounded shadow border">
              <thead>
                <tr className="bg-blue-100 text-blue-900">
                  <th className="px-3 py-2 text-left font-semibold">Numéro</th>
                  <th className="px-3 py-2 text-left font-semibold">Contrôle</th>
                  <th className="px-3 py-2 text-left font-semibold">Statut</th>
                  <th className="px-3 py-2"></th>
                </tr>
              </thead>
              <tbody>
                {domain.controls.map(control => {
                  const key = domain.domain + '-' + control.number;
                  const answer = answers[key] || {};
                  return (
                    <React.Fragment key={control.number}>
                      <tr className="border-b last:border-0 hover:bg-blue-50/40 transition">
                        <td className="px-3 py-2 font-medium text-blue-900">{control.number}</td>
                        <td className="px-3 py-2">
                          <div className="font-semibold text-blue-900">{control.title}</div>
                          {expanded[key] && (
                            <div className="text-xs text-blue-700 mt-1">{control.description}</div>
                          )}
                        </td>
                        <td className="px-3 py-2">
                          <div className="flex gap-2">
                            {STATUS_OPTIONS.map(opt => (
                              <button
                                key={opt.value}
                                className={`px-2 py-1 rounded font-semibold flex items-center gap-1 border ${answer.status === opt.value ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-blue-900 border-blue-200'}`}
                                onClick={() => handleStatus(key, opt.value)}
                                type="button"
                              >
                                {opt.icon} {opt.label}
                              </button>
                            ))}
                          </div>
                        </td>
                        <td className="px-3 py-2 text-right">
                          <button type="button" className="text-blue-700 hover:text-yellow-500" onClick={() => toggleExpand(key)}>
                            {expanded[key] ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                          </button>
                        </td>
                      </tr>
                      {expanded[key] && (
                        <tr>
                          <td colSpan={4} className="bg-blue-50 px-3 py-2">
                            <textarea
                              className="w-full rounded border px-3 py-2 text-xs"
                              placeholder="Commentaires, preuves, actions..."
                              value={answer.comment || ''}
                              onChange={e => handleComment(key, e.target.value)}
                            />
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        ))}
      </div>
      <div className="mt-8 flex gap-4">
        <button className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded font-semibold shadow flex items-center gap-2" disabled>
          <DocumentArrowDownIcon className="w-5 h-5" /> Exporter l’auto-évaluation (bientôt)
        </button>
      </div>
    </section>
  );
} 