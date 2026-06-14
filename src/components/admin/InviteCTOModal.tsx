import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';
import api from '../../lib/api';

interface InviteCTOModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const InviteCTOModal: React.FC<InviteCTOModalProps> = ({ isOpen, onClose, onSuccess }) => {
  const [form, setForm] = useState({ email: '', fullName: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<{ tempPassword: string } | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.fullName) return setError('Email et nom complet requis.');
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/api/admin/users/invite-cto', form);
      setResult({ tempPassword: res.data.data.tempPassword });
      onSuccess();
    } catch (err: any) {
      setError(err.response?.data?.error || "Erreur lors de l'invitation.");
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setForm({ email: '', fullName: '' });
    setError('');
    setResult(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-md shadow-2xl mx-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-purple-500/10 flex items-center justify-center">
              <Shield size={18} className="text-purple-400" />
            </div>
            <h2 className="font-semibold text-txt">Inviter un CTO</h2>
          </div>
          <button onClick={handleClose} className="text-txt-2 hover:text-txt p-1 rounded-lg hover:bg-elevated transition-colors">
            <X size={18} />
          </button>
        </div>

        {result ? (
          <div className="space-y-4">
            <div className="bg-green-500/10 border border-green-500/30 rounded-xl p-4">
              <p className="text-green-400 text-sm font-semibold mb-2">Compte CTO créé avec succès !</p>
              <p className="text-txt-2 text-xs">Mot de passe temporaire :</p>
              <p className="font-mono text-accent text-lg font-bold mt-1">{result.tempPassword}</p>
              <p className="text-txt-3 text-xs mt-2">Partage ce mot de passe en privé.</p>
            </div>
            <button onClick={handleClose} className="w-full py-2.5 bg-elevated text-txt text-sm rounded-xl hover:bg-border transition-colors">
              Fermer
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-txt-2 text-xs mb-1.5">Nom complet</label>
              <input
                type="text"
                value={form.fullName}
                onChange={e => setForm(p => ({ ...p, fullName: e.target.value }))}
                placeholder="Jean Dupont"
                className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-txt text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            <div>
              <label className="block text-txt-2 text-xs mb-1.5">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                placeholder="cto@example.com"
                className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-txt text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex gap-2 pt-1">
              <button type="button" onClick={handleClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-txt-2 text-sm hover:bg-elevated transition-colors">
                Annuler
              </button>
              <button type="submit" disabled={loading} className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors">
                {loading ? 'Invitation...' : 'Inviter CTO'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
