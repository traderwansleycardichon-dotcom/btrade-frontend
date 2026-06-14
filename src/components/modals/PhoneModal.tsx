import React, { useState } from 'react';
import { Phone, X } from 'lucide-react';
import api from '../../lib/api';
import { useAuthStore } from '../../hooks/useAuth';

interface PhoneModalProps {
  onClose: () => void;
}

export const PhoneModal: React.FC<PhoneModalProps> = ({ onClose }) => {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const refreshUser = useAuthStore(s => s.refreshUser);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phone.trim()) return setError('Nimewo telefòn obligatwa.');
    setLoading(true);
    try {
      await api.patch('/api/me/phone', { phone: phone.trim() });
      await refreshUser();
      onClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
        <div className="flex items-start justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0">
              <Phone size={20} className="text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-txt text-base">Ajoute nimewo telefòn ou</h2>
              <p className="text-txt-2 text-xs mt-0.5">Pou sekirite ak kontakt rapid</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-txt-2 hover:text-txt p-1 rounded-lg hover:bg-elevated transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-txt-2 text-xs mb-1.5">
              Nimewo telefòn (ex: +50912345678)
            </label>
            <input
              type="tel"
              value={phone}
              onChange={e => { setPhone(e.target.value); setError(''); }}
              placeholder="+509..."
              autoFocus
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-txt text-sm focus:outline-none focus:border-accent transition-colors"
            />
            {error && <p className="text-red-400 text-xs mt-1.5">{error}</p>}
          </div>
          <div className="flex gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2.5 rounded-xl border border-border text-txt-2 text-sm hover:bg-elevated transition-colors"
            >
              Plus tard
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 transition-colors disabled:opacity-50"
            >
              {loading ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
