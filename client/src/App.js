import React, { createContext, useContext, useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Guide from './pages/Guide';
import Documents from './pages/Documents';
import BestPractices from './pages/BestPractices';
import Login from './pages/Login';

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
        setUser({ email: payload.email, id: payload.id });
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

function App() {
  const { token, user, logout } = useAuth();
  return (
    <Router>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-700 shadow text-white">
        <nav className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight">🛡️ Conformité CNDP</span>
            <span className="hidden md:inline text-sm font-light ml-2">Loi 09-08</span>
          </div>
          <div className="mt-2 md:mt-0 flex gap-4 text-base font-medium items-center">
            <Link to="/dashboard" className="hover:underline">Tableau de bord</Link>
            <Link to="/assessment" className="hover:underline">Auto-évaluation</Link>
            <Link to="/guide" className="hover:underline">Guide</Link>
            <Link to="/documents" className="hover:underline">Documents</Link>
            <Link to="/best-practices" className="hover:underline">Bonnes pratiques</Link>
            {token ? (
              <button onClick={logout} className="ml-4 bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded text-xs">Se déconnecter</button>
            ) : (
              <Link to="/login" className="ml-4 bg-blue-800 hover:bg-blue-900 px-3 py-1 rounded text-xs">Connexion</Link>
            )}
          </div>
        </nav>
      </header>
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-4">
          <Routes>
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/assessment" element={<ProtectedRoute><Assessment /></ProtectedRoute>} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/documents" element={<ProtectedRoute><Documents /></ProtectedRoute>} />
            <Route path="/best-practices" element={<BestPractices />} />
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<Navigate to="/dashboard" />} />
          </Routes>
        </div>
      </main>
      <footer className="bg-blue-900 text-white text-center py-3 text-xs opacity-80">
        © {new Date().getFullYear()} Conformité CNDP – Loi 09-08. Application de conformité marocaine.
      </footer>
    </Router>
  );
}

export default function AppWithAuth() {
  return <AuthProvider><App /></AuthProvider>;
} 