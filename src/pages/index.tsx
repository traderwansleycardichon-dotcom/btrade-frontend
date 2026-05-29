import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { LiveTicker } from '../components/landing/LiveTicker';
import { StatsSection } from '../components/landing/StatsSection';
import { BentoFeatures } from '../components/landing/BentoFeatures';
import { ComparisonTable } from '../components/landing/ComparisonTable';
import { PricingSection } from '../components/landing/PricingSection';
import { FaqSection } from '../components/landing/FaqSection';

const LandingPage: React.FC = () => {
  return (
    <div className="landing-shell min-h-screen bg-bg text-white font-sans selection:bg-accent/30 selection:text-white overflow-x-hidden">
      <Navbar />
      <HeroSection />
      <LiveTicker />
      <StatsSection />
      <BentoFeatures />
      <ComparisonTable />
      <PricingSection />
      <FaqSection />

      {/* Footer */}
      <footer className="relative border-t border-white/[0.06] bg-bg/60 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-6 py-14 grid grid-cols-2 md:grid-cols-4 gap-10">
          <div className="col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-accent to-accent-2 shadow-[0_0_24px_rgba(243,108,0,0.35)]">
                <span className="text-white text-[13px] font-black leading-none">B</span>
              </span>
              <span className="text-[15px] font-semibold tracking-tight">BTrade</span>
              <span className="text-[10px] uppercase tracking-[0.25em] text-white/40">Analytics</span>
            </div>
            <p className="text-[13px] text-white/45 max-w-sm leading-relaxed">
              Le journal de trading qui pense comme un pro. Le trading comporte
              des risques importants — assurez-vous de les comprendre avant de
              vous engager.
            </p>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/35 font-semibold mb-4">
              Produit
            </div>
            <ul className="space-y-2.5 text-[13px] text-white/70">
              <li><Link to="/app/trades" className="hover:text-white transition-colors">Journal</Link></li>
              <li><a href="#performance" className="hover:text-white transition-colors">Analyse IA</a></li>
              <li><a href="#tarification" className="hover:text-white transition-colors">Tarifs</a></li>
            </ul>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-[0.22em] text-white/35 font-semibold mb-4">
              Légal
            </div>
            <ul className="space-y-2.5 text-[13px] text-white/70">
              <li><Link to="/legal/privacy" className="hover:text-white transition-colors">Confidentialité</Link></li>
              <li><Link to="/legal/terms" className="hover:text-white transition-colors">Conditions</Link></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQ</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/[0.04]">
          <div className="mx-auto max-w-6xl px-6 py-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-white/35">
            <span>© {new Date().getFullYear()} BTrade Analytics. Tous droits réservés.</span>
            <span>Fait avec rigueur pour les traders sérieux.</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
