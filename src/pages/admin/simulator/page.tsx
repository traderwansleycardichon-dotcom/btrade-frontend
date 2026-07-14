import React, { useState, useEffect } from 'react';
import { Target, Trophy, TrendingUp, AlertTriangle, User, Medal } from 'lucide-react';
import api from '../../../lib/api';
import { toast } from 'react-hot-toast';

export default function AdminSimulatorPage() {
  const [accounts, setAccounts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [grantBadgeAccount, setGrantBadgeAccount] = useState<any>(null);
  const [badgeName, setBadgeName] = useState('');

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await api.get('/api/admin/leaderboard');
      if (res.data?.success) {
        setAccounts(res.data.data);
      }
    } catch (err: any) {
      toast.error('Failed to load simulator stats');
    } finally {
      setLoading(false);
    }
  };

  const handleGrantBadge = async () => {
    if (!grantBadgeAccount || !badgeName) return;
    try {
      const res = await api.post('/api/admin/reward', {
        userId: grantBadgeAccount.user.id,
        badge: badgeName,
        description: 'Granted manually by admin'
      });
      if (res.data?.success) {
        toast.success('Badge granted successfully');
        setGrantBadgeAccount(null);
        setBadgeName('');
      }
    } catch (err: any) {
      toast.error('Failed to grant badge');
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading leaderboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Trophy className="w-6 h-6 text-yellow-400" />
            Simulator & Prop Firm Leaderboard
          </h1>
          <p className="text-slate-400 mt-1">Monitor all simulator traders, rankings, and challenge statuses.</p>
        </div>
      </div>

      {grantBadgeAccount && (
        <div className="p-4 bg-slate-800/50 rounded-xl border border-slate-700/50 mb-6">
          <h3 className="text-white font-medium mb-4 flex items-center gap-2">
            <Medal className="w-4 h-4 text-emerald-400" />
            Grant Badge to {grantBadgeAccount.user?.fullName}
          </h3>
          <div className="flex gap-4">
            <select
              value={badgeName}
              onChange={(e) => setBadgeName(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-2 text-white"
            >
              <option value="">Select Badge</option>
              <option value="Challenge Starter">🥉 Challenge Starter</option>
              <option value="Consistent Trader">🥈 Consistent Trader</option>
              <option value="Funded Trader">🥇 Funded Trader</option>
              <option value="Elite Trader">🏆 Elite Trader</option>
            </select>
            <button onClick={handleGrantBadge} className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg transition-colors">
              Grant
            </button>
            <button onClick={() => setGrantBadgeAccount(null)} className="text-slate-400 hover:text-white px-4">
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="bg-slate-800/50 rounded-xl border border-slate-700/50 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-900/50 border-b border-slate-700/50">
              <tr>
                <th className="p-4 text-slate-400 font-medium">Trader</th>
                <th className="p-4 text-slate-400 font-medium">Challenge</th>
                <th className="p-4 text-slate-400 font-medium">Status</th>
                <th className="p-4 text-slate-400 font-medium">Balance</th>
                <th className="p-4 text-slate-400 font-medium">P/L</th>
                <th className="p-4 text-slate-400 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-700/50">
              {accounts.map((acc) => {
                const pnl = parseFloat(acc.currentBalance) - parseFloat(acc.initialBalance);
                const isPositive = pnl >= 0;
                
                return (
                  <tr key={acc.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center">
                          <User className="w-5 h-5 text-slate-400" />
                        </div>
                        <div>
                          <p className="text-white font-medium">{acc.user?.fullName || 'Unknown'}</p>
                          <p className="text-slate-400 text-sm">{acc.user?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      <span className="capitalize text-slate-300 font-medium">
                        {acc.challengeLevel || 'Basic Simulator'}
                      </span>
                    </td>
                    <td className="p-4">
                      {acc.status === 'active' && <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 rounded-md text-xs font-medium border border-emerald-500/20">Active</span>}
                      {acc.status === 'passed' && <span className="px-2 py-1 bg-blue-500/20 text-blue-400 rounded-md text-xs font-medium border border-blue-500/20">Passed</span>}
                      {acc.status.includes('failed') && <span className="px-2 py-1 bg-red-500/20 text-red-400 rounded-md text-xs font-medium border border-red-500/20 capitalize">{acc.status.replace('_', ' ')}</span>}
                      {acc.status === 'locked' && <span className="px-2 py-1 bg-slate-500/20 text-slate-400 rounded-md text-xs font-medium border border-slate-500/20">Locked</span>}
                    </td>
                    <td className="p-4 text-white font-medium">
                      ${parseFloat(acc.currentBalance).toLocaleString()}
                    </td>
                    <td className="p-4">
                      <span className={`font-medium ${isPositive ? 'text-emerald-400' : 'text-red-400'}`}>
                        {isPositive ? '+' : ''}${pnl.toLocaleString()}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => setGrantBadgeAccount(acc)}
                        className="p-2 text-slate-400 hover:text-emerald-400 hover:bg-emerald-400/10 rounded-lg transition-colors"
                        title="Grant Badge"
                      >
                        <Medal className="w-5 h-5" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
