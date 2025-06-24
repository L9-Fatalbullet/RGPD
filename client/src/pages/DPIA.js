import React, { useEffect, useState, useRef } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, SparklesIcon, ShieldCheckIcon, ArrowRightCircleIcon, ArrowLeftCircleIcon, CheckCircleIcon, InformationCircleIcon, DocumentArrowDownIcon, ExclamationTriangleIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../App';
import jsPDF from 'jspdf';

const API_URL = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev/api/dpias';

const COMMON_RISKS = [
  {
    label: "Accès non autorisé aux données",
    mesures: "Limiter les accès, authentification forte, journalisation des accès."
  },
  {
    label: "Perte de données",
    mesures: "Sauvegardes régulières, plan de reprise, stockage sécurisé."
  },
  {
    label: "Divulgation accidentelle",
    mesures: "Sensibilisation du personnel, procédures de gestion des incidents."
  },
  {
    label: "Altération des données",
    mesures: "Contrôles d'intégrité, restrictions d'écriture, suivi des modifications."
  },
  {
    label: "Non-respect des droits des personnes",
    mesures: "Procédure d'exercice des droits, information claire, suivi des demandes."
  },
];

const STEPS = [
  {
    key: 'description',
    label: 'Description du traitement',
    help: "Décrivez le traitement, l'organisme, le responsable, etc. (Art. 1, Loi 09-08)",
    fields: [
      { key: 'nom', label: 'Nom du traitement', required: true, help: "Exemple : Gestion RH, Vidéosurveillance" },
      { key: 'responsable', label: 'Responsable', required: true, help: "Personne ou service responsable du traitement." },
      { key: 'description', label: 'Description', required: true, help: "Résumé du traitement et de ses objectifs." },
    ],
  },
  {
    key: 'finalites',
    label: 'Finalités du traitement',
    help: "Expliquez pourquoi les données sont traitées. (Art. 3, Loi 09-08)",
    fields: [
      { key: 'finalites', label: 'Finalités', required: true, help: "Exemple : Gestion du personnel, sécurité, marketing." },
    ],
  },
  {
    key: 'donnees',
    label: 'Données & personnes concernées',
    help: "Listez les catégories de données et de personnes. (Art. 4, Loi 09-08)",
    fields: [
      { key: 'categories_donnees', label: 'Catégories de données', required: true, help: "Exemple : Données d'identité, santé, biométriques." },
      { key: 'personnes_concernees', label: 'Personnes concernées', required: true, help: "Exemple : Salariés, clients, visiteurs." },
    ],
  },
  {
    key: 'risques',
    label: 'Analyse des risques',
    help: "Sélectionnez les risques, évaluez gravité/probabilité, et consultez les mesures recommandées. (Art. 23, Loi 09-08)",
    fields: [],
  },
  {
    key: 'mesures',
    label: 'Mesures de sécurité',
    help: "Décrivez les mesures pour réduire les risques. (Art. 23, Loi 09-08)",
    fields: [
      { key: 'mesures', label: 'Mesures proposées', required: true, help: "Exemple : Chiffrement, contrôle d'accès, formation." },
    ],
  },
  {
    key: 'necessite',
    label: 'Nécessité & proportionnalité',
    help: "Justifiez la légitimité du traitement. (Art. 3, Loi 09-08)",
    fields: [
      { key: 'necessite', label: 'Nécessité/proportionnalité', required: true, help: "Pourquoi ce traitement est-il justifié et proportionné ?" },
    ],
  },
  {
    key: 'consultation',
    label: 'Consultation CNDP',
    help: "Avez-vous consulté la CNDP ou d'autres parties prenantes ? (Art. 46, Loi 09-08)",
    fields: [
      { key: 'consultation', label: 'Consultation (oui/non/détails)', required: false, help: "Exemple : Consultation DPO, CNDP, syndicats." },
    ],
  },
];

function emptyDPIA() {
  return {
    ...Object.fromEntries(STEPS.flatMap(s => s.fields.map(f => [f.key, '']))),
    risques_selectionnes: [],
    risques_details: [],
  };
}

export default function DPIA() {
  const { token } = useAuth();
  const [dpias, setDPIAs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyDPIA());
  const [status, setStatus] = useState('');
  const [review, setReview] = useState(false);
  const saveTimeout = useRef();
  const [saveStatus, setSaveStatus] = useState('');

  // Load DPIAs
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(API_URL, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setDPIAs(data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [token, wizard]);

  // Handle form change
  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Risk selection logic
  const handleRiskToggle = idx => {
    setForm(f => {
      const sel = f.risques_selectionnes || [];
      if (sel.includes(idx)) {
        return { ...f, risques_selectionnes: sel.filter(i => i !== idx) };
      } else {
        return { ...f, risques_selectionnes: [...sel, idx] };
      }
    });
  };
  const handleRiskDetail = (idx, field, value) => {
    setForm(f => {
      const details = [...(f.risques_details || [])];
      details[idx] = { ...details[idx], [field]: value };
      return { ...f, risques_details: details };
    });
  };
  // Auto-fill mesures from selected risks
  useEffect(() => {
    if (step === 4) {
      // On entering mesures step, auto-fill mesures if empty
      if (!form.mesures && form.risques_selectionnes && form.risques_selectionnes.length > 0) {
        const mesures = form.risques_selectionnes.map(idx => COMMON_RISKS[idx].mesures).join(' | ');
        setForm(f => ({ ...f, mesures }));
      }
    }
    // eslint-disable-next-line
  }, [step]);

  // Auto-save on form change (debounced)
  useEffect(() => {
    if (!token) return;
    setSaveStatus('Enregistrement...');
    if (saveTimeout.current) clearTimeout(saveTimeout.current);
    saveTimeout.current = setTimeout(() => {
      fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) setSaveStatus('Enregistré !');
          else setSaveStatus("Erreur lors de l'enregistrement.");
        })
        .catch(() => setSaveStatus("Erreur réseau ou serveur."));
    }, 700);
    return () => clearTimeout(saveTimeout.current);
  }, [form, token]);

  // Save DPIA
  const handleSave = async e => {
    e.preventDefault();
    setStatus('Enregistrement...');
    try {
      const res = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(form)
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Enregistré !');
        setTimeout(() => { setWizard(false); setReview(false); setForm(emptyDPIA()); setStatus(''); }, 1000);
      } else {
        setStatus("Erreur lors de l'enregistrement.");
      }
    } catch {
      setStatus("Erreur réseau ou serveur.");
    }
  };

  // Wizard navigation
  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));
  const startWizard = () => { setWizard(true); setStep(0); setForm(emptyDPIA()); setReview(false); setStatus(''); };

  // Render
  return (
    <section>
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <ShieldCheckIcon className="w-10 h-10 text-yellow-300" /> DPIA (Analyse d'impact)
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Générez une analyse d'impact conforme à la Loi 09-08 grâce à l'assistant pas à pas.</p>
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
      {/* Wizard or List */}
      {!wizard ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2"><SparklesIcon className="w-7 h-7 text-blue-700" /> Mes DPIA</h2>
            <button className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-4 py-2 rounded flex items-center gap-2 font-semibold shadow" onClick={startWizard}><PlusIcon className="w-5 h-5" /> Nouvelle DPIA</button>
          </div>
          {loading ? <div className="text-blue-700">Chargement...</div> : (
            <div className="overflow-x-auto animate-fade-in">
              <table className="min-w-full bg-white/80 backdrop-blur rounded-xl shadow-lg">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-blue-900 font-semibold">Nom</th>
                    <th className="px-4 py-2 text-left text-blue-900 font-semibold">Responsable</th>
                    <th className="px-4 py-2 text-left text-blue-900 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {dpias.map(dpia => (
                    <tr key={dpia.id} className="border-b border-blue-100 hover:bg-blue-50/40 transition">
                      <td className="px-4 py-2 text-gray-800">{dpia.nom}</td>
                      <td className="px-4 py-2 text-gray-800">{dpia.responsable}</td>
                      <td className="px-4 py-2 text-gray-500 text-xs">{dpia.date && dpia.date.slice(0,10)}</td>
                    </tr>
                  ))}
                  {dpias.length === 0 && <tr><td colSpan={3} className="text-center text-gray-500 py-8">Aucune DPIA enregistrée.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : review ? (
        <form className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-8 max-w-2xl mx-auto animate-fade-in" onSubmit={handleSave}>
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><CheckCircleIcon className="w-6 h-6 text-green-600" /> Revue finale</h3>
          <ul className="mb-6 space-y-2">
            {STEPS.map(s => s.fields.map(f => (
              <li key={f.key} className="flex gap-2"><span className="font-semibold text-blue-900">{f.label}:</span> <span>{form[f.key]}</span></li>
            )))}
            {/* Show selected risks and details */}
            {form.risques_selectionnes && form.risques_selectionnes.length > 0 && (
              <li className="flex flex-col gap-1">
                <span className="font-semibold text-blue-900">Risques analysés :</span>
                <ul className="list-disc pl-6">
                  {form.risques_selectionnes.map(idx => (
                    <li key={idx} className="mb-1">
                      <span className="font-semibold text-yellow-700"><ExclamationTriangleIcon className="w-4 h-4 inline mr-1" /> {COMMON_RISKS[idx].label}</span>
                      {form.risques_details && form.risques_details[idx] && (
                        <span className="ml-2 text-xs text-gray-600">(Gravité: {form.risques_details[idx].gravite || '-'}, Probabilité: {form.risques_details[idx].probabilite || '-'})</span>
                      )}
                      <div className="text-xs text-blue-700">Mesures: {COMMON_RISKS[idx].mesures}</div>
                    </li>
                  ))}
                </ul>
              </li>
            )}
          </ul>
          <button type="submit" className="w-full bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded font-semibold shadow mb-2">Enregistrer la DPIA</button>
          <button type="button" className="w-full bg-blue-100 text-blue-900 px-6 py-2 rounded font-semibold shadow flex items-center justify-center gap-2" disabled><DocumentArrowDownIcon className="w-5 h-5" /> Exporter PDF (bientôt)</button>
          <button type="button" className="w-full bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded font-semibold shadow flex items-center justify-center gap-2 mb-2" onClick={() => exportDPIAPDF(form)}>Exporter en PDF</button>
          {status && <div className="text-xs text-blue-700 mt-2 animate-fade-in">{status}</div>}
          {saveStatus && <div className="text-xs text-blue-700 mt-2 animate-fade-in">{saveStatus}</div>}
        </form>
      ) : (
        <form className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-8 max-w-2xl mx-auto animate-fade-in">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><ArrowRightCircleIcon className="w-6 h-6 text-blue-700" /> {STEPS[step].label}</h3>
          <div className="text-gray-700 text-sm mb-4 flex items-center gap-2"><InformationCircleIcon className="w-4 h-4 text-blue-400" /> {STEPS[step].help}</div>
          {/* Special risk matrix step */}
          {step === 3 && (
            <div className="mb-6">
              <div className="font-semibold text-blue-900 mb-2 flex items-center gap-2">Sélectionnez les risques à analyser <InformationCircleIcon className="w-4 h-4 text-blue-400" title={STEPS[3].help} /></div>
              <ul className="space-y-2 mb-4">
                {COMMON_RISKS.map((risk, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <input type="checkbox" className="accent-blue-700 mt-1" checked={form.risques_selectionnes && form.risques_selectionnes.includes(idx)} onChange={() => handleRiskToggle(idx)} />
                    <div>
                      <span className="font-semibold text-yellow-700 flex items-center gap-1"><ExclamationTriangleIcon className="w-5 h-5" /> {risk.label}</span>
                      <div className="text-xs text-blue-700">Mesures recommandées : {risk.mesures}</div>
                      {/* Risk matrix grid */}
                      {form.risques_selectionnes && form.risques_selectionnes.includes(idx) && (
                        <div className="flex gap-2 mt-2 items-center">
                          <label className="text-xs">Gravité :</label>
                          <select className="rounded border px-2 py-1 text-xs" value={form.risques_details && form.risques_details[idx]?.gravite || ''} onChange={e => handleRiskDetail(idx, 'gravite', e.target.value)}>
                            <option value="">-</option>
                            <option value="faible">Faible</option>
                            <option value="moyenne">Moyenne</option>
                            <option value="élevée">Élevée</option>
                          </select>
                          <label className="text-xs">Probabilité :</label>
                          <select className="rounded border px-2 py-1 text-xs" value={form.risques_details && form.risques_details[idx]?.probabilite || ''} onChange={e => handleRiskDetail(idx, 'probabilite', e.target.value)}>
                            <option value="">-</option>
                            <option value="faible">Faible</option>
                            <option value="moyenne">Moyenne</option>
                            <option value="élevée">Élevée</option>
                          </select>
                          {/* Highlight high risk */}
                          {form.risques_details && form.risques_details[idx]?.gravite === 'élevée' && form.risques_details[idx]?.probabilite === 'élevée' && (
                            <span className="ml-2 text-red-600 font-bold animate-pulse">Risque élevé !</span>
                          )}
                        </div>
                      )}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
          <div className="flex gap-4">
            <button type="button" className="bg-blue-100 text-blue-900 px-6 py-2 rounded font-semibold shadow flex items-center gap-2" onClick={prev} disabled={step === 0}><ArrowLeftCircleIcon className="w-5 h-5" /> Précédent</button>
            {step < STEPS.length - 1 ? (
              <button type="button" className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded font-semibold shadow flex items-center gap-2" onClick={next}>Suivant <ArrowRightCircleIcon className="w-5 h-5" /></button>
            ) : (
              <button type="button" className="bg-green-700 hover:bg-green-800 text-white px-6 py-2 rounded font-semibold shadow flex items-center gap-2" onClick={() => setReview(true)}><CheckCircleIcon className="w-5 h-5" /> Revue finale</button>
            )}
          </div>
        </form>
      )}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
}

function exportDPIAPDF(form) {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.text('Résumé DPIA', 10, 15);
  doc.setFontSize(12);
  let y = 25;
  STEPS.forEach((step, i) => {
    doc.text(`${step.label} :`, 10, y);
    y += 7;
    step.fields.forEach(f => {
      doc.text(`- ${f.label}: ${form[f.key] || ''}`, 12, y);
      y += 7;
    });
    if (step.key === 'risques' && form.risques_selectionnes && form.risques_selectionnes.length > 0) {
      doc.text('Risques analysés :', 12, y);
      y += 7;
      form.risques_selectionnes.forEach(idx => {
        doc.text(`- ${COMMON_RISKS[idx].label}`, 14, y);
        y += 7;
        if (form.risques_details && form.risques_details[idx]) {
          doc.text(`  Gravité: ${form.risques_details[idx].gravite || '-'}, Probabilité: ${form.risques_details[idx].probabilite || '-'}`, 16, y);
          y += 7;
        }
        doc.text(`  Mesures: ${COMMON_RISKS[idx].mesures}`, 16, y);
        y += 7;
      });
    }
    y += 2;
  });
  doc.save('DPIA_loi0908.pdf');
} 