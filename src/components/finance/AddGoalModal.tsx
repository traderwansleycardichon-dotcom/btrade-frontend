import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import targetIcon from '../../assets/animations/1f3af.json';
import { useObjectifs } from '../../hooks/useObjectifs';
import { useToast } from '../../hooks/useToast';
import { Target, DollarSign, Calendar, Palette, Star } from 'lucide-react';

interface AddGoalModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const COLORS = [
  { label: 'Vert (Win)', value: '#10B981' },
  { label: 'Bleu (Actions)', value: '#3B82F6' },
  { label: 'Violet (Crypto)', value: '#8B5CF6' },
  { label: 'Orange (Immo)', value: '#F59E0B' },
  { label: 'Rouge (Urgence)', value: '#EF4444' },
];

export const AddGoalModal: React.FC<AddGoalModalProps> = ({ isOpen, onClose }) => {
  const { createObjectif } = useObjectifs();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    nom: '',
    montantCible: '',
    montantActuel: '0',
    dateCible: '',
    description: '',
    couleur: '#10B981'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createObjectif.mutateAsync({
        ...formData,
        montantCible: Number(formData.montantCible),
        montantActuel: Number(formData.montantActuel)
      });
      addToast('Objectif créé avec succès !');
      onClose();
      setFormData({
        nom: '',
        montantCible: '',
        montantActuel: '0',
        dateCible: '',
        description: '',
        couleur: '#10B981'
      });
    } catch (error) {
      addToast('Erreur lors de la création de l\'objectif.', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvel Objectif" animationData={targetIcon}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[11px] md:text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Nom de l'objectif</label>
            <div className="relative">
              <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <input 
                type="text" 
                required
                placeholder="Ex: Capital Personnel 50k, Vacances..."
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-[11px] md:text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Cible ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-win" size={16} />
              <input 
                type="number" 
                required
                step="1"
                min="1"
                value={formData.montantCible}
                onChange={(e) => setFormData({...formData, montantCible: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all font-mono" 
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-[11px] md:text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Déjà épargné ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <input 
                type="number" 
                step="1"
                min="0"
                value={formData.montantActuel}
                onChange={(e) => setFormData({...formData, montantActuel: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all font-mono" 
              />
            </div>
          </div>

          <div className="col-span-2">
            <label className="block text-[11px] md:text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Récompense (Optionnel)</label>
            <div className="relative">
              <Star className="absolute left-4 top-3 text-txt-3" size={16} />
              <textarea 
                placeholder="Ex: Un bon restaurant, un weekend..."
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all min-h-[100px] resize-none" 
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-[11px] md:text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Deadline (Optionnel)</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <input 
                type="date" 
                value={formData.dateCible}
                onChange={(e) => setFormData({...formData, dateCible: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all font-mono text-sm" 
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-[11px] md:text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Couleur</label>
            <div className="relative">
              <Palette className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <select 
                value={formData.couleur}
                onChange={(e) => setFormData({...formData, couleur: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all text-sm appearance-none"
              >
                {COLORS.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border border-border font-bold hover:dark:bg-white/5 bg-black/5 transition-all"
          >
            Annuler
          </button>
          <button 
            type="submit"
            disabled={createObjectif.isPending}
            className="flex-1 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {createObjectif.isPending ? 'Création...' : 'Créer l\'objectif'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
