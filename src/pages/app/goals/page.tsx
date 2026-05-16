import React, { useState } from 'react';
import { Target, TrendingUp, Star, Clock, CheckCircle2, Plus } from 'lucide-react';
import { useObjectifs } from '../../../hooks/useObjectifs';
import { AddGoalModal } from '../../../components/finance/AddGoalModal';

const GoalsPage: React.FC = () => {
  const { objectifs, isLoading } = useObjectifs();
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mes Objectifs</h2>
          <p className="text-txt-2 text-sm">Visualisez et suivez votre progression vers la liberté financière.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus size={18} /> Nouvel Objectif
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {objectifs.map((goal: any) => (
          <div key={goal.id} className="glass p-8 rounded-3xl relative overflow-hidden group">
            <div 
              className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity"
              style={{ color: goal.couleur }}
            >
              <Target size={80} />
            </div>
            
            <div className="flex items-center gap-3 mb-6">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center"
                style={{ backgroundColor: `${goal.couleur}15`, color: goal.couleur }}
              >
                <Target size={20} />
              </div>
              <span className="text-[10px] font-bold text-txt-3 uppercase tracking-widest">
                {goal.completed ? 'Atteint' : 'En cours'}
              </span>
            </div>

            <h3 className="text-xl font-bold mb-1">{goal.nom}</h3>
            <div className="text-sm text-txt-2 mb-8 flex items-center gap-2">
              <Target size={14} style={{ color: goal.couleur }} />
              Cible: <span className="font-bold text-txt">{Number(goal.montantCible).toLocaleString()}$</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                <span className="text-txt-2">
                  {Number(goal.montantActuel).toLocaleString()}$ / {Number(goal.montantCible).toLocaleString()}$
                </span>
                <span style={{ color: goal.couleur }}>{goal.progressionPct}%</span>
              </div>
              <div className="h-2 w-full bg-border rounded-full overflow-hidden">
                <div 
                  className="h-full rounded-full transition-all duration-1000" 
                  style={{ width: `${goal.progressionPct}%`, backgroundColor: goal.couleur }}
                />
              </div>
            </div>
          </div>
        ))}
        {objectifs.length === 0 && !isLoading && (
          <div className="col-span-1 lg:col-span-3 py-12 text-center glass rounded-3xl border border-dashed border-border">
            <Target size={48} className="mx-auto text-txt-3 mb-4" />
            <h3 className="text-lg font-bold mb-2">Aucun objectif défini</h3>
            <p className="text-txt-2 mb-6">Commencez à fixer vos objectifs financiers pour suivre votre progression.</p>
            <button 
              onClick={() => setIsModalOpen(true)}
              className="btn-primary inline-flex items-center gap-2"
            >
              <Plus size={18} /> Créer mon premier objectif
            </button>
          </div>
        )}
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

      <AddGoalModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default GoalsPage;
