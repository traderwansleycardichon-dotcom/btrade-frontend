import React from 'react';
import { Wallet, PieChart, TrendingUp, Landmark, ShieldCheck, CreditCard } from 'lucide-react';
import { KpiCard } from '../../../components/ui/KpiCard';

const PatrimoinePage: React.FC = () => {
  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mon Patrimoine</h2>
          <p className="text-txt-2 text-sm">Vue globale de vos actifs et de votre situation nette.</p>
        </div>
        <button className="btn-primary flex items-center gap-2">
          <PieChart size={18} />
          Répartition des Actifs
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <KpiCard label="Situation Nette" value="158,420" currency="$" colorClass="text-win" />
        <KpiCard label="Actifs Immobiliers" value="85,000" currency="$" />
        <KpiCard label="Investissements" value="42,300" currency="$" />
        <KpiCard label="Liquidités" value="31,120" currency="$" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass p-8 rounded-3xl">
          <h3 className="text-lg font-bold mb-6">Évolution de la Situation Nette</h3>
          <div className="h-64 flex items-end gap-3 px-4">
            {[30, 45, 40, 60, 55, 75, 85, 80, 95, 100].map((h, i) => (
              <div key={i} className="flex-1 bg-accent/20 hover:bg-accent/40 rounded-t-lg transition-all" style={{ height: `${h}%` }} />
            ))}
          </div>
        </div>

        <div className="glass p-8 rounded-3xl space-y-6">
          <h3 className="text-lg font-bold">Répartition</h3>
          <div className="space-y-4">
            {[
              { label: 'Bourse', value: '45%', color: 'bg-blue-500' },
              { label: 'Immobilier', value: '30%', color: 'bg-indigo-500' },
              { label: 'Crypto', value: '15%', color: 'bg-orange-500' },
              { label: 'Cash', value: '10%', color: 'bg-emerald-500' },
            ].map((item, i) => (
              <div key={i} className="space-y-2">
                <div className="flex justify-between text-xs font-bold uppercase tracking-widest">
                  <span className="text-txt-2">{item.label}</span>
                  <span>{item.value}</span>
                </div>
                <div className="h-1.5 w-full bg-border rounded-full overflow-hidden">
                  <div className={`h-full ${item.color}`} style={{ width: item.value }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass p-8 rounded-3xl">
        <h3 className="text-lg font-bold mb-6">Actifs & Passifs Principaux</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-win uppercase tracking-widest px-1">Actifs</h4>
            {[
              { label: 'PEA - Fortuneo', val: '$24,500', icon: TrendingUp },
              { label: 'Prop Firm Funded', val: '$12,400', icon: Wallet },
              { label: 'Assurance Vie', val: '$18,200', icon: ShieldCheck },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-win/5 border border-win/10">
                <div className="flex items-center gap-3">
                  <a.icon size={18} className="text-win" />
                  <span className="font-bold text-sm">{a.label}</span>
                </div>
                <span className="font-mono font-bold">{a.val}</span>
              </div>
            ))}
          </div>
          <div className="space-y-4">
            <h4 className="text-[10px] font-bold text-loss uppercase tracking-widest px-1">Passifs</h4>
            {[
              { label: 'Prêt Immobilier', val: '$45,000', icon: Landmark },
              { label: 'Crédit Consommation', val: '$2,100', icon: CreditCard },
            ].map((a, i) => (
              <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-loss/5 border border-loss/10">
                <div className="flex items-center gap-3">
                  <Landmark size={18} className="text-loss" />
                  <span className="font-bold text-sm">{a.label}</span>
                </div>
                <span className="font-mono font-bold">{a.val}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatrimoinePage;
