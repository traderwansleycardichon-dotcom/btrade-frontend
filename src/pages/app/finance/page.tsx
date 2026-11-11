import React, { useMemo, useState } from 'react';
import { Trash2, ArrowUpRight, ArrowDownRight, X } from 'lucide-react';
import { useDepenses, useRevenus, usePatrimoineDashboard } from '../../../hooks/useFinance';
import { useToast } from '../../../hooks/useToast';

import { FeatureGate } from '../../../components/ui/FeatureGate';

const num = (v: any) => Number(v ?? 0);
const fmt = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 2, ...opts });

const today = () => new Date().toISOString().slice(0, 10);
const moisActuel = () => new Date().toISOString().slice(0, 7);

const CATEGORIES_DEPENSE = ['Loyer', 'Alimentation', 'Transport', 'Abonnements', 'Trading (frais)', 'Santé', 'Loisirs', 'Autre'];
const SOURCES_REVENU = ['Salaire', 'Freelance', 'Trading (payout)', 'Investissement', 'Cadeau', 'Autre'];

const FinancePage: React.FC = () => {
  const [mois, setMois] = useState<string>(moisActuel());
  const { revenus, isLoading: rLoading, create: createRev, remove: removeRev } = useRevenus(mois);
  const { depenses, isLoading: dLoading, create: createDep, remove: removeDep } = useDepenses(mois);
  const { data: dashboard } = usePatrimoineDashboard();
  const { addToast } = useToast();

  const [modalOpen, setModalOpen] = useState<null | 'revenu' | 'depense'>(null);

  const stats = useMemo(() => {
    const totalRev = revenus.reduce((s: number, r: any) => s + num(r.montant), 0);
    const totalDep = depenses.reduce((s: number, d: any) => s + num(d.montant), 0);
    return {
      totalRev,
      totalDep,
      balance: totalRev - totalDep,
      tauxEpargne: totalRev > 0 ? ((totalRev - totalDep) / totalRev) * 100 : 0,
    };
  }, [revenus, depenses]);

  const flux = useMemo(() => {
    const all = [
      ...revenus.map((r: any) => ({ ...r, _type: 'revenu' as const })),
      ...depenses.map((d: any) => ({ ...d, _type: 'depense' as const })),
    ];
    return all.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [revenus, depenses]);

  const onDelete = async (item: any) => {
    if (!confirm('Supprimer cette entrée ?')) return;
    try {
      if (item._type === 'revenu') await removeRev.mutateAsync(item.id);
      else await removeDep.mutateAsync(item.id);
      addToast('Supprimé');
    } catch { addToast('Erreur', 'error'); }
  };

  const monthOptions = useMemo(() => {
    const opts: string[] = [];
    const now = new Date();
    for (let i = 0; i < 12; i++) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      opts.push(d.toISOString().slice(0, 7));
    }
    return opts;
  }, []);

  return (
    <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <h2 className="font-bold text-sm uppercase tracking-widest">Budget &amp; flux financiers</h2>
          <select
            value={mois}
            onChange={e => setMois(e.target.value)}
            className="bg-bg border border-border rounded-md py-1.5 px-2.5 text-[11px] mono focus:border-accent outline-none"
          >
            {monthOptions.map(m => {
              const [y, mm] = m.split('-');
              const label = new Date(Number(y), Number(mm) - 1).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
              return <option key={m} value={m}>{label}</option>;
            })}
          </select>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setModalOpen('revenu')}
            className="text-[11px] px-2.5 py-1.5 rounded mono bg-win/15 hover:bg-win/25 text-win border border-win/30 flex items-center gap-1.5"
          >
            <ArrowDownRight size={12} /> + Revenu
          </button>
          <button
            onClick={() => setModalOpen('depense')}
            className="text-[11px] px-2.5 py-1.5 rounded mono bg-loss/15 hover:bg-loss/25 text-loss border border-loss/30 flex items-center gap-1.5"
          >
            <ArrowUpRight size={12} /> + Dépense
          </button>
        </div>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Revenus du mois" value={`$${fmt(stats.totalRev, { maximumFractionDigits: 0 })}`} color="text-win" />
        <Kpi label="Dépenses du mois" value={`$${fmt(stats.totalDep, { maximumFractionDigits: 0 })}`} color="text-loss" />
        <Kpi
          label="Balance"
          value={`${stats.balance >= 0 ? '+' : '-'}$${fmt(Math.abs(stats.balance), { maximumFractionDigits: 0 })}`}
          color={stats.balance > 0 ? 'text-win' : stats.balance < 0 ? 'text-loss' : ''}
        />
        <Kpi
          label="Taux d'épargne"
          value={`${stats.tauxEpargne.toFixed(0)}%`}
          color={stats.tauxEpargne >= 20 ? 'text-win' : stats.tauxEpargne >= 0 ? '' : 'text-loss'}
        />
      </div>

      {/* PATRIMOINE GLOBAL */}
      {dashboard && (
        <div className="surface rounded-lg px-4 py-3 grid grid-cols-2 lg:grid-cols-4 gap-3 text-[11px]">
          <Inline label="Patrimoine net" value={`$${fmt(num(dashboard.patrimoineNet), { maximumFractionDigits: 0 })}`} />
          <Inline label="Investissements" value={`$${fmt(num(dashboard.totalInvestments), { maximumFractionDigits: 0 })}`} />
          <Inline label="Payouts cumulés" value={`$${fmt(num(dashboard.totalPayouts), { maximumFractionDigits: 0 })}`} color="text-win" />
          <Inline
            label="Balance mensuelle"
            value={`${num(dashboard.balanceMensuelle) >= 0 ? '+' : '-'}$${fmt(Math.abs(num(dashboard.balanceMensuelle)), { maximumFractionDigits: 0 })}`}
          />
        </div>
      )}

      {/* TABLE */}
      <div className="surface rounded-lg overflow-hidden">
        <div className="px-4 py-2.5 border-b border-border flex items-center justify-between">
          <h3 className="text-xs font-bold">Flux du mois</h3>
          <span className="text-[10px] mono text-txt-3">
            {flux.length} entrée{flux.length > 1 ? 's' : ''}
          </span>
        </div>

        {(rLoading || dLoading) ? (
          <div className="p-8 text-center text-txt-3 text-[11px]">Chargement…</div>
        ) : flux.length === 0 ? (
          <div className="px-5 py-10 text-center">
            <p className="text-xs font-bold mb-1">Aucune entrée ce mois-ci</p>
            <p className="text-[10px] text-txt-3 mb-4">Ajoute tes revenus et dépenses pour suivre ton budget.</p>
          </div>
        ) : (
          <table className="w-full text-[11px]">
            <thead className="bg-bg/40 text-txt-3 border-b border-border/40">
              <tr>
                <th className="text-left  px-3 py-2 font-medium uppercase tracking-wider text-[9px] w-[100px]">Date</th>
                <th className="text-left  px-3 py-2 font-medium uppercase tracking-wider text-[9px] w-[100px]">Type</th>
                <th className="text-left  px-3 py-2 font-medium uppercase tracking-wider text-[9px]">Catégorie</th>
                <th className="text-left  px-3 py-2 font-medium uppercase tracking-wider text-[9px]">Label / Note</th>
                <th className="text-right px-3 py-2 font-medium uppercase tracking-wider text-[9px]">Montant</th>
                <th className="text-right px-3 py-2 font-medium uppercase tracking-wider text-[9px] w-[60px]"></th>
              </tr>
            </thead>
            <tbody>
              {flux.map((f: any) => {
                const d = new Date(f.date);
                const isRev = f._type === 'revenu';
                return (
                  <tr key={f.id} className="border-t border-border/30 hover:bg-bg/40 group">
                    <td className="px-3 py-2 mono text-txt-2">
                      {d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                    </td>
                    <td className="px-3 py-2">
                      <span className={`text-[10px] uppercase tracking-wider font-bold ${isRev ? 'text-win' : 'text-loss'}`}>
                        {isRev ? '↓ Revenu' : '↑ Dépense'}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-txt-2">
                      {isRev ? f.source : f.categorie}
                    </td>
                    <td className="px-3 py-2">
                      <p className="truncate max-w-[260px]">
                        {f.label || f.note || <span className="text-txt-3">—</span>}
                      </p>
                      {(isRev ? f.recurrent : f.recurrente) && (
                        <span className="text-[9px] text-accent uppercase tracking-widest">
                          ↻ Récurrent {f.periode || ''}
                        </span>
                      )}
                    </td>
                    <td className={`px-3 py-2 text-right mono font-bold ${isRev ? 'text-win' : 'text-loss'}`}>
                      {isRev ? '+' : '-'}${fmt(num(f.montant))}
                    </td>
                    <td className="px-3 py-2 text-right">
                      <button
                        onClick={() => onDelete(f)}
                        className="p-1 text-txt-3 hover:text-loss opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Supprimer"
                      >
                        <Trash2 size={11} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {modalOpen && (
        <NewFluxModal
          type={modalOpen}
          onClose={() => setModalOpen(null)}
          onSubmit={async data => {
            try {
              if (modalOpen === 'revenu') await createRev.mutateAsync(data);
              else await createDep.mutateAsync(data);
              addToast(modalOpen === 'revenu' ? 'Revenu ajouté' : 'Dépense ajoutée');
              setModalOpen(null);
            } catch (e: any) {
              addToast('Erreur : ' + (e?.response?.data?.error || 'requête échouée'), 'error');
            }
          }}
        />
      )}
    </div>
  );
};

const NewFluxModal: React.FC<{
  type: 'revenu' | 'depense';
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ type, onClose, onSubmit }) => {
  const isRev = type === 'revenu';
  const [montant, setMontant] = useState<number>(0);
  const [categorie, setCategorie] = useState(isRev ? 'Salaire' : 'Loyer');
  const [label, setLabel] = useState('');
  const [date, setDate] = useState(today());
  const [recurrent, setRecurrent] = useState(false);
  const [periode, setPeriode] = useState('mensuelle');
  const [note, setNote] = useState('');

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!montant || montant <= 0) return;
    const payload: any = {
      montant: Number(montant),
      devise: 'USD',
      date,
      periode: recurrent ? periode : null,
      note: note.trim() || null,
    };
    if (isRev) {
      payload.source = categorie;
      payload.recurrent = recurrent;
    } else {
      payload.categorie = categorie;
      payload.label = label.trim() || categorie;
      payload.recurrente = recurrent;
    }
    onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md surface rounded-lg overflow-hidden shadow-2xl">
        <div className={`px-5 py-3 border-b border-border flex items-center justify-between ${isRev ? 'bg-win/10' : 'bg-loss/10'}`}>
          <h2 className={`text-xs font-bold uppercase tracking-widest ${isRev ? 'text-win' : 'text-loss'}`}>
            Nouveau {isRev ? 'revenu' : 'dépense'}
          </h2>
          <button onClick={onClose} className="p-1 text-txt-2 hover:text-txt">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Montant ($)">
              <input
                type="number" step="0.01" required min="0.01"
                value={montant || ''}
                onChange={e => setMontant(parseFloat(e.target.value) || 0)}
                placeholder="500"
                className="w-full bg-bg border border-border rounded py-2 px-3 text-xs mono focus:border-accent outline-none"
                autoFocus
              />
            </Field>
            <Field label="Date">
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                className="w-full bg-bg border border-border rounded py-2 px-3 text-xs mono focus:border-accent outline-none"
              />
            </Field>
          </div>

          <Field label={isRev ? 'Source' : 'Catégorie'}>
            <select
              value={categorie}
              onChange={e => setCategorie(e.target.value)}
              className="w-full bg-bg border border-border rounded py-2 px-3 text-xs focus:border-accent outline-none"
            >
              {(isRev ? SOURCES_REVENU : CATEGORIES_DEPENSE).map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </Field>

          {!isRev && (
            <Field label="Label" optional>
              <input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="Loyer mai, Courses Lidl…"
                className="w-full bg-bg border border-border rounded py-2 px-3 text-xs focus:border-accent outline-none"
              />
            </Field>
          )}

          <div>
            <label className="flex items-center gap-2 cursor-pointer mb-2">
              <input
                type="checkbox"
                checked={recurrent}
                onChange={e => setRecurrent(e.target.checked)}
                className="rounded border-border bg-bg text-accent focus:ring-accent"
              />
              <span className="text-xs">Récurrent</span>
            </label>
            {recurrent && (
              <select
                value={periode}
                onChange={e => setPeriode(e.target.value)}
                className="w-full bg-bg border border-border rounded py-2 px-3 text-xs focus:border-accent outline-none"
              >
                <option value="hebdomadaire">Hebdomadaire</option>
                <option value="mensuelle">Mensuelle</option>
                <option value="annuelle">Annuelle</option>
              </select>
            )}
          </div>

          <Field label="Note" optional>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              className="w-full bg-bg border border-border rounded py-2 px-3 text-xs focus:border-accent outline-none resize-none"
            />
          </Field>
        </form>

        <div className="px-5 py-3 border-t border-border bg-bg/40 flex justify-end gap-2">
          <button onClick={onClose} className="text-[11px] px-3 py-1.5 rounded mono bg-bg border border-border text-txt-2 hover:text-txt">
            Annuler
          </button>
          <button
            onClick={submit}
            className={`text-[11px] px-3 py-1.5 rounded mono text-white font-bold ${isRev ? 'bg-win hover:opacity-90' : 'bg-loss hover:opacity-90'}`}
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
};

const Kpi: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="surface rounded-lg px-4 py-3">
    <p className="text-[10px] uppercase tracking-widest text-txt-3">{label}</p>
    <p className={`text-xl font-black mono ${color || ''}`}>{value}</p>
  </div>
);

const Inline: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color }) => (
  <div className="flex items-baseline justify-between gap-2">
    <span className="text-txt-3 uppercase tracking-widest text-[9px]">{label}</span>
    <span className={`mono font-bold ${color || ''}`}>{value}</span>
  </div>
);

const Field: React.FC<{ label: string; optional?: boolean; children: React.ReactNode }> = ({ label, optional, children }) => (
  <div>
    <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-1.5">
      {label}{optional && <span className="ml-1.5 normal-case tracking-normal lowercase font-normal">optionnel</span>}
    </label>
    {children}
  </div>
);

const ProtectedFinancePage: React.FC = () => {
  return (
    <FeatureGate 
      feature="hasFinance"
      fallbackTitle="Budget & Flux Financiers Réservé aux Membres Pro"
      fallbackDesc="Suivez et planifiez de manière professionnelle vos dépenses, vos revenus et vos budgets récurrents ou ponctuels."
    >
      <FinancePage />
    </FeatureGate>
  );
};

export default ProtectedFinancePage;
