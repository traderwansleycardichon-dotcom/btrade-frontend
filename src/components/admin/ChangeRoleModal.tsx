import React, { useState } from 'react';
import { X, Shield } from 'lucide-react';
import api from '../../lib/api';

interface ChangeRoleModalProps {
  isOpen: boolean;
  user: { id: string; fullName: string; email: string; role?: string } | null;
  onClose: () => void;
  onSuccess: () => void;
}

const ROLE_OPTIONS = [
  { value: 'user', label: 'Utilisateur', desc: 'Accès standard, aucun privilège admin', color: 'text-txt-2' },
  { value: 'staff', label: 'Staff Support', desc: 'Accès admin complet sauf suppression et gestion des rôles', color: 'text-accent' },
  { value: 'cto', label: 'CTO', desc: 'Accès admin complet sauf suppression et gestion des rôles', color: 'text-purple-400' },
];

export const ChangeRoleModal: React.FC<ChangeRoleModalProps> = ({ isOpen, user, onClose, onSuccess }) => {
  const [selectedRole, setSelectedRole] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen || !user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return setError('Sélectionne un rôle.');
    if (selectedRole === user.role) return setError('Ce rôle est déjà assigné.');
    setLoading(true);
    setError('');
    try {
      await api.patch(`/api/admin/users/${user.id}/role`, { role: selectedRole });
      onSuccess();
      handleClose();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors du changement de rôle.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setSelectedRole('');
    setError('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl mx-4">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-accent/10 flex items-center justify-center">
              <Shield size={18} className="text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-txt text-sm">Changer le rôle</h2>
              <p className="text-txt-3 text-xs">{user.fullName || user.email}</p>
            </div>
          </div>
          <button onClick={handleClose} className="text-txt-2 hover:text-txt p-1 rounded-lg hover:bg-elevated transition-colors">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {ROLE_OPTIONS.map(opt => (
            <button
              key={opt.value}
              type="button"
              onClick={() => { setSelectedRole(opt.value); setError(''); }}
              className={`w-full text-left px-4 py-3 rounded-xl border transition-colors ${
                selectedRole === opt.value
                  ? 'border-accent bg-accent/10'
                  : user.role === opt.value
                  ? 'border-border/50 bg-elevated/50 opacity-60 cursor-default'
                  : 'border-border hover:bg-elevated'
              }`}
              disabled={user.role === opt.value}
            >
              <div className={`text-sm font-semibold ${opt.color}`}>{opt.label}</div>
              <div className="text-txt-3 text-xs mt-0.5">{opt.desc}</div>
              {user.role === opt.value && (
                <span className="text-[10px] text-txt-3 font-bold uppercase">Rôle actuel</span>
              )}
            </button>
          ))}

          {error && <p className="text-red-400 text-xs">{error}</p>}

          <div className="flex gap-2 pt-1">
            <button type="button" onClick={handleClose} className="flex-1 px-4 py-2.5 rounded-xl border border-border text-txt-2 text-sm hover:bg-elevated transition-colors">
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading || !selectedRole || selectedRole === user.role}
              className="flex-1 px-4 py-2.5 rounded-xl bg-accent text-white text-sm font-semibold hover:bg-accent/90 disabled:opacity-50 transition-colors"
            >
              {loading ? 'Changement...' : 'Appliquer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
