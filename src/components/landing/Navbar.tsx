import React, { useState, useEffect } from 'react';
import { Menu, X, ArrowRight } from 'lucide-react';

export const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
      scrolled ? 'py-4' : 'py-8'
    }`}>
      <div className="container mx-auto px-6">
        <div className={`glass mx-auto max-w-5xl rounded-full px-6 py-3 flex items-center justify-between border-white/5 transition-all ${
          scrolled ? 'shadow-2xl shadow-black/50' : ''
        }`}>
          {/* Logo */}
          <div className="flex items-center gap-3 group cursor-pointer">
            <div className="w-8 h-8 bg-accent rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(243,108,0,0.3)]">
              <span className="font-black text-white">B</span>
            </div>
            <span className="font-black text-xl tracking-tighter">BTrade</span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8">
            {['Features', 'Journal', 'Pricing', 'Academy'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="text-xs font-bold uppercase tracking-widest text-txt-3 hover:text-accent transition-colors"
              >
                {item}
              </a>
            ))}
          </div>

          {/* Action Button */}
          <div className="flex items-center gap-4">
            <a href="/login" className="hidden sm:block text-xs font-bold uppercase tracking-widest text-txt-3 hover:text-white transition-colors">
              Login
            </a>
            <a href="/register" className="btn-primary px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-wider flex items-center gap-2 group shadow-[0_0_20px_rgba(243,108,0,0.2)]">
              Join Now
              <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </a>
            
            {/* Mobile Toggle */}
            <button 
              className="md:hidden p-2 text-txt-2 hover:text-white transition-colors"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-full left-6 right-6 mt-4 md:hidden animate-scale-in">
          <div className="glass p-8 rounded-[2rem] border-white/10 shadow-2xl space-y-6">
            {['Features', 'Journal', 'Pricing', 'Academy'].map((item) => (
              <a 
                key={item} 
                href={`#${item.toLowerCase()}`}
                className="block text-lg font-bold text-center"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item}
              </a>
            ))}
            <div className="pt-6 border-t border-white/5 space-y-4">
              <a href="/login" className="block text-center text-txt-3 font-bold uppercase tracking-widest text-xs">Login</a>
              <a href="/register" className="btn-primary w-full py-4 rounded-2xl font-black uppercase tracking-wider text-center block">Get Started</a>
            </div>
          </div>
        </div>
      )}
    </nav>
  );
};
