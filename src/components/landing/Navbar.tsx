import React, { useEffect, useState } from 'react';
import { Menu, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../../contexts/SettingsContext';

export const Navbar: React.FC = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { settings } = useSettings();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const navLinks = [
    { href: '#performance', label: 'Performance' },
    { href: '#psychologie', label: 'Psychologie' },
    { href: '#tarification', label: 'Tarification' },
  ];

  return (
    <header className="sticky top-0 z-50 px-4 pt-4">
      <nav
        className={`mx-auto max-w-6xl rounded-2xl glass-frost glass-rim transition-all duration-500 ${
          scrolled ? 'shadow-2xl' : ''
        }`}
      >
        <div className="h-14 px-4 sm:px-6 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group" aria-label="Behind The Trades — Journal">
            {settings?.platform_logo ? (
              <img
                src={settings.platform_logo}
                alt="Behind The Trades — Journal"
                className="h-10 w-auto object-contain drop-shadow-[0_0_15px_rgba(243,108,0,0.3)] transition-transform group-hover:scale-105"
              />
            ) : (
              <img
                src="/logo.svg"
                alt="Behind The Trades — Journal"
                className="h-10 w-10 drop-shadow-[0_0_15px_rgba(243,108,0,0.3)] transition-transform group-hover:scale-105"
              />
            )}
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="px-3.5 py-1.5 text-[13px] font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
              >
                {l.label}
              </a>
            ))}
          </div>

          {/* CTA */}
          <div className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden sm:inline-flex items-center px-3.5 py-1.5 text-[13px] font-medium text-white/70 hover:text-white rounded-lg hover:bg-white/[0.06] transition-colors"
            >
              Connexion
            </Link>
            <Link
              to="/register"
              className="hidden sm:inline-flex items-center px-4 py-1.5 text-[13px] font-semibold text-white bg-accent hover:bg-accent-2 rounded-lg shadow-[0_4px_20px_rgba(243,108,0,0.35)] transition-all"
            >
              Essai gratuit
            </Link>
            <button
              className="md:hidden p-2 text-white/70 hover:text-white rounded-lg hover:bg-white/[0.06]"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Menu"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.08] px-2 py-2 flex flex-col gap-1">
            {navLinks.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="px-4 py-2.5 text-sm font-medium text-white/80 hover:text-white rounded-lg hover:bg-white/[0.06]"
              >
                {l.label}
              </a>
            ))}
            <div className="flex gap-2 px-2 pt-2 pb-1">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center px-4 py-2.5 text-sm font-medium text-white/80 rounded-lg border border-white/10"
              >
                Connexion
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex-1 text-center px-4 py-2.5 text-sm font-semibold text-white bg-accent rounded-lg"
              >
                Essai gratuit
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
};
