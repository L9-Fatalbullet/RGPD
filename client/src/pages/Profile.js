import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';

const API_BASE = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev';

export default function Profile() {
  const { user } = useAuth();
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [avatar, setAvatar] = useState(null);
  const [status, setStatus] = useState('');
  const [organization, setOrganization] = useState(null);

  useEffect(() => {
    if (user?.organizationId) {
      // Fetch organization details
      fetch(`${API_BASE}/api/organization`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('cndp_token')}` }
      })
        .then(res => res.json())
        .then(data => setOrganization(data))
        .catch(err => console.error('Error fetching organization:', err));
    }
  }, [user]);

  function handleSubmit(e) {
    e.preventDefault();
    if (password && password !== confirm) {
      setStatus('Les mots de passe ne correspondent pas.');
      return;
    }
    setStatus('Profil mis à jour avec succès !');
  }

  return (
    <section className="max-w-lg mx-auto mt-10 bg-white/80 backdrop-blur rounded-2xl shadow-lg p-8 animate-fade-in">
      <h1 className="text-2xl font-bold text-blue-900 mb-6 text-center">Mon profil</h1>
      
      {/* Organization Information */}
      {organization && (
        <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">Organisation</h3>
          <div className="text-blue-700">
            <p><span className="font-medium">Nom:</span> {organization.name}</p>
            {organization.description && (
              <p><span className="font-medium">Description:</span> {organization.description}</p>
            )}
            {organization.email && (
              <p><span className="font-medium">Email:</span> {organization.email}</p>
            )}
          </div>
        </div>
      )}

      <form className="flex flex-col gap-4" onSubmit={handleSubmit}>
        <label className="font-semibold text-blue-900">Nom</label>
        <input type="text" className="rounded border px-3 py-2" value={name} onChange={e => setName(e.target.value)} />
        <label className="font-semibold text-blue-900">Email</label>
        <input type="email" className="rounded border px-3 py-2" value={email} onChange={e => setEmail(e.target.value)} />
        <div className="text-sm text-blue-700 font-semibold mb-2">Rôle : {user?.role === 'admin' ? 'Administrateur' : user?.role === 'dpo' ? 'DPO' : user?.role === 'representant' ? 'Représentant légal' : user?.role}</div>
        <label className="font-semibold text-blue-900">Mot de passe</label>
        <input type="password" className="rounded border px-3 py-2" value={password} onChange={e => setPassword(e.target.value)} />
        <label className="font-semibold text-blue-900">Confirmer le mot de passe</label>
        <input type="password" className="rounded border px-3 py-2" value={confirm} onChange={e => setConfirm(e.target.value)} />
        <label className="font-semibold text-blue-900">Avatar</label>
        <input type="file" accept="image/*" className="rounded border px-3 py-2" onChange={e => setAvatar(e.target.files[0])} />
        <button type="submit" className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 rounded px-4 py-2 font-semibold mt-4">Enregistrer</button>
        {status && <div className="text-green-700 font-semibold text-center mt-2">{status}</div>}
      </form>
    </section>
  );
} 