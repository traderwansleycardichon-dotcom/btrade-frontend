import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useFinance } from '../../hooks/useFinance';
import { useToast } from '../../hooks/useToast';
import { DollarSign, Calendar, Tag, FileText } from 'lucide-react';

interface AddRevenuModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddRevenuModal: React.FC<AddRevenuModalProps> = ({ isOpen, onClose }) => {
  const { createRevenu } = useFinance();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    source: '',
    montant: '',
    date: new Date().toISOString().split('T')[0],
    recurrent: false,
    periode: 'mensuel',
    note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createRevenu.mutateAsync({
        ...formData,
        montant: Number(formData.montant)
      });
      addToast('Revenu enregistré avec succès !');
      onClose();
      setFormData({
        source: '',
        montant: '',
        date: new Date().toISOString().split('T')[0],
        recurrent: false,
        periode: 'mensuel',
        note: ''
      });
    } catch (error) {
      addToast('Erreur lors de l\'enregistrement.', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ajouter un Revenu">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Source / Libellé</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <input 
                type="text" 
                required
                placeholder="Ex: Salaire, Payout, Dividendes..."
                value={formData.source}
                onChange={(e) => setFormData({...formData, source: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Montant ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-win" size={16} />
              <input 
                type="number" 
                required
                step="0.01"
                value={formData.montant}
                onChange={(e) => setFormData({...formData, montant: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all font-mono" 
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Date</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <input 
                type="date" 
                required
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all font-mono text-sm" 
              />
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 bg-win/5 border border-win/10 rounded-2xl">
          <input 
            type="checkbox" 
            id="recurrent_rev"
            checked={formData.recurrent}
            onChange={(e) => setFormData({...formData, recurrent: e.target.checked})}
            className="w-4 h-4 rounded border-border text-accent focus:ring-accent bg-bg"
          />
          <label htmlFor="recurrent_rev" className="text-sm font-medium cursor-pointer">Revenu récurrent</label>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2 flex items-center gap-2">
            <FileText size={12} /> Notes (Optionnel)
          </label>
          <textarea 
            value={formData.note}
            onChange={(e) => setFormData({...formData, note: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all h-20 resize-none text-sm"
            placeholder="Détails supplémentaires..."
          />
        </div>

        <div className="flex gap-4 pt-4">
          <button 
            type="button"
            onClick={onClose}
            className="flex-1 px-6 py-3 rounded-xl border border-border font-bold hover:bg-white/5 transition-all"
          >
            Annuler
          </button>
          <button 
            type="submit"
            disabled={createRevenu.isPending}
            className="flex-1 bg-win text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {createRevenu.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
