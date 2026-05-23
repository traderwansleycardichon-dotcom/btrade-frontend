import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  ChevronLeft, 
  Lock, 
  CheckCircle, 
  Play, 
  BookOpen, 
  FileText, 
  HelpCircle, 
  Send, 
  ChevronRight, 
  AlertCircle,
  XCircle,
  Award
} from 'lucide-react';
import api from '../../../lib/api';
import { FeatureGate } from '../../../components/ui/FeatureGate';
import { SecureVideoPlayer } from './SecureVideoPlayer';

interface ModuleInfo {
  id: string;
  slug: string;
  titre: string;
  description: string;
  ordre: number;
  icone: string;
}

interface LessonListItem {
  id: string;
  titre: string;
  ordre: number;
  statut: 'locked' | 'available' | 'in_progress' | 'completed';
  lecture_done: boolean;
  quiz_passed: boolean;
  devoir_done: boolean;
}

interface LessonsResponse {
  module: ModuleInfo;
  lessons: LessonListItem[];
}

interface LessonDetail {
  id: string;
  titre: string;
  contenu: string;
  ordre: number;
  moduleId: string;
}

interface QuizQuestionItem {
  id: string;
  question: string;
  options: string[];
  ordre: number;
}

interface QuizDetails {
  questionId: string;
  correct: boolean;
  bonneReponse: number;
  explication: string;
}

interface QuizSubmitResponse {
  score: number;
  passed: boolean;
  tentativeNum: number;
  details: QuizDetails[];
}

// Simple local Markdown parser helper to style text beautifully
function parseMarkdown(text: string | null | undefined): string {
  if (!text) return '';
  
  // Basic escaping and formatting
  let html = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Headers
  html = html.replace(/^### (.*?)$/gm, '<h5 class="text-sm font-bold text-accent mt-4 mb-2">$1</h5>');
  html = html.replace(/^## (.*?)$/gm, '<h4 class="text-base font-bold text-white mt-5 mb-3 border-b border-border pb-1">$1</h4>');
  html = html.replace(/^# (.*?)$/gm, '<h3 class="text-lg font-bold text-white mt-6 mb-4">$1</h3>');
  
  // Bold
  html = html.replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-white">$1</strong>');
  
  // Italic
  html = html.replace(/\*(.*?)\*/g, '<em class="italic">$1</em>');
  
  // Bullet points
  html = html.replace(/^\- (.*?)$/gm, '<li class="ml-4 list-disc text-txt-2 mb-1.5">$1</li>');
  // Ordered lists
  html = html.replace(/^\d+\. (.*?)$/gm, '<li class="ml-4 list-decimal text-txt-2 mb-1.5">$1</li>');

  // Code blocks
  html = html.replace(/```([\s\S]*?)```/g, '<pre class="bg-bg border border-border rounded-md p-3 my-3 overflow-x-auto text-xs text-accent font-mono">$1</pre>');
  
  // Inline code
  html = html.replace(/`(.*?)`/g, '<code class="bg-bg border border-border px-1.5 py-0.5 rounded text-accent font-mono text-[10px]">$1</code>');
  
  // Paragraphs
  const lines = html.split('\n\n');
  const formatted = lines.map(line => {
    const trimmed = line.trim();
    if (!trimmed) return '';
    if (trimmed.startsWith('<h') || trimmed.startsWith('<li') || trimmed.startsWith('<pre') || trimmed.startsWith('<ol') || trimmed.startsWith('<ul')) {
      return trimmed;
    }
    return `<p class="text-txt-2 leading-relaxed text-xs mb-3 whitespace-pre-line">${trimmed}</p>`;
  });
  
  return formatted.join('\n');
}

const LessonPlayer: React.FC = () => {
  const { slug, lessonId } = useParams<{ slug: string; lessonId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'lecture' | 'quiz' | 'devoir'>('lecture');
  const [selectedAnswers, setSelectedAnswers] = useState<{ [questionId: string]: number }>({});
  const [quizResult, setQuizResult] = useState<QuizSubmitResponse | null>(null);
  const [devoirContent, setDevoirContent] = useState('');
  const [quizError, setQuizError] = useState<string | null>(null);
  const [devoirError, setDevoirError] = useState<string | null>(null);
  const [devoirSuccess, setDevoirSuccess] = useState(false);

  // 1. Fetch sibling lessons and module details
  const { data: moduleData, isLoading: isModuleLoading } = useQuery<LessonsResponse>({
    queryKey: ['moduleLessons', slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/formation/modules/${slug}/lessons`);
      return data.data;
    },
    enabled: !!slug,
  });

  // 2. Fetch specific lesson content
  const { data: lesson, isLoading: isLessonLoading, error: lessonError } = useQuery<LessonDetail>({
    queryKey: ['lessonDetail', lessonId],
    queryFn: async () => {
      const { data } = await api.get(`/api/formation/lessons/${lessonId}`);
      return data.data;
    },
    enabled: !!lessonId,
    retry: false, // Don't infinite retry on 403 / locked lessons
  });

  // 3. Fetch Quiz Questions (only loaded if quiz is unlocked/needed)
  const { data: quizQuestions, isLoading: isQuizLoading } = useQuery<QuizQuestionItem[]>({
    queryKey: ['lessonQuiz', lessonId],
    queryFn: async () => {
      const { data } = await api.get(`/api/formation/lessons/${lessonId}/quiz`);
      return data.data;
    },
    enabled: !!lessonId && (activeTab === 'quiz' || (moduleData?.lessons?.find(l => l.id === lessonId)?.lecture_done)),
    retry: false,
  });

  // 4. Mark Lecture as Done Mutation
  const markReadMutation = useMutation({
    mutationFn: async () => {
      const { data } = await api.post(`/api/formation/lessons/${lessonId}/lecture-done`);
      return data.data;
    },
    onSuccess: () => {
      // Invalidate queries to refresh progression state
      queryClient.invalidateQueries({ queryKey: ['moduleLessons', slug] });
      queryClient.invalidateQueries({ queryKey: ['formationModules'] });
      // Go to quiz tab automatically once read
      if (quizQuestions && quizQuestions.length > 0) {
        setActiveTab('quiz');
      } else {
        setActiveTab('devoir');
      }
    }
  });

  // 5. Submit Quiz Mutation
  const submitQuizMutation = useMutation({
    mutationFn: async (answers: { [questionId: string]: number }) => {
      const { data } = await api.post(`/api/formation/lessons/${lessonId}/quiz`, {
        reponses: answers
      });
      return data.data;
    },
    onSuccess: (data: QuizSubmitResponse) => {
      setQuizResult(data);
      setQuizError(null);
      queryClient.invalidateQueries({ queryKey: ['moduleLessons', slug] });
      queryClient.invalidateQueries({ queryKey: ['formationModules'] });
      if (data.passed) {
        // Automatically open Devoir tab on success
        setActiveTab('devoir');
      }
    },
    onError: (err: any) => {
      setQuizError(err.response?.data?.error || 'Erreur lors de la validation du quiz.');
    }
  });

  // 6. Submit Homework/Devoir Mutation
  const submitDevoirMutation = useMutation({
    mutationFn: async (content: string) => {
      const { data } = await api.post(`/api/formation/lessons/${lessonId}/devoir`, {
        contenu: content
      });
      return data.data;
    },
    onSuccess: () => {
      setDevoirSuccess(true);
      setDevoirError(null);
      queryClient.invalidateQueries({ queryKey: ['moduleLessons', slug] });
      queryClient.invalidateQueries({ queryKey: ['formationModules'] });
    },
    onError: (err: any) => {
      setDevoirError(err.response?.data?.error || 'Erreur lors de la soumission du devoir.');
    }
  });

  if (isModuleLoading || isLessonLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-txt-2 text-xs font-medium">Chargement de la leçon...</span>
      </div>
    );
  }

  if (lessonError || !lesson || !moduleData) {
    return (
      <div className="glass p-8 text-center rounded-lg border border-loss/20 max-w-md mx-auto my-10">
        <AlertCircle size={40} className="text-loss mx-auto mb-3" />
        <p className="text-sm font-bold text-loss mb-2">Accès refusé ou Leçon introuvable</p>
        <p className="text-xs text-txt-2 mb-6">
          {lessonError ? "Cette leçon est verrouillée. Veuillez compléter les leçons précédentes." : "Impossible de charger cette leçon."}
        </p>
        <button 
          onClick={() => navigate(`/app/formation/${slug}`)} 
          className="btn-primary text-xs py-1.5 px-4"
        >
          Retour au Module
        </button>
      </div>
    );
  }

  const { module, lessons } = moduleData;
  const currentProgress = lessons.find(l => l.id === lessonId);

  const lessonContenu = lesson?.contenu || '';

  // Extract YouTube ID if any exists
  const ytRegex = /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=)|youtu\.be\/)([a-zA-Z0-9_-]{11})/i;
  const match = lessonContenu.match(ytRegex);
  const videoId = match ? match[1] : null;

  // Clean the text from markdown or raw links containing the YouTube video
  let cleanContenu = lessonContenu;
  if (videoId) {
    // Replace markdown [video](url)
    const markdownRegex = new RegExp(`\\[.*?\\]\\(.*?${videoId}.*?\\)`, 'i');
    cleanContenu = lessonContenu.replace(markdownRegex, '');
    if (cleanContenu === lessonContenu) {
      // Replace raw URLs if not wrapped in markdown link
      const rawUrlRegex = new RegExp(`https?:\\/\\/(?:www\\.)?(?:youtube\\.com|youtu\\.be)\\S*?${videoId}\\S*`, 'i');
      cleanContenu = lessonContenu.replace(rawUrlRegex, '');
    }
    cleanContenu = cleanContenu.trim();
  }

  // Navigation indexes
  const currentIdx = lessons.findIndex(l => l.id === lessonId);
  const nextLesson = currentIdx !== -1 && currentIdx < lessons.length - 1 ? lessons[currentIdx + 1] : null;
  const prevLesson = currentIdx > 0 ? lessons[currentIdx - 1] : null;

  const isLectureDone = currentProgress?.lecture_done || false;
  const isQuizPassed = currentProgress?.quiz_passed || false;
  const isDevoirDone = currentProgress?.devoir_done || false;

  const handleQuizOptionChange = (questionId: string, optionIdx: number) => {
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: optionIdx
    }));
  };

  const handleQuizSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quizQuestions || quizQuestions.length === 0) return;

    // Check that all questions have been answered
    const unanswered = quizQuestions.some(q => selectedAnswers[q.id] === undefined);
    if (unanswered) {
      setQuizError('Veuillez répondre à toutes les questions.');
      return;
    }

    setQuizError(null);
    submitQuizMutation.mutate(selectedAnswers);
  };

  const handleDevoirSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (devoirContent.length < 20) {
      setDevoirError('Le devoir doit contenir au moins 20 caractères.');
      return;
    }
    setDevoirError(null);
    submitDevoirMutation.mutate(devoirContent);
  };

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Back Button */}
      <button 
        onClick={() => navigate(`/app/formation/${slug}`)}
        className="flex items-center gap-1.5 text-xs text-txt-2 hover:text-txt transition-colors group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Retour au plan du cours
      </button>

      {/* Main Grid: Player on left, lessons sidebar checklist on right */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        {/* Left Side: Lesson Viewer */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Header Card */}
          <div className="glass p-5 rounded-lg border border-border flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gradient-to-br from-accent/[0.01] to-transparent">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-bold text-accent uppercase tracking-widest px-2 py-0.5 rounded bg-accent/10">
                  Leçon {lesson.ordre}
                </span>
                <span className="text-[9px] text-txt-3 font-mono">
                  {module.titre}
                </span>
              </div>
              <h2 className="text-lg font-bold text-txt">{lesson.titre}</h2>
            </div>
            
            {/* Overall status badge */}
            <div className="shrink-0">
              {isDevoirDone ? (
                <span className="text-[10px] font-bold text-win bg-win/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <CheckCircle size={10} /> Leçon Complétée
                </span>
              ) : (
                <span className="text-[10px] font-bold text-accent bg-accent/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                  <Play size={10} fill="currentColor" /> En cours d'apprentissage
                </span>
              )}
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex border-b border-border bg-surface/30 rounded-t-lg overflow-hidden">
            <button
              onClick={() => setActiveTab('lecture')}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all border-b-2 ${
                activeTab === 'lecture' 
                  ? 'border-accent bg-surface text-accent' 
                  : 'border-transparent text-txt-3 hover:text-txt-2'
              }`}
            >
              <BookOpen size={14} />
              1. Lecture
              {isLectureDone && <CheckCircle size={10} className="text-win fill-win/10" />}
            </button>

            <button
              onClick={() => {
                if (isLectureDone) setActiveTab('quiz');
              }}
              disabled={!isLectureDone}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all border-b-2 relative ${
                activeTab === 'quiz' 
                  ? 'border-accent bg-surface text-accent' 
                  : 'border-transparent text-txt-3'
              } ${!isLectureDone ? 'opacity-40 cursor-not-allowed' : 'hover:text-txt-2'}`}
            >
              <HelpCircle size={14} />
              2. Quiz
              {!isLectureDone && <Lock size={10} className="text-txt-3" />}
              {isLectureDone && isQuizPassed && <CheckCircle size={10} className="text-win fill-win/10" />}
            </button>

            <button
              onClick={() => {
                if (isQuizPassed) setActiveTab('devoir');
              }}
              disabled={!isQuizPassed}
              className={`flex-1 py-3 text-xs font-bold flex items-center justify-center gap-2 transition-all border-b-2 relative ${
                activeTab === 'devoir' 
                  ? 'border-accent bg-surface text-accent' 
                  : 'border-transparent text-txt-3'
              } ${!isQuizPassed ? 'opacity-40 cursor-not-allowed' : 'hover:text-txt-2'}`}
            >
              <FileText size={14} />
              3. Devoir
              {!isQuizPassed && <Lock size={10} className="text-txt-3" />}
              {isQuizPassed && isDevoirDone && <CheckCircle size={10} className="text-win fill-win/10" />}
            </button>
          </div>

          {/* Tab Content Box */}
          <div className="glass p-6 rounded-b-lg border-t-0 border-border bg-surface/10 min-h-[300px] flex flex-col justify-between">
            
            {/* TABS CONTENT */}
            <div>
              {/* Tab 1: Lecture */}
              {activeTab === 'lecture' && (
                <div className="space-y-6">
                  {videoId && (
                    <div className="mb-6 rounded-lg overflow-hidden border border-border">
                      <SecureVideoPlayer videoId={videoId} />
                    </div>
                  )}
                  <div 
                    dangerouslySetInnerHTML={{ __html: parseMarkdown(cleanContenu) }} 
                    className="prose prose-invert max-w-none text-txt-2"
                  />
                  
                  <div className="pt-6 border-t border-border/40 flex justify-end">
                    {isLectureDone ? (
                      <div className="text-xs font-bold text-win flex items-center gap-1.5 bg-win/5 px-4 py-2 border border-win/10 rounded-lg">
                        <CheckCircle size={14} />
                        Lecture validée ! Passez à l'étape suivante.
                      </div>
                    ) : (
                      <button
                        onClick={() => markReadMutation.mutate()}
                        disabled={markReadMutation.isPending}
                        className="btn-primary text-xs flex items-center gap-2 py-2 px-5"
                      >
                        {markReadMutation.isPending ? 'Validation...' : 'Marquer comme lu & passer au quiz'}
                        <ChevronRight size={14} />
                      </button>
                    )}
                  </div>
                </div>
              )}

              {/* Tab 2: Quiz */}
              {activeTab === 'quiz' && (
                <div className="space-y-6">
                  {isQuizPassed && !quizResult ? (
                    // Quiz already passed previously
                    <div className="text-center py-10 space-y-4">
                      <div className="w-14 h-14 bg-win/10 text-win border border-win/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-win/5">
                        <Award size={32} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-win">Quiz Réussi !</h3>
                        <p className="text-xs text-txt-2 max-w-xs mx-auto">
                          Vous avez déjà validé le quiz de cette leçon. Vous pouvez accéder au devoir.
                        </p>
                      </div>
                      <button
                        onClick={() => setActiveTab('devoir')}
                        className="btn-primary text-xs py-2 px-5"
                      >
                        Aller au devoir
                      </button>
                    </div>
                  ) : quizResult ? (
                    // Quiz Result screen
                    <div className="space-y-6">
                      <div className={`p-4 rounded-lg border text-center space-y-2 ${
                        quizResult.passed 
                          ? 'bg-win/5 border-win/20 text-win' 
                          : 'bg-loss/5 border-loss/20 text-loss'
                      }`}>
                        <div className="text-lg font-black font-mono">{quizResult.score}%</div>
                        <h3 className="text-xs font-bold">
                          {quizResult.passed ? 'Félicitations ! Quiz validé.' : 'Échec. Score minimum requis: 70%'}
                        </h3>
                        <p className="text-[10px] text-txt-2">
                          Tentative n°{quizResult.tentativeNum}
                        </p>
                      </div>

                      {/* Corrected Answers Checklist */}
                      <div className="space-y-4">
                        <h4 className="text-xs font-bold text-txt">Détails de la correction</h4>
                        <div className="space-y-3">
                          {quizQuestions?.map((q, idx) => {
                            const detail = quizResult.details.find(d => d.questionId === q.id);
                            const userChoice = selectedAnswers[q.id];
                            
                            return (
                              <div key={q.id} className="p-3.5 bg-bg/50 border border-border rounded-lg space-y-2">
                                <div className="flex items-start gap-2">
                                  {detail?.correct ? (
                                    <CheckCircle size={14} className="text-win shrink-0 mt-0.5" />
                                  ) : (
                                    <XCircle size={14} className="text-loss shrink-0 mt-0.5" />
                                  )}
                                  <div className="text-xs font-bold text-txt">
                                    Q{idx+1}: {q.question}
                                  </div>
                                </div>

                                <div className="pl-6 space-y-1">
                                  <p className="text-[10px] text-txt-2">
                                    Votre réponse: <span className={detail?.correct ? 'text-win font-bold' : 'text-loss font-bold'}>
                                      {q.options[userChoice] || 'Aucune'}
                                    </span>
                                  </p>
                                  {!detail?.correct && (
                                    <p className="text-[10px] text-win font-bold">
                                      Bonne réponse: {q.options[detail?.bonneReponse || 0]}
                                    </p>
                                  )}
                                  {detail?.explication && (
                                    <div className="mt-2 text-[10px] bg-accent/5 text-txt-2 p-2 border-l-2 border-accent rounded-r italic leading-relaxed">
                                      <strong>Explication:</strong> {detail.explication}
                                    </div>
                                  )}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      <div className="flex justify-end gap-3 pt-4 border-t border-border/40">
                        {!quizResult.passed && (
                          <button
                            onClick={() => {
                              setQuizResult(null);
                              setSelectedAnswers({});
                            }}
                            className="btn-ghost text-xs py-2 px-4 border border-border hover:border-border-hover"
                          >
                            Réessayer le quiz
                          </button>
                        )}
                        {quizResult.passed && (
                          <button
                            onClick={() => setActiveTab('devoir')}
                            className="btn-primary text-xs py-2 px-5"
                          >
                            Continuer vers le devoir
                          </button>
                        )}
                      </div>
                    </div>
                  ) : !quizQuestions || quizQuestions.length === 0 ? (
                    // Quiz loading or unavailable
                    isQuizLoading ? (
                      <div className="flex justify-center py-10">
                        <div className="w-6 h-6 border-2 border-accent border-t-transparent rounded-full animate-spin" />
                      </div>
                    ) : (
                      <div className="text-center py-10 space-y-3">
                        <AlertCircle size={32} className="text-txt-3 mx-auto" />
                        <p className="text-xs text-txt-2">Aucun quiz disponible pour cette leçon.</p>
                        <button onClick={() => markReadMutation.mutate()} className="btn-primary text-xs py-1.5 px-4">
                          Marquer comme complété
                        </button>
                      </div>
                    )
                  ) : (
                    // Interactive Quiz Form
                    <form onSubmit={handleQuizSubmit} className="space-y-6">
                      <div className="space-y-4">
                        {quizQuestions.map((q, idx) => (
                          <div key={q.id} className="p-4 bg-surface/20 border border-border rounded-lg space-y-3">
                            <h4 className="text-xs font-bold text-txt">
                              {idx + 1}. {q.question}
                            </h4>
                            <div className="grid grid-cols-1 gap-2">
                              {q.options.map((opt, optIdx) => {
                                const isChecked = selectedAnswers[q.id] === optIdx;
                                return (
                                  <label 
                                    key={optIdx} 
                                    className={`
                                      flex items-center gap-3 p-3 rounded-lg border text-xs cursor-pointer transition-all
                                      ${isChecked 
                                        ? 'bg-accent/10 border-accent text-white font-bold' 
                                        : 'bg-bg/40 border-border hover:border-border-hover text-txt-2 hover:text-txt'
                                      }
                                    `}
                                  >
                                    <input
                                      type="radio"
                                      name={`question-${q.id}`}
                                      checked={isChecked}
                                      onChange={() => handleQuizOptionChange(q.id, optIdx)}
                                      className="sr-only"
                                    />
                                    <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center shrink-0 ${
                                      isChecked ? 'border-accent bg-accent' : 'border-txt-3'
                                    }`}>
                                      {isChecked && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                                    </div>
                                    {opt}
                                  </label>
                                );
                              })}
                            </div>
                          </div>
                        ))}
                      </div>

                      {quizError && (
                        <div className="text-xs text-loss font-bold flex items-center gap-1.5 p-3 rounded bg-loss/5 border border-loss/20">
                          <AlertCircle size={14} />
                          {quizError}
                        </div>
                      )}

                      <div className="flex justify-end pt-4 border-t border-border/40">
                        <button
                          type="submit"
                          disabled={submitQuizMutation.isPending}
                          className="btn-primary text-xs py-2 px-6 flex items-center gap-1.5"
                        >
                          <Send size={12} />
                          {submitQuizMutation.isPending ? 'Validation...' : 'Valider mes réponses'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}

              {/* Tab 3: Devoir */}
              {activeTab === 'devoir' && (
                <div className="space-y-6">
                  {isDevoirDone || devoirSuccess ? (
                    // Devoir already done
                    <div className="text-center py-10 space-y-4">
                      <div className="w-14 h-14 bg-win/10 text-win border border-win/20 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-win/5">
                        <CheckCircle size={32} />
                      </div>
                      <div className="space-y-1">
                        <h3 className="text-base font-bold text-win">Devoir soumis avec succès !</h3>
                        <p className="text-xs text-txt-2 max-w-xs mx-auto">
                          Votre devoir a bien été transmis. Un formateur va l'analyser et vous transmettra un feedback.
                        </p>
                      </div>
                      {nextLesson && (
                        <button
                          onClick={() => {
                            setActiveTab('lecture');
                            setQuizResult(null);
                            setSelectedAnswers({});
                            setDevoirContent('');
                            setDevoirSuccess(false);
                            navigate(`/app/formation/${slug}/${nextLesson.id}`);
                          }}
                          className="btn-primary text-xs py-2 px-5 inline-flex items-center gap-1.5"
                        >
                          Leçon suivante
                          <ChevronRight size={14} />
                        </button>
                      )}
                    </div>
                  ) : (
                    // Submission form
                    <form onSubmit={handleDevoirSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <h3 className="text-xs font-bold text-txt">Sujet du devoir</h3>
                        <p className="text-xs text-txt-2 leading-relaxed bg-bg/40 border border-border p-4 rounded-lg">
                          Veuillez rédiger une synthèse de ce que vous avez appris lors de cette leçon. Expliquez comment vous comptez appliquer ce concept à votre routine de trading quotidienne (minimum 20 caractères).
                        </p>
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest">
                          Votre devoir
                        </label>
                        <textarea
                          rows={6}
                          value={devoirContent}
                          onChange={(e) => setDevoirContent(e.target.value)}
                          placeholder="Rédigez votre devoir ici..."
                          className="w-full bg-bg border border-border rounded py-2 px-3 text-xs focus:border-accent outline-none resize-none leading-relaxed text-txt"
                        />
                        <div className="flex justify-between items-center text-[10px] text-txt-3 font-mono">
                          <span>{devoirContent.length} caractères</span>
                          <span className={devoirContent.length >= 20 ? 'text-win' : 'text-loss'}>
                            min. 20 caractères
                          </span>
                        </div>
                      </div>

                      {devoirError && (
                        <div className="text-xs text-loss font-bold flex items-center gap-1.5 p-3 rounded bg-loss/5 border border-loss/20">
                          <AlertCircle size={14} />
                          {devoirError}
                        </div>
                      )}

                      <div className="flex justify-end pt-4 border-t border-border/40">
                        <button
                          type="submit"
                          disabled={submitDevoirMutation.isPending || devoirContent.length < 20}
                          className="btn-primary text-xs py-2 px-6 flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <Send size={12} />
                          {submitDevoirMutation.isPending ? 'Envoi...' : 'Soumettre mon devoir'}
                        </button>
                      </div>
                    </form>
                  )}
                </div>
              )}
            </div>

            {/* Bottom Pagination controls */}
            <div className="mt-8 pt-4 border-t border-border/40 flex justify-between items-center text-xs">
              {prevLesson ? (
                <button
                  onClick={() => {
                    setActiveTab('lecture');
                    setQuizResult(null);
                    setSelectedAnswers({});
                    setDevoirContent('');
                    setDevoirSuccess(false);
                    navigate(`/app/formation/${slug}/${prevLesson.id}`);
                  }}
                  className="flex items-center gap-1.5 text-txt-2 hover:text-txt transition-colors py-1.5 px-3 border border-border hover:border-border-hover rounded-lg"
                >
                  <ChevronLeft size={14} />
                  Précédent
                </button>
              ) : (
                <div />
              )}

              {nextLesson && (
                <button
                  onClick={() => {
                    if (nextLesson.statut === 'locked') return;
                    setActiveTab('lecture');
                    setQuizResult(null);
                    setSelectedAnswers({});
                    setDevoirContent('');
                    setDevoirSuccess(false);
                    navigate(`/app/formation/${slug}/${nextLesson.id}`);
                  }}
                  disabled={nextLesson.statut === 'locked'}
                  className={`
                    flex items-center gap-1.5 py-1.5 px-3 border rounded-lg transition-colors
                    ${nextLesson.statut === 'locked'
                      ? 'border-border/30 text-txt-3 opacity-40 cursor-not-allowed'
                      : 'border-border hover:border-border-hover text-txt-2 hover:text-txt'
                    }
                  `}
                >
                  Suivant
                  {nextLesson.statut === 'locked' ? <Lock size={12} /> : <ChevronRight size={14} />}
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Lessons Sidebar Checklist */}
        <div className="space-y-4">
          <div className="glass p-4 rounded-lg border border-border space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-txt-3 pb-2 border-b border-border">
              Sommaire du Module
            </h3>
            
            <div className="space-y-2 max-h-[450px] overflow-y-auto pr-1">
              {lessons.map((l) => {
                const isActive = l.id === lessonId;
                const isLocked = l.statut === 'locked';
                const isCompleted = l.statut === 'completed';

                return (
                  <div
                    key={l.id}
                    onClick={() => {
                      if (!isLocked && !isActive) {
                        setActiveTab('lecture');
                        setQuizResult(null);
                        setSelectedAnswers({});
                        setDevoirContent('');
                        setDevoirSuccess(false);
                        navigate(`/app/formation/${slug}/${l.id}`);
                      }
                    }}
                    className={`
                      p-3 rounded-lg border text-left transition-all duration-150 flex items-start gap-2.5
                      ${isLocked 
                        ? 'bg-surface/10 border-border/40 opacity-50 cursor-not-allowed' 
                        : isActive 
                          ? 'bg-accent/10 border-accent/40 text-accent font-bold cursor-default' 
                          : 'bg-bg/40 border-border hover:border-border-hover hover:bg-bg/60 cursor-pointer'
                      }
                    `}
                  >
                    <div className="shrink-0 mt-0.5">
                      {isLocked ? (
                        <Lock size={12} className="text-txt-3" />
                      ) : isCompleted ? (
                        <CheckCircle size={13} className="text-win fill-win/10" />
                      ) : (
                        <span className="text-[10px] font-mono font-bold w-3.5 h-3.5 rounded bg-surface border border-border flex items-center justify-center">
                          {l.ordre}
                        </span>
                      )}
                    </div>
                    
                    <div className="min-w-0 flex-1 space-y-1">
                      <p className={`text-[11px] leading-snug truncate ${isLocked ? 'text-txt-3' : isActive ? 'text-white' : 'text-txt-2'}`}>
                        {l.titre}
                      </p>
                      
                      {!isLocked && (
                        <div className="flex gap-x-2 text-[8px] text-txt-3 font-mono">
                          <span className={l.lecture_done ? 'text-win font-bold' : ''}>L</span>
                          <span>·</span>
                          <span className={l.quiz_passed ? 'text-win font-bold' : ''}>Q</span>
                          <span>·</span>
                          <span className={l.devoir_done ? 'text-win font-bold' : ''}>D</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const LessonDetailPage: React.FC = () => {
  return (
    <FeatureGate 
      feature="hasAcademy"
      fallbackTitle="Academy BTrade Réservée aux Membres Pro"
      fallbackDesc="Accédez à des cours exclusifs, des masterclass sur le price action, des modules sur la psychologie du trading et des quiz pour valider vos compétences."
    >
      <LessonPlayer />
    </FeatureGate>
  );
};

export default LessonDetailPage;
