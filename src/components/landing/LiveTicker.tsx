import React from 'react';
import { MOCK_TICKER } from '../../lib/mocks';

export const LiveTicker: React.FC = () => {
  // Triple the data to ensure seamless scroll
  const items = [...MOCK_TICKER, ...MOCK_TICKER, ...MOCK_TICKER];

  return (
    <div className="bg-surface border-y border-border py-4 relative overflow-hidden">
      <div className="flex animate-[scroll_50s_linear_infinite] whitespace-nowrap hover:[animation-play-state:paused]">
        {items.map((item, i) => (
          <div key={i} className="inline-flex items-center gap-6 px-12 border-r border-border">
            <span className="font-black text-sm tracking-tighter">{item.symbol}</span>
            <span className="font-mono text-sm font-bold">{item.price}</span>
            <span className={`text-[11px] font-black px-2 py-0.5 rounded ${
              item.up ? 'bg-win/10 text-win' : 'bg-loss/10 text-loss'
            }`}>
              {item.change}
            </span>
          </div>
        ))}
      </div>

      <style>{`
        @keyframes scroll {
          0% { transform: translateX(0); }
          100% { transform: translateX(-33.33%); }
        }
      `}</style>
    </div>
  );
};
