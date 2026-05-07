import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { useTrades } from '../../hooks/useTrades';
import { useToast } from '../../hooks/useToast';

interface AddTradeModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
}

export const AddTradeModal: React.FC<AddTradeModalProps> = ({ isOpen, onClose, accountId }) => {
  const { createTrade } = useTrades(accountId);
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    instrument: 'EURUSD',
    direction: 'buy',
    quantite: 1.0,
    prix_entree: '',
    prix_sortie: '',
    pl_brut: '',
    commission: '',
    setup: '',
    resultat: 'win',
    note: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createTrade.mutateAsync(formData);
      addToast('Trade ajouté avec succès !');
      onClose();
    } catch (err) {
      addToast('Erreur lors de l\'ajout du trade', 'error');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Enregistrer un nouveau trade"
      footer={
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost">Annuler</button>
          <button onClick={handleSubmit} className="btn-primary">Enregistrer le trade</button>
        </div>
      }
    >
      <form className="grid grid-cols-2 gap-6">
        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2">Symbole</label>
          <input 
            type="text" 
            value={formData.instrument}
            onChange={(e) => setFormData({...formData, instrument: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all" 
            placeholder="ex: XAUUSD" 
          />
        </div>
        
        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2">Direction</label>
          <select 
            value={formData.direction}
            onChange={(e) => setFormData({...formData, direction: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all"
          >
            <option value="buy">BUY / LONG</option>
            <option value="sell">SELL / SHORT</option>
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2">Quantité (Lots)</label>
          <input 
            type="number" 
            step="0.01"
            value={formData.quantite}
            onChange={(e) => setFormData({...formData, quantite: parseFloat(e.target.value)})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all" 
          />
        </div>

        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2">Setup</label>
          <input 
            type="text" 
            value={formData.setup}
            onChange={(e) => setFormData({...formData, setup: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all" 
            placeholder="ex: Breakout" 
          />
        </div>

        <div className="col-span-1 border-t border-border pt-4">
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2">P&L Brut ($)</label>
          <input 
            type="number" 
            value={formData.pl_brut}
            onChange={(e) => setFormData({...formData, pl_brut: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all font-mono" 
          />
        </div>

        <div className="col-span-1 border-t border-border pt-4">
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2">Résultat</label>
          <select 
            value={formData.resultat}
            onChange={(e) => setFormData({...formData, resultat: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all"
          >
            <option value="win">WIN</option>
            <option value="loss">LOSS</option>
            <option value="be">BREAKEVEN</option>
          </select>
        </div>

        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2">Notes & Observations</label>
          <textarea 
            rows={3}
            value={formData.note}
            onChange={(e) => setFormData({...formData, note: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all"
            placeholder="Détails sur l'entrée, psychologie..."
          ></textarea>
        </div>
      </form>
    </Modal>
  );
};
