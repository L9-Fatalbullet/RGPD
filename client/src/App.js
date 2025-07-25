import React, { createContext, useContext, useState, useEffect, useRef, Suspense, lazy } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { HomeIcon, ChartBarIcon, ClipboardDocumentListIcon, BookOpenIcon, DocumentTextIcon, SparklesIcon, ArrowLeftOnRectangleIcon, DocumentCheckIcon, ArrowPathIcon, ShieldCheckIcon, ChevronDownIcon } from '@heroicons/react/24/outline';
import { Menu } from '@headlessui/react';
import ISO27001 from './pages/ISO27001';

// Replace direct imports with lazy imports for main pages
const Dashboard = lazy(() => import('./pages/Dashboard'));
const Assessment = lazy(() => import('./pages/Assessment'));
const Guide = lazy(() => import('./pages/Guide'));
const Documents = lazy(() => import('./pages/Documents'));
const BestPractices = lazy(() => import('./pages/BestPractices'));
const Login = lazy(() => import('./pages/Login'));
const Register = lazy(() => import('./pages/Register'));
const Progress = lazy(() => import('./pages/Progress'));
const DPIA = lazy(() => import('./pages/DPIA'));
const Admin = lazy(() => import('./pages/Admin'));
const Profile = lazy(() => import('./pages/Profile'));

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

// Sidebar nav for both expanded and collapsed states
const nav = [
  { to: '/dashboard', label: 'Accueil', icon: <HomeIcon className="w-6 h-6" /> },
  { to: '/progress', label: 'Progression', icon: <ArrowPathIcon className="w-6 h-6" /> },
  { to: '/assessment', label: 'Auto-évaluation', icon: <ChartBarIcon className="w-6 h-6" /> },
  { to: '/register', label: 'Registre', icon: <DocumentCheckIcon className="w-6 h-6" /> },
  { to: '/dpia', label: 'DPIA', icon: <ShieldCheckIcon className="w-6 h-6" /> },
  { to: '/guide', label: 'Guide', icon: <BookOpenIcon className="w-6 h-6" /> },
  { to: '/documents', label: 'Documents', icon: <ClipboardDocumentListIcon className="w-6 h-6" /> },
  { to: '/best-practices', label: 'Bonnes pratiques', icon: <SparklesIcon className="w-6 h-6" /> },
  { to: '/iso27001', label: 'ISO 27001', icon: <DocumentTextIcon className="w-6 h-6" /> },
];

function Sidebar({ token, logout, user, collapsed, setCollapsed, activePath, setEditProfileOpen }) {
  const [hovered, setHovered] = React.useState(false);
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
    </aside>
  );
}

function Topbar({ user, logout }) {
  return (
    <header className="z-[100] bg-white/80 backdrop-blur-lg shadow flex items-center justify-between px-4 py-3 border-b border-yellow-400 sticky top-0">
      <span className="flex items-center gap-4">
        <img src="/logo.png" alt="RGPD Compliance Maroc Logo" className="w-8 h-8 object-contain" />
        <span className="text-lg font-bold tracking-tight text-blue-900">RGPD Compliance Maroc</span>
      </span>
      <div className="flex items-center gap-4">
        {user && (
          <Menu as="div" className="relative inline-block text-left">
            <Menu.Button className="flex items-center gap-2 focus:outline-none">
              <img src={user.avatar || '/default-avatar.png'} alt="Avatar" className="w-10 h-10 rounded-full border-2 border-yellow-400 shadow object-cover bg-white" />
              <ChevronDownIcon className="w-5 h-5 text-blue-900" />
            </Menu.Button>
            <Menu.Items className="absolute right-0 mt-2 w-56 origin-top-right bg-white divide-y divide-gray-100 rounded-md shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-[200]">
              <div className="px-4 py-3">
                <div className="font-semibold text-blue-900">{user.email}</div>
                <div className="text-xs text-blue-700">{user.role === 'admin' ? 'Administrateur' : user.role === 'dpo' ? 'DPO' : user.role === 'representant' ? 'Représentant légal' : user.role}</div>
              </div>
              <Menu.Item>
                {({ active }) => (
                  <Link to="/profile" className={`block px-4 py-2 text-sm ${active ? 'bg-blue-50 text-blue-900' : 'text-blue-900'}`}>Mon profil</Link>
                )}
              </Menu.Item>
              <Menu.Item>
                {({ active }) => (
                  <button onClick={logout} className={`block w-full text-left px-4 py-2 text-sm ${active ? 'bg-yellow-100 text-blue-900' : 'text-blue-900'}`}>Déconnexion</button>
                )}
              </Menu.Item>
            </Menu.Items>
          </Menu>
        )}
      </div>
    </header>
  );
}

const API_BASE = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev';

function App() {
  const { token, user, logout } = useAuth();
  const [sidebarHovered, setSidebarHovered] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [editProfileOpen, setEditProfileOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || '');
  const [editAvatar, setEditAvatar] = useState(null);
  const location = window.location.pathname;
  const sidebarRef = useRef();

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
      <div className="font-sans min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex relative">
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
        <aside
          className={`fixed left-0 top-0 h-screen z-40 sidebar-scroll transition-all duration-300 ${sidebarHovered ? 'w-64' : 'w-16'} bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400`}
          onMouseEnter={() => setSidebarHovered(true)}
          onMouseLeave={() => setSidebarHovered(false)}
        >
          {/* Only show collapsed content when not hovered */}
          {!sidebarHovered && (
            <div className="h-full flex flex-col items-center justify-between py-4">
              {/* Logo */}
              <div className="flex flex-col items-center justify-center w-full mb-2">
                <img src="/logo.png" alt="RGPD Compliance Maroc Logo" className="w-10 h-10 object-contain rounded-full shadow-lg" />
              </div>
              {/* Icons */}
              <nav className="flex flex-col gap-4 flex-1 justify-center items-center">
                {nav.map(item => (
                  <Link key={item.to} to={item.to} aria-label={item.label} tabIndex={0}
                    className={`flex items-center justify-center w-10 h-10 rounded-full transition-all duration-200 outline-none focus:ring-2 focus:ring-yellow-400 text-white hover:bg-yellow-400/30 ${location === item.to ? 'bg-yellow-400/80 text-white shadow-lg' : ''}`}
                  >
                    {item.icon}
                  </Link>
                ))}
              </nav>
            </div>
          )}
          {/* Only show expanded content when hovered */}
          {sidebarHovered && (
            <div
              className="absolute inset-0 transition-opacity duration-200 opacity-100 pointer-events-auto"
              style={{ width: '16rem' }}
            >
              <Sidebar
                token={token}
                logout={logout}
                user={user}
                collapsed={!sidebarHovered}
                setCollapsed={() => {}}
                activePath={location}
                setEditProfileOpen={setEditProfileOpen}
              />
            </div>
          )}
        </aside>
        {/* Mobile Sidebar Drawer */}
        {mobileOpen && (
          <div className="fixed inset-0 z-50 bg-black/40" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu mobile">
            <aside ref={sidebarRef} className="absolute left-0 top-0 h-full w-64 bg-white/90 backdrop-blur-lg shadow-xl border-r-4 border-yellow-400 rounded-tr-3xl rounded-br-3xl animate-fade-in">
              <Sidebar token={token} logout={logout} user={user} collapsed={false} setCollapsed={() => {}} activePath={location} setEditProfileOpen={setEditProfileOpen} />
            </aside>
          </div>
        )}
        <div className={`flex-1 flex flex-col min-h-screen transition-all duration-300 ${sidebarHovered ? 'ml-64' : 'ml-16'}`}>
          <div>
            <Topbar user={user} logout={logout} />
          </div>
          <main className="flex-1 p-4 md:p-8 min-h-screen bg-white" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="w-full bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 md:p-10">
              <Suspense fallback={<div className="text-center py-12 text-lg text-blue-900">Chargement...</div>}>
                <Routes>
                  <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                  <Route path="/progress" element={<ProtectedRoute><Progress /></ProtectedRoute>} />
                  <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
                  <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
                  <Route path="/dpia" element={<ProtectedRoute><DPIA /></ProtectedRoute>} />
                  <Route path="/guide" element={<Guide />} />
                  <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
                  <Route path="/best-practices" element={<BestPractices />} />
                  <Route path="/iso27001" element={<ProtectedRoute><ISO27001 /></ProtectedRoute>} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<ProtectedRoute><Admin /></ProtectedRoute>} />
                  <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                  <Route path="/" element={<Navigate to="/dashboard" />} />
                </Routes>
              </Suspense>
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
        .sidebar-scroll {
          overflow-y: hidden;
        }
        .sidebar-scroll:hover, .sidebar-scroll:focus-within {
          overflow-y: auto;
        }
        .sidebar-scroll::-webkit-scrollbar {
          width: 8px;
          background: transparent;
        }
        .sidebar-scroll:hover::-webkit-scrollbar, .sidebar-scroll:focus-within::-webkit-scrollbar {
          background: #e5e7eb;
        }
        .sidebar-scroll::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 6px;
        }
      `}</style>
    </Router>
  );
}

// Add a global error boundary
class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  componentDidCatch(error, errorInfo) {
    // You can log errorInfo to an error reporting service here
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-red-50">
          <h1 className="text-2xl font-bold text-red-700 mb-4">Une erreur est survenue</h1>
          <pre className="bg-white text-red-800 p-4 rounded shadow max-w-xl overflow-x-auto mb-4">{this.state.error?.toString()}</pre>
          <button onClick={() => window.location.reload()} className="bg-yellow-400 hover:bg-yellow-500 text-blue-900 rounded-full px-6 py-3 font-bold text-lg shadow">Recharger l'application</button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Wrap AppWithAuth export with ErrorBoundary
export default function AppWithAuth() {
  return <ErrorBoundary><AuthProvider><App /></AuthProvider></ErrorBoundary>;
} 