import React from 'react';
import { ChevronDown } from 'lucide-react';

export const FaqSection: React.FC = () => {
  const faqs = [
    {
      q: "Compatible with MT4 & MT5?",
      a: "Yes! Import CSV files or use our auto-sync extension for real-time trade tracking."
    },
    {
      q: "Is it Prop Firm friendly?",
      a: "Absolutely. BTrade is an analysis tool. It doesn't interfere with trading and is used by traders worldwide."
    },
    {
      q: "Is there a free trial?",
      a: "We offer a 14-day trial on the Pro plan, no card required, no commitments."
    },
    {
      q: "How does AI Insights work?",
      a: "Our AI analyzes your trade history and setups to calculate win probabilities and detect cognitive biases."
    }
  ];

  return (
    <section id="faq" className="py-32">
      <div className="container mx-auto px-6 max-w-2xl">
        <div className="text-center mb-24">
          <h2 className="text-4xl md:text-6xl font-black mb-6 tracking-tighter uppercase">Questions.</h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <details 
              key={i} 
              className="group glass rounded-3xl border-white/5 transition-all duration-500 overflow-hidden"
            >
              <summary className="flex items-center justify-between p-8 cursor-pointer list-none">
                <span className="text-sm font-bold text-txt-2 group-hover:text-white transition-colors">{faq.q}</span>
                <ChevronDown size={18} className="text-txt-3 group-open:rotate-180 transition-transform duration-500" />
              </summary>
              <div className="px-8 pb-8 text-xs font-medium text-txt-3 leading-loose animate-scale-in">
                {faq.a}
              </div>
            </details>
          ))}
        </div>
      </div>
    </section>
  );
};
