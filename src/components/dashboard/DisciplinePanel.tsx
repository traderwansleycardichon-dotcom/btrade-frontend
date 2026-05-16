import React from 'react';
import { Target, Shield, Zap, AlertCircle } from 'lucide-react';
import { MOCK_DISCIPLINE } from '../../lib/mocks';

export const DisciplinePanel: React.FC = () => {
  const metrics = [
    { label: 'SL Respectés', value: MOCK_DISCIPLINE.slRespected, icon: Shield, color: 'text-win' },
    { label: 'Plan Suivi', value: MOCK_DISCIPLINE.planFollowed, icon: Target, color: 'text-accent' },
    { label: 'No Revenge', value: MOCK_DISCIPLINE.noRevenge, icon: Zap, color: 'text-[#8B5CF6]' },
    { label: 'Risk < 1%', value: MOCK_DISCIPLINE.riskUnder1, icon: AlertCircle, color: 'text-win' },
  ];

  const globalScore = Math.round(metrics.reduce((acc, m) => acc + m.value, 0) / metrics.length);

  return (
    <div className="glass p-6 rounded-3xl group">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">Score Discipline</h3>
        <div className="text-2xl font-mono font-bold text-accent">{globalScore}%</div>
      </div>

      <div className="space-y-4">
        {metrics.map((m) => (
          <div key={m.label} className="relative">
            <div className="flex justify-between items-center mb-1.5">
              <div className="flex items-center gap-2">
                <m.icon size={14} className={m.color} />
                <span className="text-[11px] font-bold text-txt-2 uppercase tracking-wider">{m.label}</span>
              </div>
              <span className="text-xs font-mono font-bold">{m.value}%</span>
            </div>
            <div className="h-1.5 bg-border rounded-full overflow-hidden">
              <div 
                className={`h-full rounded-full bg-current ${m.color} transition-all duration-1000`}
                style={{ width: `${m.value}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-2xl bg-accent/5 border border-accent/10">
        <p className="text-[11px] md:text-[10px] text-txt-2 leading-relaxed italic">
          "Votre discipline est en hausse de <span className="text-accent font-bold">12%</span> cette semaine. 
          Concentrez-vous sur le respect du plan pour atteindre l'élite."
        </p>
      </div>
    </div>
  );
};
