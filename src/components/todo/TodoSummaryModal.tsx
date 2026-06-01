import React, { useEffect, useState } from 'react';
import { X, Sparkles, Trophy } from 'lucide-react';
import Lottie from 'lottie-react';
import { useAuth } from '../../hooks/useAuth';
import api from '../../lib/api';

interface SummaryData {
  type: 'daily' | 'weekly';
  score: number;
  total: number;
  completed: number;
  aiAdvice?: string;
  date?: string;
}

export function TodoSummaryModal() {
  const { isAuthenticated } = useAuth();
  const [summary, setSummary] = useState<SummaryData | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [confettiData, setConfettiData] = useState<any>(null);

  useEffect(() => {
    // Fetch Confetti Lottie JSON
    fetch('https://assets9.lottiefiles.com/packages/lf20_u4yrau.json')
      .then(res => res.json())
      .then(data => setConfettiData(data))
      .catch(err => console.error('Failed to load lottie', err));

    // Check for pending summary
    if (isAuthenticated) {
      api.get('/api/todo/summary/pending')
      .then(res => {
        const data = res.data;
        if (data.success && data.data) {
          setSummary(data.data);
          setIsOpen(true);
        }
      })
      .catch(err => console.error('Error fetching summary', err));
    }
  }, [isAuthenticated]);

  if (!isOpen || !summary) return null;

  const isSuccess = summary.score >= 80;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-background/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-md bg-[#1a1b1e] border border-white/10 rounded-2xl p-6 overflow-hidden">
        
        {/* Lottie Confetti Animation in Background */}
        {confettiData && isSuccess && (
          <div className="absolute inset-0 z-0 pointer-events-none opacity-60">
            <Lottie animationData={confettiData} loop={false} />
          </div>
        )}

        <button 
          onClick={() => setIsOpen(false)}
          className="absolute top-4 right-4 text-white/40 hover:text-white z-10 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="relative z-10 flex flex-col items-center text-center mt-4">
          <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mb-4">
            <Trophy className="h-8 w-8 text-accent" />
          </div>

          <h2 className="text-2xl font-bold text-white mb-2">
            {summary.type === 'weekly' ? 'Bilan de la Semaine' : 'Bilan de la Journée'}
          </h2>
          
          <p className="text-white/60 mb-6">
            Vous avez complété <strong className="text-white">{summary.completed}</strong> tâches sur {summary.total}.
          </p>

          <div className="flex items-center gap-4 mb-6">
            <div className="text-left">
              <div className="text-3xl font-bold text-accent">{Math.round(summary.score)}%</div>
              <div className="text-xs text-white/40 uppercase tracking-wider">Taux de réussite</div>
            </div>
            {isSuccess && (
              <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-sm font-medium">
                Objectif Atteint !
              </div>
            )}
          </div>

          {summary.aiAdvice && (
            <div className="bg-white/5 border border-white/10 rounded-xl p-4 text-left w-full mt-2">
              <div className="flex items-center gap-2 mb-2">
                <Sparkles className="h-4 w-4 text-accent" />
                <span className="text-sm font-semibold text-white">Conseil IA</span>
              </div>
              <p className="text-sm text-white/70 leading-relaxed italic">
                "{summary.aiAdvice}"
              </p>
            </div>
          )}

          <button 
            onClick={() => setIsOpen(false)}
            className="mt-8 w-full bg-accent hover:bg-accent-hover text-white py-3 rounded-xl font-medium transition-colors"
          >
            Continuer
          </button>
        </div>
      </div>
    </div>
  );
}
