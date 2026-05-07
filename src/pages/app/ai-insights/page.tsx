import React from 'react';
import { Sparkles, MessageSquare, Lightbulb, Zap, AlertCircle, TrendingDown } from 'lucide-react';

const AIInsightsPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Sparkles className="text-accent animate-pulse" />
            Insights IA
          </h2>
          <p className="text-txt-2 text-sm">Analyse intelligente de vos performances et recommandations personnalisées.</p>
        </div>
        <button className="btn-primary bg-gradient-to-r from-accent to-accent-2 flex items-center gap-2 border-none">
          <Zap size={18} />
          Générer Analyse
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="glass p-8 rounded-3xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 text-accent opacity-5">
              <MessageSquare size={120} />
            </div>
            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
              <Lightbulb size={20} className="text-accent" />
              Recommandation de la Semaine
            </h3>
            <div className="prose prose-invert max-w-none">
              <p className="text-txt-2 leading-relaxed italic border-l-4 border-accent pl-6 py-2 bg-accent/5 rounded-r-xl">
                "Basé sur vos 20 derniers trades, nous avons remarqué que votre winrate chute de 40% après 16h00 (session US tardive). 
                L'IA suggère d'arrêter de prendre de nouvelles positions après 15h30 pour protéger votre capital du Drawdown de fin de journée."
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass p-6 rounded-3xl border-win/20 bg-win/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-win/10 flex items-center justify-center text-win">
                  <TrendingDown size={20} />
                </div>
                <h4 className="font-bold">Point Fort</h4>
              </div>
              <p className="text-sm text-txt-2">Excellente gestion du risque sur les paires GBP/USD avec un R:R moyen de 2.5.</p>
            </div>
            <div className="glass p-6 rounded-3xl border-loss/20 bg-loss/5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-loss/10 flex items-center justify-center text-loss">
                  <AlertCircle size={20} />
                </div>
                <h4 className="font-bold">Axe d'Amélioration</h4>
              </div>
              <p className="text-sm text-txt-2">Tendance à déplacer le Stop Loss trop tôt vers le Break Even lors de forte volatilité.</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="glass p-8 rounded-3xl">
            <h3 className="text-lg font-bold mb-6">Score de Cohérence</h3>
            <div className="relative h-40 flex items-center justify-center">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-border" />
                <circle cx="64" cy="64" r="58" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray="364" strokeDashoffset="36" className="text-accent" />
              </svg>
              <span className="absolute text-3xl font-mono font-bold">88%</span>
            </div>
            <p className="text-center text-xs text-txt-3 mt-4 px-4 uppercase tracking-widest leading-loose">
              Votre régularité est supérieure à 92% des traders BTrade.
            </p>
          </div>
          
          <div className="p-6 rounded-3xl bg-elevated border border-border">
            <h4 className="font-bold mb-4 text-sm">Mode Expert IA</h4>
            <p className="text-xs text-txt-2 mb-6 leading-relaxed">
              L'IA analyse vos setups préférés et prédit votre probabilité de succès sur le prochain trade.
            </p>
            <button className="w-full btn-secondary text-xs opacity-50 cursor-not-allowed">
              Activer (Bientôt)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIInsightsPage;
