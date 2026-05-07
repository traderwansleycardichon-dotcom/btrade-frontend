import React from 'react';

export const TimeHeatmap: React.FC = () => {
  const hours = ['08', '10', '12', '14', '16', '18', '20', '22'];
  const days = ['LU', 'MA', 'ME', 'JE', 'VE'];

  // Mock intensity grid
  const grid = [
    [0.1, 0.4, 0.2, 0.8, 0.9, 0.3, 0.1, 0],
    [0.2, 0.5, 0.8, 0.9, 0.4, 0.2, 0, 0],
    [0.1, 0.2, 0.3, 0.5, 0.4, 0.2, 0.1, 0.1],
    [0.4, 0.8, 0.9, 1.0, 0.6, 0.2, 0.1, 0],
    [0.1, 0.2, 0.3, 0.2, 0.1, 0, 0, 0],
  ];

  const getColor = (intensity: number) => {
    if (intensity === 0) return 'bg-elevated/30';
    if (intensity < 0.3) return 'bg-accent/20';
    if (intensity < 0.6) return 'bg-accent/40';
    if (intensity < 0.9) return 'bg-accent/70';
    return 'bg-accent shadow-[0_0_10px_rgba(243,108,0,0.4)]';
  };

  return (
    <div className="glass p-6 rounded-3xl h-full">
      <div className="flex justify-between items-center mb-6">
        <h3 className="font-bold text-lg">Heatmap Horaire</h3>
        <span className="text-[10px] font-bold text-txt-2 uppercase tracking-widest">Performance / Heure</span>
      </div>

      <div className="flex flex-col gap-2">
        <div className="flex gap-2 mb-2">
          <div className="w-8" />
          {hours.map(h => (
            <div key={h} className="flex-1 text-center text-[9px] font-bold text-txt-3">{h}h</div>
          ))}
        </div>

        {days.map((day, di) => (
          <div key={day} className="flex gap-2 items-center">
            <div className="w-8 text-[10px] font-bold text-txt-3">{day}</div>
            {grid[di].map((val, hi) => (
              <div 
                key={`${di}-${hi}`}
                className={`flex-1 aspect-square rounded-md transition-all hover:scale-110 cursor-help ${getColor(val)}`}
                title={`${val * 100}% d'intensité`}
              />
            ))}
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-[9px] font-bold text-txt-3">
        <span>Session Asia</span>
        <div className="flex items-center gap-1">
          <div className="w-2 h-2 rounded bg-accent/20" />
          <div className="w-2 h-2 rounded bg-accent/50" />
          <div className="w-2 h-2 rounded bg-accent" />
          <span className="ml-1 uppercase">Intensité P&L</span>
        </div>
      </div>
    </div>
  );
};
