import React, { createContext, useContext, useState, useEffect } from 'react';
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

function Sidebar({ token, logout, user }) {
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
    <aside className="bg-gradient-to-b from-blue-900 to-blue-700 text-white w-64 min-h-screen flex flex-col shadow-xl fixed z-40 left-0 top-0 hidden md:flex">
      <div className="flex items-center gap-2 px-6 py-6 border-b border-blue-800">
        <span className="text-3xl font-extrabold tracking-tight">🛡️</span>
        <span className="text-xl font-bold tracking-tight">CNDP Maroc</span>
      </div>
      <nav className="flex-1 px-4 py-6 flex flex-col gap-2">
        {nav.map(item => (
          <Link key={item.to} to={item.to} className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition text-base font-medium">
            {item.icon} {item.label}
          </Link>
        ))}
        {user && user.role === 'admin' && (
          <li>
            <Link to="/admin" className="flex items-center gap-3 px-4 py-2 rounded-lg hover:bg-blue-800 transition text-base font-medium">
              <span className="icon">🛡️</span> Admin
            </Link>
          </li>
        )}
      </nav>
      <div className="px-6 pb-6 mt-auto">
        {token ? (
          <button onClick={logout} className="flex items-center gap-2 w-full bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded text-xs font-semibold">
            <ArrowLeftOnRectangleIcon className="w-5 h-5" /> Se déconnecter
          </button>
        ) : (
          <Link to="/login" className="flex items-center gap-2 w-full bg-blue-800 hover:bg-blue-900 px-4 py-2 rounded text-xs font-semibold">Connexion</Link>
        )}
      </div>
    </aside>
  );
}

function Topbar({ user }) {
  return (
    <header className="md:hidden sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-700 shadow text-white flex items-center justify-between px-4 py-3">
      <span className="text-xl font-bold tracking-tight">🛡️ CNDP Maroc</span>
      {user && <span className="text-xs">{user.email}</span>}
    </header>
  );
}

function App() {
  const { token, user, logout } = useAuth();
  return (
    <Router>
      <div className="font-sans min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 flex">
        <Sidebar token={token} logout={logout} user={user} />
        <div className="flex-1 md:ml-64 flex flex-col min-h-screen">
          <Topbar user={user} />
          <main className="flex-1 p-4 md:p-8" style={{ minHeight: 'calc(100vh - 56px)' }}>
            <div className="max-w-5xl mx-auto bg-white/80 backdrop-blur rounded-2xl shadow-lg p-6 md:p-10">
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
      `}</style>
    </Router>
  );
}

export default function AppWithAuth() {
  return <AuthProvider><App /></AuthProvider>;
} 