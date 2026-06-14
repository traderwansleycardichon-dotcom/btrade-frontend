import React, { useEffect, useState, useCallback } from "react";
import { Wallet, RefreshCw, AlertTriangle } from "lucide-react";
import api from "../../lib/api";

interface WalletBalance {
  available: number;
  reserved: number;
  currency: string;
  environment: "sandbox" | "production";
  last_updated: string;
}

export const BazikWalletCard: React.FC = () => {
  const [balance, setBalance] = useState<WalletBalance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true);
    else setLoading(true);
    setError(null);
    try {
      const { data } = await api.get("/api/admin/billing/wallet");
      if (data.success) setBalance(data.data);
    } catch (err: any) {
      setError(err?.response?.data?.error || "Impossible de récupérer le solde.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  const fmt = (n: number) =>
    new Intl.NumberFormat("fr-HT", { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(n);

  const lastUpdated = balance?.last_updated
    ? new Date(balance.last_updated).toLocaleString("fr-FR", {
        day: "2-digit", month: "2-digit", year: "numeric",
        hour: "2-digit", minute: "2-digit",
      })
    : null;

  if (loading) {
    return (
      <div className="glass p-6 rounded-3xl border border-border animate-pulse">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-border" />
          <div className="h-4 w-32 bg-border rounded" />
        </div>
        <div className="h-10 w-48 bg-border rounded mb-3" />
        <div className="h-3 w-36 bg-border rounded" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass p-6 rounded-3xl border border-loss/30 bg-loss/5">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-10 h-10 rounded-xl bg-loss/10 text-loss flex items-center justify-center">
            <AlertTriangle size={18} />
          </div>
          <span className="font-bold text-sm">Wallet MonCash</span>
        </div>
        <p className="text-loss text-xs font-semibold mb-4">{error}</p>
        <button
          onClick={() => fetchBalance(true)}
          className="text-xs font-bold text-txt-2 hover:text-txt flex items-center gap-1.5 transition-colors"
        >
          <RefreshCw size={12} /> Réessayer
        </button>
      </div>
    );
  }

  return (
    <div className="glass p-6 rounded-3xl border border-border">
      {/* Header */}
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#FF0000]/10 text-[#FF0000] flex items-center justify-center">
            <Wallet size={18} />
          </div>
          <div>
            <p className="font-black text-sm">Wallet MonCash</p>
            <p className="text-txt-3 text-[10px] font-semibold uppercase tracking-wider">
              via Bazik
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {balance?.environment === "sandbox" && (
            <span className="text-[9px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20">
              Sandbox
            </span>
          )}
          <button
            onClick={() => fetchBalance(true)}
            disabled={refreshing}
            className="p-1.5 rounded-lg hover:bg-elevated transition-colors text-txt-3 hover:text-txt disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw size={13} className={refreshing ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Available balance — main figure */}
      <div className="mb-4">
        <p className="text-txt-3 text-[10px] font-bold uppercase tracking-wider mb-1">
          Solde disponible
        </p>
        <div className="flex items-baseline gap-2">
          <span className="text-3xl font-black text-win">{fmt(balance?.available ?? 0)}</span>
          <span className="text-sm font-bold text-txt-3">{balance?.currency ?? "HTG"}</span>
        </div>
      </div>

      {/* Reserved */}
      <div className="flex items-center justify-between py-3 border-t border-border">
        <span className="text-txt-2 text-xs font-semibold">Réservé</span>
        <span className="text-xs font-black">
          {fmt(balance?.reserved ?? 0)}{" "}
          <span className="text-txt-3 font-semibold">{balance?.currency ?? "HTG"}</span>
        </span>
      </div>

      {/* Last updated */}
      {lastUpdated && (
        <p className="text-txt-3 text-[10px] font-medium mt-2">
          Mis à jour le {lastUpdated}
        </p>
      )}
    </div>
  );
};
