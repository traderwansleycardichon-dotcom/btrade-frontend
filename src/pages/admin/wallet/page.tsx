import React, { useEffect, useState, useCallback } from "react";
import {
  Wallet, RefreshCw, AlertTriangle, CheckCircle, Clock,
  Globe, CreditCard, TrendingUp, DollarSign, ArrowDownToLine,
} from "lucide-react";
import api from "../../../lib/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface BazikBalance {
  available: number;
  reserved: number;
  currency: string;
  environment: "sandbox" | "production";
  last_updated: string;
}

interface StripeBalanceEntry { amount: number; currency: string; }
interface StripeBalance { available: StripeBalanceEntry[]; pending: StripeBalanceEntry[]; }

interface StripePayout {
  id: string; amount: number; currency: string;
  status: string; arrival_date: string; created: string; description: string | null;
}

interface StripeRevenue {
  totalRevenue: number; last30Days: number; currency: string;
  monthly: { month: string; amount: number }[];
}

// ─── Hook helpers ─────────────────────────────────────────────────────────────

function useRemoteData<T>(url: string) {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetch = useCallback(async (isRefresh = false) => {
    if (isRefresh) setRefreshing(true); else setLoading(true);
    setError(null);
    try {
      const res = await api.get(url);
      if (res.data.success) setData(res.data.data);
    } catch (e: any) { setError(e?.response?.data?.error || "Erreur réseau"); }
    finally { setLoading(false); setRefreshing(false); }
  }, [url]);

  useEffect(() => { fetch(); }, [fetch]);
  return { data, loading, error, refresh: () => fetch(true), refreshing };
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const StatusBadge = ({ status }: { status: string }) => {
  const map: Record<string, string> = {
    paid: "text-win bg-win/10 border-win/20",
    in_transit: "text-accent bg-accent/10 border-accent/20",
    pending: "text-accent bg-accent/10 border-accent/20",
    failed: "text-loss bg-loss/10 border-loss/20",
  };
  return (
    <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${map[status] ?? "text-txt-2 bg-elevated border-border"}`}>
      {status}
    </span>
  );
};

const SectionHeader = ({
  icon: Icon, title, color, onRefresh, refreshing,
}: { icon: any; title: string; color: string; onRefresh: () => void; refreshing: boolean }) => (
  <div className="flex items-center justify-between mb-6">
    <div className="flex items-center gap-3">
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
        <Icon size={18} />
      </div>
      <h2 className="text-lg font-black">{title}</h2>
    </div>
    <button
      onClick={onRefresh}
      disabled={refreshing}
      className="flex items-center gap-2 px-3 py-1.5 bg-elevated border border-border rounded-xl text-xs font-bold hover:bg-border transition-all disabled:opacity-50"
    >
      <RefreshCw size={12} className={refreshing ? "animate-spin" : ""} />
      Actualiser
    </button>
  </div>
);

const ErrorCard = ({ message }: { message: string }) => (
  <div className="glass p-6 rounded-3xl border border-loss/30 bg-loss/5 flex items-center gap-4">
    <AlertTriangle size={22} className="text-loss shrink-0" />
    <p className="text-loss text-sm font-semibold">{message}</p>
  </div>
);

const SkeletonCard = () => (
  <div className="glass p-6 rounded-3xl border border-border animate-pulse">
    <div className="h-3 w-32 bg-border rounded mb-6" />
    <div className="h-10 w-48 bg-border rounded mb-3" />
    <div className="h-3 w-28 bg-border rounded" />
  </div>
);

// ─── Bazik Section ────────────────────────────────────────────────────────────

function BazikSection() {
  const { data, loading, error, refresh, refreshing } = useRemoteData<BazikBalance>("/api/admin/billing/wallet");

  const fmt = (n: number) => new Intl.NumberFormat("fr-HT", { minimumFractionDigits: 2 }).format(n);
  const fmtDate = (s: string) => new Date(s).toLocaleString("fr-FR", { day: "2-digit", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });

  return (
    <section>
      <SectionHeader icon={Wallet} title="Wallet MonCash (Bazik)" color="bg-[#FF0000]/10 text-[#FF0000]" onRefresh={refresh} refreshing={refreshing} />
      {loading ? <div className="grid grid-cols-1 md:grid-cols-2 gap-6"><SkeletonCard /><SkeletonCard /></div>
        : error ? <ErrorCard message={error} />
        : data ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
              <div className="glass p-6 rounded-3xl border border-win/20 bg-win/5">
                <div className="flex items-center gap-2 mb-4"><CheckCircle size={14} className="text-win" /><span className="text-txt-3 text-[10px] font-bold uppercase tracking-wider">Disponible</span></div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black text-win">{fmt(data.available)}</span>
                  <span className="text-txt-3 font-bold">{data.currency}</span>
                </div>
              </div>
              <div className="glass p-6 rounded-3xl border border-border">
                <div className="flex items-center gap-2 mb-4"><Clock size={14} className="text-txt-2" /><span className="text-txt-3 text-[10px] font-bold uppercase tracking-wider">Réservé</span></div>
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-black">{fmt(data.reserved)}</span>
                  <span className="text-txt-3 font-bold">{data.currency}</span>
                </div>
              </div>
            </div>
            <div className="flex items-center gap-4 text-[11px] text-txt-3">
              {data.environment === "sandbox" && <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent border border-accent/20 font-black uppercase tracking-wider">Sandbox</span>}
              <Globe size={12} />
              <span>Mis à jour le {fmtDate(data.last_updated)}</span>
            </div>
          </>
        ) : null}
    </section>
  );
}

// ─── Stripe Section ───────────────────────────────────────────────────────────

function StripeSection() {
  const balance  = useRemoteData<StripeBalance>("/api/admin/billing/stripe/balance");
  const payouts  = useRemoteData<StripePayout[]>("/api/admin/billing/stripe/payouts");
  const revenue  = useRemoteData<StripeRevenue>("/api/admin/billing/stripe/revenue");

  const refreshAll = () => { balance.refresh(); payouts.refresh(); revenue.refresh(); };
  const refreshing = balance.refreshing || payouts.refreshing || revenue.refreshing;

  const fmt = (n: number, cur = "usd") =>
    new Intl.NumberFormat("en-US", { style: "currency", currency: cur.toUpperCase() }).format(n);

  const maxMonthly = Math.max(...(revenue.data?.monthly.map(m => m.amount) ?? [1]));

  return (
    <section>
      <SectionHeader icon={CreditCard} title="Wallet Stripe" color="bg-[#635BFF]/10 text-[#635BFF]" onRefresh={refreshAll} refreshing={refreshing} />

      {/* Balance */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        {balance.loading ? <><SkeletonCard /><SkeletonCard /></>
          : balance.error ? <ErrorCard message={balance.error} />
          : balance.data ? (
            <>
              <div className="glass p-6 rounded-3xl border border-win/20 bg-win/5">
                <div className="flex items-center gap-2 mb-4"><CheckCircle size={14} className="text-win" /><span className="text-txt-3 text-[10px] font-bold uppercase tracking-wider">Disponible</span></div>
                {balance.data.available.map(b => (
                  <div key={b.currency} className="flex items-baseline gap-2">
                    <span className="text-4xl font-black text-win">{fmt(b.amount, b.currency)}</span>
                  </div>
                ))}
              </div>
              <div className="glass p-6 rounded-3xl border border-border">
                <div className="flex items-center gap-2 mb-4"><Clock size={14} className="text-txt-2" /><span className="text-txt-3 text-[10px] font-bold uppercase tracking-wider">En attente</span></div>
                {balance.data.pending.map(b => (
                  <div key={b.currency} className="flex items-baseline gap-2">
                    <span className="text-4xl font-black">{fmt(b.amount, b.currency)}</span>
                  </div>
                ))}
              </div>
            </>
          ) : null}
      </div>

      {/* Revenue */}
      {revenue.loading ? <SkeletonCard />
        : revenue.error ? <ErrorCard message={revenue.error} />
        : revenue.data ? (
          <div className="glass p-6 rounded-3xl border border-border mb-6">
            <div className="flex items-center gap-2 mb-6"><TrendingUp size={16} className="text-accent" /><span className="font-black">Revenus</span></div>
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div>
                <p className="text-txt-3 text-[10px] font-bold uppercase tracking-wider mb-1">Total (100 derniers)</p>
                <p className="text-2xl font-black text-win">{fmt(revenue.data.totalRevenue)}</p>
              </div>
              <div>
                <p className="text-txt-3 text-[10px] font-bold uppercase tracking-wider mb-1">30 derniers jours</p>
                <p className="text-2xl font-black">{fmt(revenue.data.last30Days)}</p>
              </div>
            </div>
            {/* Monthly bar chart */}
            <p className="text-txt-3 text-[10px] font-bold uppercase tracking-wider mb-3">6 derniers mois</p>
            <div className="flex items-end gap-2 h-20">
              {revenue.data.monthly.map(m => {
                const pct = maxMonthly > 0 ? (m.amount / maxMonthly) * 100 : 0;
                return (
                  <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="w-full rounded-t-md bg-accent/20 hover:bg-accent/40 transition-all relative group" style={{ height: `${Math.max(pct, 4)}%` }}>
                      <div className="absolute -top-6 left-1/2 -translate-x-1/2 bg-surface border border-border rounded px-1.5 py-0.5 text-[9px] font-bold whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                        {fmt(m.amount)}
                      </div>
                    </div>
                    <span className="text-[8px] text-txt-3 font-medium">{m.month.slice(5)}</span>
                  </div>
                );
              })}
            </div>
          </div>
        ) : null}

      {/* Payouts table */}
      <div className="glass rounded-3xl border border-border overflow-hidden">
        <div className="flex items-center gap-2 p-5 border-b border-border">
          <ArrowDownToLine size={16} className="text-txt-2" />
          <span className="font-black text-sm">Historique des virements</span>
        </div>
        {payouts.loading ? (
          <div className="p-6 space-y-3">{[0,1,2].map(i => <div key={i} className="h-8 bg-elevated rounded-xl animate-pulse" />)}</div>
        ) : payouts.error ? <div className="p-6"><ErrorCard message={payouts.error} /></div>
        : payouts.data?.length === 0 ? (
          <div className="p-8 text-center text-txt-3 text-sm">Aucun virement trouvé.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[10px] text-txt-3 uppercase bg-elevated border-b border-border">
                <tr>
                  <th className="px-5 py-3 font-bold text-left">Montant</th>
                  <th className="px-5 py-3 font-bold text-left">Statut</th>
                  <th className="px-5 py-3 font-bold text-left">Créé le</th>
                  <th className="px-5 py-3 font-bold text-left">Arrivée</th>
                  <th className="px-5 py-3 font-bold text-left">Description</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {payouts.data?.map(p => (
                  <tr key={p.id} className="hover:bg-elevated/50 transition-colors">
                    <td className="px-5 py-3 font-black">{fmt(p.amount, p.currency)}</td>
                    <td className="px-5 py-3"><StatusBadge status={p.status} /></td>
                    <td className="px-5 py-3 text-txt-2">{p.created}</td>
                    <td className="px-5 py-3 text-txt-2">{p.arrival_date}</td>
                    <td className="px-5 py-3 text-txt-3 text-xs truncate max-w-[180px]">{p.description ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </section>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function AdminWalletPage() {
  return (
    <div className="space-y-12 animate-[fadeIn_0.5s_ease-out]">
      <div>
        <h1 className="text-2xl font-black mb-1">Wallet</h1>
        <p className="text-txt-2 text-sm">Soldes en temps réel — MonCash via Bazik et Stripe.</p>
      </div>
      <BazikSection />
      <div className="border-t border-border" />
      <StripeSection />
    </div>
  );
}
