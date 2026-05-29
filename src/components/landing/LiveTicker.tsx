import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { MOCK_TICKER } from '../../lib/mocks';

export const LiveTicker: React.FC = () => {
  // Triple the data to ensure seamless scroll
  const items = [...MOCK_TICKER, ...MOCK_TICKER, ...MOCK_TICKER];

  return (
    <div className="relative py-6 overflow-hidden border-y border-white/[0.06] bg-white/[0.015] backdrop-blur-xl">
      {/* Edge fade */}
      <div className="pointer-events-none absolute inset-y-0 left-0 w-32 bg-gradient-to-r from-bg to-transparent z-10" />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-32 bg-gradient-to-l from-bg to-transparent z-10" />

      <div className="flex animate-[scroll_60s_linear_infinite] whitespace-nowrap hover:[animation-play-state:paused]">
        {items.map((item, i) => (
          <div
            key={i}
            className="inline-flex items-center gap-4 px-8 border-r border-white/[0.04]"
          >
            <span className="text-[13px] font-semibold tracking-tight text-white">
              {item.symbol}
            </span>
            <span className="font-mono text-[13px] text-white/70 tabular-nums">
              {item.price}
            </span>
            <span
              className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md ${
                item.up
                  ? 'bg-emerald-500/[0.08] text-emerald-400'
                  : 'bg-rose-500/[0.08] text-rose-400'
              }`}
            >
              {item.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
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
