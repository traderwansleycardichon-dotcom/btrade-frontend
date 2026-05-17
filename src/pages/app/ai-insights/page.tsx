import React from 'react';
import { Sparkles, MessageSquare, Lightbulb, AlertCircle, Trash2, Zap } from 'lucide-react';
import { useAiInsights, AiInsight } from '../../../hooks/useAiInsights';
import { FeatureGate } from '../../../components/ui/FeatureGate';

const AIInsightsPage: React.FC = () => {
  const { insights, isLoading, error, deleteInsight } = useAiInsights();

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Sparkles className="text-accent animate-pulse" />
            Insights IA
          </h2>
          <p className="text-txt-2 text-sm">
            Analyse intelligente de vos performances et recommandations personnalisées.
          </p>
        </div>
        <button
          disabled
          className="btn-primary bg-gradient-to-r from-accent to-accent-2 flex items-center gap-2 border-none opacity-60 cursor-not-allowed"
          title="Disponible après quelques trades enregistrés"
        >
          <Zap size={18} />
          Générer Analyse
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="glass p-6 rounded-3xl">
            <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
              <Lightbulb size={20} className="text-accent" />
              Insights récents
            </h3>

            {isLoading && (
              <p className="text-txt-2 text-sm text-center py-8">Chargement...</p>
            )}
            {error && (
              <p className="text-loss text-sm text-center py-8">
                Erreur : impossible de charger les insights.
              </p>
            )}
            {!isLoading && !error && insights.length === 0 && (
              <div className="text-center py-12">
                <MessageSquare className="mx-auto text-txt-3 mb-4" size={48} />
                <p className="text-txt-2 text-sm italic mb-2">
                  Aucun insight IA pour le moment.
                </p>
                <p className="text-txt-3 text-xs">
                  Les insights seront générés automatiquement après quelques trades.
                </p>
              </div>
            )}

            <div className="space-y-3">
              {insights.map((i: AiInsight) => (
                <div
                  key={i.id}
                  className="p-4 rounded-2xl bg-bg/50 border border-border group hover:border-accent/30 transition-all"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      {i.module && (
                        <span className="text-[10px] font-bold uppercase text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                          {i.module}
                        </span>
                      )}
                      {i.typeInsight && (
                        <span className="text-[10px] font-bold uppercase text-txt-2 bg-elevated px-2 py-0.5 rounded-full">
                          {i.typeInsight}
                        </span>
                      )}
                      <span className="text-[10px] font-mono text-txt-3">
                        {new Date(i.generatedAt).toLocaleString('fr-FR')}
                      </span>
                    </div>
                    <button
                      onClick={() => deleteInsight.mutate(i.id)}
                      className="text-txt-3 hover:text-loss opacity-0 group-hover:opacity-100 transition-all"
                      title="Supprimer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                  {i.titre && <p className="font-bold text-sm mb-1">{i.titre}</p>}
                  {i.contenu && (
                    <p className="text-sm text-txt-2 leading-relaxed">{i.contenu}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl">
            <h3 className="text-lg font-bold mb-6">Statistiques</h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-xs text-txt-2 uppercase tracking-widest">Total</span>
                <span className="text-2xl font-mono font-bold text-accent">{insights.length}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-xs text-txt-2 uppercase tracking-widest">Actifs</span>
                <span className="text-2xl font-mono font-bold text-win">
                  {insights.filter((i: AiInsight) =>
                    !i.expiresAt || new Date(i.expiresAt) > new Date()
                  ).length}
                </span>
              </div>
            </div>
          </div>

          <div className="p-6 rounded-3xl bg-elevated border border-border">
            <div className="flex items-center gap-3 mb-3">
              <AlertCircle size={20} className="text-accent" />
              <h4 className="font-bold text-sm">Mode Expert IA</h4>
            </div>
            <p className="text-xs text-txt-2 leading-relaxed">
              L'IA analyse vos setups et trades pour identifier vos forces, faiblesses, et patterns
              comportementaux. Plus vous tradez, plus les insights sont précis.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

const ProtectedAIInsightsPage: React.FC = () => {
  return (
    <FeatureGate 
      feature="hasAiInsights"
      fallbackTitle="Insights IA Réservé aux Membres Pro"
      fallbackDesc="L'IA analyse vos setups et vos trades pour identifier automatiquement vos forces, faiblesses et vos patterns de trading personnalisés."
    >
      <AIInsightsPage />
    </FeatureGate>
  );
};

export default ProtectedAIInsightsPage;
