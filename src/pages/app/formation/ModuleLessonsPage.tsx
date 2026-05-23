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
      <div className="glass p-6 sm:p-8 rounded-3xl border border-border flex flex-col md:flex-row gap-6 items-start md:items-center bg-gradient-to-br from-accent/[0.02] to-transparent">
        <div className="w-16 h-16 rounded-2xl bg-accent/10 border border-accent/20 flex items-center justify-center text-4xl shrink-0">
          <span>{module.icone || '📖'}</span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold text-accent uppercase tracking-widest px-2 py-0.5 rounded bg-accent/10">
              Module {module.ordre}
            </span>
            <span className="text-[10px] text-txt-3 font-mono font-bold">
              {lessons.length} leçons au total
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold">{module.titre}</h2>
          <p className="text-xs sm:text-sm text-txt-2 leading-relaxed max-w-2xl">{module.description}</p>
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
                    p-4 rounded-2xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all duration-200
                    ${isLocked 
                      ? 'bg-surface/30 border-border/40 opacity-55 cursor-not-allowed' 
                      : 'glass border-border hover:border-accent/30 cursor-pointer hover:bg-bg/40'
                    }
                  `}
                >
                  <div className="flex items-start gap-4 min-w-0">
                    {/* Index and Icon */}
                    <div className={`
                      w-10 h-10 rounded-xl flex items-center justify-center shrink-0 font-bold font-mono text-xs
                      ${isLocked 
                        ? 'bg-border/30 text-txt-3' 
                        : isCompleted 
                          ? 'bg-win/10 text-win' 
                          : 'bg-accent/10 text-accent'
                      }
                    `}>
                      {isLocked ? (
                        <Lock size={14} />
                      ) : isCompleted ? (
                        <CheckCircle size={16} />
                      ) : (
                        <span>{lesson.ordre}</span>
                      )}
                    </div>

                    {/* Lesson Title and steps */}
                    <div className="min-w-0 space-y-1">
                      <h4 className={`text-sm font-bold truncate ${isLocked ? 'text-txt-3' : 'text-txt'}`}>
                        {lesson.titre}
                      </h4>
                      
                      {!isLocked && (
                        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[10px] font-medium text-txt-3 font-mono">
                          <span className={lesson.lecture_done ? 'text-win' : ''}>
                            {lesson.lecture_done ? '✓ Lecture' : '○ Lecture'}
                          </span>
                          <span>·</span>
                          <span className={lesson.quiz_passed ? 'text-win' : ''}>
                            {lesson.quiz_passed ? '✓ Quiz' : '○ Quiz'}
                          </span>
                          <span>·</span>
                          <span className={lesson.devoir_done ? 'text-win' : ''}>
                            {lesson.devoir_done ? '✓ Devoir' : '○ Devoir'}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions / Status badges */}
                  <div className="w-full sm:w-auto flex items-center justify-end shrink-0">
                    {isLocked ? (
                      <span className="text-[10px] font-bold text-txt-3 bg-border/20 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Lock size={10} /> Verrouillé
                      </span>
                    ) : isCompleted ? (
                      <span className="text-[10px] font-bold text-win bg-win/10 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle size={10} /> Complété
                      </span>
                    ) : isInProgress ? (
                      <button className="px-3.5 py-1.5 text-xs font-bold text-white bg-accent hover:bg-accent-2 transition-colors rounded-xl flex items-center gap-1.5">
                        <Play size={10} fill="currentColor" /> Reprendre
                      </button>
                    ) : (
                      <button className="px-3.5 py-1.5 text-xs font-bold text-txt-2 hover:text-white bg-bg border border-border hover:border-accent/40 transition-all rounded-xl flex items-center gap-1.5">
                        <Play size={10} /> Commencer
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
