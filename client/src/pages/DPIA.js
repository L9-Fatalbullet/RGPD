import React, { useEffect, useState, useRef } from 'react';
import { PlusIcon, PencilIcon, TrashIcon, SparklesIcon, ShieldCheckIcon, ArrowRightCircleIcon, ArrowLeftCircleIcon, CheckCircleIcon, InformationCircleIcon, DocumentArrowDownIcon, ExclamationTriangleIcon, EyeIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../App';
import jsPDF from 'jspdf';

const API_BASE = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev';

const COMMON_RISKS = [
  {
    label: "Accès non autorisé aux données",
    mesures: "Limiter les accès, authentification forte, journalisation des accès.",
    category: "Sécurité"
  },
  {
    label: "Perte de données",
    mesures: "Sauvegardes régulières, plan de reprise, stockage sécurisé.",
    category: "Disponibilité"
  },
  {
    label: "Divulgation accidentelle",
    mesures: "Sensibilisation du personnel, procédures de gestion des incidents.",
    category: "Confidentialité"
  },
  {
    label: "Altération des données",
    mesures: "Contrôles d'intégrité, restrictions d'écriture, suivi des modifications.",
    category: "Intégrité"
  },
  {
    label: "Non-respect des droits des personnes",
    mesures: "Procédure d'exercice des droits, information claire, suivi des demandes.",
    category: "Conformité"
  },
  {
    label: "Violation de données personnelles",
    mesures: "Détection d'intrusion, monitoring, plan de réponse aux incidents.",
    category: "Sécurité"
  },
  {
    label: "Traitement non autorisé",
    mesures: "Contrôles d'accès, audit trail, autorisations explicites.",
    category: "Conformité"
  },
  {
    label: "Transfert international non sécurisé",
    mesures: "Encryption, clauses contractuelles, évaluation des pays tiers.",
    category: "Conformité"
  }
];

// Risk Matrix Component
const RiskMatrix = ({ risks, onRiskUpdate }) => {
  const matrix = [
    ['', 'Faible', 'Moyenne', 'Élevée'],
    ['Faible', '1', '2', '3'],
    ['Moyenne', '2', '4', '6'],
    ['Élevée', '3', '6', '9']
  ];

  const getRiskLevel = (score) => {
    if (score >= 7) return { level: 'Élevé', color: 'bg-red-500', textColor: 'text-white' };
    if (score >= 4) return { level: 'Moyen', color: 'bg-yellow-500', textColor: 'text-black' };
    if (score > 0) return { level: 'Faible', color: 'bg-green-500', textColor: 'text-white' };
    return { level: 'Non évalué', color: 'bg-gray-300', textColor: 'text-gray-700' };
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <h4 className="text-lg font-semibold text-blue-900 mb-4">Matrice des Risques</h4>
      
      {/* Risk Matrix Grid */}
      <div className="grid grid-cols-4 gap-1 mb-6">
        {matrix.map((row, rowIndex) => (
          row.map((cell, colIndex) => (
            <div
              key={`${rowIndex}-${colIndex}`}
              className={`
                p-2 text-center text-sm font-medium border
                ${rowIndex === 0 || colIndex === 0 
                  ? 'bg-blue-100 text-blue-900 border-blue-300' 
                  : 'bg-gray-50 text-gray-700 border-gray-300'
                }
                ${rowIndex === 0 && colIndex === 0 ? 'rounded-tl-lg' : ''}
                ${rowIndex === 0 && colIndex === 3 ? 'rounded-tr-lg' : ''}
                ${rowIndex === 3 && colIndex === 0 ? 'rounded-bl-lg' : ''}
                ${rowIndex === 3 && colIndex === 3 ? 'rounded-br-lg' : ''}
              `}
            >
              {cell}
            </div>
          ))
        ))}
      </div>

      {/* Risk Assessment Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm bg-white rounded-lg shadow border">
          <thead>
            <tr className="bg-blue-50 text-blue-900">
              <th className="px-4 py-2 text-left font-semibold">Risque</th>
              <th className="px-4 py-2 text-center font-semibold">Catégorie</th>
              <th className="px-4 py-2 text-center font-semibold">Gravité</th>
              <th className="px-4 py-2 text-center font-semibold">Probabilité</th>
              <th className="px-4 py-2 text-center font-semibold">Score</th>
              <th className="px-4 py-2 text-center font-semibold">Niveau</th>
              <th className="px-4 py-2 text-center font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {risks.map((risk, idx) => {
              const details = risk.details || {};
              const gravite = details.gravite || '';
              const probabilite = details.probabilite || '';
              const score = (g => (g === 'faible' ? 1 : g === 'moyenne' ? 2 : g === 'élevée' ? 3 : 0))(gravite) * 
                           (p => (p === 'faible' ? 1 : p === 'moyenne' ? 2 : p === 'élevée' ? 3 : 0))(probabilite);
              const riskLevel = getRiskLevel(score);
              
              return (
                <tr key={idx} className="border-b hover:bg-blue-50/40 transition">
                  <td className="px-4 py-3 font-medium text-blue-900">
                    {risk.label}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs">
                      {risk.category || 'Général'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select 
                      className="rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400"
                      value={gravite}
                      onChange={(e) => onRiskUpdate(idx, 'gravite', e.target.value)}
                    >
                      <option value="">Sélectionner</option>
                      <option value="faible">Faible</option>
                      <option value="moyenne">Moyenne</option>
                      <option value="élevée">Élevée</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <select 
                      className="rounded border px-2 py-1 text-sm focus:ring-2 focus:ring-blue-400"
                      value={probabilite}
                      onChange={(e) => onRiskUpdate(idx, 'probabilite', e.target.value)}
                    >
                      <option value="">Sélectionner</option>
                      <option value="faible">Faible</option>
                      <option value="moyenne">Moyenne</option>
                      <option value="élevée">Élevée</option>
                    </select>
                  </td>
                  <td className="px-4 py-3 text-center font-bold">
                    {score > 0 ? score : '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    {score > 0 && (
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${riskLevel.color} ${riskLevel.textColor}`}>
                        {riskLevel.level}
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      type="button"
                      className="text-blue-600 hover:text-blue-800"
                      onClick={() => {/* TODO: Add risk details modal */}}
                      title="Voir détails"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Risk Summary */}
      {risks.some(risk => risk.details?.gravite && risk.details?.probabilite) && (
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h5 className="font-semibold text-blue-900 mb-2">Résumé des Risques</h5>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(() => {
              const scores = risks
                .map(risk => {
                  const details = risk.details || {};
                  if (!details.gravite || !details.probabilite) return 0;
                  return (g => (g === 'faible' ? 1 : g === 'moyenne' ? 2 : g === 'élevée' ? 3 : 0))(details.gravite) * 
                         (p => (p === 'faible' ? 1 : p === 'moyenne' ? 2 : p === 'élevée' ? 3 : 0))(details.probabilite);
                })
                .filter(score => score > 0);
              
              if (scores.length === 0) return null;
              
              const maxScore = Math.max(...scores);
              const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
              const highRisks = scores.filter(score => score >= 7).length;
              
              return (
                <>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{maxScore}</div>
                    <div className="text-sm text-blue-700">Score Maximum</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-900">{avgScore}</div>
                    <div className="text-sm text-blue-700">Score Moyen</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{highRisks}</div>
                    <div className="text-sm text-blue-700">Risques Élevés</div>
                  </div>
                </>
              );
            })()}
          </div>
        </div>
      )}
    </div>
  );
};

const STEPS = [
  {
    key: 'description',
    label: 'Description du traitement',
    help: "Décrivez le traitement, l'organisme, le responsable, etc. (Art. 1, Loi 09-08)",
    fields: [
      { key: 'nom', label: 'Nom du traitement', required: true, help: "Exemple : Gestion RH, Vidéosurveillance" },
      { key: 'responsable', label: 'Responsable', required: true, help: "Personne ou service responsable du traitement." },
      { key: 'description', label: 'Description', required: true, help: "Résumé du traitement et de ses objectifs." },
    ],
  },
  {
    key: 'finalites',
    label: 'Finalités du traitement',
    help: "Expliquez pourquoi les données sont traitées. (Art. 3, Loi 09-08)",
    fields: [
      { key: 'finalites', label: 'Finalités', required: true, help: "Exemple : Gestion du personnel, sécurité, marketing." },
    ],
  },
  {
    key: 'donnees',
    label: 'Données & personnes concernées',
    help: "Listez les catégories de données et de personnes. (Art. 4, Loi 09-08)",
    fields: [
      { key: 'categories_donnees', label: 'Catégories de données', required: true, help: "Exemple : Données d'identité, santé, biométriques." },
      { key: 'personnes_concernees', label: 'Personnes concernées', required: true, help: "Exemple : Salariés, clients, visiteurs." },
    ],
  },
  {
    key: 'risques',
    label: 'Analyse des risques',
    help: "Sélectionnez les risques, évaluez gravité/probabilité, et consultez les mesures recommandées. (Art. 23, Loi 09-08)",
    fields: [],
  },
  {
    key: 'mesures',
    label: 'Mesures de sécurité',
    help: "Décrivez les mesures pour réduire les risques. (Art. 23, Loi 09-08)",
    fields: [
      { key: 'mesures', label: 'Mesures proposées', required: true, help: "Exemple : Chiffrement, contrôle d'accès, formation." },
    ],
  },
  {
    key: 'necessite',
    label: 'Nécessité & proportionnalité',
    help: "Justifiez la légitimité du traitement. (Art. 3, Loi 09-08)",
    fields: [
      { key: 'necessite', label: 'Nécessité/proportionnalité', required: true, help: "Pourquoi ce traitement est-il justifié et proportionné ?" },
    ],
  },
  {
    key: 'consultation',
    label: 'Consultation CNDP',
    help: "Avez-vous consulté la CNDP ou d'autres parties prenantes ? (Art. 46, Loi 09-08)",
    fields: [
      { key: 'consultation', label: 'Consultation (oui/non/détails)', required: false, help: "Exemple : Consultation DPO, CNDP, syndicats." },
    ],
  },
];

// Dropdown options for select fields
const CATEGORIES_DONNEES = [
  "Identité", "Contact", "Adresse", "Date de naissance", "Données bancaires", "Données de santé", "Biométriques", "Professionnelles", "Photos/Vidéos", "Connexion/IT", "Localisation", "Habitudes de vie", "Situation familiale", "Situation économique", "Données judiciaires", "Données scolaires", "Données de navigation", "Autre..."
];
const PERSONNES_CONCERNEES = [
  "Salariés", "Clients", "Prospects", "Fournisseurs", "Visiteurs", "Patients", "Étudiants", "Enfants", "Usagers", "Membres", "Bénéficiaires", "Candidats", "Partenaires", "Population générale", "Autre..."
];
const FINALITES = [
  "Gestion RH", "Gestion de la paie", "Gestion des accès", "Sécurité des locaux", "Vidéosurveillance", "Marketing", "Prospection commerciale", "Gestion des clients", "Gestion des fournisseurs", "Gestion des contrats", "Gestion des formations", "Gestion des candidatures", "Gestion des adhésions", "Gestion des dossiers médicaux", "Gestion des dossiers scolaires", "Gestion des plaintes", "Gestion des événements", "Gestion des newsletters", "Gestion des réseaux sociaux", "Gestion des cookies", "Autre..."
];

function emptyDPIA() {
  return {
    ...Object.fromEntries(STEPS.flatMap(s => s.fields.map(f => [f.key, '']))),
    risques_selectionnes: [],
    risques_details: [],
    custom_risks: [], // array of {label, mesures}
    status: 'draft', // draft, under_review, approved, rejected
    approvedBy: null,
    approvedAt: null,
    comments: [],
    submittedAt: null,
  };
}

// DPIA Templates
const DPIA_TEMPLATES = [
  {
    id: 'hr_management',
    name: 'Gestion RH',
    description: 'Traitement des données personnelles des employés',
    template: {
      nom: 'Gestion RH',
      responsable: 'Service RH',
      description: 'Traitement des données personnelles des employés pour la gestion des ressources humaines, incluant le recrutement, la paie, les formations et l\'évaluation.',
      finalites: 'Gestion RH',
      categories_donnees: 'Identité, Contact, Données professionnelles, Données de santé, Données bancaires',
      personnes_concernees: 'Salariés',
      mesures: 'Accès restreint, chiffrement, formation du personnel, audit régulier',
      necessite: 'Nécessaire pour la gestion contractuelle et légale des relations de travail',
      consultation: 'Consultation des représentants du personnel'
    }
  },
  {
    id: 'customer_management',
    name: 'Gestion Clients',
    description: 'Traitement des données clients pour la relation commerciale',
    template: {
      nom: 'Gestion Clients',
      responsable: 'Service Commercial',
      description: 'Traitement des données personnelles des clients pour la gestion de la relation commerciale, la facturation et le support client.',
      finalites: 'Gestion des clients',
      categories_donnees: 'Identité, Contact, Données bancaires, Historique d\'achats',
      personnes_concernees: 'Clients',
      mesures: 'Accès restreint, chiffrement, politique de rétention, droit à l\'oubli',
      necessite: 'Nécessaire pour l\'exécution des contrats et la relation commerciale',
      consultation: 'Consultation DPO'
    }
  },
  {
    id: 'video_surveillance',
    name: 'Vidéosurveillance',
    description: 'Système de vidéosurveillance des locaux',
    template: {
      nom: 'Vidéosurveillance',
      responsable: 'Service Sécurité',
      description: 'Système de vidéosurveillance pour la sécurité des locaux et des personnes.',
      finalites: 'Sécurité des locaux',
      categories_donnees: 'Images/Vidéos, Localisation',
      personnes_concernees: 'Salariés, Visiteurs',
      mesures: 'Accès restreint, chiffrement, politique de rétention, droit à l\'oubli',
      necessite: 'Nécessaire pour la sécurité des biens et des personnes',
      consultation: 'Consultation CNDP, syndicats'
    }
  }
];

// Enhanced PDF Export Function
const exportDPIAPDF = (form) => {
  const doc = new jsPDF();
  
  // Header
  doc.setFontSize(20);
  doc.setTextColor(30, 58, 138); // Blue-900
  doc.text('Évaluation d\'Impact sur la Protection des Données (DPIA)', 20, 30);
  
  // Organization info
  doc.setFontSize(12);
  doc.setTextColor(107, 114, 128); // Gray-500
  doc.text(`Généré le: ${new Date().toLocaleDateString('fr-FR')}`, 20, 45);
  
  // DPIA Details
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text('1. Description du Traitement', 20, 65);
  
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(`Nom: ${form.nom || 'Non renseigné'}`, 20, 75);
  doc.text(`Responsable: ${form.responsable || 'Non renseigné'}`, 20, 85);
  doc.text(`Description: ${form.description || 'Non renseigné'}`, 20, 95);
  
  // Finalités
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text('2. Finalités du Traitement', 20, 115);
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(form.finalites || 'Non renseigné', 20, 125);
  
  // Données et personnes
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text('3. Données et Personnes Concernées', 20, 145);
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(`Catégories de données: ${form.categories_donnees || 'Non renseigné'}`, 20, 155);
  doc.text(`Personnes concernées: ${form.personnes_concernees || 'Non renseigné'}`, 20, 165);
  
  // Risk Analysis
  if (form.risques_details && form.risques_details.length > 0) {
    doc.setFontSize(14);
    doc.setTextColor(30, 58, 138);
    doc.text('4. Analyse des Risques', 20, 185);
    
    let yPos = 195;
    form.risques_details.forEach((details, idx) => {
      if (details.gravite && details.probabilite) {
        const risk = idx >= COMMON_RISKS.length 
          ? (form.custom_risks && form.custom_risks[idx - COMMON_RISKS.length]) 
          : COMMON_RISKS[idx];
        
        if (risk) {
          const score = (g => (g === 'faible' ? 1 : g === 'moyenne' ? 2 : g === 'élevée' ? 3 : 0))(details.gravite) * 
                       (p => (p === 'faible' ? 1 : p === 'moyenne' ? 2 : p === 'élevée' ? 3 : 0))(details.probabilite);
          
          doc.setFontSize(10);
          doc.setTextColor(55, 65, 81);
          doc.text(`${risk.label} (Score: ${score})`, 20, yPos);
          doc.setFontSize(8);
          doc.text(`Gravité: ${details.gravite} | Probabilité: ${details.probabilite}`, 25, yPos + 5);
          yPos += 15;
        }
      }
    });
  }
  
  // Mesures
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text('5. Mesures de Sécurité', 20, yPos + 10);
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(form.mesures || 'Non renseigné', 20, yPos + 20);
  
  // Nécessité
  doc.setFontSize(14);
  doc.setTextColor(30, 58, 138);
  doc.text('6. Nécessité et Proportionnalité', 20, yPos + 40);
  doc.setFontSize(10);
  doc.setTextColor(55, 65, 81);
  doc.text(form.necessite || 'Non renseigné', 20, yPos + 50);
  
  // Footer
  doc.setFontSize(8);
  doc.setTextColor(107, 114, 128);
  doc.text('Document généré automatiquement par RGPD Compliance Maroc', 20, 280);
  
  doc.save(`DPIA_${form.nom || 'Traitement'}_${new Date().toISOString().split('T')[0]}.pdf`);
};

export default function DPIA() {
  const { token, logout, user } = useAuth();
  
  // Role-based permissions
  const canCreate = user?.role === 'admin' || user?.role === 'dpo' || user?.role === 'responsable';
  const canEdit = user?.role === 'admin' || user?.role === 'dpo' || user?.role === 'responsable';
  const canDelete = user?.role === 'admin' || user?.role === 'dpo';
  const canViewAll = user?.role === 'admin' || user?.role === 'dpo' || user?.role === 'auditeur';
  const [dpias, setDPIAs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [wizard, setWizard] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyDPIA());
  const [status, setStatus] = useState('');
  const [review, setReview] = useState(false);
  const [currentId, setCurrentId] = useState(null);
  const [error, setError] = useState('');
  // New: state for selected DPIAs
  const [selectedDPIAs, setSelectedDPIAs] = useState([]);
  const [viewMatrixDPIA, setViewMatrixDPIA] = useState(null); // For viewing risk matrix

  // New state for search and filtering
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Filter DPIAs based on search term and status
  const filteredDPIAs = dpias.filter(dpia => {
    const matchesSearch = dpia.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dpia.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         dpia.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || dpia.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  // Template selection
  const [showTemplates, setShowTemplates] = useState(false);
  
  const handleTemplateSelect = (template) => {
    setForm({
      ...emptyDPIA(),
      ...template.template
    });
    setShowTemplates(false);
    setWizard(true);
    setStep(0);
    setCurrentId(null);
    setReview(false);
    setStatus('');
  };

  // Enhanced start wizard with template selection
  const startWizard = () => {
    setShowTemplates(true);
  };

  // Start wizard without template (called when user cancels template selection)
  const startWizardWithoutTemplate = () => {
    setShowTemplates(false);
    setWizard(true);
    setStep(0);
    setForm(emptyDPIA());
    setCurrentId(null);
    setReview(false);
    setStatus('');
  };

  // Load DPIAs
  useEffect(() => {
    setLoading(true);
    setError('');
    fetch(`${API_BASE}/api/dpias`, { headers: { Authorization: `Bearer ${token}` } })
      .then(async r => { if (r.status === 401 || r.status === 403) { logout(); throw new Error('Session expirée, veuillez vous reconnecter.'); } if (!r.ok) throw new Error('Erreur serveur'); return r.json(); })
      .then(data => { setDPIAs(data); setLoading(false); })
      .catch((e) => { setLoading(false); setError(e.message || 'Erreur de connexion au serveur. Vérifiez votre connexion ou réessayez plus tard.'); });
  }, [token, logout]);

  // Clear selection when dpias changes
  useEffect(() => {
    setSelectedDPIAs([]);
  }, [dpias]);

  // Handle form change
  const handleChange = (k, v) => {
    setForm(f => ({ ...f, [k]: v }));
  };

  // Risk selection logic
  const handleRiskToggle = idx => {
    setForm(f => {
      const sel = f.risques_selectionnes || [];
      if (sel.includes(idx)) {
        return { ...f, risques_selectionnes: sel.filter(i => i !== idx) };
      } else {
        return { ...f, risques_selectionnes: [...sel, idx] };
      }
    });
  };
  const handleRiskDetail = (idx, field, value) => {
    setForm(f => {
      const details = [...(f.risques_details || [])];
      details[idx] = { ...details[idx], [field]: value };
      return { ...f, risques_details: details };
    });
  };
  // Auto-fill mesures from selected risks
  useEffect(() => {
    if (step === 4) {
      // On entering mesures step, auto-fill mesures if empty
      if (!form.mesures && form.risques_selectionnes && form.risques_selectionnes.length > 0) {
        const mesures = form.risques_selectionnes.map(idx => COMMON_RISKS[idx].mesures).join(' | ');
        setForm(f => ({ ...f, mesures }));
      }
    }
    // eslint-disable-next-line
  }, [step]);

  // Wizard navigation
  const next = () => setStep(s => Math.min(s + 1, STEPS.length - 1));
  const prev = () => setStep(s => Math.max(s - 1, 0));
  
  // In DPIA component, add edit/delete logic
  const handleEdit = dpia => {
    setForm(dpia);
    setCurrentId(dpia.id);
    setWizard(true);
    setStep(0);
    setReview(false);
    setStatus('');
  };
  const handleDelete = async id => {
    if (!window.confirm('Supprimer cette DPIA ?')) return;
    setStatus('Suppression...');
    try {
      const res = await fetch(`${API_BASE}/api/dpias/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setDPIAs(dpias => dpias.filter(d => d.id !== id));
        setStatus('');
      } else {
        setStatus("Erreur lors de la suppression.");
      }
    } catch {
      setStatus("Erreur réseau ou serveur.");
    }
  };

  // New state for custom risk input
  const [customRisk, setCustomRisk] = useState({ label: '', mesures: '', category: '' });

  // Add custom risk
  const handleAddCustomRisk = () => {
    if (!customRisk.label.trim()) return;
    setForm(f => ({
      ...f,
      custom_risks: [...(f.custom_risks || []), { ...customRisk }],
      risques_selectionnes: [...(f.risques_selectionnes || []), 'custom_' + (f.custom_risks?.length || 0)],
      risques_details: [...(f.risques_details || []), {}],
    }));
    setCustomRisk({ label: '', mesures: '', category: '' });
  };
  // Remove custom risk
  const handleRemoveCustomRisk = idx => {
    setForm(f => {
      const custom_risks = [...(f.custom_risks || [])];
      custom_risks.splice(idx, 1);
      // Remove from selection and details
      const customKey = 'custom_' + idx;
      const sel = (f.risques_selectionnes || []).filter(k => k !== customKey);
      const details = (f.risques_details || []).filter((_, i) => sel[i] !== customKey);
      return { ...f, custom_risks, risques_selectionnes: sel, risques_details: details };
    });
  };

  // New: handle select/deselect DPIA
  const handleSelectDPIA = (id) => {
    setSelectedDPIAs(selected =>
      selected.includes(id) ? selected.filter(sid => sid !== id) : [...selected, id]
    );
  };
  const handleSelectAllDPIAs = () => {
    if (selectedDPIAs.length === dpias.length) {
      setSelectedDPIAs([]);
    } else {
      setSelectedDPIAs(dpias.map(d => d.id));
    }
  };
  // New: delete selected DPIAs
  const handleDeleteSelected = async () => {
    if (selectedDPIAs.length === 0) return;
    if (!window.confirm('Supprimer les DPIA sélectionnées ?')) return;
    setStatus('Suppression...');
    setLoading(true);
    try {
      // Log each response
      const results = await Promise.all(selectedDPIAs.map(async id => {
        const res = await fetch(`${API_BASE}/api/dpias/${id}`, {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${token}` }
        });
        const text = await res.text();
        if (!res.ok) {
          console.error(`Failed to delete DPIA ${id}:`, text);
        }
        return { id, ok: res.ok, status: res.status, text };
      }));
      // Show errors if any
      const failed = results.filter(r => !r.ok);
      if (failed.length > 0) {
        alert('Certains DPIA n\'ont pas pu être supprimés: ' + failed.map(f => `${f.id} (status ${f.status})`).join(', '));
      }
      // Re-fetch the list from the server
      const res = await fetch(`${API_BASE}/api/dpias`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      setDPIAs(data);
      setStatus('');
    } catch (e) {
      setStatus("Erreur lors de la suppression.");
      console.error(e);
    }
    setLoading(false);
    setSelectedDPIAs([]);
  };

  // --- Move handleSave here, before return ---
  const handleSave = async e => {
    e.preventDefault();
    setStatus('Enregistrement...');
    try {
      let res, data;
      if (currentId) {
        // Update existing DPIA
        res = await fetch(`${API_BASE}/api/dpias/${currentId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...form })
        });
      } else {
        // Create new DPIA
        res = await fetch(`${API_BASE}/api/dpias`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ ...form })
        });
        data = await res.json();
        if (data.success && data.id) setCurrentId(data.id);
      }
      if (!data) data = await res.json();
      if (data.success) {
        setStatus('Enregistré !');
        setTimeout(() => { setWizard(false); setReview(false); setForm(emptyDPIA()); setStatus(''); }, 1000);
      } else {
        setStatus("Erreur lors de l'enregistrement.");
      }
    } catch {
      setStatus("Erreur réseau ou serveur.");
    }
  };

  // New: handle DPIA status changes
  const handleStatusChange = async (dpiaId, newStatus) => {
    setStatus('Mise à jour...');
    try {
      const res = await fetch(`${API_BASE}/api/dpias/${dpiaId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}` 
        },
        body: JSON.stringify({
          status: newStatus,
          approvedBy: newStatus === 'approved' ? user.id : null,
          approvedAt: newStatus === 'approved' ? new Date().toISOString() : null,
          submittedAt: newStatus === 'under_review' ? new Date().toISOString() : null
        })
      });
      const data = await res.json();
      if (data.success) {
        setDPIAs(dpias => dpias.map(d => d.id === dpiaId ? { ...d, status: newStatus, approvedBy: newStatus === 'approved' ? user.id : null, approvedAt: newStatus === 'approved' ? new Date().toISOString() : null, submittedAt: newStatus === 'under_review' ? new Date().toISOString() : null } : d));
        setStatus('');
      } else {
        setStatus("Erreur lors de la mise à jour.");
      }
    } catch {
      setStatus("Erreur réseau ou serveur.");
    }
  };

  // New: handle DPIA submission for review
  const handleSubmitForReview = (dpiaId) => {
    if (window.confirm('Soumettre cette DPIA pour révision ?')) {
      handleStatusChange(dpiaId, 'under_review');
    }
  };

  // New: handle DPIA approval
  const handleApprove = (dpiaId) => {
    if (window.confirm('Approuver cette DPIA ?')) {
      handleStatusChange(dpiaId, 'approved');
    }
  };

  // New: handle DPIA rejection
  const handleReject = (dpiaId) => {
    if (window.confirm('Rejeter cette DPIA ?')) {
      handleStatusChange(dpiaId, 'rejected');
    }
  };

  // New state for comments
  const [newComment, setNewComment] = useState('');

  // Add comment to DPIA
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const comment = {
      id: Date.now(),
      text: newComment,
      author: user?.email || 'Utilisateur',
      createdAt: new Date().toISOString()
    };
    setForm(f => ({
      ...f,
      comments: [...(f.comments || []), comment]
    }));
    setNewComment('');
  };

  // Render
  if (error) return <div className="text-red-600 font-semibold p-8">{error}</div>;
  return (
    <section>
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <ShieldCheckIcon className="w-10 h-10 text-yellow-300" /> DPIA (Analyse d'impact)
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Générez une analyse d'impact conforme à la Loi 09-08 grâce à l'assistant pas à pas.</p>
        </div>
        <div className="flex-1 flex justify-center items-center">
          <img src="/logo.png" alt="RGPD Compliance Maroc Logo" className="w-36 h-36 object-contain drop-shadow-xl" />
        </div>
      </div>
      {/* Wizard or List */}
      {!wizard ? (
        <>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-blue-900 flex items-center gap-2"><SparklesIcon className="w-7 h-7 text-blue-700" /> {canViewAll ? 'Toutes les DPIA' : 'Mes DPIA'}</h2>
            {canCreate && (
              <button className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-4 py-2 rounded flex items-center gap-2 font-semibold shadow" onClick={startWizard}><PlusIcon className="w-5 h-5" /> Nouvelle DPIA</button>
            )}
          </div>
          
          {/* Search and Filter Section */}
          <div className="mb-4 flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <input
                type="text"
                placeholder="Rechercher par nom, responsable ou description..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="md:w-48">
              <select
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tous les statuts</option>
                <option value="draft">Brouillon</option>
                <option value="under_review">En révision</option>
                <option value="approved">Approuvé</option>
                <option value="rejected">Rejeté</option>
              </select>
            </div>
          </div>
          
          {/* Results count */}
          <div className="mb-2 text-sm text-gray-600">
            {filteredDPIAs.length} DPIA{filteredDPIAs.length !== 1 ? 's' : ''} trouvée{filteredDPIAs.length !== 1 ? 's' : ''}
          </div>
          
          {/* DPIA Statistics Dashboard */}
          <div className="mb-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            {(() => {
              const stats = {
                draft: dpias.filter(d => d.status === 'draft').length,
                under_review: dpias.filter(d => d.status === 'under_review').length,
                approved: dpias.filter(d => d.status === 'approved').length,
                rejected: dpias.filter(d => d.status === 'rejected').length
              };
              
              const statConfig = {
                draft: { label: 'Brouillons', color: 'bg-gray-100 border-gray-300', textColor: 'text-gray-700' },
                under_review: { label: 'En révision', color: 'bg-yellow-100 border-yellow-300', textColor: 'text-yellow-700' },
                approved: { label: 'Approuvées', color: 'bg-green-100 border-green-300', textColor: 'text-green-700' },
                rejected: { label: 'Rejetées', color: 'bg-red-100 border-red-300', textColor: 'text-red-700' }
              };
              
              return Object.entries(stats).map(([status, count]) => {
                const config = statConfig[status];
                return (
                  <div key={status} className={`p-4 rounded-lg border ${config.color} ${config.textColor}`}>
                    <div className="text-2xl font-bold">{count}</div>
                    <div className="text-sm font-medium">{config.label}</div>
                  </div>
                );
              });
            })()}
          </div>
          
          {/* New: Delete selected button */}
          {canDelete && (
            <div className="mb-2 flex items-center gap-4">
              <button
                className="bg-red-600 hover:bg-red-800 text-white px-4 py-2 rounded font-semibold shadow disabled:opacity-50"
                onClick={handleDeleteSelected}
                disabled={selectedDPIAs.length === 0 || loading}
              >
                Supprimer la sélection ({selectedDPIAs.length})
              </button>
            </div>
          )}
          {loading ? <div className="text-blue-700">Chargement...</div> : (
            <div className="overflow-x-auto animate-fade-in">
              <table className="min-w-full bg-white/80 backdrop-blur rounded-xl shadow-lg">
                <thead>
                  <tr>
                    {/* New: Select all checkbox */}
                    {canDelete && <th className="px-2 py-2"><input type="checkbox" checked={selectedDPIAs.length === dpias.length && dpias.length > 0} onChange={handleSelectAllDPIAs} /></th>}
                    <th className="px-4 py-2 text-left text-blue-900 font-semibold">Nom</th>
                    <th className="px-4 py-2 text-left text-blue-900 font-semibold">Responsable</th>
                    <th className="px-4 py-2 text-left text-blue-900 font-semibold">Statut</th>
                    <th className="px-4 py-2 text-left text-blue-900 font-semibold">Date</th>
                    <th className="px-4 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  {/* Relaxed: show all dpias for now */}
                  {filteredDPIAs.map(dpia => (
                    <tr key={dpia.id} className="border-b border-blue-100 hover:bg-blue-50/40 transition">
                      {/* New: Row checkbox */}
                      {canDelete && <td className="px-2 py-2"><input type="checkbox" checked={selectedDPIAs.includes(dpia.id)} onChange={() => handleSelectDPIA(dpia.id)} /></td>}
                      <td className="px-4 py-2 text-gray-800">{dpia.nom}</td>
                      <td className="px-4 py-2 text-gray-800">{dpia.responsable}</td>
                      <td className="px-4 py-2">
                        {(() => {
                          const statusConfig = {
                            draft: { label: 'Brouillon', color: 'bg-gray-100 text-gray-700 border-gray-300' },
                            under_review: { label: 'En révision', color: 'bg-yellow-100 text-yellow-700 border-yellow-300' },
                            approved: { label: 'Approuvé', color: 'bg-green-100 text-green-700 border-green-300' },
                            rejected: { label: 'Rejeté', color: 'bg-red-100 text-red-700 border-red-300' }
                          };
                          const config = statusConfig[dpia.status || 'draft'];
                          return (
                            <span className={`px-2 py-1 rounded-full border text-xs font-semibold ${config.color}`}>
                              {config.label}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="px-4 py-2 text-gray-500 text-xs">{dpia.date && dpia.date.slice(0,10)}</td>
                      <td className="px-4 py-2 flex gap-2">
                        <button className="text-blue-700 hover:text-yellow-500" title="Voir la matrice des risques" onClick={() => setViewMatrixDPIA(dpia)}><EyeIcon className="w-5 h-5" /></button>
                        {canEdit && dpia.status === 'draft' && <button className="text-blue-700 hover:text-yellow-500" title="Modifier" onClick={() => handleEdit(dpia)}><PencilIcon className="w-5 h-5" /></button>}
                        {canEdit && dpia.status === 'draft' && <button className="text-yellow-600 hover:text-yellow-800" title="Soumettre pour révision" onClick={() => handleSubmitForReview(dpia.id)}>Soumettre</button>}
                        {(user?.role === 'admin' || user?.role === 'dpo') && dpia.status === 'under_review' && (
                          <>
                            <button className="text-green-600 hover:text-green-800" title="Approuver" onClick={() => handleApprove(dpia.id)}>Approuver</button>
                            <button className="text-red-600 hover:text-red-800" title="Rejeter" onClick={() => handleReject(dpia.id)}>Rejeter</button>
                          </>
                        )}
                        {canDelete && <button className="text-red-600 hover:text-red-800" title="Supprimer" onClick={() => handleDelete(dpia.id)}><TrashIcon className="w-5 h-5" /></button>}
                      </td>
                    </tr>
                  ))}
                  {filteredDPIAs.length === 0 && <tr><td colSpan={canDelete ? 6 : 5} className="text-center text-gray-500 py-8">Aucune DPIA enregistrée.</td></tr>}
                </tbody>
              </table>
            </div>
          )}
          {/* Modal for viewing risk matrix */}
          {viewMatrixDPIA && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
              <div className="bg-white rounded-xl shadow-xl p-8 max-w-2xl w-full relative animate-fade-in">
                <button className="absolute top-2 right-2 text-blue-900 hover:text-red-600" onClick={() => setViewMatrixDPIA(null)} title="Fermer">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
                <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><EyeIcon className="w-6 h-6 text-blue-700" /> Matrice des risques</h3>
                {/* Risk matrix table for the selected DPIA */}
                {viewMatrixDPIA.risques_details && viewMatrixDPIA.risques_details.filter(details => details.gravite && details.probabilite).length > 0 ? (
                  <>
                    <div className="overflow-x-auto">
                      <table className="min-w-full text-xs bg-white rounded shadow border">
                        <thead>
                          <tr className="bg-blue-50 text-blue-900">
                            <th className="px-3 py-2 text-left font-semibold">Risque</th>
                            <th className="px-3 py-2 font-semibold">Gravité</th>
                            <th className="px-3 py-2 font-semibold">Probabilité</th>
                            <th className="px-3 py-2 font-semibold">Score</th>
                            <th className="px-3 py-2 font-semibold">Niveau</th>
                          </tr>
                        </thead>
                        <tbody>
                          {viewMatrixDPIA.risques_details.map((details, i) => {
                            if (!(details.gravite && details.probabilite)) return null;
                            const isCustom = i >= COMMON_RISKS.length;
                            const risk = isCustom ? viewMatrixDPIA.custom_risks[i - COMMON_RISKS.length] : COMMON_RISKS[i];
                            const gravite = details.gravite;
                            const probabilite = details.probabilite;
                            const score = (g => (g === 'faible' ? 1 : g === 'moyenne' ? 2 : g === 'élevée' ? 3 : 0))(gravite) * (p => (p === 'faible' ? 1 : p === 'moyenne' ? 2 : p === 'élevée' ? 3 : 0))(probabilite);
                            let niveau = '';
                            let badge = '';
                            if (score >= 7) { niveau = 'Élevé'; badge = 'bg-red-100 text-red-700 border-red-300'; }
                            else if (score >= 4) { niveau = 'Moyen'; badge = 'bg-yellow-100 text-yellow-700 border-yellow-300'; }
                            else if (score > 0) { niveau = 'Faible'; badge = 'bg-green-100 text-green-700 border-green-300'; }
                            return (
                              <tr key={isCustom ? 'custom_' + (i - COMMON_RISKS.length) : i} className="border-b last:border-0 hover:bg-blue-50/40 transition">
                                <td className="px-3 py-2 font-medium text-blue-900">{risk?.label}</td>
                                <td className="px-3 py-2">{gravite || '-'}</td>
                                <td className="px-3 py-2">{probabilite || '-'}</td>
                                <td className="px-3 py-2 font-bold text-center">{score > 0 ? score : '-'}</td>
                                <td className="px-3 py-2 text-center">{niveau ? <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${badge}`}>{niveau}</span> : '-'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                    {/* Final score summary */}
                    {(() => {
                      const scores = viewMatrixDPIA.risques_details
                        .map(details => {
                          if (!(details.gravite && details.probabilite)) return 0;
                          return (g => (g === 'faible' ? 1 : g === 'moyenne' ? 2 : g === 'élevée' ? 3 : 0))(details.gravite) * (p => (p === 'faible' ? 1 : p === 'moyenne' ? 2 : p === 'élevée' ? 3 : 0))(details.probabilite);
                        })
                        .filter(score => score > 0);
                      if (scores.length === 0) return null;
                      const maxScore = Math.max(...scores);
                      const avgScore = (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1);
                      let niveau = '';
                      let badge = '';
                      if (maxScore >= 7) { niveau = 'Élevé'; badge = 'bg-red-100 text-red-700 border-red-300'; }
                      else if (maxScore >= 4) { niveau = 'Moyen'; badge = 'bg-yellow-100 text-yellow-700 border-yellow-300'; }
                      else if (maxScore > 0) { niveau = 'Faible'; badge = 'bg-green-100 text-green-700 border-green-300'; }
                      return (
                        <div className="mt-6 flex flex-col gap-2 items-start">
                          <div className="text-base font-semibold text-blue-900 flex items-center gap-2">
                            Score final (max) : <span className="font-bold">{maxScore}</span> {niveau && <span className={`px-2 py-0.5 rounded-full border text-xs font-semibold ${badge}`}>{niveau}</span>}
                          </div>
                          <div className="text-base text-blue-900">Score moyen : <span className="font-bold">{avgScore}</span></div>
                        </div>
                      );
                    })()}
                  </>
                ) : (
                  <div className="text-blue-700">Aucune analyse de risque renseignée pour cette DPIA.</div>
                )}
              </div>
            </div>
          )}
        </>
      ) : (
        !review ? (
          <>
            {/* Template Selection Modal */}
            {showTemplates && (
              <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
                <div className="bg-white rounded-xl shadow-xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto animate-fade-in">
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-xl font-bold text-blue-900 flex items-center gap-2">
                      <SparklesIcon className="w-6 h-6 text-blue-700" />
                      Choisir un modèle de DPIA
                    </h3>
                    <button 
                      className="text-gray-500 hover:text-red-600" 
                      onClick={() => setShowTemplates(false)}
                      title="Fermer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
                    {DPIA_TEMPLATES.map((template) => (
                      <div key={template.id} className="bg-white border border-blue-200 rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => handleTemplateSelect(template)}>
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                            <SparklesIcon className="w-5 h-5 text-blue-700" />
                          </div>
                          <h4 className="font-semibold text-blue-900">{template.name}</h4>
                        </div>
                        <p className="text-gray-600 text-sm mb-4">{template.description}</p>
                        <div className="text-xs text-blue-700 bg-blue-50 px-2 py-1 rounded">
                          Modèle pré-rempli
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="flex justify-center">
                    <button 
                      type="button" 
                      className="bg-blue-100 text-blue-900 px-6 py-2 rounded font-semibold shadow hover:bg-blue-200 transition"
                      onClick={startWizardWithoutTemplate}
                    >
                      Commencer sans modèle
                    </button>
                  </div>
                </div>
              </div>
            )}
            
            <form className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-8 max-w-2xl mx-auto animate-fade-in" onSubmit={step === STEPS.length - 1 ? handleSave : undefined}>
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><CheckCircleIcon className="w-6 h-6 text-green-600" /> Étape {step + 1} : {STEPS[step].label}</h3>
            <p className="text-gray-700 mb-4">{STEPS[step].help}</p>
            <div className="grid gap-4">
              {/* Render fields for all steps except step 4 (risques) */}
              {step !== 3 && STEPS[step].fields.map(f => {
                // Catégories de données
                if (f.key === 'categories_donnees') return (
                  <div key={f.key}>
                    <label className="block text-blue-900 font-semibold mb-1">{f.label}{f.required && ' *'}</label>
                    <div className="text-xs text-blue-700 mb-1">{f.help}</div>
                    <select
                      className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400"
                      value={CATEGORIES_DONNEES.includes(form.categories_donnees) ? form.categories_donnees : (form.categories_donnees.startsWith('Autre:') ? 'Autre...' : '')}
                      onChange={e => {
                        if (e.target.value === 'Autre...') {
                          setForm(fm => ({ ...fm, categories_donnees: 'Autre:' }));
                        } else {
                          setForm(fm => ({ ...fm, categories_donnees: e.target.value }));
                        }
                      }}
                      required={f.required}
                    >
                      <option value="">Sélectionner...</option>
                      {CATEGORIES_DONNEES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {form.categories_donnees.startsWith('Autre:') && (
                      <input
                        className="mt-2 w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        type="text"
                        placeholder="Précisez la catégorie"
                        value={form.categories_donnees.replace('Autre:', '')}
                        onChange={e => setForm(fm => ({ ...fm, categories_donnees: 'Autre:' + e.target.value }))}
                        required={f.required}
                      />
                    )}
                  </div>
                );
                // Personnes concernées
                if (f.key === 'personnes_concernees') return (
                  <div key={f.key}>
                    <label className="block text-blue-900 font-semibold mb-1">{f.label}{f.required && ' *'}</label>
                    <div className="text-xs text-blue-700 mb-1">{f.help}</div>
                    <select
                      className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400"
                      value={PERSONNES_CONCERNEES.includes(form.personnes_concernees) ? form.personnes_concernees : (form.personnes_concernees.startsWith('Autre:') ? 'Autre...' : '')}
                      onChange={e => {
                        if (e.target.value === 'Autre...') {
                          setForm(fm => ({ ...fm, personnes_concernees: 'Autre:' }));
                        } else {
                          setForm(fm => ({ ...fm, personnes_concernees: e.target.value }));
                        }
                      }}
                      required={f.required}
                    >
                      <option value="">Sélectionner...</option>
                      {PERSONNES_CONCERNEES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {form.personnes_concernees.startsWith('Autre:') && (
                      <input
                        className="mt-2 w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        type="text"
                        placeholder="Précisez la personne concernée"
                        value={form.personnes_concernees.replace('Autre:', '')}
                        onChange={e => setForm(fm => ({ ...fm, personnes_concernees: 'Autre:' + e.target.value }))}
                        required={f.required}
                      />
                    )}
                  </div>
                );
                // Finalités
                if (f.key === 'finalites') return (
                  <div key={f.key}>
                    <label className="block text-blue-900 font-semibold mb-1">{f.label}{f.required && ' *'}</label>
                    <div className="text-xs text-blue-700 mb-1">{f.help}</div>
                    <select
                      className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400"
                      value={FINALITES.includes(form.finalites) ? form.finalites : (form.finalites.startsWith('Autre:') ? 'Autre...' : '')}
                      onChange={e => {
                        if (e.target.value === 'Autre...') {
                          setForm(fm => ({ ...fm, finalites: 'Autre:' }));
                        } else {
                          setForm(fm => ({ ...fm, finalites: e.target.value }));
                        }
                      }}
                      required={f.required}
                    >
                      <option value="">Sélectionner...</option>
                      {FINALITES.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    {form.finalites.startsWith('Autre:') && (
                      <input
                        className="mt-2 w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400"
                        type="text"
                        placeholder="Précisez la finalité"
                        value={form.finalites.replace('Autre:', '')}
                        onChange={e => setForm(fm => ({ ...fm, finalites: 'Autre:' + e.target.value }))}
                        required={f.required}
                      />
                    )}
                  </div>
                );
                // Default: text/textarea
                return (
                  <div key={f.key}>
                    <label className="block text-blue-900 font-semibold mb-1">{f.label}{f.required && ' *'}</label>
                    <div className="text-xs text-blue-700 mb-1">{f.help}</div>
                    {f.key === 'description' || f.key === 'mesures' || f.key === 'necessite' || f.key === 'consultation' ? (
                      <textarea className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400" value={form[f.key]} onChange={e => handleChange(f.key, e.target.value)} required={f.required} />
                    ) : (
                      <input className="w-full rounded border px-3 py-2 focus:ring-2 focus:ring-blue-400" value={form[f.key]} onChange={e => handleChange(f.key, e.target.value)} required={f.required} />
                    )}
                  </div>
                );
              })}
              {/* Enhanced risk analysis UI for step 4 */}
              {step === 3 && (
                <div className="mb-6">
                  <div className="font-semibold text-blue-900 mb-4 flex items-center gap-2 text-lg">
                    Analyse des risques 
                    <InformationCircleIcon className="w-5 h-5 text-blue-400" title={STEPS[3].help} />
                  </div>
                  
                  {/* Risk Matrix Visualization */}
                  <div className="mb-6">
                    <RiskMatrix 
                      risks={[...COMMON_RISKS, ...(form.custom_risks || [])].map((risk, idx) => ({
                        ...risk,
                        details: form.risques_details && form.risques_details[idx] ? form.risques_details[idx] : {}
                      }))}
                      onRiskUpdate={(idx, field, value) => handleRiskDetail(idx, field, value)}
                    />
                  </div>

                  {/* Custom risk input */}
                  <div className="mb-4 p-4 bg-blue-50 rounded-xl">
                    <h5 className="font-semibold text-blue-900 mb-2">Ajouter un risque personnalisé</h5>
                    <div className="flex flex-col md:flex-row gap-2 items-end">
                      <div className="flex-1">
                        <input 
                          className="w-full rounded border px-3 py-2 mb-1" 
                          placeholder="Description du risque..." 
                          value={customRisk.label} 
                          onChange={e => setCustomRisk(r => ({ ...r, label: e.target.value }))} 
                        />
                      </div>
                      <div className="flex-1">
                        <select 
                          className="w-full rounded border px-3 py-2 mb-1"
                          value={customRisk.category || ''}
                          onChange={e => setCustomRisk(r => ({ ...r, category: e.target.value }))}
                        >
                          <option value="">Sélectionner une catégorie</option>
                          <option value="Sécurité">Sécurité</option>
                          <option value="Confidentialité">Confidentialité</option>
                          <option value="Intégrité">Intégrité</option>
                          <option value="Disponibilité">Disponibilité</option>
                          <option value="Conformité">Conformité</option>
                        </select>
                      </div>
                      <button 
                        type="button" 
                        className="bg-blue-700 text-white px-4 py-2 rounded font-semibold shadow hover:bg-blue-800 transition" 
                        onClick={handleAddCustomRisk}
                        disabled={!customRisk.label.trim()}
                      >
                        Ajouter
                      </button>
                    </div>
                  </div>

                  {/* Risk Recommendations */}
                  {form.risques_details && form.risques_details.some(details => details.gravite && details.probabilite) && (
                    <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-200">
                      <h5 className="font-semibold text-yellow-900 mb-2 flex items-center gap-2">
                        <ExclamationTriangleIcon className="w-5 h-5" />
                        Recommandations basées sur l'analyse des risques
                      </h5>
                      <div className="space-y-2">
                        {(() => {
                          const highRisks = form.risques_details
                            .map((details, idx) => {
                              if (!details.gravite || !details.probabilite) return null;
                              const score = (g => (g === 'faible' ? 1 : g === 'moyenne' ? 2 : g === 'élevée' ? 3 : 0))(details.gravite) * 
                                           (p => (p === 'faible' ? 1 : p === 'moyenne' ? 2 : p === 'élevée' ? 3 : 0))(details.probabilite);
                              if (score >= 7) {
                                const risk = idx >= COMMON_RISKS.length 
                                  ? form.custom_risks[idx - COMMON_RISKS.length] 
                                  : COMMON_RISKS[idx];
                                return { risk, score, details };
                              }
                              return null;
                            })
                            .filter(Boolean);

                          if (highRisks.length === 0) {
                            return (
                              <p className="text-green-700">
                                ✅ Aucun risque élevé identifié. Continuez à surveiller et maintenir les mesures de sécurité existantes.
                              </p>
                            );
                          }

                          return highRisks.map(({ risk, score, details }, idx) => (
                            <div key={idx} className="p-3 bg-white rounded border border-yellow-300">
                              <div className="font-semibold text-yellow-900 mb-1">
                                {risk.label} (Score: {score})
                              </div>
                              <div className="text-sm text-yellow-800">
                                <strong>Mesures recommandées:</strong> {risk.mesures}
                              </div>
                              <div className="text-xs text-yellow-700 mt-1">
                                Gravité: {details.gravite} | Probabilité: {details.probabilite}
                              </div>
                            </div>
                          ));
                        })()}
                      </div>
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-4 mt-6">
                {step > 0 && (
                  <button type="button" className="bg-blue-100 text-blue-900 px-6 py-2 rounded font-semibold shadow flex items-center gap-2" onClick={prev}><ArrowLeftCircleIcon className="w-5 h-5" /> Précédent</button>
                )}
                {step < STEPS.length - 1 && (
                  <button type="button" className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded font-semibold shadow flex items-center gap-2" onClick={next}>Suivant <ArrowRightCircleIcon className="w-5 h-5" /></button>
                )}
                {step === STEPS.length - 1 && (
                  <button type="submit" className="w-full bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded font-semibold shadow mb-2">Enregistrer la DPIA</button>
                )}
              </div>
              {status && <div className="text-xs text-blue-700 mt-2 animate-fade-in">{status}</div>}
            </div>
          </form>
          </>
        ) : (
          <form className="bg-white/80 backdrop-blur rounded-xl shadow-lg p-8 max-w-2xl mx-auto animate-fade-in" onSubmit={handleSave}>
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2"><CheckCircleIcon className="w-6 h-6 text-green-600" /> Revue finale</h3>
            <ul className="mb-6 space-y-2">
              {STEPS.map(s => s.fields.map(f => (
                <li key={f.key} className="flex gap-2"><span className="font-semibold text-blue-900">{f.label}:</span> <span>{form[f.key]}</span></li>
              )))}
              {/* Show selected risks and details */}
              {form.risques_selectionnes && form.risques_selectionnes.length > 0 && (
                <li className="flex flex-col gap-1">
                  <span className="font-semibold text-blue-900">Risques analysés :</span>
                  <ul className="list-disc pl-6">
                    {form.risques_selectionnes.map(idx => {
                      let risk, details;
                      if (typeof idx === 'string' && idx.startsWith('custom_')) {
                        const customIdx = parseInt(idx.replace('custom_', ''));
                        risk = form.custom_risks[customIdx];
                      } else {
                        risk = COMMON_RISKS[idx];
                      }
                      details = form.risques_details && form.risques_details[idx] ? form.risques_details[idx] : {};
                      return (
                        <li key={idx} className="mb-1">
                          <span className="font-semibold text-yellow-700"><ExclamationTriangleIcon className="w-4 h-4 inline mr-1" /> {risk.label}</span>
                          {details.gravite && details.probabilite && (
                            <span className="ml-2 text-xs text-gray-600">(Gravité: {details.gravite}, Probabilité: {details.probabilite})</span>
                          )}
                          <div className="text-xs text-blue-700">Mesures: {risk.mesures}</div>
                          {details.controls && details.additional_measures && details.responsible && details.deadline && (
                            <div className="text-xs text-gray-600">
                              Contrôles: {details.controls}, Mesures supp.: {details.additional_measures}, Responsable: {details.responsible}, Échéance: {details.deadline}
                            </div>
                          )}
                        </li>
                      );
                    })}
                  </ul>
                </li>
              )}
            </ul>
            
            {/* Comments Section */}
            <div className="mt-6 border-t pt-6">
              <h4 className="font-semibold text-blue-900 mb-4 flex items-center gap-2">
                <InformationCircleIcon className="w-5 h-5" />
                Commentaires et notes
              </h4>
              
              {/* Existing comments */}
              {form.comments && form.comments.length > 0 && (
                <div className="mb-4 space-y-2">
                  {form.comments.map((comment, idx) => (
                    <div key={comment.id || idx} className="bg-gray-50 rounded-lg p-3">
                      <div className="flex justify-between items-start mb-1">
                        <span className="font-medium text-blue-900 text-sm">{comment.author}</span>
                        <span className="text-xs text-gray-500">
                          {new Date(comment.createdAt).toLocaleDateString('fr-FR')}
                        </span>
                      </div>
                      <p className="text-gray-700 text-sm">{comment.text}</p>
                    </div>
                  ))}
                </div>
              )}
              
              {/* Add new comment */}
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="Ajouter un commentaire..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400 focus:border-transparent"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button
                  type="button"
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                >
                  Ajouter
                </button>
              </div>
            </div>
            
            <button type="submit" className="w-full bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded font-semibold shadow mb-2">Enregistrer la DPIA</button>
            <button type="button" className="w-full bg-blue-100 text-blue-900 px-6 py-2 rounded font-semibold shadow flex items-center justify-center gap-2" disabled><DocumentArrowDownIcon className="w-5 h-5" /> Exporter PDF (bientôt)</button>
            <button type="button" className="w-full bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded font-semibold shadow flex items-center justify-center gap-2 mb-2" onClick={() => exportDPIAPDF(form)}>Exporter en PDF</button>
            {status && <div className="text-xs text-blue-700 mt-2 animate-fade-in">{status}</div>}
          </form>
        )
      )}
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 