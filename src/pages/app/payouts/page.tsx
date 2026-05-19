import React, { useMemo, useState } from 'react';
import {
  Plus, Check, X, ChevronDown, Building2, Bitcoin, Wallet, CreditCard, MoreHorizontal,
} from 'lucide-react';
import { useAccounts } from '../../../hooks/useAccounts';
import { usePayouts, useAllPayouts, usePayoutMutations, Payout } from '../../../hooks/usePayouts';
import { useToast } from '../../../hooks/useToast';

import { FeatureGate } from '../../../components/ui/FeatureGate';
import { Modal } from '../../../components/ui/Modal';

const num = (v: any) => Number(v ?? 0);
const fmt = (n: number, opts: Intl.NumberFormatOptions = {}) =>
  n.toLocaleString('en-US', { maximumFractionDigits: 2, ...opts });

const METHODES: Array<{ value: string; label: string; icon: any }> = [
  { value: 'bank',   label: 'Virement bancaire', icon: Building2 },
  { value: 'crypto', label: 'Crypto',            icon: Bitcoin },
  { value: 'wise',   label: 'Wise',              icon: Wallet },
  { value: 'paypal', label: 'PayPal',            icon: CreditCard },
  { value: 'autre',  label: 'Autre',             icon: MoreHorizontal },
];

const methodMeta = (m: string | null) =>
  METHODES.find(x => x.value === m) || { value: m, label: m || '—', icon: MoreHorizontal };

const STATUT_META: Record<string, { label: string; cls: string }> = {
  pending:   { label: 'En transit',  cls: 'bg-accent/10 text-accent' },
  confirmed: { label: 'Reçu',        cls: 'bg-win/10 text-win' },
  rejected:  { label: 'Annulé',      cls: 'bg-loss/10 text-loss' },
};

const PayoutsPage: React.FC = () => {
  const { accounts } = useAccounts();
  const safeAccounts = Array.isArray(accounts) ? accounts : [];
  // Comptes éligibles aux retraits : funded ET personnel (réel),
  // PAS les comptes d'évaluation.
  const eligibleAccounts = safeAccounts.filter(
    (a: any) => a.statut === 'actif' && ['funded', 'personnel'].includes(a.typeCompte)
  );
  const { addToast } = useToast();

  const [scope, setScope] = useState<'all' | string>('all');
  const [scopeOpen, setScopeOpen] = useState(false);
  const [filter, setFilter] = useState<'tous' | 'pending' | 'confirmed' | 'rejected'>('tous');
  const [modalOpenType, setModalOpenType] = useState<'create' | 'info_no_accounts' | 'info_no_eligible' | null>(null);

  const isAll = scope === 'all';
  const singleAccount = !isAll ? safeAccounts.find((a: any) => a.id === scope) : null;

  // Données : un compte unique OU tous
  const single = usePayouts(isAll ? undefined : scope);
  const allList = useAllPayouts(isAll ? safeAccounts.map((a: any) => a.id) : []);
  const { createPayout, confirmPayout, rejectPayout } = usePayoutMutations();

  const payouts = isAll ? allList.payouts : single.payouts;
  const totalCumule = isAll ? allList.totalCumule : single.totalCumule;
  const totalCeMois = isAll ? allList.totalCeMois : single.totalCeMois;
  const isLoading = isAll ? allList.isLoading : single.isLoading;

  // Stats locales
  const stats = useMemo(() => {
    const pending = payouts.filter(p => p.statut === 'pending');
    const confirmed = payouts.filter(p => p.statut === 'confirmed');
    const pendingAmount = pending.reduce((s, p) => s + num(p.montant), 0);
    const avgMonthly = confirmed.length > 0
      ? confirmed.reduce((s, p) => s + num(p.montant), 0) / Math.max(1, new Set(confirmed.map(p => (p.dateDemande || p.createdAt).slice(0, 7))).size)
      : 0;
    const nextDate = pending.length > 0
      ? pending.sort((a, b) => new Date(a.dateDemande || a.createdAt).getTime() - new Date(b.dateDemande || b.createdAt).getTime())[0].dateDemande
      : null;
    let nextLabel = '—';
    if (nextDate) {
      const days = Math.ceil((new Date(nextDate).getTime() - Date.now()) / (24 * 3600 * 1000));
      nextLabel = days <= 0 ? "Aujourd'hui" : `dans ${days}j`;
    }
    return {
      pendingAmount,
      pendingCount: pending.length,
      avgMonthly,
      nextLabel,
      totalCount: payouts.length,
    };
  }, [payouts]);

  const filtered = useMemo(() => {
    if (filter === 'tous') return payouts;
    return payouts.filter(p => p.statut === filter);
  }, [payouts, filter]);

  const onConfirm = async (p: Payout) => {
    if (!confirm(`Confirmer le payout de $${fmt(num(p.montant))} ?`)) return;
    try {
      await confirmPayout.mutateAsync(p.id);
      addToast('Payout confirmé');
    } catch {
      addToast('Erreur', 'error');
    }
  };

  const onReject = async (p: Payout) => {
    if (!confirm('Rejeter ce payout ?')) return;
    try {
      await rejectPayout.mutateAsync(p.id);
      addToast('Payout rejeté');
    } catch {
      addToast('Erreur', 'error');
    }
  };

  return (
    <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
      {/* HEADER */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <PayoutScopeSwitcher
          scope={scope}
          setScope={setScope}
          accounts={safeAccounts}
          open={scopeOpen}
          setOpen={setScopeOpen}
        />
        <button
          onClick={() => {
            if (safeAccounts.length === 0) {
              setModalOpenType('info_no_accounts');
            } else if (eligibleAccounts.length === 0) {
              setModalOpenType('info_no_eligible');
            } else {
              setModalOpenType('create');
            }
          }}
          className="text-xs font-bold uppercase tracking-widest bg-accent hover:bg-accent-2 text-white px-4 py-2 rounded-xl flex items-center gap-2 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          <Plus size={14} /> Enregistrer un retrait
        </button>
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Kpi label="Total reçu" value={`$${fmt(totalCumule, { maximumFractionDigits: 0 })}`} color="text-win" />
        <Kpi label="En transit" value={`$${fmt(stats.pendingAmount, { maximumFractionDigits: 0 })}`} sub={`${stats.pendingCount} retrait${stats.pendingCount > 1 ? 's' : ''}`} color="text-accent" />
        <Kpi label="Ce mois-ci" value={`$${fmt(totalCeMois, { maximumFractionDigits: 0 })}`} />
        <Kpi label="Moyenne mensuelle" value={`$${fmt(stats.avgMonthly, { maximumFractionDigits: 0 })}`} />
      </div>

      {/* TABLE */}
      <div className="glass rounded-3xl overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 border-b border-border/50">
          <div className="flex items-center gap-3 flex-wrap">
            <h3 className="font-bold text-sm">Mes retraits</h3>
            <div className="flex gap-1">
              {(['tous', 'confirmed', 'pending', 'rejected'] as const).map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-[11px] px-2.5 py-1 rounded mono transition-colors ${
                    filter === f
                      ? 'bg-accent text-white font-bold'
                      : 'bg-bg text-txt-2 hover:text-txt border border-border'
                  }`}
                >
                  {f === 'tous' ? 'Tous' : STATUT_META[f]?.label || f}
                </button>
              ))}
            </div>
          </div>
          <span className="text-[10px] mono text-txt-3">
            {filtered.length} entrée{filtered.length > 1 ? 's' : ''}
          </span>
        </div>

        {isLoading ? (
          <div className="px-5 py-12 text-center text-[11px] text-txt-3">Chargement…</div>
        ) : filtered.length === 0 ? (
          <div className="px-5 py-12 text-center">
            <p className="text-xs font-bold mb-1">
              {payouts.length === 0 ? 'Aucun retrait enregistré' : 'Aucun résultat'}
            </p>
            <p className="text-[11px] text-txt-3 mb-4 max-w-sm mx-auto">
              Garde la trace des retraits reçus de tes comptes funded et réels.
            </p>
            {payouts.length === 0 && (
              <button
                onClick={() => {
                  if (safeAccounts.length === 0) {
                    setModalOpenType('info_no_accounts');
                  } else if (eligibleAccounts.length === 0) {
                    setModalOpenType('info_no_eligible');
                  } else {
                    setModalOpenType('create');
                  }
                }}
                className="text-[11px] font-bold uppercase tracking-widest bg-accent text-white px-3 py-1.5 rounded-xl inline-flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <Plus size={12} /> Enregistrer un retrait
              </button>
            )}
            {eligibleAccounts.length === 0 && safeAccounts.length > 0 && (
              <p className="text-[10px] text-txt-3 italic mt-2">
                Seuls les comptes <b className="text-txt-2">funded</b> ou <b className="text-txt-2">réels</b> permettent
                d'enregistrer des retraits.
              </p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[11px] min-w-[760px]">
              <thead className="bg-bg/40 text-txt-3 border-b border-border/40">
                <tr>
                  <th className="text-left  px-4 py-2.5 font-medium uppercase tracking-wider text-[10px] w-[130px]">Demande</th>
                  <th className="text-left  px-4 py-2.5 font-medium uppercase tracking-wider text-[10px]">Compte</th>
                  <th className="text-left  px-4 py-2.5 font-medium uppercase tracking-wider text-[10px] w-[140px]">Méthode</th>
                  <th className="text-right px-4 py-2.5 font-medium uppercase tracking-wider text-[10px] w-[130px]">Montant</th>
                  <th className="text-left  px-4 py-2.5 font-medium uppercase tracking-wider text-[10px]">Référence</th>
                  <th className="text-center px-4 py-2.5 font-medium uppercase tracking-wider text-[10px] w-[110px]">Statut</th>
                  <th className="text-right px-4 py-2.5 font-medium uppercase tracking-wider text-[10px] w-[130px]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(p => {
                  const m = methodMeta(p.methode);
                  const MIcon = m.icon;
                  const st = STATUT_META[p.statut] || { label: p.statut, cls: 'bg-border/40 text-txt-2' };
                  const d = p.dateDemande ? new Date(p.dateDemande) : new Date(p.createdAt);
                  const dRecep = p.dateReception ? new Date(p.dateReception) : null;
                  const compteName = safeAccounts.find((a: any) => a.id === p.accountId)?.nom || '—';
                  return (
                    <tr key={p.id} className="border-t border-border/30 hover:bg-bg/40 transition group">
                      <td className="px-4 py-2.5 mono text-txt-2">
                        <div>{d.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: '2-digit' })}</div>
                        {dRecep && (
                          <div className="text-[9px] text-win">
                            reçu {dRecep.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-2.5 font-bold truncate max-w-[160px]">{compteName}</td>
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-1.5">
                          <MIcon size={12} className="text-txt-2 flex-shrink-0" />
                          <span className="text-[11px]">{m.label}</span>
                        </div>
                      </td>
                      <td className="px-4 py-2.5 text-right mono font-black text-sm">
                        ${fmt(num(p.montant))}
                      </td>
                      <td className="px-4 py-2.5 mono text-[10px] text-txt-3 truncate max-w-[140px]">
                        {p.referenceExt || '—'}
                      </td>
                      <td className="px-4 py-2.5 text-center">
                        <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded ${st.cls}`}>
                          {st.label}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        {p.statut === 'pending' ? (
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onConfirm(p)}
                              className="text-[10px] uppercase tracking-wider font-bold text-win hover:bg-win/10 px-2 py-1 rounded flex items-center gap-1"
                              title="Marquer comme reçu"
                            >
                              <Check size={11} /> Marquer reçu
                            </button>
                            <button
                              onClick={() => onReject(p)}
                              className="text-[10px] uppercase tracking-wider font-bold text-loss hover:bg-loss/10 px-2 py-1 rounded"
                              title="Annuler"
                            >
                              <X size={11} />
                            </button>
                          </div>
                        ) : (
                          <span className="text-[10px] text-txt-3">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* MODAL DEMANDE */}
      {modalOpenType === 'create' && (
        <NewPayoutModal
          accounts={eligibleAccounts}
          defaultAccountId={!isAll ? scope : eligibleAccounts[0]?.id || ''}
          onClose={() => setModalOpenType(null)}
          onSubmit={async (accountId, data) => {
            try {
              await createPayout.mutateAsync({ accountId, data });
              addToast('Demande de retrait envoyée');
              setModalOpenType(null);
            } catch (e: any) {
              addToast('Erreur : ' + (e?.response?.data?.errors?.join(' · ') || 'requête échouée'), 'error');
            }
          }}
        />
      )}

      {modalOpenType === 'info_no_accounts' && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpenType(null)}
          title="Aucun compte de trading"
          size="sm"
        >
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-loss/10 flex items-center justify-center mx-auto text-loss mb-2">
              <Building2 size={24} />
            </div>
            <p className="text-xs text-txt-2 leading-relaxed">
              Vous n'avez pas encore de compte de trading enregistré.
              Pour pouvoir enregistrer un retrait (payout), vous devez d'abord ajouter un compte de type <strong className="text-txt font-bold">Funded</strong> ou <strong className="text-txt font-bold">Personnel (Réel)</strong>.
            </p>
            <div className="pt-2">
              <a
                href="/app/trading"
                className="inline-flex items-center justify-center text-[11px] font-bold uppercase tracking-widest bg-accent hover:bg-accent-2 text-white px-4 py-2 rounded-xl transition-all"
              >
                Créer un compte de trading
              </a>
            </div>
          </div>
        </Modal>
      )}

      {modalOpenType === 'info_no_eligible' && (
        <Modal
          isOpen={true}
          onClose={() => setModalOpenType(null)}
          title="Aucun compte éligible aux retraits"
          size="sm"
        >
          <div className="space-y-4 text-center py-4">
            <div className="w-12 h-12 rounded-full bg-accent/10 flex items-center justify-center mx-auto text-accent mb-2">
              <Building2 size={24} />
            </div>
            <p className="text-xs text-txt-2 leading-relaxed">
              Vos comptes de trading actuels ne sont pas éligibles aux retraits.
              Seuls les comptes de type <strong className="text-txt font-bold">Funded</strong> (Prop Firm réussie) ou <strong className="text-txt font-bold">Personnel (Réel)</strong> peuvent faire l'objet de retraits.
            </p>
            <p className="text-[10px] text-txt-3 italic">
              Les comptes d'évaluation ne permettent pas de simuler des retraits réels.
            </p>
            <div className="pt-2 flex justify-center gap-2">
              <button
                onClick={() => setModalOpenType(null)}
                className="text-[11px] font-bold uppercase tracking-widest bg-bg border border-border text-txt-2 hover:text-txt px-4 py-2 rounded-xl transition-all"
              >
                Compris
              </button>
              <a
                href="/app/trading"
                className="inline-flex items-center justify-center text-[11px] font-bold uppercase tracking-widest bg-accent hover:bg-accent-2 text-white px-4 py-2 rounded-xl transition-all"
              >
                Gérer mes comptes
              </a>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

// ── Switcher ────────────────────────────────────────────────────────────

const PayoutScopeSwitcher: React.FC<{
  scope: 'all' | string;
  setScope: (s: 'all' | string) => void;
  accounts: any[];
  open: boolean;
  setOpen: (b: boolean) => void;
}> = ({ scope, setScope, accounts, open, setOpen }) => {
  const isAll = scope === 'all';
  const selected = !isAll ? accounts.find((a: any) => a.id === scope) : null;

  React.useEffect(() => {
    if (!open) return;
    const close = () => setOpen(false);
    const t = setTimeout(() => window.addEventListener('click', close), 0);
    return () => { clearTimeout(t); window.removeEventListener('click', close); };
  }, [open, setOpen]);

  return (
    <div className="relative">
      <button
        onClick={e => { e.stopPropagation(); setOpen(!open); }}
        className="flex items-center gap-2 px-3 py-2 glass rounded-xl hover:border-accent/40 transition-colors"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-accent" />
        <div className="text-left">
          <p className="text-[9px] uppercase tracking-widest text-txt-3 leading-none mb-0.5">Compte</p>
          <p className="text-xs font-bold leading-none">
            {isAll
              ? `Tous · ${accounts.length} compte${accounts.length > 1 ? 's' : ''}`
              : (selected?.nom || 'Compte')}
          </p>
        </div>
        <ChevronDown size={12} className={`text-txt-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div
          onClick={e => e.stopPropagation()}
          className="absolute top-full left-0 mt-1 w-[280px] glass rounded-xl shadow-2xl z-50 py-1 max-h-[400px] overflow-y-auto"
        >
          <button
            onClick={() => { setScope('all'); setOpen(false); }}
            className="w-full text-left px-3 py-2 hover:bg-bg/60 transition-colors"
          >
            <p className={`text-xs font-bold ${isAll ? 'text-accent' : ''}`}>Tous les comptes</p>
            <p className="text-[10px] text-txt-3 mono mt-0.5">{accounts.length} compte{accounts.length > 1 ? 's' : ''}</p>
          </button>
          <div className="px-3 py-1.5 text-[9px] uppercase tracking-widest text-txt-3 border-t border-border mt-1 pt-2">
            Par compte
          </div>
          {accounts.map((a: any) => (
            <button
              key={a.id}
              onClick={() => { setScope(a.id); setOpen(false); }}
              className="w-full text-left px-3 py-2 hover:bg-bg/60 transition-colors"
            >
              <p className={`text-xs font-bold truncate ${scope === a.id ? 'text-accent' : ''}`}>
                {a.nom}
              </p>
              <p className="text-[10px] text-txt-3 mono truncate mt-0.5">
                {a.propFirm || '—'} · {a.typeCompte}
              </p>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

// ── Modal nouvelle demande ──────────────────────────────────────────────

const NewPayoutModal: React.FC<{
  accounts: any[];
  defaultAccountId: string;
  onClose: () => void;
  onSubmit: (accountId: string, data: any) => void;
}> = ({ accounts, defaultAccountId, onClose, onSubmit }) => {
  const [accountId, setAccountId] = useState(defaultAccountId);
  const [montant, setMontant] = useState<number>(0);
  const [methode, setMethode] = useState('bank');
  const [reference, setReference] = useState('');
  const [note, setNote] = useState('');
  const [dateDemande, setDateDemande] = useState(new Date().toISOString().slice(0, 10));
  // "déjà reçu" par défaut → confirmé. Sinon → en transit.
  const [recu, setRecu] = useState(true);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountId) return;
    if (!montant || montant <= 0) return;
    onSubmit(accountId, {
      montant: Number(montant),
      methode,
      date_demande: dateDemande,
      reference_ext: reference.trim() || null,
      note: note.trim() || null,
      statut: recu ? 'confirmed' : 'pending',
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md glass rounded-2xl overflow-hidden shadow-2xl">
        <div className="px-5 py-3 border-b border-border/50 flex items-center justify-between">
          <h2 className="text-xs font-bold uppercase tracking-widest">Enregistrer un retrait</h2>
          <button onClick={onClose} className="p-1 text-txt-2 hover:text-txt">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <Field label="Compte (funded ou réel)">
            <select
              value={accountId}
              onChange={e => setAccountId(e.target.value)}
              className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent outline-none"
              required
            >
              <option value="">— Sélectionner un compte —</option>
              {accounts.map((a: any) => {
                const typeLabel = a.typeCompte === 'funded' ? 'Funded' : 'Réel';
                return (
                  <option key={a.id} value={a.id}>
                    {a.nom} · {typeLabel} {a.propFirm ? `(${a.propFirm})` : ''}
                  </option>
                );
              })}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Montant ($)">
              <input
                type="number"
                step="0.01"
                min="0.01"
                required
                value={montant || ''}
                onChange={e => setMontant(parseFloat(e.target.value) || 0)}
                placeholder="500.00"
                className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent outline-none"
              />
            </Field>
            <Field label="Date du retrait">
              <input
                type="date"
                value={dateDemande}
                onChange={e => setDateDemande(e.target.value)}
                className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent outline-none"
              />
            </Field>
          </div>

          <Field label="Méthode">
            <div className="grid grid-cols-5 gap-1.5">
              {METHODES.map(m => {
                const MIcon = m.icon;
                const sel = methode === m.value;
                return (
                  <button
                    key={m.value}
                    type="button"
                    onClick={() => setMethode(m.value)}
                    className={`flex flex-col items-center gap-1 py-2 rounded-lg border text-[9px] font-bold transition-all ${
                      sel
                        ? 'border-accent bg-accent/10 text-accent'
                        : 'border-border bg-bg text-txt-2 hover:text-txt'
                    }`}
                    title={m.label}
                  >
                    <MIcon size={14} />
                    <span className="uppercase tracking-wider">{m.value}</span>
                  </button>
                );
              })}
            </div>
          </Field>

          {/* Statut : déjà reçu OU en transit */}
          <Field label="Statut">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setRecu(true)}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-[11px] font-bold transition-all ${
                  recu
                    ? 'border-win/40 bg-win/10 text-win'
                    : 'border-border bg-bg text-txt-2 hover:text-txt'
                }`}
              >
                <Check size={12} /> Déjà reçu
              </button>
              <button
                type="button"
                onClick={() => setRecu(false)}
                className={`flex items-center justify-center gap-2 py-2 rounded-lg border text-[11px] font-bold transition-all ${
                  !recu
                    ? 'border-accent/40 bg-accent/10 text-accent'
                    : 'border-border bg-bg text-txt-2 hover:text-txt'
                }`}
              >
                <MoreHorizontal size={12} /> En transit
              </button>
            </div>
          </Field>

          <Field label="Référence externe" optional>
            <input
              value={reference}
              onChange={e => setReference(e.target.value)}
              placeholder="TXN-12345, hash…"
              className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent outline-none"
            />
          </Field>

          <Field label="Note" optional>
            <textarea
              rows={2}
              value={note}
              onChange={e => setNote(e.target.value)}
              placeholder="Contexte du retrait…"
              className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent outline-none resize-none"
            />
          </Field>
        </form>

        <div className="px-5 py-3 border-t border-border/50 bg-bg/40 flex justify-end gap-2">
          <button onClick={onClose} className="text-[11px] px-3 py-1.5 rounded mono bg-bg border border-border text-txt-2 hover:text-txt">
            Annuler
          </button>
          <button onClick={submit} className="text-[11px] px-3 py-1.5 rounded mono bg-accent hover:bg-accent-2 text-white font-bold">
            Enregistrer le retrait
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Sous-composants ─────────────────────────────────────────────────────

const Kpi: React.FC<{ label: string; value: string; sub?: string; color?: string }> = ({
  label,
  value,
  sub,
  color,
}) => (
  <div className="glass rounded-2xl p-4">
    <p className="text-[10px] uppercase tracking-widest text-txt-2 mb-1">{label}</p>
    <p className={`text-xl sm:text-2xl font-mono font-bold ${color || 'text-txt'}`}>{value}</p>
    {sub && <p className="text-[10px] mono text-txt-3 mt-0.5">{sub}</p>}
  </div>
);

const Field: React.FC<{ label: string; optional?: boolean; children: React.ReactNode }> = ({
  label,
  optional,
  children,
}) => (
  <div>
    <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-1.5">
      {label}{optional && <span className="ml-1.5 normal-case tracking-normal lowercase font-normal">optionnel</span>}
    </label>
    {children}
  </div>
);

const ProtectedPayoutsPage: React.FC = () => {
  return (
    <FeatureGate 
      feature="hasFinance"
      fallbackTitle="Gestion des Retraits Réservée aux Membres Pro"
      fallbackDesc="Gérez de manière professionnelle l'historique et le suivi de vos retraits (payouts) sur vos comptes réels et funded."
    >
      <PayoutsPage />
    </FeatureGate>
  );
};

export default ProtectedPayoutsPage;
