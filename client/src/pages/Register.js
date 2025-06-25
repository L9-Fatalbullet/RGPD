import React, { useEffect, useState } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, SparklesIcon, DocumentCheckIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../App';

const API_URL = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev/api/registers';

const FIELDS = [
  { key: 'nom', label: 'Nom du traitement', required: true },
  { key: 'finalite', label: 'Finalité', required: true },
  { key: 'donnees', label: 'Données collectées', required: true },
  { key: 'base_legale', label: 'Base légale', required: true },
  { key: 'responsable', label: 'Responsable de traitement', required: true },
  { key: 'securite', label: 'Mesures de sécurité', required: true },
  { key: 'duree', label: 'Durée de conservation', required: true },
];

function emptyRegister() {
  return Object.fromEntries(FIELDS.map(f => [f.key, '']));
}

export default function Register({ folderId }) {
  const { token } = useAuth();
  const [registers, setRegisters] = useState([]);
  const [loading, setLoading] = useState(false);
  const [modal, setModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [form, setForm] = useState(emptyRegister());
  const [status, setStatus] = useState('');

  // Load registers
  useEffect(() => {
    if (!folderId) return;
    setLoading(true);
    fetch(`${API_URL}?folderId=${folderId}`, { headers: { Authorization: `Bearer ${localStorage.getItem('cndp_token')}` } })
      .then(r => r.json())
      .then(data => { setRegisters(data); setLoading(false); });
  }, [folderId]);

  // Open modal for add/edit
  const openModal = (reg = null) => {
    setEditId(reg ? reg.id : null);
    setForm(reg ? { ...reg } : emptyRegister());
    setModal(true);
    setStatus('');
  };
  const closeModal = () => { setModal(false); setEditId(null); setForm(emptyRegister()); setStatus(''); };

  // Handle form change
  const handleChange = (k, v) => setForm(f => ({ ...f, [k]: v }));

  // Save (add or edit)
  const handleSave = async e => {
    e.preventDefault();
    setStatus('Enregistrement...');
    const method = editId ? 'PUT' : 'POST';
    const url = editId ? `${API_URL}/${editId}` : API_URL;
    try {
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${localStorage.getItem('cndp_token')}` },
        body: JSON.stringify({ ...form, folderId })
      });
      const data = await res.json();
      if (data.success) {
        setStatus('Enregistré !');
        setTimeout(closeModal, 700);
      } else {
        setStatus("Erreur lors de l'enregistrement.");
      }
    } catch {
      setStatus("Erreur réseau ou serveur.");
    }
  };

  // Delete
  const handleDelete = async id => {
    if (!window.confirm('Supprimer ce traitement ?')) return;
    setStatus('Suppression...');
    try {
      const res = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${localStorage.getItem('cndp_token')}` }
      });
      const data = await res.json();
      if (data.success) setRegisters(r => r.filter(x => x.id !== id));
      setStatus('');
    } catch {
      setStatus("Erreur réseau ou serveur.");
    }
  };

  if (!folderId) return <div className="text-blue-700 font-semibold p-8">Veuillez sélectionner ou créer un dossier de conformité pour commencer.</div>;

  return (
    <section>
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <DocumentCheckIcon className="w-10 h-10 text-yellow-300" /> Registre des traitements
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Gérez vos traitements de données conformément à la Loi 09-08.</p>
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
      {/* List & Add Button */}
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2"><SparklesIcon className="w-7 h-7 text-blue-700" /> Mes traitements</h2>
        <button className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-4 py-2 rounded flex items-center gap-2 font-semibold shadow" onClick={() => openModal()}><PlusIcon className="w-5 h-5" /> Ajouter</button>
      </div>
      {loading ? <div className="text-blue-700">Chargement...</div> : (
        <div className="overflow-x-auto animate-fade-in">
          <table className="min-w-full bg-white/80 backdrop-blur rounded-xl shadow-lg">
            <thead>
              <tr>
                {FIELDS.map(f => <th key={f.key} className="px-4 py-2 text-left text-blue-900 font-semibold">{f.label}</th>)}
                <th className="px-4 py-2 text-left text-blue-900 font-semibold">Date</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {registers.map(reg => (
                <tr key={reg.id} className="border-b border-blue-100 hover:bg-blue-50/40 transition">
                  {FIELDS.map(f => <td key={f.key} className="px-4 py-2 text-gray-800">{reg[f.key]}</td>)}
                  <td className="px-4 py-2 text-gray-500 text-xs">{reg.date && reg.date.slice(0,10)}</td>
                  <td className="px-4 py-2 flex gap-2">
                    <button className="text-blue-700 hover:text-yellow-500" onClick={() => openModal(reg)}><PencilIcon className="w-5 h-5" /></button>
                    <button className="text-red-600 hover:text-red-800" onClick={() => handleDelete(reg.id)}><TrashIcon className="w-5 h-5" /></button>
                  </td>
                </tr>
              ))}
              {registers.length === 0 && <tr><td colSpan={FIELDS.length+2} className="text-center text-gray-500 py-8">Aucun traitement enregistré.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 animate-fade-in">
          <form className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg relative" onSubmit={handleSave}>
            <button type="button" className="absolute top-2 right-2 text-gray-400 hover:text-blue-700 text-2xl" onClick={closeModal}>&times;</button>
            <h3 className="text-xl font-bold text-blue-900 mb-4">{editId ? 'Modifier' : 'Ajouter'} un traitement</h3>
            <div className="grid grid-cols-1 gap-4">
              {FIELDS.map(f => (
                <div key={f.key}>
                  <label className="block text-blue-900 font-semibold mb-1">{f.label}{f.required && ' *'}</label>
                  <input className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400" value={form[f.key]} onChange={e => handleChange(f.key, e.target.value)} required={f.required} />
                </div>
              ))}
            </div>
            <button type="submit" className="mt-6 w-full bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded font-semibold shadow">{editId ? 'Enregistrer les modifications' : 'Ajouter'}</button>
            {status && <div className="text-xs text-blue-700 mt-2 animate-fade-in">{status}</div>}
          </form>
        </div>
      )}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 