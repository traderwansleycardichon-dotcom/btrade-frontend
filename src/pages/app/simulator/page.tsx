import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import api from "../../../lib/api";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { OrderPanel } from "../../../components/simulator/OrderPanel";
import { PositionsTable } from "../../../components/simulator/PositionsTable";
import { BrainCircuit } from "lucide-react";
import { ChallengeSelector } from "../../../components/simulator/ChallengeSelector";
import { PropFirmDashboard } from "../../../components/simulator/PropFirmDashboard";
import { useNavigate } from "react-router-dom";
import { Trophy, History, PlayCircle } from "lucide-react";
import {
  ChallengePassedModal,
  ChallengeFailedModal,
  ChallengeExpiredModal,
} from "../../../components/simulator/ChallengeModals";

import { TraderProfileStats } from "../../../components/simulator/TraderProfileStats";
import { SimulatorPerformanceStats } from "../../../components/simulator/SimulatorPerformanceStats";
import { MacroEventsPanel } from "../../../components/simulator/MacroEventsPanel";
import {
  useSimulatorStatus,
  useSimulatorTrades,
  useSimulatorStats,
  useSimulatorCooldown,
  useSimulatorRefresh,
} from "../../../hooks/useSimulator";

export default function SimulatorPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const refreshSimulator = useSimulatorRefresh();

  // ── React Query (remplace les 4 setInterval manuels) ──────────────────
  const { data: statusData, isLoading } = useSimulatorStatus();
  const { data: trades = [] } = useSimulatorTrades();
  const { data: stats } = useSimulatorStats();
  const { data: cooldown } = useSimulatorCooldown();

  const account  = statusData?.account  ?? null;
  const todayPnl = statusData?.todayPnl ?? 0;

  // ── UI state local ─────────────────────────────────────────────────────
  const [floatingPnl, setFloatingPnl] = useState(0);
  const [showPassedModal, setShowPassedModal]   = useState(false);
  const [showFailedModal, setShowFailedModal]   = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showSelectorForced, setShowSelectorForced] = useState(false);
  const [assetSymbol, setAssetSymbol] = useState("BTCUSDT");



  // ── Triggers modals quand le statut du challenge change ────────────────
  useEffect(() => {
    if (!account) return;
    if (account.status === "passed" && !sessionStorage.getItem(`modal_passed_${account.id}`)) {
      setShowPassedModal(true);
      sessionStorage.setItem(`modal_passed_${account.id}`, "true");
    } else if (account.status?.startsWith("failed") && !sessionStorage.getItem(`modal_failed_${account.id}`)) {
      setShowFailedModal(true);
      sessionStorage.setItem(`modal_failed_${account.id}`, "true");
    } else if (account.status === "expired" && !sessionStorage.getItem(`modal_expired_${account.id}`)) {
      setShowExpiredModal(true);
      sessionStorage.setItem(`modal_expired_${account.id}`, "true");
    }
  }, [account?.id, account?.status]);

  // ── Floating P&L (poll prix des positions ouvertes) ────────────────────
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const fetchOpenTradePrices = async () => {
      const openTrades = (trades as any[]).filter((t: any) => t.status === "open");
      if (openTrades.length === 0) { setFloatingPnl(0); return; }
      const uniqueAssets = [...new Set(openTrades.map((t: any) => t.asset as string))];
      let totalFloating = 0;
      try {
        const prices = await Promise.all(
          uniqueAssets.map((asset) =>
            api.get(`/api/simulator/market/price?symbol=${asset}`).then((r) => ({ asset, price: r.data.price as number }))
          )
        );
        const priceMap: Record<string, number> = prices.reduce(
          (acc: Record<string, number>, c) => ({ ...acc, [c.asset]: c.price }), {}
        );
        openTrades.forEach((trade: any) => {
          const cp = priceMap[trade.asset];
          if (cp) {
            const ep = parseFloat(trade.entryPrice);
            const qty = parseFloat(trade.quantity);
            totalFloating += trade.direction === "long" ? (cp - ep) * qty : (ep - cp) * qty;
          }
        });
        setFloatingPnl(totalFloating);
      } catch {}
    };
    fetchOpenTradePrices();
    interval = setInterval(fetchOpenTradePrices, 1500);
    return () => clearInterval(interval);
  }, [trades]);

  const getCooldownLeft = () => {
    if (!cooldown) return undefined;
    const diff = new Date(cooldown.availableRestartTime).getTime() - Date.now();
    if (diff <= 0) return undefined;
    const h = Math.floor((diff % 86400000) / 3600000);
    const m = Math.floor((diff % 3600000) / 60000);
    return `${h}h ${m}m`;
  };

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Vérification PRO
  if (
    !user ||
    (user.plan !== "pro" &&
      (user.plan as string) !== "lifetime" &&
      user.role !== "admin" &&
      user.role !== "superadmin")
  ) {
    return (
      <div className="p-8 max-w-4xl mx-auto text-center mt-20">
        <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-6">
          <BrainCircuit className="w-12 h-12 text-primary" />
        </div>
        <h1 className="text-3xl font-bold text-text mb-4">Paper Trading Simulator</h1>
        <p className="text-text-muted text-lg mb-8">
          Le simulateur de trading est réservé aux membres PRO. Passez à la
          vitesse supérieure et entraînez-vous en conditions réelles sans risquer votre capital !
        </p>
        <button
          onClick={() => (window.location.href = "/app/upgrade")}
          className="bg-primary hover:bg-primary/90 text-txt px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-primary/20"
        >
          Débloquer avec le Plan PRO
        </button>
      </div>
    );
  }

  // Si pas de challenge on affiche le sélecteur
  if (!account?.challengeLevel) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-y-auto">
        <ChallengeSelector onChallengeStarted={refreshSimulator} />
      </div>
    );
  }

  if (showSelectorForced) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-y-auto">
        <button
          onClick={() => setShowSelectorForced(false)}
          className="m-6 text-gray-400 hover:text-txt transition-colors"
        >
          ← Retour au Dashboard
        </button>
        <ChallengeSelector
          onChallengeStarted={() => {
            setShowSelectorForced(false);
            refreshSimulator();
          }}
        />
      </div>
    );
  }

  const displayAccount = account
    ? {
        ...account,
        currentBalance: parseFloat(account.currentBalance || 0) + floatingPnl,
        currentDrawdown: Math.max(
          0,
          parseFloat(account.currentDrawdown || 0) - floatingPnl,
        ),
      }
    : null;
  const displayTodayPnl = todayPnl + floatingPnl;



  return (
    <div className="p-4 md:p-2 w-full h-[calc(100vh-4rem)] flex flex-col gap-4 overflow-y-auto hide-scrollbar">
      <ChallengePassedModal
        isOpen={showPassedModal}
        onClose={() => setShowPassedModal(false)}
        onAction={() => setShowSelectorForced(true)}
      />
      <ChallengeFailedModal
        isOpen={showFailedModal}
        onClose={() => setShowFailedModal(false)}
        onAction={() => setShowSelectorForced(true)}
        reason={account.failureReason}
        cooldownLeft={getCooldownLeft()}
      />
      <ChallengeExpiredModal
        isOpen={showExpiredModal}
        onClose={() => setShowExpiredModal(false)}
        onAction={() => setShowSelectorForced(true)}
      />

      <div className="flex flex-wrap justify-between items-center gap-2">
        <h1 className="text-2xl font-bold text-txt">Dashboard Simulateur</h1>
        <div className="flex items-center gap-2 flex-wrap">
          {account.status !== "active" && (
            <button
              onClick={() => setShowSelectorForced(true)}
              className="bg-accent hover:bg-accent-2 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Nouveau Challenge
            </button>
          )}
          <button
            onClick={() => navigate("/app/simulator/leaderboard")}
            className="flex items-center gap-2 bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20 px-4 py-2 rounded-lg font-medium transition-colors border border-yellow-500/20"
          >
            <Trophy className="w-4 h-4" />
            Classement
          </button>

        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 flex flex-col gap-6">
          <PropFirmDashboard
            account={displayAccount}
            todayPnl={displayTodayPnl}
            trades={trades}
          />
        </div>
        <div className="lg:col-span-1">
          <TraderProfileStats stats={stats} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-[600px]">
        <div className="lg:col-span-3 bg-surface rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
          <div className="p-3 border-b border-border flex items-center gap-4">
            <span className="text-sm font-medium text-text-muted">
              Actif (Symbole TradingView):
            </span>
            <input
              type="text"
              list="futures-symbols"
              value={assetSymbol}
              onChange={(e) => {
                let val = e.target.value.toUpperCase();
                // Auto-conversion des symboles Futures vers les CFD OANDA
                const aliases: Record<string, string> = {
                  NQ: "OANDA:NAS100USD",
                  "NQ1!": "OANDA:NAS100USD",
                  ES: "OANDA:SPX500USD",
                  "ES1!": "OANDA:SPX500USD",
                  YM: "OANDA:US30USD",
                  "YM1!": "OANDA:US30USD",
                  RTY: "OANDA:US2000USD",
                  "RTY1!": "OANDA:US2000USD",
                  GC: "OANDA:XAUUSD",
                  "GC1!": "OANDA:XAUUSD",
                  CL: "OANDA:WTICOUSD",
                  "CL1!": "OANDA:WTICOUSD",
                  SI: "OANDA:XAGUSD",
                  "SI1!": "OANDA:XAGUSD",
                  FDAX: "OANDA:DE30EUR",
                  "FDAX1!": "OANDA:DE30EUR",
                };
                if (aliases[val]) {
                  val = aliases[val];
                }
                setAssetSymbol(val);
              }}
              className="bg-[#1e293b] border border-border rounded px-3 py-1 text-txt text-sm focus:outline-none focus:border-primary uppercase w-64"
              placeholder="Chercher un indice ou taper..."
            />
            <datalist id="futures-symbols">
              {/* Indices (CFD gratuits) */}
              <option value="OANDA:NAS100USD">Nasdaq 100</option>
              <option value="OANDA:SPX500USD">S&P 500</option>
              <option value="OANDA:US30USD">Dow Jones</option>
              <option value="OANDA:US2000USD">Russell 2000</option>
              <option value="OANDA:DE30EUR">DAX (Allemagne)</option>
              <option value="OANDA:UK100GBP">FTSE 100 (UK)</option>

              {/* Matières Premières (CFD gratuits) */}
              <option value="OANDA:WTICOUSD">Crude Oil (Pétrole WTI)</option>
              <option value="OANDA:XAUUSD">Gold (Or)</option>
              <option value="OANDA:XAGUSD">Silver (Argent)</option>
              <option value="OANDA:XCUUSD">Copper (Cuivre)</option>
              <option value="OANDA:NATGASUSD">Natural Gas</option>

              {/* Crypto */}
              <option value="BINANCE:BTCUSDT">Bitcoin / USDT</option>
              <option value="BINANCE:ETHUSDT">Ethereum / USDT</option>
              <option value="BINANCE:SOLUSDT">Solana / USDT</option>

              {/* Forex */}
              <option value="OANDA:EURUSD">EUR/USD</option>
              <option value="OANDA:GBPUSD">GBP/USD</option>
              <option value="OANDA:USDJPY">USD/JPY</option>
            </datalist>
          </div>
          <div className="flex-1 w-full h-full">
            <AdvancedRealTimeChart
              theme="dark"
              symbol={assetSymbol}
              allow_symbol_change={false}
              width="100%"
              height="100%"
              hide_side_toolbar={false}
            />
          </div>
        </div>
        <div className="lg:col-span-1 rounded-2xl overflow-hidden shadow-sm flex flex-col relative">
          {account.status !== "active" && (
            <div className="absolute inset-0 bg-surface/80 backdrop-blur-sm z-10 flex flex-col items-center justify-center p-6 text-center border-l border-border">
              <History className="w-12 h-12 text-gray-500 mb-4" />
              <h3 className="text-txt font-bold text-lg mb-2">
                Trading Désactivé
              </h3>
              <p className="text-gray-400 text-sm mb-6">
                Votre challenge actuel est terminé (
                {account.status.replace("_", " ")}). Vous ne pouvez plus ouvrir
                de positions.
              </p>
              <button
                onClick={() => setShowSelectorForced(true)}
                className="bg-accent hover:bg-accent-2 text-white px-6 py-2 rounded-lg font-medium transition-colors w-full"
              >
                Relancer un Challenge
              </button>
            </div>
          )}
          <OrderPanel
            onTradeOpened={refreshSimulator}
            assetSymbol={assetSymbol}
            trades={trades}
            account={account}
          />
        </div>
      </div>

      <SimulatorPerformanceStats account={account} trades={trades} />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 min-h-[350px]">
        <div className="lg:col-span-3 bg-surface rounded-2xl border border-border overflow-hidden flex flex-col shadow-sm">
          <PositionsTable trades={trades} onTradeClosed={refreshSimulator} />
        </div>
        <div className="lg:col-span-1 h-[350px]">
          <MacroEventsPanel />
        </div>
      </div>
    </div>
  );
}
