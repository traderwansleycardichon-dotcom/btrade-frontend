import React from 'react';
import { 
  Calendar, 
  Flame, 
  BarChart2, 
  Target, 
  ShieldCheck, 
  Zap, 
  LineChart, 
  ArrowUpRight 
} from 'lucide-react';
import { CalendarHeatmap } from '../dashboard/CalendarHeatmap';
import { DisciplinePanel } from '../dashboard/DisciplinePanel';
import { MOCK_HEATMAP_DATA } from '../../lib/mocks';

export const BentoFeatures: React.FC = () => {
  return (
    <section className="py-32 bg-surface/30">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-4xl md:text-5xl font-black mb-6">Tout ce dont vous avez besoin <br /> pour <span className="text-accent">dominer les marchés.</span></h2>
          <p className="text-txt-2 max-w-2xl mx-auto">Une suite d'outils professionnels conçue par des traders, pour des traders.</p>
        </div>

        <div className="grid grid-cols-12 gap-4 auto-rows-[200px]">
          {/* Calendar Heatmap Preview */}
          <div className="col-span-12 lg:col-span-8 row-span-2 glass p-1 overflow-hidden relative group">
            <div className="absolute inset-x-0 top-0 h-12 bg-gradient-to-b from-surface to-transparent z-10 p-6 flex justify-between items-center">
              <span className="text-[10px] font-bold uppercase tracking-widest text-txt-2">Calendrier P&L Dynamique</span>
              <Calendar size={16} className="text-accent" />
            </div>
            <div className="scale-90 origin-top mt-10">
              <CalendarHeatmap data={MOCK_HEATMAP_DATA} month="Performance Avril" size="sm" />
            </div>
          </div>

          {/* Streak Card */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 row-span-1 glass p-8 flex flex-col justify-between group hover:border-accent/50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <Flame size={20} />
              </div>
              <ArrowUpRight size={18} className="text-txt-3 group-hover:text-accent transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Winning Streaks</h3>
              <p className="text-xs text-txt-2">Visualisez vos séries de gains et gardez le momentum.</p>
            </div>
          </div>

          {/* Distribution Card */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 row-span-1 glass p-8 flex flex-col justify-between group hover:border-win/50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-win/10 flex items-center justify-center text-win">
                <BarChart2 size={20} />
              </div>
              <ArrowUpRight size={18} className="text-txt-3 group-hover:text-win transition-colors" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Distribution R</h3>
              <p className="text-xs text-txt-2">Analysez si vous respectez vos ratios Risk/Reward.</p>
            </div>
          </div>

          {/* Discipline Card */}
          <div className="col-span-12 lg:col-span-4 row-span-2 glass p-1 overflow-hidden relative">
            <div className="scale-[0.85] origin-top mt-2">
              <DisciplinePanel />
            </div>
          </div>

          {/* Playbooks Card */}
          <div className="col-span-12 sm:col-span-6 lg:col-span-4 row-span-2 glass p-8 relative group overflow-hidden">
             <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
               <Zap size={160} />
             </div>
             <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent mb-6">
                <Target size={20} />
             </div>
             <h3 className="font-bold text-2xl mb-4 leading-tight">Playbooks <br /> Statistiques</h3>
             <p className="text-sm text-txt-2 leading-relaxed mb-8">
               Découvrez quels setups sont réellement profitables et lesquels vous font perdre de l'argent.
             </p>
             <div className="space-y-3">
               {[
                 { name: 'London Breakout', wr: '71%' },
                 { name: 'Pullback Trend', wr: '68%' }
               ].map(p => (
                 <div key={p.name} className="flex justify-between items-center p-3 rounded-xl bg-bg/50 border border-border">
                   <span className="text-xs font-bold">{p.name}</span>
                   <span className="text-[10px] font-black text-win">{p.wr} WR</span>
                 </div>
               ))}
             </div>
          </div>

          {/* Multi-Account Card */}
          <div className="col-span-12 lg:col-span-4 row-span-1 glass p-8 flex flex-col justify-between group hover:border-accent/50 transition-colors">
            <div className="flex justify-between items-start">
              <div className="w-10 h-10 rounded-xl bg-accent/10 flex items-center justify-center text-accent">
                <LineChart size={20} />
              </div>
              <ShieldCheck size={20} className="text-win" />
            </div>
            <div>
              <h3 className="font-bold text-lg mb-1">Multi-Comptes</h3>
              <p className="text-xs text-txt-2">Gérez tous vos comptes Prop Firms au même endroit.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
