import React from 'react';

const stats = [
  { label: 'Capital tracé', value: '412 M$', sub: 'sur la plateforme' },
  { label: 'Traders actifs', value: '18 200', sub: 'sessions mensuelles' },
  { label: 'Trades journalisés', value: '2,4 M', sub: 'analysés par notre IA' },
  { label: 'Win rate médian', value: '58 %', sub: 'utilisateurs Pro' },
];

export const StatsSection: React.FC = () => {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="glass-frost glass-rim rounded-2xl px-6 py-10 sm:px-10 sm:py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-y-10 gap-x-6">
            {stats.map((s, i) => (
              <div
                key={s.label}
                className={`relative ${i > 0 ? 'md:before:absolute md:before:left-0 md:before:top-2 md:before:bottom-2 md:before:w-px md:before:bg-white/[0.08]' : ''}`}
              >
                <div className="md:pl-6">
                  <div className="text-[10px] uppercase tracking-[0.22em] text-white/45 font-medium mb-2">
                    {s.label}
                  </div>
                  <div className="text-3xl md:text-4xl font-semibold tracking-tight text-white tabular-nums">
                    {s.value}
                  </div>
                  <div className="text-[12px] text-white/45 mt-1">{s.sub}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
