import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ShieldAlert, Zap } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

export const EditPlanModal: React.FC<EditPlanModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(user?.plan || 'free');

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await api.patch(`/api/admin/users/${user.id}/plan`, { plan: selectedPlan });
      addToast(`Le plan de ${user.email} a été mis à jour avec succès.`, 'success');
      onSuccess();
      onClose();
    } catch (err) {
      console.error(err);
      addToast('Erreur lors de la modification de l\'abonnement.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Modifier l'Abonnement"
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost" disabled={loading}>Annuler</button>
          <button 
            onClick={handleSave} 
            className="btn-primary"
            disabled={loading || selectedPlan === user.plan}
          >
            {loading ? 'Sauvegarde...' : 'Confirmer'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center font-bold text-lg mx-auto mb-3">
            {user.fullName ? user.fullName.charAt(0) : user.email.charAt(0).toUpperCase()}
          </div>
          <div className="font-bold text-txt">{user.fullName || 'Utilisateur'}</div>
          <div className="text-xs text-txt-2">{user.email}</div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-3">
            Plan Actuel : <span className="text-txt">{user.plan.toUpperCase()}</span>
          </label>
          <div className="grid grid-cols-2 gap-4">
            <button
              onClick={() => setSelectedPlan('free')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                selectedPlan === 'free' 
                  ? 'border-accent bg-accent/10 text-accent' 
                  : 'border-border bg-surface text-txt-2 hover:border-accent/30'
              }`}
            >
              <ShieldAlert size={24} />
              <span className="font-bold">Free</span>
            </button>
            <button
              onClick={() => setSelectedPlan('pro')}
              className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                selectedPlan === 'pro' 
                  ? 'border-win bg-win/10 text-win' 
                  : 'border-border bg-surface text-txt-2 hover:border-win/30'
              }`}
            >
              <Zap size={24} />
              <span className="font-bold">Pro</span>
            </button>
          </div>
        </div>
        
        <div className="p-4 rounded-xl bg-loss/5 border border-loss/20 text-xs text-txt-2">
          <span className="text-loss font-bold block mb-1">Attention</span>
          Modifier le plan manuellement n'impacte pas les abonnements Stripe en cours. Cela force uniquement les droits d'accès sur la plateforme BTrade.
        </div>
      </div>
    </Modal>
  );
};
