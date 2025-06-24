import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Guide from './pages/Guide';
import Documents from './pages/Documents';
import BestPractices from './pages/BestPractices';

function App() {
  return (
    <Router>
      <header className="sticky top-0 z-50 bg-gradient-to-r from-blue-900 to-blue-700 shadow text-white">
        <nav className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center p-4">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-extrabold tracking-tight">🛡️ Conformité CNDP</span>
            <span className="hidden md:inline text-sm font-light ml-2">Loi 09-08</span>
          </div>
          <div className="mt-2 md:mt-0 flex gap-4 text-base font-medium">
            <Link to="/dashboard" className="hover:underline">Tableau de bord</Link>
            <Link to="/assessment" className="hover:underline">Auto-évaluation</Link>
            <Link to="/guide" className="hover:underline">Guide</Link>
            <Link to="/documents" className="hover:underline">Documents</Link>
            <Link to="/best-practices" className="hover:underline">Bonnes pratiques</Link>
          </div>
        </nav>
      </header>
      <main className="min-h-screen bg-gray-50">
        <div className="max-w-5xl mx-auto p-4">
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/assessment" element={<Assessment />} />
            <Route path="/guide" element={<Guide />} />
            <Route path="/documents" element={<Documents />} />
            <Route path="/best-practices" element={<BestPractices />} />
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

export default App; 