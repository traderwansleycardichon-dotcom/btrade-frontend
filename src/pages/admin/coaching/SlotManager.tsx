import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface CoachingSlot {
  id: string;
  datetime: string;
  status: 'available' | 'pending' | 'confirmed' | 'blocked';
}

const STATUS_LABELS: Record<CoachingSlot['status'], string> = {
  available: 'Disponible',
  pending: 'En attente',
  confirmed: 'Confirmé',
  blocked: 'Bloqué',
};

const STATUS_CLASSES: Record<CoachingSlot['status'], string> = {
  available: 'bg-win/10 text-win',
  pending: 'bg-amber-500/10 text-amber-500',
  confirmed: 'bg-accent/10 text-accent',
  blocked: 'bg-loss/10 text-loss',
};

export default function SlotManager() {
  const [slots, setSlots] = useState<CoachingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDatetime, setNewDatetime] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  useEffect(() => { fetchSlots(); }, []);

  const fetchSlots = () => {
    setLoading(true);
    api.get('/api/admin/coaching/slots')
      .then((res: any) => setSlots(res.data.data))
      .catch(() => addToast('Erreur lors du chargement des créneaux', 'error'))
      .finally(() => setLoading(false));
  };

  const handleAdd = async () => {
    if (!newDatetime) return;
    setSaving(true);
    try {
      await api.post('/api/admin/coaching/slots', { datetime: newDatetime });
      addToast('Créneau ajouté', 'success');
      setIsAdding(false);
      setNewDatetime('');
      fetchSlots();
    } catch {
      addToast("Erreur lors de l'ajout du créneau", 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await api.delete(`/api/admin/coaching/slots/${id}`);
      addToast('Créneau supprimé', 'success');
      fetchSlots();
    } catch {
      addToast('Erreur lors de la suppression', 'error');
    }
  };

  if (loading) return <div className="p-12 text-center text-txt-3">Chargement...</div>;

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Ajouter un créneau
        </button>
      </div>

      {slots.length === 0 ? (
        <div className="flex flex-col items-center py-16 text-txt-3">
          <Calendar size={40} className="mb-3" />
          <p className="font-bold">Aucun créneau</p>
        </div>
      ) : (
        <div className="space-y-3">
          {slots.map(slot => (
            <div key={slot.id} className="glass rounded-2xl border border-border p-4 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <Calendar size={16} className="text-txt-3 shrink-0" />
                <span className="text-sm font-medium">
                  {format(new Date(slot.datetime), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr })}
                </span>
              </div>
              <div className="flex items-center gap-3">
                <span className={`text-[10px] font-bold px-2.5 py-1 rounded-md uppercase ${STATUS_CLASSES[slot.status]}`}>
                  {STATUS_LABELS[slot.status]}
                </span>
                {slot.status === 'available' && (
                  <button
                    onClick={() => handleDelete(slot.id)}
                    className="text-txt-3 hover:text-loss transition-colors"
                    aria-label="Supprimer"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {isAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-border w-full max-w-sm p-6 space-y-4">
            <h2 className="text-lg font-black">Ajouter un créneau</h2>
            <div>
              <label htmlFor="new-slot-datetime" className="block text-xs font-bold text-txt-2 mb-2">
                Date et heure
              </label>
              <input
                id="new-slot-datetime"
                type="datetime-local"
                value={newDatetime}
                onChange={e => setNewDatetime(e.target.value)}
                className="w-full px-4 py-3 rounded-xl bg-elevated border border-border focus:border-accent outline-none text-sm"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setIsAdding(false); setNewDatetime(''); }}
                className="flex-1 btn-ghost"
              >
                Annuler
              </button>
              <button
                onClick={handleAdd}
                disabled={saving || !newDatetime}
                className="flex-1 btn-primary disabled:opacity-50"
              >
                {saving ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
