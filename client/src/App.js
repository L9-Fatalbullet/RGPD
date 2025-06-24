import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Assessment from './pages/Assessment';
import Guide from './pages/Guide';
import Documents from './pages/Documents';
import BestPractices from './pages/BestPractices';
import Login from './pages/Login';

function App() {
  return (
    <Router>
      <nav className="bg-blue-900 text-white p-4 flex flex-col md:flex-row justify-between items-center">
        <div className="text-2xl font-bold">Conformité CNDP – Loi 09-08</div>
        <div className="mt-2 md:mt-0 flex gap-4 text-sm">
          <Link to="/dashboard" className="hover:underline">Tableau de bord</Link>
          <Link to="/assessment" className="hover:underline">Auto-évaluation</Link>
          <Link to="/guide" className="hover:underline">Guide Loi 09-08</Link>
          <Link to="/documents" className="hover:underline">Documents</Link>
          <Link to="/best-practices" className="hover:underline">Bonnes pratiques</Link>
          <Link to="/login" className="hover:underline">Connexion</Link>
        </div>
      </nav>
      <main className="p-4 max-w-4xl mx-auto">
        <Routes>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/assessment" element={<Assessment />} />
          <Route path="/guide" element={<Guide />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/best-practices" element={<BestPractices />} />
          <Route path="/login" element={<Login />} />
          <Route path="/" element={<Navigate to="/dashboard" />} />
        </Routes>
      </main>
    </Router>
  );
}

export default App; 