import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { GraduationCap, Play, BookOpen, Search, Award, CheckCircle, Lock } from 'lucide-react';
import api from '../../../lib/api';
import { FeatureGate } from '../../../components/ui/FeatureGate';

interface Module {
  id: string;
  slug: string;
  titre: string;
  description: string;
  ordre: number;
  icone: string;
  progressionPct: number;
  certified: boolean;
  lessonsCount: number;
  lessonsCompleted: number;
  prochaineLessonId: string | null;
}

interface ModulesResponse {
  modules: Module[];
  progressionGlobale: number;
}

const FormationHub: React.FC = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: formationData, isLoading, error } = useQuery<ModulesResponse>({
    queryKey: ['formationModules'],
    queryFn: async () => {
      const { data } = await api.get('/api/formation/modules');
      return data.data;
    },
  });

  const modules = formationData?.modules || [];
  const progressionGlobale = formationData?.progressionGlobale || 0;

  // Filter modules based on search term
  const filteredModules = modules.filter(mod =>
    mod.titre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    mod.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Compute stats for certificates
  const totalModules = modules.length;
  const certifiedModules = modules.filter(m => m.certified).length;

  // Find the last active lesson/module to resume
  const nextUp = modules.find(m => m.progressionPct > 0 && m.progressionPct < 100) || 
                  modules.find(m => m.progressionPct === 0 && m.lessonsCount > 0);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-10 h-10 border-4 border-accent border-t-transparent rounded-full animate-spin" />
        <span className="text-txt-2 text-xs font-medium">Chargement de l'Academy...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-8 text-center rounded-3xl border border-loss/20 max-w-md mx-auto my-10">
        <p className="text-sm font-bold text-loss mb-2">Erreur de chargement</p>
        <p className="text-xs text-txt-2 mb-4">Impossible de récupérer les modules de formation pour le moment.</p>
        <button 
          onClick={() => window.location.reload()} 
          className="btn-primary text-xs py-1.5 px-4"
        >
          Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-2xl font-bold">BTrade Academy</h2>
          <p className="text-txt-2 text-sm">Le centre de formation pour devenir un trader rentable et serein.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" />
          <input 
            type="text" 
            placeholder="Rechercher un cours..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-surface border border-border rounded-xl py-2 pl-10 pr-4 text-sm focus:outline-none focus:border-accent/55 transition-all text-txt"
          />
        </div>
      </div>

      {/* Modules Grid */}
      {filteredModules.length === 0 ? (
        <div className="glass p-12 text-center rounded-3xl border border-border">
          <BookOpen size={40} className="text-txt-3 mx-auto mb-3" />
          <p className="text-sm font-bold">Aucun module trouvé</p>
          <p className="text-xs text-txt-2">Essayez de modifier vos critères de recherche.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredModules.map((mod) => {
            const isCompleted = mod.progressionPct === 100;
            return (
              <div 
                key={mod.id} 
                className="glass group overflow-hidden rounded-3xl border border-border hover:border-accent/30 transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  {/* Card Header with Icon representation */}
                  <div className="h-40 bg-elevated/40 flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-500 relative border-b border-border/30">
                    <span role="img" aria-label={mod.titre}>
                      {mod.icone || '📖'}
                    </span>
                    {isCompleted && (
                      <div className="absolute top-4 right-4 bg-win/20 text-win border border-win/30 rounded-full p-1 shadow-lg" title="Module complété">
                        <CheckCircle size={16} />
                      </div>
                    )}
                  </div>

                  {/* Card Content */}
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-[10px] font-bold text-accent uppercase tracking-widest px-2 py-0.5 rounded bg-accent/10">
                        Ordre {mod.ordre}
                      </span>
                      <span className="text-[10px] font-bold text-txt-3 font-mono">
                        {mod.lessonsCompleted}/{mod.lessonsCount} leçons
                      </span>
                    </div>
                    <h3 className="text-lg font-bold mb-2 group-hover:text-accent transition-colors truncate" title={mod.titre}>
                      {mod.titre}
                    </h3>
                    <p className="text-xs text-txt-2 line-clamp-2 mb-4 leading-relaxed h-8">
                      {mod.description}
                    </p>
                  </div>
                </div>

                {/* Progress Bar & CTA */}
                <div className="px-6 pb-6 pt-2 border-t border-border/10">
                  {mod.lessonsCount > 0 && (
                    <div className="space-y-1.5 mb-4">
                      <div className="flex justify-between items-center text-[10px] font-bold text-txt-3">
                        <span>Progression</span>
                        <span className="font-mono">{Math.round(mod.progressionPct)}%</span>
                      </div>
                      <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-accent transition-all duration-500 rounded-full" 
                          style={{ width: `${mod.progressionPct}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center justify-end">
                    <button 
                      onClick={() => navigate(`/app/formation/${mod.slug}`)}
                      className="px-4 py-2 text-xs font-bold text-white bg-accent hover:bg-accent-2 transition-colors rounded-xl flex items-center gap-1.5 w-full justify-center"
                    >
                      <Play size={12} fill="currentColor" />
                      {mod.progressionPct > 0 ? (isCompleted ? 'Revoir' : 'Continuer') : 'Commencer'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Resume learning & certifications */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-3xl flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold mb-6">Continuer l'apprentissage</h3>
            {nextUp ? (
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6 p-4 rounded-2xl bg-bg/50 border border-border group hover:border-accent/25 transition-all">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-accent shrink-0">
                  <GraduationCap size={24} />
                </div>
                <div className="flex-1 min-w-0 w-full">
                  <div className="text-xs font-bold text-txt-3 uppercase mb-1">Module actif</div>
                  <div className="font-bold text-sm truncate">{nextUp.titre}</div>
                  <div className="h-1.5 w-full bg-border rounded-full mt-3 overflow-hidden">
                    <div 
                      className="h-full bg-accent transition-all duration-300" 
                      style={{ width: `${nextUp.progressionPct}%` }}
                    />
                  </div>
                </div>
                <button 
                  onClick={() => navigate(`/app/formation/${nextUp.slug}`)}
                  className="btn-secondary py-2 text-xs w-full sm:w-auto mt-3 sm:mt-0 px-4 text-center whitespace-nowrap"
                >
                  Reprendre
                </button>
              </div>
            ) : (
              <div className="p-4 text-center text-xs text-txt-3 border border-dashed border-border rounded-2xl">
                Vous n'avez pas de formation en cours. Choisissez un module ci-dessus pour commencer !
              </div>
            )}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-4 bg-gradient-to-br from-win/5 to-transparent">
          <div className="w-16 h-16 rounded-full bg-win/10 flex items-center justify-center text-win">
            <Award size={32} />
          </div>
          <h3 className="text-lg font-bold">Vos Certifications</h3>
          <p className="text-xs text-txt-2">Validez tous les quiz et devoirs de chaque module pour débloquer vos certificats.</p>
          <div className="w-full pt-4 border-t border-border">
            <span className="text-[10px] font-bold text-txt-3 uppercase tracking-wider font-mono">
              {certifiedModules} / {totalModules} Modules Certifiés
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const FormationPage: React.FC = () => {
  return (
    <FeatureGate 
      feature="hasAcademy"
      fallbackTitle="Academy BTrade Réservée aux Membres Pro"
      fallbackDesc="Accédez à des cours exclusifs, des masterclass sur le price action, des modules sur la psychologie du trading et des quiz pour valider vos compétences."
    >
      <FormationHub />
    </FeatureGate>
  );
};

export default FormationPage;
