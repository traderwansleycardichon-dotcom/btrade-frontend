import React from 'react';
import { Lock, RefreshCw } from 'lucide-react';
import api from '../../lib/api';
import { toast } from 'react-hot-toast';

interface Props {
  onRetry: () => void;
}

export function SimulatorLocked({ onRetry }: Props) {
  const handleRetry = async () => {
    try {
      await api.post('/api/simulator/account/retry');
      toast.success('Nouveau compte simulateur créé !');
      onRetry();
    } catch (err: any) {
      toast.error('Erreur lors de la réinitialisation du compte');
    }
  };

  return (
    <div className="flex items-center justify-center h-[calc(100vh-4rem)] bg-background">
      <div className="bg-surface border border-border p-8 rounded-2xl max-w-md w-full text-center shadow-lg">
        <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <Lock className="w-10 h-10 text-red-500" />
        </div>
        <h2 className="text-2xl font-bold text-text mb-4">Compte Verrouillé</h2>
        <p className="text-text-muted mb-8">
          Votre solde a atteint la limite de perte maximale de $2,000. 
          Dans le cadre d'un vrai prop-firm, ce compte serait considéré comme échoué.
        </p>
        
        <button
          onClick={handleRetry}
          className="w-full bg-primary hover:bg-primary/90 text-txt font-semibold py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-colors"
        >
          <RefreshCw className="w-5 h-5" />
          Réessayer (Reset)
        </button>
      </div>
    </div>
  );
}
