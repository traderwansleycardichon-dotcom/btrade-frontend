import React, { useEffect, useState } from "react";
import { useAuth } from "../../../hooks/useAuth";
import { Navigate } from "react-router-dom";
import api from "../../../lib/api";
import { toast } from "react-hot-toast";
import { AdvancedRealTimeChart } from "react-ts-tradingview-widgets";
import { OrderPanel } from "../../../components/simulator/OrderPanel";
import { PositionsTable } from "../../../components/simulator/PositionsTable";
import { BrainCircuit } from "lucide-react";
import { ChallengeSelector } from "../../../components/simulator/ChallengeSelector";
import { PropFirmDashboard } from "../../../components/simulator/PropFirmDashboard";
import { useNavigate } from "react-router-dom";
import { Trophy, History } from "lucide-react";
import {
  ChallengePassedModal,
  ChallengeFailedModal,
  ChallengeExpiredModal,
} from "../../../components/simulator/ChallengeModals";
import { TraderProfileStats } from "../../../components/simulator/TraderProfileStats";
import { SimulatorPerformanceStats } from "../../../components/simulator/SimulatorPerformanceStats";

export default function SimulatorPage() {
  const { user } = useAuth();
  const [account, setAccount] = useState<any>(null);
  const [todayPnl, setTodayPnl] = useState(0);
  const [trades, setTrades] = useState<any[]>([]);
  const [floatingPnl, setFloatingPnl] = useState(0);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [cooldown, setCooldown] = useState<any>(null);
  const [showPassedModal, setShowPassedModal] = useState(false);
  const [showFailedModal, setShowFailedModal] = useState(false);
  const [showExpiredModal, setShowExpiredModal] = useState(false);
  const [showSelectorForced, setShowSelectorForced] = useState(false);
  const navigate = useNavigate();

  // Asset géré localement pour propager aux enfants
  const [assetSymbol, setAssetSymbol] = useState("BTCUSDT");

  useEffect(() => {
    fetchData();
    const interval = setInterval(() => {
      fetchData(true);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const fetchOpenTradePrices = async () => {
      if (!trades) return;
      const openTrades = trades.filter((t) => t.status === "open");
      if (openTrades.length === 0) {
        setFloatingPnl(0);
        return;
      }

      const uniqueAssets = [...new Set(openTrades.map((t) => t.asset))];
      let totalFloating = 0;

      try {
        const pricePromises = uniqueAssets.map((asset) =>
          api
            .get(`/api/simulator/market/price?symbol=${asset}`)
            .then((res) => ({ asset, price: res.data.price })),
        );
        const prices = await Promise.all(pricePromises);
        const priceMap: Record<string, number> = prices.reduce(
          (acc: any, curr) => ({ ...acc, [curr.asset]: curr.price }),
          {},
        );

        openTrades.forEach((trade) => {
          const currentPrice = priceMap[trade.asset];
          if (currentPrice) {
            const entryPrice = parseFloat(trade.entryPrice);
            const quantity = parseFloat(trade.quantity);
            if (trade.direction === "long") {
              totalFloating += (currentPrice - entryPrice) * quantity;
            } else {
              totalFloating += (entryPrice - currentPrice) * quantity;
            }
          }
        });
        setFloatingPnl(totalFloating);
      } catch (err) {
        console.error("Failed to fetch open trade prices", err);
      }
    };

    fetchOpenTradePrices();
    interval = setInterval(fetchOpenTradePrices, 1500);
    return () => clearInterval(interval);
  }, [trades]);

  const fetchData = async (isBackground = false) => {
    try {
      if (!isBackground) setLoading(true);
      const accRes = await api.get("/api/simulator/challenge/status");
      const fetchedAccount = accRes.data.data.account;
      setAccount(fetchedAccount);
      setTodayPnl(accRes.data.data.todayPnl);
      const trRes = await api.get("/api/simulator/trades");
      setTrades(trRes.data.data);

      // Fetch stats and cooldown
      const statsRes = await api.get("/api/simulator/challenge/statistics");
      if (statsRes.data.success) setStats(statsRes.data.data);

      const cdRes = await api.get("/api/simulator/challenge/cooldown");
      if (cdRes.data.success) setCooldown(cdRes.data.data);

      // Handle modals based on status
      if (fetchedAccount) {
        if (
          fetchedAccount.status === "passed" &&
          !sessionStorage.getItem(`modal_passed_${fetchedAccount.id}`)
        ) {
          setShowPassedModal(true);
          sessionStorage.setItem(`modal_passed_${fetchedAccount.id}`, "true");
        } else if (
          fetchedAccount.status.startsWith("failed") &&
          !sessionStorage.getItem(`modal_failed_${fetchedAccount.id}`)
        ) {
          setShowFailedModal(true);
          sessionStorage.setItem(`modal_failed_${fetchedAccount.id}`, "true");
        } else if (
          fetchedAccount.status === "expired" &&
          !sessionStorage.getItem(`modal_expired_${fetchedAccount.id}`)
        ) {
          setShowExpiredModal(true);
          sessionStorage.setItem(`modal_expired_${fetchedAccount.id}`, "true");
        }
      }
    } catch (err: any) {
      if (err.response?.status !== 403 && !isBackground) {
        toast.error("Erreur de chargement du simulateur");
      }
    } finally {
      if (!isBackground) setLoading(false);
    }
  };

  const getCooldownLeft = () => {
    if (!cooldown) return undefined;
    const now = new Date().getTime();
    const end = new Date(cooldown.availableRestartTime).getTime();
    const diff = end - now;
    if (diff <= 0) return undefined;
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  if (loading) {
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
        <h1 className="text-3xl font-bold text-text mb-4">
          Paper Trading Simulator
        </h1>
        <p className="text-text-muted text-lg mb-8">
          Le simulateur de trading est réservé aux membres PRO. Passez à la
          vitesse supérieure et entraînez-vous en conditions réelles sans
          risquer votre capital !
        </p>
        <button
          onClick={() => (window.location.href = "/app/upgrade")}
          className="bg-primary hover:bg-primary/90 text-white px-8 py-3 rounded-lg font-semibold transition-colors shadow-lg shadow-primary/20"
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
        <ChallengeSelector onChallengeStarted={fetchData} />
      </div>
    );
  }

  if (showSelectorForced) {
    return (
      <div className="h-[calc(100vh-4rem)] overflow-y-auto">
        <button
          onClick={() => setShowSelectorForced(false)}
          className="m-6 text-gray-400 hover:text-white transition-colors"
        >
          ← Retour au Dashboard
        </button>
        <ChallengeSelector
          onChallengeStarted={() => {
            setShowSelectorForced(false);
            fetchData();
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
        <h1 className="text-2xl font-bold text-white">Dashboard Simulateur</h1>
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
              className="bg-[#1e293b] border border-border rounded px-3 py-1 text-white text-sm focus:outline-none focus:border-primary uppercase w-64"
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
              <h3 className="text-white font-bold text-lg mb-2">
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
            onTradeOpened={() => fetchData(true)}
            assetSymbol={assetSymbol}
            trades={trades}
            account={account}
          />
        </div>
      </div>

      <SimulatorPerformanceStats account={account} trades={trades} />

      <div className="bg-surface rounded-2xl border border-border min-h-[350px] overflow-hidden flex flex-col shadow-sm">
        <PositionsTable trades={trades} onTradeClosed={() => fetchData(true)} />
      </div>
    </div>
  );
}
