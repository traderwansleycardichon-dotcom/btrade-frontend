import React, { useMemo, useState } from 'react';
import { Plus, Trash2, Pencil, X, Archive, ArchiveRestore, Image as ImageIcon } from 'lucide-react';
import { usePlaybooks, Playbook } from '../../../hooks/usePlaybooks';
import { useToast } from '../../../hooks/useToast';

const num = (v: any) => Number(v ?? 0);

// Palette de couleurs PLEINES (pas de dégradés)
const COLORS: Array<{ name: string; bg: string; bgLight: string; text: string }> = [
  { name: 'Orange',   bg: '#F36C00', bgLight: '#F36C0022', text: '#F36C00' },
  { name: 'Rouge',    bg: '#EF4444', bgLight: '#EF444422', text: '#EF4444' },
  { name: 'Vert',     bg: '#10B981', bgLight: '#10B98122', text: '#10B981' },
  { name: 'Bleu',     bg: '#3B82F6', bgLight: '#3B82F622', text: '#3B82F6' },
  { name: 'Violet',   bg: '#8B5CF6', bgLight: '#8B5CF622', text: '#8B5CF6' },
  { name: 'Cyan',     bg: '#06B6D4', bgLight: '#06B6D422', text: '#06B6D4' },
  { name: 'Rose',     bg: '#EC4899', bgLight: '#EC489922', text: '#EC4899' },
  { name: 'Jaune',    bg: '#EAB308', bgLight: '#EAB30822', text: '#EAB308' },
  { name: 'Gris',     bg: '#6B7280', bgLight: '#6B728022', text: '#9CA3AF' },
];

const DEFAULT_COLOR = COLORS[0];

const colorFor = (couleur: string | null | undefined) => {
  if (!couleur) return DEFAULT_COLOR;
  return COLORS.find(c => c.bg.toLowerCase() === couleur.toLowerCase()) || { name: 'Custom', bg: couleur, bgLight: couleur + '22', text: couleur };
};

const PlaybooksPage: React.FC = () => {
  const { playbooks, isLoading, createPlaybook, updatePlaybook, deletePlaybook } = usePlaybooks();
  const { addToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editing, setEditing] = useState<Playbook | null>(null);
  const [filter, setFilter] = useState<'tous' | 'actifs' | 'archives'>('tous');

  const filtered = useMemo(() => {
    if (filter === 'actifs') return playbooks.filter((p: Playbook) => p.actif);
    if (filter === 'archives') return playbooks.filter((p: Playbook) => !p.actif);
    return playbooks;
  }, [playbooks, filter]);

  const stats = useMemo(() => {
    const total = playbooks.length;
    const actifs = playbooks.filter((p: Playbook) => p.actif).length;
    const tauxMoy = playbooks.length
      ? playbooks.reduce((s: number, p: Playbook) => s + num(p.tauxReussiteEstime), 0) / playbooks.length
      : 0;
    const rrMoy = playbooks.length
      ? playbooks.reduce((s: number, p: Playbook) => s + num(p.rrTarget), 0) / playbooks.length
      : 0;
    return { total, actifs, tauxMoy, rrMoy };
  }, [playbooks]);

  const openCreate = () => { setEditing(null); setIsModalOpen(true); };
  const openEdit = (p: Playbook) => { setEditing(p); setIsModalOpen(true); };

  const onDelete = async (p: Playbook) => {
    if (!confirm(`Supprimer le playbook "${p.titre}" ?`)) return;
    try {
      await deletePlaybook.mutateAsync(p.id);
      addToast('Playbook supprimé');
    } catch { addToast('Erreur', 'error'); }
  };

  const toggleActif = async (p: Playbook) => {
    try {
      await updatePlaybook.mutateAsync({ id: p.id, patch: { actif: !p.actif } });
      addToast(p.actif ? 'Archivé' : 'Activé');
    } catch { addToast('Erreur', 'error'); }
  };

  return (
    <div className="space-y-3 animate-[fadeIn_0.4s_ease-out]">
      {/* STATS */}
      <div className="grid grid-cols-4 gap-2">
        <Kpi label="Playbooks" value={isLoading ? '—' : stats.total.toString()} />
        <Kpi label="Actifs" value={isLoading ? '—' : stats.actifs.toString()} />
        <Kpi label="Taux moyen" value={stats.tauxMoy > 0 ? `${stats.tauxMoy.toFixed(0)}%` : '—'} />
        <Kpi label="R:R moyen" value={stats.rrMoy > 0 ? stats.rrMoy.toFixed(2) : '—'} />
      </div>

      {/* TOOLBAR */}
      <div className="surface rounded-lg px-3 py-2.5 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3 flex-wrap">
          <span className="text-[10px] uppercase tracking-widest text-txt-3">Filtre</span>
          {(['tous', 'actifs', 'archives'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`text-[11px] px-2.5 py-1 rounded mono transition-colors ${
                filter === f ? 'bg-accent text-white font-bold' : 'bg-bg text-txt-2 hover:text-txt border border-border'
              }`}
            >
              {f === 'tous' ? 'Tous' : f === 'actifs' ? 'Actifs' : 'Archivés'}
            </button>
          ))}
        </div>
        <button
          onClick={openCreate}
          className="text-[11px] px-3 py-1.5 rounded mono bg-accent hover:bg-accent-2 text-white font-bold flex items-center gap-1.5"
        >
          <Plus size={12} /> Nouveau playbook
        </button>
      </div>

      {/* GRID DE CARTES */}
      {isLoading ? (
        <div className="surface rounded-lg p-10 text-center text-txt-3 text-[11px]">Chargement…</div>
      ) : filtered.length === 0 ? (
        <div className="surface rounded-lg px-5 py-14 text-center">
          <p className="text-xs font-bold mb-1">
            {playbooks.length === 0 ? 'Aucun playbook' : 'Aucun résultat'}
          </p>
          <p className="text-[10px] text-txt-3 mb-4 max-w-md mx-auto leading-relaxed">
            Un playbook formalise une stratégie de trading. Documente le tien pour répéter ce qui fonctionne.
          </p>
          {playbooks.length === 0 && (
            <button
              onClick={openCreate}
              className="text-[11px] px-3 py-1.5 rounded mono bg-accent hover:bg-accent-2 text-white font-bold inline-flex items-center gap-1.5"
            >
              <Plus size={12} /> Créer mon premier playbook
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {filtered.map((p: Playbook) => (
            <PlaybookCard
              key={p.id}
              playbook={p}
              onEdit={() => openEdit(p)}
              onDelete={() => onDelete(p)}
              onToggle={() => toggleActif(p)}
            />
          ))}
        </div>
      )}

      {isModalOpen && (
        <PlaybookFormModal
          playbook={editing}
          onClose={() => setIsModalOpen(false)}
          onSubmit={async (data) => {
            try {
              if (editing) {
                await updatePlaybook.mutateAsync({ id: editing.id, patch: data });
                addToast('Mis à jour');
              } else {
                await createPlaybook.mutateAsync(data as any);
                addToast('Playbook créé');
              }
              setIsModalOpen(false);
            } catch (e: any) {
              addToast('Erreur : ' + (e?.response?.data?.error || 'requête échouée'), 'error');
            }
          }}
        />
      )}
    </div>
  );
};

// ── Card ──────────────────────────────────────────────────────────────

const PlaybookCard: React.FC<{
  playbook: Playbook;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
}> = ({ playbook, onEdit, onDelete, onToggle }) => {
  const p = playbook;
  const tauxR = num(p.tauxReussiteEstime);
  const rrT = num(p.rrTarget);
  const color = colorFor(p.couleur);

  return (
    <div
      className={`surface rounded-lg overflow-hidden group transition-all hover:border-current ${
        !p.actif ? 'opacity-60' : ''
      }`}
      style={{ borderColor: 'var(--border)', color: color.bg }}
    >
      {/* Header image ou bloc couleur PLEIN */}
      <div className="relative h-32 overflow-hidden" style={{ background: color.bg }}>
        {p.imageUrl ? (
          <img
            src={p.imageUrl}
            alt={p.titre || ''}
            className="w-full h-full object-cover"
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-5xl font-black text-txt-3 mono">
              {(p.titre || '?').slice(0, 2).toUpperCase()}
            </span>
          </div>
        )}

        {/* Overlay actions */}
        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onClick={onToggle}
            className="p-1.5 rounded bg-black/40 backdrop-blur hover:bg-black/70 text-txt"
            title={p.actif ? 'Archiver' : 'Activer'}
          >
            {p.actif ? <Archive size={12} /> : <ArchiveRestore size={12} />}
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 rounded bg-black/40 backdrop-blur hover:bg-black/70 text-txt"
            title="Modifier"
          >
            <Pencil size={12} />
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 rounded bg-black/40 backdrop-blur hover:bg-red-600 text-white"
            title="Supprimer"
          >
            <Trash2 size={12} />
          </button>
        </div>

        {/* Badge statut */}
        {!p.actif && (
          <span className="absolute top-2 left-2 text-[9px] uppercase tracking-widest font-bold bg-black/60 text-txt px-2 py-0.5 rounded">
            Archivé
          </span>
        )}
      </div>

      {/* Body */}
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2 mb-2">
          <h4 className="font-bold text-sm leading-tight text-txt">{p.titre || 'Sans titre'}</h4>
          {p.typeStrategie && (
            <span
              className="text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded flex-shrink-0"
              style={{ background: color.bgLight, color: color.bg }}
            >
              {p.typeStrategie}
            </span>
          )}
        </div>

        {p.description && (
          <p className="text-[11px] text-txt-2 leading-relaxed line-clamp-2 mb-3">
            {p.description}
          </p>
        )}

        {/* Métriques */}
        <div className="grid grid-cols-3 gap-2 mb-3">
          <Metric label="R:R" value={rrT > 0 ? rrT.toFixed(1) : '—'} />
          <Metric
            label="Taux est."
            value={tauxR > 0 ? `${tauxR.toFixed(0)}%` : '—'}
            color={tauxR >= 60 ? 'text-win' : tauxR >= 40 ? '' : tauxR > 0 ? 'text-loss' : ''}
          />
          <Metric label="Statut" value={p.actif ? 'Actif' : 'Off'} color={p.actif ? 'text-win' : 'text-txt-3'} />
        </div>

        {/* Aperçu règles */}
        {p.regles && (
          <div className="pt-2.5 border-t border-border">
            <p className="text-[9px] uppercase tracking-widest text-txt-3 mb-1">Règles</p>
            <p className="text-[11px] text-txt-2 line-clamp-3 whitespace-pre-line leading-relaxed">{p.regles}</p>
          </div>
        )}
      </div>
    </div>
  );
};

// ── Modal ──────────────────────────────────────────────────────────────

interface PFData {
  titre: string;
  description: string;
  regles: string;
  typeStrategie: string;
  rrTarget: number;
  tauxReussiteEstime: number;
  actif: boolean;
  imageUrl: string;
  couleur: string;
}

const PlaybookFormModal: React.FC<{
  playbook: Playbook | null;
  onClose: () => void;
  onSubmit: (data: any) => void;
}> = ({ playbook, onClose, onSubmit }) => {
  const [form, setForm] = useState<PFData>({
    titre: playbook?.titre || '',
    description: playbook?.description || '',
    regles: playbook?.regles || '',
    typeStrategie: playbook?.typeStrategie || '',
    rrTarget: num(playbook?.rrTarget),
    tauxReussiteEstime: num(playbook?.tauxReussiteEstime),
    actif: playbook?.actif ?? true,
    imageUrl: playbook?.imageUrl || '',
    couleur: playbook?.couleur || DEFAULT_COLOR.bg,
  });

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.titre.trim()) return;
    onSubmit({
      titre: form.titre.trim(),
      description: form.description.trim() || null,
      regles: form.regles.trim() || null,
      typeStrategie: form.typeStrategie.trim() || null,
      rrTarget: form.rrTarget || null,
      tauxReussiteEstime: form.tauxReussiteEstime || null,
      actif: form.actif,
      imageUrl: form.imageUrl.trim() || null,
      couleur: form.couleur || null,
    });
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      <div aria-hidden="true" className="absolute inset-0 bg-bg/80 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-xl surface rounded-lg overflow-hidden shadow-2xl">
        <div className="px-5 py-3 border-b border-border flex items-center justify-between" style={{ background: form.couleur, color: '#fff' }}>
          <h2 className="text-xs font-bold uppercase tracking-widest">
            {playbook ? 'Modifier le playbook' : 'Nouveau playbook'}
          </h2>
          <button onClick={onClose} className="p-1 text-txt-2 hover:text-txt">
            <X size={14} />
          </button>
        </div>

        <form onSubmit={submit} className="p-5 space-y-3 max-h-[70vh] overflow-y-auto">
          <Field label="Nom">
            <input
              required autoFocus
              value={form.titre}
              onChange={e => setForm({ ...form, titre: e.target.value })}
              placeholder="London Breakout"
              className="w-full bg-bg border border-border rounded py-2 px-3 text-xs focus:border-accent outline-none"
            />
          </Field>

          {/* Couleur */}
          <Field label="Couleur">
            <div className="flex flex-wrap gap-1.5">
              {COLORS.map(c => (
                <button
                  key={c.name}
                  type="button"
                  onClick={() => setForm({ ...form, couleur: c.bg })}
                  className={`w-8 h-8 rounded transition-transform hover:scale-110 ${
                    form.couleur === c.bg ? 'ring-2 ring-white ring-offset-2 ring-offset-surface' : ''
                  }`}
                  style={{ background: c.bg }}
                  title={c.name}
                />
              ))}
            </div>
          </Field>

          {/* Image URL */}
          <Field label="Image (URL)" optional>
            <div className="flex gap-2">
              <input
                value={form.imageUrl}
                onChange={e => setForm({ ...form, imageUrl: e.target.value })}
                placeholder="https://… (screenshot TradingView, illustration, etc.)"
                className="flex-1 bg-bg border border-border rounded py-2 px-3 text-xs focus:border-accent outline-none"
              />
              {form.imageUrl && (
                <button
                  type="button"
                  onClick={() => setForm({ ...form, imageUrl: '' })}
                  className="text-[10px] text-txt-3 hover:text-loss px-2"
                  title="Vider"
                >
                  Effacer
                </button>
              )}
            </div>
            {form.imageUrl && (
              <div className="mt-2 relative h-24 rounded overflow-hidden border border-border">
                <img
                  src={form.imageUrl}
                  alt="Aperçu"
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).style.display = 'none';
                    (e.target as HTMLImageElement).parentElement!.classList.add('items-center', 'justify-center', 'flex');
                    (e.target as HTMLImageElement).parentElement!.innerHTML = '<span class="text-[10px] text-loss">Image inaccessible</span>';
                  }}
                />
              </div>
            )}
            {!form.imageUrl && (
              <p className="mt-1.5 text-[10px] text-txt-3 flex items-center gap-1.5">
                <ImageIcon size={10} /> Colle l'URL d'une image. Sinon, un bloc de couleur sera affiché.
              </p>
            )}
          </Field>

          <Field label="Type de stratégie" optional>
            <input
              value={form.typeStrategie}
              onChange={e => setForm({ ...form, typeStrategie: e.target.value })}
              list="strat-list"
              placeholder="Breakout, Range, Scalp, Swing…"
              className="w-full bg-bg border border-border rounded py-2 px-3 text-xs focus:border-accent outline-none"
            />
            <datalist id="strat-list">
              {['Breakout', 'Pullback', 'Range', 'Reversal', 'News Trade', 'Scalp', 'Swing'].map(s => <option key={s} value={s} />)}
            </datalist>
          </Field>

          <Field label="Description" optional>
            <textarea
              rows={2}
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
              placeholder="Quoi, où, quand cette stratégie est utilisée…"
              className="w-full bg-bg border border-border rounded py-2 px-3 text-xs focus:border-accent outline-none resize-none"
            />
          </Field>

          <Field label="Règles" optional>
            <textarea
              rows={5}
              value={form.regles}
              onChange={e => setForm({ ...form, regles: e.target.value })}
              placeholder={'1. Conditions d\'entrée\n2. Gestion du SL\n3. Plan de TP\n4. Limites par session'}
              className="w-full bg-bg border border-border rounded py-2 px-3 text-xs focus:border-accent outline-none resize-none leading-relaxed"
            />
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="R:R cible" optional>
              <input
                type="number" step="0.1"
                value={form.rrTarget}
                onChange={e => setForm({ ...form, rrTarget: parseFloat(e.target.value) || 0 })}
                placeholder="2.0"
                className="w-full bg-bg border border-border rounded py-2 px-3 text-xs mono focus:border-accent outline-none"
              />
            </Field>
            <Field label="Taux de réussite estimé (%)" optional>
              <input
                type="number" step="1" min="0" max="100"
                value={form.tauxReussiteEstime}
                onChange={e => setForm({ ...form, tauxReussiteEstime: parseFloat(e.target.value) || 0 })}
                placeholder="60"
                className="w-full bg-bg border border-border rounded py-2 px-3 text-xs mono focus:border-accent outline-none"
              />
            </Field>
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={form.actif}
              onChange={e => setForm({ ...form, actif: e.target.checked })}
              className="rounded border-border bg-bg text-accent focus:ring-accent"
            />
            <span className="text-xs">Marquer comme actif</span>
          </label>
        </form>

        <div className="px-5 py-3 border-t border-border bg-bg/40 flex justify-end gap-2">
          <button onClick={onClose} className="text-[11px] px-3 py-1.5 rounded mono bg-bg border border-border text-txt-2 hover:text-txt">
            Annuler
          </button>
          <button
            onClick={submit}
            className="text-[11px] px-3 py-1.5 rounded mono text-txt font-bold"
            style={{ background: form.couleur }}
          >
            {playbook ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </div>
    </div>
  );
};

const Field: React.FC<{ label: string; optional?: boolean; children: React.ReactNode }> = ({ label, optional, children }) => (
  <div>
    <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-1.5">
      {label}{optional && <span className="ml-1.5 text-txt-3 normal-case tracking-normal lowercase font-normal">optionnel</span>}
    </label>
    {children}
  </div>
);

const Kpi: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div className="surface rounded-lg px-3 py-2">
    <p className="text-[9px] uppercase tracking-widest text-txt-3">{label}</p>
    <p className="text-lg font-black mono">{value}</p>
  </div>
);

const Metric: React.FC<{ label: string; value: string; color?: string }> = ({ label, value, color = '' }) => (
  <div className="bg-bg/40 border border-border rounded p-1.5 text-center">
    <p className="text-[8px] uppercase tracking-widest text-txt-3">{label}</p>
    <p className={`text-xs font-bold mono ${color}`}>{value}</p>
  </div>
);

export default PlaybooksPage;
