import React, { useState, useEffect } from 'react';
import { Trophy, TrendingUp, ShieldAlert, Zap, Medal, Star, Target, Award } from 'lucide-react';
import api from '../../../../lib/api';
import { toast } from 'react-hot-toast';

export default function SimulatorLeaderboardPage() {
  const [rankings, setRankings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/api/simulator/public/leaderboard');
      if (res.data?.success) {
        setRankings(res.data.data);
      }
    } catch (err: any) {
      toast.error('Failed to load leaderboard');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading leaderboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4 max-w-3xl mx-auto py-8">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-500/10 text-yellow-500 font-medium">
          <Trophy className="w-5 h-5" />
          Hall of Fame
        </div>
        <h1 className="text-4xl font-bold text-white tracking-tight">Simulator Leaderboard</h1>
        <p className="text-lg text-slate-400">
          The top performing traders in the HAITIAN WALL STREET simulation challenge. Rankings are based on ROI, Risk Management, Consistency, and Psychology.
        </p>
      </div>

      {/* Top 3 Podium */}
      {rankings.length >= 3 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end pt-8 pb-12">
          {/* Second Place */}
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/50 flex flex-col items-center text-center relative transform hover:-translate-y-2 transition-transform">
            <div className="absolute -top-6 w-12 h-12 bg-slate-400 text-slate-900 rounded-full flex items-center justify-center font-bold text-xl border-4 border-slate-900 shadow-lg">2</div>
            <img src={rankings[1]?.avatarUrl || `https://ui-avatars.com/api/?name=${rankings[1]?.username}&background=random`} alt="avatar" className="w-20 h-20 rounded-full mb-4 border-4 border-slate-400/20" />
            <h3 className="text-xl font-bold text-white">{rankings[1]?.username}</h3>
            <p className="text-emerald-400 font-medium mt-1">{rankings[1]?.roi?.toFixed(2)}% ROI</p>
            <div className="mt-4 px-4 py-1.5 bg-slate-900/50 rounded-lg text-sm text-slate-300 font-medium capitalize">
              {rankings[1]?.level}
            </div>
            {rankings[1]?.badges?.length > 0 && (
              <div className="mt-3 flex items-center justify-center gap-1">
                {rankings[1].badges.map((b: any, i: number) => (
                  <div key={i} className="text-slate-400 tooltip-trigger relative group/badge p-1 bg-slate-800 rounded">
                    <Award className="w-3.5 h-3.5" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max px-2 py-1 bg-slate-900 text-[10px] text-white rounded opacity-0 group-hover/badge:opacity-100 pointer-events-none z-10">
                      {b.type.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* First Place */}
          <div className="bg-gradient-to-b from-yellow-500/20 to-slate-800/80 rounded-2xl p-8 border border-yellow-500/30 flex flex-col items-center text-center relative transform hover:-translate-y-2 transition-transform z-10 md:-translate-y-8">
            <div className="absolute -top-6 w-16 h-16 bg-yellow-500 text-yellow-900 rounded-full flex items-center justify-center font-bold text-3xl border-4 border-slate-900 shadow-lg shadow-yellow-500/20">1</div>
            <img src={rankings[0]?.avatarUrl || `https://ui-avatars.com/api/?name=${rankings[0]?.username}&background=random`} alt="avatar" className="w-24 h-24 rounded-full mb-4 border-4 border-yellow-500/30" />
            <h3 className="text-2xl font-bold text-white">{rankings[0]?.username}</h3>
            <p className="text-emerald-400 font-bold text-lg mt-1">{rankings[0]?.roi?.toFixed(2)}% ROI</p>
            <div className="mt-4 px-4 py-1.5 bg-yellow-500/20 text-yellow-500 rounded-lg text-sm font-bold capitalize flex items-center gap-2">
              <Star className="w-4 h-4" fill="currentColor" /> {rankings[0]?.level}
            </div>
            {rankings[0]?.badges?.length > 0 && (
              <div className="mt-3 flex items-center justify-center gap-1">
                {rankings[0].badges.map((b: any, i: number) => (
                  <div key={i} className="text-yellow-500 tooltip-trigger relative group/badge p-1 bg-yellow-500/10 rounded">
                    <Award className="w-4 h-4" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max px-2 py-1 bg-slate-900 text-[10px] text-white rounded opacity-0 group-hover/badge:opacity-100 pointer-events-none z-10">
                      {b.type.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Third Place */}
          <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/50 flex flex-col items-center text-center relative transform hover:-translate-y-2 transition-transform">
            <div className="absolute -top-6 w-12 h-12 bg-amber-700 text-amber-100 rounded-full flex items-center justify-center font-bold text-xl border-4 border-slate-900 shadow-lg">3</div>
            <img src={rankings[2]?.avatarUrl || `https://ui-avatars.com/api/?name=${rankings[2]?.username}&background=random`} alt="avatar" className="w-20 h-20 rounded-full mb-4 border-4 border-amber-700/20" />
            <h3 className="text-xl font-bold text-white">{rankings[2]?.username}</h3>
            <p className="text-emerald-400 font-medium mt-1">{rankings[2]?.roi?.toFixed(2)}% ROI</p>
            <div className="mt-4 px-4 py-1.5 bg-slate-900/50 rounded-lg text-sm text-slate-300 font-medium capitalize">
              {rankings[2]?.level}
            </div>
            {rankings[2]?.badges?.length > 0 && (
              <div className="mt-3 flex items-center justify-center gap-1">
                {rankings[2].badges.map((b: any, i: number) => (
                  <div key={i} className="text-amber-500 tooltip-trigger relative group/badge p-1 bg-amber-900/20 rounded">
                    <Award className="w-3.5 h-3.5" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 w-max px-2 py-1 bg-slate-900 text-[10px] text-white rounded opacity-0 group-hover/badge:opacity-100 pointer-events-none z-10">
                      {b.type.replace('_', ' ')}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Leaderboard Table */}
      <div className="bg-slate-800/50 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/80 border-b border-slate-700/50">
              <tr>
                <th className="p-5 text-slate-400 font-semibold tracking-wide">Rank</th>
                <th className="p-5 text-slate-400 font-semibold tracking-wide">Trader</th>
                <th className="p-5 text-slate-400 font-semibold tracking-wide">Level</th>
                <th className="p-5 text-slate-400 font-semibold tracking-wide text-center">Score</th>
                <th className="p-5 text-slate-400 font-semibold tracking-wide text-center">Badges</th>
                <th className="p-5 text-slate-400 font-semibold tracking-wide text-right">ROI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {rankings.map((trader) => (
                <tr key={trader.rank} className="hover:bg-slate-700/30 transition-colors group">
                  <td className="p-5">
                    <span className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm
                      ${trader.rank === 1 ? 'bg-yellow-500 text-yellow-900' : 
                        trader.rank === 2 ? 'bg-slate-400 text-slate-900' : 
                        trader.rank === 3 ? 'bg-amber-700 text-amber-100' : 
                        'bg-slate-800 text-slate-400 border border-slate-700'}`}>
                      {trader.rank}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center gap-3">
                      <img src={trader.avatarUrl || `https://ui-avatars.com/api/?name=${trader.username}&background=random`} alt="avatar" className="w-10 h-10 rounded-full bg-slate-700 border border-slate-600" />
                      <span className="text-white font-medium group-hover:text-emerald-400 transition-colors">{trader.username}</span>
                    </div>
                  </td>
                  <td className="p-5">
                    <span className={`px-3 py-1 rounded-md text-xs font-medium capitalize border
                      ${trader.level === 'funded' ? 'bg-purple-500/20 text-purple-400 border-purple-500/20' : 
                        'bg-slate-700/50 text-slate-300 border-slate-600/50'}`}>
                      {trader.level === 'funded' ? 'Funded Trader' : trader.level}
                    </span>
                  </td>
                  <td className="p-5">
                    <div className="flex items-center justify-center gap-2">
                      <Target className="w-4 h-4 text-emerald-400" />
                      <span className="text-white font-bold">{Math.round(trader.rankingScore)}</span>
                    </div>
                  </td>
                  <td className="p-5 text-center">
                    <div className="flex items-center justify-center gap-1.5 flex-wrap max-w-[150px] mx-auto">
                      {trader.badges && trader.badges.length > 0 ? (
                        trader.badges.map((b: any, i: number) => (
                          <div 
                            key={i} 
                            className="bg-gradient-to-br from-yellow-500/20 to-orange-500/10 border border-yellow-500/30 p-1.5 rounded-lg tooltip-trigger relative group/badge"
                          >
                            <Award className="w-4 h-4 text-yellow-500" />
                            <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-max px-2 py-1 bg-slate-900 border border-slate-700 text-xs text-white rounded opacity-0 group-hover/badge:opacity-100 pointer-events-none transition-opacity z-10">
                              {b.type.replace('_', ' ')}
                            </div>
                          </div>
                        ))
                      ) : (
                        <span className="text-slate-600 text-xs italic">-</span>
                      )}
                    </div>
                  </td>
                  <td className="p-5 text-right">
                    <span className={`font-bold ${trader.roi >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {trader.roi > 0 ? '+' : ''}{trader.roi?.toFixed(2)}%
                    </span>
                  </td>
                </tr>
              ))}
              
              {rankings.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-12 text-center text-slate-400">
                    <Target className="w-12 h-12 text-slate-600 mx-auto mb-4" />
                    <p className="text-lg font-medium">No rankings yet</p>
                    <p className="text-sm">Start the simulation challenge to get ranked!</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
