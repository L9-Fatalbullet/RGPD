import React, { useState } from 'react';

const API_URL = 'http://localhost:4000/api/auth';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('');

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus('Traitement...');
    if (tab === 'register' && password !== confirm) {
      setStatus('Les mots de passe ne correspondent pas.');
      return;
    }
    try {
      const res = await fetch(`${API_URL}/${tab}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (data.token) {
        localStorage.setItem('cndp_token', data.token);
        setStatus('Connecté !');
        window.location.href = '/dashboard';
      } else {
        setStatus(data.error || 'Erreur inconnue.');
      }
    } catch (e) {
      setStatus('Erreur réseau ou serveur.');
    }
  }

  return (
    <section className="max-w-md mx-auto bg-white rounded shadow p-8 mt-8">
      <div className="flex gap-2 mb-6">
        <button
          className={`px-4 py-2 rounded-t font-semibold border-b-2 transition-all ${tab === 'login' ? 'bg-blue-100 border-blue-700 text-blue-900' : 'bg-gray-100 border-transparent text-gray-500'}`}
          onClick={() => { setTab('login'); setStatus(''); }}
        >Connexion</button>
        <button
          className={`px-4 py-2 rounded-t font-semibold border-b-2 transition-all ${tab === 'register' ? 'bg-blue-100 border-blue-700 text-blue-900' : 'bg-gray-100 border-transparent text-gray-500'}`}
          onClick={() => { setTab('register'); setStatus(''); }}
        >Créer un compte</button>
      </div>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div>
          <label className="block text-sm font-medium">Email</label>
          <input type="email" className="input" value={email} onChange={e => setEmail(e.target.value)} required />
        </div>
        <div>
          <label className="block text-sm font-medium">Mot de passe</label>
          <input type="password" className="input" value={password} onChange={e => setPassword(e.target.value)} required />
        </div>
        {tab === 'register' && (
          <div>
            <label className="block text-sm font-medium">Confirmer le mot de passe</label>
            <input type="password" className="input" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          </div>
        )}
        <button type="submit" className="w-full bg-blue-700 hover:bg-blue-800 text-white px-6 py-2 rounded font-semibold mt-4">{tab === 'login' ? 'Se connecter' : 'Créer un compte'}</button>
      </form>
      {status && <div className="text-xs text-blue-700 mt-4">{status}</div>}
      <style>{`
        .input { @apply w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400; }
      `}</style>
    </section>
  );
} 