import React, { useState } from 'react';
import { SparklesIcon, LockClosedIcon } from '@heroicons/react/24/outline';

const API_URL = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev/api/auth';

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
    <section className="min-h-screen flex flex-col justify-center items-center bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 animate-fade-in">
      {/* Hero/Intro Section */}
      <div className="w-full max-w-md mx-auto">
        <div className="relative overflow-hidden rounded-2xl mb-8 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col items-center animate-fade-in">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <SparklesIcon className="w-10 h-10 text-yellow-300" /> Connexion
          </h1>
          <p className="text-lg font-light mb-4 drop-shadow">Accédez à votre espace conformité Loi 09-08.</p>
          {/* Moroccan-inspired SVG */}
          <svg width="100" height="100" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="70" cy="70" r="60" fill="#fff" fillOpacity="0.12" />
            <circle cx="70" cy="70" r="40" fill="#fff" fillOpacity="0.10" />
            <path d="M70 30 L90 70 L50 70 Z" fill="#2563eb" fillOpacity="0.7" />
            <circle cx="70" cy="70" r="14" fill="#facc15" fillOpacity="0.8" />
            <text x="70" y="77" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e293b">CNDP</text>
          </svg>
        </div>
        {/* Login Card */}
        <form onSubmit={handleSubmit} className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-8 border-t-4 border-blue-100 animate-fade-in">
          <div className="mb-4">
            <label className="block text-blue-900 font-semibold mb-1">Email</label>
            <input type="email" className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400" value={email} onChange={e => setEmail(e.target.value)} required />
          </div>
          <div className="mb-6">
            <label className="block text-blue-900 font-semibold mb-1">Mot de passe</label>
            <input type="password" className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400" value={password} onChange={e => setPassword(e.target.value)} required />
          </div>
          <button type="submit" className="w-full bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded flex items-center justify-center text-lg font-semibold shadow transition-all animate-fade-in">
            <LockClosedIcon className="w-5 h-5 mr-2" /> Se connecter
          </button>
          {status && <div className="text-xs text-blue-700 mt-4 animate-fade-in">{status}</div>}
        </form>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 