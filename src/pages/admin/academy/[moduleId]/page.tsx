import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Plus, Edit2, Trash2, GripVertical, FileText, CheckCircle2 } from 'lucide-react';
import api from '../../../../lib/api';
import { useToast } from '../../../../hooks/useToast';

interface Question {
  id: string;
  question: string;
  options: string[];
  reponseCorrecte: number;
  explication: string | null;
  ordre: number;
}

interface Lesson {
  id: string;
  titre: string;
  contenu: string;
  videoUrl?: string;
  ordre: number;
  actif: boolean;
  quizQuestions: Question[];
}

export const AdminLessonsPage = () => {
  const { moduleId } = useParams<{ moduleId: string }>();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const queryClient = useQueryClient();

  const [isLessonModalOpen, setIsLessonModalOpen] = useState(false);
  const [editingLesson, setEditingLesson] = useState<Lesson | null>(null);

  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [currentLessonForQuestion, setCurrentLessonForQuestion] = useState<string | null>(null);

  const { data: modules = [], isLoading } = useQuery({
    queryKey: ['admin-modules'],
    queryFn: async () => {
      const { data } = await api.get('/api/admin/formation/modules');
      return data.data;
    }
  });

  const module = modules.find((m: any) => m.id === moduleId);
  const lessons = module?.lessons || [];

  const saveLesson = useMutation({
    mutationFn: async (lessonData: Partial<Lesson> & { module_id?: string; video_url?: string }) => {
      if (editingLesson) {
        return api.put(`/api/admin/formation/lessons/${editingLesson.id}`, lessonData);
      }
      return api.post('/api/admin/formation/lessons', lessonData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      addToast('Leçon enregistrée.', 'success');
      setIsLessonModalOpen(false);
      setEditingLesson(null);
    },
    onError: (err: any) => {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    }
  });

  const deleteLesson = useMutation({
    mutationFn: async (id: string) => api.delete(`/api/admin/formation/lessons/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      addToast('Leçon supprimée.', 'success');
    }
  });

  const saveQuestion = useMutation({
    mutationFn: async (questionData: any) => {
      if (editingQuestion) {
        return api.put(`/api/admin/formation/lessons/${currentLessonForQuestion}/questions/${editingQuestion.id}`, questionData);
      }
      return api.post(`/api/admin/formation/lessons/${currentLessonForQuestion}/questions`, questionData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      addToast('Question enregistrée.', 'success');
      setIsQuestionModalOpen(false);
      setEditingQuestion(null);
    },
    onError: (err: any) => {
      addToast(err.response?.data?.error || 'Erreur', 'error');
    }
  });

  const deleteQuestion = useMutation({
    mutationFn: async ({ lessonId, questionId }: { lessonId: string, questionId: string }) => {
      return api.delete(`/api/admin/formation/lessons/${lessonId}/questions/${questionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-modules'] });
      addToast('Question supprimée.', 'success');
    }
  });

  if (isLoading) {
    return <div className="p-12 flex justify-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-loss"></div></div>;
  }

  if (!module) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center">
        <h1 className="text-2xl font-bold">Module introuvable</h1>
        <button onClick={() => navigate('/admin/academy')} className="mt-4 text-loss font-bold flex items-center gap-2 justify-center w-full">
          <ArrowLeft size={16} /> Retour
        </button>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <button onClick={() => navigate('/admin/academy')} className="flex items-center gap-2 text-txt-2 hover:text-txt font-bold mb-6 transition-colors">
        <ArrowLeft size={20} />
        Retour aux modules
      </button>

      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-black tracking-tight flex items-center gap-3">
            <span className="text-2xl">{module.icone}</span>
            {module.titre}
          </h1>
          <p className="text-txt-2 mt-2">Gestion des leçons et des quiz de ce module.</p>
        </div>
        <button
          onClick={() => { setEditingLesson(null); setIsLessonModalOpen(true); }}
          className="flex items-center gap-2 bg-loss text-white px-4 py-2 rounded-xl font-bold hover:bg-loss/90 transition-colors"
        >
          <Plus size={20} />
          Nouvelle Leçon
        </button>
      </div>

      <div className="space-y-6">
        {lessons.map((lesson: Lesson) => (
          <div key={lesson.id} className="bg-surface border border-border rounded-xl overflow-hidden">
            <div className="p-4 bg-elevated border-b border-border flex items-center gap-4">
              <div className="text-txt-3 cursor-grab hover:text-txt">
                <GripVertical size={24} />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-lg flex items-center gap-2">
                  <FileText size={18} className="text-loss" />
                  {lesson.titre}
                  {!lesson.actif && <span className="text-xs px-2 py-1 bg-loss/10 text-loss rounded-md font-bold">Inactif</span>}
                </h3>
                <div className="text-xs text-txt-3 mt-1 font-medium">
                  Ordre: {lesson.ordre} • {lesson.quizQuestions.length} question(s) de quiz
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => { setEditingLesson(lesson); setIsLessonModalOpen(true); }}
                  className="p-2 text-txt-2 hover:text-loss bg-surface hover:bg-loss/10 rounded-lg transition-colors border border-border"
                  title="Modifier la leçon"
                >
                  <Edit2 size={18} />
                </button>
                <button
                  onClick={() => {
                    if (window.confirm('Supprimer cette leçon ?')) {
                      deleteLesson.mutate(lesson.id);
                    }
                  }}
                  className="p-2 text-txt-2 hover:text-loss bg-surface hover:bg-loss/10 rounded-lg transition-colors border border-border"
                  title="Supprimer la leçon"
                >
                  <Trash2 size={18} />
                </button>
                <button
                  onClick={() => { setCurrentLessonForQuestion(lesson.id); setEditingQuestion(null); setIsQuestionModalOpen(true); }}
                  className="px-3 py-2 bg-loss/10 text-loss rounded-lg font-bold hover:bg-loss/20 transition-colors ml-2 flex items-center gap-2"
                >
                  <Plus size={16} /> Quiz
                </button>
              </div>
            </div>

            {/* Quiz Questions List */}
            {lesson.quizQuestions.length > 0 && (
              <div className="p-4 bg-surface space-y-2">
                <h4 className="font-bold text-sm text-txt-2 mb-3 uppercase tracking-wider flex items-center gap-2">
                  <CheckCircle2 size={14} /> Questions du Quiz
                </h4>
                {lesson.quizQuestions.map((q, idx) => (
                  <div key={q.id} className="flex items-start gap-4 p-3 bg-elevated rounded-lg border border-border/50">
                    <div className="w-6 h-6 rounded-full bg-loss/10 text-loss flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                      {idx + 1}
                    </div>
                    <div className="flex-1 text-sm">
                      <p className="font-bold text-txt mb-2">{q.question}</p>
                      <div className="grid grid-cols-2 gap-2 mb-2">
                        {q.options.map((opt, i) => (
                          <div key={i} className={`px-2 py-1.5 rounded-md border ${i === q.reponseCorrecte ? 'border-loss bg-loss/5 text-loss font-bold' : 'border-border text-txt-2'}`}>
                            {opt}
                          </div>
                        ))}
                      </div>
                      {q.explication && <p className="text-xs text-txt-3 italic">Explication: {q.explication}</p>}
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      <button onClick={() => { setCurrentLessonForQuestion(lesson.id); setEditingQuestion(q); setIsQuestionModalOpen(true); }} className="p-1.5 text-txt-3 hover:text-loss transition-colors">
                        <Edit2 size={14} />
                      </button>
                      <button onClick={() => { if(window.confirm('Supprimer cette question ?')) deleteQuestion.mutate({ lessonId: lesson.id, questionId: q.id })}} className="p-1.5 text-txt-3 hover:text-loss transition-colors">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
        {lessons.length === 0 && (
          <div className="text-center py-12 bg-surface rounded-xl border border-border border-dashed">
            <FileText size={48} className="mx-auto text-txt-3 mb-4" />
            <h3 className="text-lg font-bold text-txt">Aucune leçon</h3>
            <p className="text-txt-2 mt-1">Créez la première leçon pour ce module.</p>
          </div>
        )}
      </div>

      {/* Lesson Modal */}
      {isLessonModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface w-full max-w-3xl rounded-2xl border border-border overflow-hidden max-h-[90vh] flex flex-col">
            <div className="p-6 border-b border-border shrink-0">
              <h2 className="text-xl font-bold">{editingLesson ? 'Modifier la Leçon' : 'Nouvelle Leçon'}</h2>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              saveLesson.mutate({
                module_id: moduleId,
                titre: formData.get('titre') as string,
                contenu: formData.get('contenu') as string,
                video_url: formData.get('video_url') as string,
                ordre: Number(formData.get('ordre')),
                actif: formData.get('actif') === 'on'
              });
            }} className="p-6 overflow-y-auto space-y-4">
              <div>
                <label className="block text-sm font-bold text-txt-2 mb-1">Titre de la leçon</label>
                <input name="titre" defaultValue={editingLesson?.titre} required className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-txt focus:outline-none focus:border-loss transition-colors" />
              </div>
              <div>
                <label className="block text-sm font-bold text-txt-2 mb-1">Lien de la vidéo YouTube (Optionnel)</label>
                <input name="video_url" type="url" defaultValue={editingLesson?.videoUrl} className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-txt focus:outline-none focus:border-loss transition-colors" placeholder="https://www.youtube.com/watch?v=..." />
              </div>
              <div>
                <label className="block text-sm font-bold text-txt-2 mb-1 flex justify-between">
                  <span>Contenu (Markdown supporté)</span>
                  <a href="https://www.markdownguide.org/cheat-sheet/" target="_blank" rel="noreferrer" className="text-loss hover:underline text-xs">Guide Markdown</a>
                </label>
                <textarea name="contenu" defaultValue={editingLesson?.contenu} required rows={12} className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-txt focus:outline-none focus:border-loss transition-colors resize-y font-mono text-sm" placeholder="Saisissez le texte de votre cours en Markdown ici..." />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-txt-2 mb-1">Ordre</label>
                  <input name="ordre" type="number" min="1" defaultValue={editingLesson?.ordre || lessons.length + 1} required className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-txt focus:outline-none focus:border-loss transition-colors" />
                </div>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <input type="checkbox" name="actif" id="lesson_actif" defaultChecked={editingLesson ? editingLesson.actif : true} className="w-4 h-4 rounded border-border bg-elevated text-loss focus:ring-loss" />
                <label htmlFor="lesson_actif" className="text-sm font-bold text-txt">Leçon active</label>
              </div>
 
              <div className="flex gap-3 pt-6 sticky bottom-0 bg-surface">
                <button type="button" onClick={() => setIsLessonModalOpen(false)} className="flex-1 bg-elevated text-txt font-bold py-3 rounded-xl hover:bg-border transition-colors">Annuler</button>
                <button type="submit" disabled={saveLesson.isPending} className="flex-1 bg-loss text-white font-bold py-3 rounded-xl hover:bg-loss/90 transition-colors disabled:opacity-50">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Question Modal */}
      {isQuestionModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
          <div className="bg-surface w-full max-w-lg rounded-2xl border border-border overflow-hidden">
            <div className="p-6 border-b border-border">
              <h2 className="text-xl font-bold">{editingQuestion ? 'Modifier la Question' : 'Nouvelle Question'}</h2>
            </div>
            
            <form onSubmit={(e) => {
              e.preventDefault();
              const formData = new FormData(e.currentTarget);
              
              // Extraire les options
              const options = [];
              for(let i=0; i<4; i++) {
                const opt = formData.get(`option_${i}`) as string;
                if (opt && opt.trim()) options.push(opt);
              }

              saveQuestion.mutate({
                question: formData.get('question') as string,
                options,
                reponse_correcte: Number(formData.get('reponse_correcte')),
                explication: formData.get('explication') as string,
                ordre: Number(formData.get('ordre'))
              });
            }} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
              <div>
                <label className="block text-sm font-bold text-txt-2 mb-1">Question</label>
                <input name="question" defaultValue={editingQuestion?.question} required className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-txt focus:outline-none focus:border-loss transition-colors" />
              </div>
              
              <div className="space-y-3">
                <label className="block text-sm font-bold text-txt-2 mb-1">Options de réponse</label>
                {[0, 1, 2, 3].map(i => (
                  <div key={i} className="flex items-center gap-3">
                    <input type="radio" name="reponse_correcte" value={i} defaultChecked={editingQuestion?.reponseCorrecte === i || (i === 0 && !editingQuestion)} required className="w-4 h-4 text-loss focus:ring-loss bg-elevated border-border" />
                    <input name={`option_${i}`} defaultValue={editingQuestion?.options[i] || ''} placeholder={`Option ${i+1}`} className="flex-1 bg-elevated border border-border rounded-xl px-3 py-2 text-sm text-txt focus:outline-none focus:border-loss transition-colors" required={i < 2} />
                  </div>
                ))}
                <p className="text-xs text-txt-3">Au moins 2 options sont requises. Sélectionnez le bouton radio pour la bonne réponse.</p>
              </div>

              <div>
                <label className="block text-sm font-bold text-txt-2 mb-1">Explication (optionnel)</label>
                <textarea name="explication" defaultValue={editingQuestion?.explication || ''} rows={2} className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-txt focus:outline-none focus:border-loss transition-colors resize-none" placeholder="Affiché après la réponse..." />
              </div>

              <div>
                <label className="block text-sm font-bold text-txt-2 mb-1">Ordre</label>
                <input name="ordre" type="number" min="1" defaultValue={editingQuestion?.ordre || 1} required className="w-full bg-elevated border border-border rounded-xl px-4 py-2.5 text-txt focus:outline-none focus:border-loss transition-colors" />
              </div>

              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => setIsQuestionModalOpen(false)} className="flex-1 bg-elevated text-txt font-bold py-3 rounded-xl hover:bg-border transition-colors">Annuler</button>
                <button type="submit" disabled={saveQuestion.isPending} className="flex-1 bg-loss text-white font-bold py-3 rounded-xl hover:bg-loss/90 transition-colors disabled:opacity-50">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminLessonsPage;
