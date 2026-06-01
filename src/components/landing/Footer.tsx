import React from 'react';
import { LineChart, Github, Twitter, MessageSquare } from 'lucide-react';
import { useSettings } from '../../contexts/SettingsContext';

export const Footer: React.FC = () => {
  const { settings } = useSettings();

  return (
    <footer className="py-20 border-t border-border bg-bg relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_100%,#F36C0005,transparent_50%)] pointer-events-none" />
      
      <div className="container mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              {settings?.platform_logo ? (
                <img src={settings.platform_logo} alt="Logo BTrade" className="h-10 w-auto object-contain" />
              ) : (
                <>
                  <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
                    <LineChart size={18} className="text-white" />
                  </div>
                  <span className="font-black text-xl tracking-tight">BTrade</span>
                </>
              )}
            </div>
            <p className="text-txt-2 text-sm max-w-sm leading-relaxed">
              Le journal de trading nouvelle génération pour les traders sérieux. 
              Maîtrisez vos données, optimisez votre discipline.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-txt">Produit</h4>
            <ul className="space-y-4 text-sm text-txt-3">
              <li><a href="#features" className="hover:text-accent transition-colors">Fonctionnalités</a></li>
              <li><a href="#pricing" className="hover:text-accent transition-colors">Tarifs</a></li>
              <li><a href="#faq" className="hover:text-accent transition-colors">FAQ</a></li>
              <li><a href="/login" className="hover:text-accent transition-colors">Se connecter</a></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-sm mb-6 uppercase tracking-widest text-txt">Ressources</h4>
            <ul className="space-y-4 text-sm text-txt-3">
              <li><a href="#" className="hover:text-accent transition-colors">Blog</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Documentation</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Roadmap</a></li>
              <li><a href="#" className="hover:text-accent transition-colors">Status</a></li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="text-xs text-txt-3 font-bold uppercase tracking-widest">
            © 2026 BTrade Inc. Tous droits réservés.
          </div>
          
          <div className="flex gap-6">
            <a href="#" className="text-txt-3 hover:text-accent transition-colors"><Twitter size={20} /></a>
            <a href="#" className="text-txt-3 hover:text-accent transition-colors"><MessageSquare size={20} /></a>
            <a href="#" className="text-txt-3 hover:text-accent transition-colors"><Github size={20} /></a>
          </div>

          <div className="flex gap-8 text-[10px] font-bold text-txt-3 uppercase tracking-widest">
            <a href="#" className="hover:text-txt transition-colors">Confidentialité</a>
            <a href="#" className="hover:text-txt transition-colors">Mentions Légales</a>
          </div>
        </div>
      </div>
    </footer>
  );
};
