import React from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const faqs = [
    {
      q: "BTrade est-il compatible avec MetaTrader 4 & 5 ?",
      a: "Oui ! Vous pouvez importer vos fichiers CSV MT4/MT5 ou utiliser notre extension de synchronisation automatique pour que vos trades apparaissent en temps réel."
    },
    {
      q: "Est-ce autorisé par les Prop Firms ?",
      a: "Absolument. BTrade est un outil d'analyse et de journalisation. Il n'interfère pas avec votre trading et est même recommandé par de nombreux traders de FTMO et MyFundedFX."
    },
    {
      q: "Puis-je l'essayer gratuitement ?",
      a: "Nous offrons une période d'essai de 14 jours sur le plan Pro, sans engagement et sans carte bancaire requise."
    },
    {
      q: "Comment fonctionne l'analyse de discipline ?",
      a: "BTrade analyse chaque trade par rapport à vos règles définies (SL, Risk %, Heures). Il calcule ensuite un score de 0 à 100% pour identifier vos biais psychologiques."
    },
    {
      q: "Puis-je annuler mon abonnement ?",
      a: "Oui, à tout moment depuis vos paramètres. Aucun frais caché, aucun délai de préavis."
    }
  ];

  return (
    <section className="py-32 bg-surface/30">
      <div className="container mx-auto px-6 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-black mb-4">Questions Fréquentes</h2>
          <p className="text-txt-2">Tout ce que vous devez savoir sur la plateforme.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, i) => (
            <details 
              key={i} 
              className="group glass rounded-2xl border border-border/50 open:bg-elevated/50 transition-all duration-300"
            >
              <summary className="flex items-center justify-between p-6 cursor-pointer list-none">
                <span className="font-bold text-txt group-hover:text-accent transition-colors">{faq.q}</span>
                <ChevronDown size={20} className="text-txt-3 group-open:rotate-180 transition-transform duration-300" />
              </summary>
              <div className="px-6 pb-6 text-sm text-txt-2 leading-relaxed animate-[slideDown_0.3s_ease-out]">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
