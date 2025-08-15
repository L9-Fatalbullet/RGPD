import React, { useEffect, useState } from 'react';
import { CheckCircleIcon, XCircleIcon, ArrowRightCircleIcon, SparklesIcon, ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../App';
import confetti from 'canvas-confetti';

const API_BASE = 'https://psychic-giggle-j7g46xjg9r52gr7-4000.app.github.dev';

export default function Progress() {
  const { token, user, logout } = useAuth();
  const [progressionData, setProgressionData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expanded, setExpanded] = useState(null);

  // Fetch progression data from backend
  useEffect(() => {
    if (!token) return;
    setLoading(true);
    setError(null);
    fetch(`${API_BASE}/api/progression`, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then(async r => {
        if (r.status === 401 || r.status === 403) { logout(); throw new Error('Session expirée, veuillez vous reconnecter.'); }
        if (!r.ok) throw new Error('Erreur serveur');
        return r.json();
      })
      .then(data => {
        setProgressionData(data);
        setLoading(false);
      })
      .catch(e => {
        setError(e.message || 'Erreur de connexion au serveur. Vérifiez votre connexion ou réessayez plus tard.');
        setLoading(false);
      });
  }, [token, logout]);

  // Progress calculation from enhanced data
  const steps = progressionData?.steps || [];
  const completed = progressionData?.completedSteps || 0;
  const percent = progressionData?.overallProgress || 0;
  const nextSteps = progressionData?.nextSteps || [];
  const recentActivity = progressionData?.recentActivity || [];
  const allComplete = steps.length > 0 && completed === steps.length;

  // Confetti animation effect
  useEffect(() => {
    if (allComplete) {
      confetti({
        particleCount: 120,
        spread: 80,
        origin: { y: 0.6 },
        colors: ['#facc15', '#2563eb', '#fff', '#22c55e'],
      });
    }
  }, [allComplete]);

  // Handle sub-task check/uncheck
  const handleCheck = async (stepIdx, subIdx) => {
    if (!token) return;
    const step = steps[stepIdx];
    const subTask = step.subTasks[subIdx];
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`${API_BASE}/api/progression`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ step: step.step, subTask: subIdx, completed: !subTask.completed })
      });
      if (res.status === 401 || res.status === 403) { logout(); throw new Error('Session expirée, veuillez vous reconnecter.'); }
      if (!res.ok) throw new Error('Erreur serveur');
      const updated = await res.json();
      setProgressionData(updated); // Update the state with the new data
    } catch (e) {
      setError(e.message || 'Erreur lors de la mise à jour.');
    }
    setLoading(false);
  };

  if (loading) return <div className="text-blue-900 font-semibold p-8">Chargement...</div>;
  if (error) return <div className="text-red-600 font-semibold p-8">{error}</div>;

  return (
    <section>
      {/* Hero/Intro Section */}
      <div className="relative overflow-hidden rounded-2xl mb-10 shadow-lg bg-gradient-to-br from-blue-900 via-blue-700 to-yellow-400 text-white p-8 flex flex-col md:flex-row items-center gap-8 animate-fade-in">
        <div className="flex-1">
          <h1 className="text-3xl md:text-4xl font-extrabold mb-2 tracking-tight drop-shadow flex items-center gap-2">
            <SparklesIcon className="w-10 h-10 text-yellow-300" /> Progression conformité
          </h1>
          <p className="text-lg md:text-xl font-light mb-4 drop-shadow">Suivez votre avancement dans la mise en conformité Loi 09-08.</p>
        </div>
        <div className="flex-1 flex justify-center items-center">
          {/* Moroccan-inspired SVG */}
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="70" cy="70" r="60" fill="#fff" fillOpacity="0.12" />
            <circle cx="70" cy="70" r="40" fill="#fff" fillOpacity="0.10" />
            <path d="M70 30 L90 70 L50 70 Z" fill="#2563eb" fillOpacity="0.7" />
            <circle cx="70" cy="70" r="14" fill="#facc15" fillOpacity="0.8" />
            <text x="70" y="77" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#1e293b">CNDP</text>
          </svg>
        </div>
      </div>
        {/* Progress Overview Cards */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-blue-900 mb-2">{percent}%</div>
            <div className="text-gray-600 text-sm">Progression globale</div>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{completed}</div>
            <div className="text-gray-600 text-sm">Étapes terminées</div>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-yellow-600 mb-2">{steps.length - completed}</div>
            <div className="text-gray-600 text-sm">Étapes restantes</div>
          </div>
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{recentActivity.length}</div>
            <div className="text-gray-600 text-sm">Actions récentes</div>
          </div>
        </div>

        {/* Automated Progression Guide */}
        <div className="mb-8 animate-fade-in">
          <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
            <SparklesIcon className="w-6 h-6 text-yellow-500" />
            Comment la progression s'actualise automatiquement
          </h3>
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-semibold text-blue-900 mb-3">Actions qui débloquent automatiquement :</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span><strong>Créer une DPIA</strong> → Étape 4 "Réaliser la DPIA"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span><strong>Soumettre une évaluation</strong> → Étape 1 "Identifier les activités"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span><strong>Ajouter un traitement</strong> → Étape 2 "Créer le registre"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span><strong>Évaluer ISO 27001</strong> → Étape 5 "Mesures de sécurité"</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4 text-green-600" />
                    <span><strong>Ajouter un utilisateur</strong> → Étape 6 "Former le personnel"</span>
                  </div>
                </div>
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-3">Avantages du système automatique :</h4>
                <div className="space-y-2 text-sm text-gray-700">
                  <div>✅ <strong>Pas de saisie manuelle</strong> - La progression se met à jour en temps réel</div>
                  <div>✅ <strong>Traçabilité complète</strong> - Historique automatique des actions</div>
                  <div>✅ <strong>Motivation continue</strong> - Voir sa progression s'améliorer</div>
                  <div>✅ <strong>Conformité facilitée</strong> - Suivi automatique des obligations</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Activity Section */}
        {recentActivity.length > 0 && (
          <div className="mb-8 animate-fade-in">
            <h3 className="text-xl font-bold text-blue-900 mb-4 flex items-center gap-2">
              <SparklesIcon className="w-6 h-6 text-yellow-500" />
              Activité récente (Progression automatique)
            </h3>
            <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-6">
              <div className="space-y-3">
                {recentActivity.map((activity, idx) => (
                  <div key={idx} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg border border-green-200">
                    <CheckCircleIcon className="w-5 h-5 text-green-600 flex-shrink-0" />
                    <div className="flex-1">
                      <div className="font-medium text-green-800">{activity.title}</div>
                      <div className="text-sm text-green-600">
                        Terminé le {new Date(activity.completedAt).toLocaleDateString('fr-FR')}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                <div className="text-sm text-blue-800">
                  <strong>💡 Progression automatique :</strong> Votre progression est mise à jour automatiquement 
                  lorsque vous créez des DPIAs, soumettez des évaluations, ou ajoutez des utilisateurs.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Next Recommended Action Card */}
      {!allComplete && nextSteps.length > 0 && (
        <div className="mb-6 animate-fade-in">
          <div className="bg-white/90 backdrop-blur rounded-xl shadow-lg p-6 flex items-center gap-4 border-l-4 border-yellow-400">
            <ArrowRightCircleIcon className="w-8 h-8 text-yellow-400 animate-bounce" />
            <div className="flex-1">
              <div className="font-bold text-blue-900 text-lg mb-1">Prochaine étape recommandée</div>
              <div className="text-gray-700 text-sm mb-2">{nextSteps[0].title}</div>
              <div className="text-gray-600 text-xs mb-2">Complétez toutes les sous-tâches pour débloquer l'étape suivante.</div>
            </div>
          </div>
        </div>
      )}
      {allComplete && (
        <div className="mb-6 animate-fade-in">
          <div className="bg-green-50 border-l-4 border-green-400 p-6 rounded-xl shadow-lg flex items-center gap-4">
            <CheckCircleIcon className="w-8 h-8 text-green-500 animate-pulse" />
            <div className="flex-1 text-green-700 font-semibold">Félicitations ! Vous avez complété toutes les étapes de conformité.</div>
          </div>
        </div>
      )}
      {/* Confetti animation placeholder */}
      {allComplete && <div id="confetti-placeholder" className="fixed inset-0 pointer-events-none z-50"></div>}
      {/* Progress Bar with Steps */}
      <div className="mb-8 animate-fade-in relative">
        <div className="flex items-center gap-4 mb-2">
          <div className="font-semibold text-blue-900">Progression : {percent}%</div>
          <div className="flex-1 h-4 bg-blue-100 rounded-full overflow-hidden relative">
            <div className="h-4 bg-gradient-to-r from-yellow-400 via-blue-700 to-blue-900 rounded-full transition-all duration-700" style={{ width: percent + '%' }}></div>
            {/* Step markers */}
            {steps.map((s, i) => (
              <div key={s.step} className="absolute top-1/2 -translate-y-1/2" style={{ left: `calc(${(i / (steps.length - 1)) * 100}% - 12px)` }}>
                <div className={`rounded-full bg-white shadow-lg border-2 ${s.completed ? 'border-green-400' : 'border-blue-200'} flex items-center justify-center w-7 h-7 transition-all duration-300`}>
                  {s.completed ? <CheckCircleIcon className="w-5 h-5 text-green-500" /> : <XCircleIcon className="w-5 h-5 text-yellow-500" />}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* Stepper with Sub-Tasks */}
      <ol className="space-y-4 animate-fade-in">
        {steps.map((s, i) => (
          <li key={s.step} className={`bg-white/80 backdrop-blur rounded-xl shadow-lg p-6 border-t-4 ${s.completed ? 'border-green-300' : 'border-blue-100'} hover:scale-[1.01] transition group`}> 
            <div className="flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(expanded === i ? null : i)}>
              <span className="transition-transform group-hover:scale-110">
                {s.completed ? <CheckCircleIcon className="w-8 h-8 text-green-600" /> : <XCircleIcon className="w-8 h-8 text-yellow-500" />}
              </span>
              <div className="flex-1">
                <div className="font-bold text-blue-900 text-lg mb-1 flex items-center gap-2">
                  {s.title}
                  {s.completed && <span className="ml-2 px-2 py-0.5 rounded-full bg-green-100 text-green-700 text-xs font-semibold animate-fade-in">Terminé</span>}
                </div>
                <div className="text-gray-700 text-sm mb-2">{s.completedAt && `Terminé le : ${new Date(s.completedAt).toLocaleDateString('fr-FR')}`}</div>
              </div>
              {expanded === i ? <ChevronUpIcon className="w-6 h-6 text-blue-900" /> : <ChevronDownIcon className="w-6 h-6 text-blue-900" />}
            </div>
            {expanded === i && (
              <>
                <ul className="mt-4 space-y-2">
                  {s.subTasks.map((st, j) => (
                    <li key={j} className="flex items-center gap-3">
                      <button
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center transition ${st.completed ? 'bg-green-400 border-green-500' : 'bg-white border-blue-300'}`}
                        aria-label={st.label}
                        onClick={() => handleCheck(i, j)}
                        disabled={s.completed}
                      >
                        {st.completed ? <CheckCircleIcon className="w-4 h-4 text-white" /> : null}
                      </button>
                      <span className={`text-sm ${st.completed ? 'line-through text-gray-400' : 'text-blue-900'}`}>{st.label}</span>
                    </li>
                  ))}
                </ul>
                {s.documents && s.documents.length > 0 && (
                  <div className="mt-6">
                    <div className="font-semibold text-blue-900 mb-2">Documents utiles :</div>
                    <ul className="space-y-2">
                      {s.documents.map((doc, k) => (
                        <li key={k}>
                          <a
                            href={doc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center text-blue-700 hover:underline text-sm font-semibold group-hover:text-yellow-500 transition"
                          >
                            {doc.label}
                          </a>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </>
            )}
          </li>
        ))}
      </ol>
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: none; } }
        .animate-fade-in { animation: fade-in 0.7s cubic-bezier(.4,0,.2,1) both; }
      `}</style>
    </section>
  );
} 