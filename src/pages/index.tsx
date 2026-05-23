import React from 'react';
import { Navbar } from '../components/landing/Navbar';
import { HeroSection } from '../components/landing/HeroSection';
import { LiveTicker } from '../components/landing/LiveTicker';
import { StatsSection } from '../components/landing/StatsSection';
import { BentoFeatures } from '../components/landing/BentoFeatures';
import { ComparisonTable } from '../components/landing/ComparisonTable';
import { PricingSection } from '../components/landing/PricingSection';
import { FaqSection } from '../components/landing/FaqSection';

import { Link } from 'react-router-dom';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-bg selection:bg-accent/30 overflow-x-hidden selection:text-white font-sans text-txt">
      <Navbar />
      <HeroSection />
      <LiveTicker />
      <div className="space-y-4 pb-8">
        <StatsSection />
        <BentoFeatures />
        <ComparisonTable />
        <PricingSection />
        <FaqSection />
      </div>
      
      {/* Footer (From Lovable Design) */}
      <footer className="py-12 border-t border-border font-mono text-[10px] text-txt-2 bg-bg">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between gap-8">
          <div>
            <div className="text-txt font-bold mb-4 uppercase tracking-widest">
              BTRADE ANALYTICS © {new Date().getFullYear()}
            </div>
            <p className="max-w-xs leading-relaxed italic">
              Le trading comporte des risques importants. Assurez-vous de comprendre les enjeux avant de vous engager.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div className="space-y-3">
              <div className="text-txt font-bold uppercase tracking-widest">PRODUIT</div>
              <div><Link to="/app/trades" className="hover:text-txt">Journaling</Link></div>
              <div><a href="#performance" className="hover:text-txt">IA Analysis</a></div>
              <div><Link to="/app/dashboard" className="hover:text-txt">Benchmarks</Link></div>
            </div>
            <div className="space-y-3">
              <div className="text-txt font-bold uppercase tracking-widest">ENTREPRISE</div>
              <div><a href="#" className="hover:text-txt">Manifesto</a></div>
              <div><Link to="/legal/privacy" className="hover:text-txt">Security</Link></div>
              <div><Link to="/legal/terms" className="hover:text-txt">Legal</Link></div>
            </div>
            <div className="space-y-3">
              <div className="text-txt font-bold uppercase tracking-widest">SOCIAL</div>
              <div><a href="#" className="hover:text-txt">Twitter / X</a></div>
              <div><a href="#" className="hover:text-txt">Discord</a></div>
              <div><a href="#" className="hover:text-txt">YouTube</a></div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
