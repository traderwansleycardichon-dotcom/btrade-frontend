import React from 'react';

export const StatsSection: React.FC = () => {
  const stats = [
    { label: 'Capital Sous Gestion', value: '$412M+' },
    { label: 'Traders Actifs', value: '18k+' },
    { label: 'Trades Journalisés', value: '2.4M+' },
    { label: 'Win Rate Moyen', value: '58%' },
  ];

  return (
    <section className="py-10 relative overflow-hidden">
      <div className="container mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, i) => (
            <div key={i} className="text-center group">
              <div className="text-4xl md:text-5xl font-black text-white mb-2 group-hover:text-accent transition-colors duration-500">
                {stat.value}
              </div>
              <div className="text-[11px] font-bold text-txt-3 uppercase tracking-[0.2em]">
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
