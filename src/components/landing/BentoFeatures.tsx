import React from 'react';
import { 
  BarChart3, 
  Brain, 
  Zap, 
  ShieldCheck 
} from 'lucide-react';

const features = [
  {
    title: "Journalisation de Précision",
    description: "Capturez chaque trade avec une précision chirurgicale. Automatisez vos calculs de R:R et de drawdown.",
    icon: BarChart3,
    size: "col-span-12 md:col-span-8",
    color: "accent"
  },
  {
    title: "Analyse Psychologique",
    description: "Identifiez vos biais cognitifs et gérez vos émotions avec notre assistant IA.",
    icon: Brain,
    size: "col-span-12 md:col-span-4",
    color: "accent"
  },
  {
    title: "AI Trade Insights",
    description: "Laissez l'IA analyser vos setups et vous donner des probabilités de succès avant d'entrer.",
    icon: Zap,
    size: "col-span-12 md:col-span-4",
    color: "accent"
  },
  {
    title: "Prop Firm Guard",
    description: "Alertes en temps réel avant de violer vos règles de drawdown quotidien ou total.",
    icon: ShieldCheck,
    size: "col-span-12 md:col-span-8",
    color: "accent"
  }
];

export const BentoFeatures: React.FC = () => {
  return (
    <section id="features" className="container mx-auto px-6 py-24 relative">
      <div className="text-center mb-24">
        <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase">Power. Precision. Control.</h2>
        <p className="text-txt-2 text-lg max-w-2xl mx-auto">
          Chaque détail a été pensé pour les traders qui visent le financement professionnel.
        </p>
      </div>

      <div className="grid grid-cols-12 gap-4 max-w-6xl mx-auto">
        {features.map((feature, i) => (
          <div 
            key={i} 
            className={`${feature.size} glass rounded-[2.5rem] p-10 hover:border-white/10 transition-all group overflow-hidden relative`}
          >
            {/* Subtle Gradient Glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-accent/5 rounded-full blur-[80px] group-hover:bg-accent/10 transition-all" />
            
            <div className="relative z-10 h-full flex flex-col">
              <div className="w-12 h-12 rounded-2xl bg-white/5 flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                <feature.icon size={24} strokeWidth={1.5} className="text-accent" />
              </div>
              
              <h3 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h3>
              <p className="text-txt-2 text-sm leading-relaxed max-w-md">
                {feature.description}
              </p>
              
              <div className="mt-auto pt-12">
                <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-txt-3 group-hover:text-accent transition-colors">
                  <span>Explore Module</span>
                  <div className="h-[1px] w-8 bg-current opacity-20" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
