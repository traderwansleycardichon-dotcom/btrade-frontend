import React from 'react';
import { ArrowRight, CheckCircle2, Play } from 'lucide-react';
import { SparkLine } from '../ui/SparkLine';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-32 pb-20 overflow-hidden">
      {/* Background Effects */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-[800px] bg-[radial-gradient(circle_at_50%_0%,#F36C0015,transparent_70%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none" />

      <div className="container mx-auto px-6 relative z-10">
        <div className="flex flex-col items-center text-center mb-16 animate-[slideUp_0.8s_ease-out_forwards]">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-accent/10 border border-accent/20 mb-8">
            <div className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span className="text-[11px] font-bold text-accent uppercase tracking-widest">2,847 traders actifs en temps réel</span>
          </div>
          
          <h1 className="text-6xl md:text-8xl font-black mb-8 leading-[0.9] tracking-tight">
            Stop guessing. <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent via-accent-2 to-accent shadow-accent/20">Start journaling.</span>
          </h1>
          
          <p className="text-xl text-txt-2 max-w-2xl mb-12 leading-relaxed">
            Le journal de trading le plus avancé pour les traders de Prop Firms. 
            Analysez vos setups, maîtrisez votre psychologie et passez vos évaluations avec certitude.
          </p>

          <div className="flex flex-col sm:flex-row items-center gap-4">
            <a href="/register" className="btn-primary px-8 py-4 text-lg flex items-center gap-2 group">
              Commencer gratuitement
              <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
            </a>
            <button className="btn-ghost px-8 py-4 text-lg flex items-center gap-2 border border-border">
              <Play size={20} fill="currentColor" />
              Voir la démo
            </button>
          </div>

          <div className="flex flex-wrap justify-center gap-8 mt-12">
            {['14 jours d\'essai gratuit', 'Sans carte bancaire', 'Annulation en 1 clic'].map((text) => (
              <div key={text} className="flex items-center gap-2 text-txt-2 text-sm font-medium">
                <CheckCircle2 size={16} className="text-accent" />
                {text}
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Mockup */}
        <div className="relative max-w-6xl mx-auto animate-[slideUp_1s_ease-out_forwards] delay-200">
          <div className="absolute -inset-1 bg-gradient-to-r from-accent to-accent-2 rounded-[2rem] blur-2xl opacity-20" />
          <div className="relative glass rounded-[2rem] overflow-hidden border border-border/50 shadow-2xl shadow-black/50 aspect-[16/9] bg-bg/50">
            {/* Header Mock */}
            <div className="h-12 border-b border-border bg-surface/50 flex items-center px-6 gap-2">
              <div className="flex gap-1.5">
                <div className="w-2.5 h-2.5 rounded-full bg-loss/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-accent/30" />
                <div className="w-2.5 h-2.5 rounded-full bg-win/30" />
              </div>
              <div className="mx-auto bg-bg border border-border px-4 py-1 rounded-md text-[10px] font-mono text-txt-3">
                app.btrade.io/dashboard
              </div>
            </div>
            
            {/* Content Mock */}
            <div className="p-8 grid grid-cols-12 gap-6 h-full">
              <div className="col-span-8 flex flex-col gap-6">
                <div className="h-40 bg-elevated/30 rounded-2xl border border-border p-6">
                  <div className="h-4 w-24 bg-border rounded mb-4" />
                  <div className="h-8 w-48 bg-border rounded mb-6" />
                  <SparkLine points={[10, 15, 12, 22, 18, 30, 25, 35, 40]} width={500} height={40} color="#F36C00" animated />
                </div>
                <div className="flex-1 bg-elevated/30 rounded-2xl border border-border p-6">
                  <div className="h-4 w-32 bg-border rounded mb-6" />
                  <div className="space-y-3">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="h-8 bg-border/50 rounded flex items-center px-4">
                        <div className="h-2 w-12 bg-border rounded" />
                        <div className="ml-auto h-2 w-24 bg-border rounded" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              <div className="col-span-4 flex flex-col gap-6">
                <div className="aspect-square bg-elevated/30 rounded-2xl border border-border flex items-center justify-center">
                  <div className="w-32 h-32 rounded-full border-8 border-accent/20 border-t-accent animate-[spin_3s_linear_infinite]" />
                </div>
                <div className="flex-1 bg-elevated/30 rounded-2xl border border-border" />
              </div>
            </div>
          </div>
          
          {/* Floating Elements */}
          <div className="absolute -left-12 top-1/4 glass p-4 rounded-2xl shadow-2xl animate-float border-accent/20">
            <div className="text-[10px] font-bold text-accent uppercase mb-1">Winning Streak</div>
            <div className="text-xl font-bold">12 Jours 🔥</div>
          </div>
          <div className="absolute -right-12 bottom-1/4 glass p-4 rounded-2xl shadow-2xl animate-float [animation-delay:1s] border-win/20">
            <div className="text-[10px] font-bold text-win uppercase mb-1">Funded Pass</div>
            <div className="text-xl font-bold">$100,000 ✅</div>
          </div>
        </div>
      </div>
    </section>
  );
};
