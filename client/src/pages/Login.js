import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const API_URL = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev/api/auth';

export default function Login() {
  const [tab, setTab] = useState('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [status, setStatus] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [logoLoaded, setLogoLoaded] = useState(false);

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
    <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 relative overflow-hidden">
      {/* Animated Moroccan pattern background */}
      <svg className="absolute inset-0 w-full h-full opacity-10 pointer-events-none animate-bg-fade" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
        <defs>
          <pattern id="login-mosaic" width="40" height="40" patternUnits="userSpaceOnUse">
            <g>
              <rect x="0" y="0" width="40" height="40" fill="#fff" fillOpacity="0.0" />
              <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="#2563eb" fillOpacity="0.18" />
              <circle cx="20" cy="20" r="8" fill="#facc15" fillOpacity="0.12" />
              <circle cx="20" cy="20" r="3" fill="#2563eb" fillOpacity="0.10" />
            </g>
          </pattern>
        </defs>
        <rect width="100vw" height="100vh" fill="url(#login-mosaic)" />
      </svg>
      <div className="relative z-10 w-full max-w-md bg-white/70 backdrop-blur-xl rounded-2xl shadow-2xl p-8 flex flex-col items-center animate-fade-in border border-white/40" style={{boxShadow:'0 8px 32px 0 #2563eb40, 0 1.5px 8px 0 #facc1540'}}>
        <img src="/logo.png" alt="Logo" className={`w-20 h-20 mb-4 drop-shadow-xl transition-all duration-700 ${logoLoaded ? 'opacity-100 scale-100' : 'opacity-0 scale-75'}`} onLoad={() => setLogoLoaded(true)} />
        <h1 className="text-2xl font-bold text-blue-900 mb-2 animate-fade-in">Bienvenue</h1>
        <p className="text-blue-900 mb-6 text-center animate-fade-in">Connectez-vous à votre espace conformité Loi 09-08</p>
        <form className="w-full flex flex-col gap-4" onSubmit={handleSubmit}>
          <input type="email" className="rounded border px-4 py-3 text-lg focus:ring-2 focus:ring-blue-400 focus:shadow-lg transition-all duration-200" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} required />
          <div className="relative">
            <input type={showPassword ? 'text' : 'password'} className="rounded border px-4 py-3 text-lg w-full focus:ring-2 focus:ring-blue-400 focus:shadow-lg transition-all duration-200 pr-12" placeholder="Mot de passe" value={password} onChange={e => setPassword(e.target.value)} required />
            <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-700" tabIndex={-1} onClick={() => setShowPassword(v => !v)}>
              {showPassword ? (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M3.98 8.223A10.477 10.477 0 0 0 2.25 12c2.083 3.61 6.014 6 9.75 6 1.563 0 3.06-.362 4.396-1.02M6.228 6.228A9.956 9.956 0 0 1 12 6c3.736 0 7.667 2.39 9.75 6a10.477 10.477 0 0 1-1.67 2.785M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm-6.364 6.364 12-12" /></svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12S5.25 6.75 12 6.75 21.75 12 21.75 12 18.75 17.25 12 17.25 2.25 12 2.25 12Zm9.75 0a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0Z" /></svg>
              )}
            </button>
          </div>
          {tab === 'register' && (
            <input type={showPassword ? 'text' : 'password'} className="rounded border px-4 py-3 text-lg focus:ring-2 focus:ring-blue-400 focus:shadow-lg transition-all duration-200" placeholder="Confirmer le mot de passe" value={confirm} onChange={e => setConfirm(e.target.value)} required />
          )}
          <div className="flex items-center justify-between">
            <button type="submit" className="w-full bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-3 rounded-lg text-lg font-semibold shadow transition-all duration-200 hover:scale-105 focus:ring-2 focus:ring-yellow-400">
              {tab === 'login' ? 'Se connecter' : 'Créer un compte'}
            </button>
          </div>
          <div className="flex justify-end mt-1">
            {tab === 'login' && (
              <button type="button" className="text-xs text-blue-700 hover:underline focus:outline-none">Mot de passe oublié ?</button>
            )}
          </div>
          {status && <div className="text-xs text-blue-700 mt-2 animate-fade-in text-center">{status}</div>}
        </form>
        <div className="mt-6 text-center">
          {tab === 'login' ? (
            <div className="space-y-2">
              <span className="text-blue-900">Pas de compte ?</span>
              <div className="flex flex-col gap-2">
                <Link to="/register" className="text-yellow-600 hover:underline font-semibold">
                  Rejoindre une organisation (avec code d'invitation)
                </Link>
                <Link to="/register-organization" className="text-yellow-600 hover:underline font-semibold">
                  Créer une nouvelle organisation
                </Link>
              </div>
            </div>
          ) : (
            <span className="text-blue-900">Déjà inscrit ?{' '}
              <button className="text-yellow-600 hover:underline font-semibold" onClick={() => setTab('login')}>Se connecter</button>
            </span>
          )}
        </div>
        <div className="mt-8 flex items-center gap-2 text-xs text-blue-900/70 font-semibold">
          <svg className="w-5 h-5 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><circle cx="12" cy="12" r="10" stroke="#facc15" strokeWidth="2" fill="none"/><path d="M8 12l2 2 4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Sécurité CNDP Maroc
        </div>
      </div>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
        @keyframes bg-fade { 0% { opacity: 0.08; } 50% { opacity: 0.16; } 100% { opacity: 0.08; } }
        .animate-bg-fade { animation: bg-fade 6s ease-in-out infinite alternate; }
      `}</style>
    </section>
  );
} 