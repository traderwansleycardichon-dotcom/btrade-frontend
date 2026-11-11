import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Calendar, CopyPlus, Clock, X } from 'lucide-react';
import api from '../../../lib/api';
import { useToast } from '../../../hooks/useToast';
import { format, addDays, startOfDay, setHours, setMinutes, parseISO } from 'date-fns';
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

const WEEK_DAYS = [
  { label: 'Lu', value: 1 },
  { label: 'Ma', value: 2 },
  { label: 'Me', value: 3 },
  { label: 'Je', value: 4 },
  { label: 'Ve', value: 5 },
  { label: 'Sa', value: 6 },
  { label: 'Di', value: 0 },
];

export default function SlotManager() {
  const [slots, setSlots] = useState<CoachingSlot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdding, setIsAdding] = useState(false);
  const [newDatetime, setNewDatetime] = useState('');
  const [saving, setSaving] = useState(false);
  const { addToast } = useToast();

  // Bulk Generation State
  const [isBulkAdding, setIsBulkAdding] = useState(false);
  const [bulkStartDate, setBulkStartDate] = useState('');
  const [bulkEndDate, setBulkEndDate] = useState('');
  const [bulkDays, setBulkDays] = useState<number[]>([1, 2, 3, 4, 5]); // Lun-Ven par défaut
  const [bulkTimes, setBulkTimes] = useState<string[]>(['10:00', '14:00']);
  const [newTime, setNewTime] = useState('');

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

  const handleBulkAdd = async () => {
    if (!bulkStartDate || !bulkEndDate || bulkDays.length === 0 || bulkTimes.length === 0) {
      addToast('Veuillez remplir tous les champs', 'error');
      return;
    }

    setSaving(true);
    const start = parseISO(bulkStartDate);
    const end = parseISO(bulkEndDate);
    const datetimes: string[] = [];

    let current = startOfDay(start);
    const endLimit = startOfDay(end);

    while (current <= endLimit) {
      const dayOfWeek = current.getDay();
      if (bulkDays.includes(dayOfWeek)) {
        for (const time of bulkTimes) {
          const [hours, minutes] = time.split(':').map(Number);
          const slotTime = setMinutes(setHours(current, hours), minutes);
          // Ne pas ajouter de slots dans le passé
          if (slotTime > new Date()) {
            datetimes.push(slotTime.toISOString());
          }
        }
      }
      current = addDays(current, 1);
    }

    if (datetimes.length === 0) {
      addToast('Aucun créneau valide à générer dans cette période', 'error');
      setSaving(false);
      return;
    }

    try {
      const res = await api.post('/api/admin/coaching/slots/bulk', { datetimes });
      addToast(`${res.data.count} créneaux générés avec succès`, 'success');
      setIsBulkAdding(false);
      fetchSlots();
    } catch {
      addToast('Erreur lors de la génération', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleAddTime = () => {
    if (newTime && !bulkTimes.includes(newTime)) {
      setBulkTimes([...bulkTimes, newTime].sort((a, b) => a.localeCompare(b)));
      setNewTime('');
    }
  };

  const removeTime = (timeToRemove: string) => {
    setBulkTimes(bulkTimes.filter(t => t !== timeToRemove));
  };

  const toggleDay = (day: number) => {
    if (bulkDays.includes(day)) {
      setBulkDays(bulkDays.filter(d => d !== day));
    } else {
      setBulkDays([...bulkDays, day]);
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
      <div className="flex justify-end gap-3">
        <button onClick={() => setIsBulkAdding(true)} className="btn-secondary flex items-center gap-2">
          <CopyPlus size={16} /> Génération par lots
        </button>
        <button onClick={() => setIsAdding(true)} className="btn-primary flex items-center gap-2">
          <Plus size={16} /> Créneau unique
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

      {/* Modal Ajout Unique */}
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

      {/* Modal Génération par Lots */}
      {isBulkAdding && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-surface rounded-2xl border border-border w-full max-w-lg p-6 space-y-6">
            <h2 className="text-lg font-black flex items-center gap-2">
              <CopyPlus size={20} className="text-accent" />
              Génération par lots (Semaine)
            </h2>

            {/* Période */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-txt-2 mb-2">Date de début</label>
                <input
                  type="date"
                  value={bulkStartDate}
                  onChange={e => setBulkStartDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-elevated border border-border focus:border-accent outline-none text-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-txt-2 mb-2">Date de fin</label>
                <input
                  type="date"
                  value={bulkEndDate}
                  onChange={e => setBulkEndDate(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl bg-elevated border border-border focus:border-accent outline-none text-sm"
                />
              </div>
            </div>

            {/* Jours de la semaine */}
            <div>
              <label className="block text-xs font-bold text-txt-2 mb-2">Jours disponibles</label>
              <div className="flex flex-wrap gap-2">
                {WEEK_DAYS.map(day => (
                  <button
                    key={day.value}
                    onClick={() => toggleDay(day.value)}
                    className={`px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                      bulkDays.includes(day.value)
                        ? 'bg-accent/10 border-accent text-accent'
                        : 'bg-elevated border-border text-txt-3 hover:text-txt-1'
                    }`}
                  >
                    {day.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Heures */}
            <div>
              <label className="block text-xs font-bold text-txt-2 mb-2">Heures pour ces jours</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="time"
                  value={newTime}
                  onChange={e => setNewTime(e.target.value)}
                  className="flex-1 px-4 py-2 rounded-xl bg-elevated border border-border focus:border-accent outline-none text-sm"
                />
                <button
                  onClick={handleAddTime}
                  disabled={!newTime}
                  className="btn-secondary px-4 py-2 rounded-xl"
                >
                  Ajouter
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {bulkTimes.length === 0 ? (
                  <p className="text-xs text-txt-3 italic">Aucune heure ajoutée.</p>
                ) : (
                  bulkTimes.map(time => (
                    <div key={time} className="flex items-center gap-2 bg-elevated border border-border rounded-lg px-3 py-1.5">
                      <Clock size={14} className="text-txt-3" />
                      <span className="text-sm font-medium">{time}</span>
                      <button onClick={() => removeTime(time)} className="text-txt-3 hover:text-loss ml-1">
                        <X size={14} />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsBulkAdding(false)}
                className="flex-1 btn-ghost"
              >
                Annuler
              </button>
              <button
                onClick={handleBulkAdd}
                disabled={saving || !bulkStartDate || !bulkEndDate || bulkDays.length === 0 || bulkTimes.length === 0}
                className="flex-1 btn-primary disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {saving ? 'Génération...' : 'Générer les créneaux'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
