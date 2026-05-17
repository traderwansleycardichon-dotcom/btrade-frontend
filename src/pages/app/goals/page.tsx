import React, { useMemo, useState } from 'react';
import { Target, Plus, Trash2, Pencil, X, Check } from 'lucide-react';
import { useObjectifs, Objectif } from '../../../hooks/useFinance';
import { useToast } from '../../../hooks/useToast';

const num = (v: any) => Number(v ?? 0);
const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 0 });

const COLORS = ['#F36C00', '#10B981', '#3B82F6', '#8B5CF6', '#EC4899', '#06B6D4', '#EAB308', '#EF4444'];

const GoalsPage: React.FC = () => {
  const { objectifs, isLoading, create, update, updateMontant, remove } = useObjectifs();
  const { addToast } = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Objectif | null>(null);

  const stats = useMemo(() => {
    const total = objectifs.length;
    const completed = objectifs.filter(o => o.completed).length;
    const totalCible = objectifs.reduce((s, o) => s + num(o.montantCible), 0);
    const totalActuel = objectifs.reduce((s, o) => s + num(o.montantActuel), 0);
    return { total, completed, totalCible, totalActuel, pct: totalCible > 0 ? (totalActuel / totalCible) * 100 : 0 };
  }, [objectifs]);

  const openCreate = () => { setEditing(null); setModalOpen(true); };
  const openEdit = (o: Objectif) => { setEditing(o); setModalOpen(true); };

  const onDelete = async (o: Objectif) => {
    if (!confirm(`Supprimer "${o.nom}" ?`)) return;
    try { await remove.mutateAsync(o.id); addToast('Supprimé'); }
    catch { addToast('Erreur', 'error'); }
  };

  return (
    <div className="space-y-4 animate-[fadeIn_0.4s_ease-out]">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-bold text-sm uppercase tracking-widest flex items-center gap-2">
          <Target size={14} className="text-accent" /> Objectifs financiers
        </h2>
        <button
          onClick={openCreate}
          className="text-[11px] px-3 py-1.5 rounded mono bg-accent hover:bg-accent-2 text-white font-bold flex items-center gap-1.5"
        >
          <Plus size={12} /> Nouvel objectif
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Kpi label="Objectifs" value={isLoading ? '—' : stats.total.toString()} />
        <Kpi label="Atteints" value={stats.completed.toString()} color="text-win" />
        <Kpi label="Total cible" value={`$${fmt(stats.totalCible)}`} />
        <Kpi
          label="Progression"
          value={stats.totalCible > 0 ? `${stats.pct.toFixed(0)}%` : '—'}
          color={stats.pct >= 50 ? 'text-win' : 'text-accent'}
        />
      </div>

      {isLoading ? (
        <div className="surface rounded-lg p-10 text-center text-[11px] text-txt-3">Chargement…</div>
      ) : objectifs.length === 0 ? (
        <div className="surface rounded-lg px-5 py-14 text-center">
          <Target size={28} className="mx-auto text-txt-3 mb-3" />
          <p className="text-xs font-bold mb-1">Aucun objectif</p>
          <p className="text-[10px] text-txt-3 mb-4">Définis un cap clair : montant cible + date limite.</p>
          <button onClick={openCreate} className="text-[11px] font-bold uppercase tracking-widest bg-accent text-white px-3 py-1.5 rounded inline-flex items-center gap-1.5">
            <Plus size={12} /> Mon premier objectif
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {objectifs.map(o => {
            const cible = num(o.montantCible);
            const actuel = num(o.montantActuel);
            const pct = cible > 0 ? Math.min((actuel / cible) * 100, 100) : 0;
            const color = o.couleur || '#F36C00';
            const dateCible = o.dateCible ? new Date(o.dateCible) : null;
            const daysLeft = dateCible
              ? Math.ceil((dateCible.getTime() - Date.now()) / (24 * 3600 * 1000))
              : null;
            return (
              <div key={o.id} className="surface rounded-lg p-4 group relative overflow-hidden">
                <div
                  className="absolute -top-8 -right-8 w-24 h-24 rounded-full opacity-15"
                  style={{ background: color }}
                />
                <div className="relative">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-sm truncate flex items-center gap-2">
                        {o.completed && <Check size={12} className="text-win flex-shrink-0" />}
                        {o.nom || 'Sans titre'}
                      </h3>
                      {dateCible && (
                        <p className="text-[10px] text-txt-3 mt-0.5">
                          Limite {dateCible.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' })}
                          {daysLeft !== null && daysLeft >= 0 && (
                            <span className="ml-1.5 text-accent">· {daysLeft}j</span>
                          )}
                          {daysLeft !== null && daysLeft < 0 && (
                            <span className="ml-1.5 text-loss">· dépassée</span>
                          )}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => openEdit(o)} className="p-1 text-txt-2 hover:text-accent" title="Modifier">
                        <Pencil size={11} />
                      </button>
                      <button onClick={() => onDelete(o)} className="p-1 text-txt-2 hover:text-loss" title="Supprimer">
                        <Trash2 size={11} />
                      </button>
                    </div>
                  </div>

                  <div className="flex items-baseline justify-between mb-1.5">
                    <span className="text-lg font-mono font-black" style={{ color }}>
                      ${fmt(actuel)}
                    </span>
                    <span className="text-[11px] mono text-txt-3">
                      / ${fmt(cible)}
                    </span>
                  </div>

                  <div className="h-2 rounded-full overflow-hidden bg-bg/60 mb-2">
                    <div
                      className="h-2 rounded-full transition-all"
                      style={{ width: `${pct}%`, background: color }}
                    />
                  </div>

                  <div className="flex items-center justify-between text-[10px]">
                    <span className="mono font-bold" style={{ color }}>{pct.toFixed(0)}%</span>
                    <QuickIncrement
                      onAdd={amount => updateMontant.mutate({ id: o.id, montant: actuel + amount })}
                      onSub={amount => updateMontant.mutate({ id: o.id, montant: Math.max(0, actuel - amount) })}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modalOpen && (
        <ObjectifModal
          objectif={editing}
          onClose={() => setModalOpen(false)}
          onSubmit={async data => {
            try {
              if (editing) await update.mutateAsync({ id: editing.id, patch: data });
              else await create.mutateAsync(data);
              addToast(editing ? 'Objectif mis à jour' : 'Objectif créé');
              setModalOpen(false);
            } catch (e: any) {
              addToast('Erreur : ' + (e?.response?.data?.error || 'requête échouée'), 'error');
            }
          }}
        />
      )}
    </div>
  );
};

const QuickIncrement: React.FC<{ onAdd: (v: number) => void; onSub: (v: number) => void }> = ({ onAdd, onSub }) => {
  const [v, setV] = useState(100);
  return (
    <div className="flex items-center gap-1">
      <button onClick={() => onSub(v)} className="w-5 h-5 rounded bg-bg border border-border text-txt-3 hover:text-loss flex items-center justify-center text-[10px]">−</button>
      <input
        type="number"
        value={v}
        onChange={e => setV(parseFloat(e.target.value) || 0)}
        className="w-14 bg-bg border border-border rounded py-0.5 px-1 text-[10px] mono text-center focus:border-accent outline-none"
      />
      <button onClick={() => onAdd(v)} className="w-5 h-5 rounded bg-bg border border-border text-txt-3 hover:text-accent flex items-center justify-center text-[10px]">+</button>
    </div>
  );
};

const ObjectifModal: React.FC<{
  objectif: Objectif | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ objectif, onClose, onSubmit }) => {
  const [form, setForm] = useState({
    nom: objectif?.nom || '',
    montant_cible: num(objectif?.montantCible),
    montant_actuel: num(objectif?.montantActuel),
    date_cible: objectif?.dateCible ? new Date(objectif.dateCible).toISOString().slice(0, 10) : '',
    couleur: objectif?.couleur || COLORS[0],
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) return;
    onSubmit({
      nom: form.nom.trim(),
      montant_cible: form.montant_cible || null,
      montant_actuel: form.montant_actuel || 0,
      date_cible: form.date_cible || null,
      couleur: form.couleur,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-md surface rounded-lg overflow-hidden shadow-2xl">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between" style={{ background: form.couleur, color: '#fff' }}>
          <h2 className="text-xs font-bold uppercase tracking-widest">
            {objectif ? "Modifier l'objectif" : 'Nouvel objectif'}
          </h2>
          <button onClick={onClose} className="p-1 text-white/80 hover:text-white">
            <X size={14} />
          </button>
        </div>
        <form onSubmit={submit} className="p-5 space-y-3">
          <Field label="Nom">
            <input
              required autoFocus
              value={form.nom}
              onChange={e => setForm({ ...form, nom: e.target.value })}
              placeholder="Capital de précaution"
              className="w-full bg-bg border border-border rounded py-2 px-3 text-xs focus:border-accent outline-none"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Montant cible ($)">
              <input
                type="number" step="0.01" min="0.01" required
                value={form.montant_cible || ''}
                onChange={e => setForm({ ...form, montant_cible: parseFloat(e.target.value) || 0 })}
                placeholder="20000"
                className="w-full bg-bg border border-border rounded py-2 px-3 text-xs mono focus:border-accent outline-none"
              />
            </Field>
            <Field label="Montant actuel ($)" optional>
              <input
                type="number" step="0.01" min="0"
                value={form.montant_actuel || ''}
                onChange={e => setForm({ ...form, montant_actuel: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                className="w-full bg-bg border border-border rounded py-2 px-3 text-xs mono focus:border-accent outline-none"
              />
            </Field>
          </div>
          <Field label="Date cible" optional>
            <input
              type="date"
              value={form.date_cible}
              onChange={e => setForm({ ...form, date_cible: e.target.value })}
              className="w-full bg-bg border border-border rounded py-2 px-3 text-xs mono focus:border-accent outline-none"
            />
          </Field>
          <Field label="Couleur">
            <div className="flex gap-1.5">
              {COLORS.map(c => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setForm({ ...form, couleur: c })}
                  className={`w-8 h-8 rounded ${form.couleur === c ? 'ring-2 ring-white ring-offset-2 ring-offset-surface' : ''}`}
                  style={{ background: c }}
                />
              ))}
            </div>
          </Field>
        </form>
        <div className="px-5 py-3 border-t border-border bg-bg/40 flex justify-end gap-2">
          <button onClick={onClose} className="text-[11px] px-3 py-1.5 rounded mono bg-bg border border-border text-txt-2 hover:text-txt">
            Annuler
          </button>
          <button onClick={submit} className="text-[11px] px-3 py-1.5 rounded mono text-white font-bold" style={{ background: form.couleur }}>
            {objectif ? 'Enregistrer' : 'Créer'}
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

const Field: React.FC<{ label: string; optional?: boolean; children: React.ReactNode }> = ({ label, optional, children }) => (
  <div>
    <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-1.5">
      {label}{optional && <span className="ml-1.5 normal-case tracking-normal lowercase font-normal">optionnel</span>}
    </label>
    {children}
  </div>
);

export default GoalsPage;
