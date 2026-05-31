import React, { useState, useEffect } from 'react';
import { Ticket, Plus, Trash2, Calendar, Percent, RefreshCw, X } from 'lucide-react';
import { Modal } from '../../../components/ui/Modal';
import { useAuth } from '../../../hooks/useAuth';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface PromoCode {
  id: string;
  code: string;
  active: boolean;
  coupon: {
    id: string;
    percent_off: number;
    duration: string;
    duration_in_months: number | null;
  };
  expires_at: number | null;
  max_redemptions: number | null;
  times_redeemed: number;
  created: number;
}

export const PromoCodesPage: React.FC = () => {
  const { getAuthToken } = useAuth();
  const [promoCodes, setPromoCodes] = useState<PromoCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [code, setCode] = useState('');
  const [percentOff, setPercentOff] = useState('100');
  const [duration, setDuration] = useState('repeating');
  const [durationInMonths, setDurationInMonths] = useState('1');
  const [expiresAtDate, setExpiresAtDate] = useState('');

  const fetchPromoCodes = async () => {
    try {
      setLoading(true);
      const token = getAuthToken();
      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/billing/promo-codes`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setPromoCodes(data.data);
      } else {
        setError(data.error);
      }
    } catch (err) {
      setError('Erreur lors du chargement des codes promo');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPromoCodes();
  }, []);

  const handleCreatePromoCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const token = getAuthToken();
      const payload: any = {
        code,
        percent_off: percentOff,
        duration,
      };

      if (duration === 'repeating') {
        payload.duration_in_months = durationInMonths;
      }
      if (expiresAtDate) {
        payload.expires_at = new Date(expiresAtDate).toISOString();
      }

      const res = await fetch(`${import.meta.env.VITE_API_URL}/admin/billing/promo-codes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setIsModalOpen(false);
        setCode('');
        setPercentOff('100');
        setDuration('repeating');
        setDurationInMonths('1');
        setExpiresAtDate('');
        fetchPromoCodes();
      } else {
        setError(data.error || 'Erreur lors de la création');
      }
    } catch (err) {
      setError('Erreur réseau');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDurationText = (coupon: PromoCode['coupon']) => {
    switch (coupon.duration) {
      case 'forever': return 'À vie';
      case 'once': return 'Une seule fois';
      case 'repeating': return `${coupon.duration_in_months} mois`;
      default: return coupon.duration;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Codes Promo</h1>
          <p className="text-txt-2 text-sm">Gérez les codes de réduction Stripe pour les abonnements Pro.</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-accent text-bg rounded-xl font-bold hover:bg-accent-hover transition-colors"
        >
          <Plus size={18} />
          Créer un code promo
        </button>
      </div>

      <div className="glass rounded-3xl border border-border p-0 overflow-hidden">
        {loading ? (
          <div className="p-8 flex justify-center">
            <RefreshCw className="animate-spin text-accent" size={24} />
          </div>
        ) : promoCodes.length === 0 ? (
          <div className="p-8 text-center text-txt-2">
            Aucun code promo actif.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-txt-2 uppercase bg-surface/50 border-b border-border">
                <tr>
                  <th className="px-6 py-4 font-bold">Code</th>
                  <th className="px-6 py-4 font-bold">Réduction</th>
                  <th className="px-6 py-4 font-bold">Durée</th>
                  <th className="px-6 py-4 font-bold">Utilisations</th>
                  <th className="px-6 py-4 font-bold">Créé le</th>
                  <th className="px-6 py-4 font-bold">Expire le</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {promoCodes.map((pc) => (
                  <tr key={pc.id} className="hover:bg-elevated/50 transition-colors">
                    <td className="px-6 py-4 font-mono font-bold text-accent">{pc.code}</td>
                    <td className="px-6 py-4 font-medium">{pc.coupon.percent_off}%</td>
                    <td className="px-6 py-4 text-txt-2">{getDurationText(pc.coupon)}</td>
                    <td className="px-6 py-4">
                      {pc.times_redeemed} {pc.max_redemptions ? `/ ${pc.max_redemptions}` : ''}
                    </td>
                    <td className="px-6 py-4 text-txt-2">
                      {format(new Date(pc.created * 1000), 'dd MMM yyyy', { locale: fr })}
                    </td>
                    <td className="px-6 py-4">
                      {pc.expires_at ? (
                        <span className="text-loss">
                          {format(new Date(pc.expires_at * 1000), 'dd MMM yyyy', { locale: fr })}
                        </span>
                      ) : (
                        <span className="text-txt-3">Jamais</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Création Code Promo */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => !isSubmitting && setIsModalOpen(false)}
        title="Créer un Code Promo"
      >
        <form onSubmit={handleCreatePromoCode} className="space-y-4">
          {error && (
            <div className="p-3 rounded-lg bg-loss/10 text-loss text-sm font-medium border border-loss/20">
              {error}
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-txt-2 mb-1 uppercase tracking-wider">
              Code (ex: BTRADE100)
            </label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              placeholder="VIP2026"
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors font-mono uppercase"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-txt-2 mb-1 uppercase tracking-wider">
              Réduction (en %)
            </label>
            <div className="relative">
              <Percent className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <input
                type="number"
                min="1"
                max="100"
                required
                value={percentOff}
                onChange={(e) => setPercentOff(e.target.value)}
                className="w-full bg-elevated border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-txt-2 mb-1 uppercase tracking-wider">
              Durée de la réduction
            </label>
            <select
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors appearance-none"
            >
              <option value="repeating">Répétitif (X mois)</option>
              <option value="once">Une seule fois (1er mois)</option>
              <option value="forever">À vie</option>
            </select>
          </div>

          {duration === 'repeating' && (
            <div>
              <label className="block text-xs font-bold text-txt-2 mb-1 uppercase tracking-wider">
                Nombre de mois
              </label>
              <input
                type="number"
                min="1"
                required
                value={durationInMonths}
                onChange={(e) => setDurationInMonths(e.target.value)}
                className="w-full bg-elevated border border-border rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-txt-2 mb-1 uppercase tracking-wider">
              Date d'expiration (Facultatif)
            </label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <input
                type="date"
                value={expiresAtDate}
                onChange={(e) => setExpiresAtDate(e.target.value)}
                className="w-full bg-elevated border border-border rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-accent transition-colors"
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button
              type="button"
              onClick={() => setIsModalOpen(false)}
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-surface border border-border text-txt rounded-xl font-bold hover:bg-elevated transition-colors"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 px-4 bg-accent text-bg rounded-xl font-bold hover:bg-accent-hover transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <RefreshCw className="animate-spin" size={18} />
              ) : (
                'Générer le code'
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
