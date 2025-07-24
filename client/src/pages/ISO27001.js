import React, { useState } from 'react';
import { CheckCircleIcon, ExclamationTriangleIcon, EyeIcon, ChevronDownIcon, ChevronUpIcon, DocumentArrowDownIcon } from '@heroicons/react/24/outline';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// Official ISO 27001:2022 Annexe A controls (subset for demo; expand as needed)
const ISO_CONTROLS = {
  'A.5.1': {
    title: 'Policies for information security',
    description: 'Information security policies shall be defined, approved by management, published and communicated to employees and relevant external parties.'
  },
  'A.5.2': { title: 'Information security roles and responsibilities', description: 'All information security responsibilities shall be defined and allocated.' },
  'A.5.3': { title: 'Segregation of duties', description: 'Conflicting duties and areas of responsibility shall be segregated to reduce opportunities for unauthorized or unintentional modification or misuse of the organization’s assets.' },
  'A.5.4': { title: 'Contact with authorities', description: 'Appropriate contacts with relevant authorities shall be maintained.' },
  'A.5.5': { title: 'Contact with special interest groups', description: 'Appropriate contacts with special interest groups or other specialist security forums and professional associations shall be maintained.' },
  'A.5.6': { title: 'Information security in project management', description: 'Information security shall be addressed in project management, regardless of the type of the project.' },
  'A.5.7': { title: 'Threat intelligence', description: 'Information relating to information security threats shall be collected and analyzed to produce threat intelligence.' },
  'A.5.8': { title: 'Information security in change management', description: 'Changes to the organization, business processes, information processing facilities and systems that affect information security shall be controlled.' },
  'A.5.9': { title: 'Inventory of information and other associated assets', description: 'An inventory of information and other associated assets, including owners, shall be developed and maintained.' },
  'A.5.10': { title: 'Acceptable use of information and other associated assets', description: 'Rules for the acceptable use and procedures for handling information and other associated assets shall be identified, documented and implemented.' },
  'A.5.11': { title: 'Return of assets', description: 'Employees and external party users shall return all of the organization’s assets in their possession upon termination of their employment, contract or agreement.' },
  'A.5.12': { title: 'Classification of information', description: 'Information shall be classified in terms of legal requirements, value, criticality and sensitivity to unauthorized disclosure or modification.' },
  'A.5.13': { title: 'Labelling of information', description: 'An appropriate set of procedures for information labelling shall be developed and implemented.' },
  'A.5.14': { title: 'Information transfer', description: 'Formal transfer policies, procedures and controls shall be in place to protect the transfer of information through the use of all types of communication facilities.' },
  'A.5.15': { title: 'Access control policy', description: 'An access control policy shall be established, documented and reviewed based on business and information security requirements.' },
  'A.5.16': { title: 'Access rights', description: 'Access rights to information and other associated assets shall be provided based on business and information security requirements.' },
  'A.5.17': { title: 'User access provisioning', description: 'A formal user access provisioning process shall be implemented to assign or revoke access rights for all user types to all systems and services.' },
  'A.5.18': { title: 'Management of privileged access rights', description: 'The allocation and use of privileged access rights shall be restricted and controlled.' },
  'A.5.19': { title: 'Information security in supplier relationships', description: 'Information security requirements for mitigating the risks associated with supplier’s access to the organization’s assets shall be agreed with the supplier and documented.' },
  'A.5.20': { title: 'Addressing information security within supplier agreements', description: 'All relevant information security requirements shall be established and agreed with each supplier that may access, process, store, communicate or provide IT infrastructure components for the organization’s information.' },
  'A.5.21': { title: 'Managing information security in the ICT supply chain', description: 'The organization shall monitor and review the information security practices of suppliers.' },
  'A.5.22': { title: 'Monitoring and review of supplier services', description: 'The organization shall regularly monitor, review and audit supplier service delivery.' },
  'A.5.23': { title: 'Information security for use of cloud services', description: 'Processes for the acquisition, use, management and exit from cloud services shall be established.' },
  'A.5.24': { title: 'Information security incident management planning and preparation', description: 'The organization shall plan and prepare for information security incidents.' },
  'A.5.25': { title: 'Assessment and decision on information security events', description: 'Information security events shall be assessed and it shall be decided if they are to be classified as information security incidents.' },
  'A.5.26': { title: 'Response to information security incidents', description: 'Information security incidents shall be responded to in accordance with the documented procedures.' },
  'A.5.27': { title: 'Learning from information security incidents', description: 'Knowledge gained from information security incidents shall be used to reduce the likelihood or impact of future incidents.' },
  'A.5.28': { title: 'Collection of evidence', description: 'The organization shall define and apply procedures for the identification, collection, acquisition and preservation of information, which can serve as evidence.' },
  'A.5.29': { title: 'Information security continuity', description: 'The organization shall plan, implement, maintain and test processes for information security continuity.' },
  'A.5.30': { title: 'ICT readiness for business continuity', description: 'ICT readiness for business continuity shall be planned, implemented, maintained and tested.' },
  'A.6.1': { title: 'Screening', description: 'Background verification checks on all candidates for employment shall be carried out in accordance with relevant laws, regulations and ethics and proportional to the business requirements, the classification of the information to be accessed and the perceived risks.' },
  'A.6.2': { title: 'Terms and conditions of employment', description: 'The contractual agreements with employees and contractors shall state their and the organization’s responsibilities for information security.' },
  'A.6.3': { title: 'Information security awareness, education and training', description: 'All employees of the organization and, where relevant, contractors shall receive appropriate awareness education and training and regular updates in organizational policies and procedures, as relevant for their job function.' },
  'A.6.4': { title: 'Disciplinary process', description: 'There shall be a formal and communicated disciplinary process in place to take action against employees who have committed an information security breach.' },
  'A.6.5': { title: 'Responsibilities after termination or change of employment', description: 'Information security responsibilities and duties that remain valid after termination or change of employment shall be defined, communicated to the employee or contractor and enforced.' },
  'A.6.6': { title: 'Confidentiality or non-disclosure agreements', description: 'Requirements for confidentiality or non-disclosure agreements reflecting the organization’s needs for the protection of information shall be identified, regularly reviewed and documented.' },
  'A.6.7': { title: 'Remote working', description: 'The organization shall implement and communicate a policy and supporting security measures to protect information accessed, processed or stored at remote working locations.' },
  'A.6.8': { title: 'Information security event reporting by employees', description: 'Employees and contractors shall be required to note and report any observed or suspected information security events.' },
  'A.7.1': { title: 'Physical security perimeter', description: 'Security perimeters shall be defined and used to protect areas that contain either sensitive or critical information and information processing facilities.' },
  'A.7.2': { title: 'Physical entry controls', description: 'Secure areas shall be protected by appropriate entry controls to ensure that only authorized personnel are allowed access.' },
  'A.7.3': { title: 'Securing offices, rooms and facilities', description: 'Physical security for offices, rooms and facilities shall be designed and applied.' },
  'A.7.4': { title: 'Protecting against physical and environmental threats', description: 'Protection against physical and environmental threats, such as fire, flood, earthquake, explosion, civil unrest, shall be designed and applied.' },
  'A.7.5': { title: 'Working in secure areas', description: 'Procedures for working in secure areas shall be designed and applied.' },
  'A.7.6': { title: 'Visitor access', description: 'Procedures for visitor access shall be designed and applied.' },
  'A.7.7': { title: 'Physical security monitoring', description: 'Physical security monitoring shall be implemented to detect and respond to physical security incidents.' },
  'A.7.8': { title: 'Equipment security', description: 'Equipment shall be protected to reduce the risks from environmental threats and hazards, and opportunities for unauthorized access.' },
  'A.7.9': { title: 'Secure disposal or re-use of equipment', description: 'Equipment, information and software shall be disposed of securely when no longer required.' },
  'A.7.10': { title: 'Clear desk and clear screen policy', description: 'A clear desk and clear screen policy for information processing facilities shall be adopted.' },
  'A.7.11': { title: 'Cabling security', description: 'Power and telecommunications cabling carrying data or supporting information services shall be protected from interception, interference or damage.' },
  'A.7.12': { title: 'Equipment maintenance', description: 'Equipment shall be correctly maintained to ensure its continued availability and integrity.' },
  'A.7.13': { title: 'Removal of assets', description: 'Removal of assets from the organization’s premises shall be authorized and controlled.' },
  'A.7.14': { title: 'Security of assets off-premises', description: 'Security shall be applied to off-site assets.' },
  'A.8.1': { title: 'User access management', description: 'A formal user access management process shall be implemented to assign or revoke access rights for all user types to all systems and services.' },
  'A.8.2': { title: 'Information access restriction', description: 'Access to information and other associated assets shall be restricted in accordance with the established access control policy.' },
  'A.8.3': { title: 'User registration and de-registration', description: 'A formal user registration and de-registration process shall be implemented to enable assignment of access rights.' },
  'A.8.4': { title: 'Management of secret authentication information', description: 'The allocation and management of secret authentication information shall be controlled.' },
  'A.8.5': { title: 'Review of user access rights', description: 'User access rights to systems and services shall be reviewed at regular intervals.' },
  'A.8.7': { title: 'Password management system', description: 'Password management systems shall be interactive and shall ensure quality passwords.' },
  'A.8.8': { title: 'Use of privileged utility programs', description: 'The use of utility programs that might be capable of overriding system and application controls shall be restricted and tightly controlled.' },
  'A.8.9': { title: 'Access control to program source code', description: 'Access to program source code shall be restricted.' },
  'A.8.10': { title: 'Storage media handling', description: 'Procedures for the management of removable media shall be implemented in accordance with the classification scheme adopted by the organization.' },
  'A.8.11': { title: 'Data backup', description: 'Backup copies of information, software and systems shall be maintained and regularly tested.' },
  'A.8.12': { title: 'Data masking', description: 'Data masking shall be used, where appropriate, to protect sensitive information.' },
  'A.8.13': { title: 'Data leakage prevention', description: 'Data leakage prevention measures shall be implemented to protect sensitive information.' },
  'A.8.14': { title: 'Monitoring activities', description: 'Systems shall be monitored to detect deviation from access control policy and record events to provide evidence and to ensure information security incidents can be detected and reported.' },
  'A.8.15': { title: 'Logging', description: 'Logging facilities and log information shall be protected against tampering and unauthorized access.' },
  'A.8.16': { title: 'Monitoring system use', description: 'Procedures for monitoring use of information processing facilities shall be established and the results of the monitoring activities reviewed regularly.' },
  'A.8.17': { title: 'Clock synchronization', description: 'The clocks of all relevant information processing systems within an organization or security domain shall be synchronized to a single reference time source.' },
  'A.8.18': { title: 'Network security management', description: 'Networks shall be managed and controlled to protect information in systems and applications.' },
  'A.8.19': { title: 'Security of network services', description: 'Security features, service levels and management requirements of all network services shall be identified and included in network services agreements.' },
  'A.8.20': { title: 'Segregation in networks', description: 'Groups of information services, users and information systems shall be segregated on networks.' },
  'A.8.21': { title: 'Information transfer policies and procedures', description: 'Formal transfer policies, procedures and controls shall be in place to protect the transfer of information through the use of all types of communication facilities.' },
  'A.8.22': { title: 'Electronic messaging', description: 'Information involved in electronic messaging shall be appropriately protected.' },
  'A.8.23': { title: 'Confidentiality or non-disclosure agreements', description: 'Requirements for confidentiality or non-disclosure agreements reflecting the organization’s needs for the protection of information shall be identified, regularly reviewed and documented.' },
  'A.8.24': { title: 'Protection of information systems during audit and review', description: 'Audit requirements and activities involving verification of operational systems shall be carefully planned and agreed to minimize disruptions to business processes.' },
  'A.8.13': { title: 'Data leakage prevention', description: 'Data leakage prevention measures shall be implemented to protect sensitive information.' },
  'A.8.14': { title: 'Monitoring activities', description: 'Systems shall be monitored to detect deviation from access control policy and record events to provide evidence and to ensure information security incidents can be detected and reported.' },
};

// Custom categories mapped to ISO controls
const CATEGORIES = [
  {
    label: 'I - MESURES DE GESTION DE LA SECURITE',
    controls: [
      'A.5.1', 'A.5.2', 'A.5.3', 'A.5.4', 'A.5.5', 'A.5.6', // Rôles et responsabilités
      'A.5.15', 'A.5.16', 'A.5.17', 'A.5.18', // Politique de contrôle d’accès
      'A.5.9', 'A.5.10', 'A.5.11', 'A.5.12', 'A.5.13', 'A.5.14', // Gestion des actifs
      'A.5.8', // Gestion du changement
      'A.5.19', 'A.5.20', 'A.5.21', 'A.5.22', // Sous-traitants
    ],
  },
  {
    label: 'II - REPONSES AUX INCIDENTS ET MESURES DE CONTINUITE D’ACTIVITE',
    controls: [
      'A.5.24', 'A.5.25', 'A.5.26', 'A.5.27', 'A.5.28', 'A.5.29', // Gestion des incidents
      'A.5.30', // Continuité d’activité
      'A.5.23', 'A.5.7', // Cloud et menaces
    ],
  },
  {
    label: 'III - MESURES LIÉES AUX PERSONNES',
    controls: [
      'A.6.1', 'A.6.2', 'A.6.3', 'A.6.4', 'A.6.5', 'A.6.6', 'A.6.7', 'A.6.8',
    ],
  },
  {
    label: 'IV - CONTRÔLE D’ACCÈS ET AUTHENTIFICATION',
    controls: [
      'A.8.1', 'A.8.2', 'A.8.3', 'A.8.4', 'A.8.5',
    ],
  },
  {
    label: 'V - ENREGISTREMENT ET CONTRÔLE',
    controls: [
      'A.8.15', 'A.8.16', 'A.8.17', 'A.8.18', // Enregistrement et contrôle
      'A.8.10', 'A.8.11', 'A.8.12', 'A.8.24', // Sécurité du serveur/base de données
    ],
  },
  {
    label: 'VI - SÉCURITÉ DES DONNÉES AU REPOS',
    controls: [
      'A.8.1', 'A.8.7', 'A.8.8', 'A.8.9', 'A.8.19',
    ],
  },
  {
    label: 'VII - SÉCURITÉ DU RÉSEAU/DE LA COMMUNICATION',
    controls: [
      'A.8.20', 'A.8.21', 'A.8.22', 'A.8.23',
    ],
  },
  {
    label: 'VIII - SAUVEGARDES',
    controls: [
      'A.8.13', 'A.8.14',
    ],
  },
  {
    label: 'IX - SÉCURITÉ PHYSIQUE',
    controls: [
      'A.7.1', 'A.7.2', 'A.7.3', 'A.7.4', 'A.7.5', 'A.7.6', 'A.7.7', 'A.7.8', 'A.7.9', 'A.7.10', 'A.7.11', 'A.7.12', 'A.7.13', 'A.7.14',
    ],
  },
];

const STATUS_OPTIONS = [
  { value: 'yes', label: 'Oui', icon: <CheckCircleIcon className="w-5 h-5 text-green-600 inline" /> },
  { value: 'partial', label: 'En cours', icon: <ExclamationTriangleIcon className="w-5 h-5 text-yellow-600 inline" /> },
  { value: 'no', label: 'Non', icon: <ExclamationTriangleIcon className="w-5 h-5 text-red-600 inline" /> },
];

export default function ISO27001() {
  const [answers, setAnswers] = useState({});
  const [expanded, setExpanded] = useState({});
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [showResults, setShowResults] = useState(false);

  // Progress calculation
  const total = CATEGORIES.reduce((sum, cat) => sum + cat.controls.length, 0);
  const completed = Object.values(answers).filter(a => a && a.status === 'yes').length;
  const percent = total ? Math.round((completed / total) * 100) : 0;

  // Per-category stats
  const categoryStats = CATEGORIES.map(cat => {
    const catTotal = cat.controls.length;
    const catCompleted = cat.controls.filter(controlNum => {
      const key = cat.label + '-' + controlNum;
      return answers[key] && answers[key].status === 'yes';
    }).length;
    return { label: cat.label, total: catTotal, completed: catCompleted, percent: catTotal ? Math.round((catCompleted / catTotal) * 100) : 0 };
  });

  const handleStatus = (key, status) => {
    setAnswers(a => ({ ...a, [key]: { ...a[key], status } }));
  };
  const handleComment = (key, comment) => {
    setAnswers(a => ({ ...a, [key]: { ...a[key], comment } }));
  };
  const toggleExpand = key => {
    setExpanded(e => ({ ...e, [key]: !e[key] }));
  };

  // Enhanced PDF export
  const handleExportPDF = async () => {
    const doc = new jsPDF({ unit: 'pt', format: 'a4' });
    let y = 40;
    // Try to add logo centered
    const logoUrl = '/logo.png';
    let logoHeight = 0;
    try {
      const img = new window.Image();
      img.src = logoUrl;
      await new Promise(resolve => { img.onload = resolve; });
      const logoW = 80, logoH = 80;
      doc.addImage(img, 'PNG', (doc.internal.pageSize.getWidth() - logoW) / 2, y, logoW, logoH);
      y += logoH + 10;
      logoHeight = logoH;
    } catch {
      y += 10;
    }
    // Title centered
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(24);
    doc.setTextColor('#1e3a8a');
    doc.text('Auto-évaluation ISO 27001 - Annexe A', doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 30;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(13);
    doc.setTextColor('#0e172a');
    doc.text(`Date: ${new Date().toLocaleDateString()}`, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 18;
    doc.text(`Progression: ${percent}% (${completed}/${total} conformes)`, doc.internal.pageSize.getWidth() / 2, y, { align: 'center' });
    y += 18;
    // Progress bar (rounded, gradient effect)
    const barX = (doc.internal.pageSize.getWidth() - 250) / 2;
    doc.setFillColor('#e5e7eb');
    doc.roundedRect(barX, y, 250, 16, 8, 8, 'F');
    doc.setFillColor('#facc15');
    doc.roundedRect(barX, y, 2.5 * percent, 16, 8, 8, 'F');
    y += 40;
    // For each category, add a styled table
    CATEGORIES.forEach(cat => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(16);
      doc.setTextColor('#1e3a8a');
      doc.text(cat.label, 40, y);
      y += 10;
      // Prepare table data
      const tableData = cat.controls.map(controlNum => {
        const control = ISO_CONTROLS[controlNum] || { title: 'Contrôle inconnu', description: '' };
        const key = cat.label + '-' + controlNum;
        const answer = answers[key] || {};
        // Status badge as colored text
        let statusLabel = answer.status ? STATUS_OPTIONS.find(opt => opt.value === answer.status)?.label : 'Non renseigné';
        let statusColor = '#e5e7eb';
        let statusTextColor = '#1e293b';
        if (answer.status === 'yes') { statusColor = '#22c55e'; statusTextColor = '#fff'; }
        else if (answer.status === 'partial') { statusColor = '#facc15'; statusTextColor = '#fff'; }
        else if (answer.status === 'no') { statusColor = '#ef4444'; statusTextColor = '#fff'; }
        return [
          controlNum,
          control.title,
          { content: statusLabel, styles: { fillColor: statusColor, textColor: statusTextColor, fontStyle: 'bold', halign: 'center', cellPadding: { top: 4, bottom: 4 } } },
          answer.comment || ''
        ];
      });
      // Table headers
      const head = [['Numéro', 'Contrôle', 'Statut', 'Commentaire']];
      // Use autoTable (call as a function, not as a method)
      autoTable(doc, {
        head,
        body: tableData,
        startY: y,
        theme: 'grid',
        headStyles: { fillColor: [30, 64, 175], textColor: 255, fontStyle: 'bold', halign: 'center' },
        styles: { font: 'helvetica', fontSize: 10, cellPadding: 4 },
        bodyStyles: {
          valign: 'top',
          lineColor: [226, 232, 240],
          lineWidth: 0.1,
        },
        alternateRowStyles: { fillColor: [243, 244, 246] },
        margin: { left: 30, right: 30 },
        didDrawPage: function (data) {
          // Footer
          const pageCount = doc.internal.getNumberOfPages();
          doc.setFontSize(9);
          doc.setTextColor('#64748b');
          doc.text(`Page ${doc.internal.getCurrentPageInfo().pageNumber} / ${pageCount}`, doc.internal.pageSize.getWidth() / 2, doc.internal.pageSize.getHeight() - 20, { align: 'center' });
          doc.text(`Exporté le ${new Date().toLocaleDateString()} - www.votre-site.com`, doc.internal.pageSize.getWidth() - 30, doc.internal.pageSize.getHeight() - 20, { align: 'right' });
        },
      });
      y = doc.lastAutoTable.finalY + 20;
      if (y > doc.internal.pageSize.getHeight() - 80) { doc.addPage(); y = 40; }
    });
    doc.save('Auto-evaluation_ISO27001.pdf');
  };

  // Navigation
  const prevCategory = () => setCurrentCategoryIndex(i => Math.max(i - 1, 0));
  const nextCategory = () => setCurrentCategoryIndex(i => Math.min(i + 1, CATEGORIES.length - 1));

  const currentCategory = CATEGORIES[currentCategoryIndex];

  // French translations
  const statusLabels = {
    yes: 'Oui',
    partial: 'En cours',
    no: 'Non',
    '': 'Non renseigné',
  };

  // UI
  if (showResults) {
    return (
      <section className="max-w-4xl mx-auto p-6">
        <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-2"><EyeIcon className="w-8 h-8 text-blue-700" /> Résultats de l’auto-évaluation ISO 27001</h1>
        <div className="mb-6">
          <div className="flex items-center gap-4 mb-2">
            <span className="font-semibold text-blue-900">Progression :</span>
            <div className="flex-1 h-4 bg-blue-100 rounded-full overflow-hidden">
              <div className="h-4 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400" style={{ width: percent + '%' }}></div>
            </div>
            <span className="font-semibold text-blue-900">{percent}%</span>
          </div>
          <div className="text-blue-900 font-semibold mb-2">{completed} contrôles conformes sur {total}</div>
        </div>
        <div className="mb-8">
          <table className="min-w-full text-xs bg-white rounded shadow border">
            <thead>
              <tr className="bg-blue-100 text-blue-900">
                <th className="px-3 py-2 text-left font-semibold">Catégorie</th>
                <th className="px-3 py-2 text-left font-semibold">Conformes</th>
                <th className="px-3 py-2 text-left font-semibold">Total</th>
                <th className="px-3 py-2 text-left font-semibold">% Conforme</th>
              </tr>
            </thead>
            <tbody>
              {categoryStats.map(stat => (
                <tr key={stat.label} className="border-b last:border-0 hover:bg-blue-50/40 transition">
                  <td className="px-3 py-2 font-medium text-blue-900">{stat.label}</td>
                  <td className="px-3 py-2">{stat.completed}</td>
                  <td className="px-3 py-2">{stat.total}</td>
                  <td className="px-3 py-2">{stat.percent}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-8 flex gap-4">
          <button className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded font-semibold shadow flex items-center gap-2" onClick={handleExportPDF}>
            <DocumentArrowDownIcon className="w-5 h-5" /> Exporter l’auto-évaluation
          </button>
        </div>
      </section>
    );
  }

  return (
    <section className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-blue-900 mb-2 flex items-center gap-2"><EyeIcon className="w-8 h-8 text-blue-700" /> ISO 27001 - Annexe A Contrôles</h1>
      <p className="mb-6 text-blue-800">Auto-évaluez votre conformité avec les contrôles de l’annexe A de la norme ISO 27001:2022. Utilisez cette checklist pour préparer un audit, identifier les écarts, et documenter vos progrès.</p>
      <div className="mb-6">
        <div className="flex items-center gap-4 mb-2">
          <span className="font-semibold text-blue-900">Progression :</span>
          <div className="flex-1 h-4 bg-blue-100 rounded-full overflow-hidden">
            <div className="h-4 bg-gradient-to-r from-green-400 via-yellow-400 to-red-400" style={{ width: percent + '%' }}></div>
          </div>
          <span className="font-semibold text-blue-900">{percent}%</span>
        </div>
        <div className="flex items-center gap-4 mt-2">
          <span className="text-blue-900 font-semibold">Catégorie {currentCategoryIndex + 1} / {CATEGORIES.length}</span>
          <span className="text-blue-700">{currentCategory.label}</span>
        </div>
      </div>
      {/* Only show the current category */}
      <div className="bg-blue-50 rounded-xl shadow p-4 mb-8">
        <h2 className="text-xl font-bold text-blue-800 mb-2">{currentCategory.label}</h2>
        <table className="min-w-full text-xs bg-white rounded shadow border">
          <thead>
            <tr className="bg-blue-100 text-blue-900">
              <th className="px-3 py-2 text-left font-semibold">Numéro</th>
              <th className="px-3 py-2 text-left font-semibold">Contrôle</th>
              <th className="px-3 py-2 text-left font-semibold">Statut</th>
              <th className="px-3 py-2"></th>
            </tr>
          </thead>
          <tbody>
            {currentCategory.controls.map(controlNum => {
              const control = ISO_CONTROLS[controlNum] || { title: 'Contrôle inconnu', description: '' };
              const key = currentCategory.label + '-' + controlNum;
              const answer = answers[key] || {};
              return (
                <React.Fragment key={controlNum}>
                  <tr className="border-b last:border-0 hover:bg-blue-50/40 transition">
                    <td className="px-3 py-2 font-medium text-blue-900">{controlNum}</td>
                    <td className="px-3 py-2">
                      <div className="font-semibold text-blue-900">{control.title}</div>
                      {expanded[key] && (
                        <div className="text-xs text-blue-700 mt-1">{control.description}</div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex gap-2">
                        {STATUS_OPTIONS.map(opt => (
                          <button
                            key={opt.value}
                            className={`px-2 py-1 rounded font-semibold flex items-center gap-1 border ${answer.status === opt.value ? 'bg-blue-700 text-white border-blue-700' : 'bg-white text-blue-900 border-blue-200'}`}
                            onClick={() => handleStatus(key, opt.value)}
                            type="button"
                          >
                            {opt.icon} {statusLabels[opt.value]}
                          </button>
                        ))}
                      </div>
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button type="button" className="text-blue-700 hover:text-yellow-500" onClick={() => toggleExpand(key)}>
                        {expanded[key] ? <ChevronUpIcon className="w-5 h-5" /> : <ChevronDownIcon className="w-5 h-5" />}
                      </button>
                    </td>
                  </tr>
                  {expanded[key] && (
                    <tr>
                      <td colSpan={4} className="bg-blue-50 px-3 py-2">
                        <textarea
                          className="w-full rounded border px-3 py-2 text-xs"
                          placeholder="Commentaires, preuves, actions..."
                          value={answer.comment || ''}
                          onChange={e => handleComment(key, e.target.value)}
                        />
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              );
            })}
          </tbody>
        </table>
      </div>
      {/* Navigation buttons */}
      <div className="flex gap-4 justify-between mt-4">
        <button
          className="bg-blue-100 text-blue-900 px-6 py-2 rounded font-semibold shadow flex items-center gap-2"
          onClick={prevCategory}
          disabled={currentCategoryIndex === 0}
        >
          Précédent
        </button>
        {currentCategoryIndex < CATEGORIES.length - 1 ? (
          <button
            className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded font-semibold shadow flex items-center gap-2"
            onClick={nextCategory}
          >
            Suivant
          </button>
        ) : (
          <button
            className="bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 hover:from-blue-700 hover:to-yellow-400 text-white px-6 py-2 rounded font-semibold shadow flex items-center gap-2"
            onClick={() => setShowResults(true)}
          >
            Terminer
          </button>
        )}
      </div>
    </section>
  );
} 