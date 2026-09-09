import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import rocketIcon from '../../assets/animations/1f680.json';
import { useInvestments } from '../../hooks/useInvestments';
import { useToast } from '../../hooks/useToast';
import { Briefcase, DollarSign, Calendar, Hash, Tag, FileText } from 'lucide-react';

interface AddInvestmentModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const TYPES_ACTIFS = [
  'actions', 'crypto', 'immobilier', 'etf', 
  'obligations', 'matieres_premieres', 'autre'
];

export const AddInvestmentModal: React.FC<AddInvestmentModalProps> = ({ isOpen, onClose }) => {
  const { createInvestment } = useInvestments();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    nom: '',
    typeActif: 'actions',
    symbole: '',
    quantite: '',
    prixAchat: '',
    prixActuel: '',
    devise: 'USD',
    dateAchat: new Date().toISOString().split('T')[0],
    note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createInvestment.mutateAsync({
        ...formData,
        quantite: Number(formData.quantite),
        prixAchat: Number(formData.prixAchat),
        prixActuel: formData.prixActuel ? Number(formData.prixActuel) : Number(formData.prixAchat)
      });
      addToast('Investissement ajouté avec succès !');
      onClose();
      setFormData({
        nom: '',
        typeActif: 'actions',
        symbole: '',
        quantite: '',
        prixAchat: '',
        prixActuel: '',
        devise: 'USD',
        dateAchat: new Date().toISOString().split('T')[0],
        note: ''
      });
    } catch (error) {
      addToast('Erreur lors de l\'ajout de l\'investissement.', 'error');
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Nouvel Investissement" animationData={rocketIcon}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Nom de l'actif</label>
            <div className="relative">
              <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <input 
                type="text" 
                required
                placeholder="Ex: Apple, Bitcoin, Appartement Paris..."
                value={formData.nom}
                onChange={(e) => setFormData({...formData, nom: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all" 
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Type d'actif</label>
            <div className="relative">
              <Tag className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <select 
                value={formData.typeActif}
                onChange={(e) => setFormData({...formData, typeActif: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all text-sm appearance-none"
              >
                {TYPES_ACTIFS.map(t => (
                  <option key={t} value={t}>
                    {t.charAt(0).toUpperCase() + t.slice(1).replace('_', ' ')}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Symbole (Optionnel)</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <input 
                type="text" 
                placeholder="Ex: AAPL, BTC"
                value={formData.symbole}
                onChange={(e) => setFormData({...formData, symbole: e.target.value.toUpperCase()})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all font-mono" 
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Quantité</label>
            <div className="relative">
              <Hash className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <input 
                type="number" 
                required
                step="any"
                min="0"
                value={formData.quantite}
                onChange={(e) => setFormData({...formData, quantite: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all font-mono" 
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Prix d'Achat Unitaire ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <input 
                type="number" 
                required
                step="any"
                min="0"
                value={formData.prixAchat}
                onChange={(e) => setFormData({...formData, prixAchat: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all font-mono" 
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Date d'Achat</label>
            <div className="relative">
              <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 text-txt-3" size={16} />
              <input 
                type="date" 
                required
                value={formData.dateAchat}
                onChange={(e) => setFormData({...formData, dateAchat: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all font-mono text-sm" 
              />
            </div>
          </div>

          <div className="col-span-1">
            <label className="block text-[10px] font-bold text-txt-3 uppercase tracking-widest mb-2">Prix Actuel ($)</label>
            <div className="relative">
              <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-win" size={16} />
              <input 
                type="number" 
                step="any"
                min="0"
                placeholder="Même que l'achat si vide"
                value={formData.prixActuel}
                onChange={(e) => setFormData({...formData, prixActuel: e.target.value})}
                className="w-full bg-bg border border-border rounded-xl py-3 pl-12 pr-4 focus:border-accent/50 outline-none transition-all font-mono" 
              />
            </div>
          </div>
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
            className="flex-1 px-6 py-3 rounded-xl border border-border font-bold hover:dark:bg-white/5 bg-black/5 transition-all"
          >
            Annuler
          </button>
          <button 
            type="submit"
            disabled={createInvestment.isPending}
            className="flex-1 bg-accent text-white px-6 py-3 rounded-xl font-bold hover:opacity-90 transition-all disabled:opacity-50"
          >
            {createInvestment.isPending ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
