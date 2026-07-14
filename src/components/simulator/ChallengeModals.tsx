import React from 'react';
import { ShieldCheck, ShieldAlert, Clock, X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAction: () => void;
}

export function ChallengePassedModal({ isOpen, onClose, onAction }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-green-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-green-500/20 text-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Challenge Réussi</h2>
          <p className="text-gray-300 text-sm mb-6">
            Félicitations ! Vous avez complété votre challenge avec succès en respectant toutes les règles de risque. 
            Vos performances ont été enregistrées.
          </p>
          <button 
            onClick={() => { onClose(); onAction(); }}
            className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            Démarrer un nouveau Challenge
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChallengeFailedModal({ isOpen, onClose, onAction, reason, cooldownLeft }: ModalProps & { reason?: string, cooldownLeft?: string }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-red-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <ShieldAlert className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Challenge Échoué</h2>
          <p className="text-gray-300 text-sm mb-4">
            Votre challenge a échoué. Raison : <strong className="text-red-400">{reason?.replace('_', ' ').toUpperCase()}</strong>
          </p>

          {cooldownLeft ? (
            <div className="bg-background rounded-lg p-3 mb-6 border border-border">
              <p className="text-gray-400 text-xs uppercase mb-1">Disponible dans</p>
              <p className="font-mono text-xl font-bold text-white">{cooldownLeft}</p>
            </div>
          ) : (
            <p className="text-gray-400 text-sm mb-6">Prenez le temps d'analyser vos erreurs.</p>
          )}

          <button 
            onClick={() => { onClose(); onAction(); }}
            disabled={!!cooldownLeft}
            className={`w-full font-bold py-3 px-4 rounded-xl transition-colors ${
              cooldownLeft 
                ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                : 'bg-accent hover:bg-accent-2 text-white'
            }`}
          >
            Recommencer un Challenge
          </button>
        </div>
      </div>
    </div>
  );
}

export function ChallengeExpiredModal({ isOpen, onClose, onAction }: ModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface border border-yellow-500/30 rounded-2xl p-6 max-w-md w-full shadow-2xl relative">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-5 h-5" />
        </button>
        
        <div className="text-center">
          <div className="w-16 h-16 bg-yellow-500/20 text-yellow-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-2">Challenge Expiré</h2>
          <p className="text-gray-300 text-sm mb-6">
            Votre période de 30 jours est écoulée. Vous n'avez pas complété les objectifs à temps.
            Vous pouvez renouveler ce challenge et continuer à vous entraîner.
          </p>
          <button 
            onClick={() => { onClose(); onAction(); }}
            className="w-full bg-yellow-600 hover:bg-yellow-500 text-white font-bold py-3 px-4 rounded-xl transition-colors"
          >
            Renouveler le Challenge
          </button>
        </div>
      </div>
    </div>
  );
}
