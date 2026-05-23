import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-border bg-bg/80 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between font-mono text-[10px] tracking-widest uppercase">
        <div className="flex items-center gap-8">
          <Link to="/" className="font-bold text-accent">BTRADE_OS</Link>
          <div className="hidden md:flex gap-6 text-txt-2">
            <a href="#performance" className="hover:text-txt transition-colors">Performance</a>
            <a href="#psychologie" className="hover:text-txt transition-colors">Psychologie</a>
            <a href="#tarification" className="hover:text-txt transition-colors">Tarification</a>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <span className="text-txt-2 hidden sm:inline">
            SYSTEM_STATUS: <span className="text-accent">OPTIMAL</span>
          </span>
          <Link to="/login" className="bg-txt text-bg px-4 py-1.5 font-bold hover:bg-accent hover:text-white transition-colors hidden sm:block">
            CONNEXION
          </Link>
          <button 
            className="md:hidden text-txt-2 hover:text-txt"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border bg-bg font-mono text-[10px] tracking-widest uppercase flex flex-col">
          <a href="#performance" className="p-4 border-b border-border text-txt-2 hover:text-txt" onClick={() => setMobileMenuOpen(false)}>Performance</a>
          <a href="#psychologie" className="p-4 border-b border-border text-txt-2 hover:text-txt" onClick={() => setMobileMenuOpen(false)}>Psychologie</a>
          <a href="#tarification" className="p-4 border-b border-border text-txt-2 hover:text-txt" onClick={() => setMobileMenuOpen(false)}>Tarification</a>
          <Link to="/login" className="p-4 text-accent font-bold" onClick={() => setMobileMenuOpen(false)}>Connexion</Link>
        </div>
      )}
    </nav>
  );
};
