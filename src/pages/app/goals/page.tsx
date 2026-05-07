import React from 'react';
import { Target, TrendingUp, Star, Clock, CheckCircle2 } from 'lucide-react';

const GoalsPage: React.FC = () => {
  const goals = [
    { title: 'Passer Challenge 100k', target: '$10,000 PnL', progress: 65, category: 'Trading', icon: Target },
    { title: 'Épargne de Précaution', target: '$20,000', progress: 85, category: 'Finance', icon: Star },
    { title: 'Capital Personnel', target: '$50,000', progress: 40, category: 'Investissement', icon: TrendingUp },
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mes Objectifs</h2>
          <p className="text-txt-2 text-sm">Visualisez et suivez votre progression vers la liberté financière.</p>
        </div>
        <button className="btn-primary">+ Nouvel Objectif</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {goals.map((goal, i) => (
          <div key={i} className="glass p-8 rounded-3xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
              <goal.icon size={80} />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <goal.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-txt-3 uppercase tracking-widest">{goal.category}</span>
            </div>

            <h3 className="text-xl font-bold mb-1">{goal.title}</h3>
            <div className="text-sm text-txt-2 mb-8 flex items-center gap-2">
              <Target size={14} className="text-accent" />
              Objectif: <span className="font-bold text-txt">{goal.target}</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-txt-2">Progression</span>
                <span className="text-accent">{goal.progress}%</span>
              </div>
              <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full bg-accent rounded-full transition-all duration-1000" 
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <Clock size={20} className="text-accent" />
            Timeline de Réussite
          </h3>
          <div className="space-y-6">
            {[
              { date: 'Juin 2026', task: 'Validation Phase 2 Topstep', done: true },
              { date: 'Août 2026', task: 'Atteindre $30k Situation Nette', done: false },
              { date: 'Déc 2026', task: 'Premier Payout de $5k', done: false },
            ].map((step, i) => (
              <div key={i} className="flex gap-4 items-start">
                <div className={`mt-1 ${step.done ? 'text-win' : 'text-txt-3'}`}>
                  {step.done ? <CheckCircle2 size={18} /> : <div className="w-[18px] h-[18px] border-2 border-current rounded-full" />}
                </div>
                <div>
                  <div className="text-xs font-bold text-txt-3 uppercase tracking-widest">{step.date}</div>
                  <div className={`font-bold ${step.done ? 'text-txt-2 line-through' : 'text-txt'}`}>{step.task}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl bg-gradient-to-br from-accent/5 to-transparent border-accent/20">
          <h3 className="text-lg font-bold mb-4 italic">Prochain Milestone</h3>
          <p className="text-txt-2 mb-6 text-sm">
            Vous êtes à seulement **$3,500** de valider votre premier objectif financier de l'année. 
            Gardez le cap sur votre gestion des risques !
          </p>
          <div className="p-4 rounded-2xl bg-surface border border-accent/20 flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-accent flex items-center justify-center text-white">
              <Star size={24} />
            </div>
            <div>
              <div className="text-xs font-bold text-txt-3 uppercase">Reward à la clé</div>
              <div className="font-bold">Dîner gastronomique & Weekend détente</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GoalsPage;
