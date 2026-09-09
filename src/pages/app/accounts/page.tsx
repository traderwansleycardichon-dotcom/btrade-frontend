import React, { useMemo, useState } from "react";
import { Plus, Pencil, Trash2, TrendingUp, Sparkles } from "lucide-react";
import { useAccounts } from "../../../hooks/useAccounts";
import { AddAccountModal } from "../../../components/trading/AddAccountModal";
import { EditAccountModal } from "../../../components/trading/EditAccountModal";
import { useToast } from "../../../hooks/useToast";
import { usePlan } from "../../../hooks/usePlan";
import { Modal } from "../../../components/ui/Modal";
import { useNavigate } from "react-router-dom";

type Account = {
  id: string;
  nom: string | null;
  typeCompte: string | null;
  propFirm: string | null;
  tailleCompte: number | string | null;
  balanceCourante: number | string | null;
  devise: string;
  statut: string;
  profitTargetPct: number | string | null;
  maxDrawdownPct: number | string | null;
  drawdownCourantPct: number | string | null;
  profitCourantPct: number | string | null;
};

const TYPE_CHIPS: Record<string, { label: string; cls: string }> = {
  evaluation: { label: "Eval", cls: "chip-orange" },
  funded: { label: "Funded", cls: "chip-win" },
  personnel: { label: "Réel", cls: "chip-be" },
};

const num = (v: any) => Number(v ?? 0);
const fmt = (v: any) =>
  num(v).toLocaleString("en-US", { maximumFractionDigits: 2 });

const AccountsPage: React.FC = () => {
  const { accounts, isLoading, passFunded, deleteAccount } = useAccounts();
  const { addToast } = useToast();
  const { isFree } = usePlan();
  const navigate = useNavigate();
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);

  const safe: Account[] = Array.isArray(accounts)
    ? (accounts as Account[])
    : [];

  const stats = useMemo(() => {
    const totalCapital = safe.reduce((s, a) => s + num(a.tailleCompte), 0);
    const totalBalance = safe.reduce((s, a) => s + num(a.balanceCourante), 0);
    const totalPL = totalBalance - totalCapital;
    return { count: safe.length, totalCapital, totalPL };
  }, [safe]);

  const onDelete = async (a: Account) => {
    if (
      !confirm(
        `Supprimer le compte "${a.nom}" ?\nCette action est irréversible.`,
      )
    )
      return;
    try {
      await deleteAccount.mutateAsync(a.id);
      addToast("Compte supprimé");
    } catch {
      addToast("Erreur lors de la suppression", "error");
    }
  };

  const handleNewAccountClick = () => {
    if (isFree && stats.count >= 1) {
      setIsUpgradeOpen(true);
    } else {
      setIsAddOpen(true);
    }
  };

  return (
    <div className="space-y-4 animate-[fadeIn_0.5s_ease-out]">
      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="surface rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-txt-2">
            Comptes actifs
          </p>
          <p className="text-xl font-bold mono mt-1">
            {isLoading ? "—" : stats.count}
          </p>
        </div>
        <div className="surface rounded-xl px-4 py-3">
          <p className="text-[10px] uppercase tracking-widest text-txt-2">
            Capital total
          </p>
          <p className="text-xl font-bold mono mt-1">
            ${isLoading ? "—" : fmt(stats.totalCapital)}
          </p>
        </div>
        <div className="surface rounded-xl px-4 py-3 relative overflow-hidden">
          <div
            className="absolute -top-8 -right-8 w-32 h-32 rounded-full"
            style={{
              background:
                "radial-gradient(circle, rgba(243,108,0,.25), transparent 70%)",
            }}
          />
          <p className="text-[10px] uppercase tracking-widest text-txt-2 relative">
            P&amp;L combiné
          </p>
          <p
            className={`text-xl font-black mono mt-1 relative ${
              stats.totalPL > 0
                ? "grad-text"
                : stats.totalPL < 0
                  ? "text-loss"
                  : "text-txt-2"
            }`}
          >
            {isLoading
              ? "—"
              : `${stats.totalPL >= 0 ? "+" : "-"}$${fmt(Math.abs(stats.totalPL))}`}
          </p>
        </div>
      </div>

      {/* TABLE */}
      <div className="surface rounded-xl">
        <div className="px-4 py-3 border-b border-border flex justify-between items-center">
          <h3 className="font-bold text-xs">Mes comptes</h3>
          <button
            onClick={handleNewAccountClick}
            className="btn-primary px-2.5 py-1.5 rounded-md text-[11px] font-semibold flex items-center gap-1"
          >
            <Plus size={12} /> Nouveau
          </button>
        </div>

        {isLoading ? (
          <div className="p-8 text-center text-txt-2 text-[11px]">
            Chargement des comptes…
          </div>
        ) : safe.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center mx-auto mb-3 text-accent">
              <TrendingUp size={18} />
            </div>
            <p className="text-xs font-bold mb-1">Aucun compte trading</p>
            <p className="text-[10px] text-txt-2 mb-4 max-w-xs mx-auto">
              Ajoute ton premier compte (prop firm, perso, démo) pour commencer
              à tracker tes trades.
            </p>
            <button
              onClick={handleNewAccountClick}
              className="btn-primary px-3 py-1.5 rounded-md text-[11px] font-semibold inline-flex items-center gap-1"
            >
              <Plus size={12} /> Créer un compte
            </button>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px]">
              <thead className="text-txt-3 bg-bg">
                <tr>
                  {[
                    ["Nom", "left"],
                    ["Firm", "left"],
                    ["Type", "left"],
                    ["Capital", "right"],
                    ["Solde", "right"],
                    ["P&L", "right"],
                    ["Objectif", "right"],
                    ["DD", "right"],
                    ["Statut", "center"],
                    ["", "right"],
                  ].map(([label, align]) => (
                    <th
                      key={label as string}
                      className={`px-3 py-2 font-medium uppercase tracking-wider text-[9px] text-${align as string}`}
                    >
                      {label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {safe.map((a) => {
                  const capital = num(a.tailleCompte);
                  const balance = num(a.balanceCourante);
                  const pl = balance - capital;
                  const plPct = capital > 0 ? (pl / capital) * 100 : 0;
                  const typeKey = (a.typeCompte || "personnel").toLowerCase();
                  const chip = TYPE_CHIPS[typeKey] || {
                    label: typeKey,
                    cls: "chip-be",
                  };
                  const ddPct = num(a.drawdownCourantPct);
                  const ddMaxPct = num(a.maxDrawdownPct);
                  const profitTarget = num(a.profitTargetPct);
                  const eligibleFunded =
                    typeKey === "evaluation" &&
                    profitTarget > 0 &&
                    plPct >= profitTarget;

                  return (
                    <tr key={a.id} className="table-row border-t border-border">
                      <td className="px-3 py-2 font-semibold text-[11px]">
                        {a.nom || "—"}
                      </td>
                      <td className="px-3 py-2 text-txt-2 text-[11px]">
                        {a.propFirm || "—"}
                      </td>
                      <td className="px-3 py-2">
                        <span
                          className={`chip ${chip.cls}`}
                          style={{ fontSize: 10 }}
                        >
                          {chip.label}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right mono text-[11px]">
                        ${fmt(capital)}
                      </td>
                      <td className="px-3 py-2 text-right mono font-bold text-[11px]">
                        ${fmt(balance)}
                      </td>
                      <td
                        className={`px-3 py-2 text-right mono font-bold text-[11px] ${
                          pl > 0
                            ? "text-win"
                            : pl < 0
                              ? "text-loss"
                              : "text-txt-2"
                        }`}
                      >
                        {pl > 0 ? "+" : pl < 0 ? "-" : ""}${fmt(Math.abs(pl))}
                        <span className="block text-[9px] text-txt-3 font-normal">
                          {plPct > 0 ? "+" : ""}
                          {plPct.toFixed(2)}%
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right mono text-txt-2 text-[10px]">
                        {profitTarget > 0 ? (
                          <div>
                            +{profitTarget}%
                            <div className="h-1 w-14 rounded-full overflow-hidden bg-bg mt-1 ml-auto">
                              <div
                                className="h-1 rounded-full grad-bar"
                                style={{
                                  width: `${Math.min(
                                    Math.max((plPct / profitTarget) * 100, 0),
                                    100,
                                  )}%`,
                                }}
                              />
                            </div>
                          </div>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2 text-right mono text-txt-2 text-[10px]">
                        {ddMaxPct > 0 ? (
                          <span
                            className={
                              ddPct > ddMaxPct * 0.7 ? "text-loss" : ""
                            }
                          >
                            -{ddPct.toFixed(1)}% / -{ddMaxPct}%
                          </span>
                        ) : (
                          "—"
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span
                          className={`chip ${a.statut === "actif" ? "chip-win" : "chip-be"}`}
                          style={{ fontSize: 10 }}
                        >
                          {a.statut === "actif" ? "Active" : a.statut}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right whitespace-nowrap">
                        <div className="flex items-center gap-1 justify-end">
                          {eligibleFunded && (
                            <button
                              onClick={() => passFunded.mutate(a.id)}
                              disabled={passFunded.isPending}
                              className="text-[9px] font-bold uppercase tracking-widest text-accent hover:text-accent-2 disabled:opacity-50 px-1.5"
                              title="Passer en Funded"
                            >
                              → Funded
                            </button>
                          )}
                          <button
                            onClick={() => setEditing(a)}
                            className="p-1 text-txt-2 hover:text-accent transition-colors"
                            title="Modifier"
                          >
                            <Pencil size={12} />
                          </button>
                          <button
                            onClick={() => onDelete(a)}
                            disabled={deleteAccount.isPending}
                            className="p-1 text-txt-2 hover:text-loss transition-colors disabled:opacity-50"
                            title="Supprimer"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <AddAccountModal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} />
      <EditAccountModal
        account={editing}
        isOpen={!!editing}
        onClose={() => setEditing(null)}
      />

      {/* Upgrade Gating Modal */}
      <Modal
        isOpen={isUpgradeOpen}
        onClose={() => setIsUpgradeOpen(false)}
        title="💎 Limite de Compte Atteinte"
        size="md"
      >
        <div className="flex flex-col items-center text-center p-2">
          <div className="w-16 h-16 rounded-3xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent mb-4 animate-bounce">
            <Sparkles size={28} />
          </div>
          
          <h3 className="text-lg font-black mb-2">
            Passez au Plan PRO pour des Comptes Illimités
          </h3>
          
          <p className="text-sm text-txt-2 max-w-sm mb-6 leading-relaxed">
            Votre compte gratuit est limité à <b>1 compte de trading actif</b>. Débloquez les comptes illimités et boostez vos performances avec nos outils professionnels avancés.
          </p>

          <div className="w-full bg-bg/50 border border-border rounded-2xl p-4 mb-6 text-left space-y-3">
            <div className="flex items-center gap-3">
              <span className="text-win font-bold">✓</span>
              <span className="text-xs text-txt-2 font-medium">💼 <b>Comptes illimités</b> — Connectez toutes vos prop firms et comptes persos</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-win font-bold">✓</span>
              <span className="text-xs text-txt-2 font-medium">🧠 <b>Insights IA</b> — Analyses de performances par IA</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-win font-bold">✓</span>
              <span className="text-xs text-txt-2 font-medium">💬 <b>Chat IA</b> — Session de chat intelligente avec Claude/GPT</span>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-win font-bold">✓</span>
              <span className="text-xs text-txt-2 font-medium">📈 <b>Analyses avancées</b> — Outils d'analyses de vos setups</span>
            </div>
          </div>

          <div className="flex gap-4 w-full">
            <button
              onClick={() => setIsUpgradeOpen(false)}
              className="flex-1 py-3 rounded-xl border border-border font-bold hover:dark:bg-white/5 bg-black/5 transition-all text-xs"
            >
              Plus tard
            </button>
            <button
              onClick={() => {
                setIsUpgradeOpen(false);
                navigate('/app/upgrade');
              }}
              className="flex-1 bg-accent hover:bg-accent/90 text-white py-3 rounded-xl font-bold transition-all text-xs shadow-md hover:scale-105"
            >
              Découvrir Behind The Trade Pro
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AccountsPage;
