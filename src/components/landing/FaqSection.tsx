import React from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  {
    q: 'Compatible avec MT4 et MT5 ?',
    a: 'Oui. Importez vos historiques en CSV ou utilisez notre auto-sync pour le suivi temps réel de vos trades.',
  },
  {
    q: 'Les Prop Firms acceptent Behind The Trades ?',
    a: "Behind The Trades est un outil d'analyse externe. Il ne touche pas à vos exécutions et est utilisé sans souci par les traders FTMO, MyFundedFX, FundedNext et autres.",
  },
  {
    q: 'Y a-t-il un essai gratuit ?',
    a: "14 jours sur le plan Pro, sans carte bancaire, sans engagement. Vous pouvez exporter vos données à tout moment.",
  },
  {
    q: 'Comment fonctionne l\'IA ?',
    a: "Notre moteur analyse votre historique d'exécutions, détecte les biais récurrents (revenge trading, FOMO, sur-exposition) et chiffre votre score de discipline.",
  },
  {
    q: 'Mes données sont-elles privées ?',
    a: "Vos trades sont chiffrés au repos et en transit. Aucun partage avec des tiers, et vous gardez la propriété entière de vos données.",
  },
];

export const FaqSection: React.FC = () => {
  return (
    <section id="faq" className="py-24">
      <div className="mx-auto max-w-3xl px-6">
        <div className="text-center mb-12 max-w-xl mx-auto">
          <div className="text-[11px] font-medium uppercase tracking-[0.25em] text-accent mb-3">
            Questions fréquentes
          </div>
          <h2 className="text-4xl md:text-5xl font-semibold tracking-[-0.025em] text-white">
            Tout est clair.
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details
              key={i}
              className="group glass-frost glass-rim rounded-2xl overflow-hidden transition-all"
            >
              <summary className="flex items-center justify-between gap-4 px-6 py-5 cursor-pointer list-none">
                <span className="text-[15px] font-medium text-white/85 group-hover:text-white transition-colors">
                  {faq.q}
                </span>
                <ChevronDown
                  size={18}
                  className="text-white/40 group-open:rotate-180 transition-transform duration-300 shrink-0"
                />
              </summary>
              <div className="px-6 pb-6 text-[14px] text-white/60 leading-relaxed">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
