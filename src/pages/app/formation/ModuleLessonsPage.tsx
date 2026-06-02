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
  coverImage?: string;
}

interface LessonListItem {
  id: string;
  titre: string;
  ordre: number;
  thumbnail?: string;
  statut: 'locked' | 'available' | 'in_progress' | 'completed';
  lecture_done: boolean;
  quiz_passed: boolean;
  devoir_done: boolean;
}

interface LessonsResponse {
  module: ModuleInfo;
  lessons: LessonListItem[];
}

function stripEmoji(text: string): string {
  return text.replace(/\p{Extended_Pictographic}/gu, '').replace(/\s+/g, ' ').trim();
}

const Step: React.FC<{ done: boolean; label: string }> = ({ done, label }) => (
  <span className={`flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider ${done ? 'text-win' : 'text-txt-3'}`}>
    <span className={`w-1 h-1 rounded-full shrink-0 ${done ? 'bg-win' : 'bg-border'}`} />
    {label}
  </span>
);

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
      <div className="flex flex-col items-center justify-center py-32 gap-5">
        <div className="relative w-8 h-8">
          <div className="absolute inset-0 border border-accent/20 rounded-full" />
          <div className="absolute inset-0 border-t border-accent rounded-full animate-spin" />
        </div>
        <span className="text-[10px] font-mono text-txt-3 uppercase tracking-widest">Chargement des leçons</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="border border-loss/20 rounded-xl p-10 text-center max-w-md mx-auto my-16">
        <AlertCircle size={32} className="text-loss mx-auto mb-4" />
        <p className="text-sm font-bold text-loss mb-2">Module introuvable</p>
        <p className="text-xs text-txt-3 mb-6">Impossible de charger le contenu de ce module.</p>
        <button
          onClick={() => navigate('/app/formation')}
          className="btn-primary text-xs py-2 px-5"
        >
          Retour à l'Academy
        </button>
      </div>
    );
  }

  const { module, lessons } = data;
  const completedCount = lessons.filter(l => l.statut === 'completed').length;
  const progressPct = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

  return (
    <div className="animate-[fadeIn_0.4s_ease-out]">

      {/* ── BACK ─────────────────────────────────────────────── */}
      <button
        onClick={() => navigate('/app/formation')}
        className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-txt-3 hover:text-txt transition-colors mb-8 group uppercase tracking-widest"
      >
        <ChevronLeft size={14} className="group-hover:-translate-x-0.5 transition-transform" />
        Academy
      </button>

      {/* ── MODULE HEADER ─────────────────────────────────────── */}
      <div className="relative rounded-xl overflow-hidden mb-8 border border-border">
        {/* Cover image as background */}
        {module.coverImage ? (
          <>
            <img
              src={module.coverImage}
              alt={module.titre}
              className="absolute inset-0 w-full h-full object-cover opacity-20"
            />
            <div className="absolute inset-0 bg-gradient-to-r from-bg via-bg/80 to-transparent" />
          </>
        ) : (
          <div className="absolute inset-0 bg-surface" />
        )}

        {/* Ghost number */}
        <span
          className="absolute right-0 top-1/2 -translate-y-1/2 text-[120px] md:text-[160px] font-black font-mono leading-none select-none pointer-events-none opacity-[0.04]"
          aria-hidden="true"
        >
          {String(module.ordre).padStart(2, '0')}
        </span>

        <div className="relative z-10 p-7 md:p-10">
          {/* Top row */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-[9px] font-mono font-bold text-accent uppercase tracking-[0.35em]">
              Module {String(module.ordre).padStart(2, '0')}
            </span>
            <span className="w-4 h-px bg-accent/40" />
            <span className="text-[9px] font-mono font-bold text-txt-3 uppercase tracking-[0.3em]">
              {lessons.length} leçon{lessons.length > 1 ? 's' : ''}
            </span>
          </div>

          <h1 className="text-3xl md:text-4xl font-black tracking-[-0.025em] leading-tight text-white mb-3">
            {module.titre}
          </h1>
          <p className="text-sm text-txt-3 leading-relaxed max-w-2xl mb-6">
            {stripEmoji(module.description)}
          </p>

          {/* Progress */}
          <div className="flex items-center gap-4 max-w-xs">
            <div className="flex-1 h-px bg-border relative">
              <div
                className="absolute top-[-0.5px] left-0 h-0.5 bg-accent transition-all duration-700"
                style={{ width: `${progressPct}%` }}
              />
            </div>
            <span className={`text-[9px] font-mono font-bold shrink-0 ${progressPct === 100 ? 'text-win' : 'text-accent'}`}>
              {progressPct}%
            </span>
            <span className="text-[9px] font-mono text-txt-3 shrink-0">
              {completedCount}/{lessons.length}
            </span>
          </div>
        </div>
      </div>

      {/* ── LESSON LIST ───────────────────────────────────────── */}
      <div>
        <div className="flex items-center gap-4 mb-0 pb-4 border-b border-border">
          <p className="text-[9px] font-mono font-bold text-txt-3 uppercase tracking-[0.32em]">
            Plan du cours
          </p>
          <div className="flex-1 h-px bg-border" />
          <p className="text-[9px] font-mono text-txt-3">
            <BookOpen size={10} className="inline mr-1" />
            {lessons.length} leçons
          </p>
        </div>

        {lessons.length === 0 ? (
          <div className="py-16 text-center border-b border-border">
            <p className="text-xs text-txt-3">Aucune leçon disponible pour ce module.</p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {lessons.map((lesson) => {
              const isLocked = lesson.statut === 'locked';
              const isCompleted = lesson.statut === 'completed';
              const isInProgress = lesson.statut === 'in_progress';

              return (
                <div
                  key={lesson.id}
                  onClick={() => !isLocked && navigate(`/app/formation/${slug}/${lesson.id}`)}
                  className={`
                    relative group py-5 flex items-center gap-4 md:gap-6 transition-colors duration-150
                    -mx-6 px-6
                    ${isLocked
                      ? 'opacity-50 cursor-not-allowed'
                      : isInProgress
                        ? 'cursor-pointer hover:bg-white/[0.016] border-l-2 border-accent'
                        : 'cursor-pointer hover:bg-white/[0.016] border-l-2 border-transparent'
                    }
                  `}
                >
                  {/* Lesson number */}
                  <div className="shrink-0 w-8 text-right hidden sm:block">
                    <span className={`text-sm font-black font-mono ${
                      isLocked ? 'text-txt-3/50' : isCompleted ? 'text-win/60' : isInProgress ? 'text-accent' : 'text-txt-3'
                    }`}>
                      {String(lesson.ordre).padStart(2, '0')}
                    </span>
                  </div>

                  {/* Thumbnail or status icon */}
                  <div className={`
                    shrink-0 w-11 h-11 rounded-lg overflow-hidden border transition-colors
                    ${isLocked
                      ? 'border-border bg-elevated flex items-center justify-center'
                      : isCompleted
                        ? 'border-win/20 bg-win/5 flex items-center justify-center'
                        : 'border-white/10 group-hover:border-accent/30'
                    }
                  `}>
                    {lesson.thumbnail && !isLocked ? (
                      <img src={lesson.thumbnail} alt={lesson.titre} className="w-full h-full object-cover" />
                    ) : isLocked ? (
                      <Lock size={14} className="text-txt-3/60" />
                    ) : isCompleted ? (
                      <CheckCircle size={16} className="text-win" />
                    ) : (
                      <div className="w-full h-11 bg-elevated flex items-center justify-center">
                        <span className="text-[10px] font-mono font-bold text-txt-3">{lesson.ordre}</span>
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0 relative z-10">
                    <h4 className={`text-sm font-bold tracking-tight truncate mb-1.5 transition-colors duration-150 ${
                      isLocked
                        ? 'text-txt-3'
                        : isInProgress
                          ? 'text-white group-hover:text-accent'
                          : 'text-white/90 group-hover:text-white'
                    }`}>
                      {lesson.titre}
                    </h4>
                    {!isLocked && (
                      <div className="flex flex-wrap items-center gap-3">
                        <Step done={lesson.lecture_done} label="Lecture" />
                        <Step done={lesson.quiz_passed} label="Quiz" />
                        <Step done={lesson.devoir_done} label="Devoir" />
                      </div>
                    )}
                  </div>

                  {/* Status / CTA */}
                  <div className="shrink-0 relative z-10">
                    {isLocked ? (
                      <span className="text-[9px] font-mono font-bold text-txt-3/60 border border-border/50 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <Lock size={10} /> Verrouillé
                      </span>
                    ) : isCompleted ? (
                      <span className="text-[9px] font-mono font-bold text-win border border-win/20 bg-win/5 px-2.5 py-1 rounded-lg flex items-center gap-1">
                        <CheckCircle size={10} /> Complété
                      </span>
                    ) : isInProgress ? (
                      <button className="flex items-center gap-1.5 text-[11px] font-bold text-white bg-accent hover:bg-accent-2 px-4 py-2 rounded-lg transition-all shadow-[0_0_16px_rgba(243,108,0,0.2)]">
                        <Play size={10} fill="currentColor" /> Reprendre
                      </button>
                    ) : (
                      <button className="flex items-center gap-1.5 text-[11px] font-bold text-txt-3 border border-border group-hover:border-white/20 group-hover:text-txt-2 px-4 py-2 rounded-lg transition-colors">
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
      fallbackTitle="Academy Behind The Trade Réservée aux Membres Pro"
      fallbackDesc="Accédez à des cours exclusifs, des masterclass sur le price action, des modules sur la psychologie du trading et des quiz pour valider vos compétences."
    >
      <ModuleLessonsHub />
    </FeatureGate>
  );
};

export default ModuleLessonsPage;
