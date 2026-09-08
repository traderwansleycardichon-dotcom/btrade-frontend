import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, PlayCircle, ShieldCheck, TrendingUp, Sparkles } from 'lucide-react';

// Vraies images Unsplash (trading desks / écrans Bloomberg)
const BG_TRADING = 'https://images.unsplash.com/photo-1640340434855-6084b1f4901c?auto=format&fit=crop&w=2400&q=80';
const DASH_SHOT = 'https://images.unsplash.com/photo-1642790106117-e829e14a795f?auto=format&fit=crop&w=2400&q=80';

export const HeroSection: React.FC = () => {
  return (
    <section className="relative pt-20 pb-32 overflow-hidden">
      {/* Backdrop image */}
      <div className="absolute inset-0 -z-10">
        <img
          src={BG_TRADING}
          alt=""
          aria-hidden
          className="absolute inset-0 h-full w-full object-cover opacity-[0.22]"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bg/40 via-bg/70 to-bg" />
        <div className="absolute inset-0 bg-gradient-to-r from-bg via-transparent to-bg" />
      </div>

      <div className="relative mx-auto max-w-6xl px-6">
        {/* Pill */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center gap-2 rounded-full glass-frost px-4 py-1.5 text-[12px] text-white/80">
            <span className="relative flex h-1.5 w-1.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 animate-ping opacity-75" />
              <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-emerald-400" />
            </span>
            <span className="font-medium">Pensé pour les traders Prop Firm</span>
          </div>
        </div>

        {/* Headline */}
        <h1 className="text-center text-balance font-semibold tracking-[-0.03em] text-white text-[44px] sm:text-6xl md:text-7xl leading-[1.02] mb-6">
          Le journal de trading
          <br />
          <span className="bg-gradient-to-br from-white via-white/90 to-white/60 bg-clip-text text-transparent">
            qui pense comme un{' '}
          </span>
          <span className="bg-gradient-to-br from-accent-2 via-accent to-accent bg-clip-text text-transparent">
            pro
          </span>
          <span className="text-accent">.</span>
        </h1>

        {/* Subtitle */}
        <p className="mx-auto max-w-2xl text-center text-[17px] leading-relaxed text-white/65 mb-10">
          Haitian Wall Street analyse chaque exécution, détecte vos biais et certifie votre
          conformité Prop Firm — pour que vous gardiez votre compte financé,
          pas seulement vos espoirs.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-3 justify-center mb-6">
          <Link
            to="/register"
            className="group inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl glass-frost text-white font-medium text-[14px] hover:bg-white/[0.08] transition-all border border-white/10"
          >
            Commencer gratuitement
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
          <Link
            to="/login?plan=pro"
            className="group inline-flex items-center justify-center gap-2 h-12 px-7 rounded-xl bg-accent hover:bg-accent-2 text-white font-semibold text-[14px] shadow-[0_10px_40px_-10px_rgba(243,108,0,0.6)] transition-all"
          >
            <Sparkles size={16} />
            Passer PRO
            <ArrowRight size={16} className="group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>
        <p className="text-center text-white/35 text-[11px] mb-10">
          Plan gratuit disponible · Sans carte bancaire
        </p>

        {/* Trust row */}
        <div className="flex flex-wrap justify-center items-center gap-x-8 gap-y-3 text-[12px] text-white/45 mb-20">
          <span className="inline-flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400/80" />
            14 jours d'essai, sans carte
          </span>
          <span className="inline-flex items-center gap-2">
            <TrendingUp size={14} className="text-accent/80" />
            Compatible FTMO, MyFundedFX, FundedNext
          </span>
        </div>

        {/* Dashboard preview */}
        <div className="relative mx-auto max-w-5xl">
          {/* Glow */}
          <div className="absolute -inset-x-20 -top-10 -bottom-10 -z-10 opacity-60">
            <div className="absolute inset-0 bg-gradient-to-tr from-accent/30 via-transparent to-sky-500/20 blur-3xl" />
          </div>

          <div className="glass-frost glass-rim rounded-2xl p-3 sm:p-4">
            {/* KPI strip */}
            <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-3 sm:mb-4">
              {[
                { label: 'Profit net (30j)', value: '+14 209 €', tone: 'text-emerald-400' },
                { label: 'Win rate', value: '64,2 %', tone: 'text-white' },
                { label: 'Drawdown max', value: '-2,14 %', tone: 'text-rose-400' },
              ].map((kpi) => (
                <div
                  key={kpi.label}
                  className="glass-subtle rounded-xl px-3 sm:px-5 py-3 sm:py-4"
                >
                  <div className="text-[10px] uppercase tracking-[0.18em] text-white/40 font-medium mb-1">
                    {kpi.label}
                  </div>
                  <div className={`text-base sm:text-2xl font-semibold tracking-tight ${kpi.tone}`}>
                    {kpi.value}
                  </div>
                </div>
              ))}
            </div>

            {/* Screenshot */}
            <div className="relative rounded-xl overflow-hidden border border-white/[0.06]">
              <img
                src={DASH_SHOT}
                alt="Aperçu du tableau de bord Haitian Wall Street"
                className="w-full h-auto aspect-[16/9] object-cover"
                loading="lazy"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg/40 via-transparent to-transparent" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
