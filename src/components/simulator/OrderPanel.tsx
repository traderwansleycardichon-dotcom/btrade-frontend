import React, { useState, useEffect } from "react";
import { Play, Square, Minus, Plus } from "lucide-react";
import api from "../../lib/api";
import { toast } from "react-hot-toast";
import { sounds } from "../../utils/sounds";

interface Props {
  onTradeOpened: () => void;
  assetSymbol: string;
  trades?: any[];
  account?: any;
}

const normSym = (s: string) => s.toUpperCase().split(":").pop() ?? s.toUpperCase();
const sameAsset = (a: string, b: string) => normSym(a) === normSym(b);

export function OrderPanel({
  onTradeOpened,
  assetSymbol,
  trades = [],
  account,
}: Props) {
  const [orderType, setOrderType] = useState<"market" | "limit">("market");
  const [quantity, setQuantity] = useState<number>(0.1);
  const [limitPrice, setLimitPrice] = useState<number | null>(null);
  const [tpPrice, setTpPrice] = useState<number>(0);
  const [slPrice, setSlPrice] = useState<number>(0);
  const [loading, setLoading] = useState<"long" | "short" | "close" | null>(
    null,
  );
  const [currentPrice, setCurrentPrice] = useState<number | null>(null);
  const [isLimitLoading, setIsLimitLoading] = useState(false);

  const [qtyMode, setQtyMode] = useState<"lots" | "risk">("lots");
  const [riskPercent, setRiskPercent] = useState<number>(1);
  const [riskSlPrice, setRiskSlPrice] = useState<number | null>(null);

  const [useTrailingStop, setUseTrailingStop] = useState(false);
  const [trailingDistance, setTrailingDistance] = useState<number>(10);

  const activeTrade = trades.find(
    (t) => t.status === "open" && sameAsset(t.asset, assetSymbol),
  );

  useEffect(() => {
    const symbol = assetSymbol?.trim();
    if (!symbol) {
      setCurrentPrice(null);
      return;
    }

    let cancelled = false;
    const fetchPrice = async () => {
      try {
        const res = await api.get(
          `/api/simulator/market/price?symbol=${encodeURIComponent(symbol)}`,
        );
        if (!cancelled) setCurrentPrice(res.data.price);
      } catch {
        // Symbole partiel (en cours de frappe) ou indisponible: on ignore.
      }
    };

    // Debounce: évite un appel (et un 400) à chaque frappe dans le champ symbole.
    const debounce = setTimeout(fetchPrice, 500);
    const interval = setInterval(fetchPrice, 5000);
    return () => {
      cancelled = true;
      clearTimeout(debounce);
      clearInterval(interval);
    };
  }, [assetSymbol]);

  useEffect(() => {
    if (qtyMode === "risk" && riskPercent > 0 && riskSlPrice && riskSlPrice > 0 && currentPrice) {
      const balance = account ? Number(account.currentBalance || account.initialBalance) : 100000;
      const riskAmount = balance * (riskPercent / 100);
      const entryPrice = orderType === "limit" && limitPrice ? limitPrice : currentPrice;
      const distance = Math.abs(entryPrice - riskSlPrice);
      if (distance > 0) {
        const calculatedQty = Number((riskAmount / distance).toFixed(2));
        setQuantity(Math.max(0.01, calculatedQty));
      }
    }
  }, [qtyMode, riskPercent, riskSlPrice, currentPrice, orderType, limitPrice, account]);

  const executeTrade = async (direction: "long" | "short") => {
    if (quantity <= 0) {
      toast.error("Quantité invalide");
      return;
    }
    if (orderType === "limit" && (!limitPrice || limitPrice <= 0)) {
      toast.error("Entrez un prix limite valide");
      return;
    }

    try {
      setLoading(direction);

      let stopLoss = slPrice > 0 ? slPrice : null;
      if (qtyMode === "risk" && riskSlPrice && riskSlPrice > 0) {
        stopLoss = riskSlPrice;
      }
      let takeProfit = tpPrice > 0 ? tpPrice : null;

      await api.post("/api/simulator/trades/open", {
        asset: assetSymbol,
        direction,
        orderType,
        quantity,
        limitPrice: orderType === "limit" ? limitPrice : undefined,
        stopLoss,
        takeProfit,
        trailingDistance: useTrailingStop && trailingDistance > 0 ? trailingDistance : null
      });

      sounds.play('open');
      toast.success(
        orderType === "limit"
          ? `Ordre Limite ${direction.toUpperCase()} placé`
          : `Ordre ${direction.toUpperCase()} exécuté`,
      );
      onTradeOpened();
    } catch (err: any) {
      toast.error(
        err.response?.data?.error || "Erreur lors de l'exécution de l'ordre",
      );
    } finally {
      setLoading(null);
    }
  };

  const closeTrade = async (tradeId: string) => {
    try {
      setLoading("close");
      await api.post(`/api/simulator/trades/close/${tradeId}`);
      toast.success("Position fermée");
      onTradeOpened();
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur lors de la fermeture");
    } finally {
      setLoading(null);
    }
  };

  const handleSetLimit = async () => {
    try {
      if (activeTrade) {
        setIsLimitLoading(true);
        await api.put(`/api/simulator/trades/${activeTrade.id}/limits`, {
          takeProfit: tpPrice || null,
          stopLoss: slPrice || null,
          trailingDistance: useTrailingStop && trailingDistance > 0 ? trailingDistance : null
        });
        toast.success("Limites mises à jour pour la position ouverte");
        onTradeOpened(); // Refresh data
      } else {
        toast.success("Limites enregistrées pour le prochain ordre");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.error || "Erreur");
    } finally {
      setIsLimitLoading(false);
    }
  };

  const adjustQty = (amount: number) => {
    setQuantity((prev) => Math.max(0.1, Number((prev + amount).toFixed(2))));
  };

  return (
    <div className="p-3 flex flex-col h-full bg-[#111318] border-l border-border w-full font-sans overflow-y-auto hide-scrollbar">
      <div className="mb-4 flex flex-col items-center justify-center border-b border-[#2a2e39] pb-3">
        <h3 className="text-xs font-bold text-gray-400 tracking-wider uppercase">
          {assetSymbol.split(":").pop()}
        </h3>
        <p className="text-sm font-mono font-medium text-white mt-1">
          {currentPrice
            ? currentPrice.toLocaleString(undefined, {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })
            : "..."}
        </p>
      </div>

      <div className="flex-1 flex flex-col gap-4">
        {/* Order Type Toggle */}
        <div className="flex rounded-lg overflow-hidden border border-[#2a2e39]">
          <button
            type="button"
            onClick={() => setOrderType("market")}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              orderType === "market"
                ? "bg-[#2a2e39] text-white"
                : "bg-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Market
          </button>
          <button
            type="button"
            onClick={() => setOrderType("limit")}
            className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider transition-colors ${
              orderType === "limit"
                ? "bg-[#2a2e39] text-white"
                : "bg-transparent text-gray-500 hover:text-gray-300"
            }`}
          >
            Limit
          </button>
        </div>

        {/* Limit Price Input */}
        {orderType === "limit" && (
          <div>
            <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-1.5 text-center">
              Prix Limite
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={limitPrice || ""}
              onChange={(e) => setLimitPrice(Number(e.target.value))}
              className="w-full bg-[#1e222d] border border-primary/50 rounded-lg px-3 py-2 text-sm text-white text-center focus:outline-none focus:border-primary"
              placeholder="0.00"
            />
          </div>
        )}

        {/* Mode Toggle & Quantity/Risk */}
        <div>
          <div className="flex bg-[#1e222d] rounded-lg p-1 border border-[#2a2e39] mb-3">
            <button
              type="button"
              onClick={() => setQtyMode("lots")}
              className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                qtyMode === "lots" ? "bg-[#2a2e39] text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Lots
            </button>
            <button
              type="button"
              onClick={() => setQtyMode("risk")}
              className={`flex-1 py-1 text-[10px] font-bold uppercase tracking-wider rounded ${
                qtyMode === "risk" ? "bg-[#2a2e39] text-white" : "text-gray-500 hover:text-gray-300"
              }`}
            >
              Risque %
            </button>
          </div>

          {qtyMode === "lots" ? (
            <>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-2 text-center">
                Quantité (Contrats)
              </label>
              <div className="flex items-center gap-2 bg-[#1e222d] rounded-lg p-1 border border-[#2a2e39]">
                <button
                  type="button"
                  onClick={() => adjustQty(-1)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2e39] rounded-md transition-colors"
                >
                  <Minus size={16} />
                </button>
                <input
                  type="number"
                  step="0.1"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                  className="flex-1 bg-transparent text-center text-sm font-bold text-white focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => adjustQty(1)}
                  className="p-2 text-gray-400 hover:text-white hover:bg-[#2a2e39] rounded-md transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              <div className="flex justify-between gap-2 mt-2">
                {[1, 2, 5, 10].map((qty) => (
                  <button
                    key={qty}
                    onClick={() => setQuantity(qty)}
                    className="flex-1 bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-gray-300 text-sm font-medium py-1 rounded transition-colors"
                  >
                    {qty}
                  </button>
                ))}
              </div>
            </>
          ) : (
            <div className="space-y-3 bg-[#1e222d] p-3 rounded-lg border border-[#2a2e39]">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase">Risque (%)</span>
                <input
                  type="number"
                  step="0.1"
                  value={riskPercent}
                  onChange={(e) => setRiskPercent(Number(e.target.value) || 0)}
                  className="w-20 bg-[#2a2e39] text-white rounded p-1.5 text-right focus:outline-none"
                />
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold uppercase">Stop Loss</span>
                <input
                  type="number"
                  step="0.01"
                  value={riskSlPrice || ""}
                  onChange={(e) => setRiskSlPrice(Number(e.target.value) || 0)}
                  placeholder="0.00"
                  className="w-20 bg-[#2a2e39] text-white rounded p-1.5 text-right focus:outline-none"
                />
              </div>
              <div className="pt-2 border-t border-[#2a2e39] flex justify-between items-center">
                <span className="text-[10px] text-gray-400 font-bold uppercase">Lots Calculés</span>
                <span className="text-sm font-bold text-primary">{quantity}</span>
              </div>
            </div>
          )}
        </div>

        {/* ATM Brackets */}
        <div className={`bg-[#1e222d] border border-[#2a2e39] rounded-lg p-2.5 transition-opacity ${!activeTrade ? 'opacity-50 pointer-events-none' : ''}`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold text-gray-400 uppercase">
              TP / SL (Prix Limites)
            </span>
            <span className="text-[10px] text-primary cursor-pointer hover:underline">
              Custom ▾
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-bold">TP</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={tpPrice || ""}
                onChange={(e) => setTpPrice(Number(e.target.value) || 0)}
                placeholder="0.00"
                className="w-16 bg-[#2a2e39] text-white rounded p-1 text-right focus:outline-none disabled:opacity-50"
                disabled={!activeTrade}
              />
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-500 font-bold">SL</span>
              <input
                type="number"
                min="0"
                step="0.01"
                value={slPrice || ""}
                onChange={(e) => setSlPrice(Number(e.target.value) || 0)}
                placeholder="0.00"
                className="w-16 bg-[#2a2e39] text-white rounded p-1 text-right focus:outline-none disabled:opacity-50"
                disabled={!activeTrade}
              />
            </div>
          </div>
          
          <div className="mt-3 pt-3 border-t border-[#2a2e39]">
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={useTrailingStop}
                onChange={(e) => setUseTrailingStop(e.target.checked)}
                className="w-3.5 h-3.5 accent-primary bg-[#2a2e39] border-none rounded"
                disabled={!activeTrade}
              />
              <span className="text-[10px] font-bold text-gray-400 uppercase">
                Activer Trailing Stop (Points)
              </span>
            </label>
            {useTrailingStop && (
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-bold">Distance</span>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={trailingDistance}
                  onChange={(e) => setTrailingDistance(Number(e.target.value) || 0)}
                  placeholder="Points"
                  className="w-16 bg-[#2a2e39] text-white rounded p-1 text-right focus:outline-none disabled:opacity-50"
                  disabled={!activeTrade}
                />
              </div>
            )}
          </div>

          <button
            onClick={handleSetLimit}
            disabled={isLimitLoading || (!tpPrice && !slPrice) || !activeTrade}
            className="w-full mt-3 bg-primary/20 hover:bg-primary/30 text-primary border border-primary/30 text-[10px] font-bold py-1.5 rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            SET LIMIT
          </button>
        </div>

        {/* Active Trade Tracker */}
        {activeTrade &&
          (() => {
            const entryPrice = Number(activeTrade.entryPrice);
            const currentPriceNum = Number(currentPrice);
            const pnl =
              activeTrade.direction === "long"
                ? (currentPriceNum - entryPrice) * activeTrade.quantity
                : (entryPrice - currentPriceNum) * activeTrade.quantity;
            
            const priceDiff = currentPriceNum - entryPrice;
            const pointsMoved = activeTrade.direction === "long" ? priceDiff : -priceDiff;
            const isGain = pnl > 0;
            const isLoss = pnl < 0;
            const colorClass = isGain ? "text-green-500" : (isLoss ? "text-red-500" : "text-gray-400");
            const borderColorClass = isGain ? "border-green-500" : (isLoss ? "border-red-500" : "border-purple-500");

            return (
              <div className="bg-[#1e222d] border border-[#2a2e39] rounded-lg p-2.5">
                <div className="flex justify-between items-center text-[10px] mb-2 border-b border-[#2a2e39] pb-2">
                  <span className="font-bold text-gray-400 uppercase tracking-wider">
                    Position Active
                  </span>
                  <div className="flex items-center gap-2">
                    <span
                      className={`font-black ${activeTrade.direction === "long" ? "text-green-500" : "text-red-500"}`}
                    >
                      {activeTrade.direction.toUpperCase()}{" "}
                      {activeTrade.quantity}
                    </span>
                    <button
                      onClick={() => closeTrade(activeTrade.id)}
                      disabled={loading !== null}
                      className="bg-red-500/20 hover:bg-red-500 text-red-500 hover:text-white border border-red-500/30 text-[9px] px-1.5 py-0.5 rounded font-bold uppercase transition-colors"
                    >
                      Close
                    </button>
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {activeTrade.takeProfit && (
                    <div className="flex justify-between items-center bg-green-500/10 p-2 rounded border border-green-500/20">
                      <span className="text-green-500 text-xs font-bold">
                        TP (Take Profit)
                      </span>
                      <span className="text-green-400 font-mono text-sm">
                        {Number(activeTrade.takeProfit).toLocaleString()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between items-center bg-[#2a2e39] p-2 rounded border-l-2 border-blue-500">
                    <span className="text-gray-400 text-xs font-bold">
                      Prix d'Entrée
                    </span>
                    <span className="text-white font-mono text-sm">
                      {Number(activeTrade.entryPrice).toLocaleString()}
                    </span>
                  </div>
                  <div className={`flex justify-between items-center bg-[#2a2e39] p-2 rounded border-l-2 ${borderColorClass}`}>
                    <span className="text-gray-400 text-xs font-bold">
                      Prix Actuel
                    </span>
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-bold ${colorClass}`}>
                        {pointsMoved > 0 ? "+" : ""}{pointsMoved.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} pts
                      </span>
                      <span className="text-white font-mono text-sm">
                        {currentPriceNum
                          ? currentPriceNum.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 2,
                            })
                          : "..."}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center bg-[#2a2e39] p-2 rounded border-l-2 border-orange-500">
                    <span className="text-gray-400 text-xs font-bold">
                      PnL Flottant
                    </span>
                    <span
                      className={`font-mono font-bold text-sm ${pnl >= 0 ? "text-green-500" : "text-red-500"}`}
                    >
                      {pnl >= 0 ? "+" : ""}
                      {pnl.toLocaleString(undefined, {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}{" "}
                      $
                    </span>
                  </div>
                  {activeTrade.stopLoss && (
                    <div className="flex justify-between items-center bg-red-500/10 p-2 rounded border border-red-500/20">
                      <span className="text-red-500 text-xs font-bold">
                        SL (Stop Loss)
                      </span>
                      <span className="text-red-400 font-mono text-sm">
                        {Number(activeTrade.stopLoss).toLocaleString()}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            );
          })()}

        {/* Action Buttons */}
        <div className="mt-auto flex flex-col gap-6">
          {/* Action Row */}
          <div className="flex gap-4 mb-2">
            <button
              disabled={loading !== null}
              className="flex-1 bg-[#1e222d] hover:bg-[#2a2e39] border border-[#2a2e39] text-gray-300 text-[10px] font-bold py-1 rounded transition-colors uppercase disabled:opacity-50"
            >
              Reverse
            </button>
            <button
              onClick={() => {
                const active = trades.find(
                  (t) => t.status === "open" && sameAsset(t.asset, assetSymbol),
                );
                if (active) closeTrade(active.id);
              }}
              disabled={
                loading !== null ||
                !trades.some(
                  (t) => t.status === "open" && sameAsset(t.asset, assetSymbol),
                )
              }
              className="flex-1 bg-[#1e222d] hover:bg-red-500/20 border border-[#2a2e39] hover:border-red-500/50 hover:text-red-400 text-gray-300 text-[10px] font-bold py-1 rounded transition-colors uppercase disabled:opacity-50"
            >
              Flatten
            </button>
          </div>

          {/* Buy/Sell Row */}
          <div className="flex gap-3">
            <button
              onClick={() => executeTrade("short")}
              disabled={loading !== null}
              className={`flex-1 flex items-center justify-center py-2 rounded-lg border-2 transition-all ${loading === "short" ? "bg-red-500/20 border-red-500/50 text-red-500 opacity-50" : "bg-red-500/10 border-red-500/30 hover:bg-red-500 hover:border-red-500 text-red-500 hover:text-white"}`}
            >
              <span className="font-black text-xs">SELL</span>
            </button>

            <button
              onClick={() => executeTrade("long")}
              disabled={loading !== null}
              className={`flex-1 flex items-center justify-center py-2 rounded-lg border-2 transition-all ${loading === "long" ? "bg-[#00bfa5]/20 border-[#00bfa5]/50 text-[#00bfa5] opacity-50" : "bg-[#00bfa5]/10 border-[#00bfa5]/30 hover:bg-[#00bfa5] hover:border-[#00bfa5] text-[#00bfa5] hover:text-white"}`}
            >
              <span className="font-black text-xs">BUY</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
