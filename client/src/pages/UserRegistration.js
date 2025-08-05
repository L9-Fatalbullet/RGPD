import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UserIcon, EnvelopeIcon, LockClosedIcon, KeyIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../contexts/AuthContext';

const API_BASE = process.env.REACT_APP_API_BASE || 'http://localhost:3001';

export default function UserRegistration() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [form, setForm] = useState({
    email: '',
    invitationCode: '',
    name: '',
    password: '',
    confirmPassword: ''
  });
  
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [invitationValid, setInvitationValid] = useState(null);
  const [error, setError] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    
    if (!form.email) newErrors.email = 'Email requis';
    if (!form.invitationCode) newErrors.invitationCode = 'Code d\'invitation requis';
    if (!form.password) newErrors.password = 'Mot de passe requis';
    if (form.password.length < 6) newErrors.password = 'Mot de passe doit contenir au moins 6 caractères';
    if (form.password !== form.confirmPassword) newErrors.confirmPassword = 'Les mots de passe ne correspondent pas';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateInvitation = async () => {
    if (!form.email || !form.invitationCode) {
      setError('Veuillez remplir l\'email et le code d\'invitation');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      console.log('Sending validation request:', { email: form.email, invitationCode: form.invitationCode });
      
      const response = await fetch(`${API_BASE}/api/invitations/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          invitationCode: form.invitationCode
        })
      });

      const data = await response.json();
      console.log('Validation response:', data);
      
      if (response.ok) {
        setInvitationValid(data);
        setError(null);
      } else {
        setInvitationValid(null);
        setError(data.error || 'Code d\'invitation invalide');
      }
    } catch (err) {
      console.error('Validation error:', err);
      setInvitationValid(null);
      setError('Erreur lors de la validation du code d\'invitation');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    
    if (!validateForm()) return;
    
    if (!invitationValid) {
      setError('Veuillez d\'abord valider votre code d\'invitation');
      return;
    }
    
    setLoading(true);
    try {
      const response = await fetch(`${API_BASE}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
          invitationCode: form.invitationCode,
          name: form.name
        })
      });

      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'inscription');
      }

      setSuccess(true);
      
      // Auto-login the user
      if (data.token) {
        login(data.token);
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      }
      
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
    
    // Clear invitation validation when fields change
    if (name === 'email' || name === 'invitationCode') {
      setInvitationValid(null);
      setError(null);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Compte créé avec succès !</h2>
          <p className="text-gray-600 mb-4">
            Votre compte a été créé et vous êtes maintenant connecté.
          </p>
          <div className="animate-pulse">
            <p className="text-sm text-gray-500">Redirection vers le tableau de bord...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <UserIcon className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Créer votre compte</h1>
          <p className="text-gray-600">
            Utilisez votre code d'invitation pour rejoindre votre organisation
          </p>
        </div>

        {invitationValid && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <p className="text-green-600 font-medium">✓ Code d'invitation valide</p>
            <p className="text-green-600 text-sm">Rôle: {invitationValid.role}</p>
            <p className="text-green-600 text-sm">Expire le: {new Date(invitationValid.expiresAt).toLocaleDateString('fr-FR')}</p>
          </div>
        )}

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <p className="text-red-600">{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email *
            </label>
            <div className="relative">
              <EnvelopeIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.email ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="votre@email.com"
              />
            </div>
            {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
          </div>

          {/* Invitation Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Code d'invitation *
            </label>
            <div className="relative">
              <KeyIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="invitationCode"
                value={form.invitationCode}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.invitationCode ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Entrez votre code d'invitation"
              />
            </div>
            {errors.invitationCode && <p className="text-red-500 text-sm mt-1">{errors.invitationCode}</p>}
          </div>

          {/* Validate Button */}
          <button
            type="button"
            onClick={validateInvitation}
            disabled={loading || !form.email || !form.invitationCode}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? 'Validation...' : 'Valider le code d\'invitation'}
          </button>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Nom complet
            </label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Votre nom complet"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Mot de passe *
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.password ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Mot de passe sécurisé"
              />
            </div>
            {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
            <p className="text-gray-500 text-sm mt-1">Minimum 6 caractères</p>
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Confirmer le mot de passe *
            </label>
            <div className="relative">
              <LockClosedIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="password"
                name="confirmPassword"
                value={form.confirmPassword}
                onChange={handleChange}
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  errors.confirmPassword ? 'border-red-300' : 'border-gray-300'
                }`}
                placeholder="Confirmez votre mot de passe"
              />
            </div>
            {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || !invitationValid}
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed font-medium"
          >
            {loading ? 'Création du compte...' : 'Créer le compte'}
          </button>
        </form>

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Déjà un compte ?{' '}
            <a href="/login" className="text-blue-600 hover:text-blue-800 font-medium">
              Se connecter
            </a>
          </p>
        </div>
      </div>
    </div>
  );
} 