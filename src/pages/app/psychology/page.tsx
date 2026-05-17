import React, { useState, useMemo } from 'react';
import { Brain, Heart, Zap, Shield, Target, TrendingUp, Plus, Trash2 } from 'lucide-react';
import { usePsychology, PsychologyEntry } from '../../../hooks/usePsychology';

const MOODS = ['calme', 'focus', 'neutre', 'fatigué', 'stressé', 'euphorique', 'tilt'];

const PsychologyPage: React.FC = () => {
  const { entries, isLoading, error, createEntry, deleteEntry } = usePsychology();
  const [mood, setMood] = useState('calme');
  const [discipline, setDiscipline] = useState(7);
  const [fatigue, setFatigue] = useState(3);
  const [notes, setNotes] = useState('');

  const stats = useMemo(() => {
    if (!entries.length) {
      return { avgDiscipline: 0, avgFatigue: 0, tilts: 0, total: 0 };
    }
    const avgDiscipline = Math.round(
      entries.reduce((s: number, e: PsychologyEntry) => s + (e.disciplineScore || 0), 0) / entries.length
    );
    const tilts = entries.filter((e: PsychologyEntry) => e.tiltDetected).length;
    return { avgDiscipline, tilts, total: entries.length, avgFatigue: 0 };
  }, [entries]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await createEntry.mutateAsync({
      mood,
      disciplineScore: discipline,
      fatigueLevel: fatigue,
      notes: notes.trim() || null,
    } as any);
    setNotes('');
    setMood('calme');
    setDiscipline(7);
    setFatigue(3);
  };

  const emotionalStats = [
    {
      label: 'Discipline Moyenne',
      value: stats.total ? `${stats.avgDiscipline}/10` : '—',
      color: stats.avgDiscipline >= 7 ? 'text-win' : 'text-accent',
      icon: Shield,
    },
    {
      label: 'Tilts Détectés',
      value: stats.tilts.toString(),
      color: stats.tilts === 0 ? 'text-win' : 'text-loss',
      icon: Zap,
    },
    {
      label: 'Entrées Totales',
      value: stats.total.toString(),
      color: 'text-accent',
      icon: Heart,
    },
    {
      label: 'Dernière Humeur',
      value: (entries[0] as any)?.mood || entries[0]?.emotionalState || '—',
      color: 'text-win',
      icon: Target,
    },
  ];

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Psychologie & État d'Esprit</h2>
          <p className="text-txt-2 text-sm">Analysez vos émotions pour améliorer votre discipline.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {emotionalStats.map((stat, i) => (
          <div key={i} className="glass p-6 rounded-3xl group hover:border-accent/30 transition-all">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-elevated flex items-center justify-center text-txt-2 group-hover:text-accent transition-colors">
                <stat.icon size={20} />
              </div>
              <span className="text-[10px] font-bold text-txt-3 uppercase tracking-widest">{stat.label}</span>
            </div>
            <div className={`text-2xl font-mono font-bold ${stat.color}`}>{stat.value}</div>
          </div>
        ))}
      </div>

      <form onSubmit={submit} className="glass p-6 rounded-3xl space-y-4">
        <h3 className="text-lg font-bold mb-2 flex items-center gap-2">
          <Brain size={20} className="text-accent" />
          Nouveau Check-in Émotionnel
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Humeur</label>
            <select
              value={mood}
              onChange={(e) => setMood(e.target.value)}
              className="w-full bg-surface border border-border rounded-xl py-2 px-3 text-sm focus:outline-none focus:border-accent/50"
            >
              {MOODS.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">
              Discipline ({discipline}/10)
            </label>
            <input
              type="range" min="0" max="10" value={discipline}
              onChange={(e) => setDiscipline(parseInt(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
          <div>
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">
              Fatigue ({fatigue}/10)
            </label>
            <input
              type="range" min="0" max="10" value={fatigue}
              onChange={(e) => setFatigue(parseInt(e.target.value))}
              className="w-full accent-accent"
            />
          </div>
        </div>
        <div>
          <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="J'ai respecté mon plan malgré la volatilité..."
            className="w-full bg-surface border border-border rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:border-accent/50"
          />
        </div>
        <button
          type="submit"
          disabled={createEntry.isPending}
          className="btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          <Plus size={16} />
          {createEntry.isPending ? 'Enregistrement...' : 'Enregistrer le check-in'}
        </button>
      </form>

      <div className="glass p-6 rounded-3xl">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-accent" />
          Historique récent
        </h3>

        {isLoading && <p className="text-txt-2 text-sm text-center py-8">Chargement...</p>}
        {error && <p className="text-loss text-sm text-center py-8">Erreur : impossible de charger l'historique.</p>}
        {!isLoading && !error && entries.length === 0 && (
          <p className="text-txt-2 text-sm text-center py-8 italic">Aucun check-in pour l'instant.</p>
        )}

        <div className="space-y-3">
          {entries.map((e: PsychologyEntry) => (
            <div key={e.id} className="p-4 rounded-2xl bg-bg/50 border border-border group hover:border-accent/30 transition-all">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-bold uppercase text-accent bg-accent/10 px-2 py-0.5 rounded-full">
                    {(e as any).mood || e.emotionalState || '—'}
                  </span>
                  <span className="text-[10px] font-mono text-txt-3">
                    {new Date(e.createdAt).toLocaleString('fr-FR')}
                  </span>
                </div>
                <button
                  onClick={() => deleteEntry.mutate(e.id)}
                  className="text-txt-3 hover:text-loss opacity-0 group-hover:opacity-100 transition-all"
                  title="Supprimer"
                >
                  <Trash2 size={14} />
                </button>
              </div>
              <div className="flex gap-4 text-[11px] text-txt-2 mb-1">
                <span>Discipline: <b className="font-mono text-accent">{e.disciplineScore ?? '—'}/10</b></span>
                <span>Fatigue: <b className="font-mono">{(e as any).fatigueLevel ?? '—'}/10</b></span>
                {e.tiltDetected && <span className="text-loss font-bold">⚠ Tilt</span>}
              </div>
              {((e as any).notes || e.note) && (
                <p className="text-sm text-txt-2 italic mt-1">"{(e as any).notes || e.note}"</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PsychologyPage;
