import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import addIcon from '../../assets/animations/2795.json';
import { useAccounts } from '../../hooks/useAccounts';
import { useToast } from '../../hooks/useToast';
import { Wallet, Landmark, Cpu, Target, AlertTriangle } from 'lucide-react';

interface AddAccountModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddAccountModal: React.FC<AddAccountModalProps> = ({ isOpen, onClose }) => {
  const { createAccount } = useAccounts();
  const { addToast } = useToast();
  
  const [formData, setFormData] = useState({
    nom: '',
    typeCompte: 'evaluation',
    tailleCompte: 50000,
    broker: '',
    plateforme: 'MT5',
    // Saisis en $ côté UI, convertis en % avant envoi au backend
    profitTargetAmount: 5000,
    maxDrawdownAmount: 5000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const size = Number(formData.tailleCompte);
    // $ → % pour le backend (qui stocke en pourcentage)
    const profitTargetPct =
      size > 0 ? (Number(formData.profitTargetAmount) / size) * 100 : 0;
    const maxDrawdownPct =
      size > 0 ? (Number(formData.maxDrawdownAmount) / size) * 100 : 0;
    try {
      await createAccount.mutateAsync({
        ...formData,
        propFirm: formData.broker,
        tailleCompte: size,
        profitTargetPct,
        maxDrawdownPct,
      });
      addToast('Compte de trading ajouté avec succès !');
      onClose();
    } catch (err) {
      addToast('Erreur lors de la création du compte', 'error');
    }
  };

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      title="Ajouter un compte de trading"
      animationData={addIcon}
      footer={
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-ghost">Annuler</button>
          <button 
            onClick={handleSubmit} 
            className="btn-primary"
            disabled={createAccount.isPending}
          >
            {createAccount.isPending ? 'Création...' : 'Créer le compte'}
          </button>
        </div>
      }
    >
      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-6 p-1">
        <div className="col-span-2">
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Wallet size={12} /> Nom du Compte
          </label>
          <input 
            type="text" 
            required
            value={formData.nom}
            onChange={(e) => setFormData({...formData, nom: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all" 
            placeholder="ex: Topstep 50k - Main" 
          />
        </div>
        
        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2">Type</label>
          <select 
            value={formData.typeCompte}
            onChange={(e) => setFormData({...formData, typeCompte: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all"
          >
            <option value="evaluation">Évaluation (Prop Firm) — pas de retraits</option>
            <option value="funded">Funded (Prop Firm) — retraits possibles</option>
            <option value="personnel">Compte Réel / Live — retraits possibles</option>
          </select>
        </div>

        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2">Taille ($)</label>
          <input 
            type="number" 
            required
            value={formData.tailleCompte}
            onChange={(e) => setFormData({...formData, tailleCompte: Number(e.target.value)})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all font-mono" 
          />
        </div>

        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Landmark size={12} /> Broker
          </label>
          <input 
            type="text" 
            value={formData.broker}
            onChange={(e) => setFormData({...formData, broker: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all" 
            placeholder="ex: MyFundedFX" 
          />
        </div>

        <div className="col-span-1">
          <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Cpu size={12} /> Plateforme
          </label>
          <select 
            value={formData.plateforme}
            onChange={(e) => setFormData({...formData, plateforme: e.target.value})}
            className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all"
          >
            <option value="MT4">MetaTrader 4</option>
            <option value="MT5">MetaTrader 5</option>
            <option value="CTrader">cTrader</option>
            <option value="Tradovate">Tradovate</option>
            <option value="Other">Autre</option>
          </select>
        </div>

        {formData.typeCompte === 'evaluation' && (
          <div className="col-span-2 grid grid-cols-2 gap-4 pt-4 border-t border-border mt-2">
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2 flex items-center gap-2">
                <Target size={12} className="text-win" /> Objectif Profit ($)
              </label>
              <input
                type="number"
                value={formData.profitTargetAmount}
                onChange={(e) => setFormData({...formData, profitTargetAmount: Number(e.target.value)})}
                className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all font-mono"
              />
              {formData.tailleCompte > 0 && formData.profitTargetAmount > 0 && (
                <p className="mt-1 text-[10px] text-txt-3">
                  ≈ {((formData.profitTargetAmount / formData.tailleCompte) * 100).toFixed(2)}% du capital
                </p>
              )}
            </div>
            <div className="col-span-1">
              <label className="block text-[10px] font-bold text-txt-2 uppercase tracking-widest mb-2 flex items-center gap-2">
                <AlertTriangle size={12} className="text-loss" /> Max Drawdown ($)
              </label>
              <input
                type="number"
                value={formData.maxDrawdownAmount}
                onChange={(e) => setFormData({...formData, maxDrawdownAmount: Number(e.target.value)})}
                className="w-full bg-bg border border-border rounded-xl py-3 px-4 focus:border-accent/50 outline-none transition-all font-mono"
              />
              {formData.tailleCompte > 0 && formData.maxDrawdownAmount > 0 && (
                <p className="mt-1 text-[10px] text-txt-3">
                  ≈ {((formData.maxDrawdownAmount / formData.tailleCompte) * 100).toFixed(2)}% du capital
                </p>
              )}
            </div>
          </div>
        )}
      </form>
    </Modal>
  );
};
