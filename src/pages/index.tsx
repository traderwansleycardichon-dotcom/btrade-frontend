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
    <div className="min-h-screen bg-bg selection:bg-accent/30 overflow-x-hidden selection:text-white">
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
      
      {/* Footer */}
      <footer className="py-10 border-t border-border">
        <div className="container mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center">
              <span className="font-black text-white">B</span>
            </div>
            <span className="font-black text-xl">BTrade</span>
          </div>
          <div className="flex gap-8 text-sm text-txt-3">
            <Link to="/legal/terms" className="hover:text-txt transition-colors">Termes</Link>
            <Link to="/legal/privacy" className="hover:text-txt transition-colors">Confidentialité</Link>
            <a href="#" className="hover:text-txt transition-colors">Discord</a>
            <a href="#" className="hover:text-txt transition-colors">Twitter</a>
          </div>
          <div className="text-xs text-txt-3 font-bold uppercase tracking-widest">
            © {new Date().getFullYear()} BTrade Inc.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
