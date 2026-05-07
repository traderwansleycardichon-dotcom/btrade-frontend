import React from 'react';

const CalendarPage: React.FC = () => {
  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold">Calendrier P&L</h2>
        <div className="flex gap-2">
           <button className="px-4 py-2 bg-elevated border border-border rounded-xl text-xs font-bold text-txt-2 hover:text-txt transition-all">Précédent</button>
           <button className="px-4 py-2 bg-elevated border border-border rounded-xl text-xs font-bold text-txt-2 hover:text-txt transition-all">Suivant</button>
        </div>
      </div>

      <div className="glass p-12 rounded-[2.5rem] min-h-[600px] flex flex-col items-center justify-center text-center">
        <div className="w-20 h-20 bg-accent/10 rounded-3xl flex items-center justify-center mb-6">
           <span className="text-4xl">📅</span>
        </div>
        <h3 className="text-2xl font-bold mb-4">Module en cours de déploiement</h3>
        <p className="text-txt-2 max-w-md mx-auto leading-relaxed">
          La vue calendrier complète sera disponible dans la prochaine itération (V2). 
          Elle permettra une analyse hebdomadaire et mensuelle approfondie de vos performances.
        </p>
      </div>
    </div>
  );
};

export default CalendarPage;
