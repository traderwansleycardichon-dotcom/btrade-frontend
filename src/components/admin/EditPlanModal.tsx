import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import crownIcon from '../../assets/animations/1f451.json';
import { ShieldAlert, Zap, Crown } from 'lucide-react';
import api from '../../lib/api';
import { useToast } from '../../hooks/useToast';
import { useQueryClient } from '@tanstack/react-query';
import { PAID_PLANS, isPaidPlan, normalizePlan, planName } from '../../lib/membership';

interface EditPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  onSuccess: () => void;
}

const PLAN_CHOICES = [
  { id: 'free', label: 'Gratuit', icon: ShieldAlert },
  { id: 'pro', label: 'Pro', icon: Zap },
  { id: 'vip_incubator', label: 'VIP Incubator', icon: Crown },
];

export const EditPlanModal: React.FC<EditPlanModalProps> = ({ isOpen, onClose, user, onSuccess }) => {
  const { addToast } = useToast();
  const queryClient = useQueryClient();
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(normalizePlan(user?.plan) || 'free');
  const [giftPlan, setGiftPlan] = useState<string>('pro');

  const currentPlan = normalizePlan(user?.plan);

  // Le modal reste monté entre deux utilisateurs : on resynchronise la sélection.
  useEffect(() => {
    setSelectedPlan(currentPlan);
    setGiftPlan('pro');
  }, [user?.id, currentPlan]);
  // Le backend refuse de faire redescendre un membre payant ou expiré vers le plan gratuit.
  const freeLocked = isPaidPlan(currentPlan) || user?.plan === 'locked';

  const reportError = (err: any, fallback: string) => {
    const body = err?.response?.data;
    addToast(body?.message || body?.error || fallback, 'error');
  };

  const handleSave = async () => {
    if (!user) return;
    setLoading(true);
    try {
      await api.patch(`/api/admin/users/${user.id}/plan`, { plan: selectedPlan });
      addToast(`Le plan de ${user.email} a été mis à jour avec succès.`, 'success');
      onSuccess();
      onClose();
    } catch (err) {
      reportError(err, "Erreur lors de la modification de l'abonnement.");
    } finally {
      setLoading(false);
    }
  };

  const handleGift = async (durationMonths: number) => {
    if (!user) return;
    setLoading(true);
    try {
      await api.post(`/api/admin/users/${user.id}/gift-pro`, { plan: giftPlan, durationMonths });
      addToast(
        `${durationMonths} mois de ${planName(giftPlan)} offerts à ${user.email}.`,
        'success'
      );
      onSuccess();
      onClose();
    } catch (err) {
      reportError(err, "Erreur lors de l'attribution de l'abonnement offert.");
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
      animationData={crownIcon}
      size="sm"
      footer={
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost" disabled={loading}>Annuler</button>
          <button 
            onClick={handleSave} 
            className="btn-primary"
            disabled={loading || selectedPlan === currentPlan}
          >
            {loading ? 'Sauvegarde...' : 'Confirmer'}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div className="text-center">
          <div className="w-12 h-12 rounded-full bg-surface flex items-center justify-center font-bold text-lg mx-auto mb-3 overflow-hidden border border-border/10">
            {user.avatarUrl ? (
              <img src={user.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              user.fullName ? user.fullName.charAt(0) : user.email.charAt(0).toUpperCase()
            )}
          </div>
          <div className="font-bold text-txt">{user.fullName || 'Utilisateur'}</div>
          <div className="text-xs text-txt-2">{user.email}</div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-3">
            Plan Actuel : <span className="text-txt">{planName(currentPlan)}</span>
          </label>
          <div className="grid grid-cols-3 gap-3">
            {PLAN_CHOICES.map((choice) => {
              const Icon = choice.icon;
              const disabled = choice.id === 'free' && freeLocked;
              const active = selectedPlan === choice.id;
              return (
                <button
                  key={choice.id}
                  disabled={disabled}
                  onClick={() => setSelectedPlan(choice.id)}
                  className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all ${
                    active
                      ? 'border-accent bg-accent/10 text-accent'
                      : 'border-border bg-surface text-txt-2 hover:border-accent/30'
                  } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <Icon size={22} />
                  <span className="font-bold text-xs text-center leading-tight">{choice.label}</span>
                </button>
              );
            })}
          </div>
          {freeLocked && (
            <p className="text-xs text-loss mt-2 text-center">
              Il n'est pas possible de repasser manuellement un membre payant ou expiré au plan gratuit.
            </p>
          )}
        </div>

        <div className="pt-4 border-t border-border flex flex-col gap-3">
          <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest">
            Offrir un accès sans facturation
          </label>
          <div className="grid grid-cols-2 gap-3">
            {PAID_PLANS.map((paidPlan) => (
              <button
                key={paidPlan}
                onClick={() => setGiftPlan(paidPlan)}
                className={`p-3 rounded-xl border text-xs font-bold transition-all ${
                  giftPlan === paidPlan
                    ? 'border-win bg-win/10 text-win'
                    : 'border-border bg-surface text-txt-2 hover:border-win/30'
                }`}
              >
                {planName(paidPlan)}
              </button>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-3">
            {[1, 6, 12].map((months) => (
              <button
                key={months}
                onClick={() => handleGift(months)}
                disabled={loading}
                className="p-3 rounded-xl border border-win text-win bg-win/10 hover:bg-win/20 font-bold text-xs transition-all disabled:opacity-50"
              >
                {months} mois
              </button>
            ))}
          </div>
        </div>

        <div className="p-4 rounded-xl bg-loss/5 border border-loss/20 text-xs text-txt-2">
          <span className="text-loss font-bold block mb-1">Attention</span>
          Un abonnement facturé par Stripe ne peut pas être modifié ici : le serveur le refuse pour
          ne pas désynchroniser l'accès et la facturation. Ces actions ne concernent que les accès
          accordés à la main sur la plateforme Haitian Wall Street.
        </div>
      </div>
    </Modal>
  );
};
