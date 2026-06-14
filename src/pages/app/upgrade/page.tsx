import React, { useState, useEffect, useRef } from "react";
import {
  Check,
  Sparkles,
  Zap,
  Shield,
  Rocket,
  ArrowRight,
  Loader2,
  ArrowLeft,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import api from "../../../lib/api";
import { useAuth } from "../../../hooks/useAuth";
import { useSettings } from "../../../contexts/SettingsContext";

export default function UpgradePage() {
  const { user, refreshUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState<string | null>(null);
  const [plans, setPlans] = useState<any[]>([]);
  const [isFetching, setIsFetching] = useState(true);
  const { settings } = useSettings();
  const pollingRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // MonCash Modal state
  const [showMoncashModal, setShowMoncashModal] = useState(false);
  const [selectedPlanForMoncash, setSelectedPlanForMoncash] = useState<any>(null);

  const paymentStatus = searchParams.get("payment"); // 'success' | 'canceled' | null

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        const { data } = await api.get("/api/billing/plans");
        setPlans(data.data);
      } catch (err) {
        console.error("Erreur plans:", err);
      } finally {
        setIsFetching(false);
      }
    };
    fetchPlans();
  }, []);

  // After a successful payment redirect, poll until webhook unlocks the account
  useEffect(() => {
    if (paymentStatus !== "success") return;

    // Immediate refresh
    refreshUser();

    // Poll every 2s for up to 20s to detect when webhook has processed
    let attempts = 0;
    pollingRef.current = setInterval(async () => {
      attempts++;
      await refreshUser();
      if (attempts >= 10) {
        clearInterval(pollingRef.current!);
      }
    }, 2000);

    return () => {
      if (pollingRef.current) clearInterval(pollingRef.current);
    };
  }, [paymentStatus]);

  // Auto-redirect to dashboard once account is unlocked
  useEffect(() => {
    if (paymentStatus === "success" && user?.plan === "pro") {
      if (pollingRef.current) clearInterval(pollingRef.current);
      const timer = setTimeout(() => navigate("/app/dashboard"), 2000);
      return () => clearTimeout(timer);
    }
  }, [user?.plan, paymentStatus, navigate]);

  const handleUpgrade = async (planId: "pro") => {
    setLoading(planId);
    try {
      const res = await api.post("/api/billing/create-checkout-session", {
        planId,
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Erreur checkout:", err);
      alert("Erreur lors de la création de la session de paiement.");
    } finally {
      setLoading(null);
    }
  };

  const handleMoncashUpgrade = async () => {
    if (!selectedPlanForMoncash) return;
    setLoading(selectedPlanForMoncash.id);
    try {
      const res = await api.post("/api/billing/create-moncash-session", {
        planId: selectedPlanForMoncash.id,
      });
      if (res.data.url) {
        window.location.href = res.data.url;
      }
    } catch (err) {
      console.error("Erreur MonCash:", err);
      alert("Erreur lors de la création de la session MonCash.");
    } finally {
      setLoading(null);
      setShowMoncashModal(false);
    }
  };

  const openMoncashModal = (plan: any) => {
    setSelectedPlanForMoncash(plan);
    setShowMoncashModal(true);
  };

  const icons: Record<string, any> = { Sparkles, Zap, Shield, Rocket };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="animate-spin text-accent" size={48} />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 animate-[fadeIn_0.5s_ease-out] relative">

      {/* Payment success banner */}
      {paymentStatus === "success" && (
        <div className="mb-8 p-6 rounded-2xl border border-win/30 bg-win/10 flex flex-col sm:flex-row items-center gap-4">
          <CheckCircle size={32} className="text-win shrink-0" />
          <div className="flex-1 text-center sm:text-left">
            <p className="font-black text-win text-lg">Paiement reçu !</p>
            <p className="text-txt-2 text-sm mt-1">
              {user?.plan === "pro"
                ? "Votre compte est déjà actif. Redirection vers le dashboard..."
                : "Votre paiement est en cours de traitement. Votre compte sera déverrouillé dans quelques instants..."}
            </p>
          </div>
          {user?.plan === "pro" ? (
            <button
              onClick={() => navigate("/app/dashboard")}
              className="px-5 py-2.5 bg-win text-white rounded-xl font-bold text-sm flex items-center gap-2 hover:bg-win/80 transition-all"
            >
              Accéder au Dashboard <ArrowRight size={16} />
            </button>
          ) : (
            <Loader2 size={20} className="animate-spin text-win shrink-0" />
          )}
        </div>
      )}

      {/* Payment canceled banner */}
      {paymentStatus === "canceled" && (
        <div className="mb-8 p-5 rounded-2xl border border-loss/30 bg-loss/10 flex items-center gap-4">
          <XCircle size={28} className="text-loss shrink-0" />
          <p className="text-txt-2 text-sm">
            <span className="font-bold text-loss">Paiement annulé.</span>{" "}
            Vous pouvez réessayer ci-dessous.
          </p>
        </div>
      )}

      <div className="flex justify-start mb-6">
        <Link
          to="/app/dashboard"
          className="flex items-center gap-2 px-3 py-1.5 rounded-md text-[11px] font-semibold bg-surface hover:bg-elevated border border-border text-txt-2 hover:text-txt transition-all shadow-sm"
        >
          <ArrowLeft size={12} />
          Retour au Dashboard
        </Link>
      </div>

      <div className="text-center mb-16">
        <h1 className="text-3xl font-black mb-4">Plans Transparents</h1>
        <p className="text-txt-2 text-[11px] max-w-2xl mx-auto font-semibold text-accent">
          Investissez dans votre discipline, pas dans des fioritures.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
        {plans.map((plan) => {
          const Icon = icons[plan.icon] || Zap;
          const isCurrent = user?.plan === plan.id;
          const isFree = plan.id === "free";
          const buttonText = isCurrent
            ? "Votre Plan Actuel"
            : isFree
              ? "Plan Gratuit"
              : `Payer par carte (USD)`;

          return (
            <div
              key={plan.id}
              className={`glass p-8 rounded-[2rem] border transition-all relative flex flex-col ${
                plan.recommended
                  ? "border-accent shadow-[0_20px_50px_rgba(243,108,0,0.15)] scale-105 z-10"
                  : "border-border hover:border-accent/30"
              }`}
            >
              {plan.recommended && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-accent text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg">
                  Recommandé
                </div>
              )}

              <div className="mb-8">
                <div className="flex items-center gap-3 mb-4">
                  <Icon size={24} className={`text-${plan.color}`} />
                  <h3 className="text-xl font-black">{plan.name}</h3>
                </div>
                <div className="flex flex-col mb-4">
                  {plan.originalPrice && (
                    <div className="text-sm font-bold text-txt-3 line-through mb-1">
                      ${plan.originalPrice}
                    </div>
                  )}
                  <div className="flex items-baseline gap-1">
                    <span className="text-4xl font-black">${plan.price}</span>
                    <span className="text-txt-3 text-sm font-bold">/ mois</span>
                  </div>
                  {!isFree && settings?.USD_TO_HTG_RATE && plan.price && (
                    <div className="text-xs font-bold text-[#FF0000] mt-1">
                      ≈ {Math.ceil(Number(plan.price) * Number(settings.USD_TO_HTG_RATE))} HTG / mois
                    </div>
                  )}
                </div>
                <p className="text-xs text-txt-2 mt-4 leading-relaxed">
                  {plan.description}
                </p>
              </div>

              <div className="space-y-4 mb-10 flex-1">
                {(Array.isArray(plan.features) ? plan.features : []).map(
                  (feature: string, i: number) => (
                    <div key={i} className="flex items-start gap-3">
                      <div
                        className={`mt-1 shrink-0 w-4 h-4 rounded-full flex items-center justify-center ${isFree ? "bg-border text-txt-3" : "bg-win/10 text-win"}`}
                      >
                        <Check size={10} strokeWidth={4} />
                      </div>
                      <span className="text-xs text-txt-2 font-medium">
                        {feature}
                      </span>
                    </div>
                  ),
                )}
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={() => !isFree && handleUpgrade(plan.id as any)}
                  disabled={isFree || isCurrent || loading !== null}
                  className={`w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all ${
                    isCurrent
                      ? "bg-elevated text-txt-3 cursor-default"
                      : plan.recommended
                        ? "bg-accent text-white shadow-xl hover:scale-105 hover:shadow-accent/20"
                        : "bg-surface border border-border hover:border-accent/50"
                  } disabled:opacity-50`}
                >
                  {loading === plan.id ? "Redirection..." : buttonText}
                  {!isCurrent && !isFree && <ArrowRight size={18} />}
                </button>

                {!isFree && !isCurrent && (
                  <button
                    onClick={() => openMoncashModal(plan)}
                    disabled={loading !== null}
                    className="w-full py-3 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all bg-[#FF0000]/10 text-[#FF0000] border border-[#FF0000]/20 hover:bg-[#FF0000]/20 disabled:opacity-50"
                  >
                    Payer par MonCash (HTG)
                    <ArrowRight size={18} />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-16 glass p-8 rounded-3xl border border-border flex flex-col md:flex-row items-center gap-8">
        <div className="w-16 h-16 rounded-2xl bg-win/10 text-win flex items-center justify-center shrink-0">
          <Shield size={32} />
        </div>
        <div className="flex-1 text-center md:text-left">
          <h4 className="font-bold text-lg mb-1">
            Paiement 100% sécurisé via Stripe
          </h4>
          <p className="text-xs text-txt-2 leading-relaxed">
            Vos informations de paiement sont traitées par Stripe. Vous pouvez
            annuler votre abonnement à tout moment d'un simple clic depuis vos
            paramètres. Aucune donnée bancaire n'est stockée sur nos serveurs.
          </p>
        </div>
        <div className="flex gap-4 grayscale opacity-50">
          {/* Icons simplified */}
          <div className="w-12 h-8 bg-elevated rounded border border-border" />
          <div className="w-12 h-8 bg-elevated rounded border border-border" />
          <div className="w-12 h-8 bg-elevated rounded border border-border" />
        </div>
      </div>

      {showMoncashModal && selectedPlanForMoncash && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
          <div className="bg-surface border border-border p-8 rounded-3xl w-full max-w-md shadow-2xl animate-[slideUp_0.3s_ease-out]">
            <h3 className="text-xl font-black mb-4">Paiement MonCash</h3>
            <p className="text-txt-2 text-sm mb-6 leading-relaxed">
              Vous êtes sur le point de payer votre abonnement <strong>{selectedPlanForMoncash.name}</strong> avec MonCash.
            </p>
            
            <div className="bg-elevated p-4 rounded-2xl mb-6">
              <div className="flex justify-between text-sm mb-2 text-txt-2">
                <span>Prix de base (USD)</span>
                <span>${selectedPlanForMoncash.price}</span>
              </div>
              <div className="flex justify-between text-sm mb-4 text-txt-2">
                <span>Taux du jour</span>
                <span>1 USD = {settings?.USD_TO_HTG_RATE || "Non défini"} HTG</span>
              </div>
              <div className="border-t border-border pt-4 flex justify-between font-black text-lg">
                <span>Total à payer</span>
                <span className="text-[#FF0000]">
                  {settings?.USD_TO_HTG_RATE ? Math.ceil(Number(selectedPlanForMoncash.price) * Number(settings.USD_TO_HTG_RATE)) : "---"} HTG
                </span>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => setShowMoncashModal(false)}
                className="flex-1 py-3 bg-elevated hover:bg-border rounded-xl font-bold transition-all text-sm"
                disabled={loading !== null}
              >
                Annuler
              </button>
              <button
                onClick={handleMoncashUpgrade}
                disabled={loading !== null}
                className="flex-1 py-3 bg-[#FF0000] text-white hover:bg-[#CC0000] rounded-xl font-bold transition-all text-sm flex justify-center items-center gap-2"
              >
                {loading === selectedPlanForMoncash.id ? <Loader2 size={16} className="animate-spin" /> : "Confirmer"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
