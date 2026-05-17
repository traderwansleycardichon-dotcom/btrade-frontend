import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { usePayouts } from '../../hooks/usePayouts';
import { useToast } from '../../hooks/useToast';
import { Wallet, DollarSign, Calendar } from 'lucide-react';

interface AddPayoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  accountId: string;
}

export const AddPayoutModal: React.FC<AddPayoutModalProps> = ({ isOpen, onClose, accountId }) => {
  const { createPayout: requestPayout } = usePayouts(accountId);
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    montant: '',
    dateDemande: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await requestPayout.mutateAsync({
        montant: Number(formData.montant),
        dateDemande: formData.dateDemande
      });
      addToast('Demande de retrait enregistrée avec succès !');
      onClose();
      setFormData({
        montant: '',
        dateDemande: new Date().toISOString().split('T')[0],
      });
    } catch (err) {
      addToast('Erreur lors de la demande de retrait', 'error');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Demander un Retrait (Payout)"
      footer={
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost">Annuler</button>
          <button 
            onClick={handleSubmit} 
            className="btn-primary flex items-center gap-2"
            disabled={requestPayout.isPending || !formData.montant}
          >
            <Wallet size={16} />
            {requestPayout.isPending ? 'Traitement...' : 'Enregistrer le Payout'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6 p-1">
        <div className="p-4 bg-win/5 border border-win/20 rounded-2xl flex items-start gap-4">
          <div className="p-2 bg-win/20 rounded-xl text-win mt-1">
            <Wallet size={20} />
          </div>
          <div>
            <h4 className="font-bold text-sm">Félicitations pour vos profits !</h4>
            <p className="text-txt-2 text-xs mt-1">
              Enregistrez ici votre retrait pour qu'il soit déduit de la balance de votre compte et ajouté à votre situation nette globale (lorsqu'il sera confirmé).
            </p>
          </div>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2 flex items-center gap-2">
            <DollarSign size={12} className="text-win" /> Montant Retiré ($)
          </label>
          <input 
            type="number" 
            required
            step="any"
            min="1"
            value={formData.montant}
            onChange={(e) => setFormData({...formData, montant: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all font-mono text-lg" 
            placeholder="ex: 1500.00" 
          />
        </div>
        
        <div>
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Calendar size={12} /> Date de la Demande
          </label>
          <input 
            type="date" 
            required
            value={formData.dateDemande}
            onChange={(e) => setFormData({...formData, dateDemande: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all font-mono"
          />
        </div>
      </form>
    </Modal>
  );
};
