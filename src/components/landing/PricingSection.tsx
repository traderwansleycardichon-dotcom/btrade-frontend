import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Loader2, Check, ArrowRight, Sparkles } from 'lucide-react';
import api from '../../lib/api';

const BG_CTA = 'https://images.unsplash.com/photo-1590283603385-17ffb3a7f29f?auto=format&fit=crop&w=2400&q=80';

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  features: string[];
  recommended?: boolean;
}

export const PricingSection: React.FC = () => {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await api.get('/api/billing/plans');
        setPlans(data.data || []);
      } catch (err) {
        console.error('Erreur plans landing:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPlans();
  }, []);

  return (
    <>
      {/* PLANS */}
      <section className="py-24">
        <div className="mx-auto max-w-6xl px-6">
          <div className="text-center mb-16 max-w-2xl mx-auto">
            <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent mb-3">
              Tarifs
            </div>
            <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] text-white mb-4">
              Un prix lisible, des limites claires.
            </h2>
            <p className="text-white/55">
              Démarrez gratuitement. Passez Pro quand vous serez financé.
              Annulez quand vous voulez.
            </p>
          </div>

          {loading ? (
            <div className="py-20 flex justify-center">
              <Loader2 className="animate-spin text-accent" size={28} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {plans.map((plan) => {
                const featured = plan.recommended;
                return (
                  <article
                    key={plan.id}
                    className={`relative rounded-2xl p-8 flex flex-col ${
                      featured
                        ? 'glass-frost glass-rim ring-1 ring-accent/40 shadow-[0_30px_80px_-30px_rgba(243,108,0,0.5)]'
                        : 'glass-frost glass-rim'
                    }`}
                  >
                    {featured && (
                      <div className="absolute -top-3 left-8 inline-flex items-center gap-1.5 rounded-full bg-accent px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white shadow-lg">
                        <Sparkles size={11} />
                        Recommandé
                      </div>
                    )}

                    <h3 className="text-xl font-semibold tracking-tight text-white mb-2">
                      {plan.name}
                    </h3>
                    <p className="text-[13px] text-white/55 leading-relaxed min-h-[40px] mb-6">
                      {plan.description}
                    </p>

                    <div className="flex items-baseline gap-1 mb-8">
                      <span
                        className={`text-5xl font-semibold tracking-tight tabular-nums ${
                          featured ? 'text-accent' : 'text-white'
                        }`}
                      >
                        {plan.price}€
                      </span>
                      <span className="text-white/45 text-sm">/ mois</span>
                    </div>

                    <ul className="space-y-3 mb-10 flex-1">
                      {(Array.isArray(plan.features) ? plan.features : []).map((f) => (
                        <li key={f} className="flex items-start gap-3 text-[14px] text-white/75 leading-relaxed">
                          <Check
                            size={16}
                            className={`mt-0.5 shrink-0 ${featured ? 'text-accent' : 'text-emerald-400'}`}
                            strokeWidth={2.5}
                          />
                          <span>{f}</span>
                        </li>
                      ))}
                    </ul>

                    <Link
                      to="/register"
                      className={`inline-flex items-center justify-center gap-2 h-12 w-full rounded-xl text-[14px] font-semibold transition-all ${
                        featured
                          ? 'bg-accent hover:bg-accent-2 text-white shadow-[0_10px_30px_-10px_rgba(243,108,0,0.6)]'
                          : 'glass-subtle text-white hover:bg-white/[0.08]'
                      }`}
                    >
                      {plan.id === 'free' ? 'Commencer gratuitement' : "S'abonner"}
                      <ArrowRight size={14} />
                    </Link>
                  </article>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* CTA */}
      <section id="tarification" className="relative py-32 overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <img
            src={BG_CTA}
            alt=""
            aria-hidden
            className="absolute inset-0 h-full w-full object-cover opacity-[0.18]"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-bg via-bg/85 to-bg" />
          <div className="absolute inset-0 bg-[radial-gradient(60%_50%_at_50%_50%,rgba(243,108,0,0.18),transparent_70%)]" />
        </div>

        <div className="mx-auto max-w-3xl px-6 text-center">
          <h2 className="text-4xl md:text-6xl font-semibold tracking-[-0.03em] text-white mb-6 leading-[1.05]">
            Prêt à protéger votre
            <br />
            compte financé ?
          </h2>
          <p className="text-white/65 text-lg leading-relaxed mb-10">
            Rejoignez les traders qui ont fait de BTrade leur garde-fou quotidien.
            Pas d'engagement, pas de carte.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/register"
              className="inline-flex items-center justify-center gap-2 h-14 px-8 rounded-xl bg-accent hover:bg-accent-2 text-white font-semibold text-[15px] shadow-[0_10px_40px_-10px_rgba(243,108,0,0.6)] transition-all"
            >
              Créer mon compte
              <ArrowRight size={16} />
            </Link>
            <Link
              to="/login"
              className="inline-flex items-center justify-center h-14 px-8 rounded-xl glass-frost text-white font-medium text-[15px] hover:bg-white/[0.08] transition-all"
            >
              J'ai déjà un compte
            </Link>
          </div>
        </div>
      </section>
    </>
  );
};
