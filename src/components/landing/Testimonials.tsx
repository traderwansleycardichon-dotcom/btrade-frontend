import React from 'react';
import { MOCK_TESTIMONIALS } from '../../lib/mocks';
import { Star } from 'lucide-react';

export const Testimonials: React.FC = () => {
  return (
    <section className="py-32 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="text-center mb-20">
          <h2 className="text-3xl font-black mb-4">Validé par la <span className="text-accent">communauté.</span></h2>
          <p className="text-txt-2">Rejoignez des milliers de traders qui ont transformé leur trading.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {MOCK_TESTIMONIALS.map((t, i) => (
            <div key={i} className="glass p-8 rounded-[2rem] flex flex-col hover:border-accent/30 transition-all group">
              <div className="flex gap-1 mb-6">
                {[...Array(5)].map((_, j) => (
                  <Star key={j} size={16} className="fill-accent text-accent" />
                ))}
              </div>
              <p className="text-txt-2 mb-8 flex-1 italic leading-relaxed">"{t.text}"</p>
              <div className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${t.gradient || 'from-elevated to-border'} flex items-center justify-center font-bold text-lg shadow-lg`}>
                  {t.initials}
                </div>
                <div>
                  <div className="font-bold text-txt">{t.name}</div>
                  <div className="text-xs text-txt-3 font-medium">{t.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
