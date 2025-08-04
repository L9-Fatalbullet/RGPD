import React, { useState, useEffect } from 'react';
import { BuildingOfficeIcon, PencilIcon, CheckIcon, XMarkIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../App';

const API_BASE = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev';

export default function OrganizationManagement() {
  const { token, user } = useAuth();
  const [organization, setOrganization] = useState(null);
  const [stats, setStats] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Form state for editing
  const [form, setForm] = useState({
    name: '',
    description: '',
    address: '',
    phone: '',
    email: '',
    website: '',
    sector: '',
    size: '',
    logo: ''
  });

  useEffect(() => {
    fetchOrganization();
    if (user?.role === 'admin') {
      fetchStats();
    }
  }, [token, user]);

  const fetchOrganization = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/organization`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération');
      
      const data = await response.json();
      setOrganization(data);
      setForm({
        name: data.name || '',
        description: data.description || '',
        address: data.address || '',
        phone: data.phone || '',
        email: data.email || '',
        website: data.website || '',
        sector: data.sector || '',
        size: data.size || '',
        logo: data.logo || ''
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`${API_BASE}/api/organization/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      
      if (!response.ok) throw new Error('Erreur lors de la récupération des statistiques');
      
      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    setError(null);
    
    try {
      const response = await fetch(`${API_BASE}/api/organization`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(form)
      });
      
      if (!response.ok) throw new Error('Erreur lors de la sauvegarde');
      
      const updatedOrg = await response.json();
      setOrganization(updatedOrg);
      setIsEditing(false);
      setSuccess('Organisation mise à jour avec succès !');
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setForm({
      name: organization?.name || '',
      description: organization?.description || '',
      address: organization?.address || '',
      phone: organization?.phone || '',
      email: organization?.email || '',
      website: organization?.website || '',
      sector: organization?.sector || '',
      size: organization?.size || '',
      logo: organization?.logo || ''
    });
    setIsEditing(false);
    setError(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          Organisation non trouvée
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-bold text-blue-900 flex items-center gap-2">
          <BuildingOfficeIcon className="w-8 h-8 text-blue-700" />
          Gestion de l'Organisation
        </h1>
        
        {user?.role === 'admin' && !isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2"
          >
            <PencilIcon className="w-5 h-5" />
            Modifier
          </button>
        )}
      </div>

      {/* Success/Error Messages */}
      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded-lg">
          {success}
        </div>
      )}
      
      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {/* Organization Statistics (Admin only) */}
      {user?.role === 'admin' && stats && (
        <div className="mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
          <h2 className="text-xl font-semibold text-blue-900 mb-4 flex items-center gap-2">
            <ChartBarIcon className="w-6 h-6" />
            Statistiques de l'Organisation
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
              <div className="text-sm text-gray-600">Utilisateurs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.dpias}</div>
              <div className="text-sm text-gray-600">DPIAs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{stats.assessments}</div>
              <div className="text-sm text-gray-600">Évaluations</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.isoAssessments}</div>
              <div className="text-sm text-gray-600">ISO 27001</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{stats.registers}</div>
              <div className="text-sm text-gray-600">Registres</div>
            </div>
          </div>
        </div>
      )}

      {/* Organization Details */}
      <div className="bg-white rounded-xl shadow-lg p-6">
        <h2 className="text-xl font-semibold text-blue-900 mb-4">Informations de l'Organisation</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nom de l'organisation</label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900 font-medium">{organization.name}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              {isEditing ? (
                <textarea
                  value={form.description}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900">{organization.description}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Secteur d'activité</label>
              {isEditing ? (
                <input
                  type="text"
                  value={form.sector}
                  onChange={(e) => setForm({ ...form, sector: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900">{organization.sector}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Taille</label>
              {isEditing ? (
                <select
                  value={form.size}
                  onChange={(e) => setForm({ ...form, size: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Sélectionner...</option>
                  <option value="TPE">TPE (1-10 employés)</option>
                  <option value="PME">PME (11-250 employés)</option>
                  <option value="ETI">ETI (251-5000 employés)</option>
                  <option value="GE">GE (5000+ employés)</option>
                </select>
              ) : (
                <div className="text-gray-900">{organization.size}</div>
              )}
            </div>
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              {isEditing ? (
                <textarea
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900">{organization.address}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
              {isEditing ? (
                <input
                  type="tel"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900">{organization.phone}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              {isEditing ? (
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900">{organization.email}</div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Site web</label>
              {isEditing ? (
                <input
                  type="url"
                  value={form.website}
                  onChange={(e) => setForm({ ...form, website: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              ) : (
                <div className="text-gray-900">
                  {organization.website && (
                    <a href={organization.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                      {organization.website}
                    </a>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex gap-4 mt-6 pt-6 border-t border-gray-200">
            <button
              onClick={handleSave}
              disabled={saving}
              className="bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Sauvegarde...
                </>
              ) : (
                <>
                  <CheckIcon className="w-5 h-5" />
                  Sauvegarder
                </>
              )}
            </button>
            
            <button
              onClick={handleCancel}
              className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-2 rounded-lg flex items-center gap-2"
            >
              <XMarkIcon className="w-5 h-5" />
              Annuler
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 