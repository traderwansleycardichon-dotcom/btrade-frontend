import React from 'react';
import { Brain, Activity, ShieldCheck, ArrowUpRight } from 'lucide-react';

// Vraies images Unsplash thématique trading / finance
const IMG_AI = 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?auto=format&fit=crop&w=1600&q=80';
const IMG_PSY = 'https://images.unsplash.com/photo-1518640467707-6811f4a6ab73?auto=format&fit=crop&w=1600&q=80';
const IMG_PROP = 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?auto=format&fit=crop&w=1600&q=80';

export const BentoFeatures: React.FC = () => {
  return (
    <>
      {/* SECTION 1 — Bento */}
      <section id="performance" className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          {/* Section header */}
          <div className="max-w-2xl mb-14">
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent mb-3">
              Capacités
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] text-white leading-[1.05] mb-4">
              Tout ce qu'il faut pour
              <br />
              tenir un compte financé.
            </h2>
            <p className="text-white/55 text-[16px] leading-relaxed">
              Un journal, une intelligence d'analyse, et un garde-fou Prop Firm —
              dans un seul outil pensé pour ne pas perdre votre evaluation.
            </p>
          </div>

          {/* Bento grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 md:grid-rows-2 gap-4">
            {/* Card 1 — Big, spans 2 cols 2 rows */}
            <article className="md:col-span-2 md:row-span-2 relative glass-frost glass-rim rounded-2xl overflow-hidden group">
              <img
                src={IMG_AI}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-25 group-hover:opacity-30 transition-opacity duration-700 scale-105 group-hover:scale-100"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/60 to-transparent" />

              <div className="relative p-8 md:p-10 flex flex-col h-full min-h-[420px]">
                <div className="flex items-center gap-2 mb-5">
                  <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl glass-subtle text-accent">
                    <Brain size={18} />
                  </div>
                  <span className="text-[11px] uppercase tracking-[0.22em] text-white/45 font-medium">
                    IA d'analyse
                  </span>
                </div>

                <h3 className="text-2xl md:text-3xl font-semibold tracking-tight text-white mb-3 leading-tight">
                  Détecte vos biais avant qu'ils ne brûlent
                  <br className="hidden md:block" />
                  votre compte.
                </h3>
                <p className="text-white/60 max-w-xl leading-relaxed mb-8">
                  Revenge trading, sur-exposition après une perte, FOMO sur les news —
                  notre moteur identifie vos patterns destructeurs sur la base
                  de vos exécutions réelles et vous les chiffre.
                </p>

                {/* Mini score */}
                <div className="mt-auto glass-subtle rounded-xl p-5">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] uppercase tracking-[0.2em] text-white/45 font-medium">
                      Score discipline
                    </span>
                    <span className="text-sm font-semibold text-accent tabular-nums">67 / 100</span>
                  </div>
                  <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-accent to-accent-2"
                      style={{ width: '67%' }}
                    />
                  </div>
                </div>
              </div>
            </article>

            {/* Card 2 — Psychology */}
            <article
              id="psychologie"
              className="relative glass-frost glass-rim rounded-2xl overflow-hidden group"
            >
              <img
                src={IMG_PSY}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-[0.18] group-hover:opacity-25 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />

              <div className="relative p-7 flex flex-col h-full min-h-[210px]">
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl glass-subtle text-sky-300 mb-4">
                  <Activity size={18} />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-white mb-2">
                  Psychologie tracée
                </h3>
                <p className="text-[13px] text-white/55 leading-relaxed">
                  État émotionnel avant, pendant, après chaque trade.
                  Vous voyez quand votre mental coûte de l'argent.
                </p>
              </div>
            </article>

            {/* Card 3 — Prop Firm compliance */}
            <article className="relative glass-frost glass-rim rounded-2xl overflow-hidden group">
              <img
                src={IMG_PROP}
                alt=""
                aria-hidden
                className="absolute inset-0 h-full w-full object-cover opacity-[0.18] group-hover:opacity-25 transition-opacity duration-700"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-bg via-bg/40 to-transparent" />

              <div className="relative p-7 flex flex-col h-full min-h-[210px]">
                <div className="inline-flex items-center justify-center h-9 w-9 rounded-xl glass-subtle text-emerald-300 mb-4">
                  <ShieldCheck size={18} />
                </div>
                <h3 className="text-lg font-semibold tracking-tight text-white mb-2">
                  Garde-fou Prop Firm
                </h3>
                <p className="text-[13px] text-white/55 leading-relaxed">
                  Validation auto FTMO, MyFundedFX, FundedNext —
                  alerte avant chaque breach.
                </p>
              </div>
            </article>
          </div>
        </div>
      </section>

      {/* SECTION 2 — Journal Table */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-10">
            <div>
              <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent mb-3">
                Journal de bord
              </div>
              <h2 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-white">
                Vos dernières exécutions, sans bullshit.
              </h2>
            </div>
            <a
              href="#tarification"
              className="inline-flex items-center gap-1.5 text-[13px] font-medium text-white/70 hover:text-white transition-colors"
            >
              Voir le plan complet
              <ArrowUpRight size={14} />
            </a>
          </div>

          <div className="glass-frost glass-rim rounded-2xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-[13px] min-w-[640px]">
                <thead>
                  <tr className="text-[10px] uppercase tracking-[0.18em] text-white/40 font-medium">
                    <th className="px-6 py-4">Instrument</th>
                    <th className="px-6 py-4">Sens</th>
                    <th className="px-6 py-4">Entrée</th>
                    <th className="px-6 py-4">Sortie</th>
                    <th className="px-6 py-4">P&amp;L</th>
                    <th className="px-6 py-4 text-right">Statut</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.05]">
                  {[
                    { sym: 'NAS100', side: 'LONG', in: '15 242,1', out: '15 294,5', pnl: '+4 200 €', won: true },
                    { sym: 'XAUUSD', side: 'SHORT', in: '1 942,2', out: '1 945,8', pnl: '-1 250 €', won: false },
                    { sym: 'EURUSD', side: 'LONG', in: '1,0842', out: '1,0890', pnl: '+840 €', won: true },
                    { sym: 'GBPJPY', side: 'SHORT', in: '189,42', out: '188,91', pnl: '+1 510 €', won: true },
                  ].map((t) => (
                    <tr key={t.sym} className="hover:bg-white/[0.025] transition-colors">
                      <td className="px-6 py-4 font-semibold text-white tabular-nums">{t.sym}</td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold ${
                            t.side === 'LONG'
                              ? 'bg-emerald-500/10 text-emerald-400'
                              : 'bg-rose-500/10 text-rose-400'
                          }`}
                        >
                          {t.side}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-white/70 tabular-nums">{t.in}</td>
                      <td className="px-6 py-4 text-white/70 tabular-nums">{t.out}</td>
                      <td className={`px-6 py-4 font-semibold tabular-nums ${t.won ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {t.pnl}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <span className={`text-[11px] font-medium ${t.won ? 'text-emerald-400/80' : 'text-rose-400/80'}`}>
                          {t.won ? 'WIN' : 'LOSS'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>
    </>
  );
};
