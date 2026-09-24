import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { BookOpen, Plus, Edit2, Trash2, ChevronRight, GripVertical, Users, CheckSquare, FileText, Check, X, Search, CheckCircle, AlertTriangle, Eye } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { useNavigate } from 'react-router-dom';
import { ImageUpload } from '../../../components/ui/ImageUpload';

interface Module {
  id: string;
  titre: string;
  description: string;
  icone: string;
  coverImage?: string;
  ordre: number;
  actif: boolean;
  lessons: any[];
}

interface UserStats {
  completedLessons: number;
  totalLessons: number;
  progressionPct: number;
  activeLesson: string;
}

interface QuizAttempt {
  id: string;
  lessonId: string;
  lessonTitre: string;
  score: number;
  passed: boolean;
  attemptNum: number;
  createdAt: string;
}

interface HomeworkSubmission {
  id: string;
  lessonId: string;
  lessonTitre: string;
  statut: 'submitted' | 'reviewed' | 'rejected';
  feedback: string | null;
  createdAt: string;
  contenu: string;
}

interface UserProgress {
  id: string;
  fullName: string;
  email: string;
  plan: string;
  stats: UserStats;
  quizAttempts: QuizAttempt[];
  homeworkSubmissions: HomeworkSubmission[];
}

interface PendingHomework {
  id: string;
  lessonId: string;
  userId: string;
  contenu: string;
  statut: 'submitted';
  createdAt: string;
  full_name: string;
  email: string;
  lesson_titre: string;
  module_titre: string;
}

export const AdminAcademyPage = () => {
  const [activeTab, setActiveTab] = useState<'modules' | 'users' | 'devoirs'>('modules');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingModule, setEditingModule] = useState<Module | null>(null);
  const [coverImage, setCoverImage] = useState('');
  const [selectedUser, setSelectedUser] = useState<UserProgress | null>(null);
  const [feedbackTexts, setFeedbackTexts] = useState<Record<string, string>>({});
  const [userSearchQuery, setUserSearchQuery] = useState('');
  
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  useEffect(() => {
    setCoverImage(editingModule?.coverImage || '');
  }, [editingModule]);

  // Queries
  const { data: modules = [], isLoading: isLoadingModules } = useQuery<Module[]>({
    queryKey: ['admin-modules'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/formation/modules');
      return data.data;
    }
  });

  const { data: usersProgress = [], isLoading: isLoadingUsers } = useQuery<UserProgress[]>({
    queryKey: ['admin-users-progress'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/formation/users-progress');
      return data.data;
    },
    enabled: activeTab === 'users'
  });

  const { data: pendingHomeworks = [], isLoading: isLoadingHomeworks } = useQuery<PendingHomework[]>({
    queryKey: ['admin-pending-homeworks'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/formation/devoirs/pending');
      return data.data;
    },
    enabled: activeTab === 'devoirs'
  });

  // Mutations
  const saveModule = useMutation({
    mutationFn: async (moduleData: Partial<Module>) => {
      if (editingModule) {
        return api.put(`/api/admin/formation/modules/${editingModule.id}`, moduleData);
      }
      return api.post('/api/admin/formation/modules', moduleData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      addToast(`Module ${editingModule ? 'modifié' : 'créé'} avec succès.`, 'success');
      setIsModalOpen(false);
      setEditingModule(null);
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Une erreur est survenue', 'error');
    }
  });

  const deleteModule = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/api/admin/formation/modules/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      addToast('Module supprimé avec succès.', 'success');
    }
  });

  const reviewHomework = useMutation({
    mutationFn: async ({ id, statut, feedback }: { id: string; statut: 'reviewed' | 'rejected'; feedback: string }) => {
      return api.patch(`/api/admin/formation/devoirs/${id}/review`, { statut, feedback });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-pending-homeworks'] });
      queryClient.invalidateQueries({ queryKey: ['admin-users-progress'] });
      addToast('Devoir corrigé avec succès.', 'success');
    },
    onError: (error: any) => {
      addToast(error.response?.data?.error || 'Une erreur est survenue', 'error');
    }
  });

  const handleOpenModal = (module?: Module) => {
    if (module) {
      setEditingModule(module);
    } else {
      setEditingModule(null);
    }
    setIsModalOpen(true);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    saveModule.mutate({
      titre: formData.get('titre') as string,
      description: formData.get('description') as string,
      cover_image: coverImage || null,
      ordre: Number(formData.get('ordre')),
      actif: formData.get('actif') === 'on'
    } as any);
  };

  const handleHomeworkReviewSubmit = (id: string, statut: 'reviewed' | 'rejected') => {
    const feedback = feedbackTexts[id] || '';
    if (statut === 'rejected' && feedback.trim().length < 5) {
      addToast('Un feedback d\'au moins 5 caractères est requis pour rejeter un devoir.', 'error');
      return;
    }
    reviewHomework.mutate({ id, statut, feedback });
  };

  const filteredUsers = usersProgress.filter(u => 
    u.fullName.toLowerCase().includes(userSearchQuery.toLowerCase()) ||
    u.email.toLowerCase().includes(userSearchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <BookOpen className="text-loss" size={32} />
            Gestion Academy
          </h1>
          <p className="text-txt-2 mt-2">Suivez l'évolution des étudiants, corrigez les devoirs et gérez le contenu de la formation.</p>
        </div>

        {activeTab === 'modules' && (
          <button
            onClick={() => handleOpenModal()}
            className="flex items-center justify-center gap-2 bg-loss text-white px-5 py-2.5 rounded-xl font-bold hover:bg-loss/90 transition-colors shadow-lg shadow-loss/20"
          >
            <Plus size={20} />
            Nouveau Module
          </button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex border-b border-border gap-1.5 p-1 bg-surface/50 rounded-xl max-w-lg">
        <button
          onClick={() => setActiveTab('modules')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'modules' 
              ? 'bg-loss text-white' 
              : 'text-txt-2 hover:bg-elevated hover:text-txt'
          }`}
        >
          <BookOpen size={14} />
          Modules & Leçons
        </button>
        <button
          onClick={() => setActiveTab('users')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'users' 
              ? 'bg-loss text-white' 
              : 'text-txt-2 hover:bg-elevated hover:text-txt'
          }`}
        >
          <Users size={14} />
          Suivi des Élèves
        </button>
        <button
          onClick={() => setActiveTab('devoirs')}
          className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg text-xs font-bold transition-all ${
            activeTab === 'devoirs' 
              ? 'bg-loss text-white' 
              : 'text-txt-2 hover:bg-elevated hover:text-txt'
          }`}
        >
          <CheckSquare size={14} />
          Devoirs en Attente
          {pendingHomeworks.length > 0 && (
            <span className="bg-white text-loss text-[10px] font-black rounded-full px-1.5 py-0.5 ml-1 animate-pulse">
              {pendingHomeworks.length}
            </span>
          )}
        </button>
      </div>

      {/* TAB 1: MODULES */}
      {activeTab === 'modules' && (
        <>
          {isLoadingModules ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loss"></div>
            </div>
          ) : (
            <div className="grid gap-4">
              {modules.map((module) => (
                <div key={module.id} className="bg-surface border border-border rounded-xl p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-loss/50 transition-colors">
                  <div className="flex items-center gap-4 flex-1">
                    <div className="text-txt-3 cursor-grab hover:text-txt hidden sm:block">
                      <GripVertical size={24} />
                    </div>
                    
                    <div className="w-12 h-12 rounded-xl bg-elevated flex items-center justify-center text-2xl shrink-0 border border-border">
                      {module.icone}
                    </div>
                    
                    <div>
                      <h3 className="font-bold text-lg flex items-center gap-2">
                        {module.titre}
                        {!module.actif && (
                          <span className="text-[10px] px-2 py-0.5 bg-loss/10 text-loss rounded font-bold uppercase tracking-wider">Inactif</span>
                        )}
                      </h3>
                      <p className="text-sm text-txt-2 line-clamp-1">{module.description}</p>
                      <div className="text-xs text-txt-3 mt-1 font-medium">
                        {module.lessons?.length || 0} leçon(s) • Ordre: {module.ordre}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 justify-end pt-2 sm:pt-0 border-t border-border/20 sm:border-none">
                    <button
                      onClick={() => handleOpenModal(module)}
                      className="p-2 text-txt-2 hover:text-loss bg-elevated hover:bg-loss/10 rounded-lg transition-colors"
                      title="Modifier le module"
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => {
                        if (window.confirm('Voulez-vous vraiment supprimer ce module et toutes ses leçons ?')) {
                          deleteModule.mutate(module.id);
                        }
                      }}
                      className="p-2 text-txt-2 hover:text-loss bg-elevated hover:bg-loss/10 rounded-lg transition-colors"
                      title="Supprimer le module"
                    >
                      <Trash2 size={16} />
                    </button>
                    <button
                      onClick={() => navigate(`/admin/academy/${module.id}`)}
                      className="flex items-center gap-1 px-3 py-2 bg-loss/10 text-loss hover:bg-loss hover:text-white rounded-lg transition-all font-bold text-xs"
                      title="Gérer les leçons"
                    >
                      Leçons
                      <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              ))}

              {modules.length === 0 && (
                <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
                  <BookOpen size={48} className="mx-auto text-txt-3 mb-4 animate-bounce" />
                  <h3 className="text-lg font-bold text-txt">Aucun module</h3>
                  <p className="text-txt-2 mt-1">Commencez par créer votre premier module de formation.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* TAB 2: SUIVI DES ELEVES (EVOLUTION) */}
      {activeTab === 'users' && (
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
            <input
              type="text"
              placeholder="Rechercher un élève par nom ou email..."
              value={userSearchQuery}
              onChange={(e) => setUserSearchQuery(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-loss transition-colors text-txt"
            />
          </div>

          {isLoadingUsers ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loss"></div>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full border-collapse text-left text-sm">
                <thead>
                  <tr className="border-b border-border bg-elevated/50 text-txt-3 font-semibold">
                    <th className="p-4">Élève</th>
                    <th className="p-4">Plan</th>
                    <th className="p-4">Progression</th>
                    <th className="p-4">Dernière Activité</th>
                    <th className="p-4 text-center">Quiz</th>
                    <th className="p-4 text-center">Devoirs</th>
                    <th className="p-4 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/40">
                  {filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-elevated/20 transition-colors">
                      {/* Name/Email */}
                      <td className="p-4">
                        <div className="font-bold text-txt">{user.fullName}</div>
                        <div className="text-xs text-txt-3">{user.email}</div>
                      </td>
                      {/* Plan */}
                      <td className="p-4">
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded capitalize ${
                          user.plan === 'pro' || user.plan === 'vip' 
                            ? 'bg-win/10 text-win border border-win/20' 
                            : 'bg-txt-3/10 text-txt-2 border border-border'
                        }`}>
                          {user.plan}
                        </span>
                      </td>
                      {/* Progress bar */}
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-border/40 rounded-full h-2 overflow-hidden">
                            <div 
                              className="bg-loss h-full rounded-full transition-all duration-500" 
                              style={{ width: `${user.stats.progressionPct}%` }}
                            />
                          </div>
                          <span className="font-bold text-xs">{user.stats.progressionPct}%</span>
                          <span className="text-[10px] text-txt-3">({user.stats.completedLessons}/{user.stats.totalLessons})</span>
                        </div>
                      </td>
                      {/* Active lesson */}
                      <td className="p-4 max-w-xs truncate text-txt-2" title={user.stats.activeLesson}>
                        {user.stats.activeLesson}
                      </td>
                      {/* Quiz Count */}
                      <td className="p-4 text-center font-semibold text-xs text-txt-2">
                        {user.quizAttempts.length} tentative(s)
                      </td>
                      {/* Homework Count */}
                      <td className="p-4 text-center">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-bold ${
                          user.homeworkSubmissions.length > 0 
                            ? 'bg-accent/10 text-accent border border-accent/20' 
                            : 'text-txt-3'
                        }`}>
                          {user.homeworkSubmissions.length} soumis
                        </span>
                      </td>
                      {/* Actions */}
                      <td className="p-4 text-center">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-elevated hover:bg-border text-txt rounded-lg transition-colors font-bold text-xs border border-border"
                        >
                          <Eye size={12} />
                          Détails
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredUsers.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center p-12 text-txt-3">
                        Aucun élève trouvé.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: DEVOIRS EN ATTENTE */}
      {activeTab === 'devoirs' && (
        <>
          {isLoadingHomeworks ? (
            <div className="flex justify-center p-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loss"></div>
            </div>
          ) : (
            <div className="grid gap-6">
              {pendingHomeworks.map((homework) => (
                <div key={homework.id} className="bg-surface border border-border rounded-2xl p-6 space-y-4 hover:border-loss/40 transition-colors shadow-md relative">
                  <div className="absolute top-6 right-6 text-xs text-txt-3">
                    Soumis le : {new Date(homework.createdAt).toLocaleDateString()}
                  </div>

                  <div className="space-y-1">
                    <div className="text-[10px] font-bold text-loss uppercase tracking-wider">
                      {homework.module_titre}
                    </div>
                    <h3 className="text-lg font-black text-txt">
                      Devoir : {homework.lesson_titre}
                    </h3>
                    <div className="text-xs text-txt-2 flex items-center gap-2">
                      <span className="font-bold text-txt">{homework.full_name}</span>
                      <span className="text-txt-3">•</span>
                      <span>{homework.email}</span>
                    </div>
                  </div>

                  <div className="bg-elevated/40 border border-border/60 rounded-xl p-4 text-sm text-txt-2 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto font-mono">
                    {homework.contenu}
                  </div>

                  <div className="pt-2 space-y-3">
                    <label className="block text-xs font-bold text-txt-2">
                      Feedback de correction
                    </label>
                    <textarea
                      placeholder="Donnez votre feedback ici (requis en cas de rejet)..."
                      value={feedbackTexts[homework.id] || ''}
                      onChange={(e) => setFeedbackTexts(prev => ({ ...prev, [homework.id]: e.target.value }))}
                      rows={2}
                      className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-sm text-txt focus:outline-none focus:border-loss transition-colors resize-none"
                    />

                    <div className="flex gap-3 justify-end">
                      <button
                        onClick={() => handleHomeworkReviewSubmit(homework.id, 'rejected')}
                        disabled={reviewHomework.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold border border-loss text-loss hover:bg-loss hover:text-white rounded-xl transition-all disabled:opacity-50"
                      >
                        <X size={14} />
                        Rejeter le devoir
                      </button>
                      <button
                        onClick={() => handleHomeworkReviewSubmit(homework.id, 'reviewed')}
                        disabled={reviewHomework.isPending}
                        className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-win text-white hover:bg-win/90 rounded-xl transition-all shadow-lg shadow-win/25 disabled:opacity-50"
                      >
                        <Check size={14} />
                        Approuver & Valider
                      </button>
                    </div>
                  </div>
                </div>
              ))}

              {pendingHomeworks.length === 0 && (
                <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
                  <CheckCircle size={48} className="mx-auto text-win mb-4 animate-pulse" />
                  <h3 className="text-lg font-bold text-txt">Tout est corrigé !</h3>
                  <p className="text-txt-2 mt-1">Il n'y a aucune soumission de devoir en attente actuellement.</p>
                </div>
              )}
            </div>
          )}
        </>
      )}

      {/* MODAL: DETAILS ELEVE (EVOLUTION LOGS) */}
      {selectedUser && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface w-full max-w-4xl rounded-2xl border border-border overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-6 border-b border-border flex justify-between items-start">
              <div>
                <h2 className="text-xl font-black text-txt">{selectedUser.fullName}</h2>
                <p className="text-xs text-txt-3 mt-1">{selectedUser.email} • Plan {selectedUser.plan.toUpperCase()}</p>
              </div>
              <button 
                onClick={() => setSelectedUser(null)}
                className="p-1.5 text-txt-3 hover:text-txt hover:bg-elevated rounded-lg transition-all"
              >
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {/* Top stats grid */}
              <div className="grid grid-cols-3 gap-4">
                <div className="bg-elevated/40 border border-border/80 rounded-xl p-4 text-center">
                  <div className="text-[10px] font-bold text-txt-3 uppercase tracking-wider">Leçons Complétées</div>
                  <div className="text-2xl font-black text-loss mt-1">
                    {selectedUser.stats.completedLessons} <span className="text-sm font-normal text-txt-3">/ {selectedUser.stats.totalLessons}</span>
                  </div>
                </div>
                <div className="bg-elevated/40 border border-border/80 rounded-xl p-4 text-center">
                  <div className="text-[10px] font-bold text-txt-3 uppercase tracking-wider">Progression</div>
                  <div className="text-2xl font-black text-loss mt-1">{selectedUser.stats.progressionPct}%</div>
                </div>
                <div className="bg-elevated/40 border border-border/80 rounded-xl p-4 text-center">
                  <div className="text-[10px] font-bold text-txt-3 uppercase tracking-wider">Plan Actuel</div>
                  <div className="text-lg font-black text-win mt-2 capitalize">{selectedUser.plan}</div>
                </div>
              </div>

              {/* Quiz section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-txt flex items-center gap-2 border-b border-border pb-1">
                  <CheckSquare size={16} className="text-loss" />
                  Quiz Soumis ({selectedUser.quizAttempts.length})
                </h3>
                {selectedUser.quizAttempts.length > 0 ? (
                  <div className="border border-border/50 rounded-xl overflow-hidden bg-elevated/10">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="border-b border-border/50 bg-elevated/40 text-txt-3 font-bold">
                          <th className="p-3">Leçon</th>
                          <th className="p-3 text-center">Tentative</th>
                          <th className="p-3 text-center">Score</th>
                          <th className="p-3 text-center">Résultat</th>
                          <th className="p-3 text-right">Date</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border/30">
                        {selectedUser.quizAttempts.map(q => (
                          <tr key={q.id} className="hover:bg-elevated/10">
                            <td className="p-3 font-semibold">{q.lessonTitre}</td>
                            <td className="p-3 text-center font-mono">#{q.attemptNum}</td>
                            <td className="p-3 text-center font-bold font-mono">{q.score}%</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded font-black uppercase text-[8px] ${
                                q.passed 
                                  ? 'bg-win/10 text-win border border-win/20' 
                                  : 'bg-loss/10 text-loss border border-loss/20'
                              }`}>
                                {q.passed ? 'Réussi' : 'Échoué'}
                              </span>
                            </td>
                            <td className="p-3 text-right text-txt-3">
                              {new Date(q.createdAt).toLocaleDateString()}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <p className="text-xs text-txt-3 italic">Aucun quiz soumis pour le moment.</p>
                )}
              </div>

              {/* Homework section */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-txt flex items-center gap-2 border-b border-border pb-1">
                  <FileText size={16} className="text-loss" />
                  Devoirs Soumis ({selectedUser.homeworkSubmissions.length})
                </h3>
                {selectedUser.homeworkSubmissions.length > 0 ? (
                  <div className="space-y-4">
                    {selectedUser.homeworkSubmissions.map(h => (
                      <div key={h.id} className="border border-border/50 rounded-xl p-4 bg-elevated/15 space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="text-xs font-bold text-txt">{h.lessonTitre}</span>
                            <span className="text-[10px] text-txt-3 block mt-0.5">
                              Soumis le : {new Date(h.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <span className={`px-2.5 py-0.5 rounded font-bold uppercase text-[9px] tracking-wider ${
                            h.statut === 'reviewed' 
                              ? 'bg-win/15 text-win border border-win/30' 
                              : h.statut === 'rejected' 
                              ? 'bg-loss/15 text-loss border border-loss/30' 
                              : 'bg-accent/15 text-accent border border-accent/30'
                          }`}>
                            {h.statut === 'reviewed' ? 'Approuvé' : h.statut === 'rejected' ? 'Rejeté' : 'En attente'}
                          </span>
                        </div>
                        <div className="text-xs text-txt-2 bg-elevated/20 p-3 rounded-lg border border-border/40 font-mono">
                          {h.contenu}
                        </div>
                        {h.feedback && (
                          <div className="text-xs border-t border-border/30 pt-2 text-txt-3">
                            <span className="font-bold text-txt-2">Feedback : </span>
                            {h.feedback}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-txt-3 italic">Aucun devoir soumis pour le moment.</p>
                )}
              </div>
            </div>
            
            <div className="p-4 bg-elevated/20 border-t border-border flex justify-end">
              <button 
                onClick={() => setSelectedUser(null)}
                className="bg-loss text-white font-bold px-6 py-2 rounded-xl hover:bg-loss/90 transition-all text-xs"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal d'édition/création de module (Conserved existing modal) */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface w-full max-w-lg rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">{editingModule ? 'Modifier le Module' : 'Nouveau Module'}</h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-bold text-txt-2 mb-1">Titre du module</label>
                <input
                  name="titre"
                  defaultValue={editingModule?.titre}
                  required
                  className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-txt focus:outline-none focus:border-loss transition-colors"
                  placeholder="Ex: Les bases du trading"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-txt-2 mb-1">Description</label>
                <textarea
                  name="description"
                  defaultValue={editingModule?.description}
                  required
                  rows={3}
                  className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-txt focus:outline-none focus:border-loss transition-colors resize-none"
                  placeholder="Description du module..."
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-txt-2 mb-1">Image Cover du Module</label>
                <ImageUpload
                  value={coverImage}
                  onChange={setCoverImage}
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-txt-2 mb-1">Ordre</label>
                <input
                  name="ordre"
                  type="number"
                  min="1"
                  defaultValue={editingModule?.ordre || modules.length + 1}
                  required
                  className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-txt focus:outline-none focus:border-loss transition-colors"
                />
              </div>

              <div className="flex items-center gap-3 pt-2">
                <input
                  type="checkbox"
                  name="actif"
                  id="actif"
                  defaultChecked={editingModule ? editingModule.actif : true}
                  className="w-4 h-4 rounded border-border bg-elevated text-loss focus:ring-loss"
                />
                <label htmlFor="actif" className="text-sm font-bold text-txt">
                  Module actif (visible par les utilisateurs)
                </label>
              </div>

              <div className="flex gap-3 pt-6">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="flex-1 bg-elevated text-txt font-bold py-3 rounded-xl hover:bg-border transition-colors"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={saveModule.isPending}
                  className="flex-1 bg-loss text-white font-bold py-3 rounded-xl hover:bg-loss/90 transition-colors disabled:opacity-50"
                >
                  {saveModule.isPending ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAcademyPage;
