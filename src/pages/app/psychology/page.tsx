import React, { useState } from 'react';
import { Brain, Heart, Zap, Shield, Target, TrendingUp } from 'lucide-react';
import { AddPsychologyModal } from '../../../components/trading/AddPsychologyModal';
import { usePsychology } from '../../../hooks/usePsychology';
import { 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts';

const MOODS: Record<string, string> = {
  'confident': 'Confiant',
  'calm': 'Calme',
  'neutral': 'Neutre',
  'anxious': 'Anxieux',
  'frustrated': 'Frustré',
  'tilt': 'Tilt'
};

const PsychologyPage: React.FC = () => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { trackings, isLoading } = usePsychology();

  const emotionalStats = [
    { label: 'Indice de Discipline', value: trackings.length > 0 ? `${(trackings.reduce((acc: number, t: any) => acc + t.disciplineScore, 0) / trackings.length).toFixed(1)}/10` : 'N/A', color: 'text-win', icon: Shield },
    { label: 'Niveau Fatigue (Moy)', value: trackings.length > 0 ? `${(trackings.reduce((acc: number, t: any) => acc + t.fatigueLevel, 0) / trackings.length).toFixed(1)}/10` : 'N/A', color: 'text-accent', icon: Heart },
    { label: 'Total Entrées', value: trackings.length.toString(), color: 'text-win', icon: Zap },
    { label: 'Overtrading', value: 'Nul', color: 'text-win', icon: Target },
  ];

  // Préparation des données pour le graphique (inverser pour ordre chronologique)
  const chartData = [...trackings].reverse().slice(-10).map((t: any) => ({
    date: new Date(t.date || t.createdAt).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' }),
    discipline: t.disciplineScore
  }));

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Psychologie & État d'Esprit</h2>
          <p className="text-txt-2 text-sm">Analysez vos émotions pour améliorer votre discipline de trading.</p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="btn-primary flex items-center gap-2"
        >
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
            <div className={`text-3xl font-mono font-bold ${stat.color}`}>
              {isLoading ? '...' : stat.value}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="glass p-8 rounded-3xl">
          <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
            <TrendingUp size={20} className="text-accent" />
            Évolution Discipline (10 derniers)
          </h3>
          <div className="h-64 w-full">
            {chartData.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorDisc" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#F36C00" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#F36C00" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    domain={[0, 10]} 
                    stroke="#666" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false} 
                    ticks={[0, 5, 10]}
                  />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#1A1A1A', border: '1px solid #333', borderRadius: '12px', fontSize: '12px' }}
                    itemStyle={{ color: '#F36C00' }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="discipline" 
                    stroke="#F36C00" 
                    strokeWidth={3}
                    fillOpacity={1} 
                    fill="url(#colorDisc)" 
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : !isLoading && (
              <div className="h-full flex items-center justify-center text-txt-3 text-sm italic">
                Aucune donnée pour afficher le graphique.
              </div>
            )}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-20 h-20 rounded-full bg-accent/10 flex items-center justify-center text-accent">
            <Brain size={40} />
          </div>
          <h3 className="text-xl font-bold italic">"Le trading n'est pas une question de stratégie, c'est une question de psychologie."</h3>
          <p className="text-sm text-txt-2 max-w-xs">
            Remplissez votre journal quotidiennement pour identifier les schémas émotionnels qui précèdent vos meilleures et pires sessions de trading.
          </p>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl">
        <h3 className="text-lg font-bold mb-6">Notes Récentes de Psychologie</h3>
        <div className="space-y-4">
          {trackings.map((t: any) => (
            <div key={t.id} className="p-4 rounded-2xl bg-bg/50 border border-border">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-sm">
                  {new Date(t.date || t.createdAt).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
                </span>
                <span className={`text-[10px] font-bold uppercase ${t.tiltDetected || t.emotionalState === 'tilt' || t.emotionalState === 'frustrated' ? 'text-loss' : 'text-win'}`}>
                  {MOODS[t.emotionalState] || t.emotionalState} • Dis: {t.disciplineScore}/10
                </span>
              </div>
              <p className="text-sm text-txt-2 italic">"{t.note || 'Aucune note.'}"</p>
            </div>
          ))}
          {trackings.length === 0 && !isLoading && (
            <p className="text-center text-txt-3 text-sm italic py-4">
              Aucun suivi psychologique récent. Prenez un moment pour noter votre état d'esprit.
            </p>
          )}
        </div>
      </div>

      <AddPsychologyModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default PsychologyPage;
