import React, { useEffect, useState } from 'react';
import { Modal } from '../ui/Modal';
import { useTrades } from '../../hooks/useTrades';
import { useToast } from '../../hooks/useToast';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Props {
  accountId: string;
  isOpen: boolean;
  onClose: () => void;
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const nowTime = () => new Date().toTimeString().slice(0, 5);

const INSTRUMENT_SUGGESTIONS = [
  'EURUSD', 'GBPUSD', 'USDJPY', 'XAUUSD', 'NAS100', 'US30',
  'BTCUSD', 'ETHUSD', 'SPX500',
];

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

export const TradeFormModal: React.FC<Props> = ({ accountId, isOpen, onClose }) => {
  const { createTrade } = useTrades(accountId);
  const { addToast } = useToast();

  const [form, setForm] = useState({
    instrument: '',
    direction: 'long' as 'long' | 'short',
    dateEntree: todayISO(),
    timeEntree: nowTime(),
    dateSortie: '',
    timeSortie: '',
    prix_entree: '' as string,
    prix_sortie: '' as string,
    quantite: 1,
    pl_brut: '' as string,
    commission: '' as string,
    resultat: 'win' as 'win' | 'loss' | 'breakeven',
    setup: '',
    note: '',
    // Analyse technique optionnelle
    analyse_titre: '',
    analyse_contenu: '',
    analyse_type: 'pre-trade' as 'pre-trade' | 'in-trade' | 'post-trade',
    analyse_timeframe: '',
    analyse_biais: '' as '' | 'haussier' | 'baissier' | 'neutre',
    analyse_image_url: '',
  });
  const [showAnalyse, setShowAnalyse] = useState(false);

  // Reset à chaque ouverture
  useEffect(() => {
    if (isOpen) {
      setForm(f => ({
        ...f,
        instrument: '',
        prix_entree: '',
        prix_sortie: '',
        pl_brut: '',
        commission: '',
        setup: '',
        note: '',
        quantite: 1,
        dateEntree: todayISO(),
        timeEntree: nowTime(),
        dateSortie: '',
        timeSortie: '',
        analyse_titre: '',
        analyse_contenu: '',
        analyse_type: 'pre-trade',
        analyse_timeframe: '',
        analyse_biais: '',
        analyse_image_url: '',
      }));
      setShowAnalyse(false);
    }
  }, [isOpen]);

  const setDateQuick = (offsetDays: number) => {
    const d = new Date();
    d.setDate(d.getDate() + offsetDays);
    setForm(f => ({ ...f, dateEntree: d.toISOString().slice(0, 10) }));
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.instrument.trim()) {
      addToast('Instrument requis', 'error');
      return;
    }
    if (!form.dateEntree) {
      addToast('Date d\'entrée requise', 'error');
      return;
    }

    const dateEntreeISO = new Date(
      `${form.dateEntree}T${form.timeEntree || '12:00'}:00`
    ).toISOString();

    const dateSortieISO = form.dateSortie
      ? new Date(`${form.dateSortie}T${form.timeSortie || form.timeEntree || '12:00'}:00`).toISOString()
      : null;

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
      payload.pl_brut = Number(form.pl_brut);
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

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouveau trade"
      size="lg"
      footer={
        <div className="flex gap-2 justify-end">
          <button onClick={onClose} className="btn-ghost text-xs px-3 py-2 rounded-lg">
            Annuler
          </button>
          <button
            onClick={submit}
            disabled={createTrade.isPending}
            className="btn-primary text-xs px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {createTrade.isPending ? 'Création…' : 'Créer le trade'}
          </button>
        </div>
      }
    >
      <form onSubmit={submit} className="space-y-4">
        {/* INSTRUMENT + DIRECTION */}
        <div className="grid grid-cols-3 gap-3">
          <div className="col-span-2">
            <FormField label="Instrument">
              <input
                required
                list="instrument-list"
                value={form.instrument}
                onChange={e => setForm({ ...form, instrument: e.target.value })}
                placeholder="EURUSD, XAUUSD, NAS100…"
                className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-sm mono uppercase focus:border-accent/50 outline-none"
                autoFocus
              />
              <datalist id="instrument-list">
                {INSTRUMENT_SUGGESTIONS.map(s => <option key={s} value={s} />)}
              </datalist>
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

        {/* DATE ENTRÉE + RACCOURCIS */}
        <div className="grid grid-cols-3 gap-3 items-end">
          <div className="col-span-2">
            <FormField label="Date d'entrée">
              <div className="flex gap-2">
                <input
                  type="date"
                  required
                  value={form.dateEntree}
                  onChange={e => setForm({ ...form, dateEntree: e.target.value })}
                  className="flex-1 bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
                />
                <input
                  type="time"
                  value={form.timeEntree}
                  onChange={e => setForm({ ...form, timeEntree: e.target.value })}
                  className="w-24 bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
                />
              </div>
            </FormField>
          </div>
          <div>
            <div className="flex gap-1 flex-wrap">
              <button
                type="button"
                onClick={() => setDateQuick(0)}
                className="filter-pill"
                style={{ fontSize: 10 }}
              >
                Aujourd'hui
              </button>
              <button
                type="button"
                onClick={() => setDateQuick(-1)}
                className="filter-pill"
                style={{ fontSize: 10 }}
              >
                Hier
              </button>
            </div>
          </div>
        </div>

        {/* DATE SORTIE */}
        <FormField label="Date de sortie" optional>
          <div className="flex gap-2">
            <input
              type="date"
              value={form.dateSortie}
              onChange={e => setForm({ ...form, dateSortie: e.target.value })}
              className="flex-1 bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
            />
            <input
              type="time"
              value={form.timeSortie}
              onChange={e => setForm({ ...form, timeSortie: e.target.value })}
              className="w-24 bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
            />
            {form.dateSortie && (
              <button
                type="button"
                onClick={() => setForm({ ...form, dateSortie: '', timeSortie: '' })}
                className="text-[10px] text-txt-3 hover:text-loss px-2"
                title="Vider"
              >
                Effacer
              </button>
            )}
          </div>
        </FormField>

        {/* PRIX */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Prix d'entrée" optional>
            <input
              type="number"
              step="any"
              value={form.prix_entree}
              onChange={e => setForm({ ...form, prix_entree: e.target.value })}
              placeholder="1.08240"
              className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
            />
          </FormField>
          <FormField label="Prix de sortie" optional>
            <input
              type="number"
              step="any"
              value={form.prix_sortie}
              onChange={e => setForm({ ...form, prix_sortie: e.target.value })}
              placeholder="1.08512"
              className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
            />
          </FormField>
        </div>

        {/* QUANTITÉ + RÉSULTAT */}
        <div className="grid grid-cols-2 gap-3">
          <FormField label="Quantité (lots)">
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
              placeholder="0.00"
              className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
            />
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

        {/* ANALYSE TECHNIQUE OPTIONNELLE */}
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

              <FormField label="URL screenshot" optional>
                <input
                  value={form.analyse_image_url}
                  onChange={e => setForm({ ...form, analyse_image_url: e.target.value })}
                  placeholder="https://… (lien TradingView, Imgur, etc.)"
                  className="w-full bg-bg border border-border rounded-lg py-2 px-3 text-xs mono focus:border-accent/50 outline-none"
                />
              </FormField>
            </div>
          )}
        </div>
      </form>
    </Modal>
  );
};
