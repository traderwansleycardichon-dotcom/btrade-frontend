import React from 'react';
import { ArrowRight, Play } from 'lucide-react';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-20 overflow-hidden">
      {/* Dynamic Glow Background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-accent/20 rounded-full blur-[120px] animate-glow-pulse pointer-events-none opacity-50" />
      
      <div className="container mx-auto px-6 relative z-10 text-center">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border-white/5 mb-12 animate-slide-up">
          <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
          <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">New: AI Trade Insights V2</span>
        </div>
        
        <h1 className="text-7xl md:text-[10rem] font-black mb-12 leading-[0.85] tracking-[-0.05em] animate-slide-up [animation-delay:0.2s]">
          TRADE. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">JOURNAL.</span> <br />
          <span className="text-accent">WIN.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-txt-2 max-w-2xl mx-auto mb-16 leading-relaxed animate-slide-up [animation-delay:0.4s]">
          L'écosystème ultime pour les traders de Prop Firms. 
          Performance brute, analyses IA et psychologie de précision.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-6 animate-slide-up [animation-delay:0.6s]">
          <a href="/register" className="btn-primary group py-5 px-10 text-sm tracking-widest uppercase">
            Get Started Now
            <ArrowRight size={18} className="inline-block ml-2 group-hover:translate-x-1 transition-transform" />
          </a>
          <button className="btn-ghost py-5 px-10 text-sm tracking-widest uppercase flex items-center gap-3">
            <Play size={18} fill="currentColor" />
            Watch Demo
          </button>
        </div>

        {/* Minimalist Stats / Social Proof */}
        <div className="mt-32 pt-12 border-t border-white/5 grid grid-cols-2 md:grid-cols-4 gap-12 max-w-4xl mx-auto opacity-50 animate-fade-in [animation-delay:1s]">
          {[
            { label: 'Active Traders', value: '12K+' },
            { label: 'Total Payouts', value: '$2.4M' },
            { label: 'Avg RR Ratio', value: '1:3.2' },
            { label: 'Accuracy', value: '68%' }
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-xl font-black mb-1">{stat.value}</div>
              <div className="text-[10px] font-bold text-txt-3 uppercase tracking-widest">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Decorative noise/grain */}
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-[0.03] pointer-events-none" />
    </section>
  );
};
