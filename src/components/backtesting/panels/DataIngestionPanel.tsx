import React, { useState, useEffect, useRef } from 'react';
import { Download, X, CheckCircle, AlertCircle, Loader2, Database } from 'lucide-react';
import api from '../../../lib/api';
import { useBacktestMarkets } from '../hooks/useBacktestMarkets';

interface Props {
  symbol: string;
  onClose: () => void;
}

interface Job {
  id: string;
  symbol?: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  doneHours: number;
  totalHours: number;
  error?: string;
  createdAt?: string;
}

export function DataIngestionPanel({ symbol, onClose }: Props) {
  const { markets }             = useBacktestMarkets();
  const [selectedSymbol, setSelectedSymbol] = useState(symbol);
  const [startDate, setStartDate]   = useState('');
  const [endDate, setEndDate]       = useState('');
  const [job, setJob]               = useState<Job | null>(null);
  const [loading, setLoading]       = useState(false);
  const [recentJobs, setRecentJobs] = useState<Job[]>([]);
  const esRef = useRef<EventSource | null>(null);

  useEffect(() => {
    fetchRecentJobs();
    return () => esRef.current?.close();
  }, []);

  const fetchRecentJobs = async () => {
    try {
      const res = await api.get('/api/backtest/ingest');
      setRecentJobs(res.data.data || []);
    } catch {}
  };

  const startIngestion = async () => {
    if (!startDate || !endDate) return;
    setLoading(true);
    try {
      const res = await api.post('/api/backtest/ingest', {
        symbol:    selectedSymbol,
        startDate: new Date(startDate).toISOString(),
        endDate:   new Date(endDate + 'T23:59:59').toISOString(),
      });
      const jobId = res.data.data.jobId;
      setJob({ id: jobId, status: 'pending', progress: 0, doneHours: 0, totalHours: 0 });
      subscribeToJob(jobId);
      fetchRecentJobs();
    } catch (err: any) {
      alert(err.response?.data?.error || 'Erreur lors du lancement du job');
    } finally {
      setLoading(false);
    }
  };

  const subscribeToJob = (jobId: string) => {
    esRef.current?.close();
    const es = new EventSource(`/api/backtest/ingest/${jobId}/stream`);
    esRef.current = es;
    es.onmessage = (e) => {
      const data: Job = JSON.parse(e.data);
      setJob(prev => prev ? { ...prev, ...data } : data);
      if (data.status === 'completed' || data.status === 'failed') {
        es.close();
        fetchRecentJobs();
      }
    };
    es.onerror = () => es.close();
  };

  const abortJob = async () => {
    if (!job) return;
    try {
      await api.delete(`/api/backtest/ingest/${job.id}`);
      setJob(prev => prev ? { ...prev, status: 'failed', error: 'Annulé' } : null);
    } catch {}
  };

  const statusIcon = (status: string) => {
    if (status === 'completed') return <CheckCircle className="w-4 h-4 text-green-500" />;
    if (status === 'failed')    return <AlertCircle className="w-4 h-4 text-red-500" />;
    if (status === 'running')   return <Loader2 className="w-4 h-4 text-primary animate-spin" />;
    return <Database className="w-4 h-4 text-gray-500" />;
  };

  return (
    <div className="flex-1 overflow-y-auto p-6 bg-[#0d1117]">
      <div className="max-w-2xl mx-auto space-y-6">

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center gap-2">
              <Download className="w-5 h-5 text-primary" />
              Téléchargement Données Dukascopy
            </h2>
            <p className="text-xs text-gray-400 mt-1">
              Données historiques tick → candles OHLCV pour tous les timeframes
            </p>
          </div>
          <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Config form */}
        <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Instrument
              </label>
              <select
                value={selectedSymbol}
                onChange={e => setSelectedSymbol(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-primary"
              >
                {markets.map(m => (
                  <option key={m.symbol} value={m.symbol}>{m.symbol}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Date début
              </label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5">
                Date fin
              </label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-[#0d1117] border border-[#30363d] text-white text-sm px-3 py-2 rounded-lg focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 text-xs text-gray-500 bg-[#0d1117] border border-[#30363d] rounded-lg p-3">
            <Database className="w-3.5 h-3.5 shrink-0" />
            Génère automatiquement les candles 1m, 5m, 15m, 30m, 1h, 4h, 1d.
            Maximum 90 jours par job. Source : Dukascopy historical datafeed.
          </div>

          <button
            onClick={startIngestion}
            disabled={loading || !startDate || !endDate || job?.status === 'running'}
            className="w-full bg-primary hover:bg-primary/90 text-white font-bold py-2.5 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
            {loading ? 'Lancement...' : 'Télécharger les données'}
          </button>
        </div>

        {/* Active job progress */}
        {job && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                {statusIcon(job.status)}
                <span className="text-sm font-bold text-white capitalize">{job.status}</span>
                {job.totalHours > 0 && (
                  <span className="text-xs text-gray-500">
                    {job.doneHours} / {job.totalHours} heures
                  </span>
                )}
              </div>
              {job.status === 'running' && (
                <button onClick={abortJob} className="text-xs text-red-400 hover:text-red-300 transition-colors">
                  Annuler
                </button>
              )}
            </div>

            <div className="w-full bg-[#21262d] rounded-full h-2">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  job.status === 'completed' ? 'bg-green-500' :
                  job.status === 'failed'    ? 'bg-red-500' : 'bg-primary'
                }`}
                style={{ width: `${job.progress}%` }}
              />
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 mt-1">
              <span>{job.progress}%</span>
              {job.error && <span className="text-red-400">{job.error}</span>}
            </div>
          </div>
        )}

        {/* Recent jobs */}
        {recentJobs.length > 0 && (
          <div className="bg-[#161b22] border border-[#30363d] rounded-xl overflow-hidden">
            <div className="px-4 py-2.5 border-b border-[#30363d]">
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Jobs récents</span>
            </div>
            <div className="divide-y divide-[#21262d]">
              {recentJobs.slice(0, 5).map(j => (
                <div key={j.id} className="flex items-center justify-between px-4 py-3">
                  <div className="flex items-center gap-2">
                    {statusIcon(j.status)}
                    <span className="text-xs text-white">{j.symbol}</span>
                    <span className="text-[10px] text-gray-500">
                      {new Date(j.createdAt as unknown as string).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">{j.progress}%</span>
                    <span className={`text-[10px] font-bold ${
                      j.status === 'completed' ? 'text-green-500' :
                      j.status === 'failed'    ? 'text-red-500' :
                      j.status === 'running'   ? 'text-primary' : 'text-gray-500'
                    }`}>{j.status}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
