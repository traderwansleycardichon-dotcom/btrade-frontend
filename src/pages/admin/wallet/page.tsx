import React, { useEffect, useState, useCallback } from "react";
import {
  Wallet,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Globe,
} from "lucide-react";
import api from "../../../lib/api";

interface WalletBalance {
  available: number;
  reserved: number;
  currency: string;
  environment: "sandbox" | "production";
  last_updated: string;
}

export default function AdminWalletPage() {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetched, setLastFetched] = useState<Date | null>(null);

  const fetchBalance = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/api/admin/billing/wallet");
      if (data.success) {
        setBalance(data.data);
        setLastFetched(new Date());
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Impossible de récupérer le solde Bazik.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-HT", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(n);

  const fmtDate = (d: string) =>
    new Date(d).toLocaleString("fr-FR", {
      day: "2-digit",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black mb-1">Wallet MonCash</h1>
          <p className="text-txt-2 text-sm">Solde de votre compte Bazik en temps réel</p>
        </div>
        <button
          onClick={() => fetchBalance(true)}
          disabled={refreshing || loading}
          className="flex items-center gap-2 px-4 py-2 bg-elevated border border-border rounded-xl text-sm font-bold hover:bg-border transition-all disabled:opacity-50"
        >
          <RefreshCw size={14} className={refreshing ? "animate-spin" : ""} />
          Actualiser
        </button>
      </div>

      {/* Error state */}
      {error && (
        <div className="glass p-6 rounded-3xl border border-loss/30 bg-loss/5 flex items-start gap-4">
          <AlertTriangle size={24} className="text-loss shrink-0 mt-0.5" />
          <div>
            <p className="font-bold text-loss mb-1">Erreur de connexion Bazik</p>
            <p className="text-txt-2 text-sm">{error}</p>
          </div>
        </div>
      )}

      {/* Main balance cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[0, 1].map((i) => (
            <div key={i} className="glass p-8 rounded-3xl border border-border animate-pulse">
              <div className="h-3 w-32 bg-border rounded mb-6" />
              <div className="h-12 w-48 bg-border rounded mb-2" />
              <div className="h-3 w-20 bg-border rounded" />
            </div>
          ))}
        </div>
      ) : balance ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Available */}
          <div className="glass p-8 rounded-3xl border border-win/20 bg-win/5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-win/5 rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-2 mb-6">
              <CheckCircle size={16} className="text-win" />
              <span className="text-txt-2 text-xs font-bold uppercase tracking-wider">Solde Disponible</span>
            </div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-5xl font-black text-win">{fmt(balance.available)}</span>
              <span className="text-xl font-bold text-txt-3">{balance.currency}</span>
            </div>
            <p className="text-txt-3 text-xs font-medium mt-3">Montant utilisable pour les paiements sortants</p>
          </div>

          {/* Reserved */}
          <div className="glass p-8 rounded-3xl border border-border relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-elevated rounded-full -translate-y-1/2 translate-x-1/2" />
            <div className="flex items-center gap-2 mb-6">
              <Clock size={16} className="text-txt-2" />
              <span className="text-txt-2 text-xs font-bold uppercase tracking-wider">Solde Réservé</span>
            </div>
            <div className="flex items-baseline gap-3 mb-1">
              <span className="text-5xl font-black">{fmt(balance.reserved)}</span>
              <span className="text-xl font-bold text-txt-3">{balance.currency}</span>
            </div>
            <p className="text-txt-3 text-xs font-medium mt-3">Montant en attente de confirmation</p>
          </div>
        </div>
      ) : null}

      {/* Info panel */}
      {balance && (
        <div className="glass p-6 rounded-3xl border border-border">
          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-border">
            {/* Total */}
            <div className="py-4 sm:py-0 sm:px-6 first:pl-0 last:pr-0">
              <p className="text-txt-3 text-[10px] font-bold uppercase tracking-wider mb-2">Total (Disponible + Réservé)</p>
              <p className="text-lg font-black">
                {fmt(balance.available + balance.reserved)}{" "}
                <span className="text-txt-3 font-semibold text-sm">{balance.currency}</span>
              </p>
            </div>

            {/* Environment */}
            <div className="py-4 sm:py-0 sm:px-6">
              <p className="text-txt-3 text-[10px] font-bold uppercase tracking-wider mb-2">Environnement</p>
              <div className="flex items-center gap-2">
                <Globe size={14} className={balance.environment === "production" ? "text-win" : "text-accent"} />
                <span className={`text-sm font-black capitalize ${balance.environment === "production" ? "text-win" : "text-accent"}`}>
                  {balance.environment === "production" ? "Production" : "Sandbox"}
                </span>
              </div>
            </div>

            {/* Last updated */}
            <div className="py-4 sm:py-0 sm:px-6">
              <p className="text-txt-3 text-[10px] font-bold uppercase tracking-wider mb-2">Dernière mise à jour (Bazik)</p>
              <p className="text-sm font-bold">{fmtDate(balance.last_updated)}</p>
              {lastFetched && (
                <p className="text-txt-3 text-[10px] mt-0.5">
                  Actualisé à {lastFetched.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
