import { useEffect, useState } from 'react';
import api from '../lib/api';
import type { Plan, PaymentMethods } from '../lib/pricing';

/**
 * Charge le catalogue et les passerelles disponibles depuis le backend.
 *
 * Il n'y a volontairement aucun tarif de repli en dur : afficher un prix
 * périmé serait pire que d'afficher un état de chargement.
 */
export function usePlans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethods | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const [plansRes, methodsRes] = await Promise.all([
          api.get('/api/billing/plans'),
          api.get('/api/billing/payment-methods').catch(() => null),
        ]);

        if (cancelled) return;

        setPlans(Array.isArray(plansRes.data?.data) ? plansRes.data.data : []);
        if (methodsRes?.data?.data) setPaymentMethods(methodsRes.data.data);
        setError(null);
      } catch {
        if (!cancelled) setError('Impossible de charger les offres pour le moment.');
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  return { plans, paymentMethods, loading, error };
}
