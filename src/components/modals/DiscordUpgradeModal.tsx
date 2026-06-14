import React from 'react';
import { X, Lock, Crown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface DiscordUpgradeModalProps {
  onClose: () => void;
}

export const DiscordUpgradeModal: React.FC<DiscordUpgradeModalProps> = ({ onClose }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
        <div className="flex justify-end mb-2">
          <button
            onClick={onClose}
            className="text-txt-2 hover:text-txt p-1 rounded-lg hover:bg-elevated transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <div className="text-center mb-5">
          <div className="w-14 h-14 rounded-full bg-accent/10 flex items-center justify-center mx-auto mb-3">
            <Lock size={24} className="text-accent" />
          </div>
          <h2 className="font-bold text-txt text-lg mb-2">Accès PRO requis</h2>
          <p className="text-txt-2 text-sm leading-relaxed">
            Notre communauté Discord est réservée aux membres PRO.
            Passez à PRO pour rejoindre et échanger avec d'autres traders.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-xl border border-border text-txt-2 text-sm hover:bg-elevated transition-colors"
          >
            Fermer
          </button>
          <button
            onClick={() => { onClose(); navigate('/app/settings'); }}
            className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors flex items-center justify-center gap-2"
          >
            <Crown size={14} /> Passer PRO
          </button>
        </div>
      </div>
    </div>
  );
};
