import React, { useEffect, useMemo, useRef, useState } from 'react';
import DatePicker, { registerLocale } from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { fr } from 'date-fns/locale';
import { ImageUpload } from '../ui/ImageUpload';
import { Modal } from '../ui/Modal';
import chartUpIcon from '../../assets/animations/1f4c8.json';
import { useTrades } from '../../hooks/useTrades';
import { useToast } from '../../hooks/useToast';
import {
  TrendingUp, TrendingDown, Search,
  DollarSign, BarChart3, Gem, Bitcoin, LineChart, Activity, Fuel, Landmark,
  type LucideIcon,
} from 'lucide-react';

registerLocale('fr', fr);

interface Props {
  accountId: string;
  isOpen: boolean;
  onClose: () => void;
  /** Si fourni, le modal passe en mode "édition" au lieu de "création" */
  initialTrade?: any;
}

/** Convertit une ISO string backend en Date (ou null si vide). */
const isoToDate = (iso?: string | null): Date | null => {
  if (!iso) return null;
  const d = new Date(iso);
  return isNaN(d.getTime()) ? null : d;
};

type InstrumentGroup = {
  label: string;
  Icon: LucideIcon;
  /** Couleur tailwind text-* pour l'icône & le badge */
  accent: string;
  symbols: Array<{ symbol: string; name: string }>;
};

const INSTRUMENT_GROUPS: InstrumentGroup[] = [
  {
    label: 'Forex',
    Icon: DollarSign,
    accent: 'text-blue-400',
    symbols: [
      { symbol: 'EURUSD', name: 'Euro / Dollar' },
      { symbol: 'GBPUSD', name: 'Livre / Dollar' },
      { symbol: 'USDJPY', name: 'Dollar / Yen' },
      { symbol: 'USDCAD', name: 'Dollar / Dollar canadien' },
      { symbol: 'AUDUSD', name: 'Dollar australien / Dollar' },
      { symbol: 'USDCHF', name: 'Dollar / Franc suisse' },
      { symbol: 'NZDUSD', name: 'Dollar NZ / Dollar' },
    ],
  },
  {
    label: 'Indices CFD',
    Icon: BarChart3,
    accent: 'text-accent',
    symbols: [
      { symbol: 'NAS100', name: 'Nasdaq 100' },
      { symbol: 'US30', name: 'Dow Jones' },
      { symbol: 'SPX500', name: 'S&P 500' },
      { symbol: 'GER40', name: 'DAX 40' },
      { symbol: 'UK100', name: 'FTSE 100' },
    ],
  },
  {
    label: 'Métaux & énergie',
    Icon: Gem,
    accent: 'text-amber-400',
    symbols: [
      { symbol: 'XAUUSD', name: 'Or' },
      { symbol: 'XAGUSD', name: 'Argent' },
      { symbol: 'WTI', name: 'Pétrole WTI' },
      { symbol: 'BRENT', name: 'Pétrole Brent' },
    ],
  },
  {
    label: 'Crypto',
    Icon: Bitcoin,
    accent: 'text-orange-400',
    symbols: [
      { symbol: 'BTCUSD', name: 'Bitcoin' },
      { symbol: 'ETHUSD', name: 'Ethereum' },
      { symbol: 'SOLUSD', name: 'Solana' },
    ],
  },
  {
    label: 'Futures E-mini (CME)',
    Icon: LineChart,
    accent: 'text-emerald-400',
    symbols: [
      { symbol: 'ES', name: 'E-mini S&P 500' },
      { symbol: 'NQ', name: 'E-mini Nasdaq 100' },
      { symbol: 'YM', name: 'E-mini Dow' },
      { symbol: 'RTY', name: 'E-mini Russell 2000' },
    ],
  },
  {
    label: 'Futures Micros (CME)',
    Icon: Activity,
    accent: 'text-teal-400',
    symbols: [
      { symbol: 'MES', name: 'Micro S&P 500' },
      { symbol: 'MNQ', name: 'Micro Nasdaq 100' },
      { symbol: 'MYM', name: 'Micro Dow' },
      { symbol: 'M2K', name: 'Micro Russell 2000' },
    ],
  },
  {
    label: 'Futures matières premières',
    Icon: Fuel,
    accent: 'text-red-400',
    symbols: [
      { symbol: 'CL', name: 'Crude Oil' },
      { symbol: 'MCL', name: 'Micro Crude Oil' },
      { symbol: 'NG', name: 'Natural Gas' },
      { symbol: 'GC', name: 'Gold' },
      { symbol: 'MGC', name: 'Micro Gold' },
      { symbol: 'SI', name: 'Silver' },
      { symbol: 'SIL', name: 'Micro Silver' },
    ],
  },
  {
    label: 'Futures obligations',
    Icon: Landmark,
    accent: 'text-purple-400',
    symbols: [
      { symbol: 'ZB', name: '30Y T-Bond' },
      { symbol: 'ZN', name: '10Y T-Note' },
      { symbol: 'ZF', name: '5Y T-Note' },
      { symbol: 'ZT', name: '2Y T-Note' },
    ],
  },
];

/* Dropdown custom — remplace <datalist> natif, thème dark cohérent */
const InstrumentPicker: React.FC<{
  value: string;
  onChange: (v: string) => void;
}> = ({ value, onChange }) => {
  const [open, setOpen] = useState(false);
  const [highlight, setHighlight] = useState(0);
  const wrapRef = useRef<HTMLDivElement>(null);

  // Liste filtrée à plat avec leur groupe parent (pour les headers)
  const filtered = useMemo(() => {
    const q = value.trim().toUpperCase();
    type Row =
      | { kind: 'header'; group: InstrumentGroup }
      | { kind: 'item'; group: InstrumentGroup; symbol: string; name: string };
    const rows: Row[] = [];
    INSTRUMENT_GROUPS.forEach(g => {
      const matches = g.symbols.filter(s =>
        !q ||
        s.symbol.includes(q) ||
        s.name.toUpperCase().includes(q)
      );
      if (matches.length === 0) return;
      rows.push({ kind: 'header', group: g });
      matches.forEach(m => rows.push({ kind: 'item', group: g, symbol: m.symbol, name: m.name }));
    });
    return rows;
  }, [value]);

  // Indices des items réellement sélectionnables (skip headers)
  const itemIndices = useMemo(
    () => filtered.flatMap((r, i) => (r.kind === 'item' ? [i] : [])),
    [filtered]
  );

  // Fermeture au clic extérieur
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  // Reset highlight quand la liste change
  useEffect(() => { setHighlight(0); }, [value]);

  const selectAt = (rowIdx: number) => {
    const row = filtered[rowIdx];
    if (row && row.kind === 'item') {
      onChange(row.symbol);
      setOpen(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!open && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setOpen(true);
      e.preventDefault();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      const pos = itemIndices.indexOf(highlight);
      const next = pos < 0 || pos >= itemIndices.length - 1 ? itemIndices[0] : itemIndices[pos + 1];
      if (next !== undefined) setHighlight(next);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const pos = itemIndices.indexOf(highlight);
      const prev = pos <= 0 ? itemIndices[itemIndices.length - 1] : itemIndices[pos - 1];
      if (prev !== undefined) setHighlight(prev);
    } else if (e.key === 'Enter') {
      if (open && itemIndices.length > 0) {
        e.preventDefault();
        selectAt(highlight);
      }
    } else if (e.key === 'Escape') {
      setOpen(false);
    }
  };

  // Trouve la catégorie du symbol courant (pour le badge à côté de l'input)
  const currentMatch = useMemo(() => {
    const v = value.trim().toUpperCase();
    for (const g of INSTRUMENT_GROUPS) {
      const m = g.symbols.find(s => s.symbol === v);
      if (m) return { group: g, name: m.name };
    }
    return null;
  }, [value]);

  return (
    <div className="relative" ref={wrapRef}>
      <div className="relative">
        <input
          required
          value={value}
          onChange={e => { onChange(e.target.value.toUpperCase()); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onKeyDown={onKeyDown}
          placeholder="EURUSD, NQ, MES…"
          autoFocus
          autoComplete="off"
          spellCheck={false}
          className="w-full bg-bg border border-border rounded-lg py-2 pl-9 pr-3 text-sm mono uppercase focus:border-accent/50 outline-none"
        />
        <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-txt-3 pointer-events-none" />
        {currentMatch && (
          <span className={`absolute right-2 top-1/2 -translate-y-1/2 text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-elevated ${currentMatch.group.accent}`}>
            {currentMatch.group.label}
          </span>
        )}
      </div>

      {open && (
        <div
          className="absolute z-50 left-0 right-0 mt-1.5 max-h-[280px] overflow-y-auto rounded-xl border border-border bg-elevated shadow-2xl shadow-black/40"
        >
          {filtered.length === 0 ? (
            <div className="px-3 py-4 text-center text-[11px] text-txt-3">
              Pas de correspondance — appuie sur <span className="text-txt-2 mono">Entrée</span> pour utiliser « {value} »
            </div>
          ) : (
            filtered.map((row, i) =>
              row.kind === 'header' ? (
                <div
                  key={`h-${i}`}
                  className="px-3 pt-2.5 pb-1 sticky top-0 bg-elevated/95 backdrop-blur-sm flex items-center gap-1.5 text-[9px] font-bold uppercase tracking-widest text-txt-3 border-b border-border/60"
                >
                  <row.group.Icon size={10} className={row.group.accent} />
                  {row.group.label}
                </div>
              ) : (
                <button
                  key={`i-${i}`}
                  type="button"
                  onMouseDown={e => { e.preventDefault(); selectAt(i); }}
                  onMouseEnter={() => setHighlight(i)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-1.5 text-left transition-colors ${
                    highlight === i ? 'bg-bg/70' : 'hover:bg-bg/40'
                  }`}
                >
                  <span className="font-mono text-[12px] font-bold tracking-wide text-txt">
                    {row.symbol}
                  </span>
                  <span className="text-[10px] text-txt-3 truncate">{row.name}</span>
                </button>
              )
            )
          )}
        </div>
      )}
    </div>
  );
};

const SETUP_SUGGESTIONS = [
  'London Breakout', 'NY Reversal', 'Pullback Trend', 'Range Fade',
  'Asian Range', 'News Trade', 'Liquidity Grab',
];

const FormField: React.FC<{
  label: string;
  optional?: boolean;
  children: React.ReactNode;
}> = ({ label, optional, children }) => (
  <div>
    <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-1.5">
      {label}
      {optional && <span className="ml-1.5 text-txt-3 normal-case tracking-normal lowercase">· optionnel</span>}
    </label>
    {children}
  </div>
);

export const TradeFormModal: React.FC<Props> = ({ accountId, isOpen, onClose, initialTrade }) => {
  const { createTrade, updateTrade } = useTrades(accountId);
  const { addToast } = useToast();

  const isEditMode = !!initialTrade;

  const buildInitialForm = (trade?: any) => ({
    instrument: trade?.instrument || '',
    direction: (trade?.direction === 'sell' ? 'short' : trade?.direction === 'buy' ? 'long' : trade?.direction) || 'long' as 'long' | 'short',
    datetimeEntree: (trade ? isoToDate(trade.dateEntree) : new Date()) as Date | null,
    datetimeSortie: (trade ? isoToDate(trade.dateSortie) : null) as Date | null,
    prix_entree: trade?.prixEntree !== null && trade?.prixEntree !== undefined ? String(trade.prixEntree) : '' as string,
    prix_sortie: trade?.prixSortie !== null && trade?.prixSortie !== undefined ? String(trade.prixSortie) : '' as string,
    quantite: trade?.quantite ?? 1,
    pl_brut: trade?.plBrut !== null && trade?.plBrut !== undefined ? String(trade.plBrut) : '' as string,
    commission: trade?.commission !== null && trade?.commission !== undefined ? String(trade.commission) : '' as string,
    resultat: trade?.resultat || 'win' as 'win' | 'loss' | 'breakeven',
    setup: trade?.setup || '',
    note: trade?.note || '',
    // Analyse technique optionnelle (uniquement à la création)
    analyse_titre: '',
    analyse_contenu: '',
    analyse_type: 'pre-trade' as 'pre-trade' | 'in-trade' | 'post-trade',
    analyse_timeframe: '',
    analyse_biais: '' as '' | 'haussier' | 'baissier' | 'neutre',
    analyse_image_url: '',
  });

  const [form, setForm] = useState(buildInitialForm());
  const [showAnalyse, setShowAnalyse] = useState(false);

  // Reset à chaque ouverture — pré-rempli en mode édition
  useEffect(() => {
    if (isOpen) {
      setForm(buildInitialForm(initialTrade));
      setShowAnalyse(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, initialTrade]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.instrument.trim()) {
      addToast('Instrument requis', 'error');
      return;
    }
    if (!form.datetimeEntree) {
      addToast('Date d\'entrée requise', 'error');
      return;
    }

    const dateEntreeISO = form.datetimeEntree.toISOString();
    const dateSortieISO = form.datetimeSortie ? form.datetimeSortie.toISOString() : null;

    if (isEditMode) {
      // — Mode ÉDITION — on utilise les clés snake_case que le backend attend
      const patch: any = {
        instrument: form.instrument.trim().toUpperCase(),
        direction: form.direction,
        date_entree: dateEntreeISO,
        date_sortie: dateSortieISO,
        quantite: Number(form.quantite),
        resultat: form.resultat,
        setup: form.setup.trim() || null,
        note: form.note.trim() || null,
      };
      if (form.prix_entree !== '' && !isNaN(Number(form.prix_entree))) {
        patch.prix_entree = Number(form.prix_entree);
      }
      if (form.prix_sortie !== '' && !isNaN(Number(form.prix_sortie))) {
        patch.prix_sortie = Number(form.prix_sortie);
      }
      if (form.pl_brut !== '' && !isNaN(Number(form.pl_brut))) {
        // Le signe est forcé par le résultat : loss → négatif, win → positif, BE → 0
        const abs = Math.abs(Number(form.pl_brut));
        patch.pl_brut = form.resultat === 'loss' ? -abs
          : form.resultat === 'breakeven' ? 0
          : abs;
      }
      if (form.commission !== '' && !isNaN(Number(form.commission))) {
        patch.commission = Number(form.commission);
      }

      try {
        await updateTrade.mutateAsync({ tradeId: initialTrade.id, patch });
        addToast('Trade modifié ✓');
        onClose();
      } catch (err: any) {
        const msg = err?.response?.data?.errors?.join(' · ') || 'Erreur modification trade';
        addToast(msg, 'error');
      }
      return;
    }

    // — Mode CRÉATION —
    const payload: any = {
      instrument: form.instrument.trim().toUpperCase(),
      direction: form.direction,
      date_entree: dateEntreeISO,
      date_sortie: dateSortieISO,
      quantite: Number(form.quantite),
      resultat: form.resultat,
      setup: form.setup.trim() || null,
      note: form.note.trim() || null,
    };

    // Champs numériques optionnels — n'envoyer que si renseignés
    if (form.prix_entree !== '' && !isNaN(Number(form.prix_entree))) {
      payload.prix_entree = Number(form.prix_entree);
    }
    if (form.prix_sortie !== '' && !isNaN(Number(form.prix_sortie))) {
      payload.prix_sortie = Number(form.prix_sortie);
    }
    if (form.pl_brut !== '' && !isNaN(Number(form.pl_brut))) {
      // Le signe est forcé par le résultat : loss → négatif, win → positif, BE → 0
      const abs = Math.abs(Number(form.pl_brut));
      payload.pl_brut = form.resultat === 'loss' ? -abs
        : form.resultat === 'breakeven' ? 0
        : abs;
    }
    if (form.commission !== '' && !isNaN(Number(form.commission))) {
      payload.commission = Number(form.commission);
    }

    // Analyse technique inline si présente
    if (showAnalyse && (form.analyse_titre.trim() || form.analyse_contenu.trim())) {
      payload.analyse_titre = form.analyse_titre.trim() || null;
      payload.analyse_contenu = form.analyse_contenu.trim() || null;
      payload.analyse_type = form.analyse_type;
      payload.analyse_timeframe = form.analyse_timeframe.trim() || null;
      payload.analyse_biais = form.analyse_biais || null;
      payload.analyse_image_url = form.analyse_image_url.trim() || null;
    }

    try {
      await createTrade.mutateAsync(payload);
      addToast('Trade ajouté ✓');
      onClose();
    } catch (err: any) {
      const msg = err?.response?.data?.errors?.join(' · ') || 'Erreur création trade';
      addToast(msg, 'error');
    }
  };

  const isPending = isEditMode ? updateTrade.isPending : createTrade.isPending;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={isEditMode ? `Modifier — ${initialTrade?.instrument || 'Trade'}` : 'Nouveau trade'}
      size="lg"
      animationData={chartUpIcon}
      footer={
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-ghost text-xs px-3 py-2 rounded-lg">
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={isPending}
            className="btn-primary text-xs px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {isPending
              ? (isEditMode ? 'Enregistrement…' : 'Création…')
              : (isEditMode ? 'Enregistrer les modifications' : 'Créer le trade')}
          </button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {/* INSTRUMENT + DIRECTION */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <FormField label="Instrument">
              <InstrumentPicker
                value={form.instrument}
                onChange={(v) => setForm({ ...form, instrument: v })}
              />
            </FormField>
          </div>

          <FormField label="Direction">
            <div className="grid grid-cols-2 gap-1.5">
              <button
                type="button"
                onClick={() => setForm({ ...form, direction: 'long' })}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  form.direction === 'long'
                    ? 'bg-win/15 text-win border border-win/30'
                    : 'bg-bg border border-border text-txt-2 hover:text-txt'
                }`}
              >
                <TrendingUp size={12} /> Long
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, direction: 'short' })}
                className={`py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-all ${
                  form.direction === 'short'
                    ? 'bg-loss/15 text-loss border border-loss/30'
                    : 'bg-bg border border-border text-txt-2 hover:text-txt'
                }`}
              >
                <TrendingDown size={12} /> Short
              </button>
            </div>
          </FormField>
        </div>

        {/* DATE & HEURE D'ENTRÉE */}
        <FormField label="Date & heure d'entrée">
          <DatePicker
            selected={form.datetimeEntree}
            onChange={(date: Date | null) => setForm({ ...form, datetimeEntree: date })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy · HH:mm"
            locale="fr"
            timeCaption="Heure"
            required
            className="legacy-datepicker-input"
            popperPlacement="bottom-start"
            showPopperArrow={false}
          />
        </FormField>

        {/* DATE & HEURE DE SORTIE */}
        <FormField label="Date & heure de sortie" optional>
          <DatePicker
            selected={form.datetimeSortie}
            onChange={(date: Date | null) => setForm({ ...form, datetimeSortie: date })}
            showTimeSelect
            timeFormat="HH:mm"
            timeIntervals={15}
            dateFormat="dd/MM/yyyy · HH:mm"
            locale="fr"
            timeCaption="Heure"
            minDate={form.datetimeEntree || undefined}
            placeholderText="jj/mm/aaaa · hh:mm"
            isClearable
            className="legacy-datepicker-input"
            popperPlacement="bottom-start"
            showPopperArrow={false}
          />
        </FormField>

        {/* PRIX — champs masqués (valeurs préservées côté backend en mode édition) */}

        {/* QUANTITÉ + RÉSULTAT */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Quantité (lot ou contrat)">
            <input
              type="number"
              step="0.01"
              required
              value={form.quantite}
              onChange={e => setForm({ ...form, quantite: parseFloat(e.target.value) || 0 })}
              className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
            />
          </FormField>

          <FormField label="Résultat">
            <div className="grid grid-cols-3 gap-1.5">
              {(['win', 'breakeven', 'loss'] as const).map(r => {
                const sel = form.resultat === r;
                const cls = r === 'win'
                  ? sel ? 'bg-win/15 text-win border-win/30' : 'border-border text-txt-2'
                  : r === 'loss'
                  ? sel ? 'bg-loss/15 text-loss border-loss/30' : 'border-border text-txt-2'
                  : sel ? 'bg-elevated text-txt border-border' : 'border-border text-txt-2';
                return (
                  <button
                    key={r}
                    type="button"
                    onClick={() => setForm({ ...form, resultat: r })}
                    className={`py-2 rounded-lg text-[11px] font-bold border transition-all ${cls}`}
                  >
                    {r === 'breakeven' ? 'BE' : r === 'win' ? 'Win' : 'Loss'}
                  </button>
                );
              })}
            </div>
          </FormField>
        </div>

        {/* P&L + COMMISSION */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="P&L brut ($)" optional>
            <input
              type="number"
              step="0.01"
              value={form.pl_brut}
              onChange={e => setForm({ ...form, pl_brut: e.target.value })}
              placeholder="Montant (signe auto selon résultat)"
              className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
            />
            <p className="mt-1 text-[10px] text-txt-3 leading-snug">
              Pas besoin du signe « − » : si Loss est sélectionné, le montant est compté en perte automatiquement.
            </p>
          </FormField>
          <FormField label="Commission ($)" optional>
            <input
              type="number"
              step="0.01"
              value={form.commission}
              onChange={e => setForm({ ...form, commission: e.target.value })}
              placeholder="0.00"
              className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
            />
          </FormField>
        </div>

        {/* SETUP */}
        <FormField label="Setup / Playbook" optional>
          <input
            list="setup-list"
            value={form.setup}
            onChange={e => setForm({ ...form, setup: e.target.value })}
            placeholder="London Breakout, NY Reversal…"
            className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent/50 outline-none"
          />
          <datalist id="setup-list">
            {SETUP_SUGGESTIONS.map(s => <option key={s} value={s} />)}
          </datalist>
        </FormField>

        {/* NOTE */}
        <FormField label="Note" optional>
          <textarea
            rows={2}
            value={form.note}
            onChange={e => setForm({ ...form, note: e.target.value })}
            placeholder="Contexte, raisonnement, leçons…"
            className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent/50 outline-none resize-none"
          />
        </FormField>

        {/* ANALYSE TECHNIQUE OPTIONNELLE — uniquement en mode création */}
        {!isEditMode && (
          <div className="pt-3 border-t border-border">
            <button
              type="button"
              onClick={() => setShowAnalyse(!showAnalyse)}
              className="w-full flex items-center justify-between text-[11px] font-bold uppercase tracking-widest text-txt-2 hover:text-txt"
            >
              <span>+ Joindre une analyse technique</span>
              <span className="text-txt-3">{showAnalyse ? '−' : '+'}</span>
            </button>

            {showAnalyse && (
              <div className="mt-3 space-y-3 p-3 bg-bg/40 rounded-lg border border-border">
                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Titre de l'analyse" optional>
                    <input
                      value={form.analyse_titre}
                      onChange={e => setForm({ ...form, analyse_titre: e.target.value })}
                      placeholder="Setup London Breakout EURUSD"
                      className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent/50 outline-none"
                    />
                  </FormField>
                  <FormField label="Type" optional>
                    <select
                      value={form.analyse_type}
                      onChange={e => setForm({ ...form, analyse_type: e.target.value as any })}
                      className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent/50 outline-none"
                    >
                      <option value="pre-trade">Pré-trade</option>
                      <option value="in-trade">En cours</option>
                      <option value="post-trade">Post-trade</option>
                    </select>
                  </FormField>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <FormField label="Timeframe" optional>
                    <input
                      value={form.analyse_timeframe}
                      onChange={e => setForm({ ...form, analyse_timeframe: e.target.value })}
                      placeholder="H1, M15, D1…"
                      className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
                    />
                  </FormField>
                  <FormField label="Biais" optional>
                    <div className="grid grid-cols-3 gap-1">
                      {(['haussier', 'neutre', 'baissier'] as const).map(b => (
                        <button
                          key={b}
                          type="button"
                          onClick={() => setForm({ ...form, analyse_biais: form.analyse_biais === b ? '' : b })}
                          className={`py-2 rounded-lg text-[10px] font-bold uppercase tracking-wider border transition-colors ${
                            form.analyse_biais === b
                              ? b === 'haussier' ? 'border-win/40 bg-win/10 text-win'
                                : b === 'baissier' ? 'border-loss/40 bg-loss/10 text-loss'
                                : 'border-accent/40 bg-accent/10 text-accent'
                              : 'border-border bg-bg text-txt-2 hover:text-txt'
                          }`}
                        >
                          {b === 'haussier' ? '↑' : b === 'baissier' ? '↓' : '→'} {b.charAt(0).toUpperCase()}
                        </button>
                      ))}
                    </div>
                  </FormField>
                </div>

                <FormField label="Contenu / Plan de trade" optional>
                  <textarea
                    rows={4}
                    value={form.analyse_contenu}
                    onChange={e => setForm({ ...form, analyse_contenu: e.target.value })}
                    placeholder="Niveaux clés, zone d'entrée, SL/TP, scénarios…"
                    className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs focus:border-accent/50 outline-none resize-none leading-relaxed"
                  />
                </FormField>

                <ImageUpload 
                  label="Screenshot de l'analyse (optionnel)"
                  value={form.analyse_image_url || ''}
                  onChange={url => setForm({ ...form, analyse_image_url: url })}
                />
              </div>
            )}
          </div>
        )}
      </form>
    </Modal>
  );
};
