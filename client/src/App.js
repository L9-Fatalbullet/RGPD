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

function Topbar({ user, onMenuClick, folderId, setFolderId, token, openFolderModal }) {
  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg shadow flex items-center justify-between px-4 py-3 border-b border-yellow-400">
      <button aria-label="Ouvrir le menu" onClick={onMenuClick} className="p-2 rounded-full bg-yellow-400/80 hover:bg-yellow-400 transition md:hidden">
        <svg width="24" height="24" fill="none" viewBox="0 0 24 24"><path d="M4 6h16M4 12h16M4 18h16" stroke="#1e293b" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      <span className="flex items-center gap-4">
        <img src="/logo.png" alt="RGPD Compliance Maroc Logo" className="w-8 h-8 object-contain" />
        <span className="text-lg font-bold tracking-tight text-blue-900">RGPD Compliance Maroc</span>
        <div className="hidden md:block ml-4">
          <FolderSwitcher folderId={folderId} setFolderId={setFolderId} token={token} renderButton={true} />
        </div>
      </span>
      {user && <span className="text-xs text-blue-900">{user.email}</span>}
    </header>
  );
}

const API_BASE = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev';

// NoFolder onboarding component
function NoFolder({ onCreate }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] animate-fade-in">
      <svg width="100" height="100" fill="none" viewBox="0 0 100 100"><rect width="100" height="100" rx="20" fill="#facc15" fillOpacity="0.08"/><path d="M30 50h40M50 30v40" stroke="#2563eb" strokeWidth="5" strokeLinecap="round"/><circle cx="50" cy="50" r="32" fill="#2563eb" fillOpacity="0.06"/><path d="M35 60c0-8 10-12 15-12s15 4 15 12v2a2 2 0 01-2 2H37a2 2 0 01-2-2v-2z" fill="#facc15" fillOpacity="0.18"/></svg>
      <h2 className="text-2xl font-bold text-blue-900 mt-6 mb-2">Bienvenue !</h2>
      <p className="text-blue-900 text-center max-w-md mb-4">Pour commencer, créez un <span className="font-semibold">dossier de conformité</span>. Chaque dossier vous permet de gérer la conformité d'une entité, d'un projet ou d'une activité distincte selon la Loi 09-08.</p>
      <button onClick={onCreate} className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 rounded-full px-6 py-3 font-bold text-lg shadow mt-2">Créer mon premier dossier</button>
    </div>
  );
}

// FolderSwitcher component
function FolderSwitcher({ folderId, setFolderId, token, exposeOpenModal, renderButton }) {
  const [folders, setFolders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalType, setModalType] = useState('create'); // 'create' or 'rename'
  const [modalValue, setModalValue] = useState('');
  const [renamingId, setRenamingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const dropdownRef = useRef();
  const inputRef = useRef();

  // Fetch folders
  useEffect(() => {
    if (!token) {
      setError('Vous devez être connecté pour gérer les dossiers.');
      setLoading(false);
      return;
    }
    setLoading(true);
    setError('');
    fetch(`${API_BASE}/api/folders`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => {
        if (!r.ok) {
          let err = 'Erreur de connexion au serveur.';
          try { err = (await r.json()).error || err; } catch { try { err = await r.text(); } catch {} }
          throw new Error(err);
        }
        return r.json();
      })
      .then(f => {
        setFolders(f);
        setLoading(false);
        // Auto-select first folder if none selected
        if (f.length > 0 && !folderId) {
          setFolderId(f[0].id);
          localStorage.setItem('cndp_folder', f[0].id);
        }
      })
      .catch((e) => {
        setError(e.message || 'Erreur de connexion au serveur. Vérifiez votre connexion ou réessayez plus tard.');
        setLoading(false);
      });
  }, [token]);

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setDropdownOpen(false);
    }
    if (dropdownOpen) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [dropdownOpen]);

  // Modal helpers
  function openCreateModal() {
    setModalType('create');
    setModalValue('');
    setModalOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }
  function openRenameModal(id, name) {
    setModalType('rename');
    setRenamingId(id);
    setModalValue(name);
    setModalOpen(true);
    setTimeout(() => inputRef.current?.focus(), 100);
  }
  function closeModal() {
    setModalOpen(false);
    setModalValue('');
    setRenamingId(null);
  }
  function openDeleteConfirm(id) {
    setDeletingId(id);
  }
  function closeDeleteConfirm() {
    setDeletingId(null);
  }

  // Create folder
  function handleCreateFolder(e) {
    e.preventDefault();
    if (!modalValue.trim()) return;
    setLoading(true);
    fetch(`${API_BASE}/api/folders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: modalValue })
    })
      .then(async r => {
        if (!r.ok) {
          let err = 'Erreur lors de la création.';
          try { err = (await r.json()).error || err; } catch { try { err = await r.text(); } catch {} }
          throw new Error(err);
        }
        return r.json();
      })
      .then(f => {
        setFolders(prev => [...prev, f]);
        setFolderId(f.id);
        localStorage.setItem('cndp_folder', f.id);
        closeModal();
        setDropdownOpen(false);
        setLoading(false);
        setError('');
      })
      .catch((e) => { setError(e.message || 'Erreur lors de la création.'); setLoading(false); });
  }
  // Rename folder
  function handleRenameFolder(e) {
    e.preventDefault();
    if (!modalValue.trim() || !renamingId) return;
    setLoading(true);
    fetch(`${API_BASE}/api/folders/${renamingId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ name: modalValue })
    })
      .then(async r => {
        if (!r.ok) {
          let err = 'Erreur lors du renommage.';
          try { err = (await r.json()).error || err; } catch { try { err = await r.text(); } catch {} }
          throw new Error(err);
        }
        return r.json();
      })
      .then(f => {
        setFolders(prev => prev.map(folder => folder.id === renamingId ? f : folder));
        if (folderId === renamingId) {
          setFolderId(f.id);
          localStorage.setItem('cndp_folder', f.id);
        }
        closeModal();
        setDropdownOpen(false);
        setLoading(false);
        setError('');
      })
      .catch((e) => { setError(e.message || 'Erreur lors du renommage.'); setLoading(false); });
  }
  // Delete folder
  function handleDeleteFolder() {
    if (!deletingId) return;
    setLoading(true);
    fetch(`${API_BASE}/api/folders/${deletingId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async r => {
        if (!r.ok) {
          let err = 'Erreur lors de la suppression.';
          try { err = (await r.json()).error || err; } catch { try { err = await r.text(); } catch {} }
          throw new Error(err);
        }
        return r;
      })
      .then(() => {
        const updated = folders.filter(f => f.id !== deletingId);
        setFolders(updated);
        if (folderId === deletingId && updated.length > 0) {
          setFolderId(updated[0].id);
          localStorage.setItem('cndp_folder', updated[0].id);
        } else if (updated.length === 0) {
          setFolderId(null);
          localStorage.removeItem('cndp_folder');
        }
        closeDeleteConfirm();
        setDropdownOpen(false);
        setLoading(false);
        setError('');
      })
      .catch((e) => { setError(e.message || 'Erreur lors de la suppression.'); setLoading(false); });
  }

  // Expose modal open function for onboarding
  useEffect(() => {
    if (exposeOpenModal) exposeOpenModal(() => openCreateModal());
    // eslint-disable-next-line
  }, [exposeOpenModal]);

  // UI
  if (!renderButton) {
    // Only render modals if open
    return <>
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
          <form onSubmit={modalType === 'create' ? handleCreateFolder : handleRenameFolder} className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 min-w-[260px]">
            <div className="font-bold text-blue-900 text-lg">{modalType === 'create' ? 'Créer un dossier' : 'Renommer le dossier'}</div>
            <input ref={inputRef} value={modalValue} onChange={e => setModalValue(e.target.value)} className="rounded border px-3 py-2" placeholder="Nom du dossier" required aria-label="Nom du dossier" />
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={closeModal} className="flex-1 bg-gray-200 hover:bg-gray-300 text-blue-900 rounded px-4 py-2 font-semibold">Annuler</button>
              <button type="submit" className="flex-1 bg-yellow-400 hover:bg-yellow-500 text-blue-900 rounded px-4 py-2 font-semibold">{modalType === 'create' ? 'Créer' : 'Renommer'}</button>
            </div>
          </form>
        </div>
      )}
      {deletingId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 animate-fade-in">
          <div className="bg-white rounded-xl shadow-lg p-6 flex flex-col gap-4 min-w-[260px]">
            <div className="font-bold text-blue-900 text-lg">Supprimer ce dossier ?</div>
            <div className="text-blue-900">Cette action est irréversible.</div>
            <div className="flex gap-2 mt-2">
              <button type="button" onClick={closeDeleteConfirm} className="flex-1 bg-gray-200 hover:bg-gray-300 text-blue-900 rounded px-4 py-2 font-semibold">Annuler</button>
              <button type="button" onClick={handleDeleteFolder} className="flex-1 bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2 font-semibold">Supprimer</button>
            </div>
          </div>
        </div>
      )}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.5s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </>;
  }
  if (loading) return <div className="flex items-center gap-2 text-blue-700 text-sm"><svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path></svg> Chargement...</div>;
  if (error) return <div className="text-red-600 font-semibold">{error}</div>;
  if (folders.length === 0) {
    return (
      <button onClick={openCreateModal} className="flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 text-blue-900 rounded-full px-4 py-2 font-semibold shadow animate-fade-in">
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M10 4v12M4 10h12" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
        Créer un dossier
      </button>
    );
  }
  const current = folders.find(f => f.id === folderId) || folders[0];
  return (
    <div className="relative" ref={dropdownRef}>
      <button
        className="flex items-center gap-2 bg-white border border-blue-200 rounded-full px-4 py-2 shadow hover:shadow-lg transition font-semibold text-blue-900 focus:ring-2 focus:ring-yellow-400"
        onClick={() => setDropdownOpen(v => !v)}
        aria-haspopup="listbox"
        aria-expanded={dropdownOpen}
      >
        <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="2" y="4" width="16" height="12" rx="4" fill="#facc15" /><rect x="2" y="4" width="16" height="12" rx="4" stroke="#2563eb" strokeWidth="1.5" /></svg>
        <span className="truncate max-w-[120px]">{current?.name}</span>
        <svg width="16" height="16" fill="none" viewBox="0 0 20 20"><path d="M6 8l4 4 4-4" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
      </button>
      {dropdownOpen && (
        <div className="absolute left-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-blue-100 z-50 animate-fade-in">
          <ul className="max-h-72 overflow-y-auto py-2" role="listbox">
            {folders.map(f => (
              <li key={f.id} className={`flex items-center group px-4 py-2 gap-2 cursor-pointer hover:bg-yellow-50 transition ${folderId === f.id ? 'bg-yellow-100/60 font-bold text-blue-900' : 'text-blue-900'}`}
                onClick={() => { setFolderId(f.id); localStorage.setItem('cndp_folder', f.id); setDropdownOpen(false); }}
                tabIndex={0}
                aria-selected={folderId === f.id}
              >
                <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><rect x="2" y="4" width="16" height="12" rx="4" fill="#facc15" /><rect x="2" y="4" width="16" height="12" rx="4" stroke="#2563eb" strokeWidth="1.5" /></svg>
                <span className="truncate flex-1">{f.name}</span>
                <button
                  className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-blue-100"
                  onClick={e => { e.stopPropagation(); openRenameModal(f.id, f.name); }}
                  aria-label={`Renommer ${f.name}`}
                  tabIndex={0}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 20 20"><path d="M4 13.5V16h2.5l7.1-7.1-2.5-2.5L4 13.5zM14.7 6.3a1 1 0 0 0 0-1.4l-1.6-1.6a1 1 0 0 0-1.4 0l-1.1 1.1 2.5 2.5 1.1-1.1z" fill="#2563eb"/></svg>
                </button>
                <button
                  className="opacity-0 group-hover:opacity-100 transition p-1 rounded hover:bg-red-100"
                  onClick={e => { e.stopPropagation(); openDeleteConfirm(f.id); }}
                  aria-label={`Supprimer ${f.name}`}
                  tabIndex={0}
                >
                  <svg width="16" height="16" fill="none" viewBox="0 0 20 20"><path d="M6 7v7a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7" stroke="#dc2626" strokeWidth="2"/><path d="M4 7h12M9 10v4M11 10v4" stroke="#dc2626" strokeWidth="1.5"/></svg>
                </button>
              </li>
            ))}
          </ul>
          <div className="border-t border-blue-100 px-4 py-2">
            <button onClick={openCreateModal} className="flex items-center gap-2 text-blue-900 hover:text-blue-700 font-semibold py-1 w-full">
              <svg width="18" height="18" fill="none" viewBox="0 0 20 20"><path d="M10 4v12M4 10h12" stroke="#2563eb" strokeWidth="2" strokeLinecap="round"/></svg>
              Nouveau dossier
            </button>
          </div>
        </div>
      )}
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
  const [openFolderModal, setOpenFolderModal] = useState(null);

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
        <div className="flex-1 flex flex-col min-h-screen">
          <Topbar user={user} onMenuClick={() => setMobileOpen(true)} folderId={folderId} setFolderId={setFolderId} token={token} openFolderModal={openFolderModal} />
          {/* FolderSwitcher for modal control only (no button) */}
          <FolderSwitcher folderId={folderId} setFolderId={setFolderId} token={token} exposeOpenModal={setOpenFolderModal} renderButton={false} />
          <main className="flex-1 p-4 md:p-8 min-h-screen bg-white" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="w-full bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 md:p-10">
              {/* Show onboarding if no folder selected */}
              {!folderId ? (
                <NoFolder onCreate={() => openFolderModal && openFolderModal()} />
              ) : (
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
              )}
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