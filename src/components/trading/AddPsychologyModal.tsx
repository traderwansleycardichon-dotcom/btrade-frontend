import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import brainIcon from '../../assets/animations/1f9e0.json';
import { usePsychology } from '../../hooks/usePsychology';
import { useToast } from '../../hooks/useToast';
import { Brain, FileText, Activity, Battery } from 'lucide-react';
import { clickable } from '../../lib/a11y';

interface AddPsychologyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const MOODS = [
  { value: 'confident', label: 'Confiant(e)', emoji: '😎' },
  { value: 'calm', label: 'Calme', emoji: '😌' },
  { value: 'neutral', label: 'Neutre', emoji: '😐' },
  { value: 'anxious', label: 'Anxieux(se)', emoji: '😰' },
  { value: 'frustrated', label: 'Frustré(e)', emoji: '😤' },
  { value: 'tilt', label: 'En plein TILT', emoji: '🤬' },
];

export const AddPsychologyModal: React.FC<AddPsychologyModalProps> = ({ isOpen, onClose }) => {
  const { createEntry: createTracking } = usePsychology();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    mood: 'neutral',
    disciplineScore: 5,
    fatigueLevel: 5,
    notes: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTracking.mutateAsync(formData);
      addToast('Suivi psychologique enregistré !');
      onClose();
      setFormData({
        mood: 'neutral',
        disciplineScore: 5,
        fatigueLevel: 5,
        notes: ''
      });
    } catch (err) {
      addToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Nouveau Suivi Psychologique"
      animationData={brainIcon}
      footer={
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={onClose} className="btn-ghost">Annuler</button>
          <button 
            type="submit"
            onClick={handleSubmit} 
            className="btn-primary flex items-center gap-2"
            disabled={createTracking.isPending}
          >
            <Brain size={16} />
            {createTracking.isPending ? 'Enregistrement...' : 'Enregistrer mon état'}
          </button>
        </div>
      }
    >
      <form className="space-y-6 p-1">
        
        <div>
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-3">
            Humeur Globale
          </label>
          <div className="grid grid-cols-3 gap-3">
            {MOODS.map(m => (
              <div 
                key={m.value}
                {...clickable(() => setFormData({...formData, mood: m.value}))}
                className={`p-3 rounded-xl border text-center cursor-pointer transition-all ${
                  formData.mood === m.value 
                    ? 'border-accent bg-accent/10' 
                    : 'border-border bg-bg hover:border-accent/30'
                }`}
              >
                <div className="text-2xl mb-1">{m.emoji}</div>
                <div className="text-xs font-bold">{m.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div>
            <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Activity size={12} className="text-accent" /> Score de Discipline (1-10)
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" max="10" 
                value={formData.disciplineScore}
                onChange={(e) => setFormData({...formData, disciplineScore: Number(e.target.value)})}
                className="w-full accent-accent"
              />
              <span className="font-mono font-bold text-lg text-accent w-6 text-center">
                {formData.disciplineScore}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-txt-3 mt-1 uppercase">
              <span>Indiscipliné</span>
              <span>Parfait</span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2 flex items-center gap-2">
              <Battery size={12} className={formData.fatigueLevel > 7 ? 'text-loss' : 'text-txt-2'} /> Niveau de Fatigue (1-10)
            </label>
            <div className="flex items-center gap-4">
              <input 
                type="range" 
                min="1" max="10" 
                value={formData.fatigueLevel}
                onChange={(e) => setFormData({...formData, fatigueLevel: Number(e.target.value)})}
                className={`w-full ${formData.fatigueLevel > 7 ? 'accent-loss' : 'accent-txt-2'}`}
              />
              <span className={`font-mono font-bold text-lg w-6 text-center ${formData.fatigueLevel > 7 ? 'text-loss' : 'text-txt'}`}>
                {formData.fatigueLevel}
              </span>
            </div>
            <div className="flex justify-between text-[10px] text-txt-3 mt-1 uppercase">
              <span>En forme</span>
              <span>Épuisé</span>
            </div>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2 flex items-center gap-2">
            <FileText size={12} /> Notes de Journaling
          </label>
          <textarea 
            value={formData.notes}
            onChange={(e) => setFormData({...formData, notes: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all h-24 resize-none text-sm"
            placeholder="Qu'est-ce qui a influencé vos décisions aujourd'hui ? Avez-vous respecté votre plan de trading ?"
          />
        </div>

      </form>
    </Modal>
  );
};
