import React, { useState } from 'react';
import { DocumentTextIcon, ClipboardDocumentListIcon, ShieldCheckIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';

const TABS = [
  { key: 'privacy', label: 'Politique de confidentialité', icon: <ShieldCheckIcon className="w-5 h-5 mr-1" /> },
  { key: 'registre', label: 'Registre des traitements', icon: <ClipboardDocumentListIcon className="w-5 h-5 mr-1" /> },
  { key: 'dpia', label: 'DPIA', icon: <DocumentTextIcon className="w-5 h-5 mr-1" /> },
];

export default function Documents() {
  const [tab, setTab] = useState('privacy');
  const [privacy, setPrivacy] = useState({ org: '', contact: '', purpose: '' });
  const [registre, setRegistre] = useState({ name: '', purpose: '', data: '', legal: '', responsible: '', security: '', duration: '' });
  const [dpia, setDpia] = useState({ scenario: '', risks: '', measures: '' });

  function handleDownload(type) {
    const doc = new jsPDF();
    if (type === 'privacy') {
      doc.text('Politique de confidentialité', 10, 10);
      doc.text(`Organisation: ${privacy.org}`, 10, 20);
      doc.text(`Contact: ${privacy.contact}`, 10, 30);
      doc.text(`Finalité: ${privacy.purpose}`, 10, 40);
    } else if (type === 'registre') {
      doc.text('Registre des traitements', 10, 10);
      doc.text(`Nom: ${registre.name}`, 10, 20);
      doc.text(`Finalité: ${registre.purpose}`, 10, 30);
      doc.text(`Données: ${registre.data}`, 10, 40);
      doc.text(`Base légale: ${registre.legal}`, 10, 50);
      doc.text(`Responsable: ${registre.responsible}`, 10, 60);
      doc.text(`Sécurité: ${registre.security}`, 10, 70);
      doc.text(`Durée: ${registre.duration}`, 10, 80);
    } else if (type === 'dpia') {
      doc.text('DPIA (Analyse d\'impact)', 10, 10);
      doc.text(`Scénario: ${dpia.scenario}`, 10, 20);
      doc.text(`Risques: ${dpia.risks}`, 10, 30);
      doc.text(`Mesures: ${dpia.measures}`, 10, 40);
    }
    doc.save(`${type}.pdf`);
  }

  return (
    <section>
      <h1 className="text-2xl font-bold mb-2">Générateur de documents</h1>
      <p className="text-gray-700 mb-4">Générez vos documents de conformité (politique de confidentialité, registre, DPIA, etc.).</p>
      <div className="flex gap-2 mb-6">
        {TABS.map(t => (
          <button
            key={t.key}
            className={`flex items-center px-4 py-2 rounded-t font-semibold border-b-2 transition-all ${tab === t.key ? 'bg-blue-100 border-blue-700 text-blue-900' : 'bg-gray-100 border-transparent text-gray-500'}`}
            onClick={() => setTab(t.key)}
          >
            {t.icon}{t.label}
          </button>
        ))}
      </div>
      <div className="bg-white rounded shadow p-6">
        {tab === 'privacy' && (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Organisation</label>
              <input className="input" value={privacy.org} onChange={e => setPrivacy({ ...privacy, org: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">Contact</label>
              <input className="input" value={privacy.contact} onChange={e => setPrivacy({ ...privacy, contact: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">Finalité</label>
              <input className="input" value={privacy.purpose} onChange={e => setPrivacy({ ...privacy, purpose: e.target.value })} />
            </div>
            <button type="button" className="mt-4 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded flex items-center" onClick={() => handleDownload('privacy')}>
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> Télécharger PDF
            </button>
          </form>
        )}
        {tab === 'registre' && (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Nom du traitement</label>
              <input className="input" value={registre.name} onChange={e => setRegistre({ ...registre, name: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">Finalité</label>
              <input className="input" value={registre.purpose} onChange={e => setRegistre({ ...registre, purpose: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">Données collectées</label>
              <input className="input" value={registre.data} onChange={e => setRegistre({ ...registre, data: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">Base légale</label>
              <input className="input" value={registre.legal} onChange={e => setRegistre({ ...registre, legal: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">Responsable de traitement</label>
              <input className="input" value={registre.responsible} onChange={e => setRegistre({ ...registre, responsible: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">Mesures de sécurité</label>
              <input className="input" value={registre.security} onChange={e => setRegistre({ ...registre, security: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">Durée de conservation</label>
              <input className="input" value={registre.duration} onChange={e => setRegistre({ ...registre, duration: e.target.value })} />
            </div>
            <button type="button" className="mt-4 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded flex items-center" onClick={() => handleDownload('registre')}>
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> Télécharger PDF
            </button>
          </form>
        )}
        {tab === 'dpia' && (
          <form className="space-y-4">
            <div>
              <label className="block text-sm font-medium">Scénario</label>
              <input className="input" value={dpia.scenario} onChange={e => setDpia({ ...dpia, scenario: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">Risques identifiés</label>
              <input className="input" value={dpia.risks} onChange={e => setDpia({ ...dpia, risks: e.target.value })} />
            </div>
            <div>
              <label className="block text-sm font-medium">Mesures proposées</label>
              <input className="input" value={dpia.measures} onChange={e => setDpia({ ...dpia, measures: e.target.value })} />
            </div>
            <button type="button" className="mt-4 bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded flex items-center" onClick={() => handleDownload('dpia')}>
              <ArrowDownTrayIcon className="w-5 h-5 mr-2" /> Télécharger PDF
            </button>
          </form>
        )}
      </div>
      <style>{`
        .input { @apply w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400; }
      `}</style>
    </section>
  );
} 