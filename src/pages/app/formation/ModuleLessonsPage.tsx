import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ChevronLeft, Lock, CheckCircle, Play, BookOpen, AlertCircle } from 'lucide-react';
import api from '../../../lib/api';
import { FeatureGate } from '../../../components/ui/FeatureGate';

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

const ModuleLessonsHub: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();

  const { data, isLoading, error } = useQuery<LessonsResponse>({
    queryKey: ['moduleLessons', slug],
    queryFn: async () => {
      const { data } = await api.get(`/api/formation/modules/${slug}/lessons`);
      return data.data;
    },
    enabled: !!slug,
  });

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-txt-2 text-xs font-medium">Chargement des leçons...</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="glass p-8 text-center rounded-3xl border border-loss/20 max-w-md mx-auto my-10">
        <AlertCircle size={40} className="text-loss mx-auto mb-3" />
        <p className="text-sm font-bold text-loss mb-2">Erreur ou module introuvable</p>
        <p className="text-xs text-txt-2 mb-6">Impossible de charger le contenu de ce module.</p>
        <button 
          onClick={() => navigate('/app/formation')} 
          className="btn-primary text-xs py-1.5 px-4"
        >
          Retour à l'Academy
        </button>
      </div>
    );
  }

  const { module, lessons } = data;

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Back Button */}
      <button 
        onClick={() => navigate('/app/formation')}
        className="flex items-center gap-1.5 text-xs text-txt-2 hover:text-txt transition-colors group"
      >
        <ChevronLeft size={16} className="group-hover:-translate-x-0.5 transition-transform" />
        Retour à l'Academy
      </button>

      {/* Module Header card */}
      <div className="relative overflow-hidden rounded-3xl glass-frost p-6 sm:p-10 border border-white/10 flex flex-col md:flex-row gap-8 items-start md:items-center shadow-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-transparent opacity-50 pointer-events-none" />
        
        <div className="relative w-20 h-20 rounded-[2rem] bg-accent/10 border border-accent/20 flex items-center justify-center text-5xl shrink-0 shadow-[0_0_30px_rgba(243,108,0,0.2)]">
          <div className="absolute inset-0 bg-accent/20 blur-xl rounded-full" />
          <span className="relative z-10 drop-shadow-md">{module.icone || '📖'}</span>
        </div>
        
        <div className="relative z-10 space-y-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-[11px] font-bold text-accent uppercase tracking-widest px-3 py-1 rounded-full bg-accent/10 border border-accent/20">
              Module {module.ordre}
            </span>
            <span className="flex items-center gap-1.5 px-3 py-1 bg-surface/50 rounded-full border border-white/5">
              <BookOpen size={12} className="text-txt-3" />
              <span className="text-[11px] text-txt-3 font-mono font-bold">
                {lessons.length} leçons
              </span>
            </span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight">{module.titre}</h2>
          <p className="text-sm text-txt-2 leading-relaxed max-w-2xl font-medium">{module.description}</p>
        </div>
      </div>

      {/* Lessons List */}
      <div className="space-y-4">
        <h3 className="text-base font-bold px-1">Plan du cours</h3>

        {lessons.length === 0 ? (
          <div className="p-6 text-center text-xs text-txt-3 border border-dashed border-border rounded-2xl">
            Aucune leçon n'est disponible pour ce module pour le moment.
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {lessons.map((lesson) => {
              const isLocked = lesson.statut === 'locked';
              const isCompleted = lesson.statut === 'completed';
              const isInProgress = lesson.statut === 'in_progress';

              return (
                <div 
                  key={lesson.id}
                  onClick={() => {
                    if (!isLocked) {
                      navigate(`/app/formation/${slug}/${lesson.id}`);
                    }
                  }}
                  className={`
                    group relative p-5 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-5 transition-all duration-300
                    ${isLocked 
                      ? 'bg-surface/20 border-white/5 opacity-60 cursor-not-allowed' 
                      : 'glass-subtle border-white/10 hover:border-accent/40 cursor-pointer hover:shadow-[0_8px_30px_rgba(243,108,0,0.12)] hover:-translate-y-0.5'
                    }
                  `}
                >
                  {/* Subtle hover gradient */}
                  {!isLocked && (
                    <div className="absolute inset-0 bg-gradient-to-r from-accent/0 via-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl pointer-events-none" />
                  )}

                  <div className="relative z-10 flex items-start gap-4 min-w-0 w-full sm:w-auto">
                    {/* Index and Icon */}
                    <div className={`
                      w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 font-bold font-mono text-sm transition-colors duration-300
                      ${isLocked 
                        ? 'bg-white/5 text-txt-3' 
                        : isCompleted 
                          ? 'bg-win/10 text-win shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                          : 'bg-accent/10 text-accent group-hover:bg-accent group-hover:text-white shadow-[0_0_15px_rgba(243,108,0,0.2)]'
                      }
                    `}>
                      {isLocked ? (
                        <Lock size={16} />
                      ) : isCompleted ? (
                        <CheckCircle size={20} />
                      ) : (
                        <span>{lesson.ordre}</span>
                      )}
                    </div>

                    {/* Lesson Title and steps */}
                    <div className="min-w-0 space-y-1.5 flex-1 pt-0.5">
                      <h4 className={`text-base font-bold truncate transition-colors ${isLocked ? 'text-txt-3' : 'text-txt group-hover:text-accent'}`}>
                        {lesson.titre}
                      </h4>
                      
                      {!isLocked && (
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-[11px] font-medium text-txt-3">
                          <div className={`flex items-center gap-1.5 ${lesson.lecture_done ? 'text-win' : ''}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${lesson.lecture_done ? 'bg-win shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-border'}`} />
                            Lecture
                          </div>
                          <div className={`flex items-center gap-1.5 ${lesson.quiz_passed ? 'text-win' : ''}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${lesson.quiz_passed ? 'bg-win shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-border'}`} />
                            Quiz
                          </div>
                          <div className={`flex items-center gap-1.5 ${lesson.devoir_done ? 'text-win' : ''}`}>
                            <div className={`w-1.5 h-1.5 rounded-full ${lesson.devoir_done ? 'bg-win shadow-[0_0_5px_rgba(16,185,129,0.5)]' : 'bg-border'}`} />
                            Devoir
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions / Status badges */}
                  <div className="relative z-10 w-full sm:w-auto flex items-center justify-end shrink-0 mt-2 sm:mt-0">
                    {isLocked ? (
                      <span className="text-[11px] font-bold text-txt-3 bg-white/5 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-white/5">
                        <Lock size={12} /> Verrouillé
                      </span>
                    ) : isCompleted ? (
                      <span className="text-[11px] font-bold text-win bg-win/10 px-3 py-1.5 rounded-lg flex items-center gap-1.5 border border-win/20">
                        <CheckCircle size={12} /> Complété
                      </span>
                    ) : isInProgress ? (
                      <button className="px-5 py-2.5 text-[11px] font-bold text-white bg-accent hover:bg-accent-2 transition-all duration-300 rounded-xl flex items-center gap-2 shadow-[0_0_15px_rgba(243,108,0,0.3)]">
                        <Play size={12} fill="currentColor" /> Reprendre
                      </button>
                    ) : (
                      <button className="px-5 py-2.5 text-[11px] font-bold text-txt hover:text-white bg-white/5 border border-white/10 hover:border-accent group-hover:bg-accent group-hover:border-accent transition-all duration-300 rounded-xl flex items-center gap-2">
                        <Play size={12} className="group-hover:fill-current" /> Commencer
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const ModuleLessonsPage: React.FC = () => {
  return (
    <FeatureGate 
      feature="hasAcademy"
      fallbackTitle="Academy BTrade Réservée aux Membres Pro"
      fallbackDesc="Accédez à des cours exclusifs, des masterclass sur le price action, des modules sur la psychologie du trading et des quiz pour valider vos compétences."
    >
      <ModuleLessonsHub />
    </FeatureGate>
  );
};

export default ModuleLessonsPage;
