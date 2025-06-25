import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, ClipboardDocumentListIcon, BookOpenIcon, DocumentTextIcon, SparklesIcon, ArrowLeftOnRectangleIcon, DocumentCheckIcon, ArrowPathIcon, ShieldCheckIcon } from '@heroicons/react/24/outline';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Guide from './pages/Guide';
import Documents from './pages/Documents';
import BestPractices from './pages/BestPractices';
import Login from './pages/Login';
import Register from './pages/Register';
import Progress from './pages/Progress';
import DPIA from './pages/DPIA';
import Admin from './pages/Admin';
import Profile from './pages/Profile';

// AuthContext
const AuthContext = createContext();
export function useAuth() { return useContext(AuthContext); }

function AuthProvider({ children }) {
  const [token, setToken] = useState(localStorage.getItem('cndp_token'));
  const [user, setUser] = useState(null);

  useEffect(() => {
    if (token) {
      // Decode JWT (simple, not verifying signature)
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setUser({ email: payload.email, id: payload.id, role: payload.role, organizationId: payload.organizationId });
      } catch {
        setUser(null);
      }
    } else {
      setUser(null);
    }
  }, [token]);

  function login(newToken) {
    setToken(newToken);
    localStorage.setItem('cndp_token', newToken);
  }
  function logout() {
    setToken(null);
    setUser(null);
    localStorage.removeItem('cndp_token');
  }

  return (
    <AuthContext.Provider value={{ token, user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

// ProtectedRoute
function ProtectedRoute({ children }) {
  const { token } = useAuth();
  const location = useLocation();
  if (!token) return <Navigate to="/login" state={{ from: location }} replace />;
  return children;
}

function Sidebar({ token, logout, user, collapsed, setCollapsed, activePath, setEditProfileOpen }) {
  const [hovered, setHovered] = React.useState(false);
  const nav = [
    { to: '/dashboard', label: 'Accueil', icon: <HomeIcon className="w-6 h-6" /> },
    { to: '/progress', label: 'Progression', icon: <ArrowPathIcon className="w-6 h-6" /> },
    { to: '/assessment', label: 'Auto-évaluation', icon: <ChartBarIcon className="w-6 h-6" /> },
    { to: '/register', label: 'Registre', icon: <DocumentCheckIcon className="w-6 h-6" /> },
    { to: '/dpia', label: 'DPIA', icon: <ShieldCheckIcon className="w-6 h-6" /> },
    { to: '/guide', label: 'Guide', icon: <BookOpenIcon className="w-6 h-6" /> },
    { to: '/documents', label: 'Documents', icon: <ClipboardDocumentListIcon className="w-6 h-6" /> },
    { to: '/best-practices', label: 'Bonnes pratiques', icon: <SparklesIcon className="w-6 h-6" /> },
  ];
  const isExpanded = hovered;
  return (
    <aside
      aria-label="Navigation principale"
      className={`relative overflow-hidden backdrop-blur-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 shadow-xl border-r-4 border-yellow-400 ${isExpanded ? 'w-64' : 'w-20'} min-h-screen flex flex-col fixed z-40 left-0 top-0 transition-all duration-300 rounded-tr-3xl rounded-br-3xl`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Moroccan Pattern Overlay */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{zIndex:0}} viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <pattern id="moroccan" width="40" height="40" patternUnits="userSpaceOnUse">
            <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="#fff" fillOpacity="0.02" />
            <circle cx="20" cy="20" r="6" fill="#facc15" fillOpacity="0.025" />
          </pattern>
        </defs>
        <rect width="120" height="120" fill="url(#moroccan)" />
      </svg>
      {/* Soft border glow */}
      <div className="absolute inset-0 rounded-tr-3xl rounded-br-3xl border-2 border-yellow-400/20 pointer-events-none" style={{boxShadow:'0 0 32px 0 #facc1540, 0 2px 16px 0 #1e293b40'}}></div>
      {/* Sidebar content */}
      <div className={`relative flex flex-col items-center ${isExpanded ? 'gap-3 px-6 py-6' : 'py-4'} border-b border-blue-100`} style={{zIndex:1}}>
        <img src="/logo.png" alt="RGPD Compliance Maroc Logo" className={`transition-transform duration-300 ${isExpanded ? 'w-16 h-16' : 'w-10 h-10'} object-contain rounded-full shadow-lg hover:scale-110`} />
        {isExpanded && <span className="text-lg font-bold text-white text-center leading-tight mt-2">RGPD Compliance<br />Maroc</span>}
      </div>
      <nav className="relative flex-1 px-2 py-6 flex flex-col gap-2" role="navigation" style={{zIndex:1}}>
        {nav.map(item => (
          <Link key={item.to} to={item.to} aria-label={item.label} tabIndex={0}
            className={`group flex items-center gap-3 px-3 py-2 my-1 rounded-full font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-yellow-400
              ${activePath === item.to ? 'bg-yellow-400/80 text-blue-900 shadow-lg border-l-4 border-yellow-500' : 'hover:bg-yellow-100/80 hover:text-yellow-300 text-white'}`}
          >
            <span className="transition-transform group-hover:scale-110 text-white">{item.icon}</span>
            {isExpanded && item.label}
          </Link>
        ))}
        {user && user.role === 'admin' && isExpanded && (
          <li>
            <Link to="/admin" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-yellow-100/80 transition text-base font-medium text-white">
              <span className="icon">🛡️</span> Admin
            </Link>
          </li>
        )}
      </nav>
      <div className={`relative w-full px-4 pb-6`} style={{zIndex:1}}>
        <div className="flex flex-col items-center gap-2">
          <Link to="/profile" className="relative group">
            <img src={user?.avatar || '/default-avatar.png'} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-yellow-400 shadow object-cover bg-white group-hover:scale-110 transition" />
            {!user?.avatar && (
              <span className="absolute inset-0 flex items-center justify-center">
                <svg width="20" height="20" fill="none" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4" stroke="#2563eb" strokeWidth="2"/><path d="M4 20c0-2.21 3.582-4 8-4s8 1.79 8 4" stroke="#2563eb" strokeWidth="2"/></svg>
              </span>
            )}
          </Link>
          <button onClick={logout} className={`w-full bg-yellow-400 hover:bg-yellow-500 text-blue-900 rounded px-3 py-2 font-semibold transition shadow whitespace-nowrap mt-2 flex items-center justify-center gap-2`} tabIndex={0}>
            <img src="/logout.svg" alt="Déconnexion" className="w-6 h-6" />
            {isExpanded && <span>Déconnexion</span>}
          </button>
        </div>
      </div>
    </aside>
  );
}

function Topbar({ user, onMenuClick }) {
  return (
    <header className="md:hidden sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow flex items-center justify-between px-4 py-3 border-b border-yellow-400">
      <button aria-label="Ouvrir le menu" onClick={onMenuClick} className="p-2 rounded-full bg-yellow-400/80 hover:bg-yellow-400 transition md:hidden">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      <span className="flex items-center gap-2">
        <img src="/logo.png" alt="RGPD Compliance Maroc Logo" className="w-8 h-8 object-contain" />
        <span className="text-lg font-bold tracking-tight text-blue-900">RGPD Compliance Maroc</span>
      </span>
      {user && <span className="text-xs text-blue-900">{user.email}</span>}
    </header>
  );
}

// FolderSwitcher component
function FolderSwitcher({ folderId, setFolderId, token }) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newName, setNewName] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState('');

  useEffect(() => {
    if (!token) return;
    fetch('/api/folders', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(f => { setFolders(f); setLoading(false); });
  }, [token, folderId]);

  function selectFolder(id) {
    setFolderId(id);
    localStorage.setItem('cndp_folder', id);
  }
  function createFolder() {
    if (!newName.trim()) return;
    fetch('/api/folders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: newName })
    }).then(r => r.json()).then(f => {
      setFolders([...folders, f]);
      setFolderId(f.id);
      localStorage.setItem('cndp_folder', f.id);
      setNewName('');
      setShowCreate(false);
    });
  }
  function startRename(id, name) {
    setRenamingId(id);
    setRenameValue(name);
  }
  function renameFolder(id) {
    if (!renameValue.trim()) return;
    fetch(`/api/folders/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: renameValue })
    }).then(r => r.json()).then(f => {
      setFolders(folders.map(folder => folder.id === id ? f : folder));
      setRenamingId(null);
      setRenameValue('');
    });
  }
  function deleteFolder(id) {
    if (!window.confirm('Supprimer ce dossier de conformité ?')) return;
    fetch(`/api/folders/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    }).then(() => {
      const updated = folders.filter(f => f.id !== id);
      setFolders(updated);
      if (folderId === id && updated.length > 0) {
        setFolderId(updated[0].id);
        localStorage.setItem('cndp_folder', updated[0].id);
      } else if (updated.length === 0) {
        setFolderId(null);
        localStorage.removeItem('cndp_folder');
      }
    });
  }

  if (loading) return <div className="text-blue-700 text-sm mb-2">Chargement des dossiers...</div>;
  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <span className="font-semibold text-blue-900">Dossier conformité :</span>
      <select value={folderId || ''} onChange={e => selectFolder(Number(e.target.value))} className="rounded border px-3 py-1 text-blue-900 bg-white shadow">
        {folders.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
      </select>
      <button onClick={() => setShowCreate(v => !v)} className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 rounded px-2 py-1 text-xs font-semibold shadow">Nouveau dossier</button>
      {showCreate && (
        <span className="flex items-center gap-1">
          <input value={newName} onChange={e => setNewName(e.target.value)} className="rounded border px-2 py-1 text-sm" placeholder="Nom du dossier" />
          <button onClick={createFolder} className="bg-blue-700 text-white rounded px-2 py-1 text-xs font-semibold ml-1">Créer</button>
        </span>
      )}
      {folders.map(f => (
        <span key={f.id} className="flex items-center gap-1">
          {renamingId === f.id ? (
            <>
              <input value={renameValue} onChange={e => setRenameValue(e.target.value)} className="rounded border px-2 py-1 text-sm" />
              <button onClick={() => renameFolder(f.id)} className="bg-blue-700 text-white rounded px-2 py-1 text-xs font-semibold ml-1">Renommer</button>
              <button onClick={() => setRenamingId(null)} className="text-xs ml-1">Annuler</button>
            </>
          ) : (
            <>
              <button onClick={() => startRename(f.id, f.name)} className="text-xs text-blue-700 underline">Renommer</button>
              <button onClick={() => deleteFolder(f.id)} className="text-xs text-red-600 underline">Supprimer</button>
            </>
          )}
        </span>
      ))}
    </div>
  );
}

function App() {
  const { token, user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState(null);
  const location = window.location.pathname;
  const sidebarRef = useRef();
  const [folderId, setFolderId] = useState(null);

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

  // Handle profile update (local only for now)
  function handleProfileSave(e) {
    e.preventDefault();
    // Here you would send to backend; for now, update localStorage and reload
    const updatedUser = { ...user, name: editName };
    localStorage.setItem('cndp_token', localStorage.getItem('cndp_token'));
    setEditProfileOpen(false);
    window.location.reload();
  }

  return (
    <Router>
      <div className="font-sans min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex relative overflow-x-hidden">
        {/* Moroccan Mosaic Background */}
        <svg className="fixed inset-0 w-screen h-screen z-0 pointer-events-none" style={{opacity:0.22}} viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none">
          <defs>
            <pattern id="mosaic" width="40" height="40" patternUnits="userSpaceOnUse">
              <g>
                <rect x="0" y="0" width="40" height="40" fill="#fff" fillOpacity="0.0" />
                <path d="M20 0 L40 20 L20 40 L0 20 Z" fill="#2563eb" fillOpacity="0.22" />
                <circle cx="20" cy="20" r="8" fill="#facc15" fillOpacity="0.18" />
                <circle cx="20" cy="20" r="3" fill="#2563eb" fillOpacity="0.18" />
              </g>
            </pattern>
          </defs>
          <rect width="100vw" height="100vh" fill="url(#mosaic)" />
        </svg>
        {/* Desktop Sidebar */}
        <Sidebar token={token} logout={logout} user={user} collapsed={collapsed} setCollapsed={setCollapsed} activePath={location} setEditProfileOpen={setEditProfileOpen} />
        {/* Mobile Sidebar Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu mobile">
            <aside ref={sidebarRef} className="absolute left-0 top-0 h-full w-64 bg-white/90 backdrop-blur-lg shadow-xl border-r-4 border-yellow-400 rounded-tr-3xl rounded-br-3xl animate-fade-in">
              <Sidebar token={token} logout={logout} user={user} collapsed={false} setCollapsed={() => {}} activePath={location} setEditProfileOpen={setEditProfileOpen} />
            </aside>
          </div>
        )}
        <div className={`flex-1 ${collapsed ? 'md:ml-20' : 'md:ml-64'} flex flex-col min-h-screen bg-white transition-all`}>
          <Topbar user={user} onMenuClick={() => setMobileOpen(true)} />
          <FolderSwitcher folderId={folderId} setFolderId={setFolderId} token={token} />
          <main className="flex-1 p-4 md:p-8 min-h-screen bg-white" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="w-full bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 md:p-10">
              <Routes>
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard folderId={folderId} /></ProtectedRoute>} />
                <Route path="/progress" element={<ProtectedRoute><Progress folderId={folderId} /></ProtectedRoute>} />
                <Route path="/assessment" element={<ProtectedRoute><Assessment folderId={folderId} /></ProtectedRoute>} />
                <Route path="/register" element={<ProtectedRoute><Register folderId={folderId} /></ProtectedRoute>} />
                <Route path="/dpia" element={<ProtectedRoute><DPIA folderId={folderId} /></ProtectedRoute>} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                <Route path="/best-practices" element={<BestPractices />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </main>
          <footer className="text-center text-xs text-blue-900 py-4 opacity-80">
            © {new Date().getFullYear()} Conformité CNDP – Loi 09-08. Application de conformité marocaine.
          </footer>
        </div>
      </div>
      {/* Profile Edit Modal */}
      {editProfileOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
          <form className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-xs flex flex-col gap-4" onSubmit={handleProfileSave}>
            <h2 className="text-lg font-bold text-blue-900 mb-2">Modifier le profil</h2>
            <label className="text-sm font-semibold text-blue-900">Nom</label>
            <input type="text" className="rounded border px-3 py-2" value={editName} onChange={e => setEditName(e.target.value)} />
            <label className="text-sm font-semibold text-blue-900">Avatar</label>
            <input type="file" accept="image/*" className="rounded border px-3 py-2" onChange={e => setEditAvatar(e.target.files[0])} />
            <div className="flex gap-2 mt-4">
              <button type="button" className="flex-1 bg-gray-200 hover:bg-gray-300 text-blue-900 rounded px-4 py-2 font-semibold" onClick={() => setEditProfileOpen(false)}>Annuler</button>
              <button type="submit" className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-blue-900 rounded px-4 py-2 font-semibold">Enregistrer</button>
            </div>
          </form>
        </div>
      )}
      <style>{`
        body { font-family: 'Inter', 'Nunito', 'Open Sans', sans-serif; }
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </Router>
  );
}

export default function AppWithAuth() {
  return <AuthProvider><App /></AuthProvider>;
} 