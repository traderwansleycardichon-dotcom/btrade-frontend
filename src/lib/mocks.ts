export const MOCK_OPEN_POSITIONS = [
  {
    id: '1', symbol: 'EURUSD', direction: 'BUY', size: 0.5,
    entryPrice: 1.08305, sl: 1.08180, tp: 1.08555,
    pnl: 48.20, progressPct: 32,
  },
  {
    id: '2', symbol: 'XAUUSD', direction: 'SELL', size: 0.1,
    entryPrice: 2328.50, sl: 2332.00, tp: 2318.00,
    pnl: -12.40, progressPct: 18,
  },
];

export const MOCK_DISCIPLINE = {
  slRespected: 94,
  planFollowed: 82,
  noRevenge: 90,
  riskUnder1: 100,
};

export const MOCK_STREAK = {
  current: 7,
  record: 11,
  history: [true,true,true,true,true,true,true,false,false,false],
};

export const MOCK_PLAYBOOKS = [
  { name: 'London Breakout', trades: 28, pnl: 1842, winRate: 71, initials: 'LB', isPositive: true },
  { name: 'Pullback Trend',  trades: 19, pnl: 987,  winRate: 68, initials: 'PT', isPositive: true },
  { name: 'NY Reversal',     trades: 14, pnl: 612,  winRate: 57, initials: 'NY', isPositive: true },
  { name: 'Range Fade',      trades: 9,  pnl: -184, winRate: 44, initials: 'RF', isPositive: false },
];

export const MOCK_MACRO_EVENTS = [
  { time: '14:30', event: 'CPI YoY', currency: 'USD', impact: 'high' },
  { time: '20:00', event: 'FOMC Decision', currency: 'USD', impact: 'high' },
  { time: '11:00', event: 'PIB EUR QoQ', currency: 'EUR', impact: 'medium' },
];

export const MOCK_R_DISTRIBUTION = {
  losses: [
    { r: '-3', count: 3 }, { r: '-2', count: 6 },
    { r: '-1.5', count: 12 }, { r: '-1', count: 18 }, { r: '-0.5', count: 24 },
  ],
  wins: [
    { r: '+0.5', count: 42 }, { r: '+1', count: 36 },
    { r: '+2', count: 24 }, { r: '+3', count: 12 }, { r: '+4', count: 6 },
  ],
};

export const MOCK_HEATMAP_DATA: Record<number, { pnl: number; trades: number }> = {
  1: { pnl: -84,  trades: 2 }, 2: { pnl: 218,  trades: 3 },
  3: { pnl: 412,  trades: 4 }, 6: { pnl: 184,  trades: 2 },
  7: { pnl: -212, trades: 3 }, 8: { pnl: 308,  trades: 4 },
  9: { pnl: 0,    trades: 1 }, 10: { pnl: 540, trades: 3 },
  13: { pnl: 612, trades: 5 }, 14: { pnl: -148, trades: 2 },
  15: { pnl: 284, trades: 3 }, 16: { pnl: 124,  trades: 2 },
  17: { pnl: -86, trades: 2 }, 20: { pnl: 312,  trades: 3 },
  21: { pnl: 198, trades: 2 }, 22: { pnl: 142,  trades: 3 },
  23: { pnl: 468, trades: 4 }, 24: { pnl: 56,   trades: 3 },
  27: { pnl: -86, trades: 2 }, 28: { pnl: 597,  trades: 4 },
};

export const MOCK_TICKER = [
  { symbol: 'EURUSD', price: '1.08312', change: '+0.18%', up: true },
  { symbol: 'GBPUSD', price: '1.25420', change: '+0.24%', up: true },
  { symbol: 'USDJPY', price: '156.380', change: '-0.12%', up: false },
  { symbol: 'XAUUSD', price: '2,328.50', change: '+0.41%', up: true },
  { symbol: 'NAS100', price: '17,755', change: '-0.32%', up: false },
  { symbol: 'BTC',    price: '63,420', change: '+1.24%', up: true },
];

export const MOCK_TESTIMONIALS = [
  {
    name: 'Marc D.', initials: 'M',
    role: 'Funded $200k · FundedNext', rating: 5,
    text: "J'ai passé ma FTMO Eval en 12 jours grâce au calendrier P&L. J'ai vu que mes mardis étaient catastrophiques — j'ai arrêté.",
    gradient: 'from-accent to-accent-2',
  },
  {
    name: 'Léa M.', initials: 'L',
    role: 'Funded $50k · The 5%ers', rating: 5,
    text: "Le journal Avant/Pendant/Après a transformé ma routine. Mon score discipline est passé de 62% à 91%.",
    gradient: 'from-accent-2 to-accent',
  },
  {
    name: 'Thomas R.', initials: 'T',
    role: 'Eval Phase 2 · FTMO $100k', rating: 5,
    text: "Les playbooks m'ont fait découvrir que mon Range Fade ruinait tout. Je l'ai retiré. +18% de win rate global.",
    gradient: 'from-accent to-elevated',
  },
];
