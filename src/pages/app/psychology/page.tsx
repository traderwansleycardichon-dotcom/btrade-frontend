import React from 'react';
import { Brain, Heart, Zap, Shield, Target, TrendingUp } from 'lucide-react';

const PsychologyPage: React.FC = () => {
  const emotionalStats = [
    { label: 'Indice de Discipline', value: '85%', color: 'text-win', icon: Shield },
    { label: 'Gestion du Stress', value: 'Bien', color: 'text-accent', icon: Heart },
    { label: 'FOMO Alert', value: 'Faible', color: 'text-win', icon: Zap },
    { label: 'Overtrading', value: 'Nul', color: 'text-win', icon: Target },
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Psychologie & État d'Esprit</h2>
          <p className="text-txt-2 text-sm">Analysez vos émotions pour améliorer votre discipline de trading.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <Brain size={18} />
          Nouveau Journal Émotionnel
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {emotionalStats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl group hover:border-accent/30 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center text-txt-2 group-hover:text-accent transition-colors">
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-txt-3 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className={`text-3xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-accent" />
            Évolution du Mental
          </h3>
          <div className="h-64 flex items-end gap-2 px-4">
            {[40, 70, 45, 90, 65, 80, 85].map((h, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                <div 
                  className="w-full bg-accent/20 group-hover:bg-accent/40 rounded-t-lg transition-all duration-1000"
                  style={{ height: `${h}%` }}
                />
                <span className="text-[10px] font-bold text-txt-3 uppercase">J{i+1}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Brain size={40} />
          </div>
          <h3 className="text-xl font-bold italic">"Le trading n'est pas une question de stratégie, c'est une question de psychologie."</h3>
          <p className="text-sm text-txt-2 max-w-xs">
            Vous avez maintenu une discipline exemplaire ces 5 derniers jours. Continuez à suivre vos règles !
          </p>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl">
        <h3 className="text-lg font-bold mb-6">Notes Récentes de Psychologie</h3>
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-bg/50 border border-border">
            <div className="flex justify-between mb-2">
              <span className="font-bold text-sm">Aujourd'hui - 14:30</span>
              <span className="text-[10px] font-bold text-win uppercase">Calme</span>
            </div>
            <p className="text-sm text-txt-2 italic">"J'ai attendu mon setup patiemment sans forcer le trade malgré la volatilité. Fier de ma patience."</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PsychologyPage;
