import React, { useState } from 'react';
import { Target, ShieldAlert, Award, Clock } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

export function ChallengeSelector({ onChallengeStarted }: { onChallengeStarted: () => void }) {
  const [loading, setLoading] = useState<string | null>(null);
  const [cooldown, setCooldown] = useState<any>(null);
  const [timeLeft, setTimeLeft] = useState<string>('');

  React.useEffect(() => {
    const fetchCooldown = async () => {
      try {
        const res = await api.get('/api/simulator/challenge/cooldown');
        if (res.data.success && res.data.data) {
          setCooldown(res.data.data);
        }
      } catch (err) {
        console.error('Failed to fetch cooldown', err);
      }
    };
    fetchCooldown();
  }, []);

  React.useEffect(() => {
    if (!cooldown) return;

    const interval = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(cooldown.availableRestartTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(interval);
        setCooldown(null);
        setTimeLeft('');
      } else {
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((distance % (1000 * 60)) / 1000);
        setTimeLeft(`${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [cooldown]);

  const startChallenge = async (level: string) => {
    try {
      setLoading(level);
      await api.post('/api/simulator/challenge/start', { level });
      toast.success('Challenge démarré avec succès !');
      onChallengeStarted();
    } catch (err: any) {
      toast.error(err.response?.data?.error || 'Erreur lors du démarrage du challenge');
    } finally {
      setLoading(null);
    }
  };

  const tiers = [
    {
      id: 'beginner',
      name: 'Beginner',
      capital: '$50,000',
      target: '$3,000',
      maxDrawdown: '$2,000',
      dailyLoss: '$1,000',
      color: 'blue'
    },
    {
      id: 'professional',
      name: 'Professional',
      capital: '$100,000',
      target: '$6,000',
      maxDrawdown: '$3,000',
      dailyLoss: '$1,500',
      color: 'purple'
    },
    {
      id: 'elite',
      name: 'Elite',
      capital: '$150,000',
      target: '$9,000',
      maxDrawdown: '$4,500',
      dailyLoss: '$6,000',
      color: 'amber'
    }
  ];

  return (
    <div className="w-full max-w-[1600px] mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="text-center mb-8 md:mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-txt mb-3 md:mb-4">Choisissez votre Challenge</h1>
        <p className="text-gray-400 text-base md:text-lg max-w-3xl mx-auto px-2">
          Prouvez vos compétences en trading virtuel, respectez les règles de risque et débloquez un compte financé (virtuel). Le but est la discipline.
        </p>
      </div>

      {cooldown && (
        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-8 text-center max-w-2xl mx-auto flex flex-col items-center">
          <Clock className="w-8 h-8 text-red-500 mb-2" />
          <h3 className="text-red-500 font-bold text-lg mb-1">Période de pause active</h3>
          <p className="text-red-400 text-sm mb-3">
            Vous avez échoué récemment. La discipline est primordiale en trading.<br/>
            Veuillez analyser vos erreurs avant de relancer un challenge.
          </p>
          <div className="bg-background px-4 py-2 rounded-lg font-mono text-xl font-bold text-txt border border-red-500/30">
            {timeLeft}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
        {tiers.map((tier) => (
          <div key={tier.id} className="bg-surface border border-border rounded-2xl p-5 sm:p-6 flex flex-col hover:border-accent/50 transition-colors w-full">
            <div className={`w-14 h-14 sm:w-16 sm:h-16 rounded-2xl flex items-center justify-center mb-4 sm:mb-6 bg-${tier.color}-500/10 text-${tier.color}-500`}>
              <Award className="w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-txt mb-1">{tier.name}</h2>
            <div className="text-2xl sm:text-3xl font-black text-accent mb-4 sm:mb-6">{tier.capital}</div>

            <div className="space-y-4 flex-1">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-400"><Target className="w-4 h-4 mr-2" /> Objectif de Profit</div>
                <div className="font-semibold text-green-500">{tier.target}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-400"><ShieldAlert className="w-4 h-4 mr-2" /> Max Drawdown</div>
                <div className="font-semibold text-red-500">-{tier.maxDrawdown}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-400"><ShieldAlert className="w-4 h-4 mr-2" /> Limite de Perte Jour</div>
                <div className="font-semibold text-red-500">-{tier.dailyLoss}</div>
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center text-gray-400"><Clock className="w-4 h-4 mr-2" /> Temps Limite</div>
                <div className="font-semibold text-txt">30 Jours</div>
              </div>
            </div>

            <button
              onClick={() => startChallenge(tier.id)}
              disabled={loading !== null || cooldown !== null}
              className={`w-full mt-6 sm:mt-8 py-3 rounded-xl font-bold transition-all ${
                loading === tier.id || cooldown !== null
                  ? 'bg-accent/30 text-gray-300 cursor-not-allowed border border-accent/20' 
                  : 'bg-accent hover:bg-accent-2 text-white shadow-lg shadow-accent/20'
              }`}
            >
              {loading === tier.id ? 'Création...' : cooldown !== null ? 'Verrouillé' : 'Démarrer le Challenge'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
