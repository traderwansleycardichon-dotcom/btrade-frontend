import React from 'react';
import { Link } from 'react-router-dom';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-24 pb-16 overflow-hidden border-b border-border">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-accent/20 bg-accent/5 text-accent text-[11px] font-mono mb-8">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            DÉPLOYÉ POUR LES TRADERS PRO
          </div>
          <h1 className="text-7xl md:text-[120px] font-black tracking-tighter leading-[0.85] mb-8">
            TRADE.<br />JOURNAL.<br /><span className="text-accent">WIN.</span>
          </h1>
          <p className="max-w-xl text-lg text-txt-2 text-pretty">
            L'écosystème ultime pour les traders de Prop Firms.
            Performance brute, analyses IA et psychologie de précision.
          </p>
          <div className="mt-10 flex flex-col sm:flex-row gap-4">
            <Link to="/register" className="flex items-center justify-center h-14 px-10 bg-accent text-white font-bold text-sm tracking-widest uppercase hover:brightness-110 transition-all">
              Commencer Maintenant
            </Link>
            <button className="h-14 px-10 border border-border font-bold text-sm tracking-widest uppercase hover:bg-white/5 transition-all text-txt">
              Voir Démo
            </button>
          </div>
        </div>

        <div className="mt-20 relative">
          <div className="absolute inset-0 bg-gradient-to-t from-bg via-transparent to-transparent z-10 pointer-events-none" />
          <div className="rounded-t-xl border-t border-x border-border bg-surface/50 p-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
              <div className="bg-black/40 border border-border p-6">
                <div className="text-[10px] font-mono text-txt-2 uppercase mb-1">Profit Total</div>
                <div className="text-2xl font-mono text-accent">+14,209.42€</div>
              </div>
              <div className="bg-black/40 border border-border p-6">
                <div className="text-[10px] font-mono text-txt-2 uppercase mb-1">Win Rate</div>
                <div className="text-2xl font-mono text-txt">64.2%</div>
              </div>
              <div className="bg-black/40 border border-border p-6">
                <div className="text-[10px] font-mono text-txt-2 uppercase mb-1">Drawdown Max</div>
                <div className="text-2xl font-mono text-loss">-2.14%</div>
              </div>
            </div>
            {/* Minimalist Dashboard Grid Mockup (in place of an image) */}
            <div className="w-full aspect-[21/9] rounded border border-border bg-surface relative overflow-hidden flex flex-col p-4 gap-4">
              <div className="flex-1 flex gap-4">
                <div className="flex-1 border border-border bg-bg p-4 flex items-end">
                  <div className="w-full h-1/2 border-t border-accent/50 relative">
                     <div className="absolute top-0 right-0 w-full h-full bg-gradient-to-b from-accent/10 to-transparent" />
                     <svg className="absolute bottom-0 w-full h-[150%] -translate-y-4" preserveAspectRatio="none" viewBox="0 0 100 100">
                        <path d="M0,80 L20,60 L40,70 L60,30 L80,40 L100,10" fill="none" stroke="#F36C00" strokeWidth="2" />
                     </svg>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
