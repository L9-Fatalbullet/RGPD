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

function Sidebar({ token, logout, user, collapsed, setCollapsed, activePath }) {
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
  return (
    <aside aria-label="Navigation principale" className={`relative overflow-hidden backdrop-blur-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 shadow-xl border-r-4 border-yellow-400 ${collapsed ? 'w-20' : 'w-64'} min-h-screen flex flex-col fixed z-40 left-0 top-0 transition-all duration-300 rounded-tr-3xl rounded-br-3xl`}>
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
      <div className={`relative flex flex-col items-center ${collapsed ? 'py-4' : 'gap-3 px-6 py-6'} border-b border-blue-100`} style={{zIndex:1}}>
        <img src="/logo.png" alt="RGPD Compliance Maroc Logo" className={`transition-transform duration-300 ${collapsed ? 'w-10 h-10' : 'w-16 h-16'} object-contain rounded-full shadow-lg hover:scale-110`} />
        {!collapsed && <span className="text-lg font-bold text-white text-center leading-tight mt-2">RGPD Compliance<br />Maroc</span>}
        <button aria-label={collapsed ? 'Développer le menu' : 'Réduire le menu'} onClick={() => setCollapsed(!collapsed)} className="mt-2 p-1 rounded-full bg-yellow-400/80 hover:bg-yellow-400 transition" tabIndex={0}>
          <svg width="20" height="20" fill="none" viewBox="0 0 20 20"><path d="M7 5l5 5-5 5" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </button>
      </div>
      <nav className="relative flex-1 px-2 py-6 flex flex-col gap-2" role="navigation" style={{zIndex:1}}>
        {nav.map(item => (
          <Link key={item.to} to={item.to} aria-label={item.label} tabIndex={0}
            className={`group flex items-center gap-3 px-3 py-2 my-1 rounded-full font-medium transition-all duration-200 outline-none focus:ring-2 focus:ring-yellow-400
              ${activePath === item.to ? 'bg-yellow-400/80 text-blue-900 shadow-lg border-l-4 border-yellow-500' : 'hover:bg-yellow-100/80 hover:text-yellow-300 text-white'}`}
          >
            <span className="transition-transform group-hover:scale-110 text-white">{item.icon}</span>
            {!collapsed && item.label}
          </Link>
        ))}
        {user && user.role === 'admin' && !collapsed && (
          <li>
            <Link to="/admin" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-yellow-100/80 transition text-base font-medium text-white">
              <span className="icon">🛡️</span> Admin
            </Link>
          </li>
        )}
      </nav>
      <div className={`relative px-4 pb-6 mt-auto flex ${collapsed ? 'justify-center' : 'items-center'} gap-3`} style={{zIndex:1}}>
        <img src={user?.avatar || '/default-avatar.png'} alt="Avatar" className="w-12 h-12 rounded-full border-2 border-yellow-400 shadow object-cover bg-white flex-shrink-0" />
        {!collapsed && user && (
          <div className="flex flex-col min-w-0 flex-1">
            <span className="font-bold text-white truncate max-w-[10rem]">{user.name || user.email}</span>
            <span className="text-xs text-yellow-100 truncate max-w-[10rem]">{user.email}</span>
            <span className="text-xs text-blue-100 mt-1">{user.role === 'admin' ? 'Administrateur' : 'Utilisateur'}</span>
          </div>
        )}
        {token && !collapsed && (
          <button onClick={logout} className="ml-2 flex items-center gap-2 bg-yellow-400 hover:bg-yellow-500 px-3 py-1 rounded text-xs font-semibold text-blue-900 transition shadow whitespace-nowrap" tabIndex={0}>
            <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Déconnexion
          </button>
        )}
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

function App() {
  const { token, user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = window.location.pathname;
  const sidebarRef = useRef();

  // Close mobile sidebar on route change
  useEffect(() => { setMobileOpen(false); }, [location]);

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
        <Sidebar token={token} logout={logout} user={user} collapsed={collapsed} setCollapsed={setCollapsed} activePath={location} />
        {/* Mobile Sidebar Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu mobile">
            <aside ref={sidebarRef} className="absolute left-0 top-0 h-full w-64 bg-white/90 backdrop-blur-lg shadow-xl border-r-4 border-yellow-400 rounded-tr-3xl rounded-br-3xl animate-fade-in">
              <Sidebar token={token} logout={logout} user={user} collapsed={false} setCollapsed={() => {}} activePath={location} />
            </aside>
          </div>
        )}
        <div className={`flex-1 ${collapsed ? 'md:ml-20' : 'md:ml-64'} flex flex-col min-h-screen transition-all`}>
          <Topbar user={user} onMenuClick={() => setMobileOpen(true)} />
          <main className="flex-1 p-4 md:p-8" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="w-full bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 md:p-10">
              <Routes>
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
                <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
                <Route path="/dpia" element={<ProtectedRoute><DPIA /></ProtectedRoute>} />
                <Route path="/guide" element={<Guide />} />
                <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                <Route path="/best-practices" element={<BestPractices />} />
                <Route path="/login" element={<Login />} />
                <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                <Route path="/" element={<Navigate to="/dashboard" />} />
              </Routes>
            </div>
          </main>
          <footer className="text-center text-xs text-blue-900 py-4 opacity-80">
            © {new Date().getFullYear()} Conformité CNDP – Loi 09-08. Application de conformité marocaine.
          </footer>
        </div>
      </div>
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