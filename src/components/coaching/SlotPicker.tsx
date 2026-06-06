import React from 'react';
import { Calendar } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export interface CoachingSlot {
  id: string;
  datetime: string;
}

interface SlotPickerProps {
  slots: CoachingSlot[];
  selectedSlotId: string;
  onChange: (slotId: string) => void;
}

export function SlotPicker({ slots, selectedSlotId, onChange }: SlotPickerProps) {
  if (slots.length === 0) {
    return (
      <p className="text-sm text-txt-3 text-center py-4">
        Aucun créneau disponible pour le moment. Revenez bientôt.
      </p>
    );
  }
  return (
    <div className="space-y-2">
      {slots.map(slot => (
        <label
          key={slot.id}
          className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-colors ${
            selectedSlotId === slot.id
              ? 'border-accent bg-accent/10'
              : 'border-border hover:border-accent/50'
          }`}
        >
          <input
            type="radio"
            name="slot"
            value={slot.id}
            checked={selectedSlotId === slot.id}
            onChange={() => onChange(slot.id)}
            className="sr-only"
          />
          <Calendar size={14} className={selectedSlotId === slot.id ? 'text-accent' : 'text-txt-3'} />
          <span className="text-sm font-medium">
            {format(new Date(slot.datetime), "EEEE dd MMMM yyyy 'à' HH:mm", { locale: fr })}
          </span>
        </label>
      ))}
    </div>
  );
}
