import React, { useEffect, useState } from 'react';
import { useAuth } from '../App';
import { ShieldCheckIcon, UserGroupIcon, PlusIcon, PencilIcon, ArrowPathIcon, NewspaperIcon } from '@heroicons/react/24/outline';

const API_USERS = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev/api/users';
const API_AUDIT = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev/api/audit';

export default function Admin() {
  const { token, user } = useAuth();
  const [users, setUsers] = useState([]);
  const [audit, setAudit] = useState([]);
  const [loading, setLoading] = useState(true);
  const [invite, setInvite] = useState({ email: '', password: '', role: 'user', organizationId: '' });
  const [inviteStatus, setInviteStatus] = useState('');
  const [roleEdit, setRoleEdit] = useState({});
  const [roleStatus, setRoleStatus] = useState('');
  const [tab, setTab] = useState('users');

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    fetch(API_USERS, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => { setUsers(data); setLoading(false); })
      .catch(() => setLoading(false));
    fetch(API_AUDIT, { headers: { Authorization: `Bearer ${token}` } })
      .then(res => res.json())
      .then(data => setAudit(data));
  }, [token]);

  // Invite user
  const handleInvite = async e => {
    e.preventDefault();
    setInviteStatus('Envoi...');
    try {
      const res = await fetch(API_USERS + '/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(invite)
      });
      const data = await res.json();
      if (data.success) {
        setInviteStatus('Utilisateur ajouté !');
        setInvite({ email: '', password: '', role: 'user', organizationId: '' });
      } else {
        setInviteStatus(data.error || 'Erreur.');
      }
    } catch {
      setInviteStatus('Erreur réseau ou serveur.');
    }
  };

  // Change user role
  const handleRoleChange = async (id, role) => {
    setRoleStatus('Changement...');
    try {
      const res = await fetch(`${API_USERS}/${id}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role })
      });
      const data = await res.json();
      if (data.success) {
        setRoleStatus('Rôle mis à jour !');
        setUsers(users => users.map(u => u.id === id ? { ...u, role } : u));
      } else {
        setRoleStatus(data.error || 'Erreur.');
      }
    } catch {
      setRoleStatus('Erreur réseau ou serveur.');
    }
  };

  if (!user || user.role !== 'admin') {
    return <div className="text-center text-red-700 font-bold mt-10">Accès réservé aux administrateurs.</div>;
  }

  return (
    <section>
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <ShieldCheckIcon className="w-10 h-10 text-yellow-300" /> Admin Panel
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Gestion des utilisateurs, rôles, audit, et contenus légaux.</p>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <UserGroupIcon className="w-20 h-20 text-white/60" />
        </div>
      </div>
      <div className="flex gap-4 mb-6">
        <button className={`px-4 py-2 rounded-t font-semibold border-b-2 transition-all ${tab === 'users' ? 'bg-blue-100 border-blue-700 text-blue-900' : 'bg-gray-100 border-transparent text-gray-500'}`} onClick={() => setTab('users')}><UserGroupIcon className="w-5 h-5 inline" /> Utilisateurs</button>
        <button className={`px-4 py-2 rounded-t font-semibold border-b-2 transition-all ${tab === 'audit' ? 'bg-blue-100 border-blue-700 text-blue-900' : 'bg-gray-100 border-transparent text-gray-500'}`} onClick={() => setTab('audit')}><ArrowPathIcon className="w-5 h-5 inline" /> Audit</button>
        <button className={`px-4 py-2 rounded-t font-semibold border-b-2 transition-all ${tab === 'content' ? 'bg-blue-100 border-blue-700 text-blue-900' : 'bg-gray-100 border-transparent text-gray-500'}`} onClick={() => setTab('content')}><NewspaperIcon className="w-5 h-5 inline" /> Contenus légaux</button>
      </div>
      {tab === 'users' && (
        <div className="mb-10 animate-fade-in">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Utilisateurs</h2>
          <table className="min-w-full bg-white/80 backdrop-blur rounded-xl shadow-lg mb-6">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-blue-900 font-semibold">Email</th>
                <th className="px-4 py-2 text-left text-blue-900 font-semibold">Rôle</th>
                <th className="px-4 py-2 text-left text-blue-900 font-semibold">Organisation</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-blue-100 hover:bg-blue-50/40 transition">
                  <td className="px-4 py-2 text-gray-800">{u.email}</td>
                  <td className="px-4 py-2 text-gray-800">
                    {roleEdit[u.id] ? (
                      <select value={roleEdit[u.id]} onChange={e => setRoleEdit(r => ({ ...r, [u.id]: e.target.value }))} className="rounded border px-2 py-1">
                        <option value="user">Utilisateur</option>
                        <option value="dpo">DPO</option>
                        <option value="admin">Admin</option>
                      </select>
                    ) : (
                      <span>{u.role}</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-gray-800">{u.organizationId}</td>
                  <td className="px-4 py-2">
                    {roleEdit[u.id] ? (
                      <button className="bg-blue-700 text-white px-3 py-1 rounded" onClick={() => { handleRoleChange(u.id, roleEdit[u.id]); setRoleEdit(r => { const x = { ...r }; delete x[u.id]; return x; }); }}>Valider</button>
                    ) : (
                      <button className="text-blue-700 hover:text-yellow-500" onClick={() => setRoleEdit(r => ({ ...r, [u.id]: u.role }))}><PencilIcon className="w-5 h-5" /></button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {roleStatus && <div className="text-xs text-blue-700 mb-2 animate-fade-in">{roleStatus}</div>}
          <h3 className="text-lg font-bold text-blue-900 mb-2 flex items-center gap-2"><PlusIcon className="w-5 h-5" /> Inviter un utilisateur</h3>
          <form className="flex flex-col md:flex-row gap-4 items-end" onSubmit={handleInvite}>
            <input className="rounded border px-3 py-2" placeholder="Email" value={invite.email} onChange={e => setInvite(i => ({ ...i, email: e.target.value }))} required />
            <input className="rounded border px-3 py-2" placeholder="Mot de passe" value={invite.password} onChange={e => setInvite(i => ({ ...i, password: e.target.value }))} required />
            <select className="rounded border px-3 py-2" value={invite.role} onChange={e => setInvite(i => ({ ...i, role: e.target.value }))}>
              <option value="user">Utilisateur</option>
              <option value="dpo">DPO</option>
              <option value="admin">Admin</option>
            </select>
            <input className="rounded border px-3 py-2" placeholder="Organisation ID" value={invite.organizationId} onChange={e => setInvite(i => ({ ...i, organizationId: e.target.value }))} required />
            <button className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-4 py-2 rounded font-semibold shadow" type="submit">Inviter</button>
          </form>
          {inviteStatus && <div className="text-xs text-blue-700 mt-2 animate-fade-in">{inviteStatus}</div>}
        </div>
      )}
      {tab === 'audit' && (
        <div className="mb-10 animate-fade-in">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Audit trail</h2>
          <table className="min-w-full bg-white/80 backdrop-blur rounded-xl shadow-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-blue-900 font-semibold">Date</th>
                <th className="px-4 py-2 text-left text-blue-900 font-semibold">Utilisateur</th>
                <th className="px-4 py-2 text-left text-blue-900 font-semibold">Action</th>
                <th className="px-4 py-2 text-left text-blue-900 font-semibold">Type</th>
                <th className="px-4 py-2 text-left text-blue-900 font-semibold">ID</th>
              </tr>
            </thead>
            <tbody>
              {audit.map(log => (
                <tr key={log.id} className="border-b border-blue-100 hover:bg-blue-50/40 transition">
                  <td className="px-4 py-2 text-gray-800 text-xs">{log.timestamp && log.timestamp.slice(0,19).replace('T',' ')}</td>
                  <td className="px-4 py-2 text-gray-800">{log.email}</td>
                  <td className="px-4 py-2 text-gray-800">{log.action}</td>
                  <td className="px-4 py-2 text-gray-800">{log.type}</td>
                  <td className="px-4 py-2 text-gray-800">{log.itemId}</td>
                </tr>
              ))}
              {audit.length === 0 && <tr><td colSpan={5} className="text-center text-gray-500 py-8">Aucune action enregistrée.</td></tr>}
            </tbody>
          </table>
        </div>
      )}
      {tab === 'content' && (
        <div className="mb-10 animate-fade-in">
          <h2 className="text-xl font-bold text-blue-900 mb-4">Gestion des contenus légaux</h2>
          <div className="text-gray-700">(Bientôt : gestion des actualités, bonnes pratiques, modèles de documents...)</div>
        </div>
      )}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 